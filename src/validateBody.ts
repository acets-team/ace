import { RequestEvent } from 'solid-js/web'
import type { API } from './fundamentals/api'
import type { Parser, ApiBody } from './fundamentals/types'


export async function validateBody<T_Body extends ApiBody>({api, event, body}: {api: API, event?: RequestEvent, body?: Parser<T_Body>}) {
  if (!api.values.bodyParser) throw new Error('!api.values.bodyParser')

  if (!body && event) {
    const clonedResponse = event.request.clone()
    body = await clonedResponse.json()
  }

  return api.values.bodyParser(body)
}
