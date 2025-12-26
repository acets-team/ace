import { parse } from 'tsconfck'
import { LayoutsMapRoute, Build } from './build.js'
import path, { sep, join, resolve } from 'node:path'
import { readdir, readFile } from 'node:fs/promises'
import { pathname2Segments } from '../../pathname2Segments.js'


export async function buildRead(build: Build) {
  const [fsEnv, fsVanillaTypes] = await Promise.all([
    readFile(join(build.dirDistBuildJs, '../../../fundamentals/env.txt'), 'utf-8'),
    readFile(join(build.dirDistBuildJs, '../../../fundamentals/vanilla.d.txt'), 'utf-8'),
  ])

  build.fsEnv = fsEnv
  build.fsVanillaTypes = fsVanillaTypes

  if (build.config.plugins.markdownIt && build.config.mdFolders) {
    build.fsParseMarkdownFolders = await readFile(join(build.dirDistBuildJs, '../../../fundamentals/parseMarkdownFolders.txt'), 'utf-8')
  }

  if (build.config.plugins.solid) {
    if (!build.config.apiDir || typeof build.config.apiDir !== 'string') throw new Error('❌ When using the solid plugin, `config.apiDir` must be a truthy string')
    if (!build.config.appDir || typeof build.config.appDir !== 'string') throw new Error('❌ When using the solid plugin, `config.appDir` must be a truthy string')

    await setTsconfigPaths(build)

    const [fsSolidTypes, fsApi, fsBaseApp] = await Promise.all([
      readFile(join(build.dirDistBuildJs, '../../../fundamentals/types.d.txt'), 'utf-8'),
      readFile(join(build.dirDistBuildJs, '../../../[...api].txt'), 'utf-8'),
      readFile(join(build.dirDistBuildJs, '../../../baseApp.txt'), 'utf-8'),
      readApiDirectory(resolve(build.cwd, build.config.apiDir), build),
      readAppDirectory(resolve(build.cwd, build.config.appDir), build),
    ])

    build.fsApi = fsApi
    build.fsBaseApp = fsBaseApp
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


async function readApiDirectory(dir: string, build: Build) {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fsPath = join(dir, entry.name)

    if (entry.isDirectory()) await readApiDirectory(fsPath, build)
    else if (entry.isFile() && fsPath.endsWith('.ts')) await readApiFile(fsPath, build)
  }
}


async function readApiFile(fsPath: string, build: Build): Promise<void> {
  const content = removeComments(await readFile(fsPath, 'utf-8'))

  const createApiRegex = /export\s+default\s+createApi\s*\(\s*(?:(['"`])([^'"`]+)\1|([A-Za-z0-9_$\.]+))\s*,\s*([A-Za-z0-9_$\.]+)\s*,\s*([A-Za-z0-9_$\.]+)\s*\)/

  const createApiMatch = createApiRegex.exec(content)
  if (!createApiMatch) return

  const key = createApiMatch[2] || createApiMatch[3]
  const infoName = createApiMatch[4]
  const resolverName = createApiMatch[5]
  if (!key || !infoName || !resolverName) return

  const infoRegex = new RegExp(
    String.raw`export\s+const\s+` +
    infoName +
    String.raw`\s*=\s*new\s+ApiInfo\s*\(\s*\{\s*([^]*?)\}\s*\)`,
    "m"
  )

  const infoContent = infoRegex.exec(content)?.[1]
  if (!infoContent) return

  const methodRegex = /method\s*:\s*(['"`])([^'"`]+)\1/
  const method = methodRegex.exec(infoContent)?.[2]
  if (!Build.apiMethods.has(method)) return

  const pathnameRegex = /path\s*:\s*(['"`])([^'"`]+)\1/;
  const pathname = pathnameRegex.exec(infoContent)?.[2]
  if (!pathname) return

  const segments = pathname2Segments(pathname)

  const importPath = build.fsPath2Relative(fsPath)

  build.writes.mapApis += `  '${key}': {
    api: () => import(${importPath}).then((m) => m.default),
    info: () => import(${importPath}).then((m) => m.${infoName}),
    resolver: () => import(${importPath}).then((m) => m.${resolverName}),
    buildUrl: (props?: MapBuildUrlProps) => buildUrl({ ...props, segments: ${JSON.stringify(segments)} }),
  },
`

  build.apis[method].push({
    key,
    fsPath,
    infoName,
    pathname,
    segments,
    resolverName,
  })
}


async function readAppDirectory(dir: string, build: Build): Promise<void> {
  const entries = await readdir(dir, { withFileTypes: true })

  for (const entry of entries) {
    const fsPath = join(dir, entry.name)

    if (entry.isDirectory()) await readAppDirectory(fsPath, build)
    else if (entry.isFile() && fsPath.endsWith('.tsx')) {
      const src = removeComments(await readFile(fsPath,'utf-8'))
      let { routePath, fsLayout } = doRouteRegex(dir, src, build) // check to see if new Route() is present

      if (!routePath && !build.found404) { // no new Route() AND no 404 route found yet => check to see if new Route404()
        const res404 = doRoute404Regex(dir, src, build)

        if (res404.routePath) {
          build.found404 = true
          routePath = res404.routePath
          fsLayout = res404.fsLayout
        }
      }

      if (!routePath && src.includes('export default new RootLayout')) {
        build.rootLayoutFsPath = fsPath
      }
  
      if (!routePath) continue // this tsx file has no propertly formatted export default new Route or new Route404
  
      const segments = pathname2Segments(routePath)

      build.routes.push({
        fsPath,
        segments,
        key: routePath,
        pathname: routePath,
      })

      build.writes.mapRoutes += `  '${routePath}': {
    route: () => import(${build.fsPath2Relative(fsPath)}).then((m) => m.default),
    buildUrl: (props?: MapBuildUrlProps) => buildUrl({ ...props, segments: ${JSON.stringify(segments)} }),
  },
`

      const route: LayoutsMapRoute = { fsPath, routePath }

      if (!fsLayout) build.layoutsMap.Root?.routes.push(route)
      else {
        const split = fsLayout.split(sep)
        if (!split) continue

        const fsLayoutName = split[split.length - 1]
        if (!fsLayoutName) continue

        if (build.layoutsMap[fsLayoutName]) build.layoutsMap[fsLayoutName].routes.push(route)
        else build.layoutsMap[fsLayoutName] = { fsPath: fsLayout, routes: [route]}
      }
    }
  }
}



function removeComments(code: string): string {
  return code.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*/g, '')
}


type RouteResult = {
  routePath: string,
  fsLayout: null | string,
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


/** Extract filesystem layout path from a `.layout(A)` call */
function extractLayout(dir: string, content: string, build: Build): null | string {
  const regexLayout = /\.layout\(\s*([^)]+?)\s*\)/
  const matchLayout = regexLayout.exec(content)

  if (!matchLayout || !matchLayout[1]) return null

  const importsMap = getImportsMap(content)
  const name = matchLayout[1].trim()

  const importFrom = importsMap.get(name)
  if (!importFrom) return null

  const resolvedPath = resolveImport(importFrom, dir, build)
  if (!resolvedPath) return null

  return resolvedPath
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
  const res: RouteResult = { routePath: '', fsLayout: null }

  const regexExportDefault = /export\s+default\s+new\s+Route\s*\(\s*/m
  const match = regexExportDefault.exec(content)
  if (!match) return res

  const tail = content.slice(match.index + match[0].length)
  const pathStr = extractRoutePath(tail)
  if (pathStr) res.routePath = pathStr

  res.fsLayout = extractLayout(dir, content, build)
  return res
}


/** Parses a file for `export default new Route404()` */
export function doRoute404Regex(dir: string, content: string, build: Build): RouteResult {
  const res: RouteResult = { routePath: '', fsLayout: null }

  const regex404 = /export\s+default\s+new\s+Route404\s*\(\s*\)/m
  if (!regex404.test(content)) return res

  res.routePath = '*'
  res.fsLayout = extractLayout(dir, content, build)
  return res
}
