/**
 * 🧚‍♀️ How to access:
 *     - import { jwtValidate } from '@ace/jwtValidate'
 */


import { base64UrlDecodeToBinary, base64UrlDecodeToString } from './base64UrlDecode'
import type { FullJWTPayload, JWTValidateResponse, JWTValidateFailure, JWTValidateSuccess, BaseJWTPayload } from './types'


/**
 * ### Validate a JWT in node or on the Edge (Cloudflare Workers)
 * @example
  ```ts
    // ./src/lib/types.d.ts
    export type JWTPayload = { sessionId: string }


    // be code
    import { jwtValidate } from '@ace/jwtValidate'
    import type { JWTPayload } from '@src/lib/types'

    const { isValid, payload, errorId, errorMessage } = await jwtValidate<JWTPayload>(jwt)
  ```
 * @param jwt - The jwt token to verify
 * @returns 
 * - A promise resolving to:  
 *     - `{ isValid: true; payload }` on success, payload automatically includes `iat` (issued time in seconds) & `exp` (expiration in seconds)
 *     - `{ isValid: falsem errorId, errorMessage }` on failure  
 */
export async function jwtValidate<T_JWTPayload extends BaseJWTPayload = {}>(jwt: string): Promise<JWTValidateResponse<T_JWTPayload>> {
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

  const payload = JSON.parse(base64UrlDecodeToString(bodyB64)) as FullJWTPayload<T_JWTPayload>

  if (!isValid) return error('INVALID_JWT', 'JWT is invalid', payload)

  const now = Math.floor(Date.now() / 1000)

  if (typeof payload.exp !== 'number') return error('INVALID_EXP', 'Exp must be a number', payload)

  if (payload.exp < now) return error('EXPIRED', 'Token is expired', payload)

  const jwtResponse: JWTValidateSuccess<T_JWTPayload> = {isValid: true, payload}

  return jwtResponse
}


function error<T_JWTPayload extends BaseJWTPayload = {}>(errorId: JWTValidateFailure['errorId'], errorMessage: string, payload?: FullJWTPayload<T_JWTPayload>): JWTValidateFailure<T_JWTPayload> {
  return {isValid: false, errorId, errorMessage, payload }
}
