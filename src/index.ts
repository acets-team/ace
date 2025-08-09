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
 *         - So this type is available before types.ts aka @ace/types is created
*/
export type AceConfig = {
  /** The directory that holds your api files */
  apiDir?: string,
  /** The directory that holds your routes and layouts */
  appDir?: string,
  /** Would you like to log errors */
  logCaughtErrors?: boolean,
  /** Ace is a set of helpful files we call fundamentals. Fundamentals are grouped by plugins. Set a plugin to true to gain access to the fundamentals it holds. */
  plugins: PluginsConfig,
  /** Default is `tsconfig.json` */
  tsConfigPath?: string,
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
   */
  solid?: boolean

  /**
   * Enables **Valibot** fundamentals (helpful modules @ `./ace`)
   *
   * Requires the following npm dev imports:
   * - `valibot`
   */
  valibot?: boolean

  /**
   * Enables **Zod** fundamentals (helpful modules @ `./ace`)
   *
   * Requires the following npm dev imports:
   * - `zod`
   */
  zod?: boolean

  /**
   * Enables **Turso** fundamentals (helpful modules @ `./ace`)
   *
   * Requires the following npm dev imports:
   * - `@libsql/client`
   * - `drizzle-orm`
   */
  turso?: boolean

  /**
   * Enables **AgGrid** fundamentals (helpful modules @ `./ace`)
   * 
   * - Requires the following npm dev imports:
   *     - `ag-grid-community` (🚨 Only used for types)
   * - Requires the following cdn script:
   *     - @ entry-server.tsx > below {scripts} > `<script src="https://cdn.jsdelivr.net/npm/ag-grid-community/dist/ag-grid-community.min.js"></script>`
   *     - Users download it once and then it's cdn from their
   *     - Avoids big script in fe or be build
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
}
