/**
 * 🧚‍♀️ How to access:
 *     - import { scope, ScopeComponentContext, ScopeComponentContextProvider } from '@ace/scopeComponent'
 */


import { env } from './env'
import { Bits } from '../bits'
import { config } from 'ace.config'
import { apiMethods } from './vars'
import { getGoUrl } from './getGoUrl'
import { buildUrl } from '../buildUrl'
import { isServer } from 'solid-js/web'
import { useLocation } from '@solidjs/router'
import { createAceKey } from './createAceKey'
import { parseResponse } from '../parseResponse'
import { destructureReady } from './destructureReady'
import { ScopeComponentMessages } from '../scopeComponentMessages'
import { getScopeComponentChildren } from '../scopeComponentChildren'
import { createContext, type JSX, type Accessor, type ParentComponent } from 'solid-js'
import type { GETPaths, POSTPaths, UrlPathParams, UrlSearchParams, RoutePath2PathParams, Routes, JsonObject, RoutePath2SearchParams, PUTPaths, DELETEPaths, GETPath2Api, POSTPath2Api, PUTPath2Api, DELETEPath2Api, Api2PathParams, Api2SearchParams, Api2Body, Api2Data, AceKey } from './types'


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
  messages = new ScopeComponentMessages()


  constructor() {
    destructureReady(this)
  }


  /**
   * - Path params as an object
   * - IF using in a `createEffect()` THEN use `scope.PathParams()`
   * @example
    ```tsx
    <>{scope.pathParams.example}</>
    ```
   */
  pathParams = {} as T_Path_Params


  /**
   * - Reactive path params that can be used in a `createEffect()`
   * - IF not using in a `createEffect()` THEN use `scope.pathParams`
   * @example
    ```ts
    createEffect(() => {
      if (scope.PathParams().modal) showModal('⚡️')
    })
    ```
   */
  PathParams = (() => { }) as Accessor<T_Path_Params>


  /**
   * - Search params as an object
   * - IF using in a `createEffect()` THEN use `scope.SearchParams()`
   * @example
    ```tsx
    <>{scope.searchParams.example}</>
    ```
   */
  searchParams = {} as T_Search_Params


  /**
   * - Reactive search params that can be used in a `createEffect()`
   * - IF not using in a `createEffect()` THEN use `scope.searchParams`
   * @example
    ```ts
    createEffect(() => {
      if (scope.SearchParams().modal) showModal('⚡️')
    })
    ```
   */
  SearchParams = (() => { }) as Accessor<T_Search_Params>


  /**
   * - Location as an object
   * - IF using in a `createEffect()` THEN use `scope.Location()`
   * @example
    ```tsx
    <div class="path">{scope.location.pathname}</div>
    ```
   */
  get location() { return this.Location() }


  /**
   * - Reactive location that can be used in a `createEffect()`
   * - IF not using in a `createEffect()` THEN use `scope.location`
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
   * - Get the children for a layout
   * - Returns the jsx elemement or undefined if no children
   * - With `Ace` only a `Layout` has children, routes do not
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
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them, the provided bitKey will have a value of true while this api is loading
   * @param options.pathParams - Path params
   * @param options.searchParams - Search params
   * @param options.manualBitOff - Optional, defaults to false, set to true when you don't want the bit to turn off in this function but to turn off in yours, helpful if you want additional stuff to happen afte api call then say we done
   */
  async GET<T_Path extends GETPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<GETPath2Api<T_Path>>, searchParams?: Api2SearchParams<GETPath2Api<T_Path>>, bitKey?: AceKey, requestInit?: Partial<RequestInit>, manualBitOff?: boolean }): Promise<Api2Data<GETPath2Api<T_Path>>> {
    const requestInit = this.#getRequestInit({ ...options?.requestInit, method: apiMethods.keys.GET })

    return this.fetch<Api2Data<GETPath2Api<T_Path>>>({
      requestInit,
      bitKey: options?.bitKey,
      manualBitOff: options?.manualBitOff,
      url: buildUrl(path, { pathParams: options?.pathParams, searchParams: options?.searchParams }),
    })
  }


  /**
   * Call api POST method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them, the provided bitKey will have a value of true while this api is loading
   * @param options.pathParams - Path params
   * @param options.searchParams - Search params
   * @param options.body - Request body
   * @param options.manualBitOff - Optional, defaults to false, set to true when you don't want the bit to turn off in this function but to turn off in yours, helpful if you want additional stuff to happen afte api call then say we done
   */
  async POST<T_Path extends POSTPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<POSTPath2Api<T_Path>>, searchParams?: Api2SearchParams<POSTPath2Api<T_Path>>, body?: Api2Body<POSTPath2Api<T_Path>>, bitKey?: AceKey, requestInit?: Partial<RequestInit>, manualBitOff?: boolean }): Promise<Api2Data<POSTPath2Api<T_Path>>> {
    const requestInit = this.#getRequestInit({ ...options?.requestInit, method: apiMethods.keys.POST }, options?.body)

    return this.fetch<Api2Data<POSTPath2Api<T_Path>>>({
      requestInit,
      bitKey: options?.bitKey,
      manualBitOff: options?.manualBitOff,
      url: buildUrl(path, { pathParams: options?.pathParams, searchParams: options?.searchParams })
    })
  }


  /**
   * Call api POST method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them, the provided bitKey will have a value of true while this api is loading
   * @param options.pathParams - Path params
   * @param options.searchParams - Search params
   * @param options.body - Request body
   * @param options.manualBitOff - Optional, defaults to false, set to true when you don't want the bit to turn off in this function but to turn off in yours, helpful if you want additional stuff to happen afte api call then say we done
   */
  async PUT<T_Path extends PUTPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<PUTPath2Api<T_Path>>, searchParams?: Api2SearchParams<PUTPath2Api<T_Path>>, body?: Api2Body<PUTPath2Api<T_Path>>, bitKey?: AceKey, requestInit?: Partial<RequestInit>, manualBitOff?: boolean }): Promise<Api2Data<PUTPath2Api<T_Path>>> {
    const requestInit = this.#getRequestInit({ ...options?.requestInit, method: apiMethods.keys.PUT }, options?.body)

    return this.fetch<Api2Data<PUTPath2Api<T_Path>>>({
      requestInit,
      bitKey: options?.bitKey,
      manualBitOff: options?.manualBitOff,
      url: buildUrl(path, { pathParams: options?.pathParams, searchParams: options?.searchParams })
    })
  }


  /**
   * Call api DELETE method w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them, the provided bitKey will have a value of true while this api is loading
   * @param options.pathParams - Path params
   * @param options.searchParams - Search params
   * @param options.body - Request body
   * @param options.manualBitOff - Optional, defaults to false, set to true when you don't want the bit to turn off in this function but to turn off in yours, helpful if you want additional stuff to happen afte api call then say we done
   */
  async DELETE<T_Path extends DELETEPaths>(path: T_Path, options?: { pathParams?: Api2PathParams<DELETEPath2Api<T_Path>>, searchParams?: Api2SearchParams<DELETEPath2Api<T_Path>>, body?: Api2Body<DELETEPath2Api<T_Path>>, bitKey?: AceKey, requestInit?: Partial<RequestInit>, manualBitOff?: boolean }): Promise<Api2Data<DELETEPath2Api<T_Path>>> {
    const requestInit = this.#getRequestInit({ ...options?.requestInit, method: apiMethods.keys.DELETE }, options?.body)

    return this.fetch<Api2Data<DELETEPath2Api<T_Path>>>({
      requestInit,
      bitKey: options?.bitKey,
      manualBitOff: options?.manualBitOff,
      url: buildUrl(path, { pathParams: options?.pathParams, searchParams: options?.searchParams })
    })
  }


  async fetch<T_Response>(props: { url: string, requestInit: RequestInit, bitKey?: AceKey, manualBitOff?: boolean }): Promise<T_Response> {
    let bitKey = createAceKey(props.bitKey)

    if (bitKey) this.bits.set(bitKey, true)

    let res = null
    let goUrl = null

    try {
      const resFetch = await fetch(props.url, props.requestInit)
      res = await parseResponse<T_Response>(resFetch)

      if (res instanceof Response) goUrl = getGoUrl(res)
    } catch (e) {
      res = await parseResponse<T_Response>(e)
    }

    if (goUrl && goUrl !== window.location.href) throw window.location.href = goUrl

    if (!props.manualBitOff && bitKey) this.bits.set(bitKey, false)

    res = await parseResponse<T_Response>(res)

    this.messages.align(res)

    return res
  }


  /**
   * - Frontend redirect w/ simple options
   * - For all possible options please use `scope.Go()`
   * @param path - Redirect to this path, as defined @ new Route()
   * @param params.pathParams - Path params
   * @param params.searchParams - Search params
   */
  go<T_Path extends Routes>(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }) {
    this.Go({ path, pathParams: params?.pathParams, searchParams: params?.searchParams })
  }


  /**
   * - Frontend redirect w/ all options
   * - For simple options please use `scope.go()`
   * @param path - Redirect to this path, as defined @ new Route()
   * @param pathParams - Path params
   * @param searchParams - Search params
   * @param replace - Optional, defaults to false, when true this redirect will clear out a history stack entry 
   * @param scroll - Optional, defaults to true, if you'd like to scroll to the top of the page when done redirecting
   * @param state - Optional, defaults to an empty object, must be an object that is serializable, available @ the other end via `fe.getLocation().state`
   */
  Go<T_Path extends Routes>({ path, pathParams, searchParams, replace = false, scroll = true, state = {} }: { path: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, replace?: boolean, scroll?: boolean, state?: JsonObject }) {
    if (isServer) return

    const url = buildUrl(path, { pathParams, searchParams })

    if (replace) window.history.replaceState(state, '', url)
    else window.history.pushState(state, '', url)

    window.dispatchEvent(new PopStateEvent('popstate', { state }))

    if (scroll) window.scrollTo(0, 0)
  }



  /**
   * ### Helpful when you'd love to create a ws connection to an Ace Live Server
   * @example
      ```ts
      onMount(() => {
        const ws = scope.liveSubscribe({ stream: 'example' })

        ws.addEventListener('message', event => {
          console.log(event.data)
        })

        ws.addEventListener('close', () => {
          console.log('ws closed')
        })

        onCleanup(() => scope.liveUnsubscribe(ws))
      })
      ```
   * @param props.stream - The `stream` to subscribe to. Events are grouped by stream.
   */
  liveSubscribe(props: { stream: string }): WebSocket {
    const host = config.liveHosts?.[env]
    if (!host) throw new Error(`ace.config.js > liveHosts > "${env}" is undefined`)

    return new WebSocket(`ws://${host}/subscribe?stream=${encodeURIComponent(props.stream)}`);
  }


  /**
   * ### Closes a live WebSocket connection created via `liveSubscribe`
   * @example
      ```ts
      onMount(() => {
        const ws = scope.liveSubscribe({ stream: 'example' })

        ws.addEventListener('message', event => {
          console.log(event.data)
        })

        ws.addEventListener('close', () => {
          console.log('ws closed')
        })

        onCleanup(() => scope.liveUnsubscribe(ws))
      })
      ```
   * @param ws - The `ws` to unsubscribe
   */
  liveUnsubscribe(ws: WebSocket): void {
    if (!ws) return

    if (ws.readyState === WebSocket.OPEN || ws.readyState === WebSocket.CONNECTING) {
      ws.close(1000, 'liveUnsubscribe()')
    }
  }
}
