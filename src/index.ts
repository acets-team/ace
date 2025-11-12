/**
 * 🧚‍♀️ How to access:
 *     - import type { AceConfig } from 'acets'
 */


/**
 * - Configure Ace!
 * - FAQ:
 *     - Where to place
 *         - `./ace.config.js`
 *     - Why is `ace.config.js` a javascript file?
 *         - The cli does an `import()` of `ace.config.js`, and it's requires less for all to download, to run js files in the terminal
 *     - How to import type into config file for type safety
 *         - Ensure the file starts with an `@ts-check` comment on the first line w/ nothing else on that line
 *         - Put the JSDOC comment: `@type {import('@acets-team/ace').AceConfig}` directly above the line `export const config = {`
 *     - How to import the value
 *         - `import { config } from 'ace.config`
 *     - Why is this type in index.ts?
 *         - So this type is available before `ace build <env>` creates `@ace/types`
*/
export type AceConfig = {
  /** The directory that holds your api files */
  apiDir?: string,
  /** The directory that holds your routes and layouts */
  appDir?: string,
  /** Ace is a set of helpful files we call fundamentals. Fundamentals are grouped by plugins. Set a plugin to true to gain access to the fundamentals it holds. */
  plugins: PluginsConfig,
  /** Default is `tsconfig.json`, helps us resolve aliases */
  tsConfigPath?: string,
  /** The `key` is the `env` which is set w/ the build command, ex: `ace build local`, in this example the key is `local`. The value is a `string` or `array` of `strings` which are the allowed origins. 🚨 If your origin is '*' cookies won't work, not an Ace limitation, that's just how HTTP work :) */
  origins: Record<string, string | string[]>
  /** 
   * - When set to true 
   * - On build => IF `config.sw` = `true` THEN file in `public` directory that starts w/ `sw` and is a `.js` file is renamed to `sw_[package dot json version].js` - Helps maintain alignment between app versions and cache versions
   * @example
    ```ts
    import { createRequire } from 'node:module'
    const { version } = createRequire(import.meta.url)('./package.json')
    ```
   * 
  */
  sw?: boolean
  /**
   * - Optional, defaults to `_info`
   * - Messages are grouped by name: `Map<string, Signal<string[]>>`
   * - Messages are read from `response.error.messages` & typically have `valibot` / `zod` errors
   * - If `response.error.message` is defined, we'll put that value @ `mesages[defaultMessageName] = [response.error.message]`
   */
  defaultMessageName?: string
  /**
   * - Optional, defaults to `❌ Sorry but an error just happened`
   * - If no other error is provided we'll show this
   */
  defaultError?: string
  /**
   * - The key aligns w/ the keys @ `ace.config.js` > `origins`
   * - The value is the host url to the Ace Live Server when @ that `origin`
   * - 🚨 Host meaning no `http://` like this: `liveHosts: { local: 'localhost:8787', prod: 'live.example.com' }`
   */
  liveHosts?: Record<string, string>
  /** Would you like to log errors */
  logCaughtErrors?: boolean,
  mdFolders?: { id: string, path: string }[]
}


export type PluginsConfig = {
  /**
   * Enables **SolidJS** fundamentals (helpful modules @ `./ace`)
   *
   * Requires the following npm dev imports:
   * - `solid-js`
   * - `@solidjs/meta`
   * - `@solidjs/start`
   * - `@solidjs/router`
   * 
   * @link https://docs.solidjs.com/
   */
  solid?: boolean

  /**
   * Enables **Valibot** fundamentals (helpful modules @ `./ace`)
   *
   * Requires the following npm dev imports:
   * - `valibot`
   * 
   * @link https://valibot.dev/guides/comparison/
   */
  valibot?: boolean

  /**
   * Enables **Zod** fundamentals (helpful modules @ `./ace`)
   *
   * Requires the following npm dev imports:
   * - `zod`
   * 
   * @link https://zod.dev/
   */
  zod?: boolean

  /**
   * Enables **Turso** fundamentals (helpful modules @ `./ace`)
   *
   * Requires the following npm dev imports:
   * - `@libsql/client`
   * - `drizzle-orm`
   * - `drizzle-kit`
   * 
   * @link https://turso.tech/
   */
  turso?: boolean

  /**
   * Enables **AgGrid** fundamentals (helpful modules @ `./ace`)
   * 
   * - Requires the following npm dev imports:
   *     - `ag-grid-community`
   * @link https://www.ag-grid.com/
   */
  agGrid?: boolean

  /**
   * Enables **Brevo** fundamentals (helpful modules @ `./ace`)
   * 
   * - Requires the following `.env` variable:
   *     - `process.env.BREVO_API_KEY`
   *
   * @link https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys
   * @link https://developers.brevo.com/docs/send-a-transactional-email
   * @link https://developers.brevo.com/docs/how-it-works
   * @link https://www.cloudflare.com/en-gb/ips/
   */
  brevo?: boolean

  /**
   * Enables **Markdown** fundamentals (helpful modules @ `./ace`)
   * 
   * - Requires the following npm dev imports:
   *     - `markdown-it`
   *
   * @link https://www.npmjs.com/package/markdown-it
   */
  markdownIt?: boolean


  /**
   * Enables **Markdown** fundamentals (helpful modules @ `./ace`)
   * 
   * - Requires the following npm dev imports:
   *     - `highlight.js`
   *     - `@highlightjs/cdn-assets`
   *
   * @link https://highlightjs.readthedocs.io/
   */
  hljs?: boolean

  /**
   * Enables **Markdown** fundamentals (helpful modules @ `./ace`)
   * 
   * - Requires the following npm dev imports:
   *     - `wrangler`
   *     - `@cloudflare/workers-types`
   *
   * @link https://developers.cloudflare.com/durable-objects/
   */
  cf?: boolean

  /**
   * Enables **Chart.js** fundamentals (helpful modules @ `./ace`)
   * 
   * - Requires the following npm dev imports:
   *     - `chart.js`
   *
   * @link https://www.chartjs.org/
   */
  chartjs?: boolean
}
