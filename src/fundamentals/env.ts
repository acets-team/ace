/**
* 🧚‍♀️ How to access:
*     - import { env, url } from '@ace/env'
*/

import { config } from 'ace.config'

export const env = 'local'

export const origins = (typeof config.origins[env] === 'string') 
  ? new Set([config.origins[env]])
  : new Set(config.origins[env])
