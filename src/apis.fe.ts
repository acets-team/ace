import { fe } from './fundamentals/fe'
import type { API2FEFunction } from './fundamentals/types'

import * as GET1 from './api/a'


export const gets = {} as const
export const posts = {} as const


export const apiA: API2FEFunction<typeof GET1.GET> = async (o) => {
  return fe.GET('/api/a/:id', o)
}
