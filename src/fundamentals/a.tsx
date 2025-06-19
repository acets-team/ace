/**
 * 🧚‍♀️ How to access:
 *     - import { A } from '@ace/a'
 *     - import type { AOptions } from '@ace/a'
 */


import { type JSX } from 'solid-js'
import { buildURL } from './buildURL'
import { A as SolidA } from '@solidjs/router'
import type { Routes, RoutePath2Params } from './types'


export function A<T extends Routes>({ path, params, children, ...props }: AOptions<T>) {
  return <>
    <SolidA href={buildURL(path, params)} {...props}>
      {children}
    </SolidA>
  </>
}


export type AOptions<T extends Routes> = {
  path: T,
  children: JSX.Element,
  params?: RoutePath2Params<T>,
} & SolidAProps


/**
 * - "Parameters<typeof SolidA>[0]"" extracts the first argument type of SolidA, which contains all its props
 * - "Omit<..., 'href'>" removes the href prop, since we're generating it dynamically
 */
type SolidAProps = Omit<Parameters<typeof SolidA>[0], 'href'>
