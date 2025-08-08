/**
 * 🧚‍♀️ How to access:
 *     - import { scope, ScopeComponentContext, ScopeComponentContextProvider } from '@ace/scopeComponent'
 */


import { Bits } from '../bits'
import { feFetch } from '../feFetch'
import { buildUrl } from '../buildUrl'
import { isServer } from 'solid-js/web'
import { FEMessages } from '../feMessages'
import { useLocation } from '@solidjs/router'
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


  /**
   * Call api GET method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   */
  async GET<T_Path extends GETPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<GETPath2Api<T_Path>>, searchParams?: Api2SearchParams<GETPath2Api<T_Path>>, bitKey?: string }): Promise<Api2Data<GETPath2Api<T_Path>>> {
    return this._fetch<Api2Data<GETPath2Api<T_Path>>>(buildUrl(path, {pathParams: options?.pathParams, searchParams: options?.searchParams}), {method: 'GET', bitKey: options?.bitKey })
  }


  /**
   * Call api POST method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   * @param options.body - Request body
   */
  async POST<T_Path extends POSTPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<POSTPath2Api<T_Path>>, searchParams?: Api2SearchParams<POSTPath2Api<T_Path>>, body?: Api2Body<POSTPath2Api<T_Path>>, bitKey?: string }): Promise<Api2Data<POSTPath2Api<T_Path>>> {
    return this._fetch<Api2Data<POSTPath2Api<T_Path>>>(buildUrl(path, {pathParams: options?.pathParams, searchParams: options?.searchParams}), {method: 'POST', bitKey: options?.bitKey, body: options?.body })
  }


  /**
   * Call api POST method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   * @param options.body - Request body
   */
  async PUT<T_Path extends PUTPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<PUTPath2Api<T_Path>>, searchParams?: Api2SearchParams<PUTPath2Api<T_Path>>, body?: Api2Body<PUTPath2Api<T_Path>>, bitKey?: string }): Promise<Api2Data<PUTPath2Api<T_Path>>> {
    return this._fetch<Api2Data<PUTPath2Api<T_Path>>>(buildUrl(path, {pathParams: options?.pathParams, searchParams: options?.searchParams}), {method: 'PUT', bitKey: options?.bitKey, body: options?.body })
  }


  /**
   * Call api DELETE method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   * @param options.body - Request body
   */
  async DELETE<T_Path extends DELETEPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<DELETEPath2Api<T_Path>>, searchParams?: Api2SearchParams<DELETEPath2Api<T_Path>>, body?: Api2Body<DELETEPath2Api<T_Path>>, bitKey?: string }): Promise<Api2Data<DELETEPath2Api<T_Path>>> {
    return this._fetch<Api2Data<DELETEPath2Api<T_Path>>>(buildUrl(path, {pathParams: options?.pathParams, searchParams: options?.searchParams}), {method: 'DELETE', bitKey: options?.bitKey, body: options?.body })
  }


  protected async _fetch<T>(url: string, { method, body, bitKey }: { method: ApiMethods; body?: any; bitKey?: string }): Promise<T> {
    if (bitKey) this.bits.set(bitKey, true)

    const res = await feFetch<T>(url, method, body)

    this.messages.align(res)

    if (bitKey) this.bits.set(bitKey, false)

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
