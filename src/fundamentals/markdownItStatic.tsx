/**
 * 🧚‍♀️ How to access:
 *     - Plugin: `markdownIt`
 *     - import { MarkdownItStatic, defaultMarkdownOptions } from '@ace/markdownItStatic'
 *     - import type { MarkdownItStaticProps } from '@ace/markdownItStatic'
 */


import markdownit from 'markdown-it'
import type { JSX, Setter } from 'solid-js'
import { hljsMarkdownIt } from '../hljsMarkdownIt'
import type { Options as MarkdownItOptions } from 'markdown-it'


/**
 * - On refresh, markdown is rendered on `BE`
 *     - For best SEO please use `<MarkdownItStatic />`
 *     - For dynamic/immediate FE updates use `<MarkdownItDynamic />`
 * @example
```ts
import mdAppInfo from '@src/md/mdAppInfo.md?raw'
import { registerHljs } from '@src/init/registerHljs'
import { MarkdownItStatic } from '@ace/markdownItDynamic'

<MarkdownItStatic content={mdAppInfo} registerHljs={registerHljs} />
```
 * @param content - Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()`
 * @param setMD - in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD`
 * @param options - Optional, defaults to `defaultMarkdownOptions`, can override one prop at a time b/c we merge
 * @param $div - Optional, props passed to inner wrapper div
 * @param registerHljs - Optional, required when we want code highlighting, registers highlight languages
 */
export const MarkdownItStatic = (props: {
  /** Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()` */
  content: string,
  /** in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` */
  setMD?: Setter<markdownit | undefined>
  /** Optional, defaults to `defaultMarkdownOptions`, can override one prop at a time b/c we merge */
  options?: MarkdownItOptions
  /** Optional, props passed to inner wrapper div */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
  /** Optional, required when we want code highlighting, registers highlight languages */
  registerHljs?: () => void
}) => {
  if (props.registerHljs) props.registerHljs()

  const md = markdownit({
    ...defaultMarkdownOptions,
    ...props.options,
    highlight: props.registerHljs ? hljsMarkdownIt : null
  })

  props.setMD?.(md)

  return <div {...props.$div} innerHTML={md.render(props.content)} />
}

export const defaultMarkdownOptions: MarkdownItOptions = {
  html: true,
  linkify: true,
  typographer: true
}


export type MarkdownItStaticProps = Parameters<typeof MarkdownItStatic>[0]
