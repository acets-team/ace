/**
 * 🧚‍♀️ How to access:
 *     - import { API } from '@ace/api'
 *     - import type { APIResolveFunction } from '@ace/api'
 */


import type { BE } from './be'
import { pathnameToPattern } from './pathnameToPattern'
import type { APIBody, URLSearchParams, URLPathParams, B4, AceResponse, AceResponseResponse, ValidateSchema } from './types'



/** - Create a GET or POST, API endpoint */
export class API<T_Params extends URLPathParams = any, T_Search extends URLSearchParams = any, T_Body extends URLPathParams = {}, T_Response = unknown> {
  public readonly values: {
    path: string
    pattern: RegExp
    b4?: B4
    resolve?: APIResolveFunction<T_Params, T_Search, T_Body, T_Response>,
    fn?: string
    pathParamsSchema?: ValidateSchema<any>
    searchParamsSchema?: ValidateSchema<any>
  }

  constructor(path: string, fnName?: string) {
    this.values = {
      path,
      pattern: pathnameToPattern(path),
    }

    if (fnName) this.values.fn = fnName
  }


  /** 
   * ### Set async function to run before api boot
   * - IF `b4()` return is truthy => returned value is sent to the client & api fn is not processed
   * - It is not recomended to do db calls in this function
   * - `b4()` purpose is to:
   *     - Read `event` contents (headers, cookies)
   *     - Append `event.locals`, `event.request` or `event.response`
   *     - Do a redirect
   *     - Return nothing and allow api fn to to process next
   * - 🚨 If returning the response must be a `Response` object b/c this is what is given to the client
   * @example
    ```ts
    import { API } from '@ace/api'
    import { authB4 } from '@src/lib/b4'

    export const GET = new API('/api/contract/:contractId')
      .b4(authB4)
      .params<{contractId: string}>()
      .resolve(async (be) => {
        return be.success(be.getParams())
      })
    ```
   */
  b4(fn: B4): this {
    this.values.b4 = fn
    return this
  }


  /** 
   * ### Set async function to run when api is called
   * @example
    ```ts
    import { API } from '@ace/api'
    import { authB4 } from '@src/lib/b4'

    export const GET = new API('/api/contract/:contractId', 'apiContract')
      .b4(authB4)
      .params<{contractId: string}>()
      .resolve(async (be) => {
        return be.success(be.getParams())
      })
    ```
  */
  resolve<T_Resolve_Fn extends (be: BE<T_Params, T_Search, T_Body>) => Promise<AceResponse<any>>>(resolveFunction: T_Resolve_Fn): API<T_Params, T_Search, T_Body, AceResponseResponse<Awaited<ReturnType<T_Resolve_Fn>>>> {
    this.values.resolve = resolveFunction
    return this as any
  }



  /**
   * ### Set the type for the request body
   * - If `.body()` is below `.resolve() `then `.resolve()` won't have typesafety
   * @example
    ```ts
    import { API } from '@ace/api'
    import { authB4 } from '@src/lib/b4'
    import { parseSessionData } from '@src/lib/parseSessionData'
    import { createIndividualSchema, CreateIndividualSchema } from '@src/schemas/CreateIndividualSchema'


    export const POST = new API('/api/create-individual', 'apiCreateIndividual')
      .b4(authB4)
      .body<CreateIndividualSchema>()
      .resolve(async (be) => {
        const body = createIndividualSchema.parse(await be.getBody())

        const {userId} = await parseSessionData()

        return be.success({ userId, body })
      })
    ```
   */
  body<T_New_Body extends APIBody>(): API<T_Params, T_Search, T_New_Body, T_Response> {
    return this as any
  }


  search<T_New_Search extends URLSearchParams>(): API<T_Params, T_New_Search, T_Body, T_Response> {
    return this as any
  }


  pathParams<NewParams extends URLPathParams>(schema: ValidateSchema<NewParams>): API<NewParams, T_Search> {
    this.values.pathParamsSchema = schema
    return this as unknown as API<NewParams, T_Search>
  }

  searchParams<NewSearch extends URLSearchParams>(schema: ValidateSchema<NewSearch>): API<T_Params, NewSearch> {
    this.values.searchParamsSchema = schema
    return this as unknown as API<T_Params, NewSearch>
  }
}


export type APIResolveFunction<
  T_Params extends URLPathParams,
  T_Search extends URLSearchParams,
  T_Body extends APIBody,
  T_Response_Data
> = (be: BE<T_Params,T_Search,T_Body>) => Promise<AceResponse<T_Response_Data>>
