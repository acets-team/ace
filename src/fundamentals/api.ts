/**
 * 🧚‍♀️ How to access:
 *     - import { API } from '@ace/api'
 *     - import type { APIResolveFunction, APIValues, APIStorage } from '@ace/api'
 */



import type { ScopeAPI } from './scopeAPI'
import type { RequestEvent } from 'solid-js/web'
import { pathnameToPattern } from './pathnameToPattern'
import type { APIBody, URLSearchParams, URLPathParams, B4, AceResponse, AceResponseResponse, Parser, BaseEventLocals, MergeLocals } from './types'



/** 
 * - Create an API endpoint
 * - When defining the API you may give it a path that can be called w/in or w/out the application & a function name
 * - When calling via function name from `FE` a fetch is done and when calling from `BE` the resolve function is called directly
 */
export class API<T_Params extends URLPathParams = any, T_Search extends URLSearchParams = any, T_Body extends URLPathParams = {}, T_Response = unknown, T_Locals extends BaseEventLocals = {}> {
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
   * - It is not recomended to do db calls in this function
   * - `b4()` purpose is to:
   *     - Read `event` contents (request, headers, cookies)
   *     - Read / Append `event.locals`
   *     - Do a redirect w/ `go()` or `Go()`
   * @example
    ```ts
    import { go } from '@ace/go'
    import type { B4 } from '@ace/types'

    export const authB4: B4 = async ({ jwt }) => {
      if (!jwt.isValid) return go('/')
    }

    export const guestB4: B4 = async ({ jwt }) => {
      if (jwt.isValid) return go('/welcome')
    }

    export const eventB4: B4<{example: string}> = async ({ event }) => {
      event.locals.example = 'aloha'
    }
    ```
   * @example
    ```ts
    export default new Route('/smooth')
      .b4([guestB4, eventB4])
    ```
   * @example
    ```ts
    export const GET = new API('/api/character/:element', 'apiCharacter')
      .b4([authB4, eventB4])
    ```
  */
  b4<const T_B4_Functions extends B4<any>[]>(b4: T_B4_Functions): API<T_Params, T_Search, T_Body, T_Response, MergeLocals<T_B4_Functions>> {
    this.#storage.b4 = b4
    return this
  }


  /** 
   * ### Set async function to run when api is called
   * @example
    ```ts
    export const GET = new API('/api/character/:element', 'apiCharacter')
      .pathParams(vParser(object({ element: picklist(elements) })))
      .resolve(async (scope) => {
        return scope.success(scope.pathParams.element)
      })
    ```
  */
  resolve<T_Resolve_Fn extends APIResolveFunction<T_Params, T_Search, T_Body, any, T_Locals>>(resolveFunction: T_Resolve_Fn): API<T_Params, T_Search, T_Body, AceResponseResponse<Awaited<ReturnType<T_Resolve_Fn>>>, T_Locals> {
    this.#storage.resolve = resolveFunction
    return this as any
  }



  /** 
   * ### Set validating / parsing function for this api's body that runs before the api's resolve function
   * @example
    ```ts
    .body(vParser(object({ email: pipe(string(), email()) })))
    ```
   * @example
    ```ts
    .body(vParser(object({ id: vNum() })))
    ```
   * @example
    ```ts
    .body(vParser(object({ choice: vBool() })))
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
    .body(zParser(z.object({ email: z.string().email({ message: 'Email is invalid' }) })))
    ```
  * @param parser - Parsing function, accepts an input and validate / optionally parses the input
  */
  body<T_New_Body extends APIBody>(parser: Parser<T_New_Body>): API<T_Params, T_Search, T_New_Body, T_Response, T_Locals> {
    this.#storage.bodyParser = parser
    return this as any
  }


  /** 
   * ### Set validating / parsing function for this api's path params that runs before the api's resolve function
   * @example
    ```ts
    .pathParams(vParser(object({ email: pipe(string(), email()) })))
    ```
   * @example
    ```ts
    .pathParams(vParser(object({ id: vNum() })))
    ```
   * @example
    ```ts
    .pathParams(vParser(object({ choice: vBool() })))
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
    .pathParams(zParser(z.object({ email: z.string().email({ message: 'Email is invalid' }) })))
    ```
  * @param parser - Parsing function, accepts an input and validate / optionally parses the input
  */
  pathParams<T_New_PathParams extends URLPathParams>(parser: Parser<T_New_PathParams>): API<T_New_PathParams, T_Search, T_Body, T_Response, T_Locals>  {
    this.#storage.pathParamsParser = parser
    return this as any
  }


  /** 
   * ### Set validating / parsing function for this api's serch params that runs before the api's resolve function
   * @example
    ```ts
    .searchParams(vParser(object({ email: pipe(string(), email()) })))
    ```
   * @example
    ```ts
    .searchParams(vParser(object({ id: vNum() })))
    ```
   * @example
    ```ts
    .searchParams(vParser(object({ choice: vBool() })))
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
    .searchParams(zParser(z.object({ email: z.string().email({ message: 'Email is invalid' }) })))
    ```
  * @param parser - Parsing function, accepts an input and validate / optionally parses the input
  */
  searchParams<T_New_SearchParams extends URLSearchParams>(parser: Parser<T_New_SearchParams>): API<T_Params, T_New_SearchParams, T_Body, T_Response, T_Locals> {
    this.#storage.searchParamsParser = parser
    return this as any
  }
}


export type APIResolveFunction<
  T_Params extends URLPathParams,
  T_Search extends URLSearchParams,
  T_Body extends APIBody,
  T_Response_Data,
  T_Locals extends BaseEventLocals = {}
> = (scope: ScopeAPI<T_Params,T_Search,T_Body> & { event: RequestEvent & { locals: T_Locals } }) => Promise<AceResponse<T_Response_Data>>



export type APIValues<T_Params extends URLPathParams = any, T_Search extends URLSearchParams = any, T_Body extends APIBody = {}, T_Response = unknown, T_Locals extends BaseEventLocals = {}> = {
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
