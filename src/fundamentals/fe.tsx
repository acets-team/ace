/**
 * 🧚‍♀️ How to access:
 *     - import { fe, FEContextProvider } from '@ace/fe'
 */


import { Bits } from '../bits'
import { feFetch } from '../feFetch'
import { buildURL } from './buildURL'
import { isServer } from 'solid-js/web'
import { FEMessages } from '../feMessages'
import { getFEChildren } from '../feChildren'
import { useParams, useLocation } from '@solidjs/router'
import { createContext, type JSX, type ParentComponent } from 'solid-js'
import type { GETPaths, GETPath2Params, POSTPaths, POSTPath2Body, POSTPath2Params, GETPath2Data, POSTPath2Data, URLParams, URLSearchParams, RoutePath2Params, Routes, JsonObject } from './types'


export let fe!: FE // the "!" tells ts: we'll assign this before it’s used but, ex: if a fe.GET() is done before the provider has run, we'll get a standard “fe is undefined” runtime error 


export const FEContext = createContext<FE | null>(null)


/**
 * - Wrap app w/ Provider
 * - Assign exported fe
 */
export const FEContextProvider: ParentComponent = (props) => {
  fe = new FE<{}, {}>()

  return <>
    <FEContext.Provider value={fe}>
      {props.children}
    </FEContext.Provider>
  </>
}


/** 
 * - Class to help
 *     - Call `api` endpoints w/ `autocomplete`
 *     - Create / manage be & fe `messages`
 *     - Create / manage `bits` aka `boolean signals`
 *     - Also holds the current params & location
 */
export class FE<T_Params extends URLParams = {}, T_Search extends URLSearchParams = {}> {
  bits = new Bits()
  messages = new FEMessages()


  /**
   * Frontend redirect w/ simple options
   * @param path - Redirect to this path, as defined @ new Route()
   * @param params - Params to put in the url
   */
  go<T extends Routes>(path: T, params?: RoutePath2Params<T>) {
    this.Go({ path, params })
  }


  /**
   * Frontend redirect w/ extra options
   * @param path - Redirect to this path, as defined @ new Route()
   * @param params - Params to put in the url
   * @param replace - Optional, defaults to false, when true this redirect will clear out a history stack entry 
   * @param scroll - Optional, defaults to true, if you'd like to scroll to the top of the page when done redirecting
   * @param state - Optional, defaults to an empty object, must be an object that is serializable, available @ the other end via `fe.getLocation().state`
   */
  Go<T extends Routes>({ path, params, replace = false, scroll = true, state = {} }: { path: T, params?: RoutePath2Params<T>, replace?: boolean, scroll?: boolean, state?: JsonObject }) {
    if (isServer) return

    const url = buildURL(path, params)

    if (replace) window.history.replaceState(state, '', url)
    else window.history.pushState(state, '', url)

    window.dispatchEvent(new PopStateEvent('popstate', { state }))

    if (scroll) window.scrollTo(0, 0)
  }


  /** @returns The url params object  */
  getParams() {
    const params = useParams<T_Params>()
    return { ...params } // params is a Proxy(Object) & this spread allows us to do for (const param in params)
  }
  

  /** @returns The url location data  */
  getLocation() {
    return useLocation<T_Search>()
  }


  /**
   * Call GET w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   */
  async GET<T extends GETPaths>(path: T, options?: { params?: GETPath2Params<T>, bitKey?: string }): Promise<GETPath2Data<T>> {
    return this._fetch<GETPath2Data<T>>(buildURL(path, options?.params), {method: 'GET', bitKey: options?.bitKey })
  }


  /**
   * Call POST w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   * @param options.body - Request body
   */
  async POST<T extends POSTPaths>(path: T, options?: { params?: POSTPath2Params<T>, body?: POSTPath2Body<T>, bitKey?: string }): Promise<POSTPath2Data<T>> {
    return this._fetch<POSTPath2Data<T>>(buildURL(path, options?.params), {method: 'POST', bitKey: options?.bitKey, body: options?.body })
  }


  protected async _fetch<T>(url: string, { method, body, bitKey }: { method: 'GET' | 'POST'; body?: any; bitKey?: string }): Promise<T> {
    if (bitKey) this.bits.set(bitKey, true)

    const res = await feFetch<T>(url, method, body)

    this.messages.align(res)

    if (bitKey) this.bits.set(bitKey, false)

    return res
  }


  /**
   * - Get the children for a layout
   * - Returns the jsx elemement or undefined if no children
   * - With `Ace` only a `Layout` has children btw, routes do not
   */
  getChildren(): JSX.Element | undefined {
    return getFEChildren(this)
  }
}
