/**
 * 🧚‍♀️ How to access:
 *     - import { load, beGET, bePOST } from '@ace/load'
 */


import { query, createAsync, AccessorWithLatest } from '@solidjs/router'



/**
 * ### Does the lovely Solid Start `query()` + `createAsync()` combo for us!
 * - On initial page load if a load() is present on the page, this request will begin on the server, if it's done before the page has rendered the content will be in the original render, else will be streamed in, so please put responsees w/in <Suspense>
 * - On SPA navigation this request will begin in the browser
 * - We recommend calling .fn() on your API when you'd love to use that api w/in a load() b/c then on page load, a function call will be made, which is 100x faster then an HTTP, TCP, Serialization handshake on the backend
 * @param fetchFn - Anonymous async function
 * @param cacheKey - Helps browser cache this data for back button, or multi calls on page, but a page refresh is always fresh data
 * @returns `AccessorWithLatest<undefined | Awaited<ReturnType<fetchFn>>>`
 */
export function load<T_Response>(fetchFn: () => Promise<T_Response>, cacheKey: string): AccessorWithLatest<T_Response | undefined> {
  const loaded = query(fetchFn, cacheKey)

  return createAsync(async () => {
    const res = await loaded()

    if (res instanceof Response) {
      const json = await res.json()
      return json as T_Response
    }

    return res as T_Response
  })
}
