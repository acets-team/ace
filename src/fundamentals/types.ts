/**
 * 🧚‍♀️ How to access:
 *     - import type { APIResponse, InferPOSTBody, B4 ... } from '@ace/types'
 */


import type { FE } from './fe'
import type { API } from './api'
import type { JSX } from 'solid-js'
import type { Route } from './route'
import type { routes } from './createApp'
import type * as apisFE from '../apis.fe'
import type * as apisBE from '../apis.be'
import type { JWTPayload } from 'ace.config'
import type { AceErrorProps } from './aceError'
import type { JwtValidateResponse } from './jwtValidate'
import type { AccessorWithLatest } from '@solidjs/router'
import type { APIEvent as SolidAPIEvent, FetchEvent as SolidFetchEvent } from '@solidjs/start/server'


/** All api GET paths */
export type GET_Paths = keyof typeof apisBE.gets


/** All api POST paths */
export type POST_Paths = keyof typeof apisBE.posts


/** All application routes */
export type Routes = keyof typeof routes


/**
 * When we create a Response object the type for data is lost
 * But when we create an AceResponse we can store / infer the type for the data!
 * This is the return type for `be.respond()` which is the return type for an API
 */
export interface AceResponse<T_Data> extends Response {
  __dataType?: T_Data
}


/** 
 * - Receives: AceResponse
 * - Gives: The object type for the stringified json 
*/
export type InferAceResponse<T> = T extends AceResponse<infer U>
  ? APIResponse<U>
  : T


/**
 * - API response that `callAPIResolve()` gets
 */
export type RawAPIResponse<T_Data = any> = {
  go: string | null
  data: T_Data | null
  error: AceErrorProps | null
}


/**
 * API response that FE gets
 */
export type APIResponse<T_Data = any> = {
  data?: T_Data
  error?: AceErrorProps
}


/** 
 * - Receives: API
 * - Gives: RawAPIResponse
*/
export type API2RawResponse<T_API extends API<any, any, any, any>> = RawAPIResponse<API2Data<T_API>>


/** 
 * - Receives: API
 * - Gives: APIResponse
*/
export type API2APIResponse<T_API extends API<any, any, any, any>> = APIResponse<API2Data<T_API>>


/** 
 * - Receives: API
 * - Gives: Response data type
*/
export type API2Data<T_API extends API<any, any, any, any>> = T_API extends API<any, any, any, infer T_Response>
  ? T_Response extends APIResponse<infer T_Data>
    ? T_Data
    : never
  : never


/** 
 * - Receives: API
 * - Gives: Type for the FE Function that calls this API
*/
export type API2FEFunction<T_API extends API<any, any, any, any>> = IsPopulated<BaseAPIFnOptions<T_API>> extends true
  ? (options: APIFnOptions<T_API>) => Promise<API2APIResponse<T_API>>
  : (options?: APIFnOptions<T_API>) => Promise<API2APIResponse<T_API>>


/** If testing item is an object and has keys returns true, else return false */
export type IsPopulated<T> = T extends object ? [keyof T] extends [never] ? false : true : false


/** Building an options object whose properties are only present if they have keys */
export type BaseAPIFnOptions<T_API extends API<any,any,any,any>> =
  KeepIfPopulated<'params', API2Params<T_API>> &
  KeepIfPopulated<'body', API2Body<T_API>> &
  KeepIfPopulated<'search', API2Search<T_API>>


/**
 * - If value is a populated object => return { key: value }
 * - Else => return {}
 * - Then we' APIFnOptions we unite the objects w/ & and get one object with only the populated items; unpopulated ones are simply omitted
 */
export type KeepIfPopulated<T_Prop extends string, T_Value> = IsPopulated<T_Value> extends true
  ? { [T_Key in T_Prop]: T_Value }
  : {}


/** BitKey is optional */
export type APIFnOptions<T_API extends API<any,any,any,any>> = BaseAPIFnOptions<T_API> & { bitKey?: string }


/** 
 * - Receives: API GET path
 * - Gives: Response data type
*/
export type GETPath2Data<Path extends GET_Paths> = API2APIResponse<(typeof apisBE.gets)[Path]>


/** 
 * - Receives: API POST path
 * - Gives: Response data type
*/
export type POSTPath2Data<T_Path extends POST_Paths> = API2APIResponse<typeof apisBE.posts[T_Path]>


/** If object has keys return object, else return undefined */
export type GetPopulated<T> = IsPopulated<T> extends true ? T : undefined


/** 
 * - Receives: API
 * - Gives: Request params type
*/
export type API2Params<T_API extends API<any, any, any, any>> = T_API extends API<infer T_Params, any, any, any>
  ? GetPopulated<T_Params>
  : undefined  


/** 
 * - Receives: API
 * - Gives: Request body type
*/
export type API2Body<T_API extends API<any, any, any, any>> = T_API extends API<any, any, infer T_Body, any>
  ? GetPopulated<T_Body>
  : undefined  


