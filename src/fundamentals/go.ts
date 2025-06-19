/**
 * 🧚‍♀️ How to access:
 *     - import { go, Go } from '@ace/go'
 */


import { respond } from './respond'
import { buildURL } from './buildURL'
import { GoResponse } from './goResponse'
import type { Routes, RoutePath2Params, AceResponse } from './types'



/**
 * - Provides intellisense to current routes
 * - Returns a Response object that will be redirected server side
 * - Does a status of 301 and sends no custom headers, if you'd love custom headers sent call `Go()`
 */
export function go<T_Path extends Routes>(path: T_Path, params?: RoutePath2Params<T_Path>): AceResponse<null> {
  return respond({ go: buildURL(path, params), status: 301 })
}


/**
 * - Provides intellisense to current routes
 * - Returns a Response object that will be redirected server side
 * - If you'd love a simpler function call `go()`
 */
export function Go<T_Path extends Routes>({path, params, status = 301, headers}: { path: T_Path, params?: RoutePath2Params<T_Path>, status?: number, headers?: HeadersInit }): AceResponse<null> {
  return respond({ go: buildURL(path, params), status, headers })
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
 * - Also helpful if you'd love to do a redirect in a `new Route().b4()` to avoid the circular dependency
 * @example
  ```ts
  import { goThrow } from '@ace/go'
  import { Route } from '@ace/route'


  export default new Route('/')
    .b4(async () => {
      throw goThrow('/sign-in')
    })
  ```
 */
export function goThrow<T_Path extends Routes>(path: T_Path, params?: RoutePath2Params<T_Path>) {
  return new GoResponse(buildURL(path, params))
}
