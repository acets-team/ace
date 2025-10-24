/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import { ServiceWorker } from '@ace/serviceWorker'
 */


import { onMount } from 'solid-js'


/**
 * - Register service worker
 * - Prerequisites:
 *    - /public/sw.js
 *    - In ace.config.js set "sw" to true
 * @example
  ```ts
  import { Nav } from '../Nav/Nav'
  import { Layout } from '@ace/layout'
  import { ServiceWorker } from '@ace/serviceWorker'

  export default new Layout()
    .component(({children}) => {
      return <>
        <Nav />
        {children}
        <ServiceWorker />
      </>
    })
  ```
 */
export function ServiceWorker({ filename = '/sw.js' }: { filename?: string }) {
  onMount(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register(filename, { type: 'module' })
        .catch(err => console.error('SW registration failed:', err))
    }
  })

  return <></>
}
