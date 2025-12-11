import type { BasePathParams, BaseSearchParams } from './fundamentals/types'


/**
 * @param path As it shows in @ `new Route()` config, so w/ params
 * @returns URL with path & search params properly set
 */
export function _buildUrl(props: { path: string, pathParams?: BasePathParams, searchParams?: BaseSearchParams }): string {
  let url

  if (props.path) url = props.path

  if (!url) throw new Error('To buildUrl(), please provide a truthy path', { cause: props })

  if (props?.pathParams) { // add params to url
    for (const param in props.pathParams) {
      const regex = new RegExp(`:${param}\\?*`, 'g')
      url = url.replace(regex, parseParam(props.pathParams[param]))
    }
  }

  url = url.replace(/\/?:([^/]+)\??/g, (_, param) => { // remove any param names still in url
    return param.includes('?') ? '' : '/'
  })

  if (url !== '/') url = url.replace(/\/+$/, '') // trim trailing slash

  if (props?.searchParams) {
    const usp = new URLSearchParams()

    for (const key in props.searchParams) {
      const value = props.searchParams[key]

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
