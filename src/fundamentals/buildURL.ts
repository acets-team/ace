/**
 * 🧚‍♀️ How to access:
 *     - import { buildURL } from '@ace/buildURL'
 */


import type { URLPathParams, URLSearchParams } from './types'


/**
 * @param path As it shows in @ `new Route()` config, so w/ params
 * @returns URL with path & search params properly set
 */
export function buildURL(path: string, options?: { pathParams?: URLPathParams, searchParams?: URLSearchParams }): string {
  let url = path

  if (options?.pathParams) { // add params to url
    for (const param in options.pathParams) {
      const regex = new RegExp(`:${param}\\?*`, 'g')
      url = url.replace(regex, encodeURIComponent(String(options.pathParams[param])))
    }
  }

  url = url.replace(/\/?:([^/]+)\??/g, (_, param) => { // remove any param names still in url
    return param.includes('?') ? '' : '/'
  })

  if (url !== '/') url = url.replace(/\/+$/, '') // trim trailing slash

  if (options?.searchParams) {
    const usp = new URLSearchParams() // does encodeURIComponent() for us

    for (const key in options.searchParams) {
      const value = options.searchParams[key]

      if (typeof value === 'string') usp.set(key, value)
      else if (Array.isArray(value)) {
        for (const v of value) {
          usp.append(key, v)
        }
      }
    }

    const query = usp.toString()
    if (query) url += `?${query}`
  }

  return url
}
