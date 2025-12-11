import { exampleB4, testB4 } from './b4'
import { vParser, vNum, vDate, vBool, optional } from '../fundamentals/vParser'
import { createApi, ApiResolver, ApiInfo, ApiInfo2Req } from '../fundamentals/api'


export const info = new ApiInfo({ 
  method: 'POST',
  path: '/api/a/:choice',
  parser: vParser.api({
    body: { id: vNum() },
    searchParams: { sd: vDate() },
    pathParams: { choice: vBool() },
  })
})


export async function resolver(req: ApiInfo2Req<typeof info>) {
  'use server'

  return new ApiResolver(req)
    .b4([exampleB4, testB4])
    .res(async (scope) => {
      return scope.success({
        id: scope.body.id,
        sd: scope.searchParams.sd,
        locals: scope.event.locals,
        choice: scope.pathParams.choice,
      })
    })
}


export default createApi('apiPostA', info, resolver)
