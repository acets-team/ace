
/**
 * 🧚‍♀️ How to access:
 *     - import { onMiddlewareRequest } from '@ace/onMiddlewareRequest'
 */


import { API } from './api'
import { Route } from './route'
import { on404 } from '../on404'
import { callB4 } from '../callB4'
import { AceError } from './aceError'
import { GoResponse } from './goResponse'
import type { FetchEvent } from './types'
import { regexRoutes } from './regexRoutes'
import { regexApiPuts } from './regexApiPuts'
import { regexApiGets } from './regexApiGets'
import { validateBody } from '../validateBody'
import { regexApiPosts } from './regexApiPosts'
import { json, redirect } from '@solidjs/router'
import { validateParams } from '../validateParams'
import { regexApiDeletes } from './regexApiDeletes'
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
    await this.#onAPIRequest(this.#event.request.method)

    if (!this.#matchFound && this.#event.request.method === 'GET') {
      const routeMatch = await pathnameToMatch(this.#pathname, regexRoutes)

      if (routeMatch?.handler instanceof Route) await this.#onRequest(routeMatch)
    }
  
    if (!this.#matchFound && this.#pathname.startsWith('/api')) return on404()

    if (this.#response) return this.#response

    // if nothing has been returned at this point then route matching happens via <Route /> components in createApp.tsx
  }


  async #onAPIRequest(method: string) {
    let apis

    switch (method) {
      case 'GET': 
        apis = regexApiGets
        break
      case 'POST': 
        apis = regexApiPosts
        break
      case 'PUT': 
        apis = regexApiPuts
        break
      case 'DELETE': 
        apis = regexApiDeletes
        break
      default:
        throw new Error(`Invalid method @ #onApiRequest b/c "${method}" is not a valid method`)
    }

    const match = await pathnameToMatch(this.#pathname, apis)

    if (match?.handler instanceof API) {
      this.#matchFound = true
      this.#response = await this.#onRequest(match)
    }
  }

  async #onRequest<T extends API | Route>(routeMatch: RouteMatch<T>) {
    try {
      const { pathParams, searchParams } = validateParams({
        rawParams: routeMatch.params,
        rawSearch: getSearchParams(this.#event),
        pathParamsParser: routeMatch.handler.values.pathParamsParser,
        searchParamsParser: routeMatch.handler.values.searchParamsParser
      })
            
      const body = (routeMatch.handler instanceof API && routeMatch.handler.values.bodyParser)
        ? await validateBody({api: routeMatch.handler, event: this.#event})
        : undefined

      if (routeMatch.handler.values.b4) {
        const b4Response = await callB4(routeMatch.handler, { body, pathParams, searchParams }, this.#event)
        if (b4Response) return b4Response
      }
    } catch (error) {
      if (error instanceof GoResponse) return redirect(error.url)
      else throw error
    }
  }
}
