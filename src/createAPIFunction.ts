import { isServer } from 'solid-js/web'
import type { API } from './fundamentals/api'
import { validateBody } from './validateBody'
import { AceError } from './fundamentals/aceError'
import { GoResponse } from './fundamentals/goResponse'
import type { ApiMethods } from './fundamentals/types'
import type { APIFnProps, API2Function } from './fundamentals/types'



export function createAPIFunction<T_API extends API<any, any, any, any, any>>(path: string, method: ApiMethods, apiLoader: () => Promise<T_API>): API2Function<T_API> {
  const fn = async (options?: APIFnProps<T_API>) => {
    try {
      if (isServer) return await handleBE(apiLoader, options)
      else return await handleFE(path, method, options)
    } catch (error) {
      throw await handleError(error)
    }
  }

  return fn as API2Function<T_API> // assert that `fn` really *is* our conditional API2Function
}



async function handleFE<T_API extends API<any, any, any, any, any>>(path: string, method: ApiMethods, options?: APIFnProps<T_API>) {
  const { scope } = await import('./fundamentals/scopeComponent')

  switch (method) {
    case 'GET': return scope.GET(path as never, options as any)
    case 'POST': return scope.POST(path as never, options as any)
    case 'PUT': return scope.PUT(path as never, options as any)
    case 'DELETE': return scope.DELETE(path as never, options as any)
    default: throw new Error(`"${method}" is not a valid method @ handleFE()`)
  }
}



async function handleBE<T_API extends API<any, any, any, any, any>>(apiLoader: () => Promise<T_API>, options?: APIFnProps<T_API>) {
  const [api, {callB4}, {callAPIResolve}, {validateParams}, {ScopeAPI}, {getRequestEvent}] = await Promise.all([
    apiLoader(),
    import('./callB4'),
    import('./callAPIResolve'),
    import('./validateParams'),
    import('./fundamentals/scopeAPI'),
    import('./fundamentals/getRequestEvent'),
  ])

  const o = options ?? ({} as APIFnProps<T_API>)

  const { pathParams, searchParams } = validateParams({
    rawParams: o.pathParams ?? {},
    rawSearch: o.searchParams ?? {},
    pathParamsParser: api.values.pathParamsParser,
    searchParamsParser: api.values.searchParamsParser
  })

  const body = (api.values.bodyParser)
    ? await validateBody({api, body: o.body})
    : {}

  const scope = ScopeAPI.CreateFromFn(getRequestEvent(), pathParams, searchParams, body)

  if (api.values.b4) {
    const b4Response = await callB4(api, { body, pathParams, searchParams })
    if (b4Response) return b4Response as any
  }

  return await callAPIResolve(api, scope)
}



async function handleError(error: any) {
  if (!(error instanceof GoResponse)) return AceError.catch({ error })
  else {
    if (!isServer) return window.location.href = error.url
    else {
      const { redirect } = await import('@solidjs/router')
      return redirect(error.url)
    }
  }
}
