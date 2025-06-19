/**
 * 🧚‍♀️ How to access:
 *     - import { jwtCookieGet } from '@ace/jwtCookieGet'
 */


import { getCookie } from 'h3'
import { jwtCookieKey } from './vars'
import { getRequestEvent } from './getRequestEvent'
import { jwtValidate, type JwtValidateResponse } from './jwtValidate'


/**
 * ### Get JWT stored in cookie
 * @param nativeEvent - We use `h3` to set/get/clear cookies. A `nativeEvent` is an `h3` event. @ an api the default `getRequestEvent().nativeEvent` will work, in middleware use `fetchEvent.nativeEvent`
 * @example
  ```ts
  const jwt = await jwtCookieGet()

  if (jwt.errorId === 'EXPIRED' && jwt.payload?.sessionId) { // delete expired in db
    await db().delete(sessions).where(eq(sessions.id, jwt.payload.sessionId))
  }
  ```
 */
export async function jwtCookieGet(nativeEvent = getRequestEvent().nativeEvent): Promise<JwtValidateResponse> {
  return await jwtValidate(getCookie(nativeEvent, jwtCookieKey()) ?? '')
}
