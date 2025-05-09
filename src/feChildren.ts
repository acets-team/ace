import type { JSX } from 'solid-js'
import type { FE } from './fundamentals/fe'


/**
 * - WeakMap keys are weak references
 *     — If the FE instance is no longer in use elsewhere, the key-value pair is garbage collected
 *     - A normal Map keeps keys alive and can cause memory leaks
 */
const childrenMap = new WeakMap<FE, JSX.Element>()


export function setFEChildren(fe: FE, children: JSX.Element) {
  childrenMap.set(fe, children)
}

export function getFEChildren(fe: FE): JSX.Element | undefined {
  return childrenMap.get(fe)
}
