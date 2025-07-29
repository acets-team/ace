/**
 * 🧚‍♀️ How to access from ./app.config.ts
 *     - import { resolveAlias } from './.ace/resolveAlias'
 */


import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'


/**
 * ### Let Solid Start know about the tsconfig aliases
 * 🚨 Do the import like this, b/c this runs before tsconfig alias: `import { resolveAlias } from './.ace/resolveAlias'`
 * @example
  ```ts
  import { resolveAlias } from './.ace/resolveAlias'
  import { defineConfig } from '@solidjs/start/config'

  export default defineConfig({
    middleware: './src/lib/middleware.ts',
    vite() {
      return {
        resolve: {
          alias: resolveAlias(import.meta.url, {
            '@custom': './custom/utils' // optional
          })
        }
      }
    }
  })
  ```
 * @param importMetaUrl - Helps us resolve paths, pass as `import.meta.url`
 * @param customAliases - Optional, any additional custom aliases you also have in your tsconfig
 */
export function resolveAlias(importMetaUrl: string, customAliases: Aliases = {}): Aliases {
  const dir = getDir(importMetaUrl)

  return { ...getBaseAliases(dir), ...getFundamentalsAliases(dir), ...getCustomAliases(customAliases, dir) }
}


function getDir(importMetaUrl: string) {
  return path.dirname(fileURLToPath(importMetaUrl))
}


function getBaseAliases(dir: string) {
  return {
    '@src': path.resolve(dir, 'src'),
    'ace.config': path.resolve(dir, 'ace.config.js')
  }
}



function getFundamentalsAliases(dir: string): Record<string, string> {
  const aliases: Record<string, string> = {}
  const fundamentalsRoot = path.resolve(dir, '.ace/fundamentals') // The directory that holds the modules we'd love to alias
  const files = fs.readdirSync(fundamentalsRoot) // Get the file name to each item in the fundamentals directory

  for (const file of files) {
    const fsPath = path.join(fundamentalsRoot, file) // Get the full fs path to each item in the fundamentals directory
    const { name, base, ext } = path.parse(file) // file name

    if (ext === '.css') aliases[`@ace/${base}`] = fsPath
    else aliases[`@ace/${name}`] = fsPath // standard
  }

  return aliases
}



function getCustomAliases(customAliases: Aliases, dir: string): Aliases {
  const aliases: Aliases = {}

  for (const key in customAliases) {
    aliases[key] = path.resolve(dir, customAliases[key] as string)
  }

  return aliases
}


export type Aliases = Record<string, string>
