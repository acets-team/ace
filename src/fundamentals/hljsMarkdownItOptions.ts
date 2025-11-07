/**
 * 🧚‍♀️ How to use:
 *   Plugin: hljs
 *   import { hljsMarkdownItOptions } from '@ace/hljsMarkdownItOptions'
 */


import hljs from './hljs/core'
import markdownit from 'markdown-it'
import type { Options as MarkdownItOptions } from 'markdown-it'


/**
 * - `MarkdownIt` > `options` > `highlight` to be done via `hljs`
 */
export const hljsMarkdownItOptions: MarkdownItOptions['highlight'] = (str: string, lang: string) => {
  try {
    if (lang && hljs.getLanguage(lang)) {
      const result = hljs.highlight(str, { language: lang, ignoreIllegals: true }).value
      return `<pre class="hljs"><code>${result}</code></pre>`
    }

    const escaped = markdownit().utils.escapeHtml(str)
    return `<pre class="hljs"><code>${escaped}</code></pre>`
  } catch {
    const escaped = markdownit().utils.escapeHtml(str)
    return `<pre><code>${escaped}</code></pre>`
  }
}
