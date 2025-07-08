import { API } from '../fundamentals/api'
import { aceParams } from '../fundamentals/aceParams'


export const GET = new API('/api/a/:id', 'apiA')
  .pathParams(aceParams(({ id }) => {
    if (typeof id !== 'number') throw new Error('id must be a number')
    return { id }
  }))
  .resolve(async (be) => {
    return be.success(be.pathParams.id)
  })


export const POST = new API('/api/a')
  .body<{ a: string }>()
