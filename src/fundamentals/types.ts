/**
 * 🧚‍♀️ How to access:
 *     - import type { APINames, ... } from '@ace/types'
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


/** { [api function name]: new Api() } */
export type APINames = keyof typeof apisBE.apiNames


/** { [api GET path]: new Api() } */
export type GETPaths = keyof typeof apisBE.gets


/** { [api POST path]: new Api() } */
export type POSTPaths = keyof typeof apisBE.posts


/** { [route path]: new Route() } */
export type Routes = keyof typeof routes


/** 
 * - Receives: API Function Name
 * - Gives: API Response
*/
export type APIName2Response<T extends APINames> = typeof apisBE.apiNames[T] extends API<any, any, any, infer T_Response>
  ? T_Response
  : never


/** 
 * - Receives: API Function Name
 * - Gives: API Response Data
*/
export type APIName2ResponseData<T_Name extends APINames> = APIName2Response<T_Name> extends PrunedAPIResponse<infer T_Response>
  ? T_Response
  : never


/** 
 * - Receives: API Function Name
 * - Gives: API Request Props
*/
export type APIName2Props<Name extends APINames> =
  typeof apisBE.apiNames[Name] extends API<infer P, infer S, infer B, infer R>
    ? BaseAPIFnOptions<API<P, S, B, R>> & { bitKey?: string }
    : never;


/**
 * - When we create a Response object the type for the stringified json is lost b/c the Response object does not accept generics
 * - When we create an AceResponse we can store / infer the type for the stringified json in @ `__resType`!
 * - This is the return type for `respond()` aka this is the return type for a `new API()` > `.resolve()`
 */
export interface AceResponse<T_Data> extends Response {
  __dataType?: T_Data
}


/** 
 * - Receives: AceResponse
 * - Gives: PrunedAPIResponse
*/
export type AceResponse2PrunedResponse<T_AceResponse> = T_AceResponse extends AceResponse<infer T_Data>
  ? PrunedAPIResponse<T_Data>
  : never;


/**
 * - Required API response from `new API()` > `.resolve()`
 * - What is actually returned to the frontend is a pruned version (`PrunedAPIResponse`), where the falsy props are removed
 */
export type FullAPIResponse<T_Data = any> = {
  go: string | null
  data: T_Data | null
  error: AceErrorProps | null
}


/**
 * - What is actually returned from `new API()` > `.resolve()` is `FullAPIResponse`
 * - What is actually returned to the frontend is this pruned version: `PrunedAPIResponse`, where falsy props are removed
*/
export type PrunedAPIResponse<T_Data = any> = {
  data?: T_Data
  error?: AceErrorProps
}


/** 
 * - Receives: API
 * - Gives: FullAPIResponse
*/
export type API2FullAPIResponse<T_API extends API<any, any, any, any>> = FullAPIResponse<API2Data<T_API>>


/** 
 * - Receives: API
 * - Gives: PrunedAPIResponse
*/
export type API2PrunedAPIResponse<T_API extends API<any, any, any, any>> = PrunedAPIResponse<API2Data<T_API>>


/** 
 * - Receives: API
 * - Gives: Response data type
*/
export type API2Data<T_API extends API<any, any, any, any>> = T_API extends API<any, any, any, infer T_Response>
  ? T_Response extends PrunedAPIResponse<infer T_Data>
    ? T_Data
    : never
  : never


/** 
 * - Receives: API
 * - Gives: Type for the FE Function that calls this API
*/
export type API2FEFunction<T_API extends API<any, any, any, any>> = IsPopulated<BaseAPIFnOptions<T_API>> extends true
  ? (options: APIFnProps<T_API>) => Promise<API2PrunedAPIResponse<T_API>>
  : (options?: APIFnProps<T_API>) => Promise<API2PrunedAPIResponse<T_API>>


export type RequiredKeys<T> = {
  [K in keyof T]-?: {} extends Pick<T, K> ? never : K
}[keyof T];


