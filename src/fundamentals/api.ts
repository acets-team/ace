/**
 * 🧚‍♀️ How to access:
 *     - import { API } from '@ace/api'
 *     - import type { APIResolveFunction, UnwrapAceResponse } from '@ace/api'
 */


import type { BE } from './be'
import { pathnameToPattern } from './pathnameToPattern'
import type { APIBody, URLSearchParams, URLParams, B4, AceResponse } from './types'



/** - Create a GET or POST, API endpoint */
export class API<T_Params extends APIBody = {}, T_Search extends URLSearchParams = {}, T_Body extends URLParams = {}, T_Response extends any | unknown = unknown> {
  public readonly values: {
    path: string
    pattern: RegExp
    b4?: B4
    resolve?: APIResolveFunction<T_Params, T_Search, T_Body, T_Response>,
    fn?: string
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
   * - 🚨 When calling `go()` from w/in a `b4` a return type is required, b/c ts needs to know about all api's when we call `go()` to provide autocomplete but we are defining an api while calling `go()`. So the return type stops the loop of defining & searching
   * @example
    ```ts
    import { API } from '@ace/api'
    import { authB4 } from '@src/lib/b4'
    import { M_Contract } from '@src/db/M_Contract'

    export const GET = new API('/api/contract/:contractId')
      .b4(authB4)
      .params<{contractId: string}>()
      .resolve(async (be) => {
        return be.json({ params: be.getParams() })
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
    import { M_Contract } from '@src/db/M_Contract'

    export const GET = new API('/api/contract/:contractId')
      .b4(authB4)
      .params<{contractId: string}>()
      .resolve(async (be) => {
        return be.json({ params: be.getParams() })
      })
    ```
    */
    resolve<T_Resolve_Fn extends APIResolveFunction<T_Params, T_Search, T_Body, any>>(resolveFunction: T_Resolve_Fn): API<T_Params, T_Search, T_Body, UnwrapAceResponse<Awaited<ReturnType<T_Resolve_Fn>>>> {

      (this.values as any).resolve = resolveFunction as any

      return this as unknown as API<
        T_Params,
        T_Search,
        T_Body,
        UnwrapAceResponse<Awaited<ReturnType<T_Resolve_Fn>>>
      >
    }



  /**
   * ### Set the type for the url params
   * - If `.params()` is below `.resolve() `then `.resolve()` won't have typesafety
   * @example
    ```ts
    export const GET = new API('/api/fortune/:id')]
      .params<{ id: number }>()
      .resolve(async (be) => {
        const params = be.getParams()
        return be.json({ params })
      })
    ```
   */
  params<T_New_Params extends URLParams>(): API<T_New_Params, T_Search, T_Body, T_Response> {
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


    export const POST = new API('/api/create-individual')
      .b4(authB4)
      .body<CreateIndividualSchema>()
      .resolve(async (be) => {
        const body = createIndividualSchema.parse(await be.getBody())

        const {userId} = await parseSessionData()

        return be.json({ userId, body })
      })
    ```
   */
  body<T_New_Body extends APIBody>(): API<T_Params, T_Search, T_New_Body, T_Response> {
    return this as any
  }


  search<T_New_Search extends URLSearchParams>(): API<T_Params, T_New_Search, T_Body, T_Response> {
    return this as any
  }
}


export type APIResolveFunction<
  T_Params extends URLParams,
  T_Search extends URLSearchParams,
  T_Body extends APIBody,
  T_Fn_Response
> = (be: BE<T_Params, T_Search, T_Body>) => Promise<T_Fn_Response | AceResponse<T_Fn_Response>>


export type UnwrapAceResponse<T> = T extends AceResponse<infer U> ? U : T
