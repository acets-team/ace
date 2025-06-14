import { AceError } from './fundamentals/aceError'

/**
 * - Do a fetch call on the fe
 * - If the server called `go()` aka `Response.redirect()` then `feFetch()` does the redirect via `window.location.href`
 * @returns Parsed Response data
 */
export async function feFetch<T>(url: string, method: 'GET' | 'POST' = 'GET', body?: any): Promise<T> {
  let requestInit = {}

  switch (method) {
    case 'GET':
      requestInit = {
        credentials: 'same-origin',
      }
      break
    case 'POST':
      requestInit = {
        method: 'POST',
        body: JSON.stringify(body),
        credentials: 'same-origin',
        headers: { 'content-type': 'application/json' },
      }
      break
  }

  const response = await fetch(url, requestInit)

  if (response.redirected) throw window.location.href = response.url

  if (response.headers.get('content-type')?.includes('application/json')) return (await response.json()) as Promise<T>
  else throw new AceError({ status: response.status, statusText: response.statusText, rawBody: await response.text() })
}
