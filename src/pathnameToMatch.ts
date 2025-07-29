import { API } from './fundamentals/api'
import { Route } from './fundamentals/route'
import type { Params } from '@solidjs/router'
import { RegexMap } from './fundamentals/types'



/**
 * - From pathname → Route or API + extracted params
 * - Returns `undefined` if no pattern matches (→ your 404)
 */
export async function pathnameToMatch(pathname: string, map: RegexMap<'api' | 'route'>): Promise<RouteMatch<API | Route> | undefined> {
  for (const path of Object.keys(map) as Array<keyof typeof map>) {
    const loader = map[path]?.loader
    if (!loader) continue

    const pattern = map[path]?.pattern
    if (!pattern) continue

    const match = pattern.exec(pathname)
    if (!match) continue

    const handler = await loader()
    if (!(handler instanceof API) && !(handler instanceof Route)) continue

    return { handler, params: match.groups ?? {} }
  }

  return undefined // no match
}



export type RouteMatch<T_Handler> = {
  handler: T_Handler
  params: Params
}
