/**
 * 🧚‍♀️ How to access:
 *     - import { tursoConnect } from '@ace/tursoConnect'
 */


import { env } from 'node:process'
import { DrizzleConfig } from 'drizzle-orm'
import { drizzle } from 'drizzle-orm/libsql'
import type { LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient, type Config } from '@libsql/client/web'


// TS allows us to write multiple type signatures (called overloads) for a single function, so that the compiler can provide more accurate typing information depending on how the function is called
// TS requires the function implementation to be compatible with all overloads


/**
 * Overload #1 — `props` has `drizzleConfig` so returns `LibSQLDatabase<TSchema>`
 */
export function tursoConnect<TSchema extends Record<string, unknown>>(props?: {clientConfig?: Config, drizzleConfig: DrizzleConfig<TSchema> }): LibSQLDatabase<TSchema>


/**
 * Overload #2 — `props` has no `drizzleConfig` so returns `LibSQLDatabase`
 */
export function tursoConnect(props?: { clientConfig?: Config, drizzleConfig?: undefined }): LibSQLDatabase


/**
 * 1. Initializes a `libsql (turso) client` using provided config or environment variables
 * 2. Wraps libsql client w/ drizzle()
 * @param clientConfig `url` and `authToken` can be passed here or through environment variables
 * @param drizzleConfig - optional Drizzle config, such as `schema`
 * @throws Error if neither config.url nor env.TURSO_DATABASE_URL is set, or neither config.authToken nor env.TURSO_AUTH_TOKEN is set
 */
export function tursoConnect<TSchema extends Record<string, unknown>>(props?: { clientConfig?: Config, drizzleConfig?: DrizzleConfig<TSchema> }): LibSQLDatabase<TSchema> {
  const url = props?.clientConfig?.url || env.TURSO_DATABASE_URL
  if (!url) throw new Error('Please provide database url via config.url or TURSO_DATABASE_URL environment variable')

  const authToken = props?.clientConfig?.authToken || env.TURSO_AUTH_TOKEN
  if (!authToken) throw new Error('Please provide auth token via config.authToken or TURSO_AUTH_TOKEN environment variable')

  const client = createClient({ ...(props?.clientConfig || {}), url, authToken })

  return props?.drizzleConfig
    ? drizzle<TSchema>(client, props.drizzleConfig)
    : drizzle(client)
}
