/**
 * 🧚‍♀️ How to access:
 *     - import { load } from '@ace/load'
 */


import { goHeader } from './vars'
import { AceError } from './aceError'
import { isServer } from 'solid-js/web'
import {createSignal, onMount, type Accessor } from 'solid-js'
import { query, createAsync, redirect } from '@solidjs/router'



/**
 * ### Does the lovely Solid Start `query()` + `createAsync()` combo for us!
 * - On initial page load if a `load()` is present on the page, this request will begin on the server, if the request finishes before the page has rendered the content will be in the original render, else will be streamed in
 * - On SPA navigation this request will begin in the browser
 * - 🚨 Please put response w/in `<Suspense>` or else things will get weird (duplicate calls made on fe, page flickers, etc)
 * @example
    ```ts
    const air = load(() => apiCharacter({pathParams: {element: 'air'}}), '💨')
    ```
 * @param fetchFn - Anonymous async function
 * @param cacheKey - Helps browser cache this data for back button, or multi calls on page, but a page refresh is always fresh data and can be used w/ our `reload()` or Solid's `revalidate()` https://docs.solidjs.com/solid-router/reference/data-apis/revalidate
 * @param apiSetsCookies - 🚨 If the api sets cookies then this must be true. This will ensure the browser sends this request and then the browser will recieve the response w/ Set-Cookie headers.
 */
export function load<T_Response>(fetchFn: () => Promise<T_Response>, cacheKey: string, apiSetsCookies?: boolean): Accessor<T_Response | undefined> {
  if (apiSetsCookies) {
    const [response, setResponse] = createSignal<T_Response>()

    onMount(async () => setResponse(await getResponse(await fetchFn())))

    return response
  } else {
    const loaded = query(fetchFn, cacheKey)

    return createAsync(async () => await getResponse(await loaded()))
  }
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
