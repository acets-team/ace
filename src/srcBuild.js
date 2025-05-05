#!/usr/bin/env node
// @ts-check

import { join } from 'node:path'
import { copyFile } from 'node:fs/promises'
import { fundamentals } from './fundamentals.js'

try {
  const cwd = process.cwd()
  const distDir = join(cwd, 'dist')

  const promises = [
    copyFile(join(cwd, 'src/fundamentals/app.tsx'), join(distDir, `app.txt`)),
    copyFile(join(cwd, 'src/index.ts'), join(distDir, `index.d.ts`)), // ts does not show errors in .d.ts files so we start w/o it to get intellisense & then use it to inform ts, only declarations in here
    copyFile(join(cwd, 'src/fundamentals/types.ts'), join(distDir, `types.d.txt`)),
    copyFile(join(cwd, 'tsconfig.cliBuild.json'), join(distDir, `tsconfig.txt`)),
  ]

  fundamentals.forEach((f, name) => {
    switch(f.type) {
      case 'helper':
        promises.push(copyFile(join(cwd, 'src', `${name}.${f.ext}`), join(distDir, `${name}.txt`)))
        break
      case 'copy':
        promises.push(copyFile(join(cwd, 'src/fundamentals', `${name}.${f.ext}`), join(distDir, `${name}.txt`)))
        break
    }
  })

  await Promise.all(promises)

  console.log('✅ Built Ace!')
} catch (error) {
  console.error('❌ srcBuild:', error)
}
