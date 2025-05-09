/**
 * 🧚‍♀️ How to access:
 *     - import { FE, getFE } from '@ace/fe'
 */


import { Bits } from '../bits'
import { feFetch } from '../feFetch'
import { buildURL } from '../buildURL'
import { FEMessages } from '../feMessages'
import { getFEChildren } from '../feChildren'
import { useParams, useLocation } from '@solidjs/router'
import { createContext, JSX, useContext } from 'solid-js'
import { createContextProvider } from './createContextProvider'
import type { GET_Paths, InferParamsGET, POST_Paths, InferBodyPOST, InferParamsPOST, InferResponseGET, InferResponsePOST, URLParams, URLSearchParams } from './types'


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


  /** @returns The url params object  */
  getParams() {
    return useParams<T_Params>()
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
  async GET<T extends GET_Paths>(path: T, options?: { params?: InferParamsGET<T>, bitKey?: string }): Promise<InferResponseGET<T>> {
    return this._fetch(buildURL(path, options?.params), {method: 'GET', bitKey: options?.bitKey })
  }


  /**
   * Call POST w/ intellisense
   * @param path - As defined @ `new API()`
   * @param options.bitKey - `Bits` are `boolean signals`, they live in a `map`, so they each have a `bitKey` to help us identify them
   * @param options.params - Path params
   * @param options.body - Request body
   */
  async POST<T extends POST_Paths>(path: T, options?: { params?: InferParamsPOST<T>, body?: InferBodyPOST<T>, bitKey?: string }): Promise<InferResponsePOST<T>> {
    return this._fetch(buildURL(path, options?.params), {method: 'POST', bitKey: options?.bitKey, body: options?.body })
  }


  protected async _fetch(url: string, { method, body, bitKey }: { body?: any, bitKey?: string, method: 'GET' | 'POST' }) {
    if (bitKey) this.bits.set(bitKey, true)

    const res = await feFetch(url, method, body)

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


/**
 * - Typically called when you'd love the fe object in a custom component & don't wanna prop drill
 * @example
  ```ts
  import { getFE } from '@ace/fe'

  export function CustomComponent() {
    const fe = getFE()
    // ...
  }
  ```
 */
export function getFE(): FE {
  const fe = useContext(FEContext)

  if (!fe) throw new Error("Please ensure getFE()` is called inside <FEContextProvider> AND not too deep in callbacks!")

  return fe
}

export const FEContext = createContext(new FE())

export const FEContextProvider = createContextProvider(FEContext)
