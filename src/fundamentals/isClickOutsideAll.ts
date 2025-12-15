/**
 * 🧚‍♀️ How to use:
 *     - Plugin: vanilla
 *     - import { isClickOutsideAll } from '@ace/isClickOutsideAll'
 */



/**
 * - IF click is outside of all `aimElements` we will call `fn` & pass it the clicked item
 * - Example: Helpful when you have a dropdown trigger and dropdown content and want to know if a click was outside both
 * @param aimElements The elements we want to know if the click was outside of
 * @param fn Async or sync function to call when a click is outside all `aimElements`, is passed the clicked item: `{ clicked: Node }`
 * @returns A function to remove the click listener
 */
export function isClickOutsideAll(props: { aimElements: HTMLElement[], fn: (props: { clicked: Node }) => any | Promise<any> }) {
  document.addEventListener('click', listener)

  return () => document.removeEventListener('click', listener)

  async function listener(event: PointerEvent) {
    if (event.target instanceof Node) {
      let valid = true

      for (const aimElement of props.aimElements) {
        if (aimElement.contains(event.target)) {
          valid = false
          break
        }
      }

      if (valid) {
        await props.fn({ clicked: event.target })
      }
    }
  }
}
