/**
 * 🧚‍♀️ How to access:
 *     - import { API } from '@ace/api'
 *     - import type { APIResolveFunction, APIValues, APIStorage } from '@ace/api'
 */


import type { BE } from './be'
import type { RequestEvent } from 'solid-js/web'
import { pathnameToPattern } from './pathnameToPattern'
import type { APIBody, URLSearchParams, URLPathParams, B4, AceResponse, AceResponseResponse, ValidateSchema, BaseEventLocals, MergeLocals } from './types'



/** 
 * - Create a `GET` or `POST`, API endpoint
 * - When defining the API you may give it a path that can be called w/in or w/out the application & a function name
 * - When calling via function name from `FE` a fetch is done and when calling from `BE` the resolve function is called directly
 */
export class API<T_Params extends URLPathParams = any, T_Search extends URLSearchParams = any, T_Body extends URLPathParams = {}, T_Response = unknown, T_Locals extends BaseEventLocals = {}> {
  /** Typed loosely so we may freely mutate it at runtime */
  #storage: APIStorage

  constructor(path: string, fnName?: string) {
    this.#storage = { path, pattern: pathnameToPattern(path) }

    if (fnName) this.values.fn = fnName
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
      .pathParams(valibotParams(object({ element: picklist(elements) })))
      .resolve(async (be) => {
        return be.success(be.pathParams.element)
      })
    ```
  */
  resolve<T_Resolve_Fn extends APIResolveFunction<T_Params, T_Search, T_Body, any, T_Locals>>(resolveFunction: T_Resolve_Fn): API<T_Params, T_Search, T_Body, AceResponseResponse<Awaited<ReturnType<T_Resolve_Fn>>>, T_Locals> {
    this.#storage.resolve = resolveFunction
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
  body<T_New_Body extends APIBody>(): API<T_Params, T_Search, T_New_Body, T_Response, T_Locals> {
    return this as any
  }


  /** 
   * ### Set path params for this api
   * @example
    ```ts
    export const GET = new API('/api/character/:element', 'apiCharacter')
      .pathParams(valibotParams(object({ element: picklist(elements) })))
      .resolve(async (be) => {
        return be.success(be.pathParams.element)
      })
    ```
  */
  pathParams<T_New_PathParams extends URLPathParams>(schema: ValidateSchema<T_New_PathParams>): API<T_New_PathParams, T_Search, T_Body, T_Response, T_Locals>  {
    this.#storage.pathParamsSchema = schema
    return this as any
  }


  /** 
   * ### Set search params for this api
   * @example
    ```ts
    export const GET = new API('/api/clothing', 'apiClothing')
      .searchParams(valibotParams(object({ category: optional(picklist(['men', 'women'])) })))
      .resolve(async (be) => {
        return be.success(be.searchParams.category)
      })
    ```
  */
  searchParams<T_New_SearchParams extends URLSearchParams>(schema: ValidateSchema<T_New_SearchParams>): API<T_Params, T_New_SearchParams, T_Body, T_Response, T_Locals> {
    this.#storage.searchParamsSchema = schema
    return this as any
  }
}


export type APIResolveFunction<
  T_Params extends URLPathParams,
  T_Search extends URLSearchParams,
  T_Body extends APIBody,
  T_Response_Data,
  T_Locals extends BaseEventLocals = {}
> = (be: BE<T_Params,T_Search,T_Body> & { event: RequestEvent & { locals: T_Locals } }) => Promise<AceResponse<T_Response_Data>>


export type APIValues<T_Params extends URLPathParams = any, T_Search extends URLSearchParams = any, T_Body extends APIBody = {}, T_Response = unknown, T_Locals extends BaseEventLocals = {}> = {
  path: string
  pattern: RegExp
  b4?: B4<T_Locals>[]
  resolve?: APIResolveFunction<T_Params, T_Search, T_Body, T_Response, T_Locals>
  fn?: string
  pathParamsSchema?: ValidateSchema<T_Params>
  searchParamsSchema?: ValidateSchema<T_Search>
}


export type APIStorage = {
  path: string
  pattern: RegExp
  pathParamsSchema?: ValidateSchema<any>
  searchParamsSchema?: ValidateSchema<any>
  b4?: B4<any>[]
  resolve?: APIResolveFunction<any,any,any,any,any>
  fn?: string
}
