/**
 * 🧚‍♀️ How to access:
 *     - import { jwtCreate } from '@ace/jwtCreate'
 *     - import type { JwtCreateProps } from '@ace/jwtCreate'
 */


import { getEnv } from '../getEnv'
import type { BaseJWTPayload } from './types'
import { base64UrlEncode } from './base64UrlEncode'


/**
 * ### Create a JWT in node or on the Edge (Cloudflare Workers)
 * - Uses the HS512 algorithm which is fast and quantum-resistant (so long as secret ≥ 64 bytes)  
 * - Adds iat (issued at) & exp (expired at) props to the jwt payload to align w/ `JWT spec (RFC 7519)`
 * @example
  ```ts
  // ./src/lib/types.d.ts
  export type JWTPayload = { sessionId: number }


  // be code
  import type { JWTPayload } from '@src/lib/types'
  import { jwtCreate, ttlWeek } from '@ace/jwtCreate'

  const jwt = await jwtCreate<JWTPayload>({ ttl: ttlWeek, payload: { userId: 42 } })
  ```
 * @param props.payload - The JSON-serializable payload for the jwt token
 * @param props.ttl - Time-to-live in seconds
 * @param props.secret - Optional, default is `process.env.JWT_SECRET`, the password/secret string required to create jwt's
 * @returns A signed JWT string using HS512
 */
export async function jwtCreate<T_JWTPayload extends BaseJWTPayload = {}>({ payload, ttl, secret }: JwtCreateProps<T_JWTPayload>): Promise<string> {
  if (ttl <= 0)  throw new Error('Please include a TTL > 0')

  const encoder = new TextEncoder()

  const header = { alg: 'HS512', typ: 'JWT' }

  const iat = Math.floor(Date.now() / 1000) // current time in seconds

  const exp = iat + ttl // expiration time in seconds

  const body = { ...payload, iat, exp }

  const headerB64 = base64UrlEncode(encoder.encode(JSON.stringify(header)))
  const bodyB64 = base64UrlEncode(encoder.encode(JSON.stringify(body)))

  const headerBodyBinary = encoder.encode(`${headerB64}.${bodyB64}`) // will be signed soon

  const secretBinary = encoder.encode(getEnv('JWT_SECRET', secret)) // will turn this into a key
  const cryptoKey = await crypto.subtle.importKey('raw', secretBinary, { name: 'HMAC', hash: 'SHA-512' }, false, ['sign'])    

  const sigBinary = await crypto.subtle.sign('HMAC', cryptoKey, headerBodyBinary)
  const sigB64 = base64UrlEncode(sigBinary)

  return `${headerB64}.${bodyB64}.${sigB64}` // final JWT
}



export type JwtCreateProps<T_JWTPayload extends BaseJWTPayload = {}> = {
  /** The JSON-serializable payload for the jwt token */
  payload: T_JWTPayload
  /** Time-to-live in seconds */
  ttl: number
  /** Optional, default is `process.env.JWT_SECRET`, the password/secret string required to create jwt's */
  secret?: string
}
