/**
 * 🧚‍♀️ How to access:
 *     - import { getBaseUrl } from '@ace/getBaseUrl'
 */


import { config } from 'ace.config'


export function getBaseUrl() {
  if (!process.env.ENV) throw new Error('Please set process.env.ENV')

  if (!Array.isArray(config.envs)) throw new Error('Please set ./ace.config.js > envs to an array')

  const baseUrl = config.envs.find(env => env.name === process.env.ENV)

  if (!baseUrl) throw new Error(`./ace.config.js > envs > "${process.env.ENV}" is invalid`)

  return baseUrl
}
