import { createAPIFunction } from './createAPIFunction' 

import * as GET1 from './api/a'
import * as POST1 from './api/b'


export const gets = {
  '/api/a/:id': GET1.GET,
}

export const posts = {
  '/api/b': POST1.POST,
}

export const apiA = createAPIFunction(GET1.GET)
