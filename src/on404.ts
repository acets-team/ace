import { json } from '@solidjs/router'
import { AceError } from './fundamentals/aceError'


export function on404() {
  const notFound = (new AceError({message: 'Not Found', status: 404})).get()
  return json(notFound, {status: 404})
}
