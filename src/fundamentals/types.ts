/**
 * 🧚‍♀️ How to access:
 *     - import type { APINames, ... } from '@ace/types'
 */


import type { API } from './api'
import type { Atom } from './atom'
import type { Route } from './route'
import type { IndexDB } from './indexDB'
import type { ScopeBE } from './scopeBE'
import type { InferEnums } from './enums'
import type { Route404 } from './route404'
import type { regexRoutes } from './regexRoutes'
import type { regexApiPuts } from './regexApiPuts'
import type { regexApiGets } from './regexApiGets'
import type { regexApiNames } from './regexApiNames'
import type { regexApiPosts } from './regexApiPosts'
import type { JSX, Signal, Accessor } from 'solid-js'
import type { ScopeComponent } from './scopeComponent'
import type { regexApiDeletes } from './regexApiDeletes'
import type { AceError, AceErrorProps } from './aceError'
import type { apiMethods, atomIs, atomPersit, queryType } from './vars'
import type { reconcile as solidReconcile, Store as SolidStore, SetStoreFunction } from 'solid-js/store'
import type { APIEvent as SolidAPIEvent, FetchEvent as SolidFetchEvent } from '@solidjs/start/server'

/** { 'apiPostA' | 'apiGetA' | 'apiPostB' } */
export type ApiNames = keyof typeof regexApiNames


/** '/api/a' | '/api/b/:id' */
export type GETPaths = keyof typeof regexApiGets


/** '/api/a' | '/api/b/:id' */
export type POSTPaths = keyof typeof regexApiPosts


/** '/api/a' | '/api/b/:id' */
export type DELETEPaths = keyof typeof regexApiDeletes


/** '/api/a' | '/api/b/:id' */
export type PUTPaths = keyof typeof regexApiPuts


/** '/a' | '/b/:id' */
export type Routes = keyof typeof regexRoutes


/** In the RegexMap it can point to a new Route() or a new Route404() */
export type AnyRoute = Route<any, any> | Route404


/** When we need to determine a route / api we look at a map that's in this structure, the key is the path as defined @ new Route() or new API() */
export type RegexMap<Kind extends 'route' | 'api'> = Kind extends 'route'
  ? Record<string, RegexMapEntry<AnyRoute>>
  : Record<string, RegexMapEntry<API<any, any, any, any, any>>>


/** loader() gives back the new API() or new Route() */
export type RegexMapEntry<T_Module> = { pattern: RegExp, loader: () => Promise<T_Module> }


/** 
 * - Receives: Regex Map & Path
 * - Gives: Type of new API()
*/
export type RegexApiMapAndPath2API<T_Map extends RegexMap<'api'>, T_Path extends keyof T_Map> = T_Map[T_Path] extends { loader: () => Promise<infer T_API> } // infer whatever the loader() promised
  ? T_API extends API<any, any, any, any, any> // only keep it if it’s actually a new API()
    ? T_API
    : never
  : never;


/** 
 * - Receives: Regex Map & Path
 * - Gives: Type of new Route()
*/
export type RegexRouteMapAndPath2Route<T_Map extends RegexMap<'route'>, T_Path extends keyof T_Map> = T_Map[T_Path] extends { loader: () => Promise<infer T_Route> } //  infer the Raw loader return
  ? T_Route extends AnyRoute // only keep it if it’s actually a new Route()
    ? T_Route
    : never
  : never


/**
 * - When we create a Response object the type for the stringified json is lost b/c the Response object does not accept generics
 * - When we create an AceResponse we can store / infer the type for the stringified json in @ `__resType`!
 * - This is the return type for `respond()` aka this is the return type for a `new API()` > `.resolve()`
 */
export interface AceResponse<T_Data> extends Response {
  __dataType?: T_Data
}


/**
 * - Required API response from `new API()` > `.resolve()`
 * - The go prop never get's to the fe, by then the redirect will happen
 */
