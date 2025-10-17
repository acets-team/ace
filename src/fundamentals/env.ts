/**
* 🧚‍♀️ How to access:
*     - import { env, url } from '@ace/env'
*/

import { config } from 'ace.config'

export const env = 'local'

export const packageDotJsonVersion = '0.1.2' // when aceConfig.sw is true then this is also defined

export const origins = (typeof config.origins[env] === 'string') 
  ? new Set([config.origins[env]])
  : new Set(config.origins[env])
