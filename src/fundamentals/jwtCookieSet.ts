/**
 * 🧚‍♀️ How to access:
 *     - import { jwtCookieSet } from '@ace/jwtCookieSet'
 */


import { env } from './env'
import { setCookie } from 'h3'
import { jwtCookieKey } from './vars'
import { jwtCreate, JwtCreateProps } from './jwtCreate'
import type { CookieSerializeOptions } from 'cookie-es'
import { getRequestEvent, HTTPEvent } from './getRequestEvent'


/**
 * ### Create JWT & store it in browser cookie
 * @param props.jwtCreateProps - Props sent to `jwtCreate()`
 * @param props.cookieOptions - Props sent to `setCookie()`. Typically not necessary b/c the defaults are very good. If no cookieOptions.expires is sent, we use `jwtCreateProps.ttl`
 * @param props.nativeEvent - We use `h3` to set/get/clear cookies. A `nativeEvent` is an `h3` event. @ an api the default `getRequestEvent().nativeEvent` will work, in middleware use `fetchEvent.nativeEvent`
 * @example
  ```ts
  import { ttlDay } from '@ace/jwtCreate'
  import { JWTPayload } from 'ace.config'

  const payload: JWTPayload = { sessionId }

  await jwtCookieSet({ jwtCreateProps: {ttl: ttlDay, payload} })
  ``` 
 */
export async function jwtCookieSet({ jwtCreateProps, cookieOptions, nativeEvent = getRequestEvent().nativeEvent }: JWTCookieSetProps) {
  const jwt = await jwtCreate(jwtCreateProps)

  return setCookie(nativeEvent, jwtCookieKey(), jwt, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: env !== 'local',
    expires: new Date(Date.now() + jwtCreateProps.ttl),
    ...cookieOptions,
  })
}


export type JWTCookieSetProps = {
  /** Props sent to `jwtCreate()` */
  jwtCreateProps: JwtCreateProps,
  /** Props sent to `setCookie()`. Typically not necessary b/c the defaults are very good. If no cookieOptions.expires is sent, we use `jwtCreateProps.ttl` */
  cookieOptions?: CookieSerializeOptions,
  /** We use `h3` to set/get/clear cookies. A `nativeEvent` is an `h3` event. @ an api the default `getRequestEvent().nativeEvent` will work, in middleware use `fetchEvent.nativeEvent` */
  nativeEvent?: HTTPEvent
}
