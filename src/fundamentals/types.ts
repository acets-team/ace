/**
 * 🧚‍♀️ How to access:
 *     - import type { MapApis, ... } from '@ace/types'
 */


import type { Atom } from './atom'
import type { Load } from './load'
import type { Route } from './route'
import type { Async } from './async'
import type { ApiInfo } from './api'
import type { Stream } from './stream'
import type { mapApis } from './mapApis'
import type { IndexDB } from './indexDB'
import type { ScopeBE } from './scopeBE'
import type { InferEnums } from './enums'
import type { Route404 } from './route404'
import type { mapRoutes } from './mapRoutes'
import type { JSX, Accessor } from 'solid-js'
import type { BuildUrlProps } from './buildUrl'
import type { AceResponse } from './aceResponse'
import type { ScopeComponent } from './scopeComponent'
import type { apiMethods, atomIs, atomPersit } from './vars'
import type { reconcile as solidReconcile, SetStoreFunction, SolidStore } from 'solid-js/store'
import type { APIEvent as SolidAPIEvent, FetchEvent as SolidFetchEvent } from '@solidjs/start/server'



/** `{ apiName: { pattern, api, info, resolver } }` */
export type MapApis = typeof mapApis


/** `{ 'apiPostA' | 'apiGetA' | 'apiPostB' }` */
export type ApiNames = keyof MapApis


export type MapRoutes = typeof mapRoutes


export type RoutePaths = keyof MapRoutes


/** The api methods we support */
export type ApiMethods = InferEnums<typeof apiMethods>


/** `'/a' | '/b/:id'` */
export type Routes = keyof typeof mapRoutes


/** In the RegexMap it can point to a new Route() or a new Route404() */
export type AnyRoute = Route<any> | Route404


/** 
 * - `data` or `error` might be set
 * - the parsed value w/in an `AceResponse` which is just a typed `Response`
 */
export type AceResEither<T_ResData extends AceResData = AceResData> = {
  data?: T_ResData
  error?: AceResError
}


/** Either shape but it'll definitly have an error */
export type AceResErrorEither<T_ResData extends AceResData = AceResData> = {
  data?: T_ResData
  error: NonNullable<AceResError>
}


/** Either shape that'll definitly have data */
export type AceResDataEither<T_ResData extends AceResData = AceResData> = {
  data: T_ResData
  error?: AceResError
}


/** `data` prop @ `AceResEither` */
export type AceResData = Record<string, unknown> | any[] | string | number | boolean | null | undefined


/** `error` prop @ `AceResEither` */
export type AceResError = { message: string, cause?: Record<string, unknown> } | null | undefined


export type AceResponse2Data<T_Res> = T_Res extends AceResponse<infer T_Res_Data>
  ? T_Res_Data
  : never


export type BaseApiReq = {
  body?: BaseBody,
  pathParams?: BasePathParams,
  searchParams?: BaseSearchParams,
}


export type BaseRouteReq = {
  pathParams?: BasePathParams,
  searchParams?: BaseSearchParams,
}


export type BaseBody = {
  [key: string]: any
}


export type BasePathParams = {
  [key: string]: any
}


export type BaseSearchParams = {
  [key: string]: any
}


export type Api<
  T_Resolver extends ApiResolverFn<any, any>, // Allow any locals/data to be passed
  T_Info extends ApiInfo
> = (req: ApiInfo2Req<T_Info>) => Promise<AceResponse<ApiResolver2ResData<T_Resolver>>>


export type ApiResolverFn<
  T_Req extends BaseApiReq,
  T_Res_Data extends AceResData,
> = (req: T_Req) => Promise<AceResponse<T_Res_Data>>


export type ApiResFn<
  T_Req extends BaseApiReq,
  T_Res_Data extends AceResData,
  T_Locals extends BaseEventLocals = {}
> = (scope: ScopeBE<T_Req, T_Locals>) => AceResponse<T_Res_Data> | Promise<AceResponse<T_Res_Data>>


export type ApiDeconstructor<T_Api> = T_Api extends Api<infer T_Resolver, infer T_Info>
  ? { req: ApiInfo2Req<T_Info>, res: ApiResolver2ResData<T_Resolver> }
  : never

