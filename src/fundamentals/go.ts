/**
 * 🧚‍♀️ How to access:
 *     - import { go } from '@ace/go'
 */


import { buildURL } from '../buildURL'
import { redirect } from '@solidjs/router'
import type { Routes, InferParamsRoute, GoResponse } from './types'



/**
 * - Wraps "@solidjs/router" `redirect()`
 * - Provides intellisense to current routes
 * - Typically called w/in a `b4()` fn, same as `be.go()`
 */
export function go<T extends Routes>(path: T, params?: InferParamsRoute<T>): GoResponse {
  return redirect(buildURL(path, params))
}
