import { join, resolve } from 'node:path'
import { treeCreate } from '../../treeCreate.js'
import { fundamentals } from '../../fundamentals.js'
import { Build, type LayoutsMapRoute } from './build.js'
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

  if (build.fsParseMarkdownFolders) {
    promises.push(
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderParseMarkdownFolders(build), fileName: 'parseMarkdownFolders.ts' }),
    )
  }

  if (build.config.plugins.solid) {
    promises.push(
      fsWrite({ build, dir: build.dirWriteFundamentals, content: build.fsSolidTypes || '', fileName: 'types.d.ts' }),
      renderRoutes(build),
      fsWrite({ build, dir: build.dirWriteFundamentals, content: renderBaseApp(build), fileName: 'baseApp.tsx' }),
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


function renderBaseApp(build: Build) {
  if (!build.fsBaseApp) throw new Error('!build.fsBaseApp')

  if (!build.rootLayoutFsPath) return build.fsBaseApp
  else {
    const rootLayoutImport = `import RootLayout from ${build.fsPath2Relative(build.rootLayoutFsPath)}\n`

    const rootLayoutRouter = '        <Router root={RootLayout.layout}>'
    const defaultRouter = '        <Router root={(props: RouteSectionProps) => <Suspense>{props.children}</Suspense>}>'

    const rootSectionPropsImport = `import type { RouteSectionProps } from '@solidjs/router'\n`

    const suspenseImport = `import { Suspense } from 'solid-js'\n`

    const baseApp = build.fsBaseApp
      .replace(defaultRouter, rootLayoutRouter)
      .replace(suspenseImport, '')
      .replace(rootSectionPropsImport, '')

    return rootLayoutImport + baseApp
  }
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


async function renderRoutes(build: Build) {
  const createdDirs = new Set<string>()
  const writtenLayouts = new Set<string>()
  const dirRoutes = resolve(build.cwd, 'src/routes')

  await mkdir(dirRoutes, { recursive: true })

  await writeApiFile(dirRoutes)

  for (const [layoutName, layout] of Object.entries(build.layoutsMap)) {
    if (layoutName === 'Root') {
      for (const route of layout.routes) {
        await writeRouteFile(dirRoutes, route)
      }
    } else if (layout.fsPath) {
      const dirRoute = await createDir(dirRoutes, layoutName)
      await writeLayoutFile(dirRoutes, layoutName, `import Layout from ${build.fsPath2Relative(layout.fsPath, dirRoutes)}

export default Layout.layout\n`)

      for (const route of layout.routes) {
        await writeRouteFile(dirRoute, route)
      }
    }
  }


  async function writeApiFile(dirRoutes: string) {
    if (!build.fsApi) throw new Error('!build.fsApi')

    const dirApi = resolve(dirRoutes, 'api')
    await mkdir(dirApi, { recursive: true })

    await writeFile(resolve(dirApi, '[...api].ts'), build.fsApi)
  }


  async function createDir(dirRoutes: string, layoutName: string) {
    const dir = resolve(dirRoutes, `(${layoutName})`)
    if (createdDirs.has(dir)) return dir
    await mkdir(dir, { recursive: true })
    createdDirs.add(dir)
    return dir
  }


  async function writeLayoutFile(dirRoutes: string, layoutName: string, content: string) {
    if (writtenLayouts.has(layoutName)) return

    const filePath = resolve(dirRoutes, `(${layoutName}).tsx`)

    await writeFile(filePath, content)

    writtenLayouts.add(layoutName)
  }


  async function writeRouteFile(dirRoutes: string, route: LayoutsMapRoute) {
    const fsParts = routePathToFsParts(route.routePath)
    if (!fsParts.length) return

    // removes the last item from the array and return it
    // important to remove fileName BEFORE we mkdir
    const fileName = fsParts.pop() + '.tsx'

    let dirRoute = dirRoutes

    if (fsParts.length) {
      // [ 'test2', '[id]' ] -> /routes/test2/[id]
      dirRoute = resolve(dirRoutes, ...fsParts)
      await mkdir(dirRoute, { recursive: true })
    }

    await writeFile(`${dirRoute}/${fileName}`, `import Route from ${build.fsPath2Relative(route.fsPath, dirRoute)}
import type { RouteSectionProps } from '@solidjs/router'
import { callRouteComponent } from '@ace/callRouteComponent'


export default (props: RouteSectionProps) => callRouteComponent(props, Route)`)
  }


  /**
   * - Converts `/post/:id/:slug?` to `['post', '[id]', '[[slug]]']`
   * - Which later becomes: `routes/post/[id]/[[slug]].tsx`
   */
  function routePathToFsParts(routePath: string): string[] {
    // handle special cases first
    if (routePath === '/') return ['index']
    if (routePath === '*') return ['[...404]']

    // normalize the path BEFORE we split on forward slash
    // `/post/:id` -> `post/:id`
    if (routePath[0] === '/') routePath = routePath.slice(1)

    return routePath.split('/').map(getFsPart)
  }


  function getFsPart(segment: string): string {
    // catch-all
    // SolidStart catch-alls look like [...param]
    // segment.slice(1) removes the *
    // IF nothing is left after the * THEN we default to 404
    if (segment.startsWith('*')) {
      return `[...${segment.slice(1) || '404'}]`
    }

    // optional param
    // :id? -> [[id]]
    if (segment.startsWith(':') && segment.endsWith('?')) {
      return `[[${segment.slice(1, -1)}]]`
    }

    // required param
    // :id -> [id]
    if (segment.startsWith(':')) {
      return `[${segment.slice(1)}]`
    }

    // static segment
    // IF none of the above (folder)
    // post -> post
    return segment
  }
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
