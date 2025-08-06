/**
 * 🧚‍♀️ How to access:
 *     - import { jwtCookieSet } from '@ace/jwtCookieSet'
 */


import { env } from './env'
import { setCookie } from 'h3'
import { jwtCookieKey } from './vars'
import type { BaseJWTPayload } from './types'
import { jwtCreate, JwtCreateProps } from './jwtCreate'
import type { CookieSerializeOptions } from 'cookie-es'
import { getRequestEvent, HTTPEvent } from './getRequestEvent'


/**
 * ### Create JWT & store it in browser cookie
 * @example
  ```ts
  // ./src/lib/types.d.ts
  export type JWTPayload = { sessionId: string }


  // be code
  import { ttlDay } from '@ace/jwtCreate'
  import type { JWTPayload } from '@src/lib/types'

  const payload: JWTPayload = { sessionId }

  const jwt = await jwtCookieSet<JWTPayload>({ jwtCreateProps: {ttl: ttlDay * 3, payload} })
  ``` 
 * @param props.jwtCreateProps - Props sent to `jwtCreate()`
 * @param props.cookieOptions - Props sent to `setCookie()`. Typically not necessary b/c the defaults are very good. If no cookieOptions.expires is sent, we use `jwtCreateProps.ttl`
 * @param nativeEvent - 🚨 We use `h3` to set/get/clear cookies. A `nativeEvent` is an `h3` event. When calling from an api there is no need to pass a `nativeEvent`. When calling from a `b4()` function it's necessary to pass `event.nativeEvent`, example: `jwtCookieSet({ nativeEvent: event.nativeEvent })`
 */
export async function jwtCookieSet<T_JWTPayload extends BaseJWTPayload = {}>({ jwtCreateProps, cookieOptions, nativeEvent = getRequestEvent().nativeEvent }: JWTCookieSetProps<T_JWTPayload>): Promise<string> {
  const jwt = await jwtCreate<T_JWTPayload>(jwtCreateProps)

  setCookie(nativeEvent, jwtCookieKey(), jwt, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: env !== 'local',
    maxAge: jwtCreateProps.ttl,
    ...cookieOptions,
  })

  return jwt
}


export type JWTCookieSetProps<T_JWTPayload extends BaseJWTPayload = {}> = {
  /** Props sent to `jwtCreate()` */
  jwtCreateProps: JwtCreateProps<T_JWTPayload>,
  /** Props sent to `setCookie()`. Typically not necessary b/c the defaults are very good. If no cookieOptions.expires is sent, we use `jwtCreateProps.ttl` */
  cookieOptions?: CookieSerializeOptions,
  /** 🚨 We use `h3` to set/get/clear cookies. A `nativeEvent` is an `h3` event. When calling from an api there is no need to pass a `nativeEvent`. When calling from a `b4()` function it's necessary to pass `event.nativeEvent`, example: `jwtCookieSet({ nativeEvent: event.nativeEvent }) */
  nativeEvent?: HTTPEvent
}
