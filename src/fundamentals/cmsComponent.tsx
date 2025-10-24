/**
 * 🧚‍♀️ How to access:
 *     - Plugin: `markdownIt`
 *     - import {CMS } from '@ace/cmsComponent'
 *     - import type { MarkdownProps, MarkdownIt, MarkdownItOptions } from '@ace/markdown'
 */


import { CMSItem } from './types'
import { Loading } from './loading'
import { MarkdownIt } from './markdownIt'
import { feComponent } from './feComponent'
import { Show, Suspense, type JSX } from 'solid-js'



export const CMS = feComponent((props: { item: null | CMSItem, $div?: JSX.HTMLAttributes<HTMLDivElement> }) => {
  return <>
    <Suspense fallback={<Loading />}>
      <Show when={props.item?.isMarkdown} fallback={<div innerText={props.item?.content} {...props.$div} />}>
        <MarkdownIt content={() => props.item?.content} $div={props.$div} />
      </Show>
    </Suspense>
  </>
})



export type CMSProps = Parameters<typeof CMS>[0]
