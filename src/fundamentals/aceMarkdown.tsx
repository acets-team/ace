/**
 * 🧚‍♀️ How to access:
 *     - Plugin: markdownIt & optionally hljs
 *     - import { AceMarkdown, getInfo, defaultMarkdownOptions } from '@ace/aceMarkdown'
 *     - import type { AceMarkdownProps, AceMarkdownInfo, AceMarkdownHeading, SetHeadings } from '@ace/aceMarkdown'
 */


import markdownit from 'markdown-it'
import type { Options as MarkdownItOptions } from 'markdown-it'
import { Tabs, ContentTab, type TabsProps, type Tab } from './tabs'
import { createMemo, mergeProps, For, type Setter, type JSX, onMount } from 'solid-js'



/**
 * - Converts `markdown` to `html`
 * - SEO friendly by default, so if the `content` prop is defined on the BE (ex: from file or database) then the rendered html will be SEO available during `View Page Source`
 * - Dynamic by default, so if the `content` prop changes at run-time (example: based on text area input) then the markdown will change
 * - Supports `Directives`, added via `comments` that start with  `<!--{`, end with `}-->` and include `JSON` w/in
 *     - `$info`:
 *         - Example: `<!--{ "$info": true, "$interpolate": true, "title": "What is Ace?", "slug": "what-is-ace" }-->`
 *         - IF `$info.$interpolate` is `true` THEN `vars` from `$info` can be placed @ `markdown`, `component props`, `tab label` & `tab content`
 *     - `$component`:
 *         - Adds a Solid component into markdown 🙌
 *         - Example: `<!--{ "$component": "Example", "title": "{title}", "$div": { "class": "lovely" } }-->`
 *         - THEN pass the `component function` to `AceMarkdown`, example: `<AceMarkdown content={mdWhatIsAce} components={[Example]} />`
 *     - ❤️ `$tabs`:
 *         - Example: `<!--{ "$tabs": ["TS", "JS"] }-->`
 *         - The value in the directive @ `$tabs` is the tab `labels`, so for this example there would be 2 labels, one is `TS` and the other is `JS`
 *         - Place the tab content below the `Directive`
 *         - 🚨 Add the directive `<!--{ "$tabContentEnd": true }-->` at the end of each tab content to let us know where each tab content ends
 *         - 🚨 For speed, the `<!--{ "$tabContentEnd": true }-->` does not use regex and instead uses an exact string find so please copy/paste the directive exactly
 *         - IF the number of `content items` does not match the number of `labels` THEN we'll throw an error
 *         - ✅ Tab content may include, `markdown`, or `components`
 *         - W/in the `$tabs` directive, we support these additional `TabsProps`:
 *             - `{ name?: string, variant?: 'underline' | 'pill' | 'classic' | 'tron', $div?: JSX.HTMLAttributes<HTMLDivElement> }`
 *             - Example: `<!--{ "$tabs": ["TS", "JS"], "variant": "tron" }-->`
 * @example
  ```tsx
  import { AceMarkdown } from '@ace/aceMarkdown'
  import { Example } from '@src/Example/Example' // 🚨 only necessary IF adding Solid components w/in markdown
  import mdAppInfo from '@src/md/mdAppInfo.md?raw'
  import { container } from '@mdit/plugin-container' // 🚨 only necessary IF adding this custom plugin: https://mdit-plugins.github.io/
  import { registerHljs } from '@src/init/registerHljs' // 🚨 only necessary IF highlighting code
  import { hljsMarkdownItOptions } from '@ace/hljsMarkdownItOptions' // 🚨 only necessary IF highlighting code

  const {set} = useStore() // 🚨 only necessary IF setting headings, ex: "On This Page" support

  <AceMarkdown
    content={mdAppInfo}
    components={[Example]}
    registerHljs={registerHljs}
    setHeadings={(v) => set('headings', v)}
    markdownItOptions={{ highlight: hljsMarkdownItOptions }}
    configPlugins={(md) => {
      md.use(container, { name: 'table-scroll' })
    }} />
  ```
 * @param props.content - Optional, whenever the content is ready / updated, `<AceMarkdown />` will update the rendered html, can come from anywhere, example: `import mdWhatIsAce from '@src/md/mdWhatIsAce.md?raw'`, then provide `mdWhatIsAce` here
 * @param props.components - Components that are in the AceMarkdown, just passing the function names is perfect
 * @param props.setMD - Helpful when you'd love the markdownIt instance, example: `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` here
 * @param props.markdownItOptions - Optional, requested options will be merged w/ the `defaultMarkdownOptions`
 * @param props.$div - Optional, props passed to inner wrapper div
 * @param props.registerHljs - Optional, to enable code highlighting pass a function here that registers highlight languages
 * @param props.setHeadings - Optional, when defined we will return call this setter when we get the list of `headings` and ensure the `headings` in your `html` are anchors that align w/ the list
 * @param props.$info - Optional, when set we will merge this $info object w/ whatever $info we find in the markdown if any and that will be the $info we use
 * @param props.configPlugins - Optional, helpful when you'd love to add plugins: https://mdit-plugins.github.io/
 */
