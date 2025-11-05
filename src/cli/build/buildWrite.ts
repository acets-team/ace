import { join, resolve } from 'node:path'
import { Build, type TreeNode } from './build.js'
import { fundamentals } from '../../fundamentals.js'
import { mkdir, copyFile, writeFile } from 'node:fs/promises'



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

  if (build.config.plugins.solid) {
    promises.push(
      fsWrite({ build, dir: build.dirWriteFundamentals, content: build.fsSolidTypes || '', fileName: 'types.d.ts' }),
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



function renderApis(build: Build) {
  return `import * as apiLoaders from './apiLoaders'
import { createApiFn } from '../createApiFn' 

${build.writes.apiFunctions}`
}



function renderRegexRoute(build: Build) {
  return `import type { RegexMap } from './types'

export const regexRoutes = {
${build.writes.constRoutes ? build.writes.constRoutes.slice(0, -1) : ''}
} satisfies RegexMap<'route'>\n`
}



function renderRegexApiGets(build: Build) {
  return `import { RegexMap } from './types'
import { regexApiNames } from './regexApiNames'

export const regexApiGets = {
${build.writes.constGET ? build.writes.constGET.slice(0, -1) : ''}
} satisfies RegexMap<'api'>\n`
}



function renderRegexApiPosts(build: Build) {
  return `import { RegexMap } from './types'
import { regexApiNames } from './regexApiNames'

export const regexApiPosts = {
${build.writes.constPOST ? build.writes.constPOST.slice(0, -1) : ''}
} satisfies RegexMap<'api'>\n`
}



function renderRegexApiPuts(build: Build) {
  return `import { RegexMap } from './types'
import { regexApiNames } from './regexApiNames'

export const regexApiPuts = {
${build.writes.constPUT ? build.writes.constPUT.slice(0, -1) : ''}
} satisfies RegexMap<'api'>\n`
}



function renderRegexApiDeletes(build: Build) {
  return `import { RegexMap } from './types'
import { regexApiNames } from './regexApiNames'

export const regexApiDeletes = {
${build.writes.constDELETE ? build.writes.constDELETE.slice(0, -1) : ''}
} satisfies RegexMap<'api'>\n`
}



function renderRegexApiNames(build: Build) {
  return `import { RegexMap } from './types'
import * as apiLoaders from '@ace/apiLoaders'

export const regexApiNames = {
${build.writes.constApiName ? build.writes.constApiName.slice(0, -1) : ''}
} satisfies RegexMap<'api'>\n`
}


function renderApiLoaders(build: Build) {
  return build.writes.apiLoaders ? build.writes.apiLoaders.slice(0, -1) : ''
}


function renderCreateApp(build: Build) {
  if (!build.fsApp) throw new Error('!build.fsApp')

  return build.fsApp.replace('{/* gen */}', walkTree(build, build.tree).trimEnd())
}



/**
 * Walk the entire tree, once, building the accumulator (routes string)
 * @param build - Build helper
 * @param node - The current route we're printing
 * @param indent - Where the indent starts
 * @param accumulator - Routes string
 */
function walkTree(build: Build, node: TreeNode, indent = 8, accumulator = {routes: ''}) {
  if (!node.root && node.fsPath) { // open <Route>, for layout, unless virtual root
    accumulator.routes += (' '.repeat(indent) + `<Route component={props => lazyLayout(props, () => import(${build.fsPath2Relative(node.fsPath)}))}>\n`)
    indent += 2
  }

  for (const r of node.routes) { //TreeNode for each route in this layout
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
