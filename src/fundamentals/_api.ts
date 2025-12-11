// /**
//  * 🧚‍♀️ How to access:
//  *     - import { API } from '@ace/api'
//  *     - import type { APIResFn, APIValues, APIStorage } from '@ace/api'
//  */



// import type { ScopeBE } from './scopeBE'
// import type { AceResponse } from './aceResponse'
// import { pathnameToPattern } from './pathnameToPattern'
// import type { B4, Parser, MergeLocals, BaseEventLocals, BaseApiReq, BaseApiResponseData, Parser2Req, AceResponse2Data } from './types'



// /** 
//  * - Create an API endpoint
//  * - When defining the API you may give it a path that can be called w/in or w/out the application & a function name
//  * - When calling via function name from `FE` a fetch is done and when calling from `BE` the `res()` function is called directly
//  */
// export class API<
//   T_Req extends BaseApiReq = {},
//   T_Res_Data extends BaseApiResponseData = undefined,
//   T_Locals extends BaseEventLocals = {}
// > {
//   /** Typed loosely so we may freely mutate it at runtime */
//   #storage: APIStorage


//   constructor(path: string, fnName: string) {
//     this.#storage = { path, pattern: pathnameToPattern(path) }
//     this.values.fn = fnName
//   }


//   /** Public .values getter that casts #storage into APIValues<…>, giving us perfect intelliSense */
//   public get values(): APIValues<T_Req, T_Res_Data, T_Locals> {
//     return this.#storage as any
//   }


//   req<T_Parser extends Parser<any>>(parser: T_Parser): API<Parser2Req<T_Parser>, T_Res_Data, T_Locals> {
//     this.#storage.requestParser = parser
//     return this as any
//   }


//   /** 
//    * ### Set async functions to run before route/api boots
//    * - IF `b4()` return is truthy => returned value is sent to the client & route handler is not processed
//    * - 🚨 If returning the response must be a `Response` object b/c this is what is given to the client
//    * @example
//     ```ts
//     export const GET = new API('/api/character/:element', 'apiCharacter')
//       .b4([sessionB4, adminB4])
//     ```
//    * @param b4 - Array of functions to happen before `.res()`
//    */
//   b4<const T_B4_Functions extends B4<any>[]>(b4: T_B4_Functions): API<T_Req, T_Res_Data, MergeLocals<T_B4_Functions>> {
//     this.#storage.b4 = b4
//     return this as any
//   }


//   res<T_Res_Fn extends APIResFn<T_Req, any, T_Locals>>(res: T_Res_Fn): API<T_Req, AceResponse2Data<Awaited<ReturnType<T_Res_Fn>>>, T_Locals> {
//     this.#storage.res = res
//     return this as any
//   }
// }



// export type APIResFn<
//   T_Req extends BaseApiReq,
//   T_Res_Data extends BaseApiResponseData,
//   T_Locals extends BaseEventLocals = {}
//   > = (scope: ScopeBE<T_Req, T_Locals>) => AceResponse<T_Res_Data> | Promise<AceResponse<T_Res_Data>>



// export type APIValues<T_Req extends BaseApiReq = {}, T_Res_Data extends BaseApiResponseData = undefined, T_Locals extends BaseEventLocals = {}> = {
//   path: string
//   pattern: RegExp
//   fn?: string
//   b4?: B4<T_Locals>[]
//   requestParser?: Parser<T_Req>
//   res?: APIResFn<T_Req, T_Res_Data, T_Locals>
// }



// export type APIStorage = {
//   path: string
//   pattern: RegExp
//   fn?: string
//   b4?: B4<any>[]
//   requestParser?: Parser<any>
//   res?: APIResFn<any,any,any>
// }