export function AceMarkdown(props: {
  /** Ace Markdown Content, example: `import mdWhatIsAce from '@src/md/mdWhatIsAce.md?raw'`, then provide `mdWhatIsAce` here  */
  content?: string,
  /** Components that are in the AceMarkdown, just passing the function names is perfect */
  components?: ((...args: any) => JSX.Element)[],
  /** Helpful when you'd love the markdownIt instance, example: `const [md, setMD] = createSignal<MarkdownIt>()` and then pass `setMD` here */
  setMD?: Setter<markdownit | undefined>
  /** Optional, requested options will be merged w/ the `defaultMarkdownOptions` */
  markdownItOptions?: MarkdownItOptions
  /** Optional, props passed to inner wrapper div */
  $div?: JSX.HTMLAttributes<HTMLDivElement>,
  /** Optional, to enable code highlighting pass a function here that registers highlight languages */
  registerHljs?: () => void,
  /** Optional, accepts a `Setter<Tab>`, helpful when you'd love to know when a tab has been activated */
  setCurrentTab?: (tab: Tab) => void
  /** Optional, when defined we will return call this setter when we get the list of `headings` and ensure the `headings` in your `html` are anchors that align w/ the list */
  setHeadings?: SetHeadings
  /** Optional, when set we will merge this info object w/ whatever $info we find in the markdown if any and that will be the info we use */
  $info?: AceMarkdownInfo
  /** Optional, helpful when you'd love to add plugins: https://mdit-plugins.github.io/ */
  configPlugins?: (md: markdownit) => void
}) {
  const res = createMemo(() => {
    return parseAceMarkdown(props.content, props.$info, props.setHeadings)
  })

  const componentMap: ComponentMap = new Map()

  if (props.registerHljs) props.registerHljs()

  const md = markdownit({
    ...defaultMarkdownOptions,
    ...props.markdownItOptions,
  })

  if (props.configPlugins) {
    props.configPlugins(md)
  }

  props.setMD?.(md)

  if (props.components) {
    for (const component of props.components) {
      const name = component.name.replace(/^\[solid-refresh\]/, '')
      componentMap.set(name, component)
    }
  }

  return <>
    <div {...props.$div}>
      <For each={res()}>{(item) => <RenderItem md={md} item={item} componentMap={componentMap} componentProps={props} />}</For>
    </div>
  </>
}



function RenderItem(props: { md: markdownit, item: AceMarkdownItem, componentMap: ComponentMap, componentProps: AceMarkdownProps }) {
  switch (props.item.$type) {
    case 'markdown':
      return <div innerHTML={props.md.render(props.item.content)} />


    case 'component':
      const Component = props.componentMap.get(props.item.name)
      if (!Component) throw new Error(`@ <AceMarkdown /> we arre missing the component: ${props.item.name}`)
      return <Component {...props.item.props} />


    case 'tabs':
      const defaultTabsProps: Omit<TabsProps, 'scrollMargin' | '$div'> = {
        mode: 'content',
        variant: 'pill',
        setCurrentTab: props.componentProps.setCurrentTab,
        tabs: () => {
          if (props.item.$type !== 'tabs') return []

          return props.item.tabs.map((tab) => {
            const content = () => <For each={tab.content}>{(sub) => <RenderItem item={sub} md={props.md} componentMap={props.componentMap} componentProps={props.componentProps} />}</For>
            return new ContentTab(tab.label, content)
          })
        }
      }

      const mergedTabsProps = mergeProps(defaultTabsProps, props.item.tabsProps)

      return <Tabs {...mergedTabsProps} />

    default:
      throw new Error(`@ <AceMarkdown /> unknown item`, { cause: { props } })
  }
}




/**
 * - Receives: `Ace Markdown String`
 * - Gives: Array of `$info`, `$tabs` & `$component`
 * @param str - `Ace Markdown String`
 * @param $info - When calling for the first time probably undefined, but when we gather the `$info` from the `Ace Markdown String` and then need to also parse a `Ace Tabs Content` we will recall `parseAceMarkdown()` w/ `$info`
 */
