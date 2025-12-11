import { type Accessor, createSignal } from 'solid-js'
import { createAsyncStore } from '@solidjs/router'


export function createAsyncStoreWithSignal<T>(asyncFn: () => Promise<T>, options?: Parameters<typeof createAsyncStore<T>>[1]): [Accessor<T | undefined> & { latest: T | undefined }, Accessor<number>] {
  const [version, setVersion] = createSignal(0)

  const wrapped = createAsyncStore<T>(async () => {
    setVersion(v => v + 1)
    return asyncFn()
  }, options)

  return [wrapped, version]
}
