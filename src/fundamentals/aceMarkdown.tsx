/**
 * 🧚‍♀️ How to access:
 *     - Plugin: markdownIt & optionally hljs
 *     - import { AceMarkdown, parseAceMarkdown, getInfo, interpolate } from '@ace/aceMarkdown'
 *     - import type { AceMarkdownProps } from '@ace/aceMarkdown'
 */


import type markdownit from 'markdown-it'
import { initMarkdownIt } from '../markdownIt'
import { Tabs, ContentTab, type TabsProps } from './tabs'
import { For, mergeProps, Setter, type JSX } from 'solid-js'
import type { Options as MarkdownItOptions } from 'markdown-it'


/**
 * - Converts `markdown` to `html` AND supports `Directives`, added via `comments` that start with  `<!--{`, end with `}-->` and include `JSON` w/in, `Directives`:
 *     - `$info`:
 *         - Example: `<!--{ "$info": true, "$interpolate": true, "title": "What is Ace?", "slug": "what-is-ace" }-->`
 *         - IF `$info.$interpolate` is `true` THEN `vars` from `$info` can be placed @ `markdown`, `component props`, `tab label` & `tab content`
 *     - `$component`:
 *         - Adds a Solid component into markdown 🙌
 *         - Example: `<!--{ "$component": "Example", "title": "{title}" }-->`
 *         - THEN pass the `component function` to `AceMarkdown`, example: `<AceMarkdown content={mdWhatIsAce} components={[Example]} />`
 *     - ❤️ `$tabs`:
 *         - Example: `<!--{ "$tabs": ["TS", "JS"] }-->`
 *         - The value in the directive @ `$tabs` is the tab `labels`, so for this example there would be 2 labels, one is `TS` and the other is `JS`
 *         - Place the tab content below the `Directive`
 *         - 🚨 Add `---` at the end of each tab content to let us know where each tab content ends
 *         - IF the number of `content items` does not match the number of `labels` THEN we'll throw an error
 *         - ✅ Tab content may include, `markdown`, or `components`
 *         - W/in the `Directive` these additional `TabsProps` can be provided of `{ name?: string, variant?: 'underline' | 'pill' | 'classic', $div?: JSX.HTMLAttributes<HTMLDivElement> }`
 *             - Example: `<!--{ "$tabs": ["TS", "JS"], "variant": "underline" }-->`
 * @example
  ```tsx
  // 🚨 IF not highlighting code THEN `registerHljs` AND `hljsMarkdownItOptions` are not necessary

  import { AceMarkdown } from '@ace/aceMarkdown'
  import { Example } from '@src/Example/Example'
  import mdAppInfo from '@src/md/mdAppInfo.md?raw'
  import { registerHljs } from '@src/init/registerHljs'
  import { hljsMarkdownItOptions } from '@ace/hljsMarkdownItOptions'

  <AceMarkdown content={mdAppInfo} components={[Example]} registerHljs={registerHljs} markdownItOptions={{ highlight: hljsMarkdownItOptions }} />
  ```
 * @param props.content - Ace Markdown Content, example: `import mdWhatIsAce from '@src/md/mdWhatIsAce.md?raw'`, then provide `mdWhatIsAce` here
 * @param props.components - Components that are in the AceMarkdown, just passing the function names is perfect
 * @param props.setMD - Helpful when you'd love the markdownIt instance, example: `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` here
 * @param props.markdownItOptions - Optional, requested options will be merged w/ the `defaultMarkdownOptions`
 * @param props.$div - Optional, props passed to inner wrapper div
 * @param props.registerHljs - Optional, to enable code highlighting pass a function here that registers highlight languages
 */
