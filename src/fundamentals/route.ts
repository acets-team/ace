/**
 * 🧚‍♀️ How to access:
 *     - import { Route } from '@ace/route'
 *     - import type { RouteValues, RouteStorage } from '@ace/route'
 */


import type { Layout } from './layout'
import { pathnameToPattern } from './pathnameToPattern'
import type { B4, RouteComponent, URLPathParams, URLSearchParams, ValidateSchema } from './types'



export class Route<T_Params extends URLPathParams = any, T_Search extends URLSearchParams = any> {
  /** Typed loosely so we may freely mutate it at runtime */
  #storage: RouteStorage
  

  constructor(path: string) {
    this.#storage = { path, pattern: pathnameToPattern(path) }
  }

  /** Public .values getter that casts #storage into RouteValues<…>, giving us perfect intelliSense */
  public get values(): RouteValues<T_Params, T_Search> {
    return this.#storage
  }


  /** 
   * ### Set the component function to run when route is called
   * - Not an async fnction, See `load()` for that please
   * @example
    ```ts
    import { Route } from '@ace/route'
    import { Title } from '@solidjs/meta'
    import RootLayout from '@src/RootLayout'
    import WelcomeLayout from '@src/WelcomeLayout'

    export default new Route('/')
      .layouts([RootLayout, WelcomeLayout])
      .component(() => {
        return <>
          <Title>🏡 Home</Title>
          <div class="title">Home 🏡</div>
        </>
      })
    ```
   */
  component(component: RouteComponent<T_Params, T_Search>): this {
    this.#storage.component = component
    return this
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
  b4(b4: B4<any>[]): this {
    this.#storage.b4 = b4
    return this
  }


  /** 
   * - Group funcitionality & styling
   * - The first layout provided will wrap all the remaining layouts & the current route
   */
  layouts(arr: Layout[]): this {
    this.#storage.layouts = arr
    return this
  }


  /**
   * ### Set search params for this route
   * - @ `.component()` use `fe.PathParams()` if you'd like reactive path params that can work in `createEffect()`
   * - @ `.component()` use `fe.pathParams` if you don't need a reactive path params
   * @example
    ```ts
    export default new Route('/fortune/:id')
      .pathParams(valibotParams(object({ id: valibotString2Number() })))
    ```
   */
  pathParams<NewParams extends URLPathParams>(schema: ValidateSchema<NewParams>): Route<NewParams, T_Search> {
    this.#storage.pathParamsSchema = schema
    return this as any
  }


  /**
   * ### Set search params for this route
   * - @ `.component()` use `fe.SearchParams()` if you'd like reactive search params that can work in `createEffect()`
   * - @ `.component()` use `fe.searchParams` if you don't need a reactive search params
   * @example
    ```ts
    export default new Route('/spark')
      .searchParams(valibotParams(object({ modal: optional(valibotString2Boolean()) })))
    ```
   */
  searchParams<NewSearch extends URLSearchParams>(schema: ValidateSchema<NewSearch>): Route<T_Params, NewSearch> {
    this.#storage.searchParamsSchema = schema
    return this as any
  }
}


export type RouteValues<T_Params extends URLPathParams, T_Search extends URLSearchParams> = {
  path: string
  pattern: RegExp
  b4?: B4<any>[]
  layouts?: Layout[]
  component?: RouteComponent<T_Params, T_Search>
  pathParamsSchema?: ValidateSchema<T_Params>
  searchParamsSchema?: ValidateSchema<T_Search>
}


export type RouteStorage = {
  path: string
  pattern: RegExp
  b4?: B4<any>[]
  layouts?: Layout[]
  component?: RouteComponent<any, any>
  pathParamsSchema?: ValidateSchema<any>
  searchParamsSchema?: ValidateSchema<any>
}
