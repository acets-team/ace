/**
 * 🧚‍♀️ How to access:
 *     - import { cmsApi } from '@ace/cmsApi'
 */


import { CMSItem } from './types'
import type { SQLiteSelectPrepare } from 'drizzle-orm/sqlite-core'


export async function cmsApi(preparedQuery: SQLiteSelectPrepare<any>, args?: Record<string, string | number>) {
  const result = args ? await preparedQuery.all(args) : await preparedQuery.all()
  return result as CMSItem[]
}
