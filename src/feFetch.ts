import { parseResponse } from './parseResponse'
import { getGoUrl } from './fundamentals/getGoUrl'
import type { ApiMethods } from './fundamentals/types'


/**
 * ### Do a fetch call on the fe
 * - If the server called `scope.go()` then `feFetch()` does the redirect via `window.location.href`
 * @returns IF the header content-type is json => `Parsed Response data`, ELSE => `Response` object
 */
export async function feFetch<T>(url: string, method: ApiMethods = 'GET', body?: any): Promise<T> {
  let requestInit: RequestInit = {}

  switch (method) {
    case 'GET':
      requestInit = {
        method,
        credentials: 'same-origin',
      }
      break
    case 'PUT':
    case 'POST':
    case 'DELETE':
      requestInit = {
        method,
        credentials: 'same-origin',
        body: body ? JSON.stringify(body) : null,
        headers: { 'content-type': 'application/json' },
      }
      break
  }

  const response = await fetch(url, requestInit)

  const goUrl = getGoUrl(response)

  if (goUrl) throw window.location.href = goUrl

  return await parseResponse<T>(response)
}
