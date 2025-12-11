/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import { onClean } from '@ace/onClean'
 */


import { onCleanup } from 'solid-js'


/**
 * - Registers `onCleanup`: Runs when the component is unmounted
 * - Registers `pagehide`: The most reliable way to perform cleanup operations when a page is being unloaded
 * - We cannot cancel the page transition w/ `pagehide` which is why browsers trust it more then beforeunload for cleanup
 * - Automatically removes the pagehide event listener for us
 */
export function onClean(cleanupFn: () => void) {
  onCleanup(cleanupFn)

  const listener = () => {
    cleanupFn()
    window.removeEventListener('pagehide', listener)
  }

  window.addEventListener('pagehide', listener)
}
