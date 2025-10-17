import { createSignal, createMemo, onMount, onCleanup } from 'solid-js'

export function useNetworkStatus() {
  const [online, setOnline] = createSignal(true) // assume online until confirmed

  onMount(() => {
    setOnline(navigator.onLine) // sync immediately on mount to correct any stale value

    const handle = () => setOnline(navigator.onLine)
    window.addEventListener('online', handle)
    window.addEventListener('offline', handle)

    onCleanup(() => {
      window.removeEventListener('online', handle)
      window.removeEventListener('offline', handle)
    })
  })

  return createMemo(() => (online() ? 'online' : 'offline'))
}
