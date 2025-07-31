import root from './root'
import { object } from 'valibot'
import { vNum } from '../fundamentals/vNum'
import { Route } from '../fundamentals/route'
import { vParse } from '../fundamentals/vParse'


export default new Route('/a:id')
  .pathParams(vParse(object({ id: vNum() })))
  .layouts([root])
  .component(({pathParams}) => {
    return <>{pathParams.id}</>
  })
