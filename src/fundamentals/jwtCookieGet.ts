/**
 * 🧚‍♀️ How to access:
 *     - import { jwtCookieGet } from '@ace/jwtCookieGet'
 */


import { getCookie } from 'h3'
import { jwtCookieKey } from './vars'
import { jwtValidate } from './jwtValidate'
import { getRequestEvent } from './getRequestEvent'
import type { BaseJWTPayload, JWTValidateResponse } from './types'


/**
 * ### Get JWT stored in cookie
 * @example
  ```ts
  // ./src/lib/types.d.ts
  export type JWTPayload = { sessionId: string }


  // be code
  import { jwtCookieGet } from '@ace/jwtCookieGet'
  import type { JWTPayload } from '@src/lib/types'

  const {isValid, payload, errorId, errorMessage} = await jwtCookieGet<JWTPayload>()
  ```
 * @param nativeEvent - 🚨 We use `h3` to set/get/clear cookies. A `nativeEvent` is an `h3` event. When calling from an api there is no need to pass a `nativeEvent`. When calling from a `b4()` function it's necessary to pass `event.nativeEvent`, example: `jwtCookieGet(event.nativeEvent)`
 */
export async function jwtCookieGet<T_JWTPayload extends BaseJWTPayload = {}>(nativeEvent = getRequestEvent().nativeEvent): Promise<JWTValidateResponse<T_JWTPayload>> {
  return await jwtValidate<T_JWTPayload>(getCookie(nativeEvent, jwtCookieKey()) ?? '')
}
