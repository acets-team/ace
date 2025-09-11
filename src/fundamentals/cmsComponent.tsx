/**
 * 🧚‍♀️ How to access:
 *     - Plugin: `markdownIt`
 *     - import {CMS } from '@ace/cmsComponent'
 *     - import type { MarkdownProps, MarkdownIt, MarkdownItOptions } from '@ace/markdown'
 */


import { Loading } from './loading'
import { Markdown } from './markdown'
import { Show, type JSX } from 'solid-js'
import { CMS as CMSInstance } from './cmsInstance'



/**
 * CMS Component
 * @param props.cms - `const cms = cmsLoad('home')` - `cmsLoad(page) => new CMS(load({ key: 'cms-' + page, fn: () => apiGetCMSByPage({ pathParams: {name: page}}) }))`
 * @param props.cms - identifier
 * @param props.cms - Optional, props to be given to `<Markdown>`
 */
export function CMS({ cms, id, divProps }: CMSProps) {
  return <>
    <Show when={cms.getContent(id)} fallback={<Loading />}>
      <Markdown divProps={divProps} content={cms.getContent(id)} />
    </Show>
  </>
}



export type CMSProps = {
  /** `const cms = cmsLoad('home')` - `cmsLoad(page) => new CMS(load({ key: 'cms-' + page, fn: () => apiGetCMSByPage({ pathParams: {name: page}}) }))` */
  cms: CMSInstance,
  /** identifier */
  id: number,
  /** Optional, props to be given to `<Markdown>` */
  divProps?: JSX.HTMLAttributes<HTMLDivElement>
}
