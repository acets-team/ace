/**
 * 🚨 This file is imported into `build.ts` so the imports must be as slim as possible
 */


/**
 * - Parses pathname string and generates optimized segments for url building
 * - `o`: Optional param
 * - `r`: Required param
 * @param pathname ex: `/posts/:category/:id?`
 * @returns ex: `[['posts'],['category','r'],['id','o']]`
 */
export function pathname2Segments(pathname: string): PathnameSegments  {
  const response: PathnameSegments = []
  const rawSegments = pathname.split('/').filter(Boolean)

  for (const rawSegment of rawSegments) {
    if (!rawSegment.startsWith(':')) response.push([rawSegment])
    else {
      const isOptional = rawSegment.endsWith('?')
      const paramName = isOptional ? rawSegment.slice(1, -1) : rawSegment.slice(1)
      const paramType = isOptional ? 'o' : 'r'

      response.push([paramName, paramType])
    }
  }

  return response
}


export type PathnameSegments = ([string] | [string, 'o' | 'r'])[]
