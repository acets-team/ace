/**
 * 🧚‍♀️ How to access:
 *     - import { onAPIEvent } from '@ace/onAPIEvent'
 */


import { mapApis } from './mapApis'
import { onApi404 } from '../onApi404'
import { readBody } from '../readBody'
import { parseError } from './parseError'
import { treeSearch } from '../treeSearch'
import { createAceResponse } from './aceResponse'
import type { TreeCreateNode } from '../treeCreate'
import { getSearchParams } from '../getSearchParams'
import { eventToPathname } from '../eventToPathname'
import type { APIEvent, ApiResolverFn } from './types'
import { createStreamGuard } from '../createStreamGuard'


export async function callApi(event: APIEvent, tree: TreeCreateNode): Promise<Response> {
  try {
    const resTreeSearch = treeSearch(tree, eventToPathname(event))
    if (!resTreeSearch) return onApi404()

    const __mapEntry = mapApis[resTreeSearch.key as keyof typeof mapApis]
    if (!__mapEntry) return onApi404()

    const info = await __mapEntry.info()
    if (!info) return onApi404()

    const resolver = await __mapEntry.resolver() as ApiResolverFn<any, any>
    if (!resolver) return onApi404()

    let __readableStream: undefined | ReadableStream<Uint8Array> = undefined

    if (info.readableStream) {
      // get the limit from header for the Guard
      const limit = Number(event.request.headers.get('content-length') || '0')

      // wrap the body in a Guard so they can't stream 10GB into a 500MB hole
      // will throw if the content-length header does not match the actual piped file length
      __readableStream = event.request.body?.pipeThrough(
        createStreamGuard(limit, "Actual upload exceeded Content-Length")
      )
    }

    return resolver({
      __mapEntry,
      __readableStream,
      pathParams: resTreeSearch.params,
      searchParams: getSearchParams(event),
      body: info.readableStream ? null : await readBody(event.request)
    })
  } catch (e) {
    return createAceResponse(parseError(e))
  }
}
