import type { API } from './fundamentals/api'
import { validateBody } from './validateBody'
import { goHeader } from './fundamentals/vars'
import { ScopeBE } from './fundamentals/scopeBE'
import { validateParams } from './validateParams'
import { getRequestEvent } from './fundamentals/getRequestEvent'
import type { Api2Response, ApiBody, UrlPathParams, UrlSearchParams } from './fundamentals/types'



export async function callAPIResolve(api: API, rawPathParams: any, rawSearchParams: any) {
  const ctx = await CallAPIResolveContext.Create(api, rawPathParams, rawSearchParams)

  const b4Response = await ctx.getB4Response()
  if (b4Response) return b4Response

  return await ctx.getResolveResponse()
}



export class CallAPIResolveContext {
  api: API
  pathParams: UrlPathParams
  searchParams: UrlSearchParams
  body: Record<string, unknown>
  scopeAPI: ScopeBE<any, any, {}, any>



  static async Create(api: API, rawPathParams: any, rawSearchParams: any) {
    const parsedParams = validateParams({
      rawParams: rawPathParams ?? {},
      rawSearch: rawSearchParams ?? {},
      pathParamsParser: api.values.pathParamsParser,
      searchParamsParser: api.values.searchParamsParser
    })

    const body = (api.values.bodyParser) ? await validateBody({api, event: getRequestEvent()}) : {}

    const scope = new ScopeBE(parsedParams.pathParams, parsedParams.searchParams, body)

    return new CallAPIResolveContext(api, body, scope, parsedParams.pathParams, parsedParams.searchParams)
  }



  private constructor(api: API, body: ApiBody, scope: ScopeBE<any, any, {}, any>, pathParams: UrlPathParams, searchParams: UrlSearchParams) {
    this.api = api
    this.body = body
    this.scopeAPI = scope
    this.pathParams = pathParams
    this.searchParams = searchParams
  }



  async getB4Response(): Promise<Response | undefined> {
    if (this.api.values.b4 && this.api.values.b4.length) {  
      const scopeB4 = new ScopeBE(this.pathParams, this.searchParams, this.body)

      for (const fn of this.api.values.b4) {
        const b4Response = await fn(scopeB4)

        if (b4Response) {
          if (b4Response instanceof Response) return b4Response
          else throw new Error('b4 function must return a Response object')
        }
      }
    }
  }



  async getResolveResponse<T_API extends API<any,any,any,any, any>>(): Promise<Response | undefined> {
    if (typeof this.api.values.resolve !== 'function') throw new Error("typeof api.values.resolve === 'function'")

    const originalResponse = await this.api.values.resolve(this.scopeAPI)

    if (!(originalResponse instanceof Response)) throw new Error(`Error w/ API ${this.api.values.fn} aka ${this.api.values.path} -- API\'s must return a Response, please return from your api w/ respond(), scope.success(), scope.Success(), scope.error(), scope.Error(), scope.go(), scope.Go(), or throw a new Error() or throw a new AceError(). the current response is not an instanceOf Response, current: ${originalResponse}`)

    const redirectUrl = originalResponse.headers.get(goHeader)

    if (redirectUrl) return originalResponse
    else {
      const inferResponse: Api2Response<T_API> = (await originalResponse.json())

      return new Response(JSON.stringify(inferResponse), {
        status: originalResponse.status,
        headers: new Headers(originalResponse.headers)
      })
    }
  }
}
