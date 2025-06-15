/**
 * 🧚‍♀️ How to access:
 *     - import { base64UrlDecode } from '@ace/base64UrlDecode'
 */


/** 
 * Base664Url to Binary
 * @example
  ```ts
  const str = "aloha"
  const b64url = base64UrlEncode(new TextEncoder().encode(str))
  const decodedStr = base64UrlDecodeToString(b64url) // "aloha"
  const binary = base64UrlDecodeToBinary(b64url)     // Uint8Array(11) [104, 101, 108, 108, ...]
  ```
 */
export function base64UrlDecodeToBinary(b64url: string): Uint8Array {
  const str = base64UrlDecodeToString(b64url)
  const out = new Uint8Array(str.length)

  for (let i = 0; i < str.length; i++) {
    out[i] = str.charCodeAt(i)
  }

  return out
}


/** 
 * Base664Url to String
 * @example
  ```ts
  const str = '{"userId":42,"iat":1700000000,"exp":1700086400}'
  const b64url = base64UrlEncode(new TextEncoder().encode(str))
  const decodedStr = base64UrlDecodeToString(b64url) // '{"userId":42,"iat":1700000000,"exp":1700086400}'
  ```
 */
export function base64UrlDecodeToString(b64url: string): string {
  const b64 = b64url.replace(/-/g, '+').replace(/_/g, '/') + '='.repeat((4 - (b64url.length % 4)) % 4) // restore padding
  return atob(b64)
}
