/**
 * 🧚‍♀️ How to access:
 *     - import { scope, ScopeComponentContext, ScopeComponentContextProvider } from '@ace/scopeComponent'
 */


import { Bits } from '../bits'
import { apiMethods } from './vars'
import { getGoUrl } from './getGoUrl'
import { buildUrl } from '../buildUrl'
import { isServer } from 'solid-js/web'
import { FEMessages } from '../feMessages'
import { useLocation } from '@solidjs/router'
import { parseResponse } from '../parseResponse'
import { destructureReady } from './destructureReady'
import { getScopeComponentChildren } from '../scopeComponentChildren'
import { createContext, type JSX, type Accessor, type ParentComponent } from 'solid-js'
import type { GETPaths, POSTPaths, UrlPathParams, UrlSearchParams, RoutePath2PathParams, Routes, JsonObject, RoutePath2SearchParams, PUTPaths, DELETEPaths, ApiMethods, GETPath2Api, POSTPath2Api, PUTPath2Api, DELETEPath2Api, Api2PathParams, Api2SearchParams, Api2Body, Api2Data } from './types'


export let scope!: ScopeComponent // the "!" tells ts: we'll assign this before it’s used but, ex: if a scope.GET() is done before the provider has run, we'll get a standard “fe is undefined” runtime error 


export const ScopeComponentContext = createContext<ScopeComponent | null>(null)


/**
 * - Wrap app w/ Provider
 * - Assign exported fe
 */
export const ScopeComponentContextProvider: ParentComponent = (props) => {
  scope = new ScopeComponent()

  return <>
    <ScopeComponentContext.Provider value={scope}>
      {props.children}
    </ScopeComponentContext.Provider>
  </>
}


/** 
 * - Class to help
 *     - Call `api` endpoints w/ `autocomplete`
 *     - Create / manage be & fe `messages`
 *     - Create / manage `bits` aka `boolean signals`
 *     - Also holds the current params & location
 */
export class ScopeComponent<T_Path_Params extends UrlPathParams = {}, T_Search_Params extends UrlSearchParams = {}> {
  bits = new Bits()
  messages = new FEMessages()


  constructor() {
    destructureReady(this)
  }


  /**
   * - Path params as an object
   * - If using in a `createEffect()` use `scope.PathParams()`
   * @example
    ```tsx
    <>{scope.pathParams.example}</>
    ```
   */
  pathParams = {} as T_Path_Params


  /**
   * - Reactive path params that can be used in a createEffect()
   * - If not using in a createEffect just use scope.pathParams
   * @example
    ```ts
    createEffect(() => {
      if (scope.PathParams().modal) showModal('⚡️')
    })
    ```
   */
  PathParams = (() => {}) as Accessor<T_Path_Params>


  /**
   * - Search params as an object
   * - If using in a `createEffect()` use `scope.SearchParams()`
   * @example
    ```tsx
    <>{scope.searchParams.example}</>
    ```
   */
   searchParams = {} as T_Search_Params


  /**
   * - Reactive search params that can be used in a `createEffect()`
   * - If not using in a createEffect just use scope.searchParams
   * @example
    ```ts
    createEffect(() => {
      if (scope.SearchParams().modal) showModal('⚡️')
    })
    ```
   */
  SearchParams = (() => {}) as Accessor<T_Search_Params>


  /** @returns The url location data  */
  /**
   * - Reactive location that can be used in a `createEffect()`
   * @example
    ```ts
    createEffect(() => {
      if (scope.Location().pathname) window.scrollTo(0, 0)
    })
    ```
   */
  Location() {
    return useLocation<T_Search_Params>()
  }


  /**
   * - Location as an object
   * - If you'd like reactive location that can be used in a `createEffect()` call `scope.Location()`
   * @example
    ```tsx
    <div class="path">{scope.location.pathname}</div>
    ```
   */
  get location() { return this.Location() }


  /**
   * - Get the children for a layout
   * - Returns the jsx elemement or undefined if no children
   * - With `Ace` only a `Layout` has children btw, routes do not
   */
  get children(): JSX.Element | undefined {
    return getScopeComponentChildren(this)
  }


  #getRequestInit(requestInit: Partial<RequestInit>, body?: unknown): RequestInit {
    const finalInit: RequestInit = { credentials: 'same-origin', ...(requestInit || {}) } 
    const headers = new Headers(finalInit.headers) // normalize headers to Headers so we can safely inspect / set
    const hasBody = body !== null && body !== undefined
    const browserSetContentTypeBasedOnBodyInstance = (body instanceof FormData || body instanceof File || body instanceof Blob || body instanceof URLSearchParams) // w/ these requests, the content type is set by the browser, so that the browser can identify delimeters in the header
    const shouldDefaultContentType = (!headers.has('content-type') && hasBody && !browserSetContentTypeBasedOnBodyInstance)
    
    if (shouldDefaultContentType) headers.set('content-type', 'application/json')  // default content type

    const finalBody = (((headers.get('content-type') || '').includes('application/json'))
      ? hasBody && typeof body !== 'string' ? JSON.stringify(body) : body
      : body) as BodyInit
    
