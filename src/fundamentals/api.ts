/**
 * 🧚‍♀️ How to access:
 *     - import { API } from '@ace/api'
 *     - import type { APIResolveFunction, APIValues, APIStorage } from '@ace/api'
 */



import type { ScopeBE } from './scopeBE'
import { pathnameToPattern } from './pathnameToPattern'
import type { B4, Parser, ApiBody, AceResponse, MergeLocals, UrlSearchParams, UrlPathParams, BaseEventLocals, AceResponse2ApiResponse } from './types'



/** 
 * - Create an API endpoint
 * - When defining the API you may give it a path that can be called w/in or w/out the application & a function name
 * - When calling via function name from `FE` a fetch is done and when calling from `BE` the resolve function is called directly
 */
export class API<T_Params extends UrlPathParams = any, T_Search extends UrlSearchParams = any, T_Body extends UrlPathParams = {}, T_Response = unknown, T_Locals extends BaseEventLocals = {}> {
  /** Typed loosely so we may freely mutate it at runtime */
  #storage: APIStorage

  constructor(path: string, fnName: string) {
    this.#storage = { path, pattern: pathnameToPattern(path) }
    this.values.fn = fnName
  }


  /** Public .values getter that casts #storage into APIValues<…>, giving us perfect intelliSense */
  public get values(): APIValues<T_Params, T_Search, T_Body, T_Response, T_Locals> {
    return this.#storage as any
  }


  /** 
   * ### Set async functions to run before route/api boots
   * - IF `b4()` return is truthy => returned value is sent to the client & route handler is not processed
   * - 🚨 If returning the response must be a `Response` object b/c this is what is given to the client
   * @example
    ```ts
    export const GET = new API('/api/character/:element', 'apiCharacter')
      .b4([authB4, eventB4])
    ```
   * @param b4 - Array of functions to happen before `.resolve()`
   */
  b4<const T_B4_Functions extends B4<any>[]>(b4: T_B4_Functions): API<T_Params, T_Search, T_Body, T_Response, MergeLocals<T_B4_Functions>> {
    this.#storage.b4 = b4
    return this as any
  }


  /** 
   * ### Set async function to run when api is called
   * @example
    ```ts
    export const GET = new API('/api/character/:element', 'apiCharacter')
      .pathParams(vParse(object({ element: picklist(elements) })))
      .resolve(async (scope) => {
        return scope.success(scope.pathParams.element)
      })
    ```
   * @param resolveFunction - Async function that holds primary api route handling logic
   */
  resolve<T_Resolve_Fn extends APIResolveFunction<T_Params, T_Search, T_Body, any, T_Locals>>(resolveFunction: T_Resolve_Fn): API<T_Params, T_Search, T_Body, AceResponse2ApiResponse<Awaited<ReturnType<T_Resolve_Fn>>>, T_Locals> {
    this.#storage.resolve = resolveFunction
    return this as any
  }



  /** 
   * ### Set validating / parsing function for this api's body that runs before the api's resolve function
   * @example
    ```ts
    .body(vParse(object({ id: vNum(), choice: vBool(), eamil: vEmail(), createdAt: optional(vDate()), email: pipe(string(), email()) })))
    ```
   * @example
    ```ts
    .body(input => {
      if (typeof input !== 'object' || input === null) throw new Error('input is not an object')

      const raw = (input as any).id
      if (raw === undefined) throw new Error('input.id is undefined')

      const id = Number(raw)
      if (Number.isNaN(id)) throw new Error('input.id is not a number')

      return { id }
    })
    ```
   * @example
    ```ts
    .body(zParse(z.object({ email: z.string().email({ message: 'Email is invalid' }) })))
    ```
  * @param parser - Parsing function, accepts an input and validate / optionally parses the input
  */
  body<T_New_Body extends ApiBody>(parser: Parser<T_New_Body>): API<T_Params, T_Search, T_New_Body, T_Response, T_Locals> {
    this.#storage.bodyParser = parser
    return this as any
  }


  /** 
   * ### Set validating / parsing function for this api's path params that runs before the api's resolve function
   * @example
    ```ts
    .pathParams(vParse(object({ id: vNum(), choice: vBool(), eamil: vEmail(), createdAt: optional(vDate()), email: pipe(string(), email()) })))
    ```
   * @example
    ```ts
    .pathParams(input => {
      if (typeof input !== 'object' || input === null) throw new Error('input is not an object')

      const raw = (input as any).id
      if (raw === undefined) throw new Error('input.id is undefined')

      const id = Number(raw)
      if (Number.isNaN(id)) throw new Error('input.id is not a number')

      return { id }
    })
    ```
   * @example
    ```ts
    .pathParams(zParse(z.object({ email: z.string().email({ message: 'Email is invalid' }) })))
    ```
  * @param parser - Parsing function, accepts an input and validate / optionally parses the input
  */
  pathParams<T_New_PathParams extends UrlPathParams>(parser: Parser<T_New_PathParams>): API<T_New_PathParams, T_Search, T_Body, T_Response, T_Locals>  {
    this.#storage.pathParamsParser = parser
    return this as any
  }


  /** 
   * ### Set validating / parsing function for this api's serch params that runs before the api's resolve function
   * @example
    ```ts
    .searchParams(vParse(object({ id: vNum(), choice: vBool(), eamil: vEmail(), createdAt: optional(vDate()), email: pipe(string(), email()) })))
    ```
   * @example
    ```ts
    .searchParams(input => {
      if (typeof input !== 'object' || input === null) throw new Error('input is not an object')

      const raw = (input as any).id
      if (raw === undefined) throw new Error('input.id is undefined')

      const id = Number(raw)
      if (Number.isNaN(id)) throw new Error('input.id is not a number')

      return { id }
    })
    ```
   * @example
    ```ts
    .searchParams(zParse(z.object({ email: z.string().email({ message: 'Email is invalid' }) })))
    ```
  * @param parser - Parsing function, accepts an input and validate / optionally parses the input
  */
  searchParams<T_New_SearchParams extends UrlSearchParams>(parser: Parser<T_New_SearchParams>): API<T_Params, T_New_SearchParams, T_Body, T_Response, T_Locals> {
    this.#storage.searchParamsParser = parser
    return this as any
  }
}



export type APIResolveFunction<
  T_Params extends UrlPathParams,
  T_Search extends UrlSearchParams,
  T_Body extends ApiBody,
  T_Response_Data,
  T_Locals extends BaseEventLocals = {}
> = (scope: ScopeBE<T_Params, T_Search, T_Body, T_Locals>) => AceResponse<T_Response_Data> | Promise<AceResponse<T_Response_Data>>



export type APIValues<T_Params extends UrlPathParams = any, T_Search extends UrlSearchParams = any, T_Body extends ApiBody = {}, T_Response = unknown, T_Locals extends BaseEventLocals = {}> = {
  path: string
  pattern: RegExp
  fn?: string
  b4?: B4<T_Locals>[]
  bodyParser?: Parser<T_Body>
  pathParamsParser?: Parser<T_Params>
  searchParamsParser?: Parser<T_Search>
  resolve?: APIResolveFunction<T_Params, T_Search, T_Body, T_Response, T_Locals>
}



export type APIStorage = {
  path: string
  pattern: RegExp
  fn?: string
  b4?: B4<any>[]
  bodyParser?: Parser<any>
  pathParamsParser?: Parser<any>
  searchParamsParser?: Parser<any>
  resolve?: APIResolveFunction<any,any,any,any,any>
}