function parseAceMarkdown(str?: string, $info: AceMarkdownInfo = {}, setHeadings?: SetHeadings): AceMarkdownItem[] {
  if (!str) return []

  let strIndex = /** tracks where we are in the `str` */ (0)
  const results: AceMarkdownItem[] = /** holds items of `$type`: (`markdown`, `tabs` & `component`) */ ([])
  const pattern = /** match `$info`, `$tabs` & `$component` directives */ (patterns.directives)
  let headings: AceMarkdownHeading[] = /** aggregate headings so we only call setHeadings once w/ all of them  */ ([])

  for (const match of str.matchAll(pattern)) { // iterate though each directive
    const matchIndex = match.index ?? 0

    if (matchIndex < strIndex) continue  // skip already-consumed content (helps w/ skipping directives found in tabs, ex: (<!--{ "$tabContentEnd": true }-->)

    const [full, beforeDirective, innerDirective] = match // var out match + give default values for ts
    const before = beforeDirective ?? ''
    const inner = innerDirective ?? ''

    const result = prepMarkdownPush(before.trim(), headings, setHeadings)

    if (result.content) { // IF there is markdown before the directive THEN add markdown to results
      headings = result.headings
      results.push({ $type: 'markdown', content: interpolate(result.content, $info) }) // add remaining markdown to results
    }

    let jsonDirective: undefined | Record<string, any>

    try {
      jsonDirective = JSON.parse(`{${inner.replace(patterns.newLine, '').trim()}}`)
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
      const tabEndDirective = '<!--{ "$tabContentEnd": true }-->'
      const strAfterDirective = /** content following the directive */ (str.slice(strIndexAfterDirective))
      const tabContents = /** array that holds the content in each tab */ (strAfterDirective.split(tabEndDirective))

      const { $tabs: labels, ...tabsProps } = jsonDirective // var out from jsonDirective the `labels` and `TabsProps`

      /** 
       * - Array
       * - For each tab has the label & content
       * - B/c the tab content can have components & markdown we call parseAceMarkdown() w/ the content
       */
      const tabs = labels.map((label: string, i: number) => ({
        label: interpolate(label, $info),
        content: parseAceMarkdown(tabContents[i] || '', $info, setHeadings),
      }))

      results.push({ $type: 'tabs', tabs, tabsProps }) // add tabs to results

      let consumedLength = /** tells us how far to skip in string after processing tabs */ (0)

      for (let i = 0; i < labels.length; i++) {
        consumedLength += tabContents[i]?.length || 0 // skip: tab content
        consumedLength += tabEndDirective.length + 1 // skip: <!--{ "$tabContentEnd": true }-->\n
      }

      strIndex = strIndexAfterDirective + consumedLength // move cursor past tabs
    }
  }


  const remaining = /** any leftover markdown after last directive */ (str.slice(strIndex).trim())

  const result = prepMarkdownPush(remaining, headings, setHeadings)

  if (result.content) {
    headings = result.headings
    results.push({ $type: 'markdown', content: interpolate(result.content, $info) }) // add remaining markdown to results
  }

  if (setHeadings) {
    onMount(() => { // w/o onMount we get hydration errors
      setHeadings(headings)
    })
  }

  return results
}



function prepMarkdownPush(content: string, headings: AceMarkdownHeading[], setHeadings?: SetHeadings) {
  if (content && setHeadings) {
    const result = getHeadingsAndInjectHtml(content)

    content = result.updatedContent

    headings = headings.concat(result.headings)
  }

  return { content, headings }
}



function getHeadingsAndInjectHtml(markdown: string) {
  const headings: AceMarkdownHeading[] = []
  let inCode = false
  const slugCount: Record<string, number> = {}

  const updatedLines = markdown.split('\n').map(line => {
    if (patterns.codeFence1.test(line) || patterns.codeFence2.test(line)) { // detect fenced code block start/end
      inCode = !inCode
      return line
    }

    if (!inCode && line.startsWith('#')) {
      const rawText = line.replace(patterns.heading, '')
      const cleanText = cleanHeading(rawText)
      const level = line.match(patterns.headingLevel)![0].length

      // create unique slug (Astro style)
      const slugBase = createSlug(cleanText)
      let slug = slugBase
      if (slugCount[slugBase]) {
        slug = `${slugBase}-${slugCount[slugBase] + 1}`
      }
      slugCount[slugBase] = (slugCount[slugBase] || 0) + 1

      const html = createHeadingHtml({ level, text: cleanText, slug })

      // push to headings array
      headings.push({ level, label: cleanText, slug, html })

      // replace original markdown heading with HTML
      return `\n${html}\n`
    }

    return line
  })

  const updatedContent = updatedLines.join('\n')

  return { headings, updatedContent }
}



function createSlug(text: string): string {
  return text
    .toLowerCase()
    .trim()
    .replace(patterns.punctuation, '') // remove punctuation
    .replace(patterns.spaces, '-')  // spaces to dash
    .replace(patterns.surroundingDashes, '') // remove leading or trailing dashes
}



