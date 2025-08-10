/**
 * 🧚‍♀️ How to access:
 *     - import { load } from '@ace/load'
 *     - import type { LoadProps } from '@ace/load'
 */


import { isServer } from 'solid-js/web'
import { parseResponse } from '../parseResponse'
import { query, createAsync } from '@solidjs/router'
import { onMount, createSignal, type Accessor } from 'solid-js'



/**
 * ### Load API data into a component on render
 * - On page refresh if a `load()` is present on the page, this request will begin on the server, if the request finishes before the page has rendered the API response will be in the original render, else the API response will be streamed in, so place .tsx API response information w/in a `<Suspense>`
 * - On SPA navigation this request will begin in the browser
 * @example
    ```ts
    const air = load({ key: '💨', fn: () => apiCharacter({pathParams: {element: 'air'}})})
    ```
 * @param props.fn - Anonymous async function
 * @param props.key - Helps browser cache this data, a page refresh is always fresh data, this `props.key` helps you make calls again to the same API using our `reload()` or Solid's `revalidate()`
 * @param props.spa - 🚨 May the api's `.resolve()` or any of the api's `.b4()` functions update cookies? If so `props.spa` must be `true`. This way the request starts from the browser like how single page app's always do and the response comes back to the browser w/ `Set-Cookie` headers. When `props.spa` is `falsy` we're in SSR streaming mode, where there is only 1 HTTP Response given, that has the html shell & `<Suspense>` fallbacks and after that `Response` is given to the user headers / cookies can't be updated, even though additional html chunks are streamed in, same Response, w/ static headers during streaming. So if the `Set-Cookie` header is not in the initial response there is no updating headers during streaming. Long story short (too late), if there is a potential path in the api where cookies are updated, set `props.spa` to true please :)
 * @link https://docs.solidjs.com/solid-router/reference/data-apis/revalidate
 */
export function load<T_Response>({fn, key, spa}: LoadProps<T_Response>): Accessor<T_Response | undefined> {
  if (spa) return loadOnFE(fn, key)
  else return loadOnDemand(fn, key)
}



function loadOnFE<T_Response>(fetchFn: () => Promise<T_Response>, key: string) {
  const [response, setResponse] = createSignal<T_Response>()

  if (!isServer) {
    const loaded = query(fetchFn, key)

    onMount(() => { // if not in an onMount, other onMount's dont happen, idk why
      createAsync(async () => setResponse(await parseResponse(await loaded())))
    })
  }

  return response
}



function loadOnDemand<T_Response>(fetchFn: () => Promise<T_Response>, key: string) {
  const loaded = query(fetchFn, key)
  return createAsync(async () => await parseResponse<T_Response>(await loaded()))
}



export type LoadProps<T_Response> = {
  /** Anonymous async function */
  fn: () => Promise<T_Response>
  /** Helps browser cache this data, a page refresh is always fresh data, this `props.key` helps you make calls again to the same API using our `reload()` or Solid's `revalidate()` */
  key: string
  /** 🚨 May the api's `.resolve()` or any of the api's `.b4()` functions update cookies? If so `props.spa` must be `true`. This way the request starts from the browser like how single page app's always do and the response comes back to the browser w/ `Set-Cookie` headers. When `props.spa` is `falsy` we're in SSR streaming mode, where there is only 1 HTTP Response given, that has the html shell & `<Suspense>` fallbacks and after that `Response` is given to the user headers / cookies can't be updated, even though additional html chunks are streamed in, same Response, w/ static headers during streaming. So if the `Set-Cookie` header is not in the initial response there is no updating headers during streaming. Long story short (too late), if there is a potential path in the api where cookies are updated, set `props.spa` to true please :)  */
  spa?: boolean
}
