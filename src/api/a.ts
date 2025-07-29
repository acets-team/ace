import z from 'zod'
import { API } from '../fundamentals/api'
import { vNum } from '../fundamentals/vNum'
import { vBool } from '../fundamentals/vBool'
import { vParser } from '../fundamentals/vParser'
import { zParser } from '../fundamentals/zParser'
import { number, object, string, pipe, email } from 'valibot'


export const GET = new API('/api/a/:id', 'apiGetA')
  .pathParams(input => {
    if (typeof input !== 'object' || input === null) throw new Error('input is not an object')

    const raw = (input as any).id
    if (raw === undefined) throw new Error('input.id is undefined')

    const id = Number(raw)
    if (Number.isNaN(id)) throw new Error('input.id is not a number')

    return { id }
  })
  .resolve(async (scope) => scope.success(scope.pathParams.id))

  

export const POST = new API('/api/a', 'apiPostA')
  .pathParams(vParser(object({ choice: vBool() })))
  .body(vParser(object({ id: number() })))
  .resolve(async (scope) => scope.success({ id: scope.body.id, choice: scope.pathParams.choice}))



export const PUT = new API('/api/a/:id', 'apiPutA')
  .pathParams(vParser(object({ id: vNum() })))
  .body(vParser(object({ email: pipe(string(), email()) })))
  .resolve(async (scope) => scope.success({ email: scope.body.email, id: scope.pathParams.id }))



export const DELETE = new API('/api/a/:id', 'apiDeleteA')
  .pathParams(zParser(z.object({
    id: z.preprocess(
      (val) => { // coercion function: if it’s a string, convert to Number; otherwise pass through
        if (typeof val === 'string') {
          const n = Number(val)
          if (Number.isNaN(n)) throw new Error('id must be numeric')
          return n
        }

        return val
      },
      
      z.number({ required_error: 'id is required', invalid_type_error: 'id must be a number' }) // final validator: must be a number
    )
  })))
  .body(zParser(z.object({ email: z.string().email({ message: 'Email is invalid' }) })))
  .resolve(async (scope) => scope.success({ id: scope.pathParams.id, email: scope.body.email }))
