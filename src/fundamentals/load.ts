/**
 * 🧚‍♀️ How to access:
 *     - import { load } from '@ace/load'
 *     - import type { LoadProps } from '@ace/load'
 */


import { goHeader } from './vars'
import { AceError } from './aceError'
import { isServer } from 'solid-js/web'
import { query, createAsync, redirect } from '@solidjs/router'
import {createSignal, type Accessor, onMount } from 'solid-js'



/**
 * ### Load API data into a component on render
 * - On page refresh if a `load()` is present on the page, this request will begin on the server, if the request finishes before the page has rendered the API response will be in the original render, else the API response will be streamed in, so place .tsx API response information w/in a `<Suspense>`
 * - On SPA navigation this request will begin in the browser
 * @example
    ```ts
    const air = load({ key: '💨', fn: () => apiCharacter({pathParams: {element: 'air'}})})
    ```
 * @param props.fn - Anonymous async function
 * @param props.key - Helps browser cache this data, a page refresh is always fresh data, this `cachKey` helps you make calls again to the same API using our `reload()` or Solid's `revalidate()`
 * @param props.maySetCookies - 🚨 If the api may set cookies then `maySetCookies` must be true. This will ensure the browser sends this request and then the browser recieves the response w/ Set-Cookie headers
 * @link https://docs.solidjs.com/solid-router/reference/data-apis/revalidate
 */
export function load<T_Response>({fn, key, maySetCookies}:{fn: () => Promise<T_Response>, key: string, maySetCookies?: boolean}): Accessor<T_Response | undefined> {
  if (maySetCookies) return loadOnFE(fn, key)
  else return loadOnDemand(fn, key)
}



function loadOnFE<T_Response>(fetchFn: () => Promise<T_Response>, key: string) {
  const [response, setResponse] = createSignal<T_Response>()

  if (!isServer) {
    const loaded = query(fetchFn, key)

    onMount(() => { // if not in an onMount the screen goes white, idk why
      createAsync(async () => setResponse(await getResponse(await loaded())))
    })
  }

  return response
}



function loadOnDemand<T_Response>(fetchFn: () => Promise<T_Response>, cacheKey: string) {
  const loaded = query(fetchFn, cacheKey)
  return createAsync<T_Response>(async () => await getResponse(await loaded()))
}



async function getResponse<T_Response>(response: any) {
  try {
    if (response instanceof Response) {
      const redirectUrl = response.headers.get(goHeader)

      if (redirectUrl) {
        if (isServer) throw redirect(redirectUrl, { headers: response.headers })
        else {
          window.location.href = redirectUrl
          throw new Error('Redirecting to: ' + redirectUrl)
        }
      }

      const clonedResponse = response.clone()
      const data = await clonedResponse.json() as T_Response

      return data
    }

    return response as T_Response
  } catch (error) {
    return await AceError.catch(error) as T_Response
  }
}



export type LoadProps<T_Response> = {
  /** Anonymous async function */
  fn: () => Promise<T_Response>
  /** Helps browser cache this data, a page refresh is always fresh data, this `cachKey` helps you make calls again to the same API using our `reload()` or Solid's `revalidate()` */
  key: string
  /** 🚨 If the api may set cookies then `apiMaySetCookies` must be true. This will ensure the browser sends this request and then the browser recieves the response w/ Set-Cookie headers */
  maySetCookies?: boolean
}