/**
 * 🧚‍♀️ How to access:
 *     - import { go, Go, goThrow } from '@ace/go'
 */


import { respond } from './respond'
import { buildURL } from './buildURL'
import { GoResponse } from './goResponse'
import type { Routes, RoutePath2PathParams, AceResponse, RoutePath2SearchParams } from './types'





/**
 * - Redirect response w/ simple options
 * @param path - As specified at `new Route()`, press control+space to get intellisense to current routes
 * @param params - Maybe optional, as specified at `new Route()`, press control+space to get intellisense to current routes
 * @returns - An API Response of type `AceResponse<null>`
 */
export function go<T_Path extends Routes>(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }): AceResponse<null> {
  return respond({ go: buildURL(path, {pathParams: params?.pathParams, searchParams: params?.searchParams}), status: 301 })
}



/**
 * - Redirect response w/ all options
 * @param options.path - As specified at `new Route()`, press control+space to get intellisense to current routes
 * @param options.params - Maybe optional, as specified at `new Route()`, press control+space to get intellisense to current routes
 * @param options.status - Optional, HTTP Response Status, Defaults to `301`
 * @param options.headers - Optional, HTTP Response Headers
 * @returns - An API Response of type `AceResponse<null>`
 */
export function Go<T_Path extends Routes>({path, pathParams, searchParams, status = 301, headers}: { path: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, status?: number, headers?: HeadersInit }): AceResponse<null> {
  return respond({ go: buildURL(path, {pathParams, searchParams}), status, headers })
}


/**
 * - If you'd love to throw a `go()` (redirect) rather then return it throw `goThrow()`
 * - Helpful when you'd love to throw redirects in a function and not add the redirect to your return type
 * @example
  ```ts
  export async function example(): Promise<JWTResponse> {
    const jwt = await jwtCookieGet()

    if (!jwt.isValid) throw goThrow('/sign-in')

    const response: JWTResponse = { sessionId: jwt.payload.sessionId }

    return response
  }
  ```
 * - Also helpful if you'd love to do a redirect @ `new Route().b4()` to avoid the circular dependency of defining a route and asking for all route paths in the .b4() > .go() in the same chain, throw breaks that chain and works the same :)
 * - When the .b4() is declared as a variable like .b4(authB4) you can just `return go()` in the authB4, this is when the b4 function is defined on the `new Route()` and not as a variable
 * @example
  ```ts
  import { goThrow } from '@ace/go'
  import { Route } from '@ace/route'


  export default new Route('/')
    .b4(async () => {
      throw goThrow('/sign-in')
    })
  ```
 * @param path - As specified at `new Route()`, press control+space to get intellisense to current routes
 * @param params - Maybe optional, as specified at `new Route()`, press control+space to get intellisense to current routes
 * @returns - A `GoResponse` object which when found in a catch block (b/c it's thrown) will handle the redirect for us
 */
export function goThrow<T_Path extends Routes>(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }) {
  return new GoResponse(buildURL(path, {pathParams: params?.pathParams, searchParams: params?.searchParams}))
}
