/**
 * 🧚‍♀️ How to access:
 *     - import { tursoConnect } from '@ace/tursoConnect'
 */


import { env } from 'node:process'
import { drizzle } from 'drizzle-orm/libsql'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient, type Config, type Client } from '@libsql/client'


/**
 * Initializes a `libsql (turso) client` using provided config or environment variables
 * @param config `url` and `authToken` can be passed here or through environment variables
 * @throws Error if neither config.url nor env.TURSO_DATABASE_URL is set, or neither config.authToken nor env.TURSO_AUTH_TOKEN is set
 */
export function tursoConnect(config?: Config): LibSQLDatabase {
  const url = config?.url || env.TURSO_DATABASE_URL
  if (!url) throw new Error('Please provide database url via config.url or TURSO_DATABASE_URL environment variable')

  const authToken = config?.authToken || env.TURSO_AUTH_TOKEN
  if (!authToken) throw new Error('Please provide auth token via config.authToken or TURSO_AUTH_TOKEN environment variable')

  return drizzle(createClient({ ...(config || {}), url, authToken }))
}
