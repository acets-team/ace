/**
 * 🧚‍♀️ How to access:
 *     - import { tursoConnect } from '@ace/tursoConnect'
 *     - import type { TursoConnectResult, TursoConnectProps } from '@ace/tursoConnect'
 */


import { getEnv } from '../getEnv'
import type { DrizzleConfig } from 'drizzle-orm'
import { drizzle, type LibSQLDatabase } from 'drizzle-orm/libsql'
import { createClient, type Client, type Config } from '@libsql/client/web'



export function tursoConnect<TSchema extends Record<string, unknown>>(props?: { clientConfig?: Config, drizzleConfig?: DrizzleConfig<TSchema> } ): TursoConnectResult<TSchema> {
  const url = getEnv('TURSO_DATABASE_URL', props?.clientConfig?.url)
  if (!url) throw new Error('Please provide database url via config.url or TURSO_DATABASE_URL environment variable')

  const authToken = getEnv('TURSO_AUTH_TOKEN', props?.clientConfig?.authToken) 
  if (!authToken) throw new Error('Please provide auth token via config.authToken or TURSO_AUTH_TOKEN environment variable')

  const client = createClient({ ...(props?.clientConfig || {}), url, authToken })

  const db = (props && props.drizzleConfig) // type guard / non-null assertion ensures `props` are treated as a valid object
    ? drizzle<TSchema>(client, props.drizzleConfig)
    : drizzle(client) as LibSQLDatabase<Record<string, never>>

  return { db, client } as TursoConnectResult<TSchema>
}


export type TursoConnectResult<TSchema> = {
  client: Client;
  db: TSchema extends Record<string, unknown> ? LibSQLDatabase<TSchema> : LibSQLDatabase<Record<string, never>>;
}


export type TursoConnectProps = Parameters<typeof tursoConnect>[0]
