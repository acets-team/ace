/**
 * 🧚‍♀️ How to access:
 *     - import type { APIResponse, InferPOSTBody, B4 ... } from '@ace/types'
 */


import type { FE } from './fe'
import type { API } from './api'
import type { JSX } from 'solid-js'
import type { routes } from './app'
import type { Route } from './route'
import type * as apisFE from './apis.fe'
import type * as apisBE from './apis.be'
import type { AccessorWithLatest, redirect } from '@solidjs/router'
import type { APIEvent as SolidAPIEvent, FetchEvent as SolidFetchEvent } from '@solidjs/start/server'


/** All api GET paths */
export type GET_Paths = keyof typeof apisBE.gets


/** All api POST paths */
export type POST_Paths = keyof typeof apisBE.posts


/** All application routes */
export type Routes = keyof typeof routes


/** 
 * - How a response from a `new API()` is
 * - A redirect or a json
 * - & the json can handle data, errors, and/or `Valibot` / `Zod` messages
 */
export type APIResponse<T_Data = any> = GoResponse | JSONResponse<T_Data>


/** Backend redirect */
export type GoResponse = ReturnType<typeof redirect>


/**
 * - If an API does not respond / a redirect it responds w/ this JSON
 * - `Valibot` / `Zod` errors @ `res.error.messages`
 */
export type JSONResponse<T_Data = any> = {
  data: null | T_Data,
  error: null | AceErrorType
}


/**
 * - Supports `Valibot` / `Zod` messages
 * - Supports errors where we don't wanna parse the json
 * - Helpful when we wanna throw an error from one place get it in another, who knows how it was parsed, but stay simple w/ json and get the error info we'd love to know
 */
export type AceErrorType = {
  isAceError: true
  message?: string
  status?: number
  rawBody?: string
  statusText?: string
  messages?: FlatMessages
}


/**
 * - The component to render for a route
 */
export type RouteComponent<T_Params extends URLParams, T_Search extends URLSearchParams> = (fe: FE<T_Params, T_Search>) => JSX.Element


/**
 * - The component to render for a layout
 */
export type LayoutComponent = (fe: FE) => JSX.Element


/** 
 * - This is how `Valibot` / `Zod` flatten their errors
 */
export type FlatMessages = Record<string, string[]>


export type APIBody = Record<any, any>
export type URLSearchParams = Record<string, string | string[]>
export type URLParams = Record<string, any>


/** 
 * - Source: `import type { APIEvent } from '@solidjs/start/server'`
 * - Called @ `GET` / `POST` api endpoints
 */
export type APIEvent = SolidAPIEvent


/** 
 * - Source: `import type { FetchEvent } from '@solidjs/start/server'`
 * - Called @ middleware
 */
export type FetchEvent = SolidFetchEvent


/** 
 * - Anonymous async function (aaf) that runs b4 api and/or route fn
 * - If the aaf's response is truthy, that response is given to client & the  api and/or route fn is not called, else the fn is called
 */
export type B4 = (ctx: B4Context) => Promise<any>



/**
 *  - `sessionData` is always defined
 *  - IF request came in via `onMiddlewareRequest()` aka `fe.GET() or fe.POST()` => `event` is a `FetchEvent`
 *  - IF request came in via `APIFunction` => `event` is undefined
 */
export type B4Context<T_SessionData = any> = {
  event?: FetchEvent,
  sessionData: T_SessionData,
}


/**
 * - `keyof typeof apisFE`: All the modules at apis.fe.ts, ex: 'apiFoo' | 'apiBar' | 'gets' | 'posts'
 * - `typeof apisFE[T_Fn_Name] extends (...args: any[]) => any`: Is the module being exported at this module key a function?
 * - If it is return the module name aka the function name, this gives us
    ```json
    {
      "apiFoo": "apiFoo",
      "apiBar": "apiBar"
    }
    ```
 * - `{ ... }[keyof typeof apisFE]`: Take the object we just built, and index it by all its keys: `"apiFoo" | "apiBar"`
 */
type ApiFunctionKeys = {
  [T_Fn_Name in keyof typeof apisFE]: typeof apisFE[T_Fn_Name] extends (...args: any[]) => any
    ? T_Fn_Name
    : never
}[keyof typeof apisFE]


/**
 * - `function name` to an `API` => type for `beParse()` response
 * - Helpful when you've done `const lorem = beParse(() => _lorem())` and want the type for lorem
 */
export type InferParseFn<T_Function_Name extends ApiFunctionKeys> = AccessorWithLatest<undefined | Awaited<ReturnType<(typeof apisFE)[T_Function_Name]>>>


/**
 * - `path` to an api `GET` => type for `beParse()` response
 * - Helpful when you've done `const lorem = beParse(() => _lorem())` and want the type for lorem
 */
export type InferParseGET<T_GET_Path extends GET_Paths> = AccessorWithLatest<undefined | InferResponseGET<T_GET_Path>>


/** 
 * - Receives: API GET path
 * - Gives: The type for that api's response, aka the response to the `fn()` on that API
*/
export type InferResponseGET<T_Path extends GET_Paths> = typeof apisBE.gets extends Record<any, any>
  ? T_Path extends keyof typeof apisBE.gets
    ? API2FnResponse<typeof apisBE.gets[T_Path]> // infer / return fn response type if set or undefined if unset
    : never
  : never


