import { getFE } from './fundamentals/fe'
import type { APIFunction } from './fundamentals/types'

import * as GET1 from './api/a'


export const gets = {} as const
export const posts = {} as const


export const apiA: APIFunction<typeof GET1.GET> = async (o) => {
  return getFE().GET('/api/a/:id', o)
}
