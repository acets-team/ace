import { AceError } from './fundamentals/aceError'
import type { ApiMethods } from './fundamentals/types'

/**
 * - Do a fetch call on the fe
 * - If the server called `go()` aka `Response.redirect()` then `feFetch()` does the redirect via `window.location.href`
 * @returns Parsed Response data
 */
export async function feFetch<T>(url: string, method: ApiMethods = 'GET', body?: any): Promise<T> {
  let requestInit = {}

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

  if (response.redirected) throw window.location.href = response.url

  if (response.headers.get('content-type')?.includes('application/json')) return (await response.json()) as Promise<T>
  else throw new AceError({ status: response.status, statusText: response.statusText, rawBody: await response.text() })
}
