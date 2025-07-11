#!/usr/bin/env node

import { cliBuild } from './build/build.js' // .js extension required b/c this is cli / dist / node, land

try {  
  const cwd = process.cwd()
  const args = process.argv.slice(2)

  switch(args[0]) {
    case 'build':
      await cliBuild(cwd)
      break
  }
} catch(e) {
  console.error('❌ Ace CLI Error:', e)
  process.exit(1)
}
