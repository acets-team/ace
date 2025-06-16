import { deleteCookie } from 'h3'
import { jwtCookieKey } from './vars'
import { getRequestEvent } from './getRequestEvent'


export function jwtCookieClear(nativeEvent = getRequestEvent().nativeEvent) {
  deleteCookie(nativeEvent, jwtCookieKey(), { path: '/' })
}