    headers.set('Origin', window.location.origin) // if we don't send Origin then on same origin requests (dev) the browser won't send an origin header (but be expects one). But when we set origin manually, browser will ignore the value and send the real origin always

    return { ...finalInit, headers, body: finalBody }
  }


  /**
   * Call api GET method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   */
  async GET<T_Path extends GETPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<GETPath2Api<T_Path>>, searchParams?: Api2SearchParams<GETPath2Api<T_Path>>, bitKey?: string, requestInit?: Partial<RequestInit> }): Promise<Api2Data<GETPath2Api<T_Path>>> {
    const requestInit = this.#getRequestInit({ ...options?.requestInit, method: apiMethods.keys.GET })
    
    return this.fetch<Api2Data<GETPath2Api<T_Path>>>({
      requestInit,
      bitKey: options?.bitKey,
      url: buildUrl(path, {pathParams: options?.pathParams, searchParams: options?.searchParams}),
    })
  }


  /**
   * Call api POST method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   * @param options.body - Request body
   */
  async POST<T_Path extends POSTPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<POSTPath2Api<T_Path>>, searchParams?: Api2SearchParams<POSTPath2Api<T_Path>>, body?: Api2Body<POSTPath2Api<T_Path>>, bitKey?: string, requestInit?: Partial<RequestInit> }): Promise<Api2Data<POSTPath2Api<T_Path>>> {
    const requestInit = this.#getRequestInit({ ...options?.requestInit, method: apiMethods.keys.POST }, options?.body)

    return this.fetch<Api2Data<POSTPath2Api<T_Path>>>({
      requestInit,
      bitKey: options?.bitKey,
      url: buildUrl(path, {pathParams: options?.pathParams, searchParams: options?.searchParams})
    })
  }


  /**
   * Call api POST method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   * @param options.body - Request body
   */
  async PUT<T_Path extends PUTPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<PUTPath2Api<T_Path>>, searchParams?: Api2SearchParams<PUTPath2Api<T_Path>>, body?: Api2Body<PUTPath2Api<T_Path>>, bitKey?: string, requestInit?: Partial<RequestInit> }): Promise<Api2Data<PUTPath2Api<T_Path>>> {
    const requestInit = this.#getRequestInit({ ...options?.requestInit, method: apiMethods.keys.PUT }, options?.body)

    return this.fetch<Api2Data<PUTPath2Api<T_Path>>>({
      requestInit,
      bitKey: options?.bitKey,
      url: buildUrl(path, {pathParams: options?.pathParams, searchParams: options?.searchParams})
    })
  }


  /**
   * Call api DELETE method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   * @param options.body - Request body
   */
  async DELETE<T_Path extends DELETEPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<DELETEPath2Api<T_Path>>, searchParams?: Api2SearchParams<DELETEPath2Api<T_Path>>, body?: Api2Body<DELETEPath2Api<T_Path>>, bitKey?: string, requestInit?: Partial<RequestInit> }): Promise<Api2Data<DELETEPath2Api<T_Path>>> {
    const requestInit = this.#getRequestInit({ ...options?.requestInit, method: apiMethods.keys.DELETE }, options?.body)

    return this.fetch<Api2Data<DELETEPath2Api<T_Path>>>({
      requestInit,
      bitKey: options?.bitKey,
      url: buildUrl(path, {pathParams: options?.pathParams, searchParams: options?.searchParams})
    })
  }


  async fetch<T_Response>({url, requestInit, bitKey}: {url: string, requestInit: RequestInit, bitKey?: string}): Promise<T_Response> {
    if (bitKey) this.bits.set(bitKey, true)

    let res = null
    let goUrl = null

    try {
      res = await fetch(url, requestInit)

      if (goUrl) goUrl = getGoUrl(res)
    } catch(e) {
      res = await parseResponse<T_Response>(e)
    }
    
    if (goUrl) throw window.location.href = goUrl

    if (bitKey) this.bits.set(bitKey, false)

    res = await parseResponse<T_Response>(res)

    this.messages.align(res)

    return res
  }


  /**
   * Frontend redirect w/ simple options
   * @param path - Redirect to this path, as defined @ new Route()
   * @param params - Params to put in the url
   */
  go<T_Path extends Routes>(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }) {
    this.Go({ path, pathParams: params?.pathParams, searchParams: params?.searchParams })
  }


  /**
   * Frontend redirect w/ all options
   * @param path - Redirect to this path, as defined @ new Route()
   * @param params - Params to put in the url
   * @param replace - Optional, defaults to false, when true this redirect will clear out a history stack entry 
   * @param scroll - Optional, defaults to true, if you'd like to scroll to the top of the page when done redirecting
   * @param state - Optional, defaults to an empty object, must be an object that is serializable, available @ the other end via `fe.getLocation().state`
   */
  Go<T_Path extends Routes>({ path, pathParams, searchParams, replace = false, scroll = true, state = {} }: { path: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, replace?: boolean, scroll?: boolean, state?: JsonObject }) {
    if (isServer) return

    const url = buildUrl(path, {pathParams, searchParams})

    if (replace) window.history.replaceState(state, '', url)
    else window.history.pushState(state, '', url)

    window.dispatchEvent(new PopStateEvent('popstate', { state }))

    if (scroll) window.scrollTo(0, 0)
  }
}
