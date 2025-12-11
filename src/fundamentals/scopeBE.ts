import { config } from 'ace.config'
import { mapRoutes } from './mapRoutes'
import { env, configOrigins } from './env'
import { createAceKey } from './createAceKey'
import { getRequestEvent } from './getRequestEvent'
import { goHeaderName, goStatusCode } from './vars'
import { destructureReady } from './destructureReady'
import type { CookieSerializeOptions } from 'cookie-es'
import { setCookie, getCookie, deleteCookie } from 'h3'
import { createAceResponse, type AceResponse } from './aceResponse'
import type { BaseApiReq, Routes, RoutePath2PathParams, RoutePath2SearchParams, BaseEventLocals, ApiReq2Body, ApiReq2PathParams, ApiReq2SearchParams, AceResData, AceResError, AceKey } from './types'



/** Base scope for both API and B4 (middleware) scopes */
export class ScopeBE<T_Req extends BaseApiReq = {}, T_Locals extends BaseEventLocals = {}> {
  readonly body: ApiReq2Body<T_Req>
  readonly pathParams: ApiReq2PathParams<T_Req>
  readonly searchParams: ApiReq2SearchParams<T_Req>
  defaultHeaders: Record<string, string>
  readonly event: Omit<ReturnType<typeof getRequestEvent>, 'locals'> & { locals: T_Locals }


  constructor(request: T_Req) {
    this.body = (request.body ?? {}) as ApiReq2Body<T_Req>
    this.pathParams = (request.pathParams ?? {}) as ApiReq2PathParams<T_Req>
    this.searchParams = (request.searchParams ?? {}) as ApiReq2SearchParams<T_Req>
    this.event = getRequestEvent() as Omit<ReturnType<typeof getRequestEvent>, 'locals'> & { locals: T_Locals }
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
  respond<T_Res_Data extends AceResData, T_Path extends Routes>( // Overload: Success case (data provided)
    props: { data: T_Res_Data, error?: null, path?: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, status?: number, headers?: HeadersInit }
  ): AceResponse<T_Res_Data>

  respond<T_Path extends Routes>( // Overload: Error case (data is null)
    props: { data?: null | undefined, error: AceResError, path?: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, status?: number, headers?: HeadersInit }
  ): AceResponse<null>

  respond<T_Path extends Routes>( // Overload: Redirect case (data is undefined)
    props: { path: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, status?: number, headers?: HeadersInit }
  ): AceResponse<undefined>

  respond<T_Res_Data extends AceResData, T_Path extends Routes>({ data, error, path, pathParams, searchParams, status = 200, headers }: { data?: T_Res_Data, error?: AceResError | null, path?: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, status?: number, headers?: HeadersInit }): AceResponse<T_Res_Data | null | undefined> { // Implementation: (broadest possible type)
    if (path) return this.#giveRedirect(path, { pathParams, searchParams, headers })

    return createAceResponse(error ? { error, data: null } : { data, error: null }, {
      status,
      headers: { ...this.defaultHeaders, ...headers }
    })
  }

  #giveRedirect<T_Path extends Routes>(path: T_Path, options?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, headers?: HeadersInit }): AceResponse<undefined> {
    let url = this.requestUrlOrigin

    const entry = mapRoutes[path]

    if (entry) {
      this.requestUrlOrigin + entry.buildUrl({ pathParams: options?.pathParams, searchParams: options?.searchParams })
    }

    return new Response(JSON.stringify({[goHeaderName]: url}), {
      status: goStatusCode,
      headers: {
        ...this.defaultHeaders,
        ...options?.headers,
        [goHeaderName]: url,
      }
    })
  }


  /**
   * Creates a success `Response` w/ simple options, for all options please call `scope.respond()`, & to update default headers update `scope.defaultHeaders` or call `scope.respond()`
   * @param data - Response data that is available @ `res.data`
   * @param status - Optional, HTTP Response Status, Defaults to `200`
   * @returns - An API Response of type `AceResponse<T_Data>`
   */
  
  success<T_Res_Data extends AceResData>(data: T_Res_Data, status?: number): AceResponse<T_Res_Data> // Overload: Data is provided

  
  success(data?: undefined, status?: number): AceResponse<undefined> // Overload: Data is omitted

  // Implementation: (broadest possible type)
  success<T_Res_Data extends AceResData>(data?: T_Res_Data, status = 200): AceResponse<T_Res_Data | undefined> {
    return this.respond({ data: data as T_Res_Data, status }) as AceResponse<T_Res_Data | undefined> // the overloads above ensure the correct type is inferred for the caller
  }


  /**
   * Creates an error `Response` w/ simple options, for all options please call `scope.respond()`, & to update default headers update `scope.defaultHeaders` or call `scope.respond()`
   * @param message - String message describing the error which is available @ `res.error.message`
   * @param status - Optional, HTTP Response Status, Defaults to `400`
   * @returns - Error `Response`
   */
  error(message: string, status = 400): AceResponse<null> {
    return this.respond({ error: {message}, status })
  }


  /**
   * Creates a redirect `Response` w/ simple options, for all options please call `scope.respond()`, & to update default headers update `scope.defaultHeaders` or call `scope.respond()`
   * @param path - Path to redirect to, as written @ new Route()
   * @param params.pathParams - Optional or required dependding on the path
   * @param params.searchParams - Optional or required dependding on the path
   * @returns Redirect `Response`
   */
  go<T_Path extends Routes>(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }): AceResponse<null> {
    return this.respond({ data: null, path, pathParams: params?.pathParams, searchParams: params?.searchParams })
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
        // events are grouped into streams
        // streams can be a string or a tuple
        stream: ['chatRoom', id],
        data: { aloha: true },
        requestInit: { headers: { LIVE_SECRET: process.env.LIVE_SECRET } }, // Optional, is merged w/ the `defaultInit` of `{ method: 'POST', body: JSON.stringify(props.data), headers: { 'Content-Type': 'application/json' } }`
      })

      // ace.config.js ❤️ Prerequisite
      export const config = {
        liveHosts: {
          local: 'localhost:8787',
        }
      }
      ```
  * @param props.stream - The `stream` to subscribe to. Events are grouped by stream. Can be a string or a tuple, ex: ['chatRoom': id]
  * @param props.data - Event data, the entire object will be provided to `/subscribe`
  * @param props.requestInit - Optional, is merged w/ the `defaultInit` of `{ method: 'POST', body: JSON.stringify(props.data), headers: { 'Content-Type': 'application/json' } }`
  */
  async liveEvent(props: { stream: AceKey, data: object, requestInit?: Partial<RequestInit> }): Promise<Response> {
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

    return fetch(`http${url.includes('localhost') ? '' : 's'}://${url}/event?stream=${encodeURIComponent(createAceKey(props.stream))}`, mergedInit)
  }
}
