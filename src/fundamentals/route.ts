/**
 * 🧚‍♀️ How to access:
 *     - import { Route } from '@ace/route'
 *     - import type { RouteValues, RouteStorage } from '@ace/route'
 */


import type { Layout } from './layout'
import { pathnameToPattern } from './pathnameToPattern'
import type { RouteComponent, URLPathParams, URLSearchParams, Parser } from './types'



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
   * - Group funcitionality & styling
   * - The first layout provided will wrap all the remaining layouts & the current route
   */
  layouts(arr: Layout[]): this {
    this.#storage.layouts = arr
    return this
  }


  /**
   * ### Set search params for this route
   * - @ `.component()` use `scope.PathParams()` if you'd like reactive path params that can work in `createEffect()`
   * - @ `.component()` use `scope.pathParams` if you don't need a reactive path params
   * @example
    ```ts
    export default new Route('/fortune/:id')
      .pathParams(vParse(object({ id: vNum() })))
    ```
   */
  pathParams<NewParams extends URLPathParams>(schema: Parser<NewParams>): Route<NewParams, T_Search> {
    this.#storage.pathParamsParser = schema
    return this as any
  }


  /**
   * ### Set search params for this route
   * - @ `.component()` use `scope.SearchParams()` if you'd like reactive search params that can work in `createEffect()`
   * - @ `.component()` use `scope.searchParams` if you don't need a reactive search params
   * @example
    ```ts
    export default new Route('/spark')
      .searchParams(vParse(object({ modal: optional(vBool()) })))
    ```
   */
  searchParams<NewSearch extends URLSearchParams>(schema: Parser<NewSearch>): Route<T_Params, NewSearch> {
    this.#storage.searchParamsParser = schema
    return this as any
  }
}


export type RouteValues<T_Params extends URLPathParams, T_Search extends URLSearchParams> = {
  path: string
  pattern: RegExp
  layouts?: Layout[]
  component?: RouteComponent<T_Params, T_Search>
  pathParamsParser?: Parser<T_Params>
  searchParamsParser?: Parser<T_Search>
}


export type RouteStorage = {
  path: string
  pattern: RegExp
  layouts?: Layout[]
  component?: RouteComponent<any, any>
  pathParamsParser?: Parser<any>
  searchParamsParser?: Parser<any>
}
