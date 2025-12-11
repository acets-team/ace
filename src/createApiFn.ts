// import { isServer } from 'solid-js/web'
// import type { API } from './fundamentals/api'
// import { parseResponse } from './parseResponse'
// import { scope } from './fundamentals/scopeComponent'
// import { showErrorToast } from './fundamentals/toast'
// import { createAceKey } from './fundamentals/createAceKey'
// import { regexApiNames } from './fundamentals/regexApiNames'
// import { query, createAsync, redirect } from '@solidjs/router'
// import { AceError, type AceErrorProps } from './fundamentals/aceError'
// import { apiMethods, goHeaderName, queryType } from './fundamentals/vars'
// import type { ApiFnProps, Api2Function, Api2Response, RegexMapEntry, ApiName2Api, ApiName2ResData, Api2Data } from './fundamentals/types'
// import { Accessor, createSignal, Signal } from 'solid-js'



// /**
//  * Create an API Function
//  * @param apiName - API `name` as defined @ `new API()`
//  */
// export function createApiFn<const T_Name extends keyof typeof regexApiNames>(apiName: T_Name): Api2Function<ApiName2Api<T_Name>> {
//   return ((props?: ApiFnProps<ApiName2Api<T_Name>>) => { // when someone calls an API function this is what runs
//     const apiFn = new ApiFn(apiName, props)
//     return apiFn.main()
//   }) as unknown as Api2Function<ApiName2Api<T_Name>>
// }


// class ApiFn<T_API extends API<any, any, any, any, any>> {
//   apiName: string
//   onResultHappened = false
//   regexMapEntry: RegexMapEntry<'api', any>
//   signal?: Signal<undefined | Api2Data<T_API>>

//   bitKey?: string
//   props?: ApiFnProps<T_API>
//   result?: { error?: any, response?: any, data?: any }

//   constructor(apiName: string, props?: ApiFnProps<T_API>) {
//     const entry = regexApiNames[apiName as keyof typeof regexApiNames]
//     if (!entry) throw new Error('!entry')

//     this.apiName = apiName
//     this.props = props
//     this.regexMapEntry = entry
//     if (this.props?.queryType !== 'seo' && this.props?.queryType !== 'stream') this.signal = createSignal<Api2Data<T_API>>()
//   }


//   static get defaultCreateAsyncOptions() {
//     return { deferStream: false }
//   }


//   /** public static void main ❤️ */
//   main() {
//     try {
//       if (this.props?.queryType === queryType.keys.maySetCookies && isServer) return // skip maySetCookies on BE

//       this.initLoading()

//       let res

//       if (queryType.has(this.props?.queryType)) res = this.onQuery() // IF Solid's query() requested => use it
//       else this.onNoQuery() // call API w/o Solid's query()

//       if (res) return res
//       if (this.signal) return this.signal[0]

//       throw new Error('tbd')
//     } catch (err) {
//       this.onError(err)
//     }
//   }


//   initLoading() {
//     if (!isServer) {
//       if (this.props?.onLoadChange) this.props.onLoadChange(true) // call options.onLoadChange()

//       if (this.props?.bitKey) this.bitKey = createAceKey(this.props.bitKey) // IF bitkey defined THEN use it
//       else this.bitKey = this.apiName // IF no bitKey set THEN default bitkey to apiName

//       if (this.props?.queryType !== 'maySetCookies') scope.bits.set(this.bitKey, true) // set loading bit to true
//       else {
//         setTimeout(() => { // 🚨 IF we start bitKey immediately (no setTimeout) AND queryType is maySetCookies THEN hydration error MAYBE B/C on page init they'll be a different DOM then was rendered on the server 🤷‍♀️
//           if (this.bitKey && !this.onResultHappened) scope.bits.set(this.bitKey, true) // skip if onResultHappened b/c then the bit is already false
//         })
//       }
//     }
//   }


//   /** When we're not using Solid's `query()` */
//   async onNoQuery() {
//     this.result = { response: await this.callApi() }
//     await this.onResult()
//   }


//   /** ensures we call an API the correct way if @ FE or BE */
//   async callApi() {
//     try {
//       if (isServer) return await this.onBE()
//       return await this.onFE()
//     } catch (err) {
//       return this.onError(err)
//     }
//   }