export function AceMarkdown(props: {
  /** Ace Markdown Content, example: `import mdWhatIsAce from '@src/md/mdWhatIsAce.md?raw'`, then provide `mdWhatIsAce` here  */
  content: string,
  /** Components that are in the AceMarkdown, just passing the function names is perfect */
  components?: (() => JSX.Element)[],
  /** Helpful when you'd love the markdownIt instance, example: `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` here */
  setMD?: Setter<markdownit | undefined>
  /** Optional, requested options will be merged w/ the `defaultMarkdownOptions` */
  markdownItOptions?: MarkdownItOptions
  /** Optional, props passed to inner wrapper div */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
  /** Optional, to enable code highlighting pass a function here that registers highlight languages */
  registerHljs?: () => void,
}) {
  const res = parseAceMarkdown(props.content)

  const componentMap: ComponentMap = new Map()

  const md = initMarkdownIt({ markdownItOptions: props.markdownItOptions, registerHljs: props.registerHljs, setMD: props.setMD })

  if (props.components) {
    for (const component of props.components) {
      const name = component.name.replace(/^\[solid-refresh\]/, '')
      componentMap.set(name, component)
    }
  }

  /** Render an item (markdown, component or tabs) */
  const RenderItem = (renderItemProps: { item: AceMarkdownItem }) => {
    switch (renderItemProps.item.$type) {
      case 'markdown':
        return <div {...props.$div} innerHTML={md.render(renderItemProps.item.content)} />


      case 'component':
        const Component = componentMap.get(renderItemProps.item.name)
        if (!Component) throw new Error(`@ <AceMarkdown /> we arre missing the component: ${renderItemProps.item.name}`)
        return <Component {...renderItemProps.item.props} />


      case 'tabs':
        const defaultTabsProps: Omit<TabsProps, 'name' | 'scrollMargin' | '$div'> = {
          variant: 'pill',
          mode: 'content',
          tabs: () => {
            if (renderItemProps.item.$type !== 'tabs') return []

            return renderItemProps.item.tabs.map((tab) => {
              const content = () => <For each={tab.content}>{(sub) => <RenderItem item={sub} />}</For>
              return new ContentTab(tab.label, content)
            })
          }
        }

        const mergedTabsProps = mergeProps(defaultTabsProps, renderItemProps.item.tabsProps)

        return <Tabs {...mergedTabsProps} />

      default:
        throw new Error(`@ <AceMarkdown /> unknown item: "${renderItemProps.item}"`)
    }
  }

  return <>
    <div {...props.$div}>
      <For each={res}>{(item) => <RenderItem item={item} />}</For>
    </div>
  </>
}



/**
 * - Receives: `Ace Markdown String`
 * - Gives: Array of `$info`, `$tabs` & `$component`
 * @param str - `Ace Markdown String`
 * @param $info - When calling for the first time probably undefined, but when we gather the `$info` from the `Ace Markdown String` and then need to also parse a `Ace Tabs Content` we will recall `parseAceMarkdown()` w/ `$info`
 */
