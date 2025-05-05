/**
 * 🧚‍♀️ How to access:
 *     - import { Layout } from '@ace/layout'
 *     - import type { LayoutOptions } from '@ace/layout'
 */


import type { LayoutComponent } from './types'



export class Layout {
  public readonly values: LayoutValues = {}

  component(fn: LayoutComponent): this {
    this.values.component = fn
    return this
  }
}


type LayoutValues = {
  component?: LayoutComponent
}