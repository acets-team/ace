/**
 * 🧚‍♀️ How to access:
 *     - import { createRouteUrl } from '@ace/createRouteUrl'
 */


import { buildUrl } from '../buildUrl'
import type { Routes, RoutePath2PathParams, RoutePath2SearchParams } from './types'


/**
 * - Get typesafe autocomplete assistance when creating a route url
 * @example
  ```ts
  import {buildOrigin} from '@ace/env'

  return scope.success({
    url: buildOrigin + createRouteUrl('/magic-link/:token', {pathParams: {token}})
  })
  ```
 * @param path - As defined at `new Route()`
 * @param params.pathParams - Path params
 * @param params.searchParams - Search params
 */
export function createRouteUrl<T_Path extends Routes>(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }): string {
  return buildUrl(path, {pathParams: params?.pathParams, searchParams: params?.searchParams})
}