export type ApiResponse<T_Data = any> = {
  go?: string
  data?: T_Data
  error?: AceErrorProps
}


/** 
 * - Receives: AceResponse
 * - Gives: API Response
*/
export type AceResponse2ApiResponse<T_AceResponse> = T_AceResponse extends AceResponse<infer T_Data>
  ? ApiResponse<T_Data>
  : never


/** 
 * - Receives: API
 * - Gives: ApiResponse
*/
export type Api2Response<T_API> = T_API extends API<any, any, any, any, any>
  ? ApiResponse<Api2Data<T_API>>
  : never


/** 
 * - Receives: API
 * - Gives: Response data type
*/
export type Api2Data<T_API> = T_API extends API<any, any, any, infer T_Response, any>
  ? T_Response extends ApiResponse<infer T_Data>
    ? Exclude<T_Data, null>
    : never
  : never


/** 
 * - Receives: API
 * - Gives: Request body type
*/
export type Api2Body<T_API extends API<any,any,any,any,any>> = T_API extends API<any, any, infer T_Body, any, any>
  ? GetPopulated<T_Body>
  : undefined


/** 
 * - Receives: API
 * - Gives: Request params type
*/
export type Api2PathParams<T_API extends API<any,any,any,any,any>> = T_API extends API<infer T_Params, any, any, any, any>
  ? GetPopulated<T_Params>
  : undefined


/** 
 * - Receives: API
 * - Gives: Request search params type
*/
export type Api2SearchParams<T_API extends API<any,any,any,any,any>> = T_API extends API<any, infer T_Search, any, any, any>
  ? GetPopulated<T_Search>
  : undefined


/** If object has keys return object, else return undefined */
export type GetPopulated<T> = IsPopulated<T> extends true ? T : undefined


/** If testing item is an object and has keys returns true, else return false */
export type IsPopulated<T> = T extends object ? [keyof T] extends [never] ? false : true : false


/** 
 * - Receives: API Function Name
 * - Gives: API Response
*/
export type ApiName2Response<T_Name extends ApiNames> = typeof regexApiNames[T_Name] extends RegexMapEntry<infer T_API>
  ? Api2Response<T_API>
  : never


/** 
 * - Receives: API Function Name
 * - Gives: API Response Data
*/
export type ApiName2Data<T_Name extends ApiNames> = typeof regexApiNames[T_Name] extends RegexMapEntry<infer T_API>
  ? Api2Data<T_API>
  : never


/** 
 * - Receives: API Function Name
 * - Gives: API Type
*/
export type ApiName2Api<T_Name extends ApiNames> = typeof regexApiNames[T_Name] extends RegexMapEntry<infer T_API>
  ? T_API
  : never


/**
 * - Receives: API Function Name, so => `apiExample`
 * - Gives: The type for the `load()` response
 * @example
  ```ts
  const res = load(() => apiCharacter({params: {element: 'water'}}))

  function Characters(res: ApiName2LoadResponse<'apiCharacter'>) {}
  ```
 */
export type ApiName2LoadResponse<T_Name extends ApiNames> = Accessor<undefined | ApiName2Response<T_Name>>


/** 
 * - Receives: API Function Name
 * - Gives: API Request Props
 * @example
    ```ts
    const props: ApiName2Props<'apiClothing'> = { bitKey: 'clothing' }
    if (category) props.searchParams = { category }
    const res = await apiClothing(props)
    ```
*/
export type ApiName2Props<T_Name extends ApiNames> = typeof regexApiNames[T_Name] extends RegexMapEntry<infer T_API> // Get module type T_API from the RegexMapEntry
  ? T_API extends API< infer T_PathParams, infer T_SearchParams, infer T_Body, infer T_Response, infer T_Locals > // ensure T_API is indeed an API<…>
    ? BaseAPIFnProps<API<T_PathParams,T_SearchParams,T_Body,T_Response,T_Locals>> & { bitKey?: string } // build props type
    : never
  : never


