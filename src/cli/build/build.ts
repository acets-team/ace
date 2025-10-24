import type { AceConfig } from 'acets'
import { buildRead } from './buildRead.js'
import { buildWrite } from './buildWrite.js'
import { fundamentals } from '../../fundamentals.js'
import { cuteLog } from '../../fundamentals/cuteLog.js'
import { fileURLToPath, pathToFileURL } from 'node:url'
import { sep, join, relative, resolve, dirname } from 'node:path'
import { Enums, type InferEnums } from '../../fundamentals/enums.js'
import { pathnameToPattern } from '../../fundamentals/pathnameToPattern.js'


/**
 * - Builds types, components and functions
 * - Configured w/ `ace.config.js`
 * - Command Options:
 *     - `--verbose`: Log what's happening
 * @param cwd Common working directory
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
  dirRead: string
  found404 = false
  config: AceConfig
  dirWriteRoot: string
  fsSolidTypes?: string
  dirWriteFundamentals: string
  whiteList = new FundamentalWhiteList()
  tsConfigPaths?: { regex: RegExp, targets: string[] }[]
  static apiMethods = new Enums(['GET', 'POST', 'PUT', 'DELETE']) // yes we have this in vars but vars has imports that do not have .js extensions
  commandOptions = new Set(process.argv.filter(arg => arg.startsWith('--')))
  writes: Writes = { types: '', constGET: '', constPOST: '', constPUT: '', constDELETE: '', constRoutes: '', apiFunctions: '', constApiName: '', apiLoaders: '' }

  /**
   * - We start off with a single root node
   * - Root Node: Virtual, top‑level container that always exists
   * - Each time we discover a Route @ `bindAppData()` we insert it into this tree
   * - If the route has no layouts => it goes into root.routes
   */
  tree: TreeNode = { root: true, routes: [], layouts: new Map() }


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
    this.dirRead = dirname(fileURLToPath(import.meta.url))
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


  getConstEntry = (pathIsKey: boolean, urlPath: string, fsPath: string, moduleName: ApiMethods | 'default', fnName?: string) => {
    if (pathIsKey && fnName) { // regexApiGets, regexApiPosts, regexApiDeletes, regexApiPuts
      return `  '${urlPath}': regexApiNames.${fnName},\n`
    } else if (fnName) { // regexApiNames
      return `  '${fnName}': {
      path: '${urlPath}',
      pattern: ${pathnameToPattern(urlPath)},
      loader: apiLoaders.${fnName}Loader,
    },\n`
    } else { // regexRoutes
      return `  '${urlPath}': {
      pattern: ${pathnameToPattern(urlPath)},
      loader: () => import(${this.fsPath2Relative(fsPath)}).then((m) => m.${moduleName}),
    },\n`
    }
  }
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
export type TreeNode = {
  root: boolean,
  fsPath?: string,
  routes: BuildRoute[],
  layouts: Map<string,TreeNode>
}


export type Writes = {
  types: string,
  constGET: string,
  constPUT: string,
  constPOST: string,
  apiLoaders: string,
  constDELETE: string,
  constRoutes: string,
  constApiName: string,
  apiFunctions: string,
}


const errors = {
  noConfig: '❌ Please export a config const @ "./ace.config.js"',
  noGenTypesTxt: '❌ Please re download ace b/c "/** gen */" was not found in your "dist/types.d.txt" and that is odd',
  falsyEnv: `❌ Please ensure an env is specified when you call ace build, example: "ace build local" or "ace build prod"`
} as const


export type ApiMethods = InferEnums<typeof Build.apiMethods>
