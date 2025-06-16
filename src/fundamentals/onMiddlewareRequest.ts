
/**
 * 🧚‍♀️ How to access:
 *     - import { onMiddlewareRequest } from '@ace/onMiddlewareRequest'
 */


import { API } from './api'
import { Route } from './route'
import { routes } from './createApp'
import { gets, posts } from './apis'
import { AceError } from './aceError'
import type { FetchEvent } from './types'
import { GoResponse } from './goResponse'
import { redirect } from '@solidjs/router'
import { jwtCookieGet } from './jwtCookieGet'
import { eventToPathname } from '../eventToPathname'
import { pathnameToMatch, type RouteMatch } from '../pathnameToMatch'


/**
 * - Typically called by `getMiddleware()`
 * - Adds session data to `event.locals.sessionData`
 * - Matches a `FetchEvent` w/ the proper route or api
 * - If match has a `b4()`, calls it & returns its response
 * - If you would love to call this function, please see `getMiddleware()` for guidance, but it'd looks something like this:
  ```tsx
  export function getMiddleware() {
    return createMiddleware({
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
    event.locals.jwtResponse = await jwtCookieGet(event.nativeEvent)

    const pathname = eventToPathname(event)

    switch(event.request.method) {
      case 'POST': return await onIsRequestingAnAPI(event, pathname, posts)
      case 'GET':
        const routeMatch = pathnameToMatch(pathname, routes)
 
        if (routeMatch?.handler instanceof Route) return await onRouteOrAPIMatched(event, routeMatch)
        else return await onIsRequestingAnAPI(event, pathname, gets)
    }
  } catch (error) {
    return new Response(JSON.stringify(AceError.catch({ error }), null, 2), { status: 401 }) // Only Response objects can be returned from middleware functions. Returning any other value will result in an error. source: https://docs.solidjs.com/solid-start/advanced/middleware#middleware
  }
}
 

async function onRouteOrAPIMatched<T extends API | Route>(event: FetchEvent, routeMatch: RouteMatch<T>) {
  if (routeMatch.handler.values.b4) {
    try {
      return await routeMatch.handler.values.b4(event.locals.jwtResponse)
    } catch (error) {
      if (error instanceof GoResponse) return redirect(error.location)
      else throw error
    }
  }
}


async function onIsRequestingAnAPI(event: FetchEvent, pathname: string, apis: Record<string, API<any>>) {
  const routeMatch = pathnameToMatch(pathname, apis)

  if (routeMatch?.handler instanceof API) {
    return await onRouteOrAPIMatched(event, routeMatch)
  }
}
