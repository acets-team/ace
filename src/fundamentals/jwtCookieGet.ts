import { getCookie } from 'h3'
import { jwtCookieKey } from './vars'
import { getRequestEvent } from './getRequestEvent'
import { jwtValidate, type JwtValidateResponse } from './jwtValidate'


export async function jwtCookieGet(nativeEvent = getRequestEvent().nativeEvent): Promise<JwtValidateResponse> {
  return await jwtValidate(getCookie(nativeEvent, jwtCookieKey()) ?? '')
}
