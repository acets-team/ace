/**
 * 🧚‍♀️ How to access:
 *     - Plugin: `markdownIt`
 *     - import { MarkdownItDynamic, defaultMarkdownOptions } from '@ace/markdownItDynamic'
 *     - import type { MarkdownItDynamicProps } from '@ace/markdownItDynamic'
 */


import markdownit from 'markdown-it'
import { feComponent } from './feComponent'
import { hljsMarkdownIt } from '../hljsMarkdownIt'
import { type Options as MarkdownItOptions } from 'markdown-it'
import { createMemo, type JSX, type Setter, type Accessor } from 'solid-js'


/**
 * - On refresh, markdown is rendered on `FE`
 *     - For best SEO please use `<MarkdownItStatic />`
 *     - For dynamic/immediate FE updates use `<MarkdownItDynamic />`
 * @example
```ts
import { registerHljs } from '@src/init/registerHljs'
import { MarkdownItDynamic } from '@ace/markdownItDynamic'

<MarkdownItDynamic content={() => store.buildStats} registerHljs={registerHljs} />
```
 * @param content - Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()`
 * @param setMD - in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD`
 * @param options - Optional, defaults to `defaultMarkdownOptions`, can override one prop at a time b/c we merge
 * @param $div - Optional, props passed to inner wrapper div
 * @param registerHljs - Optional, required when we want code highlighting, registers highlight languages
 */
export const MarkdownItDynamic = feComponent((props: {
  /** Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()` */
  content: Accessor<string | undefined>
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

  const md = createMemo(() => {
    const o: MarkdownItOptions = {
      ...defaultMarkdownOptions,
      ...props.options,
      highlight: props.registerHljs ? hljsMarkdownIt : null
    }

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



export const defaultMarkdownOptions: MarkdownItOptions = {
  html: true,
  linkify: true,
  typographer: true
}



export type MarkdownItDynamicProps = Parameters<typeof MarkdownItDynamic>[0]
