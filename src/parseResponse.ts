import { AceError } from './fundamentals/aceError'

/** 
 * - IF response content type includes the word `json` in it THEN clone response, do a `.json()` on it and give back that data
 * - ELSE => give back the `Response`
 */
export async function parseResponse<T_Response>(response: any): Promise<T_Response> {
  try {
    if (!(response instanceof Response)) return response as T_Response
    else {
      if (!response.headers.get('content-type')?.toLowerCase().includes('json')) return response as T_Response
      else {
        const clonedResponse = response.clone()
        return await clonedResponse.json() as T_Response
      }
    }
  } catch (e) {
    return await AceError.catch(e) as T_Response
  }
}
