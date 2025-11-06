import { RegexMap } from './types'
import { regexApiNames } from './regexApiNames'

export const regexApiPuts = {
  '/api/a/:id': regexApiNames['apiGetA'],
} satisfies RegexMap<'api'>