type API2FnResponse<T_API extends API<any, any, any, any>> = T_API extends API<any, any, any, infer T_Fn_Response>
    ? T_Fn_Response
    : never


/** 
 * - Receives: Route path
 * - Gives: The type for that route's params
*/
export type InferParamsRoute<T_Path extends keyof typeof routes> = typeof routes extends Record<any, any> // IF app has any routes
  ? T_Path extends keyof typeof routes // IF path is a valid path to a route
    ? Route2Params <typeof routes[T_Path]> // infer / return params if set or undefined if unset
    : undefined
  : undefined


/** 
 * - Receives: API GET path
 * - Gives: The type for that api's params
*/
export type InferParamsGET<T_Path extends keyof typeof apisBE.gets> = typeof apisBE.gets extends Record<any, any> // IF app has any GET endpoints
  ? T_Path extends keyof typeof apisBE.gets // IF path is a valid path to an api GET
    ? API2Params<typeof apisBE.gets[T_Path]> // infer / return params if set or undefined if unset
    : undefined
  : undefined


  /** 
   * - Receives: API GET path
   * - Gives: The type for that api's params
  */
  export type InferSearchGET<T_Path extends keyof typeof apisBE.gets> = typeof apisBE.gets extends Record<any, any> // IF app has any GET endpoints
    ? T_Path extends keyof typeof apisBE.gets // IF path is a valid path to an api GET
      ? API2Search<typeof apisBE.gets[T_Path]> // infer / return search params if set or undefined if unset
      : undefined
    : undefined


/** 
 * - Receives: API POST path
 * - Gives: The type for that api's params
*/
export type InferParamsPOST<T_Path extends POST_Paths> = typeof apisBE.posts extends Record<any, any>
  ? T_Path extends keyof typeof apisBE.posts
    ? API2Params <typeof apisBE.posts[T_Path]> // infer / return params type if set or undefined if unset
    : undefined
  : undefined


/** 
 * - Receives: API POST path
 * - Gives: The type for that api's body
*/
export type InferBodyPOST<T_Path extends POST_Paths> = typeof apisBE.posts extends Record<any, any>
  ? T_Path extends keyof typeof apisBE.posts
    ? API2Body<typeof apisBE.posts[T_Path]> // infer / return body type if set or undefined if unset
    : undefined
  : undefined


/** 
 * - Receives: API POST path
 * - Gives: The type for that api's params
*/
export type InferSearchPOST<T_Path extends POST_Paths> = typeof apisBE.posts extends Record<any, any>
  ? T_Path extends keyof typeof apisBE.posts
    ? API2Search <typeof apisBE.posts[T_Path]> // infer / return search params type if set or undefined if unset
    : undefined
  : undefined


/** 
 * - Receives: API GET path
 * - Gives: The type for that api's response, aka the response to the `fn()` on that API
*/
export type InferResponsePOST<T_Path extends POST_Paths> = typeof apisBE.posts extends Record<any, any>
  ? T_Path extends keyof typeof apisBE.posts
    ? API2FnResponse<typeof apisBE.posts[T_Path]> // infer / return fn response type if set or undefined if unset
    : never
  : never


type Route2Params<T_Route extends Route> = T_Route extends Route<infer T_Params, any>
  ? GetPopulated<T_Params>
  : undefined  


type API2Body<T_API extends API<any, any, any, any>> = T_API extends API<any, any, infer T_Body, any>
  ? GetPopulated<T_Body>
  : undefined  


type API2Params<T_API extends API<any, any, any, any>> = T_API extends API<infer T_Params, any, any, any>
  ? GetPopulated<T_Params>
  : undefined  


type API2Search<T_API extends API<any, any, any, any>> = T_API extends API<any, infer T_Search, any, any>
  ? GetPopulated<T_Search>
  : undefined  


type API2Response<T_API extends API<any, any, any, any>> = T_API extends API<any, any, any, infer T_Response>
  ? GetPopulated<T_Response>
  : undefined  


/** If testing item is an object and has keys returns true, else return false */
export type IsPopulated<T> = T extends object ? [keyof T] extends [never] ? false : true : false


/** If object has keys return object, else return undefined */
type GetPopulated<T> = IsPopulated<T> extends true ? T : undefined


/**
 * - If value is a populated object => return { key: value }
 * - Else => return {}
 * - Then we' APIFnOptions we unite the objects w/ & and get one object with only the populated items; unpopulated ones are simply omitted
 */
type KeepIfPopulated<T_Prop extends string, T_Value> = IsPopulated<T_Value> extends true
  ? { [T_Key in T_Prop]: T_Value }
  : {}


/** Build an options object whose properties are only present if they have keys */
export type APIFnOptions<T_API extends API<any, any, any, any>> =
  KeepIfPopulated<'params', API2Params<T_API>> &
  KeepIfPopulated<'body', API2Body<T_API>> &
  KeepIfPopulated<'search', API2Search<T_API>>


/** What `createAPIFunction()` creates */
// export type APIFunction<T_API extends API<any, any, any, any>> = (options: APIFnOptions<T_API>) => Promise<API2Response<T_API>>

export type APIFunction<T_API extends API<any, any, any, any>> =
  IsPopulated<APIFnOptions<T_API>> extends true
    ? (options: APIFnOptions<T_API>) => Promise<API2Response<T_API>>
    : (options?: APIFnOptions<T_API>) => Promise<API2Response<T_API>>
