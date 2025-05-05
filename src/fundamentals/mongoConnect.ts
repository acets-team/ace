/**
 * 🧚‍♀️ How to access:
 *     - import { mongoConnect, defaultConnectOptions } from '@ace/mongoConnect'
 */


import mongoose, { connect, type ConnectOptions } from 'mongoose'


/** 
 * - `mongoConnect()` ensures that 1 connection pool is running at a time
 * - If a call to a mongoose model is made AND no pool is running THEN an error will occur
 * - Pool does not start till `mongoConnect()` has been called
 * - Calling `mongoConnect()` after a pool has been created is not expensive, it's one `switch` statement variable check of processing
 * - The default connection options are available at `defaultConnectOptions`
 * - falsy `connectOptions` => `defaultConnectOptions` applied
 * - truthy `connectOptions` => `connectOptions` applied
 * 
 * ---
 *
 * @example
 * ```ts
 * await mongoConnect()
 * // or 
 * await mongoConnect({ ...defaultConnectOptions, serverSelectionTimeoutMS: 4_000 })
 * // or 
 * await mongoConnect({ minPoolSize: 6, maxPoolSize: 21 }) // only options applied
 * ```
 * 
 * ---
 *
 * ### .env
 * @example
 * ```toml
 * MONGODB_DB=admin
 * MONGODB_PORT=27017
 * MONGODB_USER=admin
 * MONGODB_APP_DB=example_app
 * MONGODB_PASS=siudjfijskfkwnfwifjwefkweij8
 * MONGODB_HOST=example.com
 * ```
 * ---
 * @param connectOptions IF truthy `connectOptions` applied ELSE `defaultConnectOptions` applied
 */
export async function mongoConnect(connectOptions?: ConnectOptions): Promise<void> {
  try {
    switch (mongoose.connection.readyState) { // 0. Disconnected, 1. Connected, 2. Connecting, 3. Disconnecting
      case 1: return
      case 2: throw new Error('❌ Already connecting db')
      case 3: throw new Error('❌ Already disconnecting db')
    }

    const uri = getMongoURI()

    if (!uri) throw new Error('uri is falsy, can not connect to mongo w/o a uri')

    process.once('SIGINT', () => closeDB('SIGINT (app termination)'))
    process.once('SIGTERM', () => closeDB('SIGTERM (server shutdown)'))

    const conn = await connect(uri, connectOptions || defaultConnectOptions)

    console.log(`✅ MongoDB pool created for ${conn.connection.host}`)
  } catch (error) {
    console.error('❌ MongoDB connection failed:', error)
    throw error
  }
}


export const defaultConnectOptions = {
  minPoolSize: 5,
  maxPoolSize: 20,
  socketTimeoutMS: 60_000,
  connectTimeoutMS: 7_000,
  serverSelectionTimeoutMS: 3_000,
}


function getMongoURI() {
  const user = process.env.MONGODB_USER
  const pass = process.env.MONGODB_PASS
  const host = process.env.MONGODB_HOST
  const port = process.env.MONGODB_PORT
  const authDb = process.env.MONGODB_DB
  const appDb = process.env.MONGODB_APP_DB

  return `mongodb://${user}:${pass}@${host}:${port}/${appDb}?authSource=${authDb}`
}


async function closeDB (signal: string) {
  await mongoose.connection.close()
  console.log(`📴 MongoDB connection closed due to: ${signal}`)
  process.exit(0)
}
