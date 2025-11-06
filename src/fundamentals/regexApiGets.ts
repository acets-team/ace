import { RegexMap } from './types'
import { regexApiNames } from './regexApiNames'

export const regexApiGets = {
  '/api/a/:id': regexApiNames['apiGetA'],
} satisfies RegexMap<'api'>
