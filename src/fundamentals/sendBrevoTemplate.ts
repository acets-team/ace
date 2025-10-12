/**
 * 🧚‍♀️ How to use:
 *   import { sendBrevoTemplate, BREVO_STATUS_MAP } from '@ace/sendBrevoTemplate'
 *   import type { SendBrevoTemplateProps, SendBrevoTemplateResponse, BrevoSuccessResponse, BrevoErrorResponse, BrevoData, BrevoError } from '@ace/sendBrevoTemplate'
 */


import { getEnv } from '../getEnv'


/**
 * ### Create a template in Brevo & then send it, requires: `process.env.BREVO_API_KEY` or props.apiKey
 * @link https://help.brevo.com/hc/en-us/articles/209467485-Create-and-manage-your-API-keys
 * @link https://developers.brevo.com/docs/send-a-transactional-email
 * @link https://developers.brevo.com/docs/how-it-works
 * @link https://www.cloudflare.com/en-gb/ips/
 * @param props.templateId - Template id to send, listed here: https://app.brevo.com/templates/listing
 * @param props.to.email - Must be a contact registered in Brevo and assigned to a contact list. That contact should have the attributes FIRSTNAME, LASTNAME, EMAIL, DELIVERYADDRESS defined.
 * @param props.to.name - The name that will be attached to the email recipient. It will appear in the email headers/metadata and not in the email body.
 * @param props.params - ex: `{"ORDER": 12345, "DATE": "12/06/2019"}`
 * @param props.apiKey - Optional, defaults to process.env.BREVO_API_KEY
 * @returns - A success response is a JSON body giving you the id of the message sent. ex: `{"messageId":"<201906041124.44340027797@smtp-relay.mailin.fr>"}`. An error json will have an error message and error code: https://developers.brevo.com/docs/how-it-works#section-error-codes
 */
export async function sendBrevoTemplate<T_Data extends BrevoData>(props: SendBrevoTemplateProps): Promise<SendBrevoTemplateResponse<T_Data>> {
  const apiKey = getEnv('BREVO_API_KEY', props.apiKey)

  const response = await fetch('https://api.brevo.com/v3/smtp/email', {
    method: 'POST',
    body: JSON.stringify(props),
    headers: { accept: 'application/json', 'content-type': 'application/json', 'api-key': apiKey },
  })

  let parsed: unknown

  try {
    parsed = await response.json()
  } catch {
    parsed = {}
  }

  const { statusId, statusText } = BREVO_STATUS_MAP[response.status] ?? { statusId: 'unknownStatus', statusText: response.statusText || 'Unknown status' }

  return response.ok
    ? { statusCode: response.status, statusId, statusText, isSuccess: true, data: parsed as T_Data }
    : { statusCode: response.status, statusId, statusText, isSuccess: false, error: parsed as BrevoError }
}



export const BREVO_STATUS_MAP: Record<number,{ statusId: string; statusText: string }> = {
  200: { statusId: 'ok', statusText: 'The request was successful' },
  201: { statusId: 'created', statusText: 'The object was successfully created' },
  202: { statusId: 'accepted', statusText: 'The request was accepted and will be processed' },
  204: { statusId: 'noContent', statusText: 'The object was successfully updated or deleted' },
  400: { statusId: 'badRequest', statusText: 'Request is invalid. Check the error code in JSON' },
  401: { statusId: 'unauthorized', statusText: 'You have not been authenticated. Make sure the provided api-key is correct' },
  402: { statusId: 'paymentRequired', statusText: "Make sure your account is activated and that you've sufficient credits" },
  403: { statusId: 'forbidden', statusText: 'You do not have the rights to access the resource' },
  404: { statusId: 'notFound', statusText: 'Make sure you\'re calling an existing endpoint and that parameters are correct' },
  405: { statusId: 'methodNotAllowed', statusText: "The verb you're using is not allowed for this endpoint" },
  406: { statusId: 'notAcceptable', statusText: 'Content-Type must be application/json' },
  429: { statusId: 'tooManyRequests', statusText: 'The expected rate limit is exceeded' },
}



export type SendBrevoTemplateProps = {
  templateId: number,
  to: { email: string, name: string }[]
  params?: Record<string, string | number | boolean>
  apiKey?: string
}

export type SendBrevoTemplateResponse<T extends BrevoData> = BrevoSuccessResponse<T> | BrevoErrorResponse

type BrevoBaseResponse = {
  /** ex: `ok` | `tooManyRequests` */
  statusId: string
  /** ex: `The request was successful` | `The expected rate limit is exceeded` */
  statusText: string
  /** ex: 201 | 429 */
  statusCode: number
}

export type BrevoSuccessResponse<T_Data extends BrevoData> = {
  isSuccess: true
  data: T_Data
} & BrevoBaseResponse


export type BrevoErrorResponse = {
  isSuccess: false
  error: BrevoError
} & BrevoBaseResponse

export type BrevoData = {
  /** ex: `<201906041124.44340027797@smtp-relay.mailin.fr>` */
  messageId: string
}

export type BrevoError = {
  /** ex: `invalid_parameter`, `missing_parameter`  */
  code: string
  /** ex: `Invalid email address` */
  message: string
}
