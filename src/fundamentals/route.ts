/**
 * 🧚‍♀️ How to access:
 *     - import { Route } from '@ace/route'
 */


import type { Layout } from './layout'
import { pathnameToPattern } from './pathnameToPattern'
import type { B4, RouteComponent, URLParams, URLSearchParams } from './types'



export class Route<T_Params extends URLParams = {}, T_Search extends URLSearchParams = {}> {
  public readonly values: RouteValues<T_Params, T_Search>


  constructor(path: string) {
    this.values = {
      path,
      pattern: pathnameToPattern(path),
    } as RouteValues<T_Params, T_Search>
  }


  /** 
   * ### Set the component function to run when route is called
   * - Not an async fnction, See `beAsync()` for that please
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
   * - 🚨 If returning the response must be a `Response` object b/c this is what is given to the client
   * - 🚨 When calling `go()` from w/in a `b4` a return type is required, b/c ts needs to know about all routes's when we call `go()` to provide autocomplete but we are defining a route while calling `go()`. So the return type stops the loop of defining & searching
   * @example
    ```ts
    import { go } from '@ace/go'
    import { Route } from '@ace/route'
    import type { GoResponse } from '@ace/types'

    export default new Route('/')
      .b4(async (): Promise<GoResponse> => {
        return go('/sign-in')
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


  /**
   * ### Set the type for the url params
   * - If `.params()` is below `.component() `then `.component()` won't have typesafety
   * @example
    ```ts
    import { Route } from '@ace/route'

    export default new Route('/sign-in/:messageId?')
      .params<{ messageId?: '1' }>()
      .component((fe) => {
        return <>hi</>
      })
    ```
   */
  params<T_New_Params extends URLParams>(): Route<T_New_Params, T_Search> {
    return this as unknown as Route<T_New_Params, T_Search>
  }
}

type RouteFilters = Record<string, any>

interface RouteValues<T_Params extends URLParams, T_Search extends URLSearchParams> {
  path: string
  pattern: RegExp
  b4?: B4
  layouts?: Layout[]
  filters?: RouteFilters
  component?: RouteComponent<T_Params, T_Search>
}





// /**
//  * 🧚‍♀️ How to access:
//  *     - import { Route } from '@ace/route'
//  *     - import type { RouteOptions } from '@ace/route'
//  */


// import type { Layout } from './layout'
// import type { B4 } from './types'
// import { pathnameToPattern } from './pathnameToPattern'
// import type { JSX } from 'solid-js'
// import type { FE } from './fe'



// /**
//  * - Create a route for your application
//  * - Behind the scenes will use this information to create SolidJS Route components: https://docs.solidjs.com/solid-router/concepts/nesting
//  */
// export class Route<T_Params = {}, T_Search = {}> {
//   /** 
//    * - IF `this.b4()` return is truthy => returned value is sent to the client & `this.component()` is not called
//    * - It is not recomended to do db calls in `this.b4()`
//    * - Recomended options include:
//    *     - Read request event 
//    *     - Append values to request
//    *     - Do a redirect
//    *     - Append values to response
//    *     - Append values `event.locals`
//    * - From an auth perspective, `this.b4()` is a great spot to do a 1st session data check, so `getSessionData()` and append it to`event.locals`. & then  `this.component()` is a great spot to do a 2nd more thorough session data check w/ db calls. This process is similair to the 2 steps movie theater ticket verification process
//    * - ✨ Note: If returning from `b4`, that response must be a `Response` object. So if a redirect is desired use [Response.redirect](https://developer.mozilla.org/en-US/docs/Web/API/Response/redirect_static) or the Solid's `redirect()` which does that for us or the Ace's `go()` which calls `redirect()` and provides intellisense!
//    * - 🚨 Important note: If calling `go()` in `b4()` add a return type of `GoResponse` to `b4()`. `go()` requires knowledge of all routes, so calling `go()` in a route will cause a ts recursion loop w/o the return type, example:
//         ```ts
//         import { go } from '@ace/go'
//         import { Route } from '@ace/route'
//         import type { GoResponse } from '@ace/types'


