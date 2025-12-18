import type { JSX } from 'solid-js'


/**
 * - Allows us to keep track of children w/o adding a setter to ScopeComponent
 */
export class ScopeComponentChildren {
  static getSub: () => undefined | JSX.Element
  static getRoot: () => undefined | JSX.Element

  static set(type: 'sub' | 'root', children: () => undefined | JSX.Element) {
    ScopeComponentChildren[type === 'sub' ? 'getSub' : 'getRoot'] = children
  }
}
