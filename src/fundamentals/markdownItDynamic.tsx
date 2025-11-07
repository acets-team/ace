/**
 * 🧚‍♀️ How to access:
 *     - Plugin: `markdownIt`
 *     - import { MarkdownItDynamic } from '@ace/markdownItDynamic'
 *     - import type { MarkdownItDynamicProps } from '@ace/markdownItDynamic'
 */


import markdownit from 'markdown-it'
import { feComponent } from './feComponent'
import { initMarkdownIt } from '../markdownIt'
import { type Options as MarkdownItOptions } from 'markdown-it'
import { createMemo, type JSX, type Setter, type Accessor } from 'solid-js'


/**
 * - On refresh, markdown is rendered on `FE`
 *     - For best SEO please use `<MarkdownItStatic />`
 *     - For dynamic/immediate FE updates use `<MarkdownItDynamic />`
 * - 🚨 IF not highlighting code THEN `registerHljs` AND `hljsMarkdownItOptions` are not necessary
 * @example
```ts
import { registerHljs } from '@src/init/registerHljs'
import { MarkdownItDynamic } from '@ace/markdownItDynamic'
import { hljsMarkdownItOptions } from '@ace/hljsMarkdownItOptions'

<MarkdownItDynamic content={() => store.buildStats} registerHljs={registerHljs} options={{ highlight: hljsMarkdownItOptions }} />
```
 * @param content - Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()`
 * @param setMD - in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD`
 * @param options - Optional, requested options will be merged w/ the `defaultMarkdownOptions`
 * @param $div - Optional, props passed to inner wrapper div
 * @param registerHljs - Optional, required when we want code highlighting, registers highlight languages
 */
export const MarkdownItDynamic = feComponent((props: {
  /** Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()` */
  content: Accessor<string | undefined>
  /** in parent `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` */
  setMD?: Setter<markdownit | undefined>
  /** Optional, requested options will be merged w/ the `defaultMarkdownOptions` */
  options?: MarkdownItOptions
  /** Optional, props passed to inner wrapper div */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
  /** Optional, to enable code highlighting pass a function here that registers highlight languages */
  registerHljs?: () => void
}) => {
  if (props.registerHljs) props.registerHljs()

  const html = createMemo(() => {
    const md = initMarkdownIt({ options: props.options, registerHljs: props.registerHljs, setMD: props.setMD })
    const _content = props.content?.()

    return md && _content ? md.render(_content) : ''
  })

  return <div {...props.$div} innerHTML={html()} />
})



export type MarkdownItDynamicProps = Parameters<typeof MarkdownItDynamic>[0]
