#!/usr/bin/env node

import { sw } from './sw.js' // .js extension required b/c this is cli / dist / node, land
import { cliBuild } from './build/build.js'
import { base64UrlEncode } from '../fundamentals/base64UrlEncode.js'

try {  
  const cwd = process.cwd()
  const args = process.argv.slice(2)

  switch(args[0]) {
    case 'build':
      await cliBuild(cwd)
      break
    case 'sw':
      await sw(cwd)
      break
    case 'password':
      const randomBytes = new Uint8Array(64)
      crypto.getRandomValues(randomBytes)

      const base64String = base64UrlEncode(randomBytes)
      console.log(base64String)
      break
  }
} catch(e) {
  console.error('❌ Ace CLI Error:', e)
  process.exit(1)
}
