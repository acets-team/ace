/**
 * 🧚‍♀️ How to access:
 *     - import { createApiUrl } from '@ace/createApiUrl'
 */


import { mapApis } from './mapApis'
import type { ApiNames, ApiName2SearchParams, ApiName2PathParams } from './types'


/**
 * - Get type-safe autocomplete assistance when creating an api url
 * @example
  ```ts
  return scope.success({
    url: createApiUrl('apiGetExample', { absoluteUrl: true, pathParams: {id} })
  })
  ```
 * @param apiName - As defined at `new API()`
 * @param props.absoluteUrl - Optional, IF `true` we will append the buildOrigin from `@ace/env` to the URL
 * @param props.pathParams - Path params
 * @param props.searchParams - Search params
 */
export function createApiUrl<T_Name extends ApiNames>(name: T_Name, props?: { absoluteUrl?: boolean, pathParams?: ApiName2PathParams<T_Name>, searchParams?: ApiName2SearchParams<T_Name> }): string {
  const entry = mapApis[name]
  if (!entry) return ''

  return entry.buildUrl(props)
}
