/**
 * 🧚‍♀️ How to access:
 *     - import { onAPIEvent } from '@ace/onAPIEvent'
 */



import { API } from './api'
import { on404 } from '../on404'
import { callB4 } from '../callB4'
import { ScopeAPI } from './scopeAPI'
import { AceError } from './aceError'
import { GoResponse } from './goResponse'
import { validateBody } from '../validateBody'
import { json, redirect } from '@solidjs/router'
import type { APIEvent, RegexMap } from './types'
import { callAPIResolve } from '../callAPIResolve'
import { validateParams } from '../validateParams'
import { eventToPathname } from '../eventToPathname'
import { pathnameToMatch } from '../pathnameToMatch'
import { getSearchParams } from '../getSearchParams'


export async function onAPIEvent(event: APIEvent, apis: RegexMap<'api'>) {
  try {
    const routeMatch = await pathnameToMatch(eventToPathname(event), apis)

    if (routeMatch?.handler instanceof API && typeof routeMatch.handler.values.resolve === 'function') {
      const { pathParams, searchParams } = validateParams({
        rawParams: routeMatch.params,
        rawSearch: getSearchParams(event),
        pathParamsParser: routeMatch.handler.values.pathParamsParser,
        searchParamsParser: routeMatch.handler.values.searchParamsParser
      })

      const body = (routeMatch.handler.values.bodyParser)
        ? await validateBody({api: routeMatch.handler, event})
        : {}

      const scope = ScopeAPI.CreateFromHttp(event, pathParams, searchParams, body)

      if (routeMatch.handler.values.b4) {
        const b4Response = await callB4(routeMatch.handler, { body, pathParams, searchParams })
        if (b4Response) return b4Response as any
      }

      return await callAPIResolve(routeMatch.handler, scope)
    } else {
      return on404()
    }
  } catch (error) {
    if (error instanceof GoResponse) return redirect(error.url)
    else return json(AceError.catch({ error }), {status: 400})
  }
}
