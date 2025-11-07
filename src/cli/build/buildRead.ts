import { parse } from 'tsconfck'
import path, { join, resolve } from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { BuildRoute, Build, type Writes, type ApiMethods } from './build.js'


export async function buildRead(build: Build) {
  const [fsEnv, fsVanillaTypes] = await Promise.all([
    readFile(join(build.dirDistBuildJs, '../../../fundamentals/env.txt'), 'utf-8'),
    readFile(join(build.dirDistBuildJs, '../../../fundamentals/vanilla.d.txt'), 'utf-8'),
  ])

  build.fsEnv = fsEnv
  build.fsVanillaTypes = fsVanillaTypes

  if (build.config.plugins.solid) {
    if (!build.config.apiDir || typeof build.config.apiDir !== 'string') throw new Error('❌ When using the solid plugin, `config.apiDir` must be a truthy string')
    if (!build.config.appDir || typeof build.config.appDir !== 'string') throw new Error('❌ When using the solid plugin, `config.appDir` must be a truthy string')

    await setTsconfigPaths(build)

    const [fsSolidTypes, fsApp] = await Promise.all([
      readFile(join(build.dirDistBuildJs, '../../../fundamentals/types.d.txt'), 'utf-8'),
      readFile(join(build.dirDistBuildJs, '../../../fundamentals/createApp.txt'), 'utf-8'),
      readAPIDirectory(resolve(build.cwd, build.config.apiDir), build),
      readAppDirectory(resolve(build.cwd, build.config.appDir), build),
    ])

    build.fsApp = fsApp
    build.fsSolidTypes = fsSolidTypes
  }
}


async function setTsconfigPaths(build: Build) {
  const {tsconfig} = await parse(join(build.cwd, build.config.tsConfigPath ?? 'tsconfig.json'))

  build.tsConfigPaths = (Object.entries(tsconfig?.compilerOptions?.paths || {}) as [string, string[]][]).map(([aliasPattern, targets]) => {
    let regex: RegExp
    const hasWildcard = aliasPattern.includes('*')

    if (!hasWildcard) regex = new RegExp(`^${aliasPattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}$`)
    else {
      const placeholder = '__WILDCARD__'
      let pattern = aliasPattern.replace(/\*/g, placeholder) // replace * temporarily with the placeholder __WILDCARD__
      pattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') // escape all the other regex special characters
      pattern = pattern.replace(new RegExp(placeholder, 'g'), '(.*)') // put the wildcard back — replacing __WILDCARD__ with the regex capture group (.*)
      regex = new RegExp(`^${pattern}$`) // turn pattern into a regex
    }

    return { regex, targets }
  })
}


async function readAPIDirectory(dir: string, build: Build) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fsPath = join(dir, entry.name)

    if (entry.isDirectory()) await readAPIDirectory(fsPath, build)
    else if (entry.isFile() && fsPath.endsWith('.ts')) await setAPIWrites(fsPath, build)
  }
}


async function setAPIWrites(fsPath: string, build: Build): Promise<void> {
  const content = removeComments(await readFile(fsPath, 'utf-8'))

  /**
   * - Captures:
   *     - [1] → method
   *     - [3] → path
   *     - [5] → optional function name
   */
  const regex = /export\s+const\s+(GET|POST|PUT|DELETE)\s*=\s*new\s+API\(\s*(['"])(.+?)\2(?:\s*,\s*(['"])([A-Za-z_]\w*)\4)?\s*\)/g

  for (const matches of content.matchAll(regex)) {
    const apiMethod = matches[1]
    const apiPath = matches[3]
    const fnName = matches[5]  

    if (apiPath && fnName && Build.apiMethods.has(apiMethod)) {
      build.writes[getWriteKey(apiMethod)] += build.getConstEntry({
        fnName,
        fsPath,
        pathIsKey: true,
        urlPath: apiPath,
        moduleName: apiMethod
      })

      build.writes.constApiName += build.getConstEntry({
        fnName,
        fsPath,
        pathIsKey: false,
        urlPath: apiPath,
        moduleName: apiMethod
      })

      build.writes.apiFunctions += `export const ${fnName} = createApiFn('${fnName}')\n`
    
      build.writes.apiLoaders += `export async function ${fnName}Loader() {
  'use server'
  return (await import(${build.fsPath2Relative(fsPath)})).${apiMethod}
}\n\n`
    }
  }
}


function getWriteKey(method: ApiMethods): keyof Writes {
  return `const${method}` as keyof Writes
}


async function readAppDirectory(dir: string, build: Build): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fsPath = join(dir, entry.name)

    if (entry.isDirectory()) await readAppDirectory(fsPath, build)
    else if (entry.isFile() && fsPath.endsWith('.tsx')) {
      const src = removeComments(await readFile(fsPath,'utf-8'))
      let { routePath, fsLayouts } = doRouteRegex(dir, src, build) // check to see if new Route() is present

      if (!routePath && !build.found404) { // no new Route() AND no 404 route found yet => check to see if new Route404()
        const res404 = doRoute404Regex(dir, src, build)

        if (res404.routePath) {
          build.found404 = true
          routePath = res404.routePath
          fsLayouts = res404.fsLayouts
        }
      }
  
      if (!routePath) continue // this tsx file has no propertly formatted export default new Route or new Route404
  
      build.writes.constRoutes += build.getConstEntry({
        pathIsKey: true,
        urlPath: routePath,
        fsPath,
        moduleName: 'default'
      })

      const route: BuildRoute = { fsPath, routePath }

      let node = build.tree

      if (fsLayouts.length === 0) node.routes.push(route) // if no layouts, it lives under root
      else {
        for (const fsLayoutPath of fsLayouts) {
          if (!node.layouts.has(fsLayoutPath)) { // create that child node if it doesn't exist
            node.layouts.set(fsLayoutPath, { root: false, fsPath: fsLayoutPath, routes: [], layouts: new Map() })
          }

          node = node.layouts.get(fsLayoutPath)! // descend into it
        }

        node.routes.push(route) // finally attach our route at this nested level
      }
    }
  }
}



function removeComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')
}


