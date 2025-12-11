/**
 * 🧚‍♀️ How to access:
 *     - import { createRouteUrl } from '@ace/createRouteUrl'
 */


import { mapRoutes } from './mapRoutes'
import type { Routes, RoutePath2PathParams, RoutePath2SearchParams } from './types'


/**
 * - Get type-safe autocomplete assistance when creating a route url
 * @example
  ```ts
  return scope.success({
    url: createRouteUrl('/magic-link/:token', { absoluteUrl: true, pathParams: {token} })
  })
  ```
 * @param path - As defined at `new Route()`
 * @param props.absoluteUrl - Optional, IF `true` we will append the buildOrigin from `@ace/env` to the URL
 * @param props.pathParams - Path params
 * @param props.searchParams - Search params
 */
export function createRouteUrl<T_Path extends Routes>(path: T_Path, props?: { absoluteUrl?: boolean, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }): string {
  const entry = mapRoutes[path]
  if (!entry) return ''

  return entry.buildUrl(props)
}
