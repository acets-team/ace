import markdownit from 'markdown-it'
import type { Setter } from 'solid-js'
import type { Options as MarkdownItOptions } from 'markdown-it'


export const defaultMarkdownOptions: MarkdownItOptions = {
  html: true,
  linkify: true,
  typographer: true
}


export function initMarkdownIt (props: {
  /** Optional,requested options will be merged w/ the `defaultMarkdownOptions` */
  options?: MarkdownItOptions
  /** Optional, to enable code highlighting pass a function here that registers highlight languages */
  registerHljs?: () => void
  /** in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` */
  setMD?: Setter<markdownit | undefined>
}) {
  if (props.registerHljs) props.registerHljs()

  const md = markdownit({
    ...defaultMarkdownOptions,
    ...props.options,
  })

  props.setMD?.(md)

  return md
}