export type Api2Req<T_Api> = ApiDeconstructor<T_Api>['req']

export type Api2Res<T_Api> = ApiDeconstructor<T_Api>['res']


export type MapApisEntry<
  T_Api extends Api<any, any>,
  T_Info extends ApiInfo,
  T_Resolver extends ApiResolverFn<any, any>
> = {
  buildUrl: (props: MapBuildUrlProps) => string,
  api: () => Promise<T_Api>,
  info: () => Promise<T_Info>,
  resolver: () => Promise<T_Resolver>,
}

/** Build url props @ MapApis & MapRoutes */
export type MapBuildUrlProps = Omit<BuildUrlProps, 'segments'>


export type TreeApiSearchResult = {
  key: string,
  params: BasePathParams
}


export type ApiName2Entry<T_Name extends ApiNames> = (typeof mapApis)[T_Name] extends infer T_Entry
  ? T_Entry extends MapApisEntry<infer A, infer I, infer R>
  ? { api: A, info: I, resolver: R }
  : never
  : never


export type ApiName2Req<T_Name extends ApiNames> = ApiName2Entry<T_Name> extends { info: infer T_Info }
  ? T_Info extends ApiInfo
  ? ApiInfo2Req<T_Info>
  : never
  : never


export type ApiName2ResData<T_Name extends ApiNames> = ApiName2Entry<T_Name> extends { resolver: infer T_Resolver }
  ? T_Resolver extends (...args: any) => any
  ? ApiResolver2ResData<T_Resolver>
  : never
  : never


export type ApiName2Either<T_Name extends ApiNames> = AceResEither<ApiName2ResData<T_Name>>


export type ApiName2PathParams<T_Name extends ApiNames> = ApiReq2PathParams<ApiName2Req<T_Name>>


export type ApiName2SearchParams<T_Name extends ApiNames> = ApiReq2SearchParams<ApiName2Req<T_Name>>


export type ApiName2Body<T_Name extends ApiNames> = ApiReq2Body<ApiName2Req<T_Name>>


/** 
 * - Receives: API Function Name
 * - Gives: Stream Response
*/
export type ApiName2Stream<T_Name extends ApiNames> = Stream<ApiName2Req<T_Name>, ApiName2ResData<T_Name>>


/** 
 * - Receives: API Function Name
 * - Gives: Load Response
*/
export type ApiName2Load<T_Name extends ApiNames> = Load<ApiName2Req<T_Name>, ApiName2ResData<T_Name>>


/** 
 * - Receives: API Function Name
 * - Gives: Async `run()` Response (this response is parsed so it'll be an object w/ `data/error`) to get a raw `Response` don't call `run()`, call `raw()`
*/
export type ApiName2Async<T_Name extends ApiNames> = Async<ApiName2Req<T_Name>, ApiName2ResData<T_Name>>


export type ApiResolver2ResData<T_Resolver extends ApiResolverFn<any, any>> = Awaited<ReturnType<T_Resolver>> extends infer T_Result
  ? T_Result extends AceResponse<infer T_Res_Data>
  ? T_Res_Data
  : never
  : never


/** 
 * - Receives: ApiInfo
 * - Request type
*/
export type ApiInfo2Req<T_ApiInfo extends ApiInfo> = Parser2Req<T_ApiInfo['parser']>



/**
 * Receives: Api request type
 * Gives: Api body type
 */
export type ApiReq2Body<T_Req extends BaseApiReq> = NonNullable<T_Req['body']> extends BaseBody
  ? NonNullable<T_Req['body']>
  : BaseBody


/**
 * Receives: Api request type
 * Gives: Api path params type
 */
export type ApiReq2PathParams<T_Req extends BaseApiReq> = NonNullable<T_Req['pathParams']> extends BasePathParams
  ? NonNullable<T_Req['pathParams']>
  : BasePathParams


/**
 * Receives: Api request type
 * Gives: Api search params type
 */
export type ApiReq2SearchParams<T_Req extends BaseApiReq> = NonNullable<T_Req['searchParams']> extends BaseSearchParams
  ? NonNullable<T_Req['searchParams']>
  : BaseSearchParams


