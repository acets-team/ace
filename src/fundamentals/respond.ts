/**
 * 🧚‍♀️ How to access:
 *     - import { respond } from '@ace/respond'
 *     - import type { RespondProps } from '@ace/respond'
 */


import { AceError } from './aceError'
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
  if (go) {
    const h = new Headers(headers)
    h.set('Location', go)
    const s = [301, 302, 303, 307, 308].includes(status) ? status : 301

    return new Response(null, { headers: h, status: s })
  }

  const h = new Headers(headers)
  h.set('content-type', 'application/json')
  const init: ResponseInit = { status, headers: h }
  const responseJSON: ApiResponse<T_Data> = {}

  if (data !== null && data !== undefined) responseJSON.data = data
  if (error instanceof AceError) responseJSON.error = error.get().error

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
