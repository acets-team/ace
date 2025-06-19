/**
 * 🧚‍♀️ How to access:
 *     - import { BE } from '@ace/be'
 *     - import type { BESource } from '@ace/be'
 */


import { go, Go } from './go'
import { respond } from './respond'
import { AceError } from './aceError'
import { APIEvent } from '@solidjs/start/server'
import type { APIBody, URLSearchParams, URLParams, AceResponse, Routes, RoutePath2Params, JSONable } from './types'



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
  #params: T_Params
  #search: T_Search
  #body?: T_Body


  private constructor(source: BESource, event: APIEvent | null, params: T_Params, search: T_Search, body?: T_Body) {
    this.#source = source
    this.#event = event
    this.#params = params
    this.#search = search
    this.#body = body
  }


  static CreateFromHttp<T_Params extends URLParams = {}, T_Search extends URLSearchParams = {}>(event: APIEvent, params: T_Params, search: T_Search) {
    return new BE('http', event, params, search, {})
  }


  static CreateFromFn<T_Params extends URLParams = {}, T_Search extends URLSearchParams = {}, T_Body extends APIBody = {}>(params: T_Params, search: T_Search, body?: T_Body) {
    return new BE('fn', null, params, search, body)
  }

  success<T_Data>(data?: T_Data): AceResponse<T_Data> {
    return respond<T_Data>({ data, status: 200 })
  }


  Success<T_Data>({ data, status = 200, headers }: { data?: T_Data, status?: number, headers?: HeadersInit }): AceResponse<T_Data> {
    return respond<T_Data>({ data, status, headers })
  }


  go<T extends Routes>(path: T, params?: RoutePath2Params<T>): AceResponse<null> {
    return go(path, params)
  }


  Go<T extends Routes>({ path, params, status = 301, headers }: { path: T, params?: RoutePath2Params<T>, status?: number, headers?: HeadersInit}): AceResponse<null> {
    return Go({path, params, status, headers})
  }


  error(message: string, status = 400) {
    return respond({ error: new AceError({ message }), status })
  }


  Error({ error, status = 400, headers }: { error: AceError, status?: number, headers?: HeadersInit }): AceResponse<null> {
    return respond({ error, status, headers })
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
