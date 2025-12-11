/**
 * 🧚‍♀️ How to access:
 *     - import { pathnameToPattern } from '@ace/pathnameToPattern'
 */


/**
 * - Replaces route parameters (:param and :param?) in a pathname w/ regex patterns
 * - Regex helps match a server request url w/ a route or api
 * - Regex also helps us know what param values are in a url 🙌
 * @param pathname - As defined @ `new Route()`, `new Route404()` or `new API()`
 */
export function pathnameToPattern(pathname: string): RegExp {
  /**
   * - From `"/api/character/:name/:id?"` => `["api","character",":name",":id?"]`
   * - From `":name"` => `/(?<name>[^/]+)`
   * - From `":id?"` => `(?:/(?<id>[^/]+))?`
   */
  const segments = pathname.split('/').filter(Boolean)

  const regexBody = segments // build regex w/ named capture groups for every :param
    .map(s => {
      if (!s.startsWith(':')) return `/${s}` // literal

      const isOptional = s.endsWith('?')
      const name = s.slice(1, isOptional ? -1 : undefined)
      const capture = `(?<${name}>[^/]+)`

      return isOptional
        ? `(?:/${capture})?`   // wrap slash+capture as optional
        : `/${capture}`
    })
    .join('') // array to string

  return new RegExp(`^${regexBody}/?$`) // allow an optional trailing slash, anchor start/end
}
