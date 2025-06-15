/**
 * 🧚‍♀️ How to access:
 *     - import { base64UrlEncode } from '@ace/base64UrlEncode'
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
export function base64UrlEncode(data: ArrayBuffer | Uint8Array): string {
  const bytes = data instanceof Uint8Array ? data : new Uint8Array(data)
  const b64 = btoa(String.fromCharCode(...bytes))
  return b64.replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
