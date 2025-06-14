/**
 * 🧚‍♀️ How to access:
 *     - import { go } from '@ace/go'
 */


import { buildURL } from '../buildURL'
import { GoResponse } from './goResponse'
import type { Routes, InferParamsRoute } from './types'



/**
 * - Provides intellisense to current routes
 * - Stores the location (url) in an object to be redirected to later
 */
export function go<T extends Routes>(path: T, params?: InferParamsRoute<T>): GoResponse {
  return new GoResponse(buildURL(path, params))
}
