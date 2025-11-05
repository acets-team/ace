/**
 * 🧚‍♀️ How to access:
 *     - import { createApiUrl } from '@ace/createApiUrl'
 */


import { buildUrl } from '../buildUrl'
import { regexApiNames } from './regexApiNames'
import type { ApiNames, ApiName2Api, Api2PathParams, Api2SearchParams } from './types'


/**
 * - Get typesafe autocomplete assistance when creating an api url
 * @example
  ```ts
  import {buildOrigin} from '@ace/env'

  return scope.success({
    url: buildOrigin + createApiUrl('apiGetExample', { pathParams: {id} })
  })
  ```
 * @param apiName - As defined at `new API()`
 * @param params.pathParams - Path params
 * @param params.searchParams - Search params
 */
export function createApiUrl<T_Name extends ApiNames>(apiName: T_Name, params?: { pathParams?: Api2PathParams<ApiName2Api<T_Name>>, searchParams?: Api2SearchParams<ApiName2Api<T_Name>> }): string {
  const path = regexApiNames[apiName]?.path

  return path
    ? buildUrl(path, params)
    : ''
}
