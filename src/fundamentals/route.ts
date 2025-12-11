/**
 * 🧚‍♀️ How to access:
 *     - import { Route } from '@ace/route'
 *     - import type { RouteValues, RouteStorage } from '@ace/route'
 */


import type { Layout } from './layout'
import type { RouteComponent, BaseRouteReq, Parser, Parser2Req } from './types'



export class Route<T_Req extends BaseRouteReq = BaseRouteReq> {
  /** Typed loosely so we may freely mutate it at runtime */
  #storage: RouteStorage
  

  constructor(path: string) {
    this.#storage = { path }
  }

  /** Public .values getter that casts #storage into RouteValues<…>, giving us perfect intelliSense */
  public get values(): RouteValues<T_Req> {
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
  component(component: RouteComponent<T_Req>): this {    this.#storage.component = component
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


  parser<T_Parser extends Parser<any>>(parser: T_Parser): Route<Parser2Req<T_Parser>> {
    this.#storage.requestParser = parser
    return this as any
  }
}


export type RouteValues<T_Req extends BaseRouteReq> = {
  path: string
  layouts?: Layout[]
  component?: RouteComponent<T_Req>
  requestParser?: Parser<T_Req>
}


export type RouteStorage = {
  path: string
  layouts?: Layout[]
  component?: RouteComponent<any>
  requestParser?: Parser<any>
}
