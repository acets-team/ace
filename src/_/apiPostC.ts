import { mode } from './vars'
import { optional, vParser, vEnums, vDate } from '../fundamentals/vParser'
import { ApiResolver, createApi, ApiInfo, ApiInfo2Req } from '../fundamentals/api'


export const info = new ApiInfo({ 
  method: 'POST',
  path: '/api/c/:mode?',
  parser: vParser.api({
    body: { sd: vDate() },
    pathParams: { mode: optional(vEnums(mode)) },
  })
})


export async function resolver(req: ApiInfo2Req<typeof info>) {
  'use server'

  return new ApiResolver(req)
    .res(async (scope) => {
      return scope.success({
        body: scope.body,
        pathParams: scope.pathParams,
      })
    })
}


export default createApi('apiPostC', info, resolver)
