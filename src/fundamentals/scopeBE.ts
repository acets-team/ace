import { config } from 'ace.config'
import { AceError } from './aceError'
import { buildUrl } from '../buildUrl'
import { env, configOrigins } from './env'
import { type RequestEvent } from 'solid-js/web'
import { getRequestEvent } from './getRequestEvent'
import { goHeaderName, goStatusCode } from './vars'
import { destructureReady } from './destructureReady'
import type { CookieSerializeOptions } from 'cookie-es'
import { setCookie, getCookie, deleteCookie } from 'h3'
import type { ApiBody, ApiResponse, UrlSearchParams, UrlPathParams, AceResponse, Routes, RoutePath2PathParams, RoutePath2SearchParams, BaseEventLocals } from './types'



/** Base scope for both API and middleware scopes */
export class ScopeBE<T_Params extends UrlPathParams = {}, T_Search extends UrlSearchParams = {}, T_Body extends ApiBody = {}, T_Locals extends BaseEventLocals = {}> {
  readonly body: T_Body
  readonly pathParams: T_Params
  readonly searchParams: T_Search
  defaultHeaders: Record<string, string>
  readonly event: RequestEvent & { locals: T_Locals }


  constructor(params: T_Params, search: T_Search, body: T_Body) {
    this.body = body
    this.pathParams = params
    this.searchParams = search
    this.event = getRequestEvent() as RequestEvent & { locals: T_Locals }
    this.defaultHeaders = {
      'Access-Control-Expose-Headers': goHeaderName,
      ...this.#getCorsHeaders(),
    }
    destructureReady(this)
  }



  /**
   * - The origin of the current HTTP request URL
   * - Helps us:
   *     - Know where the current request was received
   * - Ideal for:
   *     - Creating absolute run time urls on the BE that match the active server (ex: magic link)
   *     - CORS Validation (ensure requestUrlOrigin matches allowed configOrigins)
   */
  get requestUrlOrigin(): string {
    return new URL(this.event.request.url).origin
  }


  #getCorsHeaders(): Record<string, string> {
    const headers: Record<string, string> = {'Referrer-Policy': 'strict-origin-when-cross-origin'}

    // let origins = config.origins[env]
    if (!configOrigins.size) throw new Error(`!config.origins.${env} - set origins in ace.config.js, to a string or an array of strings`)
    
    if (configOrigins.has('*')) {
      if (configOrigins.size > 1) throw new Error(`config.origins.${env} has a wildcard AND multiple values set which is not allowed from an http spec perspective`)
      else { // no allow credentials header when doing * b/c http spec
        headers['Access-Control-Allow-Origin'] = '*'
        return headers
      }
    }

