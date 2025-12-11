import type { AceConfig } from 'acets'
import { buildRead } from './buildRead.js'
import { buildWrite } from './buildWrite.js'
import { fundamentals } from '../../fundamentals.js'
import { cuteLog } from '../../fundamentals/cuteLog.js'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { type TreeCreateRoute } from '../../treeCreate.js'
import { sep, join, relative, resolve, dirname } from 'node:path'
import type { PathnameSegments } from '../../pathname2Segments.js'
import { Enums, type InferEnums } from '../../fundamentals/enums.js'


/**
 * - Builds types, components and functions
 * - Configured w/ `ace.config.js`
 * - Command Options:
 *     - `--verbose`: Log what's happening
 * @param cwd Current working directory
 */
export async function cliBuild(cwd: string) {
  const build = await Build.Create(cwd)
  await build.doBuild()
}



export class Build {
  cwd: string
  env: string
  space = '\n'
  fsApp?: string
  fsEnv?: string
  found404 = false
  config: AceConfig
  dirWriteRoot: string
  fsSolidTypes?: string
  /** `./dist/src/cli/build/build.js` */
  dirDistBuildJs: string
  fsVanillaTypes?: string
  routes: RouteArray = []
  apis: {
    GET: ApiArray,
    POST: ApiArray,
    PUT: ApiArray,
    DELETE: ApiArray,
  } = { GET: [], POST: [], PUT: [], DELETE: []}
  dirWriteFundamentals: string
  fsParseMarkdownFolders?: string
  whiteList = new FundamentalWhiteList()
  tsConfigPaths?: { regex: RegExp, targets: string[] }[]
  static apiMethods = new Enums(['GET', 'POST', 'PUT', 'DELETE']) // yes we have this in vars but vars has imports that do not have .js extensions
  commandOptions = new Set(process.argv.filter(arg => arg.startsWith('--')))
  writes: Writes = { types: '', mapApis: '', mapRoutes: '' }

  /**
   * - We start off with a single root node
   * - Root Node: Virtual, top‑level container that always exists
   * - Each time we discover a Route @ `bindAppData()` we insert it into this tree
   * - If the route has no layouts => it goes into root.routes
   */
  tree: CreateAppTreeNode = { root: true, routes: [], layouts: new Map() }


  /**
   * - What `Create()` does: 
   *     - Get the environment (`env`) in the command: if the command is `fun build local` the `env` is `local`
   *     - Get the `config` defined @ `ace.config.js`
   *     - Get the `baseUrl` by aligning the `config` w/ the `env`
   *     - Populate the white list of fundamentals that must be included in the build
   *     - Populate lots of additional helpful variables
   * @param cwd - Common working directory
   * @returns An jarvis object
   */
  static async Create(cwd: string) {
    const env = Build.#getEnv()

    const {config, configPath} = await Build.#getConfig(cwd)

    /** 
     * - Why get these values (`env`, `config`, `configPath`) before creating an jarvis object? 
     * - Better downstream types, example: this way, `jarvis.env` is of type `string`, not type `string` | `undefined`
     */
    const build = new Build(cwd, env, config, configPath)

    return build
  }


  async doBuild() {
    await buildRead(this)
    await buildWrite(this)
    this.#goodByeLog()
  }


