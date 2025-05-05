import type { APIEvent, FetchEvent } from './fundamentals/types'

export const eventToPathname = (event: APIEvent | FetchEvent) => (new URL(event.request.url)).pathname
