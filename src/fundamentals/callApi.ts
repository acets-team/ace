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


export async function callApi(event: APIEvent, tree: TreeCreateNode): Promise<Response> {
  try {
    const resTreeSearch = treeSearch(tree, eventToPathname(event))
    if (!resTreeSearch) return onApi404()

    const mapEntry = mapApis[resTreeSearch.key as keyof typeof mapApis]
    if (!mapEntry) return onApi404()

    const info = await mapEntry.info()
    if (!info) return onApi404()

    const resolver = await mapEntry.resolver() as ApiResolverFn<any, any>
    if (!resolver) return onApi404()

    return resolver({
      __mapEntry: mapEntry,
      pathParams: resTreeSearch.params,
      searchParams: getSearchParams(event),
      body: await readBody(event.request)
    })
  } catch (e) {
    return createAceResponse(parseError(e))
  }
}
