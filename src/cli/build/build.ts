import { fileURLToPath } from 'node:url'
import type { AceConfig } from 'acets'
import { buildRead } from './buildRead.js'
import { buildWrite } from './buildWrite.js'
import { join, resolve, dirname } from 'node:path'
import { fundamentals } from '../../fundamentals.js'
import { cuteLog } from '../../fundamentals/cuteLog.js'
import { supportedApiMethods } from '../../fundamentals/vars.js'



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
  baseUrl: string
  found404 = false
  config: AceConfig
  dirWriteRoot: string
  fsSolidTypes?: string
  dirWriteFundamentals: string
  /** fsPath → moduleName */
  whiteList = new FundamentalWhiteList()
  layoutModuleNames = new Map<string, string>()
  commandOptions = new Set(process.argv.filter(arg => arg.startsWith('--')))
  writes: Writes = { types: '', importsAPIFE: '', importsAPIBE: '', constGET: '', constPOST: '', apiFunctionsFE: '', apiFunctionsBE: '' }
  counts: { GET: number, POST: number, routes: number, layouts: number } = { GET: 0, POST: 0, routes: 0, layouts: 0 }

  /**
   * - We start off with a single root node
   * - Root Node: Virtual, top‑level container that always exists
   * - Each time we discover a Route @ `bindAppData()` we insert it into this tree
   * - If the route has no layouts => it goes into root.routes
   */
  tree: TreeNode = { moduleName: 'root', routes: [], layouts: new Map() }


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
    const baseUrl = Build.#getBaseUrl(env, config)

    /** 
     * - Why get these values (`env`, `baseUrl`, `config`, `configPath`) before creating an jarvis object? 
     * - Better downstream types, example: this way, `jarvis.env` is of type `string`, not type `string` | `undefined`
     */
    const build = new Build(cwd, env, baseUrl, config, configPath)

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


  private constructor(cwd: string, env: string, baseUrl: string, config: AceConfig, configPath: string) {
    this.cwd = cwd
    this.env = env
    this.baseUrl = baseUrl
    this.config = this.whiteList.populate(config)

    this.dirWriteRoot = join(cwd, '.ace')
    this.dirWriteFundamentals = join(cwd, '.ace/fundamentals')
    this.dirRead = dirname(fileURLToPath(import.meta.url))

    if (this.commandOptions.has('--verbose')) console.log(`✅ Read: ${configPath}`)
  }


  static #getEnv() {
    const env = process.argv[3]
    if (!env) throw new Error(errors.wrongEnv())
    return env
  }


  /** The config defined at `./ace.config` */
  static async #getConfig(cwd: string) {
    const configPath = resolve(cwd, 'ace.config.js')
    const module = await import(configPath)
    const config = module?.config ? module.config : null

    if (!config) throw new Error(errors.noConfig)

    return { config, configPath }
  }


  static #getBaseUrl(env: string, config: AceConfig) {
    let baseUrl

    if (config?.envs) {
      for (let configEnv of config.envs) {
        if (env === configEnv.name) {
          baseUrl = configEnv.url
          break
        }
      }
    }
  
    if (!baseUrl) throw new Error(errors.wrongEnv(env))

    return baseUrl
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
    fundamentals.forEach((f, name) => {
      if (config.plugins[f.pluginName]) { // IF this fundamentals plugin is `true` @ `./ace.config.js`
        this.set.add(name) // add this fundamental to the whitelist, b/c this is a fundamental that lives in a requested plugin
      }
    })

    return config
  }
}


export type BuildRoute = {
  /** Path starting from fs root */
  fsPath: string,
  /** Path defined @ new Route() */
  routePath: string,
  /** Name that will be used as import default name in generated file */
  moduleName: string,
}


/**
 * - Each node has it's own value (`moduleName`, `fsPath`, `routes`) and a map to more nodes (`layouts`)
 * - Routes that do not have layouts go into the root routes
 * - This way we can print the routes like a tree
 */
export type TreeNode = {
  moduleName: string,
  fsPath?: string,
  routes: BuildRoute[],
  layouts: Map<string,TreeNode>
}


type Writes = {
  types: string,
  constGET: string,
  constPOST: string,
  importsAPIFE: string,
  importsAPIBE: string,
  apiFunctionsFE: string,
  apiFunctionsBE: string,
}


/**
 * `Map<fsPath, moduleName>`
 */
export type ImportsMap = Map<string,string>


export type TreeAccumulator = { importsMap: ImportsMap, consts: string, routes: '' }


/**
 * 
 * @example
 * ```ts
 * export const routes = {
 *   '/': route_1,
 *   '/about': route_2,
 *   '/smooth': route_3,
 * }
 * ```
*/
export const getConstEntry = (urlPath: string, moduleName: string, apiModuleName?: keyof typeof supportedApiMethods) => `  '${urlPath}': ${moduleName}${apiModuleName ? '.' + apiModuleName : ''},\n`


export function getSrcImportEnry({star, moduleName, fsPath, addType }: {star?: boolean, moduleName: string, fsPath: string, addType?: boolean }) {
  const [, fsFromSrc] = fsPath.split('/src/')

  if (!fsFromSrc) throw new Error('Please ensure your file path is w/in the src directory, we just tried to do a split on the fsPath: ${fsPath} on /src/ and that did not work')

  const from = fsFromSrc
    .replace('.tsx', '')
    .replace('.ts', '')

  return `import ${addType ? 'type' : ''} ${star ? '* as ' : ''}${moduleName} from '@src/${from}'\n`
}


const errors = {
  noConfig: '❌ Please export a config const @ "./ace.config.js"',
  noGenTypesTxt: '❌ Please re download ace b/c "/** gen */" was not found in your "dist/types.d.txt" and that is odd',
  wrongEnv: (env?: string) => `❌ Please call with an "env" that is defined @ "./ace.config.js". The env "${env}" did not match any environments set there`
} as const
