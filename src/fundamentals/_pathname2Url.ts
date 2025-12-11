import { BasePathParams, BaseSearchParams } from "./types"

/**
 * Converts a pathname into a full URL string by replacing path parameters and appending search parameters
 *
 * @param props.path - Defined pathname (ex: `/users/:id/details`)
 * @param props.pathParams - Optional
 * @param props.searchParams - Optional
 * @throws {Error} If a required path parameter is missing in pathParams
 */
export function _pathname2Url(props: { path: string, pathParams?: BasePathParams, searchParams?: BaseSearchParams }) {
  if (!props.path || typeof props.path !== 'string') throw new Error('Please provide a truthy string "path" property', { cause: {props }})

  // --- 1. Replace Path Parameters ---

  // Regex to find required and optional parameters:
  // - :(\w+)\??
  //   - :(\w+): captures the parameter name (e.g., 'id')
  //   - \??: matches an optional '?' for optional parameters
  const finalPath = props.path.replace(/:(\w+)\??/g, (match, paramName) => {
    const isOptional = match.endsWith('?')
    const paramValue = props.pathParams?.[paramName]

    if (paramValue !== undefined && paramValue !== null) {
      // If parameter value is provided, use it and convert to string
      return String(paramValue)
    }

    if (!isOptional) {
      // Required parameter is missing
      throw new Error(`Missing required path parameter: "${paramName}" for path "${props.path}"`, { cause: {props}})
    }

    // Optional parameter is missing, so remove the segment
    // We look for a preceding slash to remove the segment, e.g., "/:id?" -> ""
    // This is a common and often desired behavior for optional segments.
    return ''
  })

  // --- 2. Clean up extra slashes caused by optional parameter removal ---

  // Replaces multiple slashes (//) with a single slash (/)
  // and ensures the path doesn't end with a trailing slash if it's not just "/"
  let cleanedPath = finalPath
    .replace(/\/{2,}/g, '/')
    .replace(/\/$/, '') // Remove trailing slash

  // Edge case: if the original path was just '/' or cleaning resulted in an empty string, set it back to '/'
  if (cleanedPath === '') {
    cleanedPath = '/'
  }

  // --- 3. Append Search Parameters ---

  const searchParamKeys = Object.keys(props.searchParams ?? {})

  if (searchParamKeys.length === 0) {
    return cleanedPath
  }

  const urlSearchParams = new URLSearchParams()
  for (const key of searchParamKeys) {
    const value = props.searchParams?.[key]
    if (value !== undefined && value !== null) {
      // Ensure values are converted to string for URLSearchParams
      urlSearchParams.append(key, String(value))
    }
  }

  // Combine path and search string
  return `${cleanedPath}?${urlSearchParams.toString()}`
}
