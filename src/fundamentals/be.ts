/**
 * 🧚‍♀️ How to access:
 *     - import { BE } from '@ace/be'
 */


import { go, Go } from './go'
import { respond } from './respond'
import { AceError } from './aceError'
import type { RequestEvent } from 'solid-js/web'
import type { APIEvent } from '@solidjs/start/server'
import type { APIBody, URLSearchParams, URLPathParams, AceResponse, Routes, RoutePath2PathParams, RoutePath2SearchParams } from './types'



/** 
 * - Class to help
 *     - Do a redirect w/ autocomplete
 *     - Get current request event, body and/or params
 *     - Respond w/ a consistent shape
 */
export class BE<T_Params extends URLPathParams = {}, T_Search extends URLSearchParams = {}, T_Body extends APIBody = {}> {
  #body?: T_Body
  readonly event: RequestEvent
  readonly pathParams: T_Params
  readonly searchParams: T_Search


  private constructor(event: RequestEvent, params: T_Params, search: T_Search, body?: T_Body) {
    this.#body = body
    this.event = event
    this.pathParams = params
    this.searchParams = search
  }


  static CreateFromHttp<T_Params extends URLPathParams = {}, T_Search extends URLSearchParams = {}>(event: APIEvent, params: T_Params, search: T_Search) {
    return new BE(event, params, search)
  }


  static CreateFromFn<T_Params extends URLPathParams = {}, T_Search extends URLSearchParams = {}, T_Body extends APIBody = {}>(event: RequestEvent, params: T_Params, search: T_Search, body?: T_Body) {
    return new BE(event, params, search, body)
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
  go<T_Path extends Routes>(path: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }): AceResponse<null> {
    return go(path, {pathParams: params?.pathParams, searchParams: params?.searchParams})
  }


  /**
   * API Redirect Response w/ all options
   * @param options.path - As specified at `new Route()`, press control+space to get intellisense to current routes
   * @param options.params - Maybe optional, as specified at `new Route()`, press control+space to get intellisense to current routes
   * @param options.status - Optional, HTTP Response Status, Defaults to `301`
   * @param options.headers - Optional, HTTP Response Headers
   * @returns - An API Response of type `AceResponse<null>`
   */
  Go<T_Path extends Routes>({ path, pathParams, searchParams, status = 301, headers }: { path: T_Path, pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path>, status?: number, headers?: HeadersInit}): AceResponse<null> {
    return Go({path, pathParams, searchParams, status, headers})
  }


  /** @returns Current request body via `await event.request.json()`  */
  async getBody(): Promise<T_Body> {
    if (this.#body) return this.#body as T_Body
    else if (!this.event) throw new Error('!this.event')
    else {
      this.#body = await this.event.request.json() as T_Body
      return this.#body
    }
  }
}
