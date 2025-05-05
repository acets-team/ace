import { getFE } from './fe'
import type { APIFunction } from './types'

import * as GET1 from '../api/a'


export const gets = {} as const
export const posts = {} as const


export const apiA: APIFunction<typeof GET1.GET> = async (o) => {
  return getFE().GET('/api/a/:id', o)
}