/** 
 * - No/Any library may be used w/in a parser function (valibot, zod etc)
 * - It's purpose it to validate `input`, throw errors if invalid, and optionally parse the input
 */
export type Parser<T> = (input: unknown) => T


/** 
 * - Receives: Parser
 * - Gives: The type for the output (return value type from the parser function)
*/
export type Parser2Output<T_Parser> = T_Parser extends (input: any) => infer T_Output
  ? T_Output
  : never


/** 
 * - Receives: Parser
 * - Gives: The specific type (ex: `{ body: { id: number } }`) or the fallback type if it's invalid/undefined `BaseApiReq`
*/
export type Parser2Req<T_Parser> = Parser2Output<T_Parser> extends infer T_Output
  ? T_Output extends BaseApiReq
  ? T_Output & BaseApiReq // If it extends, use the specific type AND the base
  : BaseApiReq // If it doesn't extend, fall back to the base
  : BaseApiReq


/** This is how `Valibot` / `Zod` flattens their errors/issues */
export type FlatMessages = Record<string, string[]>


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
 * - `T` => Expected shape
 * - `U` => User defined shape
 * - `Exclude<keyof U, keyof T>`
 *     - Ensures U has no extra keys in it
 *     - Puts U keys into array and then removes keys also in T
 *     - So if U has any extra keys we don't match exact keys amongst objects
 * - `Exclude<keyof U, keyof T> extends never`
 *     - IF the set difference between keys is never (empty) THEN pass
 * - Why `Exclude<keyof U, keyof T>` AND `Exclude<keyof T, keyof U>`
 *     - Checking both directions
 *     - Way 1: `U` has no extra keys
 *     - Way 2: `T` has no extra keys
 * - IF truthy we don't have exact keys 
 * - If falsy (`never`) we have exact keys so return `U` aka the keys
 */
export type ExactKeys<T, U> = Exclude<keyof U, keyof T> extends never
  ? (Exclude<keyof T, keyof U> extends never
    ? U
    : never
  )
  : never


/**
 * - From the shape T
 * - Replace its values w/ unknown
 * - Enforce that the keys are exactly that of T
 */
export type AnyValue<T> = ExactKeys<T, AllowAnyValue<T>>


/** The fn provided to Stream, Load & Async */
export type FetchFn<
  T_Req extends BaseApiReq,
  T_Res_Data extends AceResData
> = (req: T_Req) => Promise<AceResponse<T_Res_Data>>


/**
 * - `undefined extends AllowUndefinedIfNoRequired<T>`
 *     - Is the type `undefined` assignable to the type `AllowUndefinedIfNoRequired<T>`
 *     - Does T have no required keys
 */
export type MaybeOptionalArg<T> = undefined extends AllowUndefinedIfNoRequired<T>
  ? [req?: AllowUndefinedIfNoRequired<T>] // no required keys → req optional
  : [req: AllowUndefinedIfNoRequired<T>] // required keys → req required


export type LoadStatus = 'loading' | 'error' | 'storeRendered' | 'success'

export type AsyncStatus = 'idle' | 'loading' | 'error' | 'success'

export type StreamStatus = 'loading' | 'error' | 'storeRendered' | 'success'


export type UIProps<
  T_Data extends AceResData,
  T_For_Item extends AceResData = Array2ArrayItem<T_Data>
> = (
  UISuspenseProps<T_Data> |
  UIForProps<T_Data, T_For_Item> |
  UIIndexProps<T_Data, T_For_Item> |
  UIDefaultProps
) & {
  error?: UIErrorFn,
  onLoad?: Accessor<JSX.Element>
}


export type UIErrorFn = (error: AceResErrorEither['error']) => JSX.Element


export type UISuspenseFn<T_Data> = (data?: T_Data | null) => JSX.Element


export type UILoopDataFn<T_Res_Data extends AceResData, T_For_Item extends AceResData> = (res: AceResEither<T_Res_Data>['data']) => T_For_Item[] | undefined | null


