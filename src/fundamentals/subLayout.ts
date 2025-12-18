import type { JSX } from 'solid-js'
import type { ScopeComponent } from './scopeComponent'
import type { RouteSectionProps } from '@solidjs/router'
import { populateScopeComponent } from '../populateScopeComponent'


/**
 * - Defined routes will be placed w/in this layout
 * - Has access to all `<Provider />` contexts that wrap the Application @ `app.tsx`
 */
export class SubLayout {
  layout: (props: RouteSectionProps) => JSX.Element

  constructor(layout: (scope: ScopeComponent) => JSX.Element) {
    this.layout = (props: RouteSectionProps) => {
      return layout(populateScopeComponent(props, 'SubLayout'))
    }
  }
}
