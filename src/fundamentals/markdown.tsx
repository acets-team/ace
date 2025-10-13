/**
 * 🧚‍♀️ How to access:
 *     - Plugin: `markdownIt`
 *     - import { Markdown, defaultMarkdownOptions } from '@ace/markdown'
 *     - import type { MarkdownProps, MarkdownIt, MarkdownItOptions } from '@ace/markdown'
 */


import type MarkdownIt from 'markdown-it'
import { feComponent } from './feComponent'
import type { Options as MarkdownItOptions } from 'markdown-it'
import { createMemo, type JSX, type Setter, type Accessor } from 'solid-js'


/**
 * - Render markdown on `fe`
 *     - For best seo render markdown on `be`
 *     - For snappy updates render markdown on `fe`
 * - Update markdown w/ `content` prop or `md()?.render('**example**')`
 * - 🚨 Prerequisite, add to entry-server above `{scripts}`:
 *     - `<script src="https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js"></script>`
 * @param content - Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()`
 * @param setMD - in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD`
 * @param options - Optional, defaults to `defaultMarkdownOptions`, can override one prop at a time b/c we merge
 * @param $div - Optional, props passed to inner wrapper div
 */
export const Markdown = feComponent((props: {
  /** Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()` */
  content?: Accessor<string | undefined>
  /** in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` */
  setMD?: Setter<MarkdownIt | undefined>
  /** Optional, defaults to `defaultMarkdownOptions`, can override one prop at a time b/c we merge */
  options?: MarkdownItOptions
  /** Optional, props passed to inner wrapper div */
  $div?: JSX.HTMLAttributes<HTMLDivElement>
}) => {
  const md = createMemo(() => {
    if (!window.markdownit) throw new Error('!window.markdownit')

    const o = { ...defaultMarkdownOptions, ...props.options }
    const instance = window.markdownit(o)

    props.setMD?.(instance)
    return instance
  })

  const html = createMemo(() => {
    const _md = md()
    const _content = props.content?.()

    return _md && _content ? _md.render(_content) : ''
  })

  return <div {...props.$div} innerHTML={html()} />
})


const defaultMarkdownOptions: MarkdownItOptions = {
  html: true,
  linkify: true,
  typographer: true,
  highlight(str: string, lang: string) {
    let response = ''

    if ((window as any).hljs && (window as any).hljs.getLanguage(lang)) {
      response = (window as any).hljs.highlight(str, { language: lang ?? 'auto' }).value

      if (response) response = `<pre class="hljs"><code>${response}</code></pre>`
    }

    return response ?? ''
  },
}


export type MarkdownProps = Parameters<typeof Markdown>[0]


export type { MarkdownIt, MarkdownItOptions } // re-export


/** brings types to global CDN constructor when loaded in the browser (recommended b/c less for cloudflare (recommended) to spin up + customers just downloads once + spread amongt globe customers) */
declare global {
  interface Window {
    markdownit?: typeof MarkdownIt
  }
}
