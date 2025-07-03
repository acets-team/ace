/**
 * 🧚‍♀️ How to access:
 *     - import { BE } from '@ace/be'
 *     - import type { BESource } from '@ace/be'
 */


import { go, Go } from './go'
import { respond } from './respond'
import { AceError } from './aceError'
import { APIEvent } from '@solidjs/start/server'
import type { APIBody, URLSearchParams, URLParams, AceResponse, Routes, RoutePath2Params } from './types'



/** 
 * - Class to help
 *     - Do a redirect w/ autocomplete
 *     - Get current request event, body and/or params
 *     - Respond w/ a consistent shape
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


  /**
   * API Successful Response w/ simple options
   * @param data - Response data that is available @ `res.data`
   * @param status - Optional, HTTP Response Status, Defaults to `200`
   * @returns - An API Response of type `AceResponse<T_Data>`
   */
  success<T_Data>(data: T_Data, status = 200): AceResponse<T_Data> {
    return respond<T_Data>({ data, status })
  }


  /**
   * API Successful Response w/ all options
   * @param options.data - Response data that is available @ `res.data`
   * @param options.status - Optional, HTTP Response Status, Defaults to `200`
   * @param options.headers - Optional, HTTP Response Headers, automatically adds a content type of application json to any passed in headers
   * @returns - An API Response of type `AceResponse<T_Data>`
   */
  Success<T_Data>({ data, status = 200, headers }: { data: T_Data, status?: number, headers?: HeadersInit }): AceResponse<T_Data> {
    return respond<T_Data>({ data, status, headers })
  }


  /**
   * API Error Response w/ simple options
   * @param message - String message describing the error which is available @ `res.error.message`
   * @param status - Optional, HTTP Response Status, Defaults to `400`
   * @returns - An API Response of type `AceResponse<null>`
   */
  error(message: string, status = 400): AceResponse<null> {
    return respond({ error: new AceError({ message }), status })
  }


  /**
   * API Error Response w/ all options
   * @param options.error - `AceError` object
   * @param options.status - Optional, HTTP Response Status, Defaults to `400`
   * @param options.headers - Optional, HTTP Response Headers, automatically adds a content type of application json to any passed in headers
   * @returns - An API Response of type `AceResponse<null>`
   */
  Error({ error, status = 400, headers }: { error: AceError, status?: number, headers?: HeadersInit }): AceResponse<null> {
    return respond({ error, status, headers })
  }


  /**
   * API Redirect Response w/ simple options
   * @param path - String message describing the error which is available @ `res.error.message`
   * @param status - Optional, HTTP Response Status, Defaults to `400`
   * @returns - An API Response of type `AceResponse<null>`
   */
  go<T extends Routes>(path: T, params?: RoutePath2Params<T>): AceResponse<null> {
    return go(path, params)
  }


  /**
   * API Redirect Response w/ all options
   * @param options.path - As specified at `new Route()`, press control+space to get intellisense to current routes
   * @param options.params - Maybe optional, as specified at `new Route()`, press control+space to get intellisense to current routes
   * @param options.status - Optional, HTTP Response Status, Defaults to `301`
   * @param options.headers - Optional, HTTP Response Headers
   * @returns - An API Response of type `AceResponse<null>`
   */
  Go<T extends Routes>({ path, params, status = 301, headers }: { path: T, params?: RoutePath2Params<T>, status?: number, headers?: HeadersInit}): AceResponse<null> {
    return Go({path, params, status, headers})
  }


  /** 
   * - Determine if this be object came from `onAPIEvent()` > `http`
   * - Determine if this be object came from `createAPIFunction()` > `fn`
   */
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
