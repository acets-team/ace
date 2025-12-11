/**
 * 🧚‍♀️ How to access:
 *     - import { Load } from '@ace/load'
 *     - import type { LoadProps } from '@ace/load'
 */



import { unwrap } from 'solid-js/store'
import { query, type AccessorWithLatest } from '@solidjs/router'
import { createEffect, createSignal, Suspense, type JSX, type Accessor } from 'solid-js'
import type { BaseApiReq, AceResData, BaseStoreCtx, Array2ArrayItem, FetchFn, LoadStatus, UIProps, AceResEither, AceResErrorEither, RequiredKeys, Atoms } from './types'
import { createRun as createRun, createShowBE, createShowStore, fetchCreateAsync, innerQuery, onResponse, render, runOnNetworkToggle, runOnWindowToggle, tsxDefaultError, tsxDefaultOnLoad } from '../fetch'



/**
 * - `Load` is ideal if the Api data must be indexed by search engines
 * - Search engine web crawlers will always see this data
 * - The page will not Respond (Load) till the Api `fn` resolves
 */
export class Load<T_Req extends BaseApiReq, T_Res_Data extends AceResData, T_Atoms extends Atoms = any> {
  #onResponse: () => void
  #initialLoadComplete = false

  /**
   * - Requires a `store` prop to be passed in the constructor in order to work
   * - When a `store` prop is set we automatically sync `BE` data w/ `store` data
   * - `showStore()` is helpful when you'd love `store` data to show in the `ui`
   * - Typically called if you'd love to show data that is different then `BE` data
   * - In this case first call `showStore()`, then update the store data & the ui will show the updated data
   * - IF `run()` is called after `showStore()`, BE data will once again be shown automatically
   * - IF you'd love to toggle back to showing `BE` data w/o calling `run()` call `showBE()`
  */
  showStore: () => void

  /**
   * - IF `run()` is called after `showStore()`, BE data will once again be shown automatically
   * - IF you'd love to toggle back to showing `BE` data w/o calling `run()` call `showBE()`
   */
  showBE: () => void

  /**
   * 1. Sets `status` to `loading`
   * 1. Calls Solid's `revalidate()`
   * 1. IF `store` prop provided THEN updates `store` w/ response
   * 1. Set's status to `success` or error based on `response`
   */
  run: () => Promise<void>

  /**
   * - Options: `'loading' | 'error' | 'storeRendered' | 'success'` 
   * - `storeRendered`: The status IF `showStore()` is called OR on refresh IF we have store data
   */
  status: Accessor<LoadStatus>

  /** Render `Load` response */
  ui: <T_For_Item_Actual extends AceResData = Array2ArrayItem<T_Res_Data>>(props: UIProps<T_Res_Data, T_For_Item_Actual>) => JSX.Element

  /** 
   * - Response from `createAsyncStore()`
   * - If placing in the ui, `<Suspense />` is required btw
   */
  resAsync: AccessorWithLatest<AceResErrorEither<any> | AceResEither<T_Res_Data> | undefined>


  constructor(constructorProps: LoadProps<T_Req, T_Res_Data, T_Atoms>) {
    const baseStore = constructorProps.store?.[0]

    const [status, setStatus] = createSignal<LoadStatus>('success') // don't start on loading b/c then SEO will have loading indicator

    this.status = status

    this.showBE = createShowBE(setStatus)

    this.showStore = createShowStore(setStatus, constructorProps.store)

    this.#onResponse = () => {
      onResponse({ store: constructorProps.store, resAsync, setStatus, baseStore })
    }

    this.run = createRun(setStatus, constructorProps.queryKey, this.#onResponse)

    const queryFn = async (req: T_Req) => {
      return innerQuery<T_Req, T_Res_Data>(await constructorProps.fn(req), setStatus)
    }

    const resQuery = query(
      queryFn,
      constructorProps.queryKey
    )

    const resAsync = fetchCreateAsync<T_Req, T_Res_Data>(
      resQuery,
      constructorProps.req,
      constructorProps.reconcileKey,
      true
    )

    this.resAsync = resAsync

    createEffect(() => {
      if (!this.#initialLoadComplete) {
        const _resAsync = unwrap(resAsync())

        if (_resAsync) {
          this.#onResponse()
          this.#initialLoadComplete = true
        }
      }
    })

    runOnWindowToggle(this.run, constructorProps.runOnWindowToggle)
    runOnNetworkToggle(this.run, constructorProps.runOnNetworkToggle)

    this.ui = (uiProps) => { // component to render response as json OR response error OR a prop from response
      if (!uiProps.error) uiProps.error = tsxDefaultError
      if (!uiProps.onLoad) uiProps.onLoad = tsxDefaultOnLoad

      return <>
        <Suspense fallback={uiProps.onLoad?.()}>
          {render({ status, uiProps: uiProps, res: resAsync() })}
        </Suspense>
      </>
    }
  }
}



export type LoadProps<
  T_Req extends BaseApiReq,
  T_Res_Data extends AceResData,
  T_Atoms extends Atoms
> = BaseLoadProps<T_Req, T_Res_Data, T_Atoms> & (
  RequiredKeys<T_Req> extends never // When true `T_Req` does not require keys so we may call run() w/o `req`
  ? { req?: () => T_Req }
  : {
    /**
     * - `Type-safe`: Based on the Api parser
     * - `Reactive`: As values w/in `req()` change (ex: path params changing as navigating from page to page) this Api will automatically call it self again and update it's `ui` w/ new data ❤️
     */
    req: () => T_Req
  }
)



type BaseLoadProps<
  T_Req extends BaseApiReq,
  T_Res_Data extends AceResData,
  T_Atoms extends Atoms
> = {
  /** The fn that was created via `createApi('apiExample', info, resolver)` */
  fn: FetchFn<T_Req, T_Res_Data>,

  /** 
   * - Passed to Solid's `query()` and allows us to have back and forward cache, revalidation, & much more
   * @link https://docs.solidjs.com/solid-router/reference/data-apis/query
   */
  queryKey: string,

  /**
   * - When a `store` prop is set we automatically sync `BE` data w/ `store` data
   * - The first prop passed to the tuple is `useStore`
   * - The 2nd prop passed to the tuple is the key w/in the store that we should sync to
   */
  store?: [BaseStoreCtx<T_Atoms>, keyof T_Atoms],

  /**
   * - Optional, defaults to `id`, used when data is an array
   * - Helps Solid's do sophisticated diffing based on a prop w/in the array that is consistent
   */
  reconcileKey?: string,

  /** Optional, defaults to `false`, IF `true` AND someone returns to tab THEN `this.run()` is called  */
  runOnWindowToggle?: boolean,

  /** Optional, defaults to `false`, IF `true` AND someone regains wifi THEN `this.run()` is called  */
  runOnNetworkToggle?: boolean
}
