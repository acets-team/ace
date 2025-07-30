
/**
 * 🧚‍♀️ How to access:
 *     - import { onMiddlewareRequest } from '@ace/onMiddlewareRequest'
 */


import { API } from './api'
import { Route } from './route'
import { callB4 } from '../callB4'
import { AceError } from './aceError'
import { GoResponse } from './goResponse'
import type { FetchEvent } from './types'
import { regexRoutes } from './regexRoutes'
import { json, redirect } from '@solidjs/router'
import { validateParams } from '../validateParams'
import { getSearchParams } from '../getSearchParams'
import { eventToPathname } from '../eventToPathname'
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
    const context = new MiddlewareContext(event)
    const response = await context.getResponse()

    if (response) return response
  } catch (error) {
    return json(AceError.catch({ error }), { status: 400 })
  }
}


export class MiddlewareContext {
  #response: any
  #pathname: string
  #event: FetchEvent
  #matchFound = false

  constructor(event: FetchEvent) {
    this.#event = event
    this.#pathname = eventToPathname(event)
  }


  /**
   * - First checks if this is an api request 
   * - Then checks if this is a route request
   * - If a match is found 
   *    - Validate parqms
   *    - Run b4 functions 
   * - Else (match not found)
   *    - If pathname starts with /api => provide a 404 json
   *    - Else => provide a 404 html
   */
  async getResponse() {
    // we don't validate api's here, we do that @ onAPIEvent b/c there we can access 'use server' items
    if (!this.#matchFound && this.#event.request.method === 'GET' && !this.#pathname.startsWith('/api')) {
      const routeMatch = await pathnameToMatch(this.#pathname, regexRoutes)

      if (routeMatch?.handler instanceof Route) await this.#onRequest(routeMatch)
    }

    if (this.#response) return this.#response

    // if nothing has been returned at this point then route matching happens via <Route /> components in createApp.tsx
  }


  async #onRequest<T extends API | Route>(routeMatch: RouteMatch<T>) {
    try {
      const { pathParams, searchParams } = validateParams({
        rawParams: routeMatch.params,
        rawSearch: getSearchParams(this.#event),
        pathParamsParser: routeMatch.handler.values.pathParamsParser,
        searchParamsParser: routeMatch.handler.values.searchParamsParser
      })

      if (routeMatch.handler.values.b4) {
        const b4Response = await callB4(routeMatch.handler, { pathParams, searchParams }, this.#event)
        if (b4Response) return b4Response
      }
    } catch (error) {
      if (error instanceof GoResponse) return redirect(error.url)
      else throw error
    }
  }
}