//         export default new Route({
//           path: '/',
//           async b4(): GoResponse {
//             return go('/test')
//           }
//         })
//         ```
//    */
//   b4?: B4

//   /** 
//    * - Group funcitionality, context & styling
//    * - The first layout provided will wrap all the remaining layouts & the current route
//    */
//   layouts?: Layout[]

//   /** url path */
//   path: string

//   /** Turns url parameters (:param and :param?) into regex patterns to match path's */
//   pattern: RegExp

//   /** 
//    * - If fetching data is necessary see: `beAsync()`
//    * - If form submission is necessary see: `createOnSubmit()`
//    */
//   component?: RouteComponent<T_Params, T_Search>

//   /**
//    * - https://docs.solidjs.com/solid-router/concepts/path-parameters
//    * - If filter match is falsy => application renders `./src/routes/[...404].tsx`
//    */
//   filters?: RouteFilters

//   constructor(options: RouteOptions<T_Params, T_Search>) {
//     this.b4 = options.b4
//     this.path = options.path
//     this.layouts = options.layouts
//     this.filters = options.filters
//     this.component = options.component
//     this.pattern = options.pattern || pathnameToPattern(options.path)
//   }


//   /** Add to Route, the `search` type */
//   search<T_New_Search>(): Route<T_Params, T_New_Search> {
//     return this as any
//   }


//   /** Add to Route, the `params` type */
//   params<T_New_Params>(): Route<T_New_Params, T_Search> {
//     return this as any
//   }
// }


// export type RouteOptions<T_Params, T_Search> = {
//   /** 
//    * - IF `this.b4()` return is truthy => returned value is sent to the client & `this.component()` is not called
//    * - It is not recomended to do db calls in `this.b4()`
//    * - Recomended options include:
//    *     - Read request event 
//    *     - Append values to request
//    *     - Do a redirect
//    *     - Append values to response
//    *     - Append values `event.locals`
//    * - From an auth perspective, `this.b4()` is a great spot to do a 1st session data check, so `getSessionData()` and append it to`event.locals`. & then  `this.component()` is a great spot to do a 2nd more thorough session data check w/ db calls. This process is similair to the 2 steps movie theater ticket verification process
//    * - 🚨 Important note: If returning from `b4`, that response must be a `Response` object. So if a redirect is desired use [Response.redirect](https://developer.mozilla.org/en-US/docs/Web/API/Response/redirect_static) or the Solid's `redirect()` which does that for us or the Ace's `go()` which calls `redirect()` and provides intellisense!
//    */
//   b4?: B4,

//   /** 
//    * - Group funcitionality, context & styling
//    * - The first layout provided will wrap all the remaining layouts & the current route
//    */
//   layouts?: Layout[]

//   /** url path */
//   path: string

//   /** Turns url parameters (:param and :param?) into regex patterns to match path's */
//   pattern?: RegExp

//   /** 
//    * - If fetching data is necessary see: `beAsync()`
//    * - If form submission is necessary see: `createOnSubmit()`
//    */
//   component?: RouteComponent<T_Params, T_Search>

//   /**
//    * - https://docs.solidjs.com/solid-router/concepts/path-parameters
//    * - If filter match is falsy => application renders `./src/routes/[...404].tsx`
//    */
//   filters?: RouteFilters
// }



// // type RouteArgs<Search = unknown, Params = unknown> = {
// //   Params?: Params
// //   Search?: Search
// // }


// /**
//  * - https://docs.solidjs.com/solid-router/concepts/path-parameters
//  * - If filter match is falsy => application renders `./src/routes/[...404].tsx`
//  */
// type RouteFilters = Record<string, any>


// export interface FEWithArgs<T_Params, T_Search> extends Omit<FE, 'getParams' | 'getLocation'> {
//   /** now `getParams()` is specialized to T_Params */
//   getParams(): T_Params;
//   /** now `.query` on the location is T_Search */
//   getLocation(): Location & { query: T_Search };
// }

// export interface RouteArgs {
//   Params?: unknown;
//   Search?: unknown;
// }

// /** a RouteComponent knows which FEWithArgs it will receive */
// export type RouteComponent<T_Params, T_Search> = (fe: FEWithArgs<T_Params, T_Search>) => JSX.Element
