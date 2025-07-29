import root from './root'
import { object } from 'valibot'
import { vNum } from '../fundamentals/vNum'
import { Route } from '../fundamentals/route'
import { vParser } from '../fundamentals/vParser'


export default new Route('/a:id')
  .pathParams(vParser(object({ id: vNum() })))
  .layouts([root])
  .component(({pathParams}) => {
    return <>{pathParams.id}</>
  })
