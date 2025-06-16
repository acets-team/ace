import { setCookie } from 'h3'
import { jwtCookieKey } from './vars'
import type { CookieSerializeOptions } from 'cookie-es'
import { jwtCreate, JwtCreateProps } from './jwtCreate'
import { getRequestEvent, HTTPEvent } from './getRequestEvent'


export async function jwtCookieSet({ jwtCreateProps, cookieOptions, nativeEvent = getRequestEvent().nativeEvent }: { jwtCreateProps: JwtCreateProps, cookieOptions?: CookieSerializeOptions, nativeEvent?: HTTPEvent }) {
  const jwt = await jwtCreate(jwtCreateProps)

  return setCookie(nativeEvent, jwtCookieKey(), jwt, {
    path: '/',
    httpOnly: true,
    sameSite: 'lax',
    secure: process.env.ENV !== 'local',
    expires: new Date(Date.now() + jwtCreateProps.ttl),
    ...cookieOptions,
  })
}
