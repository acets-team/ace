/**
 * 🧚‍♀️ How to access:
 *     - import { getMiddleware } from '@ace/getMiddleware'
 */


import { onMiddlewareRequest } from './onMiddlewareRequest'
import { createMiddleware, type ResponseMiddleware } from '@solidjs/start/middleware'


/**
 * - Returns a solid start middleware object configured to work w/ Ace
 * - The lower level `onMiddlewareRequest()` is also available if you'd love closer access to your middleware
 * @example
 * ```ts
 * import { getMiddleware } from '@ace/getMiddleware'
 * 
 * export default getMiddleware()
 * ```
 * @param options.onBeforeResponse The SolidJS `createMiddleware` takes an `onRequest` and an `onBeforeResponse`, this is the `onBeforeResponse`
 */
export function getMiddleware(options: { onBeforeResponse?: ResponseMiddleware | ResponseMiddleware[] } = {}) {
  return createMiddleware({
    onBeforeResponse: options.onBeforeResponse,
    async onRequest (e) {
      const res = await onMiddlewareRequest(e)
      if (res) return res
    },
  })
}
