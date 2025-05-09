import { API } from '../fundamentals/api'


export const GET = new API('/api/a/:id', 'apiA')
  .params<{id: string}>()
  .resolve(async (be) => {
    return be.json({ a: true })
  })


export const POST = new API('/api/a')
  .body<{ a: string }>()
