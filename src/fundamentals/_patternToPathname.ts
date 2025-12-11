/**
 * - Reverse `pathnameToPattern()`
 * @param pattern - Regex pattern
 * @returns 
 */
export function patternToPathname(pattern: string): string {
  // strip anchors and trailing slash allowance
  let pathname = pattern.replace(/^\/\^/, '')
    .replace(/\/\?\$\/?$/, '')
    .replace(/^\^/, '')
    .replace(/\$$/, '')

  // replace optional parameter groups: (?:/(?<name>[^/]+))?  → /:name?
  pathname = pathname.replace(/\(\?:\/\(<(?<name>[^>]+)>[^)]+\)\)\?/g, '/:$1?')

  // Replace required parameter groups: /(?<name>[^/]+) → /:name
  pathname = pathname.replace(/\/\(<(?<name>[^>]+)>[^)]+\)/g, '/:$1')

  return pathname
}