export type UIForFn<T_For_Item> = (item: T_For_Item | null, index: Accessor<number>) => JSX.Element


export type UIIndexFn<T_For_Item> = (item: () => T_For_Item | null, index: number) => JSX.Element;


export type UIDefaultProps = {
  'suspense'?: never;
  loopData?: never;
  for?: never;
  index?: never;
}


export type UISuspenseProps<T_Res extends AceResData> = {
  'suspense': UISuspenseFn<T_Res>
  for?: never
  index?: never
  loopData?: never
}


export type UIForProps<T_Res_Data extends AceResData, T_For_Item extends AceResData> = {
  for: UIForFn<T_For_Item>
  loopData?: UILoopDataFn<T_Res_Data, T_For_Item>
  index?: never
  'suspense'?: never
}


export type UIIndexProps<T_Res extends AceResData, T_For_Item extends AceResData> = {
  index: UIIndexFn<T_For_Item>
  loopData?: UILoopDataFn<T_Res, T_For_Item>
  for?: never
  'suspense'?: never
}


/** Response that comes from FE Store */
export type FetchStoreResponse<T_Res extends AceResData> = AceResEither<T_Res> | null | undefined


/** Fetch `.response()` */
export type FetchResponseAccessor<T_Res extends AceResData> = Accessor<AceResEither<T_Res> | null | undefined>

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
 * - Async function that runs before api `res` function
 * - IF the b4's response is truthy THEN that response is given to client & the api `res` function is not called ELSE the api `res` function is called
 * - To share data between b4 function and/or the api `res` function add data to `event.locals` & update the generic
 * @example
    ```ts
    export const exampleB4: B4<{ example: boolean }> = async (scope) => {
      scope.event.locals.example = true
    }
    ```
 */
export type B4<T_Locals extends BaseEventLocals = {}, T_Req extends BaseApiReq = BaseApiReq> = (scope: ScopeBE<T_Req, T_Locals>) => Promise<Response | void>


/** The object that is passed between b4 async functions and given to the api */
export type BaseEventLocals = {
  [key: string]: any
}


/** 
 * - Receives: B4
 * - Gives: The type for the `event.locals` this B4 adds
*/
export type B42Locals<T_B4> = T_B4 extends B4<infer T_Locals>
  ? T_Locals
  : {}


/**
 * Merge the event.locals types from an array of B4 functions
 */
export type MergeLocals<T extends readonly B4<any>[]> = T extends readonly [infer H, ...infer R]
  ? B42Locals<H> & MergeLocals<R extends readonly B4<any>[] ? R : []>
  : {}


export type RouteReq2PathParams<T extends BaseRouteReq> = T['pathParams']


export type RouteReq2SearchParams<T extends BaseRouteReq> = T['searchParams']


/** 
 * - Receives: Route
 * - Gives: Route path params type
*/
export type Route2PathParams<T_Route extends Route<any>> = T_Route extends Route<infer T_Req>
  ? GetPopulated<RouteReq2PathParams<T_Req>>
  : undefined


/** 
 * - Receives: Route
 * - Gives: Route search params type
*/
export type Route2SearchParams<T_Route extends Route<any>> = T_Route extends Route<infer T_Req>
  ? GetPopulated<RouteReq2SearchParams<T_Req>>
  : undefined


/** 
 * - Receives: Route Path
 * - Gives: Type @ new Route()
*/
export type RoutePath2Route<T_Path extends keyof MapRoutes> = MapRoutes[T_Path] extends { route: () => Promise<infer T_Route> } //  infer the Raw loader return
  ? T_Route extends AnyRoute // only keep it if it’s actually a new Route()
  ? T_Route
  : never
  : never


/** 
 * - Receives: Route path
 * - Gives: The type for that route's path params
*/
export type RoutePath2PathParams<T_Path extends Routes> = Route2PathParams<RoutePath2Route<T_Path>>


/** 
 * - Receives: Route path
 * - Gives: The type for that route's search params
*/
export type RoutePath2SearchParams<T_Path extends Routes> = Route2SearchParams<RoutePath2Route<T_Path>>


/** The component to render for a route */
export type RouteComponent<T_Req extends BaseRouteReq> = (scope: ScopeComponent<T_Req>) => JSX.Element


