import { deleteCookie } from 'h3'
import { jwtCookieKey } from './vars'
import { getRequestEvent } from './getRequestEvent'


/**
 * ### Delete JWT stored in cookie
 * @example
  ```ts
  import type { JWTPayload } from '@src/lib/types'
  import { jwtCookieClear } from '@ace/jwtCookieClear'

  await jwtCookieClear()
  ```
 * @param nativeEvent - 🚨 We use `h3` to set/get/clear cookies. A `nativeEvent` is an `h3` event. When calling from an api there is no need to pass a `nativeEvent`. When calling from a `b4()` function it's necessary to pass `event.nativeEvent`, example: `jwtCookieClear(event.nativeEvent)`
 */
export function jwtCookieClear(nativeEvent = getRequestEvent().nativeEvent) {
  deleteCookie(nativeEvent, jwtCookieKey(), { path: '/' })
}
