/**
 * 🧚‍♀️ How to access:
 *     - import { respond } from '@ace/respond'
 *     - import type { RespondProps } from '@ace/respond'
 */



import type { AceError } from './aceError'
import type { AceResponse, ApiResponse } from './types'



/**
 * ### Builds an API Response
 * @param props.data - Optional, data to respond w/, when `falsy` is `null`
 * @param props.error - Optional, AceError to respond w/, when `falsy` is `null`
 * @param props.go - Optional, redirect to respond w/, when `falsy` is `null`
 * @param props.status - HTTP status
 * @param props.headers - Optional, HTTP headers, automatically adds a content type of application json
 */
export function respond<T_Data>({ data, error, go, status, headers }: RespondProps<T_Data>): AceResponse<T_Data> {
  if (go) return giveRedirect(status, go, headers)
  else return giveData(status, data ?? null, error ?? null, headers)
}



function giveRedirect(s: number, go: string, h?: HeadersInit) {
  const headers = new Headers(h)
  headers.set('Location', go)
  const status = [301, 302, 303, 307, 308].includes(s) ? s : 301 // varing out these codes into a Set causes errors @ cloudflare workers b/c they need to know at build time is this a redirect

  return new Response(null, { headers, status })
}



function giveData<T_Data>(status: number, data: T_Data | null, error: AceError | null, h?: HeadersInit) {
  const headers = new Headers(h)
  headers.set('content-type', 'application/json')
  const init: ResponseInit = { status, headers }
  const responseJSON: ApiResponse<T_Data> = {}

  if (data !== null && data !== undefined) responseJSON.data = data
  if (error) responseJSON.error = error.get().error

  const res: AceResponse<T_Data> = new Response(JSON.stringify(responseJSON), init)
  res.__dataType = null as T_Data

  return res
}



export type RespondProps<T_Data> = {
  /** Optional, data to respond w/, when `falsy` is `null` */
  data?: T_Data,
  /** Optional, AceError to respond w/, when `falsy` is `null` */
  error?: AceError,
  /** Optional, redirect to respond w/, when `falsy` is `null` */
  go?: string,
  /** HTTP status */
  status: number,
  /** Optional, HTTP headers, automatically adds a content type of application json */
  headers?: HeadersInit
}
