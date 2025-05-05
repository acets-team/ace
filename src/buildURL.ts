/**
 * @param path As it shows in the `Route` config, so w/ params
 * @returns URL with params properly injected
 */
export function buildURL(path: string, params: any): string {
  if (params) { // add params to url
    for (const param in params) {
      const regex = new RegExp(`:${param}\\?*`, 'g')
      path = path.replace(regex, String(params[param]))
    }
  }

  return path.replace(/\/?:([^/]+)\??/g, (_, param) => { // add baseUrl and remove any param names still in url
    return param.includes('?') ? '' : '/'
  })
}