/** html to be placed w/in markdown so that we can jump to this heading */
function createHeadingHtml(props: { level: number, text: string, slug: string }) {
  return `<h${props.level} id="${props.slug}"><a href="#${props.slug}">${escapeHtml(props.text)}</a></h${props.level}>`
}



/** Just in case there is code w/in the heading we wanna escape it so it looks good */
function escapeHtml(str: string): string {
  return str
    .replace(patterns.ampersand, '&amp;')
    .replace(patterns.lessThan, '&lt;')
    .replace(patterns.greaterThan, '&gt;')
    .replace(patterns.quote, '&quot;')
    .replace(patterns.tick, '&#39;')
}



function cleanHeading(str: string): string {
  // First: preserve inline code ticks, we'll add them back as the last step
  // converts ""`outer `inner`` example" to "@@CODE0@@@@CODE1@@ example"
  const codes: string[] = []

  // replaces any number of ticks that has content between and then the same number of ticks w/ a code snippet before we do any further edits
  // ensures we don't edit the coded section and leave it as is
  str = str.replace(patterns.variableFence, (_, __, content) => {
    codes.push(content)
    return `@@CODE${codes.length - 1}@@`
  })

  str = str.replace(patterns.bold, '$2')
  str = str.replace(patterns.italic, '$2')
  str = str.replace(patterns.links, '$1')
  str = str.replace(patterns.images, '$1')
  str = str.replace(patterns.htmlTag, '')
  str = str.replace(patterns.aceCode, (_, i) => codes[Number(i)] ?? '')
  str = str.replace(patterns.escapes, '$1')
  return str.replace(patterns.whiteSpace, ' ').trim()
}



/**
 * - Helpful when you don't wanna parse the entire markdown & only need the `$info Directive`
 * - Regex matches the first `directive` w/in `str` that contains `"$info": true`
 * @param str - Markdown string
 * @returns IF `$info` is not found THEN returns `undefined` ELSE returns `$info` as a `Record<string, any>`
 */
export function getInfo(str: string): undefined | Record<string, any> {
  const pattern = patterns.infoDirective // match the first directive that contains "$info": true

  const match = str.match(pattern)
  if (!match) return undefined

  const innerDirective = match[1]?.trim() ?? ''

  const directive = JSON.parse(`{${innerDirective.replace(patterns.newLine, '').trim()}}`) // remove any line breaks in the directive & then parse it
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
function interpolate(str: string, $info: Record<string, any>) {
  if ($info.$interpolate !== true) return str

  return str.replace(patterns.interpolate, (_, key) => {
    const value = $info[key] ?? `{${key}}`
    return escapeHtml(String(value))
  });
}



const patterns = {
  tick: /'/g,
  quote: /"/g,
  spaces: /\s+/g,
  newLine: /\n/g,
  lessThan: /</g,
  ampersand: /&/g,
  greaterThan: />/g,
  heading: /^#+\s*/,
  codeFence1: /^```/,
  escapes: /\\(.)/g,
  whiteSpace: /\s+/g,
  codeFence2: /^~~~$/,
  headingLevel: /^#+/,
  htmlTag: /<\/?[^>]+>/g,
  italic: /(\*|_)(.*?)\1/g,
  punctuation: /[^\w\s-]/g,
  aceCode: /@@CODE(\d+)@@/g,
  bold: /(\*\*|__)(.*?)\1/g,
  surroundingDashes: /^-+|-+$/g,
  interpolate: /\{\s*(\w+)\s*\}/g,
  links: /\[([^\]]+)\]\([^\)]+\)/g,
  images: /!\[([^\]]*)\]\([^\)]+\)/g,
  variableFence: /(`+)([\s\S]*?)(?<!`)\1/g,
  directives: /([\s\S]*?)<!--\{([\s\S]*?)\}-->/g,
  infoDirective: /<!--\{([\s\S]*?["']?\$info["']?\s*:\s*true[\s\S]*?)\}-->/,
}



export const defaultMarkdownOptions: MarkdownItOptions = {
  html: true,
  linkify: true,
  typographer: true
}



export type AceMarkdownProps = Parameters<typeof AceMarkdown>[0]


export type AceMarkdownHeading = {
  level: number,
  label: string,
  slug: string,
  html: string
}


export type AceMarkdownInfo = Record<string, any>


/**
 * - Not an Accessor & just a generic Setter so that a signal setter or a store setter may be used
 * @example
```ts
const {set} = useStore() // setHeadings={(v) => set('headings', v)}
const [headings, setHeadings] = createSignal() // setHeadings={(v) => setHeadings(v)}
```
 */
export type SetHeadings = (headings: AceMarkdownHeading[]) => void


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
