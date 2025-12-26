/**
 * 🧚‍♀️ How to access:
 *     - Plugin: vanilla
 *     - import { r2Url } from '@ace/r2Url'
 */


import { env } from './env'
import { config } from 'ace.config'


/**
 * Create a url to get an object that is stored in Cloudflare R2
 * @param props.key Optional, unique key for the object
 * @param props.searchParams Optional searchParams
 */
export function r2Url(props?: { key?: string, searchParams?: URLSearchParams }): string {
  const base = config.r2Origins?.[env]
  if (!base) throw new Error(`ace.config.js > r2Origins > "${env}" is undefined`)

  const url = new URL(base)

  if (props?.key) {
    // encode parts & not slashes
    const encodedKey = props.key 
      .split('/')
      .map(encodeURIComponent)
      .join('/')

    // slash guard
    // ensures basePath and keyPath will always have exactly one slash between them
    const keyPath = encodedKey.startsWith('/')
      ? encodedKey.slice(1)
      : encodedKey

    const basePath = url.pathname.endsWith('/')
      ? url.pathname.slice(0, -1)
      : url.pathname

    url.pathname = basePath + '/' + keyPath
  }

  if (props?.searchParams) {
    props.searchParams.forEach((value, key) => {
      url.searchParams.append(key, value)
    })
  }

  return url.toString()
}
