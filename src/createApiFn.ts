import { onMount } from 'solid-js'
import { isServer } from 'solid-js/web'
import type { API } from './fundamentals/api'
import { parseResponse } from './parseResponse'
import { scope } from './fundamentals/scopeComponent'
import { showErrorToast } from './fundamentals/toast'
import { createAceKey } from './fundamentals/createAceKey'
import { query, createAsync, redirect } from '@solidjs/router'
import { AceError, type AceErrorProps } from './fundamentals/aceError'
import { apiMethods, goHeaderName, queryType } from './fundamentals/vars'
import type { ApiMethods, ApiFnProps, Api2Function, Api2Response } from './fundamentals/types'



export function createApiFn<T_API extends API<any, any, any, any, any>>(apiName: string, path: string, method: ApiMethods, apiLoader: () => Promise<T_API>): Api2Function<T_API> {
  const apiFn = (options?: ApiFnProps<T_API>) => { // when someone calls an API function this is what runs, depending on where the request is @ @ the moment this will run on the fe and/or the be
    if (options?.queryType === queryType.keys.maySetCookies && isServer) return // flow through on fe

    let bitKey: string | undefined

    try {
      if (options?.onLoadChange) options.onLoadChange(true)

      if (options?.bitKey) bitKey = createAceKey(options.bitKey) // IF bitkey requested THEN use it
      else if (!options?.onLoadChange) bitKey = apiName // IF no bitKey set AND no onLoadChange set THEN default bitkey to apiName

      if (queryType.has(options?.queryType)) onSolidQuery() // IF requested query type is valid => call api w/ solid query()
      else callApiAndCallbacks()
    } catch (err) {
      _onError(err)
    }



    function onSolidQuery() { // opted into using solidjs query() by setting a queryType
      const queryKey = createAceKey(options?.queryKey ?? apiName)
      const response = query(callApiAndCallbacks, queryKey)

      const doAsync = async () => {
        try {
          const result = await response()

          if (options?.queryType === 'stream') { // the other query types do their callbacks on the FE so this is not necessary for them, stores only run on fe and stores are often populated in callbacks, so it's important to call the callbacks on the FE too
            onMount(async () => {
              if (result?.og) {
                try {
                  await _onResponse(result.og)
                } catch (err) {
                  await _onError(err)
                } finally {
                  if (options?.onLoadChange) options.onLoadChange(false)

                  if (bitKey) scope.bits.set(bitKey, false)
                }
              }
            })
          }
        } catch (err) {
          await _onError(err)
        }
      }

      if (options?.queryType === queryType.keys.stream) createAsync(doAsync)
      else doAsync()
    }



    async function callApiAndCallbacks() {
      let result: undefined | Result<T_API>

      try {
        result = await _onResponse(await callApi())
      } catch (err) {
        result = await _onError(err)
      } finally {
        if (options?.onLoadChange) options.onLoadChange(false)

        if (bitKey) scope.bits.set(bitKey, false)

        if (options?.queryType === 'stream' && result?.og instanceof Response && isServer) {
          const goUrl = result.og.headers.get(goHeaderName)

          if (goUrl) {
            return redirect(goUrl)
          }
        }
      }

      return result
    }



    async function callApi() {
      try {
        if (isServer) return await onBE(apiLoader, options)
        return await onFE(path, method, { ...options, bitKey } as ApiFnProps<T_API>)
      } catch (err) {
        return await AceError.catch(err)
      }
    }



    async function _onResponse(response?: AceError | Response) {
      let result: Result<T_API> = { og: response, parsed: null }

      if (options?.onResponse) options.onResponse(result.og) // don't parse response, just give response

      if (!options?.onResponse) {
        const parsed = await parseResponse<Api2Response<T_API>>(result.og)

        if (parsed && typeof parsed === 'object') {
          if (parsed.error) throw parsed.error
          if (parsed.data) options?.onData?.(parsed.data as any)
          result.parsed = parsed
        }

        options?.onGood?.(result)
      }

      return result
    }



    async function _onError(err: unknown) {
      const e = err instanceof AceError ? err : await AceError.catch(err)

      if (options?.onError) options.onError(e as any)
      else defaultOnError(e as any)

      return e
    }
  }

  return apiFn as unknown as Api2Function<T_API>
}



async function onFE<T_API extends API<any, any, any, any, any>>(path: string, method: ApiMethods, options?: ApiFnProps<T_API>) {
  const { scope } = await import('./fundamentals/scopeComponent')

  const o = { ...options, manualBitOff: true }

  switch (method) {
    case apiMethods.keys.GET: return scope.GET(path as never, o)
    case apiMethods.keys.POST: return scope.POST(path as never, o)
    case apiMethods.keys.PUT: return scope.PUT(path as never, o)
    case apiMethods.keys.DELETE: return scope.DELETE(path as never, o)
    default: throw new Error(`"${method}" is not a valid method @ handleFE()`)
  }
}



async function onBE<T_API extends API<any, any, any, any, any>>(apiLoader: () => Promise<T_API>, options?: ApiFnProps<T_API>) {
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


type Result<T_API extends API<any, any, any, any, any>> = {
  og?: AceError | Response,
  parsed?: null | Api2Response<T_API>
}
