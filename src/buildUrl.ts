import type { UrlPathParams, UrlSearchParams } from './fundamentals/types'


/**
 * @param path As it shows in @ `new Route()` config, so w/ params
 * @returns URL with path & search params properly set
 */
export function buildUrl(path: string, options?: { pathParams?: UrlPathParams, searchParams?: UrlSearchParams }): string {
  let url = path

  if (options?.pathParams) { // add params to url
    for (const param in options.pathParams) {
      const regex = new RegExp(`:${param}\\?*`, 'g')
      url = url.replace(regex, parseParam(options.pathParams[param]))
    }
  }

  url = url.replace(/\/?:([^/]+)\??/g, (_, param) => { // remove any param names still in url
    return param.includes('?') ? '' : '/'
  })

  if (url !== '/') url = url.replace(/\/+$/, '') // trim trailing slash

  if (options?.searchParams) {
    const usp = new URLSearchParams()

    for (const key in options.searchParams) {
      const value = options.searchParams[key]

      if (!Array.isArray(value)) usp.set(key, parseParam(value))
      else {
        for (const v of value) {
          usp.append(key, parseParam(v))
        }
      } 
    }

    const query = usp.toString()
    if (query) url += `?${query}`
  }

  return url
}


function parseParam(param: unknown): string {
  return encodeURIComponent(String(param))
}
