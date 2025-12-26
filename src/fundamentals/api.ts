import { mapApis } from './mapApis'
import { ScopeBE } from './scopeBE'
import { isServer } from 'solid-js/web'
import { parseError } from './parseError'
import type { ScopeComponent } from './scopeComponent'
import { createAceResponse, AceResponse } from './aceResponse'
import type { AceResponse2Data, AceResData, Api, B4, BaseApiReq, BaseEventLocals, ApiInfo2Req, MergeLocals, Parser, ApiResolver2ResData, ApiResolverFn, MapApis, AceResEither, MapApisEntry, BaseRouteReq, ApiReq2FormData } from './types'



export type { ApiInfo2Req }



export function createApi<
  T_Info extends ApiInfo,
  T_Req extends ApiInfo2Req<T_Info>,
  T_Resolver extends ApiResolverFn<T_Req, any> = ApiResolverFn<T_Req, any>,
  T_Res_Data extends ApiResolver2ResData<T_Resolver> = ApiResolver2ResData<T_Resolver>
>(apiName: string, info: T_Info, resolver: T_Resolver): Api<T_Resolver, T_Info> {
  return (async (req: T_Req, scope?: ScopeComponent): Promise<AceResponse<T_Res_Data> | AceResEither<T_Res_Data>> => {
    if (!req) req = {} as T_Req
    (req as any).__apiName = apiName

    return _callApi<T_Req, T_Res_Data>({
      req,
      info,
      resolver,
      scope,
    })
  }) as Api<T_Resolver, T_Info>
}



async function _callApi<T_Req extends BaseApiReq, T_Res_Data extends AceResData>(props: {
  req: T_Req,
  info: ApiInfo,
  resolver: ApiResolverFn<T_Req, T_Res_Data>,
  scope?: ScopeComponent
}) {
  try {
    if (isServer) return props.resolver(props.req)
    else {
      if (!props.scope) throw new Error('!props.scope')
      
       if (!props.req) props.req = {} as T_Req

      const __apiName = props.req['__apiName' as keyof BaseApiReq] as unknown as keyof MapApis // from createApi()

      const entry = mapApis[__apiName]
      if (!entry) throw new Error(`Please run "ace build local" to build your api's`)

      const body = props.req.formData instanceof FormData 
        ? props.req.formData
        : props.req.file instanceof File
        ? props.req.file
        : props.req.body
        ? JSON.stringify(props.req.body)
        : null

      const headers = props.req.formData instanceof FormData || props.req.file instanceof File
        ? (props.req.requestInit?.headers || undefined)
        : { 'content-type': 'application/json', ...props.req.requestInit?.headers }

      const requestInit: RequestInit = {
        body,
        headers,
        method: props.info.method,
        ...props.req.requestInit
      }

      if (props.req.file instanceof File) requestInit.duplex = 'half'

      return await props.scope.fetch<T_Res_Data>({
        url: entry.buildUrl(props.req),
        requestInit
      })
    }
  } catch (e) {
    return parseError(e)
  }
}



export class ApiResolver<
  T_Req extends BaseApiReq = BaseApiReq,
  T_Locals extends BaseEventLocals = {},
  T_Res_Data extends AceResData = AceResData
> {
  // runtime storage
  #req: T_Req
  #b4: B4<any, any>[] = []


  /** initializes the resolver chain, inferring T_Req from the request object */
  constructor(req: T_Req) {
    this.#req = req
  }


  b4<const T_B4_Array extends readonly B4<any, any>[]>(
    b4Fns: T_B4_Array
  ): ApiResolver<T_Req, MergeLocals<T_B4_Array>, T_Res_Data> {
    this.#b4 = b4Fns as unknown as B4<any, any>[] // set runtime storage
    return this as unknown as ApiResolver<T_Req, MergeLocals<T_B4_Array>, T_Res_Data> // set locals types
  }


  res<T_Res_Fn extends (scope: ScopeBE<T_Req, T_Locals>) => Promise<AceResponse<any>>>(
    resFn: T_Res_Fn
  ): Promise<AceResponse<AceResponse2Data<Awaited<ReturnType<T_Res_Fn>>>>> {
    return this.callResFn(resFn) // call res fn
  }


  private async callResFn<
    T_Res_Fn extends (scope: ScopeBE<T_Req, T_Locals>) => Promise<AceResponse<any>>
  >(resFn: T_Res_Fn): Promise<AceResponse<AceResponse2Data<Awaited<ReturnType<T_Res_Fn>>>>> {
    try {
      const __mapEntry = this.#req['__mapEntry' as keyof BaseApiReq] as MapApisEntry<any, any, any> // from callApi()
      const __apiName = this.#req['__apiName' as keyof BaseApiReq] as unknown as keyof MapApis // from createApi()
      const __readableStream = this.#req['__readableStream' as keyof BaseApiReq] as ReadableStream<Uint8Array> // from callApi()

      const entry = __mapEntry || mapApis[__apiName]
      if (!entry) throw new Error(`Please run "ace build local" to build your api's`)

      const info = await entry.info()
      if (!info) throw new Error(`Please run "ace build local" to build your api's`)

      const { ScopeBE } = await import('./scopeBE')

      const scope = new ScopeBE(this.#req) as ScopeBE<T_Req, T_Locals>

      const parsed = info.parser?.({
        body: this.#req.body,
        headers: scope.requestHeaders,
        pathParams: this.#req.pathParams,
        searchParams: this.#req.searchParams,
        formData: info.parser?.__formDataSchema ? this.#req.body : undefined
      })

      if (parsed?.body) scope.body = parsed.body
      if (parsed?.formData) scope.formData = parsed.formData
      if (parsed?.pathParams) scope.pathParams = parsed.pathParams
      if (__readableStream) scope.readableStream = __readableStream
      if (parsed?.searchParams) scope.searchParams = parsed.searchParams


      for (const b4Fn of this.#b4) { // call middleware sequentially
        const result = await b4Fn(scope)

        if (result instanceof Response) {
          return result
        }
      }

      const response = await resFn(scope) // call res fn

      if (response instanceof Response) return response
      else throw new Error(`Error w/ API "${info.path}" -- API\'s must return a Response`, { cause: { response, path: info.path } })
    } catch (e) {
      return createAceResponse<AceResponse2Data<Awaited<ReturnType<T_Res_Fn>>>>(parseError(e), {status: 400})
    }
  }
}



/**
 * - API route info
 * - Aligns w/ a `use server` function
 */
export class ApiInfo<T_Parser extends Parser<any> = any> {
  public readonly path: string
  public readonly method: string
  public readonly parser?: T_Parser
  public readonly readableStream?: boolean

  constructor(info: ApiInfoInterface<T_Parser>) {
    this.path = info.path
    this.method = info.method
    this.parser = info.parser
    this.readableStream = info.readableStream
  }
}

export type ApiInfoInterface<T_Parser extends Parser<any> = any> = {
  path: string,
  method: string,
  parser?: T_Parser,
  readableStream?: boolean,
}
