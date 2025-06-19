import { AceError } from './aceError'
import type { AceResponse, RawAPIResponse } from './types'


export function respond<T_Data = any>({ data = null, error = null, go = null, status, headers }: { data?: T_Data | null, error?: AceError | null, go?: string | null, status: number, headers?: HeadersInit }): AceResponse<T_Data> {
  let responseJSON: RawAPIResponse<T_Data> = { go, data, error: null }

  if (error instanceof AceError) responseJSON.error = error.get().error

  const responseInt: ResponseInit = {
    status,
    headers: { 'Content-Type': 'application/json', ...headers },
  }

  const response: AceResponse<T_Data> = new Response(JSON.stringify(responseJSON), responseInt)

  return response
}
