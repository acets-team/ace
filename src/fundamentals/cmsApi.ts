/**
 * 🧚‍♀️ How to access:
 *     - import { cmsApi } from '@ace/cmsApi'
 *     - import type { CMSApiStatement, CMSApiArgs } from '@ace/cmsApi'
 */


import { BE } from './be'
import { tursoConnect } from './tursoConnect'


export async function cmsApi(be: BE<any, any, any>, statement: CMSApiStatement) {
  if (statement.args !== undefined && (!Array.isArray(statement.args) && (typeof statement.args !== 'object' || statement.args === null))) throw new Error('`args` must be either an array of numbers (for positional args) or an object (for named args)')

  const resultSet = await tursoConnect().execute(statement)

  return be.json(resultSet.rows)
}


export type CMSApiStatement = {
  sql: string
  args?: CMSApiArgs
}


export type CMSApiArgs = number[] | Record<string, string | number>
