import type { JSX } from 'solid-js'
import type { ScopeComponent } from './fundamentals/scopeComponent'


/**
 * - WeakMap keys are weak references
 *     — If the scope instance is no longer in use elsewhere, the key-value pair is garbage collected
 *     - A normal Map keeps keys alive and can cause memory leaks
 */
const childrenMap = new WeakMap<ScopeComponent, JSX.Element>()


export function setScopeComponentChildren(scope: ScopeComponent, children: JSX.Element) {
  childrenMap.set(scope, children)
}

export function getScopeComponentChildren(scope: ScopeComponent): JSX.Element | undefined {
  return childrenMap.get(scope)
}