  #goodByeLog() {
    if (!this.commandOptions.has('verbose')) cuteLog('🎉 Wrote: .ace\n', 'bold', 'green')
  }


  private constructor(cwd: string, env: string, config: AceConfig, configPath: string) {
    this.cwd = cwd
    this.env = env
    this.config = this.whiteList.populate(config)

    this.dirWriteRoot = join(cwd, '.ace')
    this.dirDistBuildJs = dirname(fileURLToPath(import.meta.url)) // import.meta.url provides the full URL to the current module file, this code will run @ ./dist/src/cli/build/build.js
    this.dirWriteFundamentals = join(cwd, '.ace/fundamentals')

    if (this.commandOptions.has('--verbose')) console.log(`✅ Read: ${configPath}`)
  }


  static #getEnv() {
    const env = process.argv[3]
    if (!env) throw new Error(errors.falsyEnv)
    return env
  }


  /** The config defined at `./ace.config` */
  static async #getConfig(cwd: string) {
    const fsConfigPath = resolve(cwd, 'ace.config.js')
    const relativeConfigPath = pathToFileURL(fsConfigPath).href
    const module = await import(relativeConfigPath)
    const config = module?.config ? module.config : null

    if (!config) throw new Error(errors.noConfig)

    return { config, configPath: fsConfigPath }
  }


  /** On windows we can't `await import(fsPath)` so this converts the `fsPath` to a `relativePath` */
  fsPath2Relative(fsPath: string, baseDir = this.dirWriteFundamentals) {
    let rel = relative(baseDir, fsPath) // get relative path

    rel = rel.split(sep).join('/') // windows uses backslashes, vite errors w/ backslashes, this replaces backslashes w/ forward slashes

    rel = rel.replace(/\.(tsx|ts|jsx|js)$/, '') // strip supported extensions (vite doesen't need em)

    return `"${rel}"` // surround w/ quotes so it's a string whereever it's placed
  }


  getImportEnry({ star, moduleName, fsPath, addType }: { star?: boolean, moduleName: string, fsPath: string, addType?: boolean }) {
    return `import${addType ? ' type' : ''}${star ? ' * as' : ''} ${moduleName} from ${this.fsPath2Relative(fsPath)}\n`
  }


  // getConstEntry = (props: { pathIsKey: boolean, urlPath: string, fsPath: string, moduleName: ApiMethods | 'default', method?: string, fnName?: string }) => {
  //   if (props.pathIsKey && props.fnName) { // regexApiGets, regexApiPosts, regexApiDeletes, regexApiPuts
  //     return `  '${props.urlPath}': regexApiNames.${props.fnName},\n`
  //   } else if (props.fnName) { // regexApiNames
  //     return `  '${props.fnName}': {
  //     path: '${props.urlPath}',
  //     method: '${props.moduleName}',
  //     pattern: ${pathnameToPattern(props.urlPath)},
  //     loader: apiLoaders.${props.fnName}Loader,
  //   },\n`
  //   } else { // regexRoutes
  //     return `  '${props.urlPath}': {
  //     pattern: ${pathnameToPattern(props.urlPath)},
  //     loader: () => import(${this.fsPath2Relative(props.fsPath)}).then((m) => m.${props.moduleName}),
  //   },\n`
  //   }
  // }
}



/**
 * - A fundamental is a file that has helpful stuff in it
 * - A collection of these files is a plugin
 * - Users opt into fundamentals by opting into plugins
 * - So by opting into a plugin, users opt into a set of fundamentals
 * - When building the fundamentals, this whitelist helps us know what fundamentals to build
 */
class FundamentalWhiteList {
  /** When building the fundamentals, this whitelist helps us know what fundamentals to build */
  set: Set<string>

  constructor() {
    this.set = new Set()
  }

  /**
   * - Adds fundamentals to the whitelist if they live in plugins the `./ace.config.js` requests
   * @returns Unaltered `config`
   */
  populate(config: AceConfig) {
    for (const [name, f] of fundamentals) {
      if (f.pluginName === 'vanilla' || config.plugins[f.pluginName]) { // IF this fundamentals plugin is `true` @ `./ace.config.js`
        this.set.add(name) // add this fundamental to the whitelist, b/c this is a fundamental that lives in a requested plugin
      }
    }

    return config
  }
}


export type BuildRoute = {
  /** Path starting from fs root */
  fsPath: string,
  /** Path defined @ new Route() */
  routePath: string,
}


/**
 * - Each node has it's own value (`moduleName`, `fsPath`, `routes`) and a map to more nodes (`layouts`)
 * - Routes that do not have layouts go into the root routes
 * - This way we can print the routes like a tree
 */
export type CreateAppTreeNode = {
  root: boolean,
  fsPath?: string,
  routes: BuildRoute[],
  layouts: Map<string,CreateAppTreeNode>
}


export type Writes = {
  types: string,
  mapApis: string,
  mapRoutes: string,
}


type ApiArray = (
  TreeCreateRoute & {
    fsPath: string,
    infoName: string,
    resolverName: string,
    segments: PathnameSegments,
  }
)[]


type RouteArray = (
  TreeCreateRoute & {
    fsPath: string,
    segments: PathnameSegments,
  }
)[]


const errors = {
  noConfig: '❌ Please export a config const @ "./ace.config.js"',
  noGenTypesTxt: '❌ Please re download ace b/c "/** gen */" was not found in your "dist/types.d.txt" and that is odd',
  falsyEnv: `❌ Please ensure an env is specified when you call ace build, example: "ace build local" or "ace build prod"`
} as const


export type ApiMethods = InferEnums<typeof Build.apiMethods>
