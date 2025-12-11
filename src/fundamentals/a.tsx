/**
 * 🧚‍♀️ How to access:
 *     - import { A } from '@ace/a'
 *     - import type { AProps } from '@ace/a'
 */


import { mapRoutes } from './mapRoutes'
import { Loading, type LoadingProps } from './loading'
import { A as SolidA, useIsRouting } from '@solidjs/router'
import { createEffect, createMemo, createSignal, Show, type JSX } from 'solid-js'
import type { Routes, RoutePath2PathParams, RoutePath2SearchParams, OptionalIfNoRequired } from './types'



/**
 * ### Typesafe anchor component
 * - `Path`, `pathParams` & `searchParams` = **type-safe**
 * - `<Loading />` is shown while waiting for next page to render
 * - IF `pathParams` or `searchParams` are defined for this route as **required** THEN they'll be required here @ compile-time (IDE autocomplee 🙌)
 * - When anchor path matches the current route an `active` class is added to the generated anchor
 * - When anchor path does not match the current route an `inactive` class is added to the generated anchor
 * - Use the [SolidJS `end` prop](https://docs.solidjs.com/solid-router/reference/components/a) (ex: `<A path="/" $a={{ end: true }}>Home</A>`) if the match is too greedy. If true, only considers the link to be active when the current location matches the href exactly; if false, checks if the current location starts with href
 * @param props.path - Path to navigate to, as defined @ `new Route()`
 * @param props.pathParams - Route path params
 * @param props.searchParams - Route search params
 * @param props.children - Required
 * @param props.$a - Optional, props to add to `<SolidA />` & the html dom `<a />`
 * @param props.$Loading - Optional, props to add to the `<Loading />` component
 */
export function A<T extends Routes>({ path, pathParams, searchParams, children, $a, $Loading }: AProps<T>) {
  const isRouting = useIsRouting()
  let aRef: HTMLAnchorElement | undefined
  const [showLoading, setShowLoading] = createSignal<boolean>(false)

  createEffect(() => {
    if (!isRouting()) { // IF done routing THEN hide loading
      setShowLoading(false)
    }
  })

  function onClick(e: MouseEvent & { currentTarget: HTMLAnchorElement, target: Element }) {
    if (!aRef?.classList.contains('active')) { // IF the clicked link is not to the current page THEN show loading
      setShowLoading(true)
    }

    if (typeof $a?.onClick === 'function') $a.onClick(e)
  }

  const href = createMemo(() => {
    const entry = mapRoutes[path]
    if (!entry) return ''

    return entry.buildUrl({ pathParams, searchParams })
  })

  return <>
    <Show when={!showLoading()} fallback={<Loading {...$Loading} />}>
      <SolidA {...$a} href={href()} ref={el => (aRef = el)} onClick={onClick}>
        {children}
      </SolidA>
    </Show>
  </>
}


export type AProps<T extends Routes> = {
  /** Path to navigate to, as defined @ `new Route()` */
  path: T
  /** Required */
  children: JSX.Element
  /** Optional, props to add to `<SolidA />` & the html dom `<a />` */
  $a?: SolidAProps
  /** Optional, props to add to the `<Loading />` component */
  $Loading?: LoadingProps
} & OptionalIfNoRequired<'pathParams', RoutePath2PathParams<T>> & OptionalIfNoRequired<'searchParams', RoutePath2SearchParams<T>>


/**
 * - "Parameters<typeof SolidA>[0]"" extracts the first argument type of SolidA, which contains all its props
 * - "Omit<..., 'href'>" removes the href prop, since we're generating it dynamically
 */
type SolidAProps = Omit<Parameters<typeof SolidA>[0], 'href'>
