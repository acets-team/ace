/**
 * 🧚‍♀️ How to access:
 *     - import { Route404 } from '@ace/route404'
 *     - import type { Route404Storage, Rou404teValues } from '@ace/route404'
 */


import type { Layout } from './layout'
import type { B4, RouteComponent } from './types'
import { pathnameToPattern } from './pathnameToPattern'



/**
 * ### Create 404 Route
 * @example
  ```tsx
  import './404.css'
  import { A } from '@ace/a'
  import { Title } from '@solidjs/meta'
  import { Route404 } from '@ace/route404'
  import RootLayout from '@src/app/RootLayout'


  export default new Route404()
    .layouts([RootLayout])
    .component(({location}) => {
      return <>
        <Title>😅 404</Title>

        <main class="not-found">
          <div class="code">404 😅</div>
          <div class="message">We don't have a page called:</div>
          <div class="path">{location.pathname}</div>
          <A path="/" solidAProps={{class: 'brand'}}>🏡 Go Back Home</A>
        </main>
      </>
    })
  ```
 */
export class Route404 {
  /** Typed loosely so we may freely mutate it at runtime */
  #storage: Route404Storage


  constructor() {
    this.#storage = { path: '*', pattern: pathnameToPattern('*') }
  }
  
  /** Public .values getter that casts #storage into RouteValues<…>, giving us perfect intelliSense */
  public get values(): Rou404teValues {
    return this.#storage
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
    export default new Route404()
      .b4([guestB4, eventB4])
    ```
  */
  b4(b4: B4<any>[]): this {
    this.#storage.b4 = b4
    return this
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

    export default new Route404()
      .layouts([RootLayout, WelcomeLayout]) // layouts are optional!
      .component(() => {
        return <>
          <Title>🏡 Home</Title>
          <div class="title">Home 🏡</div>
        </>
      })
    ```
   */
  component(component: RouteComponent<any, any>): this {
    this.#storage.component = component
    return this
  }


  /** 
   * - Group funcitionality, context & styling
   * - The first layout provided will wrap all the remaining layouts & the current route
   */
  layouts(arr: Layout[]): this {
    this.#storage.layouts = arr
    return this
  }
}


export type Route404Storage = {
  path: '*'
  pattern: RegExp
  b4?: B4<any>[]
  layouts?: Layout[]
  component?: RouteComponent<any, any>
}



export type Rou404teValues = {
  path: string
  pattern: RegExp
  b4?: B4<any>[]
  layouts?: Layout[]
  component?: RouteComponent<any, any>
}
