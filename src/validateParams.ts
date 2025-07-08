import type { URLPathParams, URLSearchParams, ValidateSchema } from './fundamentals/types'


export function validateParams< T_Path_Params extends URLPathParams = {}, T_Search_Params extends URLSearchParams = {} >({rawParams, rawSearch, pathParamsSchema, searchParamsSchema}: { rawParams: URLPathParams, rawSearch: URLSearchParams, pathParamsSchema?: ValidateSchema<T_Path_Params>, searchParamsSchema?: ValidateSchema<T_Search_Params> }): {pathParams: T_Path_Params, searchParams: T_Search_Params} {
  let pathParams = {} as T_Path_Params
  let searchParams = {} as T_Search_Params

  if (pathParamsSchema) pathParams = pathParamsSchema.parse(rawParams)
  if (searchParamsSchema) searchParams = searchParamsSchema.parse(rawSearch)

  return { pathParams, searchParams }
}
