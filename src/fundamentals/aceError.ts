/**
 * 🧚‍♀️ How to access:
 *     - import { AceError } from '@ace/aceError'
 *     - import type { AceErrorProps } from '@ace/aceError'
 */


import { config } from 'ace.config'
import { defaultError } from './vars'
import type { APIResponse, FlatMessages } from './types'


/**
 * - Supports `valibot` messages
 * - Supports errors where we don't wanna parse the json
 * - Helpful when we wanna throw an error from one place get it in another, who knows how it was parsed, but stay simple w/ json and get the error info we'd love to know
 */
export class AceError {
  isAceError = true
  message?: string
  status?: number
  rawBody?: string
  statusText?: string
  messages?: FlatMessages


  constructor({ status = 400, statusText, message, messages, rawBody }: Omit<AceErrorProps, 'isAceError'>) {
    this.status = status
    this.message = message
    this.rawBody = rawBody
    this.messages = messages
    this.statusText = statusText
  }


  /**
   * - Typically called in the catch block of a try / cactch
   * @param options `{ error, data, defaultMessage = '❌ Sorry but an error just happened' }`
   */
  static catch<T>(options?: { error?: any, data?: any, defaultMessage?: string }): APIResponse<T>  {
    let res: APIResponse<T> | undefined

    if (options?.error) {
      if (options.error instanceof AceError) res = options.error.get<T>(options.data)
      else if (typeof options.error === 'object' && typeof options.error.error === 'object' && typeof options.error.error.message === 'string') res = AceError.simple(options.error.error.message)
      else if (options.error instanceof Error || (typeof options.error === 'object' && options.error.message)) res = AceError.simple(options.error.message)
      else if (typeof options.error === 'string') res = AceError.simple(options.error)      
    }

    if (!res) res = AceError.simple(defaultError)

    if (config.logCaughtErrors) {
      console.error(JSON.stringify(res, null, 2))
      console.trace()
    }

    return res
  }


  get<T extends any>(data?: T): APIResponse {
    const res: APIResponse = { data }

    if (this.status || this.statusText || this.message || this.messages || this.rawBody) {
      res.error = { isAceError: true }

      if (this.status) res.error.status = this.status
      if (this.statusText) res.error.statusText = this.statusText
      if (this.message) res.error.message = this.message
      if (this.messages) res.error.messages = this.messages
      if (this.rawBody) res.error.rawBody = this.rawBody
    }

    return res
  }


  static simple(message: string, status: number = 400): APIResponse {
    return { error: { isAceError: true, status, message } }
  }



  /**
   * Merge any number of AceError instances into a single AceError
   *
   * - Field‐level `messages` (FlatMessages) are shallow‐merged
   * - `message` strings are concatenated with "; "
   * - `status` takes the *first* defined status
   * - `statusText`, `rawBody` take the first defined value
   *
   * @param errors One or more AceError instances to merge, sending an error that is not an AceError is fine we'll just skip it
   * @returns A new AceError containing the combined information
   * @example
    ```ts
    if (error1 || error2 || error3) {
      throw AceError.merge(error1, error2, error3)
    }
    ```
   */
  static merge(...errors: Array<AceError | undefined>): AceError {
    const combinedMessage: string[] = []
    const mergedMessages: FlatMessages = {}

    let firstStatus: number | undefined
    let firstRawBody: string | undefined
    let firstStatusText: string | undefined

    for (const e of errors) {
      if (!(e instanceof AceError)) continue

      if (e.message) combinedMessage.push(e.message) // build combinedMessage
      if (firstStatus === undefined && typeof e.status === 'number') firstStatus = e.status // set firstStatus
      if (!firstStatusText && e.statusText) firstStatusText = e.statusText // set firstStatusText
      if (!firstRawBody && e.rawBody) firstRawBody = e.rawBody // set firstRawBody

      if (e.messages) { // build mergedMessages
        for (const [field, msgs] of Object.entries(e.messages)) {
          mergedMessages[field] = [
            ...(mergedMessages[field] ?? []),
            ...msgs,
          ]
        }
      }
    }

    return new AceError({
      status: firstStatus ?? 400,
      statusText: firstStatusText,
      rawBody: firstRawBody,
      message: combinedMessage.length ? combinedMessage.join('; ') : undefined,
      messages: Object.keys(mergedMessages).length ? mergedMessages : undefined,
    })
  }
}


export type AceErrorProps = {
  isAceError: true,
  status?: number,
  statusText?: string,
  message?: string,
  messages?: FlatMessages,
  rawBody?: string
}
