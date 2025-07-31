import type { API } from './fundamentals/api'
import { validateBody } from './validateBody'
import type { RequestEvent } from 'solid-js/web'
import { validateParams } from './validateParams'
import { ScopeAPI } from './fundamentals/scopeAPI'
import { API2Response } from './fundamentals/types'
import { GoResponse } from './fundamentals/goResponse'



export async function callAPIResolve(event: RequestEvent, api: API, rawPathParams: any, rawSearchParams: any, source: 'onAPIEvent' | 'createAPIFunction') {
  const ctx = await CallAPIResolveContext.Create(event, api, rawPathParams, rawSearchParams, source)

  const b4Response = await ctx.getB4Response()
  if (b4Response) return b4Response

  return ctx.getResolveResponse()
}



export class CallAPIResolveContext {
  api: API
  pathParams: any
  searchParams: any
  event: RequestEvent
  body: Record<string, unknown>
  scope: ScopeAPI<any, any, {}>



  static async Create(event: RequestEvent, api: API, rawPathParams: any, rawSearchParams: any, source: 'onAPIEvent' | 'createAPIFunction') {
    const parsedParams = validateParams({
      rawParams: rawPathParams ?? {},
      rawSearch: rawSearchParams ?? {},
      pathParamsParser: api.values.pathParamsParser,
      searchParamsParser: api.values.searchParamsParser
    })

    const body = (api.values.bodyParser) ? await validateBody({api: api, event}) : {}

    const scope = source === 'onAPIEvent'
      ? ScopeAPI.CreateFromHttp(event, parsedParams.pathParams, parsedParams.searchParams, body)
      : ScopeAPI.CreateFromFn(event, parsedParams.pathParams, parsedParams.searchParams, body)

    return new CallAPIResolveContext(event, api, body, scope, parsedParams.pathParams, parsedParams.searchParams)
  }



  private constructor(event: RequestEvent, api: API, body: Record<string, unknown>, scope: ScopeAPI<any, any, {}>, pathParams: any, searchParams: any) {
    this.api = api
    this.body = body
    this.scope = scope
    this.event = event
    this.pathParams = pathParams
    this.searchParams = searchParams
  }



  async getB4Response(): Promise<Response | undefined> {
    if (this.api.values.b4 && this.api.values.b4.length) {  
      for (const fn of this.api.values.b4) {
        const b4Response = await fn({ event: this.event, pathParams: this.pathParams, searchParams: this.searchParams, body: this.body })
    
        if (b4Response) {
          if (!(b4Response instanceof Response)) throw new Error('b4 function must return a Response object')
          else {
            const clonedResponse = b4Response.clone()
            const jsonResponse = await clonedResponse.json()
    
            if (jsonResponse.go) throw new GoResponse(jsonResponse.go)
            else return b4Response
          }
        }
      }
    }
  }



  async getResolveResponse<T_API extends API<any,any,any,any, any>>(): Promise<Response | undefined> {
    if (typeof this.api.values.resolve !== 'function') throw new Error("typeof api.values.resolve === 'function'")

    const originalResponse = await this.api.values.resolve(this.scope)

    if (!(originalResponse instanceof Response)) throw new Error(`Error w/ API ${this.api.values.fn} aka ${this.api.values.path} -- API\'s must return a Response, please return from your api w/ respond(), scope.success(), scope.Success(), scope.error(), scope.Error(), scope.go(), scope.Go(), or throw a new Error() or throw a new AceError(). the current response is not an instanceOf Response, current: ${originalResponse}`)

    const inferResponse: API2Response<T_API> = (await originalResponse.json())

    if (inferResponse.go) throw new GoResponse(inferResponse.go)

    return new Response(JSON.stringify(inferResponse), {
      status: originalResponse.status,
      headers: new Headers(originalResponse.headers)
    })
  }
}
