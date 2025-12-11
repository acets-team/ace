import type { AceResData, AceResEither } from './types'



/**
 * - Extends the native Response class, ensuring it remains a valid object for network operations
 * - `Response` does not accept generics but `AceResponse` let's us add the `response data type`
 */
export class AceResponse<T_Response_Data extends AceResData> extends Response {
  __res?: T_Response_Data
}


/**
 * - `AceResponse` extends the native `Response` class, ensuring it remains a valid object for network operations
 * - `Response` does not accept generics but `AceResponse` let's us add the `response data type`
 */
export function createAceResponse<T_Res_Data extends AceResData>(
  json: AceResEither<T_Res_Data>,
  responseInit?: Partial<ResponseInit>,
): AceResponse<T_Res_Data> {
  return new AceResponse<T_Res_Data>(
    JSON.stringify(json),
    {
      ...responseInit,
      status: responseInit?.status ?? 200,
      headers: { ...responseInit?.headers, 'content-type': 'application/json' }
    }
  )
}
