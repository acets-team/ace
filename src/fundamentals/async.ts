import { parseError } from './parseError'
import { type Accessor, createSignal } from 'solid-js'
import type { AsyncStatus, BaseApiReq, AceResData, AceResEither, FetchFn, RequiredKeys, AllowUndefinedIfNoRequired } from './types'


/**
 * - If you'd love to get Api data during page load please use `Load` or `Stream`
 * - If you'd love to query an Api function off page load (ex: onClick) please use `Async`
 * - `Async` let's us pass a desired `req` (request data to be sent to the Api) when we call `run()`
 * - The creation of the Async instance is not an async happening, but calling `run()` is so that will need to be in an axync function
 * @example
  ```ts
  const save = new Async(apiSaveChatMessage)

  const onSubmit = createOnSubmit(async ({ event }) => {
    const body = vParser.body(info.parser, { chatMessage: store.chatMessage })

    const res = await save.run({ body })

    if (res.data) {
      event.currentTarget.reset() // reset form
      sync('chatMessages', mergeArrays(store.chatMessages, res.data))
    }
  })
  ```
 */
export class Async<T_Req extends BaseApiReq, T_Res_Data extends AceResData> {
  status: Accessor<AsyncStatus>

  run: AsyncRun<T_Req, T_Res_Data>

  constructor(fn: FetchFn<T_Req, T_Res_Data>) {
    const [status, setStatus] = createSignal<AsyncStatus>('idle')
    this.status = status

    this.run = (async (req?: AllowUndefinedIfNoRequired<T_Req>) => {
      setStatus('loading')

      try {
        const parsed = await fn(req as T_Req) as unknown as AceResEither<T_Res_Data>

        setStatus(parsed?.error ? 'error' : 'success')
        return parsed
      } catch (e) {
        setStatus('error')
        return parseError(e)
      }
    }) as AsyncRun<T_Req, T_Res_Data>
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
    (): Promise<AceResEither<T_Res_Data>>;
    (req: AllowUndefinedIfNoRequired<T_Req>): Promise<AceResEither<T_Res_Data>>;
  }
  : {
    (req: AllowUndefinedIfNoRequired<T_Req>): Promise<AceResEither<T_Res_Data>>;
  }
