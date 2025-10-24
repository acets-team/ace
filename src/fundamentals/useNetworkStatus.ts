/**
 * 🧚‍♀️ How to use:
 *   import { useNetworkStatus } from '@ace/useNetworkStatus'
 */


import { createSignal, createMemo, onMount, onCleanup, type Accessor } from 'solid-js'


/**
 * ### Helpful if you'd love to alter things based on their wifi connection
 * @example
    ```ts
    import { Route } from '@ace/route'
    import { showToast } from '@ace/toast'
    import { useNetworkStatus } from '@ace/useNetworkStatus'

    export default new Route('/')
      .component(() => {
        const status = useNetworkStatus()
        
        return <>
          <button type="button" onClick={() => showToast({ type: 'info', value: status() })}>Click here</button>
        </>
      })
    ```
 *
 */
export function useNetworkStatus(): Accessor<'online' | 'offline'> {
  onMount(attachListeners) // on hook mount => ensure window is bound
  onCleanup(detachListeners) // on hook ybmount => request window unbound

  return createMemo(() => (online() ? 'online' : 'offline'));
}


let hookCount = 0 // tracks how many instances of the hook are currently mounted


const [online, setOnline] = createSignal(true) // assume online initially, module-level signal to hold the network status is shared across all hook instances


function onNetworkChange() { // event handler function, used by all hooks
  setOnline(navigator.onLine)
}


function attachListeners() { // IF first hook are active => addEventListener to window
  if (hookCount === 0) {
    setOnline(navigator.onLine) // initial sync
    window.addEventListener('online', onNetworkChange)
    window.addEventListener('offline', onNetworkChange)
  }

  hookCount++ // increment usage counter
}


function detachListeners() { // IF last active hook cleanedup => removeEventListeners from window
  hookCount--

  if (hookCount === 0) {
    window.removeEventListener('online', onNetworkChange)
    window.removeEventListener('offline', onNetworkChange)
  }
}
