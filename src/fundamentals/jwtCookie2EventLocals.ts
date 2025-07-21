/**
 * 🧚‍♀️ How to access:
 *     - import { jwtCookie2EventLocals } from '@ace/jwtCookie2EventLocals'
 */


import { jwtCookieGet } from './jwtCookieGet'
import type { RequestEvent } from 'solid-js/web'


/**
 * - Typically used @ b4 aka middleware
 * - When you'd love to validate a jwt token in the cookie and put that validate response onto event.locals
 * - So downstream b4's can read `event.locals.jwt` and the downstream route/api can also read the `event.locals.jwt` value
 * @example
  ```ts
  // ./src/lib/types.d.ts
  import type { JWTValidateResponse } from '@ace/types'

  export type JWTPayload = { sessionId: string }

  export type JWTResponse = JWTValidateResponse<JWTPayload>


  // ./src/lib/b4.ts
  import type { B4 } from '@ace/types'
  import type { JWTResponse } from '@src/lib/types'

  export const authB4: B4<JWTResponse> = async ({event}) => {
    await jwtCookie2EventLocals(event)
    if (!event.locals.jwt.isValid) return go('/sign-in/:messageId?', { pathParams: {messageId: '1'} })
  }
  ```
 * @param event - The `event` that is passed to each `b4()` function
 */
export async function jwtCookie2EventLocals(event: RequestEvent) {
  event.locals.jwt = await jwtCookieGet(event.nativeEvent)
}
