/**
 * 🧚‍♀️ How to access:
 *     - import { onAPIEvent } from '@ace/onAPIEvent'
 */



import { API } from './api'
import { AceError } from './aceError'
import { GoResponse } from './goResponse'
import { json, redirect } from '@solidjs/router'
import { callAPIResolve } from '../callAPIResolve'
import type { APIEvent, RegexMap } from './types'
import { eventToPathname } from '../eventToPathname'
import { pathnameToMatch } from '../pathnameToMatch'
import { getSearchParams } from '../getSearchParams'


export async function onAPIEvent(event: APIEvent, apis: RegexMap<'api'>) {
  try {
    const routeMatch = await pathnameToMatch(eventToPathname(event), apis)

    if (!(routeMatch?.handler instanceof API) || typeof routeMatch.handler.values.resolve !== 'function') return on404()

    return await callAPIResolve(event, routeMatch.handler, routeMatch.params, getSearchParams(event), 'onAPIEvent')
  } catch (error) {
    if (error instanceof GoResponse) return redirect(error.url)
    else return json(AceError.catch({ error }), {status: 400})
  }
}


function on404() {
  const notFound = (new AceError({message: 'Not Found', status: 404})).get()
  return json(notFound, {status: 404})
}
