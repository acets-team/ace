/**
 * 🧚‍♀️ How to access:
 *     - import { feComponent } from '@ace/feComponent'
 */


import { type JSX } from 'solid-js'
import { clientOnly } from '@solidjs/start'


/**
 * ### Creates a frontend (fe) only component!
 * - To ensure your build places no fe imports into server side bundle => place export into its own file
 * 
 * @example
 * 
  ```ts
  import { onCleanup, onMount } from 'solid-js'
  import { feComponent } from '@ace/feComponent'


  export const Example = feComponent((props: { name: string }) => {
    onMount(() => {
      document.addEventListener('click', onClick)
    })

    onCleanup(() => {
      document.removeEventListener('click', onClick)
    })

    function onClick(event: MouseEvent) {
      console.log('aloha')
    }

    return <div>Hi, {props.name}!</div>
  })
  ```
 * 
 */
export function feComponent<T_Props extends Record<string, any> = {}>(Component: (props: T_Props) => JSX.Element): (props: T_Props) => JSX.Element {
  return clientOnly(async () => ({ // mimic default export: clientOnly(() => import('./Example'))
    default: (props: T_Props) => <Component {...props} />
  }))
}
