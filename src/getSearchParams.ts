import type { APIEvent, FetchEvent, URLSearchParams } from './fundamentals/types'

export function getSearchParams(event: FetchEvent | APIEvent): URLSearchParams {
  return Object.fromEntries(new URL(event.request.url).searchParams.entries())
}
