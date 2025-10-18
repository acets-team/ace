/**
 * 🧚‍♀️ How to use:
 *   Plugin: highlightJs AND markdownIt
 *   import { markdownCodeHighlight } from '@ace/markdownCodeHighlight'
 */


import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'
import type { Options as MarkdownItOptions } from 'markdown-it'


export const markdownCodeHighlight: MarkdownItOptions = {
  highlight(str: string, lang: string) {
    try {
      if (lang && hljs.getLanguage(lang)) {
        const result = hljs.highlight(str, { language: lang }).value
        return `<pre class="hljs"><code>${result}</code></pre>`
      }

      const result = hljs.highlightAuto(str).value
      return `<pre class="hljs"><code>${result}</code></pre>`
    } catch {
      return `<pre><code>${str}</code></pre>`
    }
  },
}
