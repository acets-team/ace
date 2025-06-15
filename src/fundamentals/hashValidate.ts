/**
 * 🧚‍♀️ How to access:
 *     - import { hashValidate } from '@ace/hashValidate'
 *     - import type { HashValidateProps, HashValidateSuccess, HashValidateFailure, HashValidateResponse } from '@ace/hashValidate'
 */


import { base64UrlDecodeToBinary } from './base64UrlDecode'



/**
 * ### Validate a hash in node or on the Edge (Cloudflare Workers)
 * @example
  ```ts
    const hashResponse = await hashValidate({ hash, crypto, password: 'example' })
  ```
 * @param props.password - The plaintext password to validate agains the hash
 * @param props.hash - Hash string response from `hashCreate()`
 * @param props.crypto - A Web Crypto instance (e.g. `globalThis.crypto` or Node’s `webcrypto`)
 * @returns 
 * - A promise resolving to:  
 *     - `{ isValid: true }` on success
 *     - `{ isValid: false, errorId, errorMessage }` on failure  
 */
export async function hashValidate({ password, hash, crypto: cryptoObj }: HashValidateProps): Promise<HashValidateResponse> {
  const [algorithm, hashFn, iterationsString, saltB64, reqHashB64] = hash.split('$')

  if (algorithm !== 'PBKDF2') return error('INVALID_ALGORITHM', `Unsupported hash type: ${algorithm}`)
  if (!saltB64) return error('FALSY_SALT', 'Salt in hash must be truthy')
  if (!reqHashB64) return error('FALSY_HASH_FN', 'Hash Function in hash must be truthy')

  const iterations = parseInt(iterationsString ?? '', 10)
  if (isNaN(iterations) || iterations <= 0) return error('INVALID_ITERATIONS', `Invalid iterations in hash, current: ${iterationsString}`)

  const encoder = new TextEncoder()

  const passwordBinary = encoder.encode(password)

  const salt = base64UrlDecodeToBinary(saltB64)

  const cryptoKey = await cryptoObj.subtle.importKey( 'raw', passwordBinary, 'PBKDF2', false, ['deriveBits'] )

  const correctHashBinary = await cryptoObj.subtle.deriveBits( { name: 'PBKDF2', salt, iterations, hash: hashFn }, cryptoKey, hashFn === 'SHA-512' ? 512 : 256 )

  const correctHashBinaryArray = new Uint8Array(correctHashBinary) // a binary typed array is easier to compare / loop through then a raw contiguous binary buffer

  const reqHashBinaryArray = base64UrlDecodeToBinary(reqHashB64)

  if (correctHashBinaryArray.length !== reqHashBinaryArray.length) return error('INVALID_HASH', 'Hash length is incorrect')

  let isPasswordIncorrect = false

  for (let i = 0; i < correctHashBinaryArray.length; i++) {
    /**
     * - The ^ operator is a bitwise XOR (exclusive OR)
     *    - If any bits differ between the two bytes, the result will be non-zero
     * - & no early return or break is used to maintain consistent loop timing so attackers can't inferr where a mismatch occurred based on response time
     */
    if (0 !== ((correctHashBinaryArray[i] || 0) ^ (reqHashBinaryArray[i] || 0))) isPasswordIncorrect = true
  }

  if (isPasswordIncorrect) return error('INVALID_PASSWORD', 'Password is not correct')

  return { valid: true }
}



export type HashValidateProps = {
  /** The plaintext password to validate agains the hash */
  password: string
  /** Hash string response from `hashCreate()` */
  hash: string
  /** A Web Crypto instance (e.g. `globalThis.crypto` or Node’s `webcrypto`) */
  crypto: Crypto
}



export type HashValidateSuccess = { valid: true }

export type HashValidateFailure = {
  valid: false
  errorId: 'INVALID_ALGORITHM' | 'FALSY_SALT' | 'FALSY_HASH_FN' | 'INVALID_ITERATIONS' | 'INVALID_HASH' | 'INVALID_PASSWORD'
  errorMessage: string
}

export type HashValidateResponse = HashValidateSuccess | HashValidateFailure



const error = (errorId: HashValidateFailure['errorId'], errorMessage: string): HashValidateFailure => ({valid: false, errorId, errorMessage })
