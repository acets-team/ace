import { API } from '../fundamentals/api'


export const POST = new API('/api/b')
  .body<{ b: boolean }>()
