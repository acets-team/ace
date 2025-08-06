import type { RequestEvent } from 'solid-js/web'


/**
 * - On the frontend (fe) if we'd love to get the current origin we can do `window.location.origin` to get like `https://example.com`
 * - On the backend call `getOrigin()`
 */
export function getOrigin(event: RequestEvent) {
  const { protocol, host } = new URL(event.request.url);
  return `${protocol}//${host}`
}