/** Building an options object whose properties are only present if they have keys */
export type BaseAPIFnProps<T_API extends API<any,any,any,any,any>> =
  OptionalIfNoRequired<'body', Api2Body<T_API>> &
  OptionalIfNoRequired<'pathParams', Api2PathParams<T_API>> &
  OptionalIfNoRequired<'searchParams', Api2SearchParams<T_API>>


/** 
 * - Receives: API
 * - Gives: Type for the Function that calls this API
 * - How: No required API params => allow missing options altogether, otherwise options object must be passed
*/
export type Api2Function<T_API extends API<any, any, any, any, any>> = RequiredKeys<ApiFnProps<T_API>> extends never
  ? (options?: ApiFnProps<T_API>) => Promise<Api2Response<T_API>>
  : (options: ApiFnProps<T_API>) => Promise<Api2Response<T_API>>

  
/** 
 * - The props (arguments / options) that are sent to an api function
*/
export type ApiFnProps<T_API extends API<any,any,any,any,any>> = BaseAPIFnProps<T_API> & {
  /** 
   * - Optional, bits are boolean signals, we identify them by bitKey, lovely for loading indicators
   * - IF `bitKey` = `undefined` AND `onLoadChange` = `undefined` THEN `bitKey` <- `apiName`
   */
  bitKey?: string
  /** Optional, if queryType set AND queryKey undefined THEN queryKey <- apiName */
  queryKey?: QueryKey
  /**
   * - Let's this api function know that we wanna use Solid's `query()` function! There are several different ways we can use `query()` and that is what this variable helps decide
   * - 🚨 When using Solid's `query()` a queryKey is required, we have it optional here b/c if a `queryType` is set & a `querKey` is `undefined` THEN the `queryKey` is set to the `apiName`
   * - Stream: Best when:
   *     - This API is called before page render (before the `return <></>` part in the `.component()`)
   *     - We'd love this API call to happen simultaneously to any other pre render call
   * - May Set Cookies:
   *     - Server cookies are set on the `fe` w/ a `Set-Cookie` server `Response` header
   *     - Once streaming starts we **may not** update the `Set-Cookie` header b/c the browser already has the Response
   *     - If an API may set cookies it's safest to ensure this request starts & ends on the `fe` (typical spa style) & we don't stream, that way the browser receives any potential Set-Cookie headers
   *     - This option is less performant then streaming, b/c streaming has the oportunity to start getting api data on the server so to do this maySetCookies option less we recommend example: IF realize someone is unAuth & we wanna clear cookies THEN redirect to a `/sign-out` **Route** that has a call to `apiSignOut({ queryType: 'maySetCookies' })` so redirect first, and set cokies 2nd, so we can stream the og api :)
   * - Direct: Best when goal is to:
   *     - Go out and do a solid start query() and then give the result back
   *     - Not happening pre render like streaming so not during page transition
   *     - Wanna ensure request is cached, deduped and/or can be queried again simply later
   */
  queryType?: QueryType,
  /** Optional, to send w/ `fetch()` */
  requestInit?: Partial<RequestInit>,
  /** Optional, default is `if (error?.message) showErrorToast(error.message), Provide if you'd love a specific onError() happening, callback is provided the error  */
  onError?: (error: AceErrorProps | AceError) => void
  /** Optional, what you'd love to happen when response.data is truthy, callback is provided response.data */
  onData?: (data: Api2Data<T_API>) => void
  /** Helpful when your api returned something you'd love for us not to parse and check for data or error and just to give to ya fresh, also called if there is an error w/ an unparsed error object */
  onResponse?: (response: any) => void
  /** - Helpful when an api does not return data & you'd love to know the api responded & did not return an error */
  onGood?: (response?: any) => void
  /** Optional, set if you'd love a callback on load change by this api */
  onLoadChange?: (value: boolean) => void
}


export type QueryKey = string | (string | number)[]