/** If testing item is an object and has keys returns true, else return false */
export type IsPopulated<T> = T extends object ? [keyof T] extends [never] ? false : true : false


/** Building an options object whose properties are only present if they have keys */
export type BaseAPIFnOptions<T_API extends API<any,any,any,any>> =
  OptionalIfDefined<'params', API2Params<T_API>> &
  OptionalIfDefined<'body', API2Body<T_API>> &
  OptionalIfDefined<'search', API2Search<T_API>>


export type OptionalIfDefined<Prop extends string, Value> =
  [Value] extends [undefined]
    ? {}
    : { [K in Prop]?: Value }


/** 
 * - The props (arguments) that are sent to an api function
 * - BitKey is optional
*/
export type APIFnProps<T_API extends API<any,any,any,any>> = BaseAPIFnOptions<T_API> & { bitKey?: string }


/** 
 * - Receives: API GET path
 * - Gives: Response data type
*/
export type GETPath2Data<Path extends GETPaths> = API2PrunedAPIResponse<(typeof apisBE.gets)[Path]>


/** 
 * - Receives: API POST path
 * - Gives: Response data type
*/
export type POSTPath2Data<T_Path extends POSTPaths> = API2PrunedAPIResponse<typeof apisBE.posts[T_Path]>


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
export type GETPath2Params<T_Path extends GETPaths> = API2Params<typeof apisBE.gets[T_Path]>


/** 
 * - Receives: API POST path
 * - Gives: The type for that api's params
*/
export type POSTPath2Params<T_Path extends POSTPaths> = API2Params<typeof apisBE.posts[T_Path]>


/** 
 * - Receives: Route path
 * - Gives: The type for that route's params
*/
export type RoutePath2Params<T_Path extends keyof typeof routes> = Route2Params<(typeof routes)[T_Path]>


/** 
 * - Receives: API GET path
 * - Gives: The type for that api's search params
*/
export type GETPath2Search<T_Path extends GETPaths> = API2Search<typeof apisBE.gets[T_Path]>


/** 
 * - Receives: API POST path
 * - Gives: The type for that api's body
*/
export type POSTPath2Body<T_Path extends POSTPaths> = API2Body<typeof apisBE.posts[T_Path]>


/** 
 * - Receives: API POST path
 * - Gives: The type for that api's search params
*/
export type POSTPath2Search<T_Path extends POSTPaths> = API2Search <typeof apisBE.posts[T_Path]>


/**
 * - Receives: API Function Name, so => `apiExample`
 * - Gives: The type for the `load()` response
 * @example
  ```ts
  const water = load(() => apiCharacter({params: {element: 'water'}}), 'water')

  function Characters(res: APIName2LoadResponse<'apiCharacter'>) {}
  ```
 */
// export type APIName2LoadResponse<T_Function_Name extends APINames> = AccessorWithLatest<undefined | Awaited<ReturnType<(typeof apisBE)[T_Function_Name]>>>
export type APIName2LoadResponse<T_Name extends APINames & keyof typeof apisFE> = AccessorWithLatest<undefined | Awaited<ReturnType<(typeof apisFE)[T_Name]>>>

 

/** The component to render for a route */
export type RouteComponent<T_Params extends URLParams, T_Search extends URLSearchParams> = (fe: FE<T_Params, T_Search>) => JSX.Element


/** The component to render for a layout */
export type LayoutComponent = (fe: FE) => JSX.Element


/** This is how `Valibot` flattens their errors */
export type FlatMessages = Record<string, string[]>


export type APIBody = Record<any, any>
export type URLSearchParams = Record<string, string | string[]>
export type URLParams = Record<string, any>


export type JsonPrimitive = string | number | boolean | null;
export type JsonObject = { [key: string]: JsonPrimitive | JsonObject | JsonPrimitive[] | JsonObject[] | (JsonPrimitive | JsonObject)[] }
export type Json = JsonPrimitive | Json[] | JsonObject

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
