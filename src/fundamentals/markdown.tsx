/**
 * 🧚‍♀️ How to access:
 *     - Plugin: `markdownIt`
 *     - import { Markdown, defaultMarkdownOptions } from '@ace/markdown'
 *     - import type { MarkdownProps, MarkdownIt, MarkdownItOptions } from '@ace/markdown'
 */


import markdownit from 'markdown-it'
import { feComponent } from './feComponent'
import {  type Options as MarkdownItOptions } from 'markdown-it'
import { createMemo, type JSX, type Setter, type Accessor } from 'solid-js'


/**
 * - Render markdown on `fe`
 *     - For best seo render markdown on `be`
 *     - For fastest updates render markdown on `fe`
 * @param content - Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()`
 * @param setMD - in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD`
 * @param options - Optional, defaults to `defaultMarkdownOptions`, can override one prop at a time b/c we merge
 * @param $div - Optional, props passed to inner wrapper div
 */
export const Markdown = feComponent((props: {
  /** Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()` */
  content?: Accessor<string | undefined>
  /** in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` */
  setMD?: Setter<markdownit | undefined>
  /** Optional, defaults to `defaultMarkdownOptions`, can override one prop at a time b/c we merge */
  options?: MarkdownItOptions
  /** Optional, props passed to inner wrapper div */
  $div?: JSX.HTMLAttributes<HTMLDivElement>
}) => {
  const md = createMemo(() => {
    const o = { ...defaultMarkdownOptions, ...props.options }
    const instance = markdownit(o)

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
  typographer: true
}


export type MarkdownProps = Parameters<typeof Markdown>[0]
