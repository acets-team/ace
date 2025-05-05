/**
 * 🧚‍♀️ How to access:
 *     - import { resolveAlias } from '@ace/resolveAlias'
 */


import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'


/**
 * ### Helps keep `fe` bundle free of `be` code
 * @param router - From `vite({ router }) {` from `defineConfig` from `@solidjs/start/config`
 * @param importMetaUrl - `import.meta.url`
 * @returns Map that aligns an `import from` w/ the correct fs path on disk
 */
export function resolveAlias(router: 'server' | 'client' | 'server-function', importMetaUrl: string) {
  switch (router) {
    case 'client': return getResolveAliasFE(getDir(importMetaUrl))
    default: return getResolveAliasBE(getDir(importMetaUrl))
  }
}


function getResolveAliasBE(dir: string) {
  return { ...getBaseAlias(dir), ...getFundamentalsAlias('be', dir) }
}


function getResolveAliasFE(dir: string) {
  return { ...getBaseAlias(dir), ...getFundamentalsAlias('fe', dir) }
}


function getDir(importMetaUrl: string) {
  return path.dirname(fileURLToPath(importMetaUrl))
}


function getFundamentalsAlias(env: 'be' | 'fe', dir: string): Record<string, string> {
  const aliasMap: Record<string, string> = {}
  const fundamentalsRoot = path.resolve(dir, '.ace/fundamentals') // The directory that holds the modules we'd love to alias
  const files = fs.readdirSync(fundamentalsRoot) // Get the file name to each item in the fundamentals directory

  for (const file of files) {
    const fsPath = path.join(fundamentalsRoot, file) // Get the full fs path to each item in the fundamentals directory
    const { name } = path.parse(file) // file name

    if (name === 'apis.be' && env === 'be') aliasMap['@ace/apis'] = fsPath // we've got the fsPath to the be apis & we're currently building for the be => set the alias
    else if (name === 'apis.fe' && env === 'fe') aliasMap['@ace/apis'] = fsPath // we've got the fsPath to the fe apis & we're currently building for the fe => set the alias
    else aliasMap[`@ace/${name}`] = fsPath // standard
  }

  return aliasMap
}


function getBaseAlias(dir: string) {
  return {
    '@src': path.resolve(dir, 'src'),
    'ace.config': path.resolve(dir, 'ace.config.js')
  }
}
