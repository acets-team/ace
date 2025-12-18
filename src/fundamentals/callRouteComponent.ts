import { Route } from './route'
import type { Route404 } from './route404'
import type { RouteSectionProps } from '@solidjs/router'
import { populateScopeComponent } from '../populateScopeComponent'


export function callRouteComponent(props: RouteSectionProps, route: Route<any> | Route404) {
  return route.values.component?.(populateScopeComponent(props, route))
}
