import { isServer } from 'solid-js/web'
import type { API } from './fundamentals/api'
import { parseResponse } from './parseResponse'
import { showErrorToast } from './fundamentals/toast'
import { apiMethods, queryType } from './fundamentals/vars'
import { createQueryKey } from './fundamentals/createQueryKey'
import { query, createAsync, useIsRouting } from '@solidjs/router'
import type { ApiFnProps, Api2Function } from './fundamentals/types'
import type { Api2Response, ApiMethods } from './fundamentals/types'
import { AceError, type AceErrorProps } from './fundamentals/aceError'



export function createApiFn<T_API extends API<any, any, any, any, any>>( apiName: string, path: string, method: ApiMethods, apiLoader: () => Promise<T_API> ): Api2Function<T_API> {
  const apiFn = (options?: ApiFnProps<T_API>) => { // when someone calls an API function this is what runs, depending on where the request is @ @ the moment this will run on the fe and/or the be
    if (options?.queryType === queryType.keys.maySetCookies && isServer) return // flow through on fe

    let bitKey: string | undefined

    try {
      if (options?.onLoadChange) options.onLoadChange(true)

      if (options?.bitKey) bitKey = options.bitKey // IF bitkey requested THEN use it
      else if (!options?.onLoadChange) bitKey = apiName // IF no bitKey set AND no onLoadChange set THEN default bitkey to apiName

      if (queryType.has(options?.queryType)) onSolidQuery() // IF requested query type is valid => call api w/ solid query()
      else callApiAndCallbacks()
    } catch(err) {
      _onError(err)
    }



    function onSolidQuery() { // they opted into using solidjs query() by setting a queryType
      const queryKey = createQueryKey(options?.queryKey ?? apiName)
      const response = query(callApiAndCallbacks, queryKey)

      const isRoutingNow = options?.queryType === 'direct'
        ? false // causes a hydration error if we call useIsRouting() during 'direct'
        : useIsRouting()() // don't keep as accesssor b/c the value here is correct but if accessed in doAsync() which is where we need the value is incorrect so var out when correct and use var later :)

      const doAsync = async () => { 
        try {
          const skipped = isRoutingNow // skipped during SPA navigation
          const allowed = !skipped

          const res = await response()

          if (allowed) {
            await _onResponse(res as Response)
          }
        } catch (err) {
          await _onError(err)
        }
      }

      if (options?.queryType === queryType.keys.stream) createAsync(doAsync)
      else doAsync()
    }



    async function callApiAndCallbacks () {
      let result

      try {
        result = await _onResponse(await callApi())
      } catch (err) {
        result = await _onError(err)
      } finally {
        if (options?.onLoadChange) options.onLoadChange(false)
      }

      return result
    }



    async function callApi() {
      try {
        if (isServer) return await onBE(apiLoader, options)
        return await onFE(path, method, {...options, bitKey} as ApiFnProps<T_API>)
      } catch (err) {
        return await AceError.catch(err)
      }
    }


    async function _onResponse (response?: AceError | Response) {
      let result

      if (options?.onResponse) options.onResponse(response) // don't parse response, just give response

      if (!options?.onResponse) {
        const parsed = await parseResponse<Api2Response<T_API>>(response)

        if (parsed && typeof parsed === 'object') {
          if (parsed.error) throw parsed.error
          if (parsed.data) options?.onData?.(parsed.data as any)
          result = parsed
        } else {
          result = response
        }

        options?.onGood?.(result)
      }

      return result
    }


    async function _onError (err: unknown) {
      const e = err instanceof AceError ? err : await AceError.catch(err)

      if (options?.onError) options.onError(e as any)
      else defaultOnError(e as any)

      return e
    }
  }

  return apiFn as unknown as Api2Function<T_API>
}



async function onFE<T_API extends API<any, any, any, any, any>>( path: string, method: ApiMethods, options?: ApiFnProps<T_API> ) {
  const { scope } = await import('./fundamentals/scopeComponent')

  switch (method) {
    case apiMethods.keys.GET: return scope.GET(path as never, options)
    case apiMethods.keys.POST: return scope.POST(path as never, options)
    case apiMethods.keys.PUT: return scope.PUT(path as never, options)
    case apiMethods.keys.DELETE: return scope.DELETE(path as never, options)
    default: throw new Error(`"${method}" is not a valid method @ handleFE()`)
  }
}



async function onBE<T_API extends API<any, any, any, any, any>>( apiLoader: () => Promise<T_API>, options?: ApiFnProps<T_API> ) {
  const [api, { callAPIResolve }] = await Promise.all([
    apiLoader(),
    import('./callAPIResolve'),
  ])

  const o = options ?? ({} as ApiFnProps<T_API>)
  return await callAPIResolve(api, o.pathParams ?? {}, o.searchParams ?? {})
}



export function defaultOnError(error?: AceError | AceErrorProps) {
  if (error?.message) showErrorToast(error.message)
}
