import { join, resolve } from 'node:path'
import { fundamentals } from '../../fundamentals.js'
import { mkdir, copyFile, writeFile } from 'node:fs/promises'
import { getImportFsPath, type Build, type TreeNode} from './build.js'



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
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderApis(build), fileName: 'apis.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderCreateApp(build), fileName: 'createApp.tsx' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderRegexRoute(build), fileName: 'regexRoutes.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderRegexApiGets(build), fileName: 'regexApiGets.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderRegexApiPosts(build), fileName: 'regexApiPosts.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderRegexApiPuts(build), fileName: 'regexApiPuts.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderRegexApiDeletes(build), fileName: 'regexApiDeletes.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderRegexApiNames(build), fileName: 'regexApiNames.ts' }),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderApiLoaders(build), fileName: 'apiLoaders.ts' }),
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
  const renderSet = typeof build.config.origins[build.env] === 'string'
    ? 'new Set([config.origins[env]])'
    : 'new Set(config.origins[env])'

  return `/**
* 🧚‍♀️ How to access:
*     - import { env, origins } from '@ace/env'
*/

import { config } from 'ace.config'

export const env: string = '${build.env}'

export const origins: Set<string> = ${renderSet}
`
}



function renderApis(build: Build) {
  return `import * as apiLoaders from './apiLoaders'
import { createAPIFunction } from '../createAPIFunction' 

${build.writes.apiFunctions}`
}



function renderRegexRoute(build: Build) {
  return `export const regexRoutes = {
${build.writes.constRoutes ? build.writes.constRoutes.slice(0, -1) : ''}
} as const\n`
}



function renderRegexApiGets(build: Build) {
  return `import { regexApiNames } from './regexApiNames'

export const regexApiGets = {
${build.writes.constGET ? build.writes.constGET.slice(0, -1) : ''}
} as const\n`
}



function renderRegexApiPosts(build: Build) {
  return `import { regexApiNames } from './regexApiNames'

export const regexApiPosts = {
${build.writes.constPOST ? build.writes.constPOST.slice(0, -1) : ''}
} as const\n`
}



function renderRegexApiPuts(build: Build) {
  return `import { regexApiNames } from './regexApiNames'

export const regexApiPuts = {
${build.writes.constPUT ? build.writes.constPUT.slice(0, -1) : ''}
} as const\n`
}



function renderRegexApiDeletes(build: Build) {
  return `import { regexApiNames } from './regexApiNames'

export const regexApiDeletes = {
${build.writes.constDELETE ? build.writes.constDELETE.slice(0, -1) : ''}
} as const\n`
}



function renderRegexApiNames(build: Build) {
  return `import * as apiLoaders from '@ace/apiLoaders'

export const regexApiNames = {
${build.writes.constApiName ? build.writes.constApiName.slice(0, -1) : ''}
} as const\n`
}


function renderApiLoaders(build: Build) {
  return build.writes.apiLoaders ? build.writes.apiLoaders.slice(0, -1) : ''
}


function renderCreateApp(build: Build) {
  if (!build.fsApp) throw new Error('!build.fsApp')

  return build.fsApp.replace('{/* gen */}', walkTree(build.tree).trimEnd())
}



/**
 * Walk the entire tree, once, building the accumulator (routes string)
 * @param node - The current route we're printing
 * @param indent - Where the indent starts
 * @param accumulator - Routes string
 * @returns 
 */
function walkTree(node: TreeNode, indent = 8, accumulator = {routes: ''}) {
  if (!node.root && node.fsPath) { // open <Route>, for layout, unless virtual root
    accumulator.routes += (' '.repeat(indent) + `<Route component={props => lazyLayout(props, () => import(${getImportFsPath(node.fsPath)}))}>\n`)
    indent += 2
  }

  for (const r of node.routes) { //TreeNode for each route in this layout
    accumulator.routes += (' '.repeat(indent) + `<Route path="${r.routePath}" component={lazyRoute(() => import(${getImportFsPath(r.fsPath)}))} />\n`) // set routes entry
  }

  for (const child of node.layouts.values()) { // recurse into each child layout
    walkTree(child, indent, accumulator)
  }

  if (!node.root) { // if not root => close wrapper 
    indent -= 2
    accumulator.routes += (' '.repeat(indent) + `</Route>\n`)
  }

  return accumulator.routes
}
