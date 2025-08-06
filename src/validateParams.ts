import type { UrlPathParams, UrlSearchParams, Parser, AnyValue } from './fundamentals/types'


export function validateParams< T_Path_Params extends UrlPathParams = {}, T_Search_Params extends UrlSearchParams = {} >({rawParams, rawSearch, pathParamsParser, searchParamsParser }: { rawParams: UrlPathParams, rawSearch: UrlSearchParams, pathParamsParser?: Parser<T_Path_Params>, searchParamsParser?: Parser<T_Search_Params> }): {pathParams: T_Path_Params, searchParams: T_Search_Params} {
  let pathParams = {} as T_Path_Params
  let searchParams = {} as T_Search_Params

  if (pathParamsParser) pathParams = pathParamsParser(rawParams as AnyValue<T_Path_Params>)
  if (searchParamsParser) searchParams = searchParamsParser(rawSearch as AnyValue<T_Search_Params>)

  return { pathParams, searchParams }
}
