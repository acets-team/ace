/**
 * 🧚‍♀️ How to access:
 *     - import { load, beGET, bePOST } from '@ace/load'
 */


import { go } from './go'
import { config } from 'ace.config'
import { AceError } from '../aceError'
import { getCookie } from 'vinxi/http'
import { buildURL } from '../buildURL'
import { getBaseUrl } from './getBaseUrl'
import type * as apisBE from '../apis.be'
import { query, createAsync, AccessorWithLatest } from '@solidjs/router'
import type { GET_Paths, POST_Paths, InferResponseGET, InferResponsePOST, Routes, GoResponse, APIFnOptions } from './types'



/**
 * ### Does the lovely Solid Start `query()` + `createAsync()` combo for us!
 * - On initial page load if a load() is present on the page, this request will begin on the server, if it's done before the page has rendered the content will be in the original render, else will be streamed in, so please put responsees w/in <Suspense>
 * - On SPA navigation this request will begin in the browser
 * - We recommend calling .fn() on your API when you'd love to use that api w/in a load() b/c then on page load, a function call will be made, which is 100x faster then an HTTP, TCP, Serialization handshake on the backend
 * @param fetchFn - Anonymous async function
 * @param cacheKey - Helps browser cache this data for back button, or multi calls on page, but a page refresh is always fresh data
 * @returns `AccessorWithLatest<undefined | Awaited<ReturnType<fetchFn>>>`
 */
export function load<T_Response>(fetchFn: () => Promise<T_Response>, cacheKey: string): AccessorWithLatest<undefined | NarrowResponse<T_Response>> {
  const loaded = query(fetchFn, cacheKey)
  return createAsync(() => loaded())
}


/**
 * - Call BE api GET endpoint from BE w/ intellisense
 * - Typically called w/in a `load()` during component render
 * - on error => `console.error()` the error and return null or error based on `options.returnError`, defaults to return null
 */
export function beGET<T extends GET_Paths>(path: T, options?: APIFnOptions<typeof apisBE.gets[T]>): Promise<GoResponse | InferResponseGET<T>> {
  'use server'
  const o = options ?? ({} as any)

  return _beAPI<InferResponseGET<T>>({
    url: buildURL(path, o.params),
    method: 'GET',
    cookieKey: config.cookieKey,
  })
}



/**
 * - Call BE api POST endpoint from BE w/ intellisense
 * - Typically called w/in a `load()` during component render
 * - on error => `console.error()` the error and return null or error based on `options.returnError`, defaults to return null
 */
export function bePOST<T extends POST_Paths>(path: T, options?: APIFnOptions<typeof apisBE.posts[T]>): Promise<GoResponse | InferResponsePOST<T>> {
  'use server'
  const o = options ?? ({} as any)

  return _beAPI<InferResponsePOST<T>>({
    url: buildURL(path, o.params),
    method: 'POST',
    cookieKey: config.cookieKey,
    body: o.body,
  })
}



/** 
 * - 🚨 If the response headers Content-Type is not `application/json` we will do `await response.text()` and give you that response in an a thrown error and not do `await response.json()`
 * - Typically called by a `beGET()` or `bePOST()` which automatically adds the `application/json` header
 * - Sends current cookie w/ request
 * - If response is a redirect => `_beAPI()` will do the solidjs redirect()
 * - If there was an error => parse / throw it
 * - If all good => Respond w/ parsed data
 */
export async function _beAPI<T_Response>({ url, cookieKey, method = 'GET', body }: { url: string, cookieKey?: string, method: 'GET' | 'POST', body?: any }): Promise<GoResponse | T_Response> {
  'use server'

  try {
    if (!cookieKey) throw new Error('Please set the "cookieKey" @ "ace.config" for "_beAPI()"')

    const cookieValue = getCookie(cookieKey)
    const Cookie = cookieKey + "=" + cookieValue
    const requestInit: RequestInit = { method, headers: { Cookie } }

    if (method === 'POST') requestInit.body = body

    const response = await fetch(getBaseUrl() + url, requestInit)

    if (response.redirected) return go(response.url as Routes)

    const contentType = response.headers.get('Content-Type') || ''

    if (!contentType.includes('application/json')) throw new AceError({ message: '❌ BE Async Error', rawBody: await response.text(), status: response.status, statusText: response.statusText })
    else {
      const res: T_Response = await response.json()
      return res
    }
  } catch (error) {
    throw AceError.catch({ error })
  }
}


/**
 * - This setup is designed to handle cases where a fetcher returns:
 *     - a native Response
 *     - a custom response shape with a .customBody()
 *     - raw data
 * - It ensures the returned type reflects actual payload data,
 * - These types happen deep in solid internals & haven't figured out how to get em out reliably yet w/o copying
 */
type NarrowResponse<T_PossibleResponse> =
  T_PossibleResponse extends CustomResponse<infer T_ResponseData>
    ? T_ResponseData
    : T_PossibleResponse extends Response
      ? never
      : T_PossibleResponse

type CustomResponse<T_ResponseData> = Omit<Response, "clone"> & {
  customBody: () => T_ResponseData;
  clone(...args: readonly unknown[]): CustomResponse<T_ResponseData>;
}