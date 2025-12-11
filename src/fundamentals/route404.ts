/**
 * 🧚‍♀️ How to access:
 *     - import { Route404 } from '@ace/route404'
 *     - import type { Route404Storage, Rou404teValues } from '@ace/route404'
 */


import type { Layout } from './layout'
import type { RouteComponent } from './types'



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
    this.#storage = { path: '*' }
  }
  
  /** Public .values getter that casts #storage into RouteValues<…>, giving us perfect intelliSense */
  public get values(): Rou404teValues {
    return this.#storage
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
  component(component: RouteComponent<any>): this {
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
  layouts?: Layout[]
  component?: RouteComponent<any>
}



export type Rou404teValues = {
  path: string
  layouts?: Layout[]
  component?: RouteComponent<any>
}
