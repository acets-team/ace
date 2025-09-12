/**
 * 🧚‍♀️ How to access:
 *     - Plugin: `markdownIt`
 *     - import { Markdown, defaultMarkdownOptions } from '@ace/markdown'
 *     - import type { MarkdownProps, MarkdownIt, MarkdownItOptions } from '@ace/markdown'
 */


import type MarkdownIt from 'markdown-it'
import type { Options as MarkdownItOptions } from 'markdown-it'
import { createSignal, onMount, createEffect, type JSX, type Setter } from 'solid-js'


/**
 * - Render html in the browser, Update markdown w/ `content` prop or `md()?.render('**example**')`
 * - 🚨 Prerequisite, add to entry-server below `{scripts}`:
 *     - `<script src="https://cdn.jsdelivr.net/npm/markdown-it/dist/markdown-it.min.js"></script>`
 * @param content - Content to render from markdown to html, can also pass content later by updating the passed in content prop or md()?.render()
 * @param setMD - in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD`
 * @param options - Optional, defaults to `defaultMarkdownOptions`, can override one prop at a time b/c we merge
 */
export function Markdown({ setMD, content, divProps, options = defaultMarkdownOptions }: MarkdownProps) {
  const [html, setHtml] = createSignal<string>('')
  const [_md, _setMD] = createSignal<undefined | MarkdownIt>()

  onMount(() => {
    if (!window.markdownit) throw new Error('!window.markdownit --- markdown-it not provided via CDN')

    const o: MarkdownItOptions = {...defaultMarkdownOptions, ...options}

    const md = window.markdownit(o)

    _setMD(md)

    if (setMD) setMD(md)
    if (content) setHtml(md.render(content))
  })

  createEffect(() => { // setHtml on props.content change
    if (_md() && content) setHtml(_md()!.render(content))
  })

  return <div {...divProps} innerHTML={html()} />
}


const defaultMarkdownOptions: MarkdownItOptions = {
  html: true,
  linkify: true,
  typographer: true,
  highlight (str: string, lang: string) {
    let response = ''

    if ((window as any).hljs && (window as any).hljs.getLanguage(lang)) {
      response = (window as any).hljs.highlight(str, { language: lang ?? 'auto' }).value 

      if (response) response = `<pre class="hljs"><code>${response}</code></pre>`
    }

    return response ?? '' 
  },
}


export type MarkdownProps = {
  /** Content to render from markdown to html, can also pass content later by updating the passed in content prop or md()?.render() */
  content?: string
  /** in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` */
  setMD?: Setter<MarkdownIt | undefined>
  /** Optional, defaults to `defaultMarkdownOptions`, can override one prop at a time b/c we merge*/
  options?: MarkdownItOptions
  /** Optional, passed to wrapper div */
  divProps?: JSX.HTMLAttributes<HTMLDivElement>
}



export type { MarkdownIt, MarkdownItOptions } // re-export



/** brings types to global CDN constructor when loaded in the browser (recommended b/c less for cloudflare (recommended) to spin up + customers just downloads once + spread amongt globe customers) */
declare global {
  interface Window {
    markdownit?: typeof MarkdownIt
  }
}
