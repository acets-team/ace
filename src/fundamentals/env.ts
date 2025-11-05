/**
  * 🧚‍♀️ How to access:
  *     - import { env, configOrigins, buildOrigin } from '@ace/env'
  */


import { config } from 'ace.config'


/** Defined during `ace build <env>` */
export const env: string = '{/* gen */}'


/**
 * - Aligns `ace.config.js` > `origins` w/ the current `ace build <env>`
 * - The resulting `Set` tells us, all the origins we support for the current `environment` @ build time
 * - Helpful for validating incoming request origins (ex: during CORS checks)
 */
export const configOrigins = (typeof config.origins[env] === 'string')
  ? new Set([config.origins[env]])
  : new Set(config.origins[env])


/**
 * - The expectected/primary server origin @ build time
 * - A static value that comes from `ace.config.js` during `ace build <env>`
 * - 🚨 IF the current  `ace.config.js` > `origins` > `env` has more then 1 origin defined, the first origin defined will be used here, example: for `prod: ['https://example.com', 'https://www.example.com']` the `buildOrigin` will be `https://example.com`
 * - Helps us:
 *     - Know the expectected/primary origin w/ no request context
 * - Ideal for:
 *     - Build time url generation (ex: Open graph meta tags, frontend urls)
 */
export const buildOrigin = Array.isArray(config.origins[env]) && config.origins[env].length
  ? config.origins[env][0]
  : typeof config.origins[env] === 'string'
    ? config.origins[env]
    : ''
