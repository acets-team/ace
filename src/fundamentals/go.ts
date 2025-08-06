/**
 * 🧚‍♀️ How to access:
 *     - import { go, Go } from '@ace/go'
 */


import { respond } from './respond'
import { buildUrl } from '../buildUrl'
import type { Routes, RoutePath2PathParams, AceResponse, RoutePath2SearchParams } from './types'





/**
 * - Redirect response w/ simple options
 * @param path - As specified at `new Route()`, press control+space to get intellisense to current routes
 * @param params - Maybe optional, as specified at `new Route()`, press control+space to get intellisense to current routes
 * @returns - An API Response of type `AceResponse<null>`
 */
export function go<T_Path extends Routes>(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }): AceResponse<null> {
  return respond({ go: buildUrl(path, {pathParams: params?.pathParams, searchParams: params?.searchParams}), status: 301 })
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
  return respond({ go: buildUrl(path, {pathParams, searchParams}), status, headers })
}
