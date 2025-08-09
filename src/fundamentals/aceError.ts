/**
 * 🧚‍♀️ How to access:
 *     - import { AceError } from '@ace/aceError'
 *     - import type { AceErrorProps } from '@ace/aceError'
 */


import { config } from 'ace.config'
import { isServer } from 'solid-js/web'
import { GoResponse } from './goResponse'
import type { ApiResponse, FlatMessages } from './types'
import { defaultError, goHeaderName, goStatusCode } from './vars'


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
  static async catch(error: any) {
    if (error instanceof GoResponse) {
      if (!isServer) throw window.location.href = error.url
      else {
        const headers = new Headers(error.headers)

        headers.set(goHeaderName, error.url)

        return new Response(null, { status: goStatusCode, headers })
      }
    } else {
      let res: ApiResponse<null> | undefined

      if (error) {
        if (error instanceof AceError) res = error.get<null>(null)
        else if (typeof error === 'object' && typeof error.error === 'object' && typeof error.error.message === 'string') res = AceError.simple(error.error.message)
        else if (error instanceof Error || (typeof error === 'object' && error.message)) res = AceError.simple(error.message)
        else if (typeof error === 'string') res = AceError.simple(error)      
      }

      if (!res) res = AceError.simple(defaultError)

      if (config.logCaughtErrors) {
        console.error(JSON.stringify(res, null, 2))

        if (error instanceof Error && error.stack) console.error(error.stack)
        else console.trace()
      }

      return new Response(JSON.stringify(res), { status: 400 })
    }
  }


  get<T extends any>(data?: T): ApiResponse {
    const res: ApiResponse = { data }

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


  static simple(message: string, status: number = 400): ApiResponse {
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