/** The component to render for a layout */
export type LayoutComponent = (scope: ScopeComponent) => JSX.Element


/**
 * Ensures the user-defined shape U contains only keys that exist in the expected shape T.
 * This is used when T contains optional keys (T?) and the input U is allowed to omit them.
 * This checks ONLY for excess keys in U, allowing U to be a subset of T's keys.
 *
 * @template T - The expected shape (e.g., ApiInputSchema, where keys are optional).
 * @template U - The user-defined shape (e.g., { pathParams: {...} }).
 * @returns U if U contains no extra keys, otherwise never (error).
 */
export type StrictSubsetKeys<T, U> = Exclude<keyof U, keyof T> extends never ? U : never;


/** If object has keys return object, else return undefined */
export type GetPopulated<T> = IsPopulated<T> extends true ? T : undefined


/** If testing item is an object and has keys returns true, else return false */
export type IsPopulated<T> = T extends object ? [keyof T] extends [never] ? false : true : false


/** FE store data that can persist to memory, session storage, local storage or index db */
export type Atoms = Record<string, Atom<any>>


/** Enum of allowed Atom save locations */
export type AtomSaveLocations = InferEnums<typeof atomPersit>


/** 
 * - Receives: An Atom type (ex: Atom<string>)
 * - Gives: The type of the Atom, string
 */
export type InferAtom<T> = T extends Atom<infer U> ? U : never


/** `AtomIs` helps us ensure that we serialize and deserialize to and from persistance correctly */
export type AtomIs = InferEnums<typeof atomIs>


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
 * - Converts arrays into a strig key
 * - Example: `const id = 360` -> `['customer', id]` -> `customer:360`
 */
export type AceKey = string | (string | number)[]


/**
 * - Receives: Array
 * - Gives: Array Item
*/
export type Array2ArrayItem<T_Array> = T_Array extends (infer T_Array_Item)[]
  ? T_Array_Item
  : T_Array


export type OptionalIfNoRequired<Name extends string, T> = RequiredKeys<T> extends never
  ? { [P in Name]?: T }
  : { [P in Name]: T }


export type RequiredKeys<T_Obj> = {
  [T_Key in keyof T_Obj]-?: {} extends Pick<T_Obj, T_Key> ? never : T_Key
}[keyof T_Obj]


export type AllowUndefinedIfNoRequired<T> = RequiredKeys<T> extends never ? T | undefined : T

/** ❤️ Complex Store Types */


export type BaseStoreCtx<T_Atoms extends Atoms> = {
  /**
   * - Showing the proper value for each Atom is important and this "_" variable helps us accomplish that
   * - IF an Atom has an init value we will start by showing that
   * - IF an Atom has some data saved on the fe locally (ex: index db) that will show over the init value once available
   * - IF an Atom has some data loaded from an API that will show over the fe local data once available
   */
  _: BaseStoreInternal,

  /**
   * Provided by Solid 
   * @link https://docs.solidjs.com/concepts/stores
   */
  store: Atoms2Store<T_Atoms>,

  /**
   * Provided by Solid 
   * @link https://docs.solidjs.com/concepts/stores
   */
  setStore: SetStoreFunction<Atoms2Store<T_Atoms>>,

  /** 
   * Does: Solid's `setStore()` + Ace's `save()`
   * @link https://docs.solidjs.com/concepts/stores
   */
  set: SetStoreFunction<Atoms2Store<T_Atoms>>,

  /** Your own index db instance that you can read and write too like a document db :) */
  idb: IndexDB,

  /** Readonly, the init atoms sent to `createStore()` */
  atoms: Readonly<T_Atoms>,

  /** Inspired by AngularJS ngModel, 2 way data binding between a variable in a store and an input, textarea or select */
  refBind: StoreRefBind<T_Atoms>,

  /** 
   * - Does: Solid's `setStore()` + Solid's `reconcile()` + Ace's `save()`
   * - `reconcile()` performs a diff between current array/object state and requested array/object state and then only updates in the array/object/DOM the changed items
   * @link https://docs.solidjs.com/concepts/stores
   */
  sync: StoreSync<T_Atoms>,

  /** Persist `Atom` by `key` */
  save: (key: keyof T_Atoms) => void,
}


