import { getOrigin } from './getOrigin'
import type { RequestEvent } from 'solid-js/web'
import type { CookieSerializeOptions } from 'cookie-es'
import { setCookie, getCookie, deleteCookie } from 'h3'
import type { ApiBody, UrlPathParams, UrlSearchParams, BaseEventLocals } from './fundamentals/types'


export class ScopeB4<T_Locals extends BaseEventLocals = {}> {
  readonly body: ApiBody
  readonly event: RequestEvent & { locals: T_Locals }
  readonly searchParams: UrlSearchParams
  readonly pathParams: UrlPathParams

  constructor(event: RequestEvent & { locals: T_Locals }, pathParams: UrlPathParams, searchParams: UrlSearchParams, body: ApiBody) {
    this.event = event
    this.pathParams = pathParams
    this.searchParams = searchParams
    this.body = body
  }

  /**  Like doing `window.location.origin` on the `fe`, which gives back `http://localhost:3000` or `https://example.com` */
  get origin() {
    return getOrigin(this.event)
  }


  getCookie = (name: string) => getCookie(this.event.nativeEvent, name)
  clearCookie = (name: string) => deleteCookie(this.event.nativeEvent, name)
  /** @example setCookie('Lovely', 'Yes', { maxAge: ttlWeek, httpOnly: true, sameSite: 'lax' }) */
  setCookie = (name: string, value: string, serializeOptions?: CookieSerializeOptions) => setCookie(this.event.nativeEvent, name, value, serializeOptions)
}
