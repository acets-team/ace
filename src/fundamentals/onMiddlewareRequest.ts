
/**
 * 🧚‍♀️ How to access:
 *     - import { onMiddlewareRequest } from '@ace/onMiddlewareRequest'
 */


import { API } from './api'
import { Route } from './route'
import { on404 } from '../on404'
import { callB4 } from '../callB4'
import { routes } from './createApp'
import { AceError } from './aceError'
import { gets, posts } from '../apis.be'
import type { FetchEvent } from './types'
import { GoResponse } from './goResponse'
import { json, redirect } from '@solidjs/router'
import { validateParams } from '../validateParams'
import { eventToPathname } from '../eventToPathname'
import { getSearchParams } from '../getSearchParams'
import { pathnameToMatch, type RouteMatch } from '../pathnameToMatch'


/**
 * - Typically called by `getMiddleware()`
 * - Matches a request to an api / route
 * - 🚨 To speed this function up there is an assumption made, that your Route does not start w/ a pathname of /api please
 * - On pathname to api / route match validates the search / path params, calls the b4() functions for the api / route and then the resolve() / component()
 * - On no match a json not found response is given w/ a 404 status
 * @example
  ```tsx
  export function getMiddleware() {
    return createMiddleware({
      async onBeforeResponse (e) {
        // custom logic here
      },
      async onRequest (e) {
        const res = await onMiddlewareRequest(e)
        // custom logic here
        if (res) return res
      }
    })
  }
  ```
 */
export async function onMiddlewareRequest(event: FetchEvent): Promise<any> {
  try {
    const pathname = eventToPathname(event)

    switch(event.request.method) {
      case 'POST': return await onAPIRequest(event, pathname, posts)
      case 'GET':
        if (pathname.startsWith('/api')) return await onAPIRequest(event, pathname, gets)
        else {
          const routeMatch = pathnameToMatch(pathname, routes)

          if (routeMatch?.handler instanceof Route) return await onRequest(event, routeMatch)
          else return await onAPIRequest(event, pathname, gets)
        }
    }
  } catch (error) {
    return json(AceError.catch({ error }), { status: 400 })
  }
}


async function onAPIRequest(event: FetchEvent, pathname: string, apis: Record<string, API<any,any,any,any,any>>) {
  const match = pathnameToMatch(pathname, apis)

  if (match?.handler instanceof API) return await onRequest(event, match)
  else return on404()
}
 

async function onRequest<T extends API | Route>(event: FetchEvent, routeMatch: RouteMatch<T>) {
  try {
    const { pathParams, searchParams } = validateParams({
      rawParams: routeMatch.params,
      rawSearch: getSearchParams(event),
      pathParamsSchema: routeMatch.handler.values.pathParamsSchema,
      searchParamsSchema: routeMatch.handler.values.searchParamsSchema
    })

    if (routeMatch.handler.values.b4) {
      const b4Response = await callB4(routeMatch.handler, { pathParams, searchParams }, event)
      if (b4Response) return b4Response
    }
  } catch (error) {
    if (error instanceof GoResponse) return redirect(error.url)
    else throw error
  }
}
