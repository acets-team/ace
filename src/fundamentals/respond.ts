/**
 * 🧚‍♀️ How to access:
 *     - import { respond } from '@ace/respond'
 *     - import type { RespondProps } from '@ace/respond'
 */


import { AceError } from './aceError'
import type { AceResponse, FullAPIResponse } from './types'


/**
 * ### Builds an API Response
 * @param props.data - Optional, data to respond w/, when `falsy` is `null`
 * @param props.error - Optional, AceError to respond w/, when `falsy` is `null`
 * @param props.go - Optional, redirect to respond w/, when `falsy` is `null`
 * @param props.status - HTTP status 
 * @param props.headers - Optional, HTTP headers, automatically adds a content type of application json
 * @returns 
 */
export function respond<T_Data>({ data, error, go, status, headers }: RespondProps<T_Data>): AceResponse<T_Data> {
  const responseJSON: FullAPIResponse<T_Data> = {
    go: go ?? null,
    data: data ?? null,
    error: error instanceof AceError ? error.get().error : null,
  }

  const init: ResponseInit = {
    status,
    headers: { 'Content-Type': 'application/json', ...headers }
  }

  const res: AceResponse<T_Data> = new Response(JSON.stringify(responseJSON), init)
  res.__dataType = null as T_Data
  return res
}


export type RespondProps<T_Data> = {
  data?: T_Data | null,
  error?: AceError | null,
  go?: string | null,
  status: number,
  headers?: HeadersInit
}