//   /** Opted into using Solid's `query()` by setting a `options.queryType` */
//   onQuery() {
//     const queryKey = createAceKey(this.props?.queryKey ?? this.apiName)

//     const resQuery = query(this.innerQuery.bind(this), queryKey) // bind 'this' to innerQuery to preserve the ApiFn instance context

//     const createAsyncOptions = { ...ApiFn.defaultCreateAsyncOptions, ...this.props?.createAsyncOptions }

//     if (this.props?.queryType === 'seo' || this.props?.queryType === 'stream') return createAsync(async () => this.parseQuery(resQuery), createAsyncOptions)
//     else this.parseQuery(resQuery) // createAsync() outside of 'seo' OR 'stream' creates hydration error or data leak error, example: computations created outside a `createRoot` or `render` will never be disposed
//   }


//   /** Provided to Solid's `query()` */
//   async innerQuery() {
//     const res = await this.callApi()

//     if (res instanceof Response && isServer) { // dip out early on redirect
//       const goUrl = res.headers.get(goHeaderName)
//       if (goUrl) throw redirect(goUrl)

//       if (this.props?.queryType === 'seo' || this.props?.queryType === 'stream') { // returning a Response during stream can lead to this error "Cannot set headers after they are sent to the client" b/c the API Response headers may get attempted to be added to the Page headers, returning an {} stops this 
//         return await parseResponse<Api2Response<T_API>>(res)
//       }
//     }

//     return res
//   }


//   async parseQuery(resQuery: () => Promise<any>) {
//     const res = await resQuery()

//     this.result = {}

//     if (res.error) this.result.error = res.error
//     else if (res.data) this.result.data = res.data
//     else this.result.response = res

//     return await this.onResult()
//   }


//   async onResult() {
//     if (!this.result) throw new Error('!this.result')
//     if (isServer) return this.result.data // callbacks below server side lead to hydration issues so stop the server flow here

//     this.onResultHappened = true
//     const parsed = await parseResponse<Api2Response<T_API>>(this.result.response)

//     if (parsed && typeof parsed === 'object') {
//       if (parsed.error) this.result.error = parsed.error
//       if (parsed.data) this.result.data = parsed.data
//     }

//     if (this.result.error) this.onError(this.result.error)
//     else {
//       if (this.props?.onResponse) this.props.onResponse(this.result.response)
//       if (this.props?.onSuccess) this.props.onSuccess(this.result.data)
//     }

//     if (this.signal) this.signal[1](this.result.data)

//     if (this.bitKey) scope.bits.set(this.bitKey, false)

//     if (this.props?.onLoadChange) this.props.onLoadChange(false)

//     return this.result.data // for createAsync() response
//   }


//   async onError(err: unknown) {
//     if (this.props?.onError) this.props.onError(err as any)
//     else if (!isServer) this.defaultOnError(err as any)
//   }


//   async onFE() {
//     const { scope } = await import('./fundamentals/scopeComponent')

//     const o = { ...this.props, manualBitOff: true }

//     switch (this.regexMapEntry.method) {
//       case apiMethods.keys.GET: return scope.GET(this.regexMapEntry.path as never, o)
//       case apiMethods.keys.POST: return scope.POST(this.regexMapEntry.path as never, o)
//       case apiMethods.keys.PUT: return scope.PUT(this.regexMapEntry.path as never, o)
//       case apiMethods.keys.DELETE: return scope.DELETE(this.regexMapEntry.path as never, o)
//       default: throw new Error(`"${this.regexMapEntry.method}" is not a valid method @ handleFE()`)
//     }
//   }


//   async onBE() {
//     const [api, { callAPIResolve }] = await Promise.all([
//       this.regexMapEntry.loader(),
//       import('./callAPIResolve'),
//     ])

//     const o = this.props ?? ({} as ApiFnProps<T_API>)
//     return await callAPIResolve(api, o.pathParams ?? {}, o.searchParams ?? {})
//   }


//   defaultOnError(error?: AceError | AceErrorProps) {
//     if (!isServer && error?.message) showErrorToast(error.message)
//   }
// }
