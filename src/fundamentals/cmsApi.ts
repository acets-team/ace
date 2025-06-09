/**
 * 🧚‍♀️ How to access:
 *     - import { cmsApi } from '@ace/cmsApi'
 */


import { BE } from './be'
import { CMSItem } from './types'
import type { SQLiteSelectPrepare } from 'drizzle-orm/sqlite-core'


export async function cmsApi(be: BE<any, any, any>, preparedQuery: SQLiteSelectPrepare<any>, args?: Record<string, string | number>) {
  const result = args ? await preparedQuery.all(args) : await preparedQuery.all()
  return be.json<CMSItem[]>(result)
}
