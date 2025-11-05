#!/usr/bin/env node
// @ts-check

import { join } from 'node:path'
import { copyFile } from 'node:fs/promises'
import { fundamentals } from './fundamentals.js'

try {
  const cwd = process.cwd()
  const dirDist = join(cwd, 'dist')
  const dirFundamentals = join(dirDist, 'fundamentals')

  /** @type {Promise<void>[]} */
  const promises = []

  promises.push(copyFile(join(cwd, 'src/index.ts'), join(dirDist, `index.d.ts`)))
  promises.push(copyFile(join(cwd, 'src/fundamentals/env.ts'), join(dirFundamentals, `env.txt`)))
  promises.push(copyFile(join(cwd, 'src/fundamentals/types.ts'), join(dirFundamentals, `types.d.txt`)))
  promises.push(copyFile(join(cwd, 'src/fundamentals/vanilla.ts'), join(dirFundamentals, `vanilla.d.txt`)))
  promises.push(copyFile(join(cwd, 'src/fundamentals/createApp.tsx'), join(dirFundamentals, `createApp.txt`)))

  for (const [name, f] of fundamentals) {
    switch(f.type) {
      case 'helper': {
        const src = join(cwd, 'src', `${name}.${f.ext}`)
        const dest = join(dirDist, `${name}.txt`)
        promises.push(copyFile(src, dest))
        break
      }
      case 'copy': {
        const src = join(cwd, `src/fundamentals/${name}.${f.ext}`)
        const dest = join(join(dirDist, 'fundamentals'), `${name}.txt`)
        promises.push(copyFile(src, dest))
        break
      }
    }
  }

  await Promise.all(promises)
  console.log('✅ Built Ace!')
} catch (error) {
  console.error('❌ srcBuild:', error)
}