/** Utility to extract the *required* keys of some object */
export type RequiredKeys<T_Object> = {
  [K in keyof T_Object]-?: {} extends Pick<T_Object, K> ? never : K
}[keyof T_Object]


/**
 * – If there are no required keys, you get an optional prop
 * – Otherwise it’s a required prop
 */
export type OptionalIfNoRequired<Name extends string, T> = RequiredKeys<T> extends never
  ? { [P in Name]?: T }
  : { [P in Name]: T }


/** 
 * - Receives: GET Path
 * - Gives: API
*/
export type GETPath2Api<T_Path extends GETPaths> = RegexApiMapAndPath2API<typeof regexApiGets, T_Path>


/** 
 * - Receives: POST Path
 * - Gives: API
*/
export type POSTPath2Api<T_Path extends POSTPaths> = RegexApiMapAndPath2API<typeof regexApiPosts, T_Path>


/** 
 * - Receives: PUT Path
 * - Gives: API
*/
export type PUTPath2Api<T_Path extends PUTPaths> = RegexApiMapAndPath2API<typeof regexApiPuts, T_Path>


/** 
 * - Receives: DELETE Path
 * - Gives: API
*/
export type DELETEPath2Api<T_Path extends DELETEPaths> = RegexApiMapAndPath2API<typeof regexApiDeletes, T_Path>

  
/** 
 * - Receives: Route
 * - Gives: Route path params type
*/
export type Route2PathParams<T_Route extends Route<any, any>> = T_Route extends Route<infer T_Params, any>
  ? GetPopulated<T_Params>
  : undefined


/** 
 * - Receives: Route
 * - Gives: Route search params type
*/
export type Route2SearchParams<T_Route extends Route<any, any>> = T_Route extends Route<any, infer T_Search>
  ? GetPopulated<T_Search>
  : undefined

/** 
 * - Receives: Route path
 * - Gives: The type for that route's path params
*/
export type RoutePath2PathParams<T_Path extends Routes> = Route2PathParams<RegexRouteMapAndPath2Route<typeof regexRoutes, T_Path>>


/** 
 * - Receives: Route path
 * - Gives: The type for that route's search params
*/
export type RoutePath2SearchParams<T_Path extends Routes> = Route2SearchParams<RegexRouteMapAndPath2Route<typeof regexRoutes, T_Path>>


/** The component to render for a route */
export type RouteComponent<T_Params extends UrlPathParams, T_Search extends UrlSearchParams> = (scope: ScopeComponent<T_Params, T_Search>) => JSX.Element


/** The component to render for a layout */
export type LayoutComponent = (scope: ScopeComponent) => JSX.Element


/** This is how `Valibot` flattens their errors */
export type FlatMessages = Record<string, string[]>


export type ApiBody = Record<string, any>
export type UrlSearchParams = Record<string, any>
export type UrlPathParams = Record<string, any>


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
export type FullJWTPayload<T_JWTPayload extends BaseJWTPayload = {}> = T_JWTPayload & {iat: number, exp: number}


/** 
 * - Anonymous async function (aaf) that runs b4 api and/or route fn
 * - If the aaf's response is truthy, that response is given to client & the api and/or route fn is not called, else the api and/or route fn is called
 * - To share data between b4 function and other b4 function and the api fn add data to event.locals
 */
export type B4<T_Locals extends BaseEventLocals = {}> = (scope: ScopeBE<any, any, any, T_Locals>) => Promise<Response | void>


/** The object that is passed between b4 async functions and given to the api */
export type BaseEventLocals = Record<string, any>


/** 
 * - Receives: B4
 * - Gives: The type for the event.locals this B4 adds
*/
export type B42Locals<T_B4> = T_B4 extends B4<infer T_Locals>
  ? T_Locals
  : {}


/**
 * - Merge the event.locals types from an array of B4 functions
 * - T_B4Head: the first element in T_B4_Array
 * - T_B4Tail: the remaining elements in T_B4_Array
 * - Extract locals from the first B4
 * - Merge with the locals from the rest recursively
 * - Base case: the array is empty
 */