/** 
 * - Receives: API
 * - Gives: Request search params type
*/
export type API2Search<T_API extends API<any, any, any, any>> = T_API extends API<any, infer T_Search, any, any>
  ? GetPopulated<T_Search>
  : undefined  


/** 
 * - Receives: Route
 * - Gives: Route params type
*/
export type Route2Params<T_Route extends Route<any, any>> = T_Route extends Route<infer T_Params, any>
  ? GetPopulated<T_Params>
  : undefined


/** 
 * - Receives: API GET path
 * - Gives: The type for that api's params
*/
export type GETPath2Params<T_Path extends GET_Paths> = API2Params<typeof apisBE.gets[T_Path]>


/** 
 * - Receives: API POST path
 * - Gives: The type for that api's params
*/
export type POSTPath2Params<T_Path extends POST_Paths> = API2Params<typeof apisBE.posts[T_Path]>


/** 
 * - Receives: Route path
 * - Gives: The type for that route's params
*/
export type RoutePath2Params<T_Path extends keyof typeof routes> = Route2Params<(typeof routes)[T_Path]>


/** 
 * - Receives: API GET path
 * - Gives: The type for that api's search params
*/
export type GETPath2Search<T_Path extends GET_Paths> = API2Search<typeof apisBE.gets[T_Path]>


/** 
 * - Receives: API POST path
 * - Gives: The type for that api's body
*/
export type POSTPath2Body<T_Path extends POST_Paths> = API2Body<typeof apisBE.posts[T_Path]>


/** 
 * - Receives: API POST path
 * - Gives: The type for that api's search params
*/
export type POSTPath2Search<T_Path extends POST_Paths> = API2Search <typeof apisBE.posts[T_Path]>


/**
 * - Example: `const exampleLoad = load(() => apiExample(), 'example')`
 * - Receives: API Function Name, so => `apiExample`
 * - Gives: The type for the `load()` response, so the type for => `exampleLoad`
 */
export type InferLoadFn<T_Function_Name extends ApiFunctionKeys> = AccessorWithLatest<undefined | Awaited<ReturnType<(typeof apisFE)[T_Function_Name]>>>


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
export type ApiFunctionKeys = {
  [T_Fn_Name in keyof typeof apisFE]: typeof apisFE[T_Fn_Name] extends (...args: any[]) => any
    ? T_Fn_Name
    : never
}[keyof typeof apisFE]
 

/** The component to render for a route */
export type RouteComponent<T_Params extends URLParams, T_Search extends URLSearchParams> = (fe: FE<T_Params, T_Search>) => JSX.Element


/** The component to render for a layout */
export type LayoutComponent = (fe: FE) => JSX.Element


/** This is how `Valibot` flattens their errors */
export type FlatMessages = Record<string, string[]>


export type APIBody = Record<any, any>
export type URLSearchParams = Record<string, string | string[]>
export type URLParams = Record<string, any>


export type JSONPrimitive = string | number | boolean | null
export type JSONValue = JSONPrimitive | JSONObject | JSONValue[]
export type JSONObject = { [key: string]: JSONValue }
export type JSONable = JSONValue


/** 
 * - Source: `import type { APIEvent } from '@solidjs/start/server'`
 * - Called @ `onAPIEvent()`
 */
export type APIEvent = SolidAPIEvent


/** 
 * - Source: `import type { FetchEvent } from '@solidjs/start/server'`
 * - Called @ `onMiddlewareRequest()`
 */
export type FetchEvent = SolidFetchEvent


/**
 * - JWTPayload is defined @ ace.config.js
 * - The FullJWTPayload adds `{iat: number, exp: number}` to the payload to align w/ the `JWT spec (RFC 7519)`
 * - The `JWTPayload` is what is stored in the jwt and the `JWTResponse` is created if the `JWTPayload` is valid
 * - We recomend only putting a sessionId in the `JWTPayload`, and also putting the sessionId in the database, so you can always sign someone out by removing the db entry and then putting any goodies ya love in the `JWTResponse` like email, name, isAdmin, etc.
 */
export type FullJWTPayload = JWTPayload & {iat: number, exp: number}


/** 
 * - Anonymous async function (aaf) that runs b4 api and/or route fn
 * - If the aaf's response is truthy, that response is given to client & the  api and/or route fn is not called, else the fn is called
 */
export type B4 = (jwtResponse: JwtValidateResponse) => Promise<any>


export type CMSItem = {
  /** DB id */
  id: number
  /** Describes what this CMS item is for */
  label: string
  /** Markdown content */
  content: string
  /** The page this content is on, its sql id */
  pageId: number
  /** The page this content is on, its name */
  pageName: string
  /** Boolean, does the content include markdown? */
  isMarkdown: number
}


export type CMSMap = Map<number, CMSItem>
