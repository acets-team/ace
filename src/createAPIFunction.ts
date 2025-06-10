import { BE } from './fundamentals/be'
import type { API } from './fundamentals/api'
import { AceError } from './fundamentals/aceError'
import { getSessionData } from './fundamentals/session'
import type { APIFunction, APIFnOptions } from './fundamentals/types'


export function createAPIFunction<T_API extends API<any, any, any, any>>(api: T_API): APIFunction<T_API> {
  return async (options?: APIFnOptions<T_API>) => {
    try {
      const o = options ?? {} as APIFnOptions<T_API>
  
      const params = (o as any).params ?? {}
      const search = (o as any).search ?? {}
      const body   = (o as any).body ?? {}
  
      const be = BE.CreateFromFn(params, search, body)
  
      if (typeof api.values.b4 === 'function') {
        const res = await api.values.b4({ sessionData: await getSessionData() })
        if (res) return res as any
      }

      if (!api.values.resolve) throw new Error('Please set .resolve() on your api for createAPIFunction() to work')
  
      const res = await api.values.resolve(be)

      /**
       * - `const _contracts = load(() => apiContracts(), 'contracts')` calls a server-side function directly, and is then passed to Seroval, this ensures Seroval does not bomb while parsing
       * - `const _contracts = load(() => beGET('/api/contracts'), 'contracts')` makes a real HTTP request to an API endpoint where await res.json() happens also
       */
      return res ? JSON.parse(JSON.stringify(res)) : undefined
    } catch (error) {
      throw AceError.catch({ error })
    }
  }
}
