/**
 * 🧚‍♀️ How to access:
 *     - Plugin: markdownIt & optionally hljs
 *     - import { MarkdownItStatic } from '@ace/markdownItStatic'
 *     - import type { MarkdownItStaticProps } from '@ace/markdownItStatic'
 */


import markdownit from 'markdown-it'
import type { JSX, Setter } from 'solid-js'
import { initMarkdownIt } from '../markdownIt'
import type { Options as MarkdownItOptions } from 'markdown-it'


/**
 * - On refresh, markdown is rendered on `BE`
 *     - For best SEO please use `<MarkdownItStatic />`
 *     - For dynamic/immediate FE updates use `<MarkdownItDynamic />`
 * - 🚨 IF not highlighting code THEN `registerHljs` AND `hljsMarkdownItOptions` are not necessary
 * @example
```ts
import mdAppInfo from '@src/md/mdAppInfo.md?raw'
import { registerHljs } from '@src/init/registerHljs'
import { MarkdownItStatic } from '@ace/markdownItDynamic'
import { hljsMarkdownItOptions } from '@ace/hljsMarkdownItOptions'

<MarkdownItStatic content={mdAppInfo} registerHljs={registerHljs} options={{ highlight: hljsMarkdownItOptions }} />
```
 * @param content - Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()`
 * @param setMD - Helpful when you'd love the markdownIt instance, example: `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` here
 * @param markdownItOptions - Optional, requested options will be merged w/ the `defaultMarkdownOptions`
 * @param $div - Optional, props passed to inner wrapper div
 * @param registerHljs - Optional, required when we want code highlighting, registers highlight languages
 */
export const MarkdownItStatic = (props: {
  /** Content to render from markdown to html, can also pass content later by updating the passed in content prop or `md()?.render()` */
  content: string,
  /** Helpful when you'd love the markdownIt instance, example: `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` here */
  setMD?: Setter<markdownit | undefined>
  /** Optional, requested options will be merged w/ the `defaultMarkdownOptions` */
  markdownItOptions?: MarkdownItOptions
  /** Optional, props passed to inner wrapper div */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
  /** Optional, to enable code highlighting pass a function here that registers highlight languages */
  registerHljs?: () => void
}) => {
  const md = initMarkdownIt({ markdownItOptions: props.markdownItOptions, registerHljs: props.registerHljs, setMD: props.setMD })

  return <div {...props.$div} innerHTML={md.render(props.content)} />
}



export type MarkdownItStaticProps = Parameters<typeof MarkdownItStatic>[0]
