/**
 * 🧚‍♀️ How to access:
 *     - import { Route } from '@ace/route'
 *     - import type { RouteValues, RouteStorage } from '@ace/route'
 */


import type { SubLayout } from './subLayout'
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
  component(component: RouteComponent<T_Req>): this {
    this.#storage.component = component
    return this
  }


  /** 
   * - Group funcitionality, styling & api data
   * - All routes will already be w/in the RootLayout, that is not this
   * - This is defining a SubLayout for a group of routes
   */
  layout(layout: SubLayout): this {
    this.#storage.layout = layout
    return this
  }


  parser<T_Parser extends Parser<any>>(parser: T_Parser): Route<Parser2Req<T_Parser>> {
    this.#storage.requestParser = parser
    return this as any
  }
}


export type RouteValues<T_Req extends BaseRouteReq> = {
  path: string
  layout?: SubLayout
  component?: RouteComponent<T_Req>
  requestParser?: Parser<T_Req>
}


export type RouteStorage = {
  path: string
  layout?: SubLayout
  component?: RouteComponent<any>
  requestParser?: Parser<any>
}
