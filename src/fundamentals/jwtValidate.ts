/**
 * 🧚‍♀️ How to access:
 *     - import { jwtValidate } from '@ace/jwtValidate'
 *     - import type { JwtValidateProps, JwtValidateSuccess, JwtValidateFailure, JwtValidateResponse } from '@ace/jwtValidate'
 */


import type { FullJWTPayload } from './types'
import { base64UrlDecodeToBinary, base64UrlDecodeToString } from './base64UrlDecode'


/**
 * ### Validate a JWT in node or on the Edge (Cloudflare Workers)
 * @example
  ```ts
    const jwtResponse = await jwtValidate(jwt)
  ```
 * @param jwt - The jwt token to verify
 * @returns 
 * - A promise resolving to:  
 *     - `{ isValid: true; payload }` on success, payload automatically includes `iat` (issued time in seconds) & `exp` (expiration in seconds)
 *     - `{ isValid: falsem errorId, errorMessage }` on failure  
 */
export async function jwtValidate(jwt: string): Promise<JwtValidateResponse> {
  if (!process.env.JWT_SECRET) throw new Error('!process.env.JWT_SECRET')

  if (!jwt) return error('FALSY_JWT', 'JWT not provided')

  const parts = jwt.split('.')
  if (parts.length !== 3) return error('INVALID_PARTS', 'JWT must have 3 parts')
    
  const [headerB64, bodyB64, sigB64] = parts
  if (!headerB64 || !bodyB64 || !sigB64) return error('INVALID_PARTS', 'JWT must have 3 truthy parts')

  const encoder = new TextEncoder()

  const headerBodyBinary = encoder.encode(`${headerB64}.${bodyB64}`)
  const sigBinary = base64UrlDecodeToBinary(sigB64)
  const secretBinary = encoder.encode(process.env.JWT_SECRET)

  const cryptoKey = await crypto.subtle.importKey( 'raw', secretBinary, { name: 'HMAC', hash: 'SHA-512' }, false, ['verify'] )

  const isValid = await crypto.subtle.verify('HMAC', cryptoKey, sigBinary, headerBodyBinary)

  const payload = JSON.parse(base64UrlDecodeToString(bodyB64)) as FullJWTPayload

  if (!isValid) return error('INVALID_JWT', 'JWT is invalid', payload)

  const now = Math.floor(Date.now() / 1000)

  if (typeof payload.exp !== 'number') return error('INVALID_EXP', 'Exp must be a number', payload)

  if (payload.exp < now) return error('EXPIRED', 'Token is expired', payload)

  const jwtResponse: JwtValidateSuccess = {isValid: true, payload}

  return jwtResponse
}


export type JwtValidateSuccess = {
  isValid: true
  payload: FullJWTPayload
  errorId?: never
  errorMessage?: never
}

export type JwtValidateFailure = {
  isValid: false
  errorId: 'FALSY_JWT' | 'INVALID_PARTS' | 'INVALID_EXP' | 'INVALID_JWT' | 'EXPIRED'
  errorMessage: string
  payload?: FullJWTPayload
}


export type JwtValidateResponse = JwtValidateSuccess | JwtValidateFailure


const error = (errorId: JwtValidateFailure['errorId'], errorMessage: string, payload?: FullJWTPayload): JwtValidateFailure => ({isValid: false, errorId, errorMessage, payload })