export type MergeLocals<T_B4_Array extends B4<any>[]> = T_B4_Array extends [infer T_B4Head, ...infer T_B4Tail]
  ? B42Locals<T_B4Head> & MergeLocals<T_B4Tail extends B4<any>[] ? T_B4Tail : []>
  : {}


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

export type CMSMap = Map<number, Signal<CMSItem | undefined>>


export type JWTValidateSuccess<T_JWTPayload extends BaseJWTPayload = {}> = {
  isValid: true
  payload: FullJWTPayload<T_JWTPayload>
  errorId?: never
  errorMessage?: never
}

export type JWTValidateFailure<T_JWTPayload extends BaseJWTPayload = {}>  = {
  isValid: false
  payload?: FullJWTPayload<T_JWTPayload>
  errorId: 'FALSY_JWT' | 'INVALID_PARTS' | 'INVALID_EXP' | 'INVALID_JWT' | 'EXPIRED'
  errorMessage: string
}

export type JWTValidateResponse<T_JWTPayload extends BaseJWTPayload = {}> = JWTValidateSuccess<T_JWTPayload> | JWTValidateFailure<T_JWTPayload>

export type BaseJWTPayload = Record<string, unknown>


/**
 * Goal w/ 3 types below: Enforce the exact shape of keys from InferOutput<T> @ `parse()`
 * Allow more flexible values (e.g., string | null instead of just string) b/c `fd()` has no guarantee's on response but valibot will guarantee that but atleast the object shape going into parse can be enforced, let valibot do the actual value enforcing
 * Disallow extra keys not in the inferred shape.
 * If the input is type any, like when await res.json() that will be allowed, but if any keys are known they must match the schema and the parser will do a thorough check of values
 */


/**
 * - What:
 *     - Loop through each key in T
 *     - Assign the type `unknown` to each key
 * - Why:
 *     - Remember the goal above, correct keys, any (unknown) value
 * - So:
 *     - IF T is { aloha: boolean } THEN AllowAnyValue<T> is { aloha: unknown }
 */
type AllowAnyValue<T> = { [K in keyof T]: unknown }


/**
 * - Exclude<keyof U, keyof T>
 *     - Ensures U has no extra keys in it
 *     - Puts U keys into array and then removes keys also in T
 *     - So if U has any extra keys we don't match exact keys amongst objects
 * - If `Exclude<keyof T, keyof U>` is truthy we don't have exact keys which will throw a ts errow with the extends `never` and if we do we'll return U aka the object keys
 */
type ExactKeys<T, U> = Exclude<keyof U, keyof T> extends never
  ? Exclude<keyof T, keyof U> extends never
    ? U
    : never
  : never;


/**
 * - From the shape T
 * - Replace its values w/ unknown
 * - Enforce that the keys are exactly that of T
 */
export type AnyValue<T> = ExactKeys<T, AllowAnyValue<T>>


/** We support parsing / validations of path params, search params and api bodies by valibot, zod or custom (and anyone else) and we do that by using this base parser */
export type Parser<T> = (input: unknown) => T


/** The api methods we support */
export type ApiMethods = InferEnums<typeof apiMethods>


/**
 * - String is passed to `new Date()`
 * - Date is already a `new Date()`
 * - Number is `epoch` and passed to `new Date()` assumed to be in milliseconds
 * @link https://epoch.vercel.app/
 * @link https://orm.drizzle.team/docs/guides/timestamp-default-value
 */
export type DateLike = string | Date | number


/** 
 * - Atom's in Ace = frontend data that can be persisted to all the locations mentioned here:
 * - **idb** is Index Db: `~ hundreds of MBs` - Persists post page refresh, across all tabs & through browser refreh (best @ home, they trust this device a lot & got tons of space)
 * - **ls** is Local Storage: `~5 MB` - Persists post page refresh, across all tabs & through browser refreh (good @ home, they trust this device a lot & got some space)
 * - **ss** is Session Storage: `~5 MB` - Persists post page refresh, across all tabs but not through browser refreh, (best @ library, when I close the browser my data is gone)
 * - **m** is Memory: `available RAM` - Not shared between tabs, and not persisted after any refresh, (best for ephemeral or private data that can exist on the sceen and that's it)
 */
