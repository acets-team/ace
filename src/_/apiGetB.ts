import { mode } from './vars'
import { vParser, vEnums } from '../fundamentals/vParser'
import { ApiResolver, createApi, ApiInfo, ApiInfo2Req } from '../fundamentals/api'


export const info = new ApiInfo({ 
  method: 'GET',
  path: '/api/b/:mode',
  parser: vParser.api({
    pathParams: { mode: vEnums(mode) },
  })
})


export async function resolver(req: ApiInfo2Req<typeof info>) {
  'use server'

  return new ApiResolver(req)
    .res(async (scope) => scope.success(scope.pathParams))
}


export default createApi('apiGetB', info, resolver)
