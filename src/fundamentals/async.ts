/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import { Async } from '@ace/async'
 */


import { useScope } from './useScope'
import { parseError } from './parseError'
import { type Accessor, createSignal } from 'solid-js'
import type { AsyncStatus, BaseApiReq, AceResData, AceResEither, FetchFn, RequiredKeys, AllowUndefinedIfNoRequired } from './types'


/**
 * - If you'd love to get Api data during page load please use `Load` or `Stream`
 * - If you'd love to query an Api function off page load (ex: onClick) please use `Async`
 * - The creation of the Async instance is not an async happening, but calling `run()` is so that will need to be in an async function
 * - The `Async` instance includes a status function to access the current status a `run()` function to call the Api and an `fd()` function to call the Api w/ `FormData`
  ```ts
  const save = new Async(apiSaveChatMessage)

  const onSubmit = createOnSubmit(async ({ event }) => {
    const body = vParser.body(info.parser, { chatMessage: store.chatMessage })

    const res = await save.run({ body })

    if (res.data) {
      event.target.reset() // reset form
      sync('chatMessages', mergeArrays(store.chatMessages, res.data))
    }
  })
  ```
 */
export class Async<
  T_Req extends BaseApiReq,
  T_Res_Data extends AceResData,
> {
  status: Accessor<AsyncStatus>

  run: AsyncRun<ToAsyncReq<T_Req>, T_Res_Data>

  constructor(fn: FetchFn<T_Req, T_Res_Data>) {
    const scope = useScope()

    const [status, setStatus] = createSignal<AsyncStatus>('idle')
    this.status = status

    this.run = (async (req?: any) => {
      setStatus('loading')

      try {
        const parsed = await fn(req as unknown as T_Req, scope) as AceResEither<T_Res_Data>

        setStatus(parsed?.error ? 'error' : 'success')
        return parsed
      } catch (e) {
        setStatus('error')
        return parseError(e)
      }
    }) as any
  }
}


export type AsyncProps<T_Req extends BaseApiReq, T_Res_Data extends AceResData> = ConstructorParameters<typeof Async<T_Req, T_Res_Data>>[0]


/**
 * - Overload signatures for `run()`
 * - Uses conditional types to determine if the run method should be callable with or without `req`
 * - `RequiredKeys<T_Req> extends never`
 *     - When true `T_Req` does not require keys so we may call run() w/o `req`
 */
export type AsyncRun<T_Req extends BaseApiReq, T_Res_Data extends AceResData> = RequiredKeys<T_Req> extends never
  ? {
    (): Promise<AceResEither<T_Res_Data>>
    (req?: AllowUndefinedIfNoRequired<T_Req>): Promise<AceResEither<T_Res_Data>>
  }
  : {
    (req: T_Req): Promise<AceResEither<T_Res_Data>>
  }


/**
 * - Transforms an Api defined `req` into a Frontend-compatible Request
 *     1. Omit 'headers' Let the browser create and Api validate headers
 *     1. Transmute 'formData' from an object type into a native browser `FormData` type
 *     1. Preserve all else (`body`, `pathParams`, `searchParams`)
 */
type ToAsyncReq<T extends BaseApiReq> = {
  [K in keyof T as K extends 'headers' ? never : K]: K extends 'formData' ? FormData : T[K]
} & {}
