import { join, resolve } from 'node:path'
import { fundamentals } from '../../fundamentals.js'
import { Build, type CreateAppTreeNode } from './build.js'
import { mkdir, copyFile, writeFile } from 'node:fs/promises'
import { treeCreate } from '../../treeCreate.js'



export async function buildWrite(build: Build) {
  if (build.config.plugins.hljs) await mkdir(join(build.dirWriteFundamentals, '/hljs'), { recursive: true })
  else await mkdir(build.dirWriteFundamentals, { recursive: true })

  await Promise.all(getPromises(build))
}



function getPromises(build: Build) {
  const promises: Promise<any>[] = []

  for (const [name, f] of fundamentals) {
    if (!build.whiteList.set.has(name)) continue

    switch (f.type) {
      case 'copy':
        promises.push(fsCopy({ build, dirWrite: build.dirWriteFundamentals, srcFileName: `fundamentals/${name}.txt`, aimFileName: `${name}.${f.ext}` }))
        break
      case 'helper':
        promises.push(fsCopy({ build, dirWrite: build.dirWriteRoot, srcFileName: `${name}.txt`, aimFileName: `${name}.${f.ext}` }))
        break
    }
  }

  if (build.fsParseMarkdownFolders) {
    promises.push(
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderParseMarkdownFolders(build), fileName: 'parseMarkdownFolders.ts' }),
    )
  }

  if (build.config.plugins.solid) {
    promises.push(
      fsWrite({ build, dir: build.dirWriteFundamentals, content: build.fsSolidTypes || '', fileName: 'types.d.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderCreateApp(build), fileName: 'createApp.tsx' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderTreeRoutes(build), fileName: 'treeRoutes.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderTreeGets(build), fileName: 'treeGET.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderTreePosts(build), fileName: 'treePOST.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderTreePuts(build), fileName: 'treePUT.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderTreeDeletes(build), fileName: 'treeDELETE.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderMapApis(build), fileName: 'mapApis.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderMapRoutes(build), fileName: 'mapRoutes.ts' }),
    )
  }

  promises.push(
    fsWrite({ build, dir: build.dirWriteFundamentals, content: renderEnv(build), fileName: 'env.ts' }),
    fsWrite({ build, dir: build.dirWriteFundamentals, content: build.fsVanillaTypes || '', fileName: 'vanilla.d.ts' }),
  )

  return promises
}



async function fsWrite({ dir, content, fileName, build }: { dir: string, content: string, fileName: string, build: Build }) {
  await writeFile(resolve(join(dir, fileName)), content, 'utf8')
  if (build.commandOptions.has('--verbose')) console.log('✅ Wrote: ' + join(dir, fileName))
}



async function fsCopy({ dirWrite, srcFileName, aimFileName, build }: { dirWrite: string, srcFileName: string, aimFileName: string, build: Build }){
  await copyFile(join(build.dirDistBuildJs, '../../../' + srcFileName), join(dirWrite, aimFileName))
  if (build.commandOptions.has('--verbose')) console.log('✅ Wrote: ' + join(dirWrite, aimFileName))
}



function renderEnv(build: Build) {
  if (!build.fsEnv) throw new Error('!build.fsEnv')

  return build.fsEnv.replace('{/* gen */}', build.env)
}



function renderMapRoutes(build: Build) {
  return `import { buildUrl } from './buildUrl'
import type { MapBuildUrlProps } from './types'


export const mapRoutes = {
${build.writes.mapRoutes ? build.writes.mapRoutes.slice(0, -1) : ''}
} as const\n`
}



function renderTreeRoutes(build: Build) {
  return `export const treeRoutes = ${JSON.stringify(treeCreate(build.routes), null, 2)}\n`
}



function renderTreeGets(build: Build) {
  return `export const treeGET = ${JSON.stringify(treeCreate(build.apis.GET), null, 2)}\n`
}



function renderTreePosts(build: Build) {
  return `export const treePOST = ${JSON.stringify(treeCreate(build.apis.POST), null, 2)}\n`
}



function renderTreePuts(build: Build) {
  return `export const treePUT = ${JSON.stringify(treeCreate(build.apis.PUT), null, 2)}\n`
}



function renderTreeDeletes(build: Build) {
  return `export const treeDELETE = ${JSON.stringify(treeCreate(build.apis.DELETE), null, 2)}\n`
}



function renderMapApis(build: Build) {
  return `import { buildUrl } from './buildUrl'
import type { MapBuildUrlProps } from './types'


export const mapApis = {
${build.writes.mapApis ? build.writes.mapApis.slice(0, -1) : ''}
} as const\n`
}


function renderCreateApp(build: Build) {
  if (!build.fsApp) throw new Error('!build.fsApp')

  return build.fsApp.replace('{/* gen */}', walkTree(build, build.tree).trimEnd())
}


function renderParseMarkdownFolders(build: Build) {
  if (!build.fsParseMarkdownFolders || !build.config.mdFolders?.length) return ''

  let map = ''

  let imports = ''
  
  for (const folderInfo of build.config.mdFolders) {
    map += `${folderInfo.id}, `
    imports += `const ${folderInfo.id} = import.meta.glob('${ build.fsPath2Relative(join(build.cwd, folderInfo.path)).slice(1, -1) }/*.md', { query: '?raw', import: 'default', eager: true })\n\n`
  }

  const marker = /\/\/\s*gen/

  const regex = new RegExp(`(\\s*${marker.source}\\s*)[\\s\\S]*?(\\s*${marker.source}\\s*)`, 'g')

  const replaceStr = `${imports}\nconst map = { ${map.slice(0, -2)} } as const\n\n`

  return build.fsParseMarkdownFolders.replace(regex, `\n\n\n${replaceStr}\n`)
}



/**
 * Walk the entire tree, once, building the accumulator (routes string)
 * @param build - Build helper
 * @param node - The current route we're printing
 * @param indent - Where the indent starts
 * @param accumulator - Routes string
 */
function walkTree(build: Build, node: CreateAppTreeNode, indent = 8, accumulator = {routes: ''}) {
  if (!node.root && node.fsPath) { // open <Route>, for layout, unless virtual root
    accumulator.routes += (' '.repeat(indent) + `<Route component={props => lazyLayout(props, () => import(${build.fsPath2Relative(node.fsPath)}))}>\n`)
    indent += 2
  }

  for (const r of node.routes) { // TreeNode for each route in this layout
    accumulator.routes += (' '.repeat(indent) + `<Route path="${r.routePath}" component={lazyRoute(() => import(${build.fsPath2Relative(r.fsPath)}))} />\n`) // set routes entry
  }

  for (const child of node.layouts.values()) { // recurse into each child layout
    walkTree(build, child, indent, accumulator)
  }

  if (!node.root) { // if not root => close wrapper 
    indent -= 2
    accumulator.routes += (' '.repeat(indent) + `</Route>\n`)
  }

  return accumulator.routes
}
