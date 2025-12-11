/**
 * 🧚‍♀️ How to access:
 *     - import { getGoUrl } from '@ace/getGoUrl'
 */


import { goHeaderName, goStatusCode } from './vars'


/**
 * Reads the `goUrl` (`redirectUrl`) from a `Response` header
 * @param response - Optional Response, IF not an instance of Response we return null
 * @returns The string `goUrl`
 */
export function getGoUrl(response: Response): string | null {
  return (response && response instanceof Response && response.status === goStatusCode)
    ? response.headers.get(goHeaderName) ?? null
    : null
}