    if (!configOrigins.has(this.requestUrlOrigin)) throw new Error(configOrigins.size === 1 ? `Your request url origin is "${this.requestUrlOrigin}" but the allowed origin is "${configOrigins.values().next().value}"` : `Your origin is "${this.requestUrlOrigin}" but the allowed origins are "${Array.from(configOrigins).join(', ')}"`)
    else { // if request origin in allow list => echo it back
      headers.Vary = 'Origin'
      headers['Access-Control-Allow-Origin'] = this.requestUrlOrigin
      headers['Access-Control-Allow-Credentials'] = 'true'
      return headers
    }
  }



  /**
   * ### Builds a `Response` based on the provided options
   * @param props.data - Optional, data to respond w/, can be in the response w/ `props.error` too
   * @param props.error - Optional, AceError to respond w/, can be in the response w/ `props.error` too
   * @param props.go - Optional, redirect to respond w/, when this is set, data & error are not in the response
   * @param props.status - Optional, default is 200, HTTP status
   * @param props.headers - Optional, HTTP headers, see `scope.defaultHeaders` to see/update the default headers, and this prop overrides `this.defaultHeaders`
   * @returns - `Response` based on options
   */
  respond<T_Data, T_Path extends Routes>({data, error, path, pathParams, searchParams, status = 200, headers}: { data?: T_Data, error?: AceError, path?: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, status?: number, headers?: HeadersInit }): AceResponse<T_Data> {
    if (path) return this.#giveRedirect(path, {pathParams, searchParams, headers})
    else return this.#giveJSON(status, data ?? null, error ?? null, headers)
  }


  #giveRedirect<T_Path extends Routes>(path: T_Path, options?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, headers?: HeadersInit }) {
    const url = this.requestUrlOrigin + buildUrl(path, {pathParams: options?.pathParams, searchParams: options?.searchParams})

    return new Response(JSON.stringify({[goHeaderName]: url}), {
      status: goStatusCode,
      headers: {
        ...this.defaultHeaders,
        [goHeaderName]: url,
        ...options?.headers
      }
    })
  }


  #giveJSON<T_Data>(status: number, data: T_Data | null, error: AceError | null, headers?: HeadersInit) {
    const responseJSON: ApiResponse<T_Data> = {}

    if (data !== null && data !== undefined) responseJSON.data = data
    if (error) responseJSON.error = error.get().error

    const res: AceResponse<T_Data> = new Response(JSON.stringify(responseJSON), {
      status,
      headers: { ...this.defaultHeaders, ...headers, 'Content-Type': 'application/json' }
    })

    res.__dataType = null as T_Data

    return res
  }


  /**
   * Creates a success `Response` w/ simple options, for all options please call `scope.respond()`, & to update default headers update `scope.defaultHeaders` or call `scope.respond()`
   * @param data - Response data that is available @ `res.data`
   * @param status - Optional, HTTP Response Status, Defaults to `200`
   * @returns - An API Response of type `AceResponse<T_Data>`
   */
  success<T_Data>(data?: T_Data, status = 200): AceResponse<T_Data> {
    return this.respond({ data, status })
  }


  /**
   * Creates an error `Response` w/ simple options, for all options please call `scope.respond()`, & to update default headers update `scope.defaultHeaders` or call `scope.respond()`
   * @param message - String message describing the error which is available @ `res.error.message`
   * @param status - Optional, HTTP Response Status, Defaults to `400`
   * @returns - Error `Response`
   */
  error(message: string, status = 400): AceResponse<null> {
    return this.respond({ error: new AceError({ message }), status })
  }


  /**
   * Creates a redirect `Response` w/ simple options, for all options please call `scope.respond()`, & to update default headers update `scope.defaultHeaders` or call `scope.respond()`
   * @param path - Path to redirect to, as written @ new Route()
   * @param params.pathParams - Optional or required dependding on the path
   * @param params.searchParams - Optional or required dependding on the path
   * @returns Redirect `Response`
   */
  go<T_Path extends Routes>(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }): AceResponse<null> {
    return this.respond({ path, pathParams: params?.pathParams, searchParams: params?.searchParams })
  }


  /** 
   * - Set a cookie
   * @example
    ```ts
    import { msWeek } from '@ace/ms'
    import { jwtCreate } from '@ace/jwtCreate'
    import { jwtCookieName } from '@src/lib/vars'

    scope.setCookie(jwtCookieName, await jwtCreate({ ttl: msWeek, payload }), { maxAge: msWeek })
    ```
   * @param name - Cookie name
   * @param value - Cookie value
   * @param options - `CookieSerializeOptions` from `cookie-es`, `options` passed to setCookie => `{ path: '/', httpOnly: true, sameSite: 'lax', secure: env !== 'local', ...options }`
   * @link https://www.npmjs.com/package/cookie-es
   * @link https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Set-Cookie 
   */
  setCookie(name: string, value: string, options?: CookieSerializeOptions) {
    return setCookie(this.event.nativeEvent, name, value, {
      path: '/',
      httpOnly: true,
      sameSite: 'lax',
      secure: env !== 'local',
      ...options
    })
  }


  /** 
   * - Get a cookie value by name
   * @example getCookie('jwt')
   */
  getCookie(name: string) {
    return getCookie(this.event.nativeEvent, name)
  }


  /** 
   * - Delete a cookie by name
   * @example clearCookie('jwt')
   */
  clearCookie(name: string) {
    return deleteCookie(this.event.nativeEvent, name)
  }


  /**
   * ### Helpful when you'd love to create an Ace Live Server `event`
   * @example
      ```ts
      const res = await scope.liveEvent({
        stream: 'example',
        data: { example: true },
        requestInit: { headers: { LIVE_SECRET: process.env.LIVE_SECRET } }, // Optional, is merged w/ the `defaultInit` of `{ method: 'POST', body: JSON.stringify(props.data), headers: { 'Content-Type': 'application/json' } }`
      })

      // ace.config.js ❤️ Prerequisite
      export const config = {
        liveHosts: {
          local: 'localhost:8787',
        }
      }
      ```
  * @param props.stream - The `stream` to subscribe to
  * @param props.data - Event data, the entire object will be provided to `/subscribe`
  * @param props.requestInit - Optional, is merged w/ the `defaultInit` of `{ method: 'POST', body: JSON.stringify(props.data), headers: { 'Content-Type': 'application/json' } }`
  */
  async liveEvent(props: { stream: string, data: object, requestInit?: Partial<RequestInit> }): Promise<Response> {
    const url = config.liveHosts?.[env]
    if (!url) throw new Error(`ace.config.js > liveHosts > "${env}" is undefined`)

    const defaultInit: RequestInit = {
      method: 'POST',
      body: JSON.stringify(props.data),
      headers: { 'Content-Type': 'application/json' },
    }

    const mergedInit: RequestInit = {
      ...defaultInit,
      ...props.requestInit,
      headers: {
        ...(defaultInit.headers || {}),
        ...(props.requestInit?.headers || {}),
      },
    }

    return fetch(`http${url.includes('localhost') ? '' : 's'}://${url}/event?stream=${encodeURIComponent(props.stream)}`, mergedInit)
  }
}


export type RespondProps<T_Data> = {
  /** Optional, data to respond w/, can be in the response w/ `props.error` too */
  data?: T_Data,
  /** Optional, AceError to respond w/, can be in the response w/ `props.error` too */
  error?: AceError,
  /** Optional, redirect to respond w/, when this is set, data & error are not in the response */
  go?: string,
  /** HTTP status */
  status: number,
  /** Optional, HTTP headers, automatically adds a content type of application json when go is not set */
  headers?: HeadersInit
}
