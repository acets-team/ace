import { ScopeBE } from './fundamentals/scopeBE'
import type { ApiInfo } from './fundamentals/api'
import { parseError } from './fundamentals/parseError'
import { createAceResponse, type AceResponse } from './fundamentals/aceResponse'
import type { AceResponse2Data, B4, BaseApiReq, BaseEventLocals } from './fundamentals/types'


export async function callApi<
  T_Req extends BaseApiReq,
  T_Locals extends BaseEventLocals,
  T_Res_Fn extends (scope: ScopeBE<any, any>) => Promise<AceResponse<any>>
>(info: ApiInfo, req: T_Req, resFn: T_Res_Fn, b4?: B4<any, any>[]) {
  try {
    if (!info) return createAceResponse({ error: { message: 'Not Found' } }, { status: 404 })

    info.parser?.(req)

    const scope = new ScopeBE(req) as ScopeBE<T_Req, T_Locals>

    if (b4) { // call middleware sequentially
      for (const b4Fn of b4) {
        // Use 'as any' since the b4Fn expects a generic T_Locals on its scope, 
        // but we pass the *final* scope instance.
        const result = await b4Fn(scope as any);
        if (result instanceof Response) {
          return result as any;
        }
      }
    }

    return resFn(scope) as Promise<AceResponse<AceResponse2Data<Awaited<ReturnType<T_Res_Fn>>>>> // call res
  } catch (e) {
    return createAceResponse<AceResponse2Data<Awaited<ReturnType<T_Res_Fn>>>>(parseError(e));
  }
}


// export async function callAPIResolve(res: TreeApiSearchResult, req: BaseApiReq): Promise<Response | undefined> {
//   const ctx = await CallAPIResolveContext.Create(res, req)

//   const b4Response = await ctx.getB4Response()
//   if (b4Response) return b4Response

//   return await ctx.getResolveResponse()
// }



// export class CallAPIResolveContext {
//   info: ApiInfo
//   req: BaseApiReq
//   ScopeBE: ScopeBE<any, any>
//   resolver: ApiResolverFn<any, any, any>



//   static async Create(res: TreeApiSearchResult, req: BaseApiReq) {
//     const info = await res.mapEntry.info()
//     if (!info) throw new Error('!info')

//     const resolver = await res.mapEntry.resolver()
//     if (!resolver) throw new Error('!resolver')

//     info.parser?.(req)

//     const scope = new ScopeBE(req)

//     return new CallAPIResolveContext(info, resolver, req, scope)
//   }



//   private constructor(info: ApiInfo, resolver: ApiResolverFn<any, any, any>,  req: BaseApiReq, scope: ScopeBE<any, any>) {
//     this.req = req
//     this.info = info
//     this.ScopeBE = scope
//     this.resolver = resolver
//   }



//   async getB4Response(): Promise<Response | undefined> {
//     if (this.api.values.b4 && this.api.values.b4.length) {  
//       const scopeB4 = new ScopeBE(this.req)

//       for (const fn of this.api.values.b4) {
//         const b4Response = await fn(scopeB4)

//         if (b4Response) {
//           if (b4Response instanceof Response) return b4Response
//           else throw new Error('b4 function must return a Response object')
//         }
//       }
//     }
//   }



//   async getResolveResponse(): Promise<Response | undefined>{
//     if (typeof this.api.values.res !== 'function') throw new Error("typeof api.values.resolve === 'function'")

//     const response = await this.api.values.res(this.ScopeBE)

//     if (response instanceof Response) return response
//     else throw new Error(`Error w/ API ${this.api.values.fn} aka ${this.api.values.path} -- API\'s must return a Response, please return from your api w/ or throw a new Error()`, { cause: { response, apiPath: this.api.values.path }})
//   }
// }
