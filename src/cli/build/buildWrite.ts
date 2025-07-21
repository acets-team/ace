import { join, resolve } from 'node:path'
import { fundamentals } from '../../fundamentals.js'
import { mkdir, copyFile, writeFile } from 'node:fs/promises'
import { getConstEntry, getSrcImportEnry, type Build, type TreeAccumulator, type TreeNode, type BuildRoute } from './build.js'



export async function buildWrite(build: Build) {
  await mkdir(build.dirWriteFundamentals, { recursive: true })
  await Promise.all(getPromises(build))
}



function getPromises(build: Build) {
  const promises: Promise<any>[] = []

  fundamentals.forEach((f, name) => {
    switch(f.type) {
      case 'copy':
        if (build.whiteList.set.has(name)) {
          promises.push(fsCopy({ build, dirWrite: build.dirWriteFundamentals, srcFileName: `${name}.txt`, aimFileName: `${name}.${f.ext}` }))
        }
        break
      case 'helper':
        if (build.whiteList.set.has(name)) {
          promises.push(fsCopy({ build, dirWrite: build.dirWriteRoot, srcFileName: `${name}.txt`, aimFileName: `${name}.${f.ext}` }))
        }
        break
    }
  })

  if (build.config.plugins.solid) {
    promises.push(
      fsWrite({ build, dir: build.dirWriteFundamentals, content: build.fsSolidTypes || '', fileName: 'types.d.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderEnv(build), fileName: 'env.ts' }),
      fsWrite({ build, dir: build.dirWriteRoot, content: renderApisBE(build), fileName: 'apis.be.ts' }),
      fsWrite({ build, dir: build.dirWriteRoot, content: renderApisFE(build), fileName: 'apis.fe.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderCreateApp(build), fileName: 'createApp.tsx' }),
    )
  }

  return promises
}



async function fsWrite({ dir, content, fileName, build }: { dir: string, content: string, fileName: string, build: Build }) {
  await writeFile(resolve(join(dir, fileName)), content, 'utf8')
  if (build.commandOptions.has('--verbose')) console.log('✅ Wrote: ' + join(dir, fileName))
}



async function fsCopy({ dirWrite, srcFileName, aimFileName, build }: { dirWrite: string, srcFileName: string, aimFileName: string, build: Build }){
  await copyFile(join(build.dirRead, '../../../' + srcFileName), join(dirWrite, aimFileName))
  if (build.commandOptions.has('--verbose')) console.log('✅ Wrote: ' + join(dirWrite, aimFileName))
}



function renderEnv(build: Build) {
  return `/**
* 🧚‍♀️ How to access:
*     - import { env } from '@ace/env'
*/

export const env: string = '${build.env}'
`
}



function renderApisBE(build: Build) {
  return `import { createAPIFunction } from './createAPIFunction' 

${build.writes.importsAPIBE}${build.space}
export const gets = {
${build.writes.constGET.slice(0,-1)}
}
${build.space}
export const posts = {
${build.writes.constPOST.slice(0,-1)}
}

export const apiNames = {
${build.writes.apiNames.slice(0, -1)}
}

${build.writes.apiFunctionsBE}
`
}




function renderApisFE(build: Build) {
  return `import { fe } from './fundamentals/fe'
import type { API2FEFunction } from './fundamentals/types' 

${build.writes.importsAPIFE}

export const gets = {} as const
export const posts = {} as const

${build.writes.apiFunctionsFE}`
}


function renderCreateApp(build: Build) {
  let imports = ''
  let { routes, importsMap, consts } = walkTree(build.tree)

  importsMap.forEach((moduleName, fsPath) => {
    imports += getSrcImportEnry({moduleName, fsPath})
  })

  const gen1 = '/** gen1 */'
  const gen2 = '/** gen2 */'

  if (!build.fsApp) throw new Error('!build.fsApp')
 
  const startGen1 = build.fsApp.indexOf(gen1)
  const endGen2 = build.fsApp.indexOf(gen2) + gen2.length

  const beforeGen1 = build.fsApp.slice(0, startGen1)
  const afterGen2 = build.fsApp.slice(endGen2)

  const dynamicBlock = `${imports}\n\nexport const routes = {\n${consts.slice(0, -2)}\n}\n`

  let replaced = beforeGen1 + dynamicBlock + afterGen2

  const gen3 = '{/* gen3 */}'
  const jsxRoutes = routes.trimEnd()
  replaced = replaced.replace(gen3, jsxRoutes)

  return replaced
}



/**
 * - Walk the entire tree, once, building the accumulator
 * - Accumulator: Mutable object that we pass along in a recursive function to collect or `accumulate` results as we go
 *   - `importsMap`: Map<fsPath, moduleName>
 *   - `consts`:    string[] of getConstEntry(...) lines
 */
function walkTree(node: TreeNode, indent = 8, accumulator: TreeAccumulator = { importsMap: new Map(), consts: '', routes: '' }) {
  if (node.fsPath) accumulator.importsMap.set(node.fsPath, node.moduleName) // layout import

  if (node.moduleName !== 'root') { // open <Route>, for layout, unless virtual root
    accumulator.routes += (' '.repeat(indent) + `<Route component={${renderLayoutComponent(node.moduleName)}}>\n`)
    indent += 2
  }

  for (const r of node.routes) { // for each route in this layout
    accumulator.importsMap.set(r.fsPath, r.moduleName) // set route import
    if (r.routePath !== '*') accumulator.consts += getConstEntry(r.routePath, r.moduleName) // if 404 is in consts then it'd be routes & then it'd be in <A />
    accumulator.routes += (' '.repeat(indent) + `<Route path="${r.routePath}" component={${renderRouteComponent(r.moduleName)}} />\n`) // set routes entry
  }

  for (const child of node.layouts.values()) { // recurse into each child layout
    walkTree(child, indent, accumulator)
  }

  if (node.moduleName !== 'root') { // if not root => close wrapper 
    indent -= 2
    accumulator.routes += (' '.repeat(indent) + `</Route>\n`)
  }

  return accumulator
}


const renderLayoutComponent = (moduleName?: string) => `props => layoutComponent(props, ${moduleName})`

const renderRouteComponent = (moduleName?: string) => `() => routeComponent(${moduleName})`