type RouteResult = {
  routePath: string,
  fsLayouts: string[],
}


/** Build a map of imported identifiers to their source paths */
function getImportsMap(content: string): Map<string, string> {
  const importsMap = new Map<string, string>()
  const regex = /^import\s+(.+?)\s+from\s+(['"`])(.+?)\2/gm // capture everything between `import` and `from` AND capture path

  for (const match of content.matchAll(regex)) {
    const [, clause = '', , importPath = ''] = match
    const parts = clause.split(',').map(s => s.trim()) // split on commas
    const defaultName = parts.find(part => !(part.startsWith('{') && part.endsWith('}'))) // find the first part that is not a named-import b/c not wrapped in { }

    if (defaultName) importsMap.set(defaultName, importPath)
  }

  return importsMap
}


/** Extract filesystem layout paths from a `.layouts([A, B])` call */
function extractLayouts(dir: string, content: string, build: Build): string[] {
  const fsLayouts: string[] = []
  const regexLayouts = /\.layouts\(\s*\[\s*([^\]]+?)\s*\]\s*\)/
  const matchLayouts = regexLayouts.exec(content)

  if (!matchLayouts || !matchLayouts[1]) return fsLayouts

  const importsMap = getImportsMap(content)
  const layoutNames = matchLayouts[1]
    .split(/\s*,\s*/)
    .filter(name => name.length > 0)

    for (const name of layoutNames) {
      const importFrom = importsMap.get(name)
      if (!importFrom) continue

      const resolvedPath = resolveImport(importFrom, dir, build)
      if (!resolvedPath) continue

      fsLayouts.push(resolvedPath)
  }

  return fsLayouts
}


/**
 * Resolve an import specifier against tsconfig paths or as a relative path.
 */
function resolveImport(
  importFrom: string,
  dir: string,
  build: Build
): string | null {
  if (!build.tsConfigPaths) return null

  // 1. Try tsconfig path aliases
  for (const { regex, targets } of build.tsConfigPaths) {
    const match = regex.exec(importFrom)

    if (match && match[1] != null) {
      for (const target of targets) {
        const substituted = target.replace('*', match[1])
        return path.resolve(build.cwd, substituted)
      }
    }
  }

  // 2. Fallback to relative/absolute resolution
  return path.resolve(dir, importFrom)
}



/** Extract the route path string from the tail after `new Route(` */
function extractRoutePath(tail: string): string | undefined {
  const regexPath = /^\s*(['"`])([^'"`]+)\1/
  const match = regexPath.exec(tail)
  return match && match[2] ? match[2] : undefined
}


/** Parses a file for `export default new Route(path)` */
export function doRouteRegex(dir: string, content: string, build: Build): RouteResult {
  const res: RouteResult = { routePath: '', fsLayouts: [] }

  const regexExportDefault = /export\s+default\s+new\s+Route\s*\(\s*/m
  const match = regexExportDefault.exec(content)
  if (!match) return res

  const tail = content.slice(match.index + match[0].length)
  const pathStr = extractRoutePath(tail)
  if (pathStr) res.routePath = pathStr

  res.fsLayouts = extractLayouts(dir, content, build)
  return res
}


/** Parses a file for `export default new Route404()` */
export function doRoute404Regex(dir: string, content: string, build: Build): RouteResult {
  const res: RouteResult = { routePath: '', fsLayouts: [] }

  const regex404 = /export\s+default\s+new\s+Route404\s*\(\s*\)/m
  if (!regex404.test(content)) return res

  res.routePath = '*'
  res.fsLayouts = extractLayouts(dir, content, build)
  return res
}
