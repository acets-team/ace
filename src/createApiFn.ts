import { isServer } from 'solid-js/web'
import type { API } from './fundamentals/api'
import { parseResponse } from './parseResponse'
import { scope } from './fundamentals/scopeComponent'
import { showErrorToast } from './fundamentals/toast'
import { createAceKey } from './fundamentals/createAceKey'
import { regexApiNames } from './fundamentals/regexApiNames'
import { query, createAsync, redirect } from '@solidjs/router'
import { AceError, type AceErrorProps } from './fundamentals/aceError'
import { apiMethods, goHeaderName, queryType } from './fundamentals/vars'
import type { ApiFnProps, Api2Function, Api2Response, RegexMapEntry, ApiName2Api } from './fundamentals/types'



/**
 * Create an API Function
 * @param apiName - API `name` as defined @ `new API()`
 */
export function createApiFn<const T_Name extends keyof typeof regexApiNames>(apiName: T_Name): Api2Function<ApiName2Api<T_Name>> {
  return ((props?: ApiFnProps<ApiName2Api<T_Name>>) => { // when someone calls an API function this is what runs
    const apiFn = new ApiFn(apiName, props) // using a class helps us not have to pass a bunch of variables between functions
    apiFn.main()
  }) as unknown as Api2Function<ApiName2Api<T_Name>>
}



class ApiFn<T_API extends API<any, any, any, any, any>> {
  bitKey?: string
  apiName: string
  onResultHappened = false
  props?: ApiFnProps<T_API>
  regexMapEntry: RegexMapEntry<'api', any>
  result?: { error?: any, query?: any, data?: any }


  constructor(apiName: string, options?: ApiFnProps<T_API>) {
    const entry = regexApiNames[apiName as keyof typeof regexApiNames]
    if (!entry) throw new Error('!entry')

    this.apiName = apiName
    this.props = options
    this.regexMapEntry = entry
  }


  static get defaultCreateAsyncOptions() {
    return { deferStream: true }
  }


  /** public static void main ❤️ */
  main() {
    try {
      if (this.props?.queryType === queryType.keys.maySetCookies && isServer) return // skip maySetCookies on BE

      this.initLoading()

      if (queryType.has(this.props?.queryType)) this.onQuery() // IF Solid's query() requested => use it
      else this.onNoQuery() // call API w/o Solid's query()
    } catch (err) {
      this.onError(err)
    }
  }


  initLoading() {
    if (!isServer) {
      if (this.props?.onLoadChange) this.props.onLoadChange(true) // call options.onLoadChange()

      if (this.props?.bitKey) this.bitKey = createAceKey(this.props.bitKey) // IF bitkey defined THEN use it
      else this.bitKey = this.apiName // IF no bitKey set THEN default bitkey to apiName

      if (this.props?.queryType !== 'maySetCookies') scope.bits.set(this.bitKey, true) // set loading bit to true
      else {
        setTimeout(() => { // 🚨 IF we start bitKey immediately (no setTimeout) AND queryType is maySetCookies THEN hydration error MAYBE B/C on page init they'll be a different DOM then was rendered on the server 🤷‍♀️
          if (this.bitKey && !this.onResultHappened) scope.bits.set(this.bitKey, true) // skip if onResultHappened b/c then the bit is already false
        })
      }
    }
  }


  /** When we're not using Solid's `query()` */
  async onNoQuery() {
    this.result = { query: await this.callApi() }
    await this.onResult()
  }


  /** ensures we call an API the correct way if @ FE or BE */
  async callApi() {
    try {
      if (isServer) return await this.onBE()
      return await this.onFE()
    } catch (err) {
      return this.onError(err)
    }
  }


  /** Opted into using Solid's `query()` by setting a `options.queryType` */
  onQuery() {
    const queryKey = createAceKey(this.props?.queryKey ?? this.apiName)

    const resQuery = query(this.innerQuery.bind(this), queryKey) // bind 'this' to innerQuery to preserve the ApiFn instance context

    const createAsyncOptions = { ...ApiFn.defaultCreateAsyncOptions, ...this.props?.createAsyncOptions }

    if (this.props?.queryType !== 'stream') this.parseQuery(resQuery) // createAsync() outside of 'stream' creates hydration error or data leak error, example: computations created outside a `createRoot` or `render` will never be disposed
    else createAsync(async () => { this.parseQuery(resQuery) }, createAsyncOptions)
  }


  /** Provided to Solid's `query()` */
  async innerQuery() {
    const res = await this.callApi()

    if (res instanceof Response && isServer) { // dip out early on redirect
      const goUrl = res.headers.get(goHeaderName)
      if (goUrl) throw redirect(goUrl)

      if (this.props?.queryType === 'stream') { // returning a Response during stream can lead to this error "Cannot set headers after they are sent to the client" b/c the API Response headers may get attempted to be added to the Page headers, returning an {} stops this 
        const parsed = await parseResponse(res)
        return parsed
      }
    }

    return res
  }


  async parseQuery(resQuery: () => Promise<any>) {
    this.result = {
      query: await resQuery()
    }

    await this.onResult()
  }


  async onResult() {
    if (isServer) return // callbacks server side leads to hydration issues
    if (!this.result) throw new Error('!this.result')

    this.onResultHappened = true

    if (this.props?.onError || this.props?.onSuccess) {
      const parsed = await parseResponse<Api2Response<T_API>>(this.result.query)

      if (parsed && typeof parsed === 'object') {
        if (parsed.error) this.result.error = parsed.error
        if (parsed.data) this.result.data = parsed.data
      }
    }

    if (this.result.error) this.onError(this.result.error)
    else {
      if (this.props?.onResponse) this.props.onResponse(this.result.query)
      if (this.props?.onSuccess) this.props.onSuccess(this.result.data)
    }

    if (this.bitKey) scope.bits.set(this.bitKey, false)

    if (this.props?.onLoadChange) this.props.onLoadChange(false)
  }


  async onError(err: unknown) {
    if (this.props?.onError) this.props.onError(err as any)
    else if (!isServer) this.defaultOnError(err as any)
  }


  async onFE() {
    const { scope } = await import('./fundamentals/scopeComponent')

    const o = { ...this.props, manualBitOff: true }

    switch (this.regexMapEntry.method) {
      case apiMethods.keys.GET: return scope.GET(this.regexMapEntry.path as never, o)
      case apiMethods.keys.POST: return scope.POST(this.regexMapEntry.path as never, o)
      case apiMethods.keys.PUT: return scope.PUT(this.regexMapEntry.path as never, o)
      case apiMethods.keys.DELETE: return scope.DELETE(this.regexMapEntry.path as never, o)
      default: throw new Error(`"${this.regexMapEntry.method}" is not a valid method @ handleFE()`)
    }
  }


  async onBE() {
    const [api, { callAPIResolve }] = await Promise.all([
      this.regexMapEntry.loader(),
      import('./callAPIResolve'),
    ])

    const o = this.props ?? ({} as ApiFnProps<T_API>)
    return await callAPIResolve(api, o.pathParams ?? {}, o.searchParams ?? {})
  }


  defaultOnError(error?: AceError | AceErrorProps) {
    if (!isServer && error?.message) showErrorToast(error.message)
  }
}
