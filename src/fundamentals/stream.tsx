/**
 * 🧚‍♀️ How to access:
 *     - import { Stream } from '@ace/stream'
 *     - import type { StreamProps } from '@ace/stream'
 */



import { useScope } from './useScope'
import { unwrap } from 'solid-js/store'
import { query, type AccessorWithLatest } from '@solidjs/router'
import { createEffect, createSignal, type JSX, Show, Suspense, type Accessor } from 'solid-js'
import type { BaseApiReq, FetchFn, StreamStatus, UIProps, AceResData, InferAtoms, FetchStoreResponse, AceResErrorEither, AceResEither, Array2ArrayItem, RequiredKeys, Atoms } from './types'
import { createRun, createShowBE, createShowStore, fetchCreateAsync, innerQuery, onResponse, render, runOnNetworkToggle, runOnWindowToggle, tsxDefaultError, tsxDefaultOnLoad } from '../fetch'



/**
 * - Optimal for fast page shell visibility
 * - IF the Api is `pending` BUT the rest of the page is `ready`:
 *     1. Response provided w/ static content & `onLoad` components (default `onLoad` is a `css` spinner)
 *     1. [`Solid's <Suspense/>`](https://docs.solidjs.com/reference/components/suspense) 
 *     1. Api data is `Streamed` to the browser
 *     1. Solid adds children to the page w/ Api data `included`
 */
export class Stream<T_Req extends BaseApiReq, T_Res_Data extends AceResData, T_Atoms extends Atoms = Atoms> {
  #onResponse: () => void
  #initialLoadComplete = false

  /** 
   * - Requires an `atom` prop to be passed in the constructor in order to work
   * - When an `atom` prop is set we automatically sync `BE` data w/ `atom` data
   * - `showAtom()` is helpful when you'd love `atom` data to show in the `ui`
   * - Typically called if you'd love to show data that is different then `BE` data
   * - In this case first call `showAtom()`, then update the atom data & the ui will show the updated data
   * - IF `run()` is called after `showAtom()`, BE data will once again be shown automatically
   * - IF you'd love to toggle back to showing `BE` data w/o calling `run()` call `showBE()`
  */
  showAtom: () => void

  /**
   * - IF `run()` is called after `showAtom()`, BE data will once again be shown automatically
   * - IF you'd love to toggle back to showing `BE` data w/o calling `run()` call `showBE()`
   */
  showBE: () => void

  /**
   * 1. Sets `status` to `loading`
   * 1. Calls Solid's `revalidate()`
   * 1. IF `atom` prop provided THEN updates `atom` w/ response
   * 1. Set's status to `success` or error based on `response`
   */
  run: () => Promise<void>

  /**
   * - Options: `'loading' | 'error' | 'atomRendered' | 'success'` 
   * - `atomRendered`: The status IF `showAtom()` is called OR on refresh IF we have atom data
   */
  status: Accessor<StreamStatus>

  /**
   * - Response from `createAsyncStore()`
   * - If placing in the ui, `<Suspense />` is required btw
   */
  resAsync: AccessorWithLatest<AceResErrorEither<any> | AceResEither<T_Res_Data> | undefined>

  /** Render `Stream` response */
  ui: <T_For_Item_Actual extends AceResData = Array2ArrayItem<T_Res_Data>>(props: UIProps<T_Res_Data, T_For_Item_Actual>) => JSX.Element;

  constructor(constructorProps: StreamProps<T_Req, T_Res_Data, T_Atoms>) {
    const scope = useScope()
    const baseAtom = constructorProps.atom?.[0]

    const [status, setStatus] = createSignal<StreamStatus>('success') // don't start on loading b/c that can cause hydration errors when the data is available on the BE

    this.status = status

    this.showBE = createShowBE(setStatus)

    this.showAtom = createShowStore(setStatus, constructorProps.atom)

    this.#onResponse = () => {
      onResponse({ atom: constructorProps.atom, resAsync, setStatus, baseAtom })
    }

    this.run = createRun(setStatus, constructorProps.queryKey, this.#onResponse)

    const queryFn = async (req: T_Req) => {
      return innerQuery<T_Req, T_Res_Data>(await constructorProps.fn(req, scope), setStatus)
    }

    const resQuery = query(
      queryFn,
      constructorProps.queryKey
    )

    const resAsync = fetchCreateAsync<T_Req, T_Res_Data>(
      scope,
      resQuery,
      constructorProps.req,
      constructorProps.reconcileKey,
      false
    )

    this.resAsync = resAsync

    // purpose
    // determine the initial status
    // call onResponse once we have a BE response
    // never run this init code again after we get our first BE response
    createEffect(() => {
      if (!this.#initialLoadComplete) {
        const _resAsync = unwrap(resAsync()) // IF not in a createEffect() THEN streaming breaks (entire page waits for response)
        const _resStore = baseAtom?.store && constructorProps.atom ? unwrap(baseAtom.store[constructorProps.atom[1]]) : null // IF not in a createEffect THEN when idb gives us data we won't know

        if (_resStore && !_resAsync) { // IF atom data AND no BE data -> 'atomRendered'
          setStatus('atomRendered')
        } else if (!_resStore && !_resAsync) { // IF no atom data AND no BE data -> 'loading'
          setStatus('loading')
        }

        if (_resAsync) {
          this.#onResponse()
        }
      }
    })

    runOnWindowToggle(this.run, constructorProps.runOnWindowToggle)
    runOnNetworkToggle(this.run, constructorProps.runOnNetworkToggle)

    this.ui = (uiProps) => { // component to render response
      if (!uiProps.error) uiProps.error = tsxDefaultError
      if (!uiProps.onLoad) uiProps.onLoad = tsxDefaultOnLoad

      const feRender = () => <>
        {
          baseAtom && constructorProps.atom
            ? render({ status, uiProps, res: baseAtom.store[constructorProps.atom[1]] as FetchStoreResponse<T_Res_Data> })
            : null
        }
      </>

      const beRender = () => <>
        <Suspense fallback={uiProps.onLoad?.()}>
          {render({ status, uiProps, res: resAsync() })}
        </Suspense>
      </>

      return <>
        <Show when={status() === 'atomRendered'} fallback={beRender()}>
          {feRender()}
        </Show>
      </>
    }
  }
}



export type StreamProps<
  T_Req extends BaseApiReq,
  T_Res_Data extends AceResData,
  T_Atoms extends Atoms
> = BaseStreamProps<T_Req, T_Res_Data, T_Atoms> & (
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



type BaseStreamProps<
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
   * - When an `atom` prop is set we automatically sync `BE` data w/ the `atom`
   * - On Refresh if we have `atom` data defined & BE data is loading, we'll show atom data, and then when the BE data is ready we'll show BE data automatically
   * - The first prop passed to the tuple is `baseAtom`
   * - The 2nd prop passed to the tuple is the key w/in the atoms object that we should sync w/
   */
  atom?: [InferAtoms<T_Atoms>, keyof T_Atoms],

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
