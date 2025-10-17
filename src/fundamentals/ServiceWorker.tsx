/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import { ServiceWorker } from '@ace/serviceWorker'
 */


import { onMount } from 'solid-js'
import { packageDotJsonVersion } from './env'


/**
 * - Register service worker
 * - Prerequisites:
 *    - /public/sw.js
 *    - In ace.config.js set a swVersion
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
export function ServiceWorker() {
 onMount(() => {
   if (packageDotJsonVersion && 'serviceWorker' in navigator) {
     navigator.serviceWorker.register(`/sw_${packageDotJsonVersion}.js`, { type: 'module' })
       .catch(err => console.error('SW registration failed:', err));
   }
 })

 return <></>
}
