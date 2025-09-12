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
 * @example
  ```tsx
  // 🗂️ ./src/Home/Home.tsx

  import { CMS } from '@ace/cmsComponent'

  export default new Route('/')
    .component(() => {
      const cms = cmsLoad('home') // load cms items to a map, by id, for the home page

      return <>
        <CMS cms={cms} id={1} />
      </>
    })

  // 🗂️ ./src/lib/cmsLoad.ts

  import { load } from '@ace/load'
  import { CMS } from '@ace/cmsInstance'
  import { apiGetCMSByPage } from '@ace/apis'
  import type { PageNames } from '@src/lib/vars'


  export function cmsLoad(page: PageNames) {
    return new CMS(load({ key: 'cms-' + page, fn: () => apiGetCMSByPage({ pathParams: {name: page}}) }))
  }
  ```
 * @param props.cms - `const cms = cmsLoad('home')` - `cmsLoad(page) => new CMS(load({ key: 'cms-' + page, fn: () => apiGetCMSByPage({ pathParams: {name: page}}) }))`
 * @param props.cms - identifier
 * @param props.divProps - Optional, props to be given to `<Markdown>`
 */
export function CMS({ cms, id, divProps }: CMSProps) {
  const content = () => cms.getContent(id)

  return <>
    <Show when={content()} fallback={<Loading />}>
      <Show when={cms.getValue(id)?.isMarkdown} fallback={<div innerText={content()} />}>
        <Markdown divProps={divProps} content={content()} />
      </Show>
    </Show>
  </>
}



export type CMSProps = {
  /** cms map that has cms items by id */
  cms: CMSInstance
  /** identifier to point us to content in cms map */
  id: number
  /** Optional, props to be given to `<Markdown>` */
  divProps?: JSX.HTMLAttributes<HTMLDivElement>
}
