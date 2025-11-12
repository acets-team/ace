/**
* 🧚‍♀️ How to access:
*     - Plugin: markdownIt
*     - import { parseMarkdownFolders } from '@ace/parseMarkdownFolders'
*     - import type { ParsedMarkdownFolder } from '@ace/parseMarkdownFolders'
*/


import type { Parser } from './types'
import { getInfo } from './aceMarkdown'


// gen
const mdFolder = import.meta.glob('../../md/*.md', { query: '?raw', import: 'default', eager: true })


const contentFolder = import.meta.glob('../../content/*.md', { query: '?raw', import: 'default', eager: true })


const map = { mdFolder, contentFolder } as const
// gen


/**
 * - When `mdFolders` are populated @ `ace.config.js` then `parseMarkdownFolders()` is built
 * - Thanks to Vite's `eager: true` & `query: '?raw'` the `mdFiles` that we query by `folderId` are created at build-time
 * @example
    ```js
    // Ace Markdown Directive
    // <!--{ "$info": true, "title": "What is Ace?", "slug": "what-is-ace" }-->


    // ace.config.js
    export const config = {
      mdFolders: [
        { id: 'mdFolder', path: 'src/md' },
        { id: 'contentFolder', path: 'src/content' },
      ],
    }

    // ./src/parsers/mdParser
    const parser = vParse(object({
      $info: vBool(),
      slug: vString(),
      title: vString()
    }))

    // component
    const mdFolder = parseMarkdownFolders('mdFolder', parser)
    const contentFolder = parseMarkdownFolders('contentFolder', parser)

    console.log({
      mdFolder,
      contentFolder,
      whatIsAce: mdFolder.find(md => md.info.slug === 'what-is-ace')
    })
    ```
 * @param folderId - Matches the `ace.config.js > mdFolders > id`
 * @param parser - Will throw an error if $info does not match the `parser` validations` and provides typesafety when valid
 */
export function parseMarkdownFolders<T extends Record<string, any>>(folderId: keyof typeof map, parser: Parser<T>): ParsedMarkdownFolder<T>[] {
  const mdFiles = map[folderId]
  if (!mdFiles) throw new Error('!mdFiles')

  const res = []

  for (const path in mdFiles) {
    const str = mdFiles[path]
    if (typeof str !== 'string') continue

    const parsed: ParsedMarkdownFolder<T> = {
      path,
      raw: str,
      info: parser(getInfo(str)),
    }

    res.push(parsed)
  }

  return res
}


export type ParsedMarkdownFolder<T extends Record<string, any>> = {
  path: string
  raw: string
  info: T
}
