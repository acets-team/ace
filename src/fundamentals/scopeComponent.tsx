/**
 * 🧚‍♀️ How to access:
 *     - import { scope, ScopeComponentContext, ScopeComponentContextProvider } from '@ace/scopeComponent'
 */


import { env } from './env'
import { config } from 'ace.config'
import { getGoUrl } from './getGoUrl'
import { isServer } from 'solid-js/web'
import { mapRoutes } from './mapRoutes'
import { parseResponse } from '../fetch'
import { parseError } from './parseError'
import { RouteSectionProps, useLocation } from '@solidjs/router'
import { createAceKey } from './createAceKey'
import { destructureReady } from './destructureReady'
import { ScopeComponentMessages } from '../scopeComponentMessages'
import { ScopeComponentChildren } from '../scopeComponentChildren'
import { createContext, type JSX, type Accessor, type ParentComponent, Suspense } from 'solid-js'
import type { RoutePath2PathParams, Routes, AceResData, RoutePath2SearchParams, BaseRouteReq, RouteReq2PathParams, RouteReq2SearchParams, AceResEither, AceResErrorEither, AceResError, AceKey } from './types'


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
 *     - Access current `pathParams`, `searchParams` & `location`
 *     - Get `children` (if @ `Layout`)
 *     - Typesafe redirects
 *     - Create / manage `messages`
 *     - Subscribe to an `Ace Live Server`
 * - If desired, can be safely destructured
 */
export class ScopeComponent<T_Req extends BaseRouteReq = BaseRouteReq> {
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
  pathParams = {} as RouteReq2PathParams<T_Req>


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
  PathParams = (() => { }) as Accessor<RouteReq2PathParams<T_Req>>


  /**
   * - Search params as an object
   * - IF using in a `createEffect()` THEN use `scope.SearchParams()`
   * @example
    ```tsx
    <>{scope.searchParams.example}</>
    ```
   */
  searchParams = {} as RouteReq2SearchParams<T_Req>


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
  SearchParams = (() => { }) as Accessor<RouteReq2SearchParams<T_Req>>


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
    return useLocation<RouteReq2SearchParams<T_Req>>()
  }


  routeSectionProps: Accessor<undefined | RouteSectionProps> = () => undefined


  get childrenRootLayout() {
    return <>
      <Suspense>
        {ScopeComponentChildren.getRoot()}
      </Suspense>
    </>
  }


  get childrenSubLayout() {
    return <>
      <Suspense>
        {ScopeComponentChildren.getSub()}
      </Suspense>
    </>
  }


  async fetch<T_ResData extends AceResData>(props: { url: string, requestInit: RequestInit }): Promise<AceResEither<T_ResData> | AceResErrorEither<T_ResData>> {
    let res = {}
    let goUrl = null

    try {
      const resFetch = await fetch(props.url, props.requestInit)

      goUrl = getGoUrl(resFetch)

      if (!goUrl) res = await parseResponse<T_ResData>(resFetch)
    } catch (e) {
      res = parseError(e)
    }

    if (goUrl && goUrl !== window.location.href) throw window.location.href = goUrl

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
  Go<T_Path extends Routes>({ path, pathParams, searchParams, replace = false, scroll = true, state = {} }: { path: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, replace?: boolean, scroll?: boolean, state?: { [key: string]: any } }) {
    if (isServer) return

    const entry = mapRoutes[path]
    if (!entry) return '/'

    const url = entry.buildUrl({ pathParams, searchParams })

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
        const { ws, error } = scope.liveSubscribe({ stream: ['chatRoom', id] })

        if (error?.message) showErrorToast(error.message)
        else if (ws) {
          ws.addEventListener('message', event => {
            console.log(event.data) // ✅ real-time data received!
          })

          onCleanup(() => scope.liveUnsubscribe(ws))
        }
      })

      // ace.config.js ❤️ Prerequisite
      export const config = {
        liveHosts: {
          local: 'localhost:8787',
        }
      }
      ```
   * @param props.stream - The `stream` to subscribe to. Events are grouped by stream. Can be a string or a tuple, ex: ['chatRoom': id]
   */
  liveSubscribe(props: { stream: AceKey }): { ws?: WebSocket, error?: NonNullable<AceResError> } {
    try {
      const host = config.liveHosts?.[env]
      if (!host) throw new Error(`ace.config.js > liveHosts > "${env}" is undefined`)

      return {
        ws: new WebSocket(`ws${host.includes('localhost') ? '' : 's'}://${host}/subscribe?stream=${encodeURIComponent(createAceKey(props.stream))}`)
      }
    } catch (e) {
      return parseError(e)
    }
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