export function parseAceMarkdown(str: string, $info: Record<string, any> = {}): AceMarkdownItem[] {
  let strIndex = /** tracks where we are in the `str` */ (0)
  const results: AceMarkdownItem[] = /** holds items of `$type`: (`markdown`, `tabs` & `component`) */ ([])
  const pattern = /** match `$info`, `$tabs` & `$component` directives */ (/([\s\S]*?)<!--\{([\s\S]*?)\}-->/g)

  for (const match of str.matchAll(pattern)) { // iterate though each directive
    const [full, beforeDirective, innerDirective] = match // var out match + give default values for ts
    const before = beforeDirective ?? ''
    const inner = innerDirective ?? ''
    const matchIndex = match.index ?? 0

    if (before.trim()) { // if there is markdown before the directive THEN add markdown to results
      results.push({ $type: 'markdown', content: interpolate(before.trim(), $info) })
    }

    let jsonDirective: undefined | Record<string, any>

    try {
      jsonDirective = JSON.parse(`{${inner.replace(/\n/g, '').trim()}}`)
    } catch (err) {
      throw new Error(`AceMarkdown tried to JSON.parse() the following Directive, but this threw an error @: \n\nDirective:\n${inner.trim()}`)
    }

    if (!jsonDirective) continue


    // $info
    if (jsonDirective.$info) {
      Object.assign($info, jsonDirective) // merge any $info into global $info
      strIndex = matchIndex + full.length // move cursor past directive
    }


    // $component
    if (jsonDirective.$component) {
      const propsWithInterp: Record<string, any> = {}
      const { $component: componentName, ...componentProps } = jsonDirective // var out from jsonDirective the `componentName` and `componentProps`

      for (const key in componentProps) {
        const val = componentProps[key]
        propsWithInterp[key] = typeof val === 'string' ? interpolate(val, $info) : val
      }

      results.push({ $type: 'component', name: componentName, props: propsWithInterp })

      strIndex = matchIndex + full.length // move cursor past directive
    }


    // $tabs
    if (jsonDirective.$tabs) {
      const strIndexAfterDirective = matchIndex + full.length
      const strAfterDirective = /** content following the directive */ (str.slice(strIndexAfterDirective))
      const tabContents = /** array that holds the content in each tab */ (strAfterDirective.split(/^\s*---\s*$/m))

      const { $tabs: labels, ...tabsProps } = jsonDirective // var out from jsonDirective the `labels` and `TabsProps`

      /** 
       * - Array
       * - For each tab has the label & content
       * - B/c the tab content can have components & markdown we call parseAceMarkdown() w/ the content
       */
      const tabs = labels.map((label: string, i: number) => ({
        label: interpolate(label, $info),
        content: parseAceMarkdown(tabContents[i] || '', $info),
      }))

      results.push({ $type: 'tabs', tabs, tabsProps }) // add tabs to results

      let consumedLength = /** tells us how far to skip in string after processing tabs */ (0)

      for (let i = 0; i < labels.length; i++) {
        consumedLength += tabContents[i]?.length || 0 // skip: tab content
        consumedLength += 4 // skip: ---\n
      }

      strIndex = strIndexAfterDirective + consumedLength // move cursor past tabs
    }
  }


  const remaining = /** any leftover markdown after last directive */ (str.slice(strIndex).trim())

  if (remaining) results.push({ $type: 'markdown', content: interpolate(remaining, $info) }) // add remaining markdown to results

  return results
}



/**
 * - Helpful when you don't wanna parse the entire markdown & only need the `$info Directive`
 * - Regex matches the first `directive` w/in `str` that contains `"$info": true`
 * @param str - Markdown string
 * @returns IF `$info` is not found THEN returns `undefined` ELSE returns `$info` as a `Record<string, any>`
 */
export function getInfo(str: string): undefined | Record<string, any> {
  const pattern = /<!--\{([\s\S]*?\$info\s*:\s*true[\s\S]*?)\}-->/ // match the first directive that contains "$info": true

  const match = str.match(pattern)
  if (!match) return undefined

  const innerDirective = match[1]?.trim() ?? ''

  const directive = JSON.parse(`{${innerDirective.replace(/\n/g, '').trim()}}`) // remove any line breaks in the directive & then parse it
  if (directive.$info === true) return directive // return the info directive
}



/**
 * IF `$info.$interpolate` is `true` THEN convert string w/ vars to string w/ values
 * @example
```ts
const $info = { $info: true, $interpolate: true, title: 'What is Ace?' }
const template = '# {title} ❤️'
const res = interpolate(template, $info)
console.log(res) // # What is Ace? ❤️
```
 * @param str - Has the vars in it, example:  `Hi {name}, welcome to { location }!`
 * @param $info - `$info` & `$interpolate` are Ace specific, all else is custom info about markdown
 * @returns - String w/ vars replaced by values
 */
export function interpolate(str: string, $info: Record<string, any>) {
  return $info.$interpolate === true
    ? str.replace(/\{\s*(\w+)\s*\}/g, (_, key) => ($info[key] ?? `{${key}}`))
    : str
}



export type AceMarkdownProps = Parameters<typeof AceMarkdown>[0]



type ComponentMap = Map<string, () => JSX.Element>



type MarkdownItem = {
  $type: 'markdown'
  content: string
}

type ComponentItem = {
  $type: 'component'
  name: string
  props: Record<string, any>
}

type TabsItem = {
  $type: 'tabs'
  tabs: {
    label: string
    content: AceMarkdownItem[]
  }[]
  tabsProps?: Partial<Omit<TabsProps, 'tabs' | 'mode' | 'scrollMargin'>>
}


type AceMarkdownItem = MarkdownItem | ComponentItem | TabsItem
