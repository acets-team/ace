/**
 * 🧚‍♀️ How to access:
 *     - import { onAPIEvent } from '@ace/onAPIEvent'
 */



import { BE } from './be'
import { API } from './api'
import { AceError } from './aceError'
import type { APIEvent } from './types'
import { GoResponse } from './goResponse'
import { json, redirect } from '@solidjs/router'
import { callAPIResolve } from '../callAPIResolve'
import { eventToPathname } from '../eventToPathname'
import { pathnameToMatch } from '../pathnameToMatch'
import { getSearchParams } from '../getSearchParams'
import { validateParams } from '../validateParams'


export async function onAPIEvent(event: APIEvent, apis: Record<string, API<any>>) {
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
      return await callAPIResolve(routeMatch.handler, be)
    } else {
      return json({ data: null, error: { isAceError: true, message: 'Not Found' } }, { status: 404 })
    }
  } catch (error) {
    if (error instanceof GoResponse) return redirect(error.url)
    else return json(AceError.catch({ error }), { status: 400 })
  }
}
