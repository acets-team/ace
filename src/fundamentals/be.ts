/**
 * 🧚‍♀️ How to access:
 *     - import { BE } from '@ace/be'
 *     - import type { BESource } from '@ace/be'
 */


import { go as _go } from './go'
import { BEMessages } from '../beMessages'
import { APIEvent } from '@solidjs/start/server'
import type { JSONResponse, Routes, InferParamsRoute, GoResponse, APIBody, URLSearchParams, URLParams } from './types'



/** 
 * - Class to help
 *     - Do a redirect w/ autocomplete
 *     - Get current request event, body and/or params
 *     - Respond w/ a consistent shape
 *     - Access BEMessages which we can push to & sync w/ fe signals
 */
export class BE<T_Params extends URLParams = {}, T_Search extends URLSearchParams = {}, T_Body extends APIBody = {}> {
  #source: BESource
  #event: APIEvent | null
  messages: BEMessages
  #params: T_Params
  #search: T_Search
  #body?: T_Body


  private constructor(source: BESource, event: APIEvent | null, params: T_Params, search: T_Search, body?: T_Body) {
    this.#source = source
    this.#event = event
    this.#params = params
    this.#search = search
    this.#body = body
    this.messages = new BEMessages()
  }


  static CreateFromHttp<T_Params extends URLParams = {}, T_Search extends URLSearchParams = {}>(event: APIEvent, params: T_Params, search: T_Search) {
    return new BE('http', event, params, search, {})
  }


  static CreateFromFn<T_Params extends URLParams = {}, T_Search extends URLSearchParams = {}, T_Body extends APIBody = {}>(params: T_Params, search: T_Search, body?: T_Body) {
    return new BE('http', null, params, search, body)
  }


  /**
   * - Wraps "@solidjs/router" `redirect()`
   * - Provides intellisense to current routes
   * - same as `go()` that is typically used @ `b4()`
   */
  go: <T extends Routes>(path: T, params?: InferParamsRoute<T>) => GoResponse = _go


  /**
   * - Typically called when you'd love to respond from the api w/ json
   * - Will also add any messages to an errors object if you called be.message.push() during this call
   * - If you'd rather respond w/ an error and no data `throw new Error()`
   * @param data - The data to respond w/
   * @returns An object that has `{ data }` and also too some errors or messages
   */
  json<T>(data: T): JSONResponse<T> {
    let res: JSONResponse<T> = { data: null, error: null }

    if (data) res.data = data

    if (this.messages.has()) {
      res.error = {
        isAceError: true,
        messages: this.messages.get()
      }
    }

    return res
  }


  getSource(): BESource {
    return this.#source
  }


  /** @returns event */
  getEvent() {
    return this.#event
  }


  /** @returns Current request body via `await event.request.json()`  */
  async getBody(): Promise<T_Body> {
    if (this.#event) return await this.#event.request.json() as T_Body
    else if (this.#source === 'fn' && this.#body) return this.#body
    else throw new Error('Please ensure that when calling getBody() your source is fn and you passed a body to BE.CreateFromFn()')
  }


  /** @returns The url params object  */
  getParams(): T_Params {
    return this.#params 
  }


  /** @returns The url search params object  */
  getSearch(): T_Search {
    return this.#search 
  }
}


export type BESource = 'fn' | 'http'