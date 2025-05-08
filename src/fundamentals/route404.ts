/**
 * 🧚‍♀️ How to access:
 *     - import { Route404 } from '@ace/route404'
 */


import type { Layout } from './layout'
import type { RouteComponent } from './types'



export class Route404 {
  public readonly values: RouteValues = {
    path: '*'
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
    this.values.component = component
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
}


type RouteValues = {
  path: string,
  layouts?: Layout[],
  component?: RouteComponent<any, any>,
}