export type BaseStoreInternal = {
  dontLoad: Set<string>,
  trackDontLoad: boolean
}


/** Function that is applied to a ref tsx attribute */
export type RefFn = (el: HTMLElement | null) => void


/**
 * - Helps us support two way data binding between a store and form item
 * - Ex: `<input ref={refBind('profile', 'email')} name="email" type="email" />`
 * - TS gets very slow when these higher levels are uncommented b/c it has to start from the highest level first. 4 levels gives us 2 passed the response.data prop which is fair & fast
 * - At runtime we support 7 levels deeps, if you'd like more levels deep @ compile-time uncomment the levels deep you'd love, ts may slow down tho
 */
export type StoreRefBind<T extends Atoms> = {
  // // --- 7 Levels Deep ---
  // <
  //   K1 extends KeyOf<W<Atoms2Store<T>>>,
  //   K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
  //   K3 extends KeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>,
  //   K4 extends KeyOf<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>>,
  //   K5 extends KeyOf<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>>,
  //   K6 extends KeyOf<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>>,
  //   K7 extends MutableKeyOf<W<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>>
  // >(
  //   k1: K1, // Note: Using the raw key type K1 here, not Part<...>, is cleaner for simple pathing
  //   k2: K2,
  //   k3: K3,
  //   k4: K4,
  //   k5: K5,
  //   k6: K6,
  //   k7: K7
  // ): RefFn;

  // // --- 6 Levels Deep ---
  // <
  //   K1 extends KeyOf<W<Atoms2Store<T>>>,
  //   K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
  //   K3 extends KeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>,
  //   K4 extends KeyOf<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>>,
  //   K5 extends KeyOf<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>>,
  //   K6 extends MutableKeyOf<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>>
  // >(
  //   k1: K1, k2: K2, k3: K3, k4: K4, k5: K5, k6: K6
  // ): RefFn;

  // // --- 5 Levels Deep ---
  // <
  //   K1 extends KeyOf<W<Atoms2Store<T>>>,
  //   K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
  //   K3 extends KeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>,
  //   K4 extends KeyOf<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>>,
  //   K5 extends MutableKeyOf<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>>
  // >(
  //   k1: K1, k2: K2, k3: K3, k4: K4, k5: K5
  // ): RefFn;

  // --- 4 Levels Deep ---
  <
    K1 extends KeyOf<W<Atoms2Store<T>>>,
    K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
    K3 extends KeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>,
    K4 extends MutableKeyOf<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>>
  >(
    k1: K1, k2: K2, k3: K3, k4: K4
  ): RefFn;

  // --- 3 Levels Deep ---
  <
    K1 extends KeyOf<W<Atoms2Store<T>>>,
    K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
    K3 extends MutableKeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>
  >(
    k1: K1, k2: K2, k3: K3
  ): RefFn;

  // --- 2 Levels Deep ---
  <
    K1 extends KeyOf<W<Atoms2Store<T>>>,
    K2 extends MutableKeyOf<W<W<Atoms2Store<T>>[K1]>>
  >(
    k1: K1, k2: K2
  ): RefFn;

  // --- 1 Level Deep ---
  <
    K1 extends MutableKeyOf<W<Atoms2Store<T>>>
  >(
    k1: K1
  ): RefFn;
}


type ReconcileOptions = Parameters<typeof solidReconcile>[1]


/**
 * - Helps us call Solid's set() + Solid's reconcile() + Ace's save() all at once
 * - Ex: `sync('finances', 'data', 'categories', [...currentCategories, newCategory])`
 * - TS gets very slow when these higher levels are uncommented b/c it has to start from the highest level first. 4 levels gives us 2 passed the response.data prop which is fair & fast
 * - At runtime we support 7 levels deeps, if you'd like more levels deep @ compile-time uncomment the levels deep you'd love, ts may slow down tho
 */
