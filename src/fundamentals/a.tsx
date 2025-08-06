/**
 * 🧚‍♀️ How to access:
 *     - import { A } from '@ace/a'
 *     - import type { AProps } from '@ace/a'
 */


import type { JSX } from 'solid-js'
import { buildUrl } from '../buildUrl'
import { A as SolidA } from '@solidjs/router'
import type { Routes, RoutePath2PathParams, RoutePath2SearchParams, OptionalIfNoRequired } from './types'


/**
 * ### Anchor component
 * - When anchor path matches the current route an "active" class is added to the generated anchor
 * - When anchor path does not match the current route an "inactive" class is added to the generated anchor
 * - Use the SolidJS `end` prop if the match is too greedy: https://docs.solidjs.com/solid-router/reference/components/a
 * - Allows all props from SolidJS anchor component, except for `href`, b/c Ace sets the `href` based on your `path` & `props`
 * @param props.path - Path to navigate to, as defined @ `new Route()`
 * @param props.params - Optional object of params to send to route
 */
export function A<T extends Routes>({ path, pathParams, searchParams, children, solidAProps }: AProps<T>) {
  return <>
    <SolidA href={buildUrl(path, {pathParams: pathParams, searchParams: searchParams})} {...solidAProps}>
      {children}
    </SolidA>
  </>
}


export type AProps<T extends Routes> = {
  path: T
  children: JSX.Element
  solidAProps?: SolidAProps
} & OptionalIfNoRequired<'pathParams', RoutePath2PathParams<T>> & OptionalIfNoRequired<'searchParams', RoutePath2SearchParams<T>>


/**
 * - "Parameters<typeof SolidA>[0]"" extracts the first argument type of SolidA, which contains all its props
 * - "Omit<..., 'href'>" removes the href prop, since we're generating it dynamically
 */
type SolidAProps = Omit<Parameters<typeof SolidA>[0], 'href'>
