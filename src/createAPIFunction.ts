import { isServer } from 'solid-js/web'
import type { API } from './fundamentals/api'
import { AceError } from './fundamentals/aceError'
import type { ApiMethods } from './fundamentals/types'
import type { ApiFnProps, Api2Function } from './fundamentals/types'



export function createAPIFunction<T_API extends API<any, any, any, any, any>>(path: string, method: ApiMethods, apiLoader: () => Promise<T_API>): Api2Function<T_API> {
  const fn = async (options?: ApiFnProps<T_API>) => {
    try {
      if (isServer) return await handleBE(apiLoader, options)
      else return await handleFE(path, method, options)
    } catch (error) {
      return await AceError.catch(error)
    }
  }

  return fn as Api2Function<T_API> // assert that `fn` really *is* our conditional API2Function
}



async function handleFE<T_API extends API<any, any, any, any, any>>(path: string, method: ApiMethods, options?: ApiFnProps<T_API>) {
  const { scope } = await import('./fundamentals/scopeComponent')

  switch (method) {
    case 'GET': return scope.GET(path as never, options as any)
    case 'POST': return scope.POST(path as never, options as any)
    case 'PUT': return scope.PUT(path as never, options as any)
    case 'DELETE': return scope.DELETE(path as never, options as any)
    default: throw new Error(`"${method}" is not a valid method @ handleFE()`)
  }
}



async function handleBE<T_API extends API<any, any, any, any, any>>(apiLoader: () => Promise<T_API>, options?: ApiFnProps<T_API>) {
  const [api, {callAPIResolve}] = await Promise.all([ apiLoader(), import('./callAPIResolve') ])

  const o = options ?? ({} as ApiFnProps<T_API>)

  return await callAPIResolve(api, o.pathParams ?? {}, o.searchParams ?? {})
}
