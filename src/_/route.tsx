import layout from './layout'
import { mode } from './vars'
import apiGetB from './apiGetB'
import apiPostA from './apiPostA'
import { Load } from '../fundamentals/load'
import { vNum } from '../fundamentals/vNum'
import { Route } from '../fundamentals/route'
import { Stream } from '../fundamentals/stream'
import { vParser } from '../fundamentals/vParser'


export default new Route('/route/:id')
  .layouts([layout])
  .parser(vParser.route({
    pathParams: { id: vNum() }
  }))
  .component((scope) => {
    const stream = new Stream({
      fn: apiGetB,
      queryKey: 'apiGetB',
      req: () => ({ pathParams: { mode: mode.keys.light } }),
    })

    const load = new Load({
      fn: apiPostA,
      queryKey: 'apiPostA',
      req: () => ({ body: {id: 9}, pathParams: {choice: true}, searchParams: { sd: new Date().toISOString() } })
    })

    return <>
      <h1>{scope.pathParams.id}</h1>
      <load.ui />
      <stream.ui />
    </>
  })
