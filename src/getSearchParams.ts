import type { APIEvent, FetchEvent, UrlSearchParams } from './fundamentals/types'

/**
 * @example
  ```ts
  var example = '/api/turso-events-watch?keys=a&keys=b&frequency=5000&recap=1'

  var response = {
    "keys": ["a", "b"],
    "frequency": "5000",
    "recap": "1"
  }
  ```
 */
export function getSearchParams(event: FetchEvent | APIEvent): UrlSearchParams {
  const url = new URL(event.request.url)
  const params: UrlSearchParams = {}

  for (const key of new Set(url.searchParams.keys())) {
    const values = url.searchParams.getAll(key)
    // if multiple values, store as array, otherwise as string
    params[key] = values.length > 1 ? values : values[0]
  }

  return params
}
