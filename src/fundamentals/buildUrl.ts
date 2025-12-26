import { buildOrigin } from './env'
import type { PathnameSegments } from '../pathname2Segments'
import type { BasePathParams, BaseSearchParams } from './types'


/**
 * Receives pathname segments, path params & search params and then constructs a url
 *
 * @param props.absoluteUrl - Optional, IF `true` we will append the buildOrigin from `@ace/env` to the URL
 * @param props.segments - The pre-parsed array of path segments in the new format.
 * @param props.params - Path parameters object.
 * @param props.search - Search parameters object.
 * @returns The built URL
 */
export function buildUrl(props: { absoluteUrl?: boolean, segments: PathnameSegments, pathParams?: BasePathParams, searchParams?: BaseSearchParams }): string {
  let response = ''

  for (const segment of props.segments) { // path params
    const segmentName = segment[0]
    const segmentType = segment.length > 1 ? segment[1] : 's' // 's' for static

    if (segmentType === 's') response += '/' + segmentName // static segment
    else { // required or optional segment
      const paramName = segmentName
      const paramValue = paramName && props.pathParams ? props.pathParams[paramName] : null

      if (segmentType === 'r' && (paramValue === undefined || paramValue === null)) { // required parameter validation
        throw new Error('Error building url, missing required param', { cause: { paramName, props } })
      }

      if (paramValue !== undefined && paramValue !== null) { // append value only if it exists (handles optional missing params by skipping the segment)
        response += '/' + paramValue
      }
    }
  }

  if (response === '') response = '/' // path cleanup

  if (props.searchParams && Object.keys(props.searchParams).length > 0) { // search params
    const urlSearchParams = new URLSearchParams()

    for (const key in props.searchParams) {
      const value = props.searchParams[key]

      if (value !== undefined && value !== null) { // only include if value is not null or undefined
        if (!Array.isArray(value)) urlSearchParams.append(key, String(value)) // Standard single value
        else { // place each item from array on one at a time
          value.forEach((item) => {
            if (item !== undefined && item !== null) {
              urlSearchParams.append(key, String(item))
            }
          })
        }
      }
    }

    const searchString = urlSearchParams.toString()

    if (searchString) { // append search params
      response += '?' + searchString
    }
  }

  if (props.absoluteUrl) response = buildOrigin + response

  return response
}

export type BuildUrlProps = Parameters<typeof buildUrl>[0]
