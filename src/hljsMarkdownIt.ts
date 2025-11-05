/**
 * 🧚‍♀️ How to use:
 *   Plugin: hljs
 *   import { hljsMarkdownIt } from '@ace/hljsMarkdownIt'
 */


import markdownit from 'markdown-it'
import hljs from './fundamentals/hljs/core'
import type { Options as MarkdownItOptions } from 'markdown-it'


/**
 * - MarkdownIt + HighlightJs Options
 */
export const hljsMarkdownIt: MarkdownItOptions['highlight'] = (str: string, lang: string) => {
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
