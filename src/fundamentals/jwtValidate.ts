/**
 * 🧚‍♀️ How to access:
 *     - import { jwtValidate } from '@ace/jwtValidate'
 *     - import type { JwtValidateProps, JwtValidateSuccess, JwtValidateFailure, JwtValidateResponse } from '@ace/jwtValidate'
 */


import { base64UrlDecodeToBinary, base64UrlDecodeToString } from './base64UrlDecode'


/**
 * ### Validate a JWT in node or on the Edge (Cloudflare Workers)
 * @example
  ```ts
    if (!process.env.JWT_SECRET) throw new Error('!process.env.JWT_SECRET')

    const jwtResponse = await jwtValidate({
      jwt,
      crypto,
      secret: process.env.JWT_SECRET,
    })
  ```
 * @param props.jwt - The jwt token to verify
 * @param props.crypto - A Web Crypto instance (e.g. `globalThis.crypto` or Node’s `webcrypto`)
 * @param props.secret - Secret from .env, to create we recomend bash: `openssl rand -base64 64`
 * @returns 
 * - A promise resolving to:  
 *     - `{ isValid: true; payload }` on success, payload automatically includes `iat` (issued time in seconds) & `exp` (expiration in seconds)
 *     - `{ isValid: falsem errorId, errorMessage }` on failure  
 */
export async function jwtValidate({ jwt, crypto: cryptoObj, secret }: JwtValidateProps): Promise<JwtValidateResponse> {
  if (!secret) return error('FALSY_SECRET', 'JWT secret is required')

  const parts = jwt.split('.')
  if (parts.length !== 3) return error('INVALID_JWT', 'JWT must have 3 parts')
    
  const [headerB64, bodyB64, sigB64] = parts
  if (!headerB64 || !bodyB64 || !sigB64) return error('INVALID_JWT', 'JWT must have 3 truthy parts')

  const encoder = new TextEncoder()

  const headerBodyBinary = encoder.encode(`${headerB64}.${bodyB64}`)
  const sigBinary = base64UrlDecodeToBinary(sigB64)
  const secretBinary = encoder.encode(secret)

  const cryptoKey = await cryptoObj.subtle.importKey( 'raw', secretBinary, { name: 'HMAC', hash: 'SHA-512' }, false, ['verify'] )

  const isValid = await cryptoObj.subtle.verify('HMAC', cryptoKey, sigBinary, headerBodyBinary)
  if (!isValid) return error('INVALID_JWT', 'JWT is invalid')

  const bodyJSON = JSON.parse(base64UrlDecodeToString(bodyB64)) as Record<string, unknown>

  const now = Math.floor(Date.now() / 1000)

  if (typeof bodyJSON.exp === 'number' && bodyJSON.exp < now) return error('EXPIRED', 'Token is expired')

  return {isValid: true, payload: bodyJSON}
}



export type JwtValidateProps = {
  /** The jwt token to verify */
  jwt: string
  /** A Web Crypto instance (e.g. `globalThis.crypto` or Node’s `webcrypto`) */
  crypto: Crypto
  /** Secret from .env, to create we recomend bash: `openssl rand -base64 64` */
  secret: string
}


export type JwtValidateSuccess = {
  isValid: true
  payload: Record<string, unknown>
}

export type JwtValidateFailure = {
  isValid: false
  errorId: 'FALSY_SECRET' | 'INVALID_JWT' | 'EXPIRED'
  errorMessage: string
}


export type JwtValidateResponse = JwtValidateSuccess | JwtValidateFailure


const error = (errorId: JwtValidateFailure['errorId'], errorMessage: string): JwtValidateFailure => ({isValid: false, errorId, errorMessage })
