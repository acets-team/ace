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
import type { JSX, Signal } from 'solid-js'
import type { regexRoutes } from './regexRoutes'
import type { createAsync } from '@solidjs/router'
import type { regexApiPuts } from './regexApiPuts'
import type { regexApiGets } from './regexApiGets'
import type { regexApiNames } from './regexApiNames'
import type { regexApiPosts } from './regexApiPosts'
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


/**
 * - `RegexMap` helps organize and type all route or `API` entries in one place
 * - Ensures each `key` in the map corresponds to a properly typed `RegexMapEntry`, providing consistent access to route or `API` meta data
 */
export type RegexMap<Kind extends 'route' | 'api'> = Kind extends 'route'
  ? Record<string, RegexMapEntry<'route', AnyRoute>>
  : Record<string, RegexMapEntry<'api', API<any, any, any, any, any>>>;


/**
 * - `RegexMapEntry` defines the shape of a single entry in the `RegexMap` based on its kind (`route` or `API`)
 * - Ensures that each entry contains the correct fields (like `method` for APIs) and type-safe dynamic loader functions
 */
export type RegexMapEntry<Kind extends 'route' | 'api', T_Module> = Kind extends 'route'
  ? { pattern: RegExp, loader: () => Promise<T_Module> }
  : { path: string, method: ApiMethods, pattern: RegExp, loader: () => Promise<T_Module> }


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
export type ApiName2Response<T_Name extends ApiNames> = typeof regexApiNames[T_Name] extends RegexMapEntry<'api', infer T_API>
  ? Api2Response<T_API>
  : never


/** 
 * - Receives: API Function Name
 * - Gives: API Response Data
*/
export type ApiName2Data<T_Name extends ApiNames> = typeof regexApiNames[T_Name] extends RegexMapEntry<'api', infer T_API>
  ? Api2Data<T_API>
  : never


/** 
 * - Receives: API Function Name
 * - Gives: API Type
*/
export type ApiName2Api<T_Name extends ApiNames> = typeof regexApiNames[T_Name] extends RegexMapEntry<'api', infer T_API>
  ? T_API extends API<any, any, any, any, any>
    ? T_API
    : never
  : never


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
export type ApiName2Props<T_Name extends ApiNames> = typeof regexApiNames[T_Name] extends RegexMapEntry<'api', infer T_API> // Get module type T_API from the RegexMapEntry
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
  bitKey?: AceKey
  /** Optional, if queryType set AND queryKey undefined THEN queryKey <- apiName */
  queryKey?: AceKey
  /** @link https://github.com/acets-team/ace?tab=readme-ov-file#call-apis > full explanation of `queryType` */
  queryType?: QueryType,
  /** Optional, to send w/ `fetch()` */
  requestInit?: Partial<RequestInit>,
  /** On `FE`, IF `response.error` is truthy THEN `onError()` OR `defaultOnError()` will be called w/ `response.error`  */
  onError?: (error: AceErrorProps | AceError) => void
  /** On `FE`, IF no errors AND `onSuccess` provided THEN `onSuccess` will be called w/ `response.data` */
  onSuccess?: (data: Api2Data<T_API>) => void
  /** On `FE`, IF no errors AND `onResponse` provided THEN `onResponse` will be called w/ `Response` */
  onResponse?: (response: any) => void
  /** On `FE`, Optional, set if you'd love a callback on load change by this api */
  onLoadChange?: (value: boolean) => void
  /** Optional, default is `{deferStream: true}`, requested `createAsyncOptions` are merged w/ default & passed to `createAsync()` */
  createAsyncOptions?: Partial<Parameters<typeof createAsync>[1]>
}


/**
 * - Used for `bitKey` (boolean signals) & `queryKey` (Solid's `query()` key)
 * - Allows you to send a string or something like `['example', 2]`
 */
export type AceKey = string | (string | number)[]


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

  /**
   * Provided by Solid 
   * @link https://docs.solidjs.com/concepts/stores
   */
  store: SolidStore<{ [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }>,

  /**
   * Provided by Solid 
   * @link https://docs.solidjs.com/concepts/stores
   */
  setStore: SetStoreFunction<{ [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }>,

  /** 
   * Does: Solid's `setStore()` + Ace's `save()`
   * @link https://docs.solidjs.com/concepts/stores
   */
  set: SetStoreFunction<{ [K in keyof T_Atoms]: InferAtom<T_Atoms[K]> }>,

  /** Your own index db instance that you can read and write too like a document db :) */
  idb: IndexDB,

  /** Readonly, the init atoms sent to `createStore()` */
  atoms: Readonly<T_Atoms>,

  /** Inspired by AngularJS ngModel, 2 way data binding between a variable in a store and an input, textarea or select */
  refBind: StoreRefBind<T_Atoms>,

  /** 
   * - Does: Solid's `setStore()` + Solid's `produce()` + Ace's `save()`
   * - Convenient but not fine grained reactivity like `sync()` b/c the entire array/object is overwritten
   * @link https://docs.solidjs.com/concepts/stores
   */
  copy: StoreCopy<T_Atoms>,

  /** 
   * - Does: Solid's `setStore()` + Solid's `reconcile()` + Ace's `save()`
   * - `reconcile()` performs a diff between current array/object state and requested array/object state and then only updates in the array/object/DOM the changed items
   * @link https://docs.solidjs.com/concepts/stores
   */
  sync: StoreSync<T_Atoms>,

  /** Persist `Atom` by `key` */
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

