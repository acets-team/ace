/**
 * 🧚‍♀️ How to access:
 *     - import { load, beGET, bePOST } from '@ace/load'
 */


import { AceError } from './aceError'
import { query, createAsync, AccessorWithLatest } from '@solidjs/router'



/**
 * ### Does the lovely Solid Start `query()` + `createAsync()` combo for us!
 * - On initial page load if a load() is present on the page, this request will begin on the server, if the request finishes before the page has rendered the content will be in the original render, else will be streamed in
 * - On SPA navigation this request will begin in the browser
 * - 🚨 Please put response w/in `<Suspense>`
 * @example
    ```ts
    const air = load(() => apiCharacter({pathParams: {element: 'air'}}))
    ```
 * @param fetchFn - Anonymous async function
 * @param cacheKey - Helps browser cache this data for back button, or multi calls on page, but a page refresh is always fresh data and can be used w/ `revalidate()` https://docs.solidjs.com/solid-router/reference/data-apis/revalidate - If no cacheKey is provided we do a toString() on the anonymous function and use that as the cacheKey so `const loadFortune = load(() => apiFortune({ pathParams }))` gets a cacheKey of => `()=>(0,__vite_ssr_import_10__.apiFortune)({pathParams})`
 */
export function load<T_Response>(fetchFn: () => Promise<T_Response>, cacheKey?: string): AccessorWithLatest<T_Response | undefined> {
  const loaded = query(fetchFn, cacheKey || getCacheKey(fetchFn))

  return createAsync(async () => {
    try {
      const response = await loaded()

      if (response instanceof Response) {
        const clonedResponse = response.clone()
        return await clonedResponse.json() as T_Response
      }

      return response as T_Response
    } catch (error) {
      return AceError.catch({ error }) as T_Response
    }
  })
}


function getCacheKey(fetchFn: Function): string {
  return fetchFn.toString().replace(/\s+/g, '') // remove spaces, tabs & newlines
}