export type StoreSync<T extends Atoms> = { // 
  // // --- 7 Levels Deep ---
  // <
  //   K1 extends KeyOf<W<Atoms2Store<T>>>,
  //   K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
  //   K3 extends KeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>,
  //   K4 extends KeyOf<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>>,
  //   K5 extends KeyOf<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>>,
  //   K6 extends KeyOf<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>>,
  //   K7 extends MutableKeyOf<W<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>>
  // >(
  //   k1: Part<W<Atoms2Store<T>>, K1>,
  //   k2: Part<W<W<Atoms2Store<T>>[K1]>, K2>,
  //   k3: Part<W<W<W<Atoms2Store<T>>[K1]>[K2]>, K3>,
  //   k4: Part<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>, K4>,
  //   k5: Part<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>, K5>,
  //   k6: Part<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>,
  //   k7: Part<W<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>, K7>,
  //   value: StoreSetter<W<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>[K6]>[K7], [K7, K6, K5, K4, K3, K2, K1]>,
  //   opts?: ReconcileOptions
  // ): void;

  // // --- 6 Levels Deep ---
  // <
  //   K1 extends KeyOf<W<Atoms2Store<T>>>,
  //   K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
  //   K3 extends KeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>,
  //   K4 extends KeyOf<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>>,
  //   K5 extends KeyOf<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>>,
  //   K6 extends MutableKeyOf<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>>
  // >(
  //   k1: Part<W<Atoms2Store<T>>, K1>,
  //   k2: Part<W<W<Atoms2Store<T>>[K1]>, K2>,
  //   k3: Part<W<W<W<Atoms2Store<T>>[K1]>[K2]>, K3>,
  //   k4: Part<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>, K4>,
  //   k5: Part<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>, K5>,
  //   k6: Part<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>, K6>,
  //   value: StoreSetter<W<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5]>[K6], [K6, K5, K4, K3, K2, K1]>,
  //   opts?: ReconcileOptions
  // ): void;

  // // --- 5 Levels Deep ---
  // <
  //   K1 extends KeyOf<W<Atoms2Store<T>>>,
  //   K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
  //   K3 extends KeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>,
  //   K4 extends KeyOf<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>>,
  //   K5 extends MutableKeyOf<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>>
  // >(
  //   k1: Part<W<Atoms2Store<T>>, K1>,
  //   k2: Part<W<W<Atoms2Store<T>>[K1]>, K2>,
  //   k3: Part<W<W<W<Atoms2Store<T>>[K1]>[K2]>, K3>,
  //   k4: Part<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>, K4>,
  //   k5: Part<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>, K5>,
  //   value: StoreSetter<W<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4]>[K5], [K5, K4, K3, K2, K1]>,
  //   opts?: ReconcileOptions
  // ): void;

  // --- 4 Levels Deep ---
  <
    K1 extends KeyOf<W<Atoms2Store<T>>>,
    K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
    K3 extends KeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>,
    K4 extends MutableKeyOf<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>>
  >(
    k1: Part<W<Atoms2Store<T>>, K1>,
    k2: Part<W<W<Atoms2Store<T>>[K1]>, K2>,
    k3: Part<W<W<W<Atoms2Store<T>>[K1]>[K2]>, K3>,
    k4: Part<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>, K4>,
    value: StoreSetter<W<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3]>[K4], [K4, K3, K2, K1]>,
    opts?: ReconcileOptions
  ): void;

  // --- 3 Levels Deep ---
  <
    K1 extends KeyOf<W<Atoms2Store<T>>>,
    K2 extends KeyOf<W<W<Atoms2Store<T>>[K1]>>,
    K3 extends MutableKeyOf<W<W<W<Atoms2Store<T>>[K1]>[K2]>>
  >(
    k1: Part<W<Atoms2Store<T>>, K1>,
    k2: Part<W<W<Atoms2Store<T>>[K1]>, K2>,
    k3: Part<W<W<W<Atoms2Store<T>>[K1]>[K2]>, K3>,
    value: StoreSetter<W<W<W<Atoms2Store<T>>[K1]>[K2]>[K3], [K3, K2, K1]>,
    opts?: ReconcileOptions
  ): void;

  // --- 2 Levels Deep ---
  <
    K1 extends KeyOf<W<Atoms2Store<T>>>,
    K2 extends MutableKeyOf<W<W<Atoms2Store<T>>[K1]>>
  >(
    k1: Part<W<Atoms2Store<T>>, K1>,
    k2: Part<W<W<Atoms2Store<T>>[K1]>, K2>,
    value: StoreSetter<W<W<Atoms2Store<T>>[K1]>[K2], [K2, K1]>,
    opts?: ReconcileOptions
  ): void;

  // --- 1 Level Deep (Base Atom Update) ---
  <
    K1 extends MutableKeyOf<W<Atoms2Store<T>>>
  >(
    k1: Part<W<Atoms2Store<T>>, K1>,
    value: StoreSetter<W<Atoms2Store<T>>[K1], [K1]>,
    opts?: ReconcileOptions
  ): void;
}


