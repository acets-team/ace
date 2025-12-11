// import { isServer } from 'solid-js/web'
// import { Load } from './fundamentals/load'
// import { Async } from './fundamentals/async'
// import type { API } from './fundamentals/api'
// import { Stream } from './fundamentals/stream'
// import { apiMethods } from './fundamentals/vars'
// import { parseError } from './fundamentals/parseError'
// import { regexApiNames } from './fundamentals/regexApiNames'
// import type { RegexMapEntry, ApiName2ResData, ApiNames, Atoms2Keys, Atoms, ApiName2Req, StreamPropsOrVoid, ApiName2Api, FetchFn, ApiName2Response, LoadPropsOrVoid, BaseStreamProps, BaseLoadProps, BaseAsyncProps, AsyncPropsOrVoid, ApiName2Either } from './fundamentals/types'



// /**
//  * Create an API Function
//  * @param apiName - API `name` as defined @ `new API()`
//  */
// export function createApiObj<const T_Name extends keyof typeof regexApiNames>(apiName: T_Name) {
//   return new ApiObj(apiName)
// }


// class ApiObj<T_Name extends ApiNames, T_Atoms extends Atoms, T_Atoms_Key extends Atoms2Keys<T_Atoms>> {
//   private readonly name: T_Name
//   readonly typeApi!: ApiName2Api<T_Name>
//   readonly typeReq!: ApiName2Req<T_Name>
//   readonly typeRes!: ApiName2Response<T_Name>
//   readonly typeResData!: ApiName2ResData<T_Name>
//   readonly typeResEither!: ApiName2Either<T_Name>
//   private readonly regexMapEntry: RegexMapEntry<'api', API<any, any>>
//   private asyncProps?: BaseAsyncProps<typeof this.typeReq, typeof this.typeResData>
//   private loadProps?: BaseLoadProps<typeof this.typeReq, typeof this.typeResData, T_Atoms, T_Atoms_Key>
//   private streamProps?: BaseStreamProps<typeof this.typeReq, typeof this.typeResData, T_Atoms, T_Atoms_Key>



//   constructor(name: T_Name) {
//     this.name = name
//     this.regexMapEntry = regexApiNames[name]
//   }



//   stream(...args: StreamPropsOrVoid<typeof this.typeReq, typeof this.typeResData, T_Atoms, T_Atoms_Key>) {
//     const [props] = args

//     this.streamProps = {
//       ...props,
//       fn: this.createFn(),
//       queryKey: props?.queryKey || this.name,
//     }
  
//     return new Stream(this.streamProps)
//   }



//   load(...args: LoadPropsOrVoid<typeof this.typeReq, typeof this.typeResData, T_Atoms, T_Atoms_Key>) {
//     const [props] = args

//     this.loadProps = {
//       ...props,
//       fn: this.createFn(),
//       queryKey: props?.queryKey || this.name,
//     }

//     return new Load(this.loadProps);
//   }



//   async(...args: AsyncPropsOrVoid<typeof this.typeReq, typeof this.typeResData>) {
//     const [props] = args;

//     this.asyncProps = {
//       ...props,
//       fn: this.createFn(),
//     }

//     return new Async(this.asyncProps);
//   }



//   private createFn() {
//     const fn = async () => {
//       try {
//         if (isServer) return await this.onBE()
//         return await this.onFE()
//       } catch (e) {
//         return parseError(e)
//       }
//     }

//     return fn as unknown as FetchFn<typeof this.typeReq, typeof this.typeResData, typeof this.typeRes>
//   }



//   private get req() {
//     return this.streamProps?.req?.() ?? this.loadProps?.req?.() ?? this.asyncProps?.req?.() ?? {}
//   }



//   private async onBE() {
//     const [api, { callAPIResolve }] = await Promise.all([
//       this.regexMapEntry.loader(),
//       import('./callAPIResolve'),
//     ])

//     return await callAPIResolve(api, this.req)
//   }



//   private async onFE() {
//     const { scope } = await import('./fundamentals/scopeComponent');

//     const o = {
//       options: { req: this.req },
//       path: this.regexMapEntry.path,
//     }

//     switch (this.regexMapEntry.method) {
//       case apiMethods.keys.GET: return scope.GET(this.regexMapEntry.path as never, o as any)
//       case apiMethods.keys.POST: return scope.POST(this.regexMapEntry.path as never, o as any)
//       case apiMethods.keys.PUT: return scope.PUT(this.regexMapEntry.path as never, o as any)
//       case apiMethods.keys.DELETE: return scope.DELETE(this.regexMapEntry.path as never, o as any)
//       default: throw new Error(`"${this.regexMapEntry.method}" is not a valid method`)
//     }
//   }
// }
