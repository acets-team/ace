/**
 * 🧚‍♀️ How to access:
 *     - import { load } from '@ace/load'
 */


import { AceError } from './aceError'
import { query, createAsync } from '@solidjs/router'
import { createSignal, onMount, type Accessor } from 'solid-js'


/**
 * ### Does the lovely Solid Start `query()` + `createAsync()` combo for us!
 * - On initial page load if a `load()` is present on the page, this request will begin on the server, if the request finishes before the page has rendered the content will be in the original render, else will be streamed in
 * - On SPA navigation this request will begin in the browser
 * - 🚨 Please put response w/in `<Suspense>` or else things will get weird (duplicate calls made on fe, page flickers, etc)
 * - With `{deferStream: true}`:
 *     - Streaming for a resource is delayed until it resolves
 *     - However, page shell and other non-deferred content still stream right away
 *     - With `{deferStream: false}` (default), if we set headers (ex: cookies) in an api some of the response may have already been sent to the `fe` and then we get the error: `Cannot set headers after they are sent to the client`
 *     - Gives us safe timing for cookie logic (headers do not get flushed early) while retaining progressive rendering UX
 * @example
    ```ts
    const air = load(() => apiCharacter({pathParams: {element: 'air'}}), '💨')
    ```
 * @param fetchFn - Anonymous async function
 * @param cacheKey - Helps browser cache this data for back button, or multi calls on page, but a page refresh is always fresh data and can be used w/ our `reload()` or Solid's `revalidate()` https://docs.solidjs.com/solid-router/reference/data-apis/revalidate
 * @param apiSetsCookies - 🚨 If the api sets cookies then this must be true. This will ensure the browser sends this request and then the browser will recieve the response w/ Set-Cookie headers.
 */
export function load<T_Response>( fetchFn: () => Promise<T_Response>, cacheKey: string, apiSetsCookies?: boolean ): Accessor<T_Response | undefined> {
  if (apiSetsCookies) {
    const [response, setResponse] = createSignal<T_Response>()

    onMount(async () => {
      try {
        const response = await fetchFn()

        if (response instanceof Response) {
          const clonedResponse = response.clone()
          const data = await clonedResponse.json() as T_Response

          setResponse(() => data)
        }

        setResponse(() => response)
      } catch (error) {
        const e =  await AceError.catch(error) as T_Response
        setResponse(() => e)
      }
    })

    return response
  } else {
    const loaded = query(fetchFn, cacheKey) // if a redirect status is returned here, the redirect happens & `createAsync()` does not run

    return createAsync(async () => {
      try {
        const response = await loaded()

        if (response instanceof Response) {
          const clonedResponse = response.clone()
          const data = await clonedResponse.json() as T_Response

          return data
        }

        return response as T_Response
      } catch (error) {
        return await AceError.catch(error) as T_Response
      }
    }, {deferStream: true})
  }
}
