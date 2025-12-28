import { isServer } from 'solid-js/web'
import { unwrap } from 'solid-js/store'
import { Loading } from './fundamentals/loading'
import { goHeaderName } from './fundamentals/vars'
import { parseError } from './fundamentals/parseError'
import { AceResponse } from './fundamentals/aceResponse'
import type { StreamProps } from './fundamentals/stream'
import { useNetworkStatus } from './fundamentals/useNetworkStatus'
import type { ScopeComponent } from './fundamentals/scopeComponent'
import { createAsyncStore, redirect, revalidate, type AccessorWithLatest } from '@solidjs/router'
import { onMount, onCleanup, createEffect, For, Index, type Setter, type Accessor } from 'solid-js'
import type { BaseApiReq, AceResData, AceResEither, UILoopDataFn, FetchFn, UISuspenseFn, FetchStoreResponse, LoadStatus, StreamStatus, UIProps, AceResErrorEither, InferAtoms } from './fundamentals/types'



export function render<T_Res_Data extends AceResData, T_Item extends AceResData>(props: {
  status: Accessor<LoadStatus | StreamStatus>,
  uiProps: UIProps<T_Res_Data, T_Item>,
  res?: FetchStoreResponse<T_Res_Data>
}) {
  if (props.status() === 'loading') { // loading state
    return props.uiProps.onLoad?.() ?? null
  }

  if (props.res?.error) { // error state
    return props.uiProps.error?.(props.res.error) ?? null
  }

  const data = props.res?.data // status is 'success' or 'atomRendered' here, and no error exists

  if (props.uiProps.for || props.uiProps.index) { // for / index
    const getLoopArray = () => { // get array via data and/or loopData
      if (!data) return null

      if (props.uiProps.loopData) {
        return (props.uiProps.loopData as UILoopDataFn<T_Res_Data, T_Item>)(data)
      }

      return data as unknown as T_Item[] | null
    }

    // render <Index>
    if (props.uiProps.index) {
      return <>
        <Index each={getLoopArray()}>{
          (item, index) => props.uiProps.index!(item, index)
        }</Index>
      </>
    }

    // render <For>
    return <>
      <For each={getLoopArray()}>{
        (item, index) => props.uiProps.for!(item, index)
      }</For>
    </>
  }

  if (props.uiProps.suspense) { // call suspense fn
    return (props.uiProps.suspense as UISuspenseFn<T_Res_Data>)(data as T_Res_Data | undefined)
  }

  return data // fallback, display raw JSON
    ? JSON.stringify(data)
    : null
}



export async function innerQuery<T_Req extends BaseApiReq, T_Res_Data extends AceResData>(res: Awaited<ReturnType<FetchFn<T_Req, T_Res_Data>>>, setStatus: Setter<LoadStatus>): Promise<AceResEither<T_Res_Data>> {
  if (res instanceof Response) {
    const location = res.headers.get(goHeaderName)

    if (location) {
      throw new Error('redirect', { cause: { location } })
    }

    const result = await parseResponse<T_Res_Data>(res)

    if (result.error) setStatus('error')
    else setStatus('success')

    return result
  }

  return res as AceResEither<T_Res_Data>
}



export function fetchCreateAsync<T_Req extends BaseApiReq, T_Res_Data extends AceResData>(scope: ScopeComponent, resQuery: (req: T_Req) => Promise<AceResEither<T_Res_Data>>, constructorReq: (() => T_Req) | undefined, reconcileKey: string | undefined, deferStream: boolean) {
  const defaultReq: BaseApiReq = {} // default request object that satisfies the T_Req constraint if req is not provided

  const asyncFn = async () => {
    try {
      // call query using the provided request data or the default request
      const reqData: T_Req = constructorReq ? constructorReq() : (defaultReq as T_Req)
      const result = await resQuery(reqData)
      return result
    } catch (e) {
      const result = parseError(e)
      const error = result.error

      if (error.message === 'redirect' && error.cause?.location && typeof error.cause.location === 'string') { // IF we asked for a redirect via throw @ innerQuery -> redirect
        throw isServer ? redirect(error.cause.location) : window.location.href = error.cause.location
      }

      return result
    }
  }

  return createAsyncStore(asyncFn, {
    deferStream: deferStream,
    reconcile: {
      merge: true,
      key: reconcileKey || 'id'
    }
  })
}



export async function parseResponse<T_Res_Data extends AceResData>(response: any): Promise<AceResEither<T_Res_Data>> {
  try {
    if (!(response instanceof Response)) {
      throw new Error('API function did not return a Response object.')
    }

    let body: any

    let isJsonContentType = response.headers.get('content-type')?.toLowerCase().includes('json')

    if (response instanceof AceResponse) {
      if (!isJsonContentType) {
        throw new Error('AceResponse returned without application/json content-type.')
      }

      const clonedResponse = response.clone()
      body = await clonedResponse.json()
    } else {
      if (!isJsonContentType) {
        throw new Error('API response must have Content-Type: application/json.')
      }
      const clonedResponse = response.clone()
      body = await clonedResponse.json()
    }

    if (body.error) {
      body.data = null
      return body as AceResEither<T_Res_Data>
    }

    if (body.data !== undefined || body.error === null) { // defined data OR no error (just returned scope.success())
      body.error = null
      return body as AceResEither<T_Res_Data>
    }

    throw new Error('Parsed API response body is malformed. Expected {data: ...} or {error: ...}.')
  } catch (e: any) {
    return parseError(e)
  }
}



export const tsxDefaultError = (e: AceResErrorEither['error']) => e.message

export const tsxDefaultOnLoad = () => <Loading />

export const createShowBE = (setStatus: Setter<StreamStatus>) => () => setStatus('success')

export const createShowStore = (setStatus: Setter<StreamStatus>, atom: StreamProps<any, any, any>['atom']) => () => {
  if (atom) setStatus('atomRendered')
}



export function onResponse(props: { atom?: StreamProps<any, any, any>['atom'], resAsync?: AccessorWithLatest<AceResErrorEither<any> | AceResEither<any> | undefined>, setStatus: Setter<StreamStatus>, baseAtom?: InferAtoms<any> }) {
  const _resAsync = unwrap(props.resAsync?.())

  props.baseAtom?.set(props.atom?.[1] as any, _resAsync as any) // set() + generics is crazy w/o any

  if (typeof _resAsync === 'object') {
    if ('data' in _resAsync && _resAsync.data) props.setStatus('success')
    else if ('error' in _resAsync && _resAsync.error) props.setStatus('error')
  }
}



export function createRun(setStatus: Setter<any>, queryKey: string, onResponse: () => void) {
  return async () => {
    setStatus('loading')
    await revalidate(queryKey, true)
    onResponse()
  }
}



export function runOnWindowToggle(run: () => void, runOnWindowToggle?: boolean) {
  if (runOnWindowToggle) { // when someone leaves and comes back
    onMount(() => {
      window.addEventListener('focus', run)

      onCleanup(() => {
        window.removeEventListener('focus', run)
      })
    })
  }
}



export function runOnNetworkToggle(run: () => void, runOnNetworkToggle?: boolean) {
  if (runOnNetworkToggle) { // when someone leaves and comes back
    createEffect((prevStatus) => {
      const status = useNetworkStatus()()

      if (prevStatus === undefined) {
        return status
      }

      if (prevStatus === 'offline' && status === 'online') {
        run()
      }

      return status
    }, undefined)
  }
}
