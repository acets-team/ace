/**
 * 🧚‍♀️ How to access:
 *     - import { Route } from '@ace/route'
 */


import type { Layout } from './layout'
import { pathnameToPattern } from './pathnameToPattern'
import type { B4, RouteComponent, URLPathParams, URLSearchParams, ValidateSchema } from './types'



export class Route<T_Params extends URLPathParams = any, T_Search extends URLSearchParams = any> {
  public readonly values: RouteValues<T_Params, T_Search>


  constructor(path: string) {
    this.values = {
      path,
      pattern: pathnameToPattern(path),
    } as RouteValues<T_Params, T_Search>
  }


  /** 
   * ### Set the component function to run when route is called
   * - Not an async fnction, See `load()` for that please
   * @example
    ```ts
    import { Title } from '@solidjs/meta'
    import RootLayout from '../RootLayout'
    import { Route } from '@ace/route'
    import WelcomeLayout from './WelcomeLayout'

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
    this.values.component = component
    return this
  }

  /** 
   * ### Set async function to run before route boots
   * - IF `b4()` return is truthy => returned value is sent to the client & route handler is not processed
   * - It is not recomended to do db calls in this function
   * - `b4()` purpose is to:
   *     - Read `event` contents (headers, cookies)
   *     - Append `event.locals`, `event.request` or `event.response`
   *     - Do a redirect
   *     - Return nothing and allow api fn to to process next
   * @example
    ```ts
    import { go } from '@ace/go'
    import { Route } from '@ace/route'

    export default new Route('/')
      .b4(async () => {
        throw go('/sign-in')
      })
    ```
   */
  b4(fn: B4): this {
    this.values.b4 = fn
    return this
  }


  /** 
   * - Group funcitionality, context & styling
   * - The first layout provided will wrap all the remaining layouts & the current route
   */
  layouts(arr: Layout[]): this {
    this.values.layouts = arr
    return this
  }


  /**
   * - If filter match is falsy => application renders `./src/routes/[...404].tsx`
   * @link https://docs.solidjs.com/solid-router/concepts/path-parameters
   */
  filters(obj: RouteFilters): this {
    this.values.filters = obj
    return this
  }


  pathParams<NewParams extends URLPathParams>(schema: ValidateSchema<NewParams>): Route<NewParams, T_Search> {
    this.values.pathParamsSchema = schema
    return this as unknown as Route<NewParams, T_Search>
  }

  searchParams<NewSearch extends URLSearchParams>(schema: ValidateSchema<NewSearch>): Route<T_Params, NewSearch> {
    this.values.searchParamsSchema = schema
    return this as unknown as Route<T_Params, NewSearch>
  }
}


type RouteFilters = Record<string, any>


type RouteValues<T_Params extends URLPathParams, T_Search extends URLSearchParams> = {
  path: string
  pattern: RegExp
  b4?: B4
  layouts?: Layout[]
  filters?: RouteFilters
  component?: RouteComponent<T_Params, T_Search>
  pathParamsSchema?: ValidateSchema<any>
  searchParamsSchema?: ValidateSchema<any>
}
