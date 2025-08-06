import type { APIEvent, FetchEvent, UrlSearchParams } from './fundamentals/types'

export function getSearchParams(event: FetchEvent | APIEvent): UrlSearchParams {
  return Object.fromEntries(new URL(event.request.url).searchParams.entries())
}
