/**
 * 🧚‍♀️ How to access:
 *     - import { onAPIEvent } from '@ace/onAPIEvent'
 */



import { BE } from './be'
import { API } from './api'
import { on404 } from '../on404'
import { callB4 } from '../callB4'
import { AceError } from './aceError'
import type { APIEvent } from './types'
import { GoResponse } from './goResponse'
import { json, redirect } from '@solidjs/router'
import { callAPIResolve } from '../callAPIResolve'
import { validateParams } from '../validateParams'
import { eventToPathname } from '../eventToPathname'
import { pathnameToMatch } from '../pathnameToMatch'
import { getSearchParams } from '../getSearchParams'


export async function onAPIEvent(event: APIEvent, apis: Record<string, API<any,any,any,any,any>>) {
  try {
    const routeMatch = pathnameToMatch(eventToPathname(event), apis)

    if (routeMatch?.handler instanceof API && typeof routeMatch.handler.values.resolve === 'function') {
      const { pathParams, searchParams } = validateParams({
        rawParams: routeMatch.params,
        rawSearch: getSearchParams(event),
        pathParamsSchema: routeMatch.handler.values.pathParamsSchema,
        searchParamsSchema: routeMatch.handler.values.searchParamsSchema
      })

      const be = BE.CreateFromHttp(event, pathParams, searchParams)

      if (routeMatch.handler.values.b4) {
        const b4Response = await callB4(routeMatch.handler, { pathParams, searchParams })
        if (b4Response) return b4Response as any
      }

      return await callAPIResolve(routeMatch.handler, be)
    } else {
      return on404()
    }
  } catch (error) {
    if (error instanceof GoResponse) return redirect(error.url)
    else {
      return json(AceError.catch({ error }), {status: 400})
    }
  }
}