export type AtomSaveLocations = InferEnums<typeof atomPersit>


/** 
 * - Atom's in Ace = frontend data that can be persisted to all the locations mentioned @ `AtomSaveLocations`
 * - `AtomIs` helps us ensure that we serialize and deserialize to and from persistance correctly
 */
export type AtomIs = InferEnums<typeof atomIs>


export type RefFn = (el: HTMLElement | null) => void
 

export type Atoms = Record<string, Atom<any>>


/** 
 * - Receives: An Atom type (ex: Atom<string>)
 * - Gives: The type of the Atom, string
 */
export type InferAtom<T> = T extends Atom<infer U> ? U : never


/** 
 * - Receives: An Atom type (ex: Atom<string>)
 * - Gives: The type of the 'is' property (e.g., 'string' | 'number' | ...).
 */
export type Atom2Is<T> = T extends { is: infer I } ? I : never


/**
 * - Receives: Atoms
 * - Gives: Store (Infer each atom)
*/
export type Atoms2Store<T_Atoms extends Atoms> = {
  [K in keyof T_Atoms]: InferAtom<T_Atoms[K]>
}

/**
 * - Receives: Atoms
 * - Gives: A union of all the keys (string literals) present in the store's schema.
*/
export type Atoms2Keys<T_Atoms extends Atoms> = keyof T_Atoms


/**
 * - Strict, key-aware overloads up to 8 levels deep
 * - Each call returns a RefFn suitable for `ref` attribute
 */
export type StoreRefBind<T extends Atoms> = {
  <K1 extends keyof T>(k1: K1): RefFn

  <K1 extends keyof T, K2 extends keyof InferAtom<T[K1]>>(
    k1: K1, k2: K2 ): RefFn

  <K1 extends keyof T, K2 extends keyof InferAtom<T[K1]>, K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>>(
    k1: K1, k2: K2, k3: K3 ): RefFn

  <K1 extends keyof T,
   K2 extends keyof InferAtom<T[K1]>,
   K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
   K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>
  >( k1: K1, k2: K2, k3: K3, k4: K4 ): RefFn

  <K1 extends keyof T,
   K2 extends keyof InferAtom<T[K1]>,
   K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
   K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
   K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>
  >( k1: K1, k2: K2, k3: K3, k4: K4, k5: K5 ): RefFn

  <K1 extends keyof T,
   K2 extends keyof InferAtom<T[K1]>,
   K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
   K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
   K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>,
   K6 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>
  >( k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6 ): RefFn

  <K1 extends keyof T,
   K2 extends keyof InferAtom<T[K1]>,
   K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
   K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
   K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>,
   K6 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>,
   K7 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>
  >( k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7 ): RefFn

  <K1 extends keyof T,
   K2 extends keyof InferAtom<T[K1]>,
   K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
   K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
   K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>,
   K6 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>,
   K7 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>,
   K8 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7]>
  >( k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7, k8: K8 ): RefFn
}


export type StoreSync<T extends Atoms> = {
  <
    K1 extends keyof T
  >(k1: K1, value: InferAtom<T[K1]>, opts?: Parameters<typeof solidReconcile>[1]): void

  <
    K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>
  >(k1: K1, k2: K2, value: InferAtom<InferAtom<T[K1]>[K2]>, opts?: Parameters<typeof solidReconcile>[1]): void

  <
    K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>
  >(k1: K1, k2: K2, k3: K3, value: any, opts?: Parameters<typeof solidReconcile>[1]): void

  <
    K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, value: any, opts?: Parameters<typeof solidReconcile>[1]): void

  <
    K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
    K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, value: any, opts?: Parameters<typeof solidReconcile>[1]): void

  <
    K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
    K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>,
    K6 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, value: any, opts?: Parameters<typeof solidReconcile>[1]): void

  <
    K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
    K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>,
    K6 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>,
    K7 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7, value: any, opts?: Parameters<typeof solidReconcile>[1]): void

  <
    K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
    K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>,
    K6 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>,
    K7 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>,
    K8 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7, k8: K8, value: any, opts?: Parameters<typeof solidReconcile>[1]): void
}


