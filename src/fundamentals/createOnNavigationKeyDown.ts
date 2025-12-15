/**
 * 🧚‍♀️ How to access:
 *     - Plugin: vanilla
 *     - import { createOnNavigationKeyDown } from '@ace/createOnNavigationKeyDown'
 */


export function createOnNavigationKeyDown(props: {
  onEscape: () => any
  elements: () => undefined | NodeListOf<HTMLElement>
}) {
  return (event: KeyboardEvent) => {
    const keyName = event.key // name of the key pressed

    const _elements = props.elements()

    switch (keyName) {
      case 'Escape':
        event.preventDefault()
        props.onEscape()
        break

      case 'ArrowUp':
        event.preventDefault()

        if (_elements) {
          let didFocusOne = false

          for (let i = 0; i < _elements.length; i++) {
            if (document.activeElement === _elements[i]) {
              didFocusOne = true

              if (i === 0) break // IF first in list THEN stop loop

              _elements[i - 1]?.focus() // focus previous
              break
            }
          }

          if (!didFocusOne) _elements[0]?.focus()
        }
        break

      case 'ArrowDown':
        event.preventDefault()

        if (_elements) {
          let didFocusOne = false

          for (let i = 0; i < _elements.length; i++) {
            if (document.activeElement === _elements[i]) {
              didFocusOne = true

              if (i + 1 === _elements.length) break // IF last in list THEN stop loop

              _elements[i + 1]?.focus() // focus next
              break
            }
          }

          if (!didFocusOne) _elements[0]?.focus()
        }
        break
    }
  }
}
