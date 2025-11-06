import type { RegexMap } from './types'
import { regexApiNames } from './regexApiNames'

export const regexApiPosts = {
  '/api/b': regexApiNames['apiGetA'],
} satisfies RegexMap<'api'>