/** ❤️ Essential / Core Solid Utilities */

/** Lists all values that should not be proxied (primitives, functions, null, undefined, etc.) */
type NotWrappable = string | number | bigint | symbol | boolean | Function | null | undefined | SolidStore.Unwrappable[keyof SolidStore.Unwrappable]

/** Stands for Wrappable, lets us know if T can be a reactive proxy */
type W<T> = Exclude<T, NotWrappable>

/**
 * - Smart replacement for the standard TypeScript keyof T
 * - Correctly handle arrays and tuples
 */
type KeyOf<T> = number extends keyof T
  ? 0 extends 1 & T
  ? keyof T
  : [T] extends [never]
  ? never
  : [T] extends [readonly unknown[]]
  ? number
  : keyof T
  : keyof T

/** Filters out all readonly properties from T, leaving a type composed only of the mutable properties */
type PickMutable<T> = {
  [K in keyof T as (<U>() => U extends {
    [V in K]: T[V];
  } ? 1 : 2) extends <U>() => U extends {
    -readonly [V in K]: T[V];
  } ? 1 : 2 ? K : never]: T[K];
}

/** Determine the union of all keys in a type T that are safe to be written to */
type MutableKeyOf<T> = KeyOf<T> & keyof PickMutable<T>

/**
 * - Designed to provide a "partial" version of an object or array
 * - Lets us update a structure by supplying only a subset of its properties without causing a TS error
 * - Main function is to mimic Partial<T> for standard objects AND to provide special, robust handling for arrays and tuples
 */
type CustomPartial<T> = T extends readonly unknown[] ? "0" extends keyof T ? {
  [K in Extract<keyof T, `${number}`>]?: T[K];
} : {
  [x: number]: T[number];
} : Partial<T>

/**
 * - `item: T`: The current element being processed in the array
 * - `index`: number: The index of the current element in the array
 * - Allows a filter function in the path, rather than a fixed key or index
 */
type ArrayFilterFn<T> = (item: T, index: number) => boolean

/**
 * - Lets us update a subset of array elements without using a filter function or explicitly listing every index
 * - `from`: The starting index (inclusive) of the range. If omitted, the range starts at index 0
 * - `to`: The ending index (exclusive) of the range. If omitted, the range ends at the last element
 * - `by`: The step size for iteration (e.g., updating every 2nd or 3rd element). If omitted, the step size is 1
 */
type StorePathRange = {
  from?: number,
  to?: number,
  by?: number,
}

/**
 * - Defines all the valid ways a single segment of a deep path (k1, k2, k3, etc.) can be expressed
 * - What allows a single argument to accept a string, an array of strings, a function, or an object
 */
type Part<T, K extends KeyOf<T> = KeyOf<T>> =
  | K
  | ([K] extends [never] ? never : readonly K[])
  | ([T] extends [readonly unknown[]] ? ArrayFilterFn<T[number]> | StorePathRange : never)

/**
 * - Defines all the valid input forms that the final value argument can take when updating a property in a SolidJS store (
 * - Ex: The last argument @ `sync()`
 */
type StoreSetter<T, U extends PropertyKey[] = []> =
  | T
  | CustomPartial<T>
  | ((prevState: T, traversed: U) => T | CustomPartial<T>)