export type StoreCopy<T> = {
  <K1 extends keyof T>(
    k1: K1,
    fn: (draft: InferAtom<T[K1]>) => void
  ): void

  <K1 extends keyof T, K2 extends keyof InferAtom<T[K1]>>(
    k1: K1,
    k2: K2,
    fn: (draft: InferAtom<InferAtom<T[K1]>[K2]>) => void
  ): void

  <K1 extends keyof T, K2 extends keyof InferAtom<T[K1]>, K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>>(
    k1: K1,
    k2: K2,
    k3: K3,
    fn: (draft: any) => void
  ): void

  <K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, fn: (draft: any) => void): void

  <K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
    K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, fn: (draft: any) => void): void

  <K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
    K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>,
    K6 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, fn: (draft: any) => void): void

  <K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
    K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>,
    K6 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>,
    K7 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7, fn: (draft: any) => void): void

  <K1 extends keyof T,
    K2 extends keyof InferAtom<T[K1]>,
    K3 extends keyof InferAtom<InferAtom<T[K1]>[K2]>,
    K4 extends keyof InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>,
    K5 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>,
    K6 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>,
    K7 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>,
    K8 extends keyof InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<InferAtom<T[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7]>
  >(k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6, k7: K7, k8: K8, fn: (draft: any) => void): void
}


export type BaseStoreContext<T_Atoms extends Atoms> = {
  /**
   * - Showing the proper value for each Atom is important and this "_" variable helps us accomplish that
   * - IF an Atom has an init value we will start by showing that
   * - IF an Atom has some data saved on the fe locally (ex: index db) that will show over the init value once available
   * - IF an Atom has some data loaded from an API that will show over the fe local data once available
   */
  _: BaseStoreContextInternal,

  /** Provided by Solid - https://docs.solidjs.com/concepts/stores */
  store: SolidStore<{ [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }>,

  /** Provided by Solid - https://docs.solidjs.com/concepts/stores */
  setStore: SetStoreFunction<{ [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }>,

  /** Does: setStore() + save() - https://docs.solidjs.com/concepts/stores */
  set: SetStoreFunction<{ [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }>,

  /** Your own index db instance that you can read and write too like a document db :) */
  idb: IndexDB,

  /** Readonly, the init atoms sent to createStore() */
  atoms: Readonly<T_Atoms>,

  /** Inspired by AngularJS ngModel, 2 way data binding between a variable in a store and an input, textarea or select */
  refBind: StoreRefBind<T_Atoms>,

  /** Does: setStore() + produce() + save() - https://docs.solidjs.com/concepts/stores */
  copy: StoreCopy<T_Atoms>,

  /** 
   * - Does: `setStore()` + `reconcile()` + `save()` - https://docs.solidjs.com/concepts/stores
   * - `reconcile()` performs a diff between current array state and requested array state and preserves existing DOM nodes b/c it does not update the entire array reference like `set()`
   */
  sync: StoreSync<T_Atoms>,

  /** Persist Atom by key */
  save: (key: keyof T_Atoms) => void,
}


export type BaseStoreContextInternal = {
  dontLoad: Set<string>,
  trackDontLoad: boolean
}


export type QueryType = InferEnums<typeof queryType>


export type ChartJsMap = {
  /** Aligned w/ label[], Good for sync() */
  id: string
  /** Aligned w/ data[] */
  amount: number
}


export type ChartJsRegisterFn = () => void


export type AgGridRegisterFn = () => void
