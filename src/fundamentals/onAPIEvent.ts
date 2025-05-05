/**
 * 🧚‍♀️ How to access:
 *     - import { onAPIEvent } from '@ace/onAPIEvent'
 */



import { BE } from './be'
import { API } from './api'
import { json } from '@solidjs/router'
import { AceError } from '../aceError'
import type { APIEvent } from './types'
import { eventToPathname } from '../eventToPathname'
import { pathnameToMatch } from '../pathnameToMatch'


export async function onAPIEvent(event: APIEvent, apis: Record<string, API<any>>) {
  try {
    const routeMatch = pathnameToMatch(eventToPathname(event), apis)

    if (routeMatch?.handler instanceof API && typeof routeMatch.handler.values.resolve === 'function') {
      const be = BE.CreateFromHttp(event, routeMatch.params, {})
      return await routeMatch.handler.values.resolve(be)
    }
  } catch (error) {
    return json(AceError.catch({ error }), { status: 400 })
  }
}
