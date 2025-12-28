/**
 * 🧚‍♀️ How to access:
 *     - Plugin: solid
 *     - import { Tabs, ContentTab, RouteTab, HashTab, setActiveByTabIndex, setActiveByPath, setActiveByHash } from '@ace/tabs'
 *     - import type { TabsProps, Tabs, Tab } from '@ace/tabs'
 */


import { mergeStrings } from './merge'
import { isServer } from 'solid-js/web'
import { treeSearch } from '../treeSearch'
import { Tron, type TronProps } from './tron'
import { useLocation } from '@solidjs/router'
import type { TreeCreateNode } from '../treeCreate'
import type { Routes, RoutePath2PathParams, RoutePath2SearchParams, MapRoutes } from './types'
import { onMount, mergeProps, createSignal, createEffect, For, Show, type JSX, type Accessor } from 'solid-js'


/**
 * ### Show lovely tabs
 * - 🚨 To change the background active color, the css variable is: `--ace-tabs-active`
 * - 🚨 To change the foreground active color, the css variable is: `--ace-tabs-active-foreground`
 * - Add to `app.tsx` => `import '@ace/tabs.styles.css'` & then:
 * @example
  ```tsx
  // route

  <Tabs
    mode="route"
    variant="pill"
    tabs={() => [
      new RouteTab('Home', '/'),
      new RouteTab('About', '/about'),
      new RouteTab('Members', '/members'),
    ]}
  />
  ```
 * @example
  ```tsx
  // scroll

  <Tabs
    name="nav"
    mode="scroll"
    variant="underline"
    scrollMargin={74}
    tabs={() => [
      new HashTab('Home', '#banner'),
      new HashTab('Offerings', '#carousel'),
      new HashTab('Spiritual Retreats', '#retreats'),
    ]}
  />
  ```
 * @example
  ```tsx
  // content

  <Tabs
    mode="content"
    variant="classic"
    tabs={() => [
      new ContentTab('Tab 1', <>Tab 1</>),
      new ContentTab('Tab 2', <>Tab 2</>),
      new ContentTab('Tab 3', <>Tab 3</>),
    ]}
  />
  ```
 *
 * @example
  ```ts
  setActiveByTabIndex('nav', 2)
  setActiveByPath('route', '/')
  setActiveByHash('hash', '#bio')
  ```
 * 
 * @param props.tabs - An array of `RouteTab`, `HashTab` or `ContentTab` objects. Place the Tabs component in a layout when using a mode of `route` to keep the animation smooth between routes
 * @param props.name - Optional, `name` is helpful when you have multiple tabs on the same page and want to use `setActiveByTabIndex()`, `setActiveByPath()` or `setActiveByHash()`
 * @param props.mode - `content` requires each tab to be a `ContentTab` and shows different content based on which tab is selected. `scroll` requires each tab to be a `HashTab` and scrolls to different content based on which tab is selected. `route` requires each tab to be a `RouteTab` and navigates to different pages based on which tab is selected.
 * @param props.variant - Optional, defaults to `pill`, `underline` is google style, `classic` is bootstrap style, and `pill` looks like rounded buttons
 * @param props.scrollMargin - Optional, defaults to `0`, if `props.mode` is `scroll` set `scrollMargin` if you'd love the scroll to end some pixels above the scrolled to item
 * @param props.$div - Optional, additonal props to place on the wrapper html div, ex: `id`, `class`, `style`
 * @param props.setCurrentTab -  Optional, Setter, helpful when you'd like to know what tab was just selected
 * @param props.$Tron - Optional, IF defined AND `variant` is `tron` THEN props passed to `Tron`
 */
export function Tabs(props: {
  /** An array of `RouteTab`, `HashTab` or `ContentTab` objects. Place the Tabs component in a layout when using a mode of `route` to keep the animation smooth between routes */
  tabs: Accessor<RouteTab<Routes>[] | HashTab[] | ContentTab[]>
  /** Optional, `name` is helpful when you have multiple tabs on the same page and want to use `setActiveByTabIndex()`, `setActiveByPath()` or `setActiveByHash()`. OR when want to query tabs or the content by id so `name` will ensure the `id's` are unique */
  name?: string
  /** `content` requires each tab to be a `ContentTab` and shows different content based on which tab is selected. `scroll` requires each tab to be a `HashTab` and scrolls to different content based on which tab is selected. `route` requires each tab to be a `RouteTab` and navigates to different pages based on which tab is selected. */
  mode: 'content' | 'scroll' | 'route'
  /** Optional, defaults to `pill`, `underline` is google style, `classic` is bootstrap style, and `pill` looks like rounded buttons */
  variant?: 'underline' | 'pill' | 'classic' | 'tron'
  /** Optional, defaults to `0`, if `props.mode` is `scroll` set `scrollMargin` if you'd love the scroll to end some pixels above the scrolled to item */
  scrollMargin?: number
  /** Optional, set to add props in wrapper `<div />` w/in `<Tabs/>` */
  $div?: JSX.HTMLAttributes<HTMLDivElement>
  /** Optional, Setter, helpful when you'd like to know what tab was just selected */
  setCurrentTab?: (tab: Tab) => void
  /** Optional, IF defined AND `variant` is `tron` THEN props passed to `Tron` */
  $Tron?: Omit<TronProps, 'type' | 'children'>
}) {
  const defaultTabsProps: Partial<TabsProps> = { scrollMargin: 0, mode: 'content', variant: 'pill' }
  props = mergeProps(defaultTabsProps, props)

  const pathToTabIndex = new Map<Routes, number>()
  const hashToTabIndex = new Map<string, number>()

  let initialContentIndex = 0
  let foundContentInitial = false

  props.tabs()?.forEach((tab: any, i: number) => {
    if (tab instanceof RouteTab) pathToTabIndex.set(tab.path, i)
    else if (tab instanceof HashTab) hashToTabIndex.set(tab.hash, i)
    else if (tab instanceof ContentTab && tab.isInitiallyActive && !foundContentInitial) {
      initialContentIndex = i
      foundContentInitial = true
    }
  })

  let initialIndex: number | undefined = undefined

  if (props.mode === 'content') initialIndex = initialContentIndex

  const [active, setActive] = createSignal<number | undefined>(initialIndex) // must be after tabs foreach 
  const [firstRender, setFirstRender] = createSignal(true)

  const [mapRoutes, setMapRoutes] = createSignal<MapRoutes>()
  const [treeRoutes, setTreeRoutes] = createSignal<TreeCreateNode>()

  if (props.mode === 'route' && !isServer) {
    (async () => {
      setMapRoutes((await import('./mapRoutes')).mapRoutes)
      setTreeRoutes((await import('./treeRoutes')).treeRoutes)
    })()

    createEffect(async () => {
      if (props.mode !== 'route' || !treeRoutes()) return

      const result = treeSearch(treeRoutes() as TreeCreateNode, useLocation().pathname)
      if (!result) return

      const tabIndex = pathToTabIndex.get(result.key as Routes)
      if (tabIndex === undefined || !(props.tabs()[tabIndex] instanceof RouteTab)) return

      const tab = props.tabs()[tabIndex]
      if (!(tab instanceof RouteTab)) return

      onTabClick(tabIndex, tab)
    })
  }


  let divTabs: HTMLDivElement | undefined
  let divActiveIndicator: HTMLDivElement | undefined

  const scrollData: { idx: number; top: number }[] = []
  const hashCache = new Map<string, { el: HTMLElement; idx: number }>()

  let ticking = false
  let scrollingProgrammatic = false
  let scrollEndTimeout = 0

  function computeScrollData() {
    if (props.scrollMargin === undefined) return

    scrollData.length = 0

    for (const { el, idx } of hashCache.values()) {
      scrollData.push({ idx, top: el.offsetTop })
    }

    scrollData.sort((a, b) => a.top - b.top)

    let currentTabIndex = 0
    const point = window.scrollY + props.scrollMargin

    for (const { idx, top } of scrollData) {
      if (top <= point) currentTabIndex = idx
      else break
    }

    setActive(currentTabIndex)
  }

  function onScrollRAF() {
    ticking = false

    if (scrollingProgrammatic || props.scrollMargin === undefined) return

    const point = window.scrollY + props.scrollMargin
    let newIdx = 0

    for (const { idx, top } of scrollData) {
      if (top <= point) newIdx = idx
      else break
    }

    if (newIdx !== active()) setActive(newIdx)
  }

  function onScroll() {
    clearTimeout(scrollEndTimeout)

    scrollEndTimeout = window.setTimeout(() => {
      scrollingProgrammatic = false
    }, 100)

    if (!ticking) {
      ticking = true
      window.requestAnimationFrame(onScrollRAF)
    }
  }

  function positionIndicator() {
    if (!divTabs || !divActiveIndicator) return

    const _active = active()
    if (typeof _active !== 'number') return

    const tabEl = divTabs.children[_active] as HTMLElement
    if (!tabEl) return

    if (props.variant !== 'tron') {
      divActiveIndicator.style.width = `${tabEl.offsetWidth}px`
      divActiveIndicator.style.transform = `translateX(${tabEl.offsetLeft}px)`

      if (props.variant !== 'underline') {
        divActiveIndicator.style.height = `${tabEl.offsetHeight}px`
      }
    }
  }

  function onTabClick(i: number, tab: RouteTab<any> | HashTab | ContentTab, ev?: MouseEvent) {
    if (i === active()) return // do nothing if clicking the active tab

    if (props.mode === 'content' || props.mode === 'route') setActive(i)
    else if (props.mode === 'scroll' && tab instanceof HashTab && props.scrollMargin !== undefined) {
      ev?.preventDefault()
      scrollingProgrammatic = true
      setActive(i)
      const el = hashCache.get(tab.hash)?.el
      if (!el) return

      const override = Number(el.dataset.tabsScrollMargin)
      const margin = isNaN(override) ? props.scrollMargin : override
      const top = el.getBoundingClientRect().top + window.scrollY - margin

      window.scrollTo({ top, behavior: 'smooth' })
    }

    props.setCurrentTab?.(tab) // notify parent with current tab object
  }

  onMount(() => {
    if (props.name) {
      indexToOnTabClick.set(props.name, i => onTabClick(i, props.tabs()[i]!))

      pathToOnTabClick.set(props.name, r => {
        const i = pathToTabIndex.get(r)
        if (i != null) onTabClick(i, props.tabs()[i]!)
      })

      hashToOnTabClick.set(props.name, h => {
        const i = hashToTabIndex.get(h)
        if (i != null) onTabClick(i, props.tabs()[i]!)
      })
    }

    positionIndicator()

    window.addEventListener('resize', positionIndicator)

    if (props.mode === 'scroll') {
      props.tabs()?.forEach((tab: any, i: number) => {
        if (tab instanceof HashTab) {
          const el = document.querySelector<HTMLElement>(tab.hash)
          if (el) hashCache.set(tab.hash, { el, idx: i })
        }
      })

      computeScrollData()
      window.addEventListener('resize', computeScrollData)
      window.addEventListener('scroll', onScroll, { passive: true })
    }

    setTimeout(() => setFirstRender(false), 0)

    if (props.setCurrentTab) {
      const activeIndex = active()
      const tabsArr = props.tabs()

      if (typeof activeIndex === 'number' && tabsArr[activeIndex]) {
        props.setCurrentTab?.(tabsArr[activeIndex])
      }
    }

    return () => { // onCleanup
      if (props.name) {
        indexToOnTabClick.delete(props.name)
        pathToOnTabClick.delete(props.name)
        hashToOnTabClick.delete(props.name)
      }

      window.removeEventListener('resize', positionIndicator)

      if (props.mode === 'scroll') {
        window.removeEventListener('resize', computeScrollData)
        window.removeEventListener('scroll', onScroll)
      }
    }
  })

  createEffect(positionIndicator)

  const accessibilityProps: JSX.HTMLAttributes<HTMLDivElement> = props.mode === 'content'
    ? { role: 'tablist', 'aria-orientation': 'horizontal' }
    : {}

  return <>
    <div {...props.$div} class={mergeStrings('ace-tabs', `ace-tabs--` + props.variant, props.$div?.class)}>
      <div class="ace-tabs__tabs" ref={divTabs} {...accessibilityProps}>
        <For each={props.tabs()}>
          {(tab, i) => {
            const isActive = () => i() === active()

            let anchor // defining as an object helps w/ HMR

            switch (true) {
              case tab instanceof HashTab:
                anchor = () => <a
                  href={tab.hash}
                  onClick={ev => onTabClick(i(), tab, ev)}
                  aria-current={isActive() ? 'page' : undefined}
                  classList={{ 'ace-tabs__tab': true, 'ace-tabs__active': isActive() }}
                >{tab.label}</a>
                break
              case tab instanceof RouteTab:
                anchor = () => <a
                  onClick={ev => onTabClick(i(), tab, ev)}
                  classList={{ 'ace-tabs__tab': true, 'ace-tabs__active': isActive() }}
                  href={mapRoutes() ? mapRoutes()?.[(tab as RouteTab<any>).path as keyof MapRoutes].buildUrl({ absoluteUrl: true, pathParams: (tab as RouteTab<any>).pathParams, searchParams: (tab as RouteTab<any>).searchParams }) : ''}
                > {tab.label} </a>
                break
              case tab instanceof ContentTab:
                anchor = () => <div
                  role="tab"
                  aria-selected={isActive()}
                  id={getId(props, 'tab', i)}
                  tabindex={isActive() ? 0 : -1}
                  onClick={() => onTabClick(i(), tab)}
                  aria-controls={getId(props, 'tab-content', i)}
                  classList={{ 'ace-tabs__tab': true, 'ace-tabs__active': isActive() }}
                >{tab.label}</div>
                break
            }

            if (!anchor) return null

            if (props.variant !== 'tron') return anchor()

            const className = props.$Tron?.$div?.class ?? ''

            // IF we use mergeProps() here THEN we loose isActive() reactivity
            return <>
              <Tron
                {...props.$Tron}
                children={anchor()}
                status={isActive() ? 'infinite' : 'hover'}
                $div={{ class: isActive() ? className + 'tab-is-active' : className }}
              />
            </>
          }}
        </For>

        <div class="ace-tabs__marker" ref={divActiveIndicator} style={{ transition: firstRender() ? 'none' : undefined, opacity: firstRender() ? '0' : 'revert-layer' }}></div>
      </div>

      <Show when={props.mode === 'content'}>
        <div class="ace-tabs__contents">
          <For each={props.tabs()}>
            {(tab, i) => {
              return <>
                <Show when={i() === active()}>
                  <div id={getId(props, 'tab-content', i)} classList={{ 'ace-tabs__content': true, 'ace-tabs__active': i() === active() }} role="tabpanel" aria-labelledby={`tab-${i()}`} hidden={active() !== i()}>
                    {tab instanceof ContentTab ? tab.content() : null}
                  </div>
                </Show>
              </>
            }}
          </For>
        </div>
      </Show>
    </div>
  </>
}


/** id's are necessary for accessibility */
function getId(props: TabsProps, prefix: string, i: Accessor<number>) {
  return `${prefix}-${props.name ? (props.name + '-') : ''}${i()}`
}


const indexToOnTabClick = new Map<string, (i: number) => void>()
const pathToOnTabClick = new Map<string, (route: Routes) => void>()
const hashToOnTabClick = new Map<string, (hash: string) => void>()

/**
 * Helpful when you have another button that you'd love to set the active tab and you want to identify your tab by index
 * @param name - Name is helpful when you have multiple tabs on the same page and want to identify what set of tabs you'd love to set
 * @param i - The tab index you'd love to set
 */
export function setActiveByTabIndex(name: string, i: number) {
  indexToOnTabClick.get(name)?.(i)
}


/**
 * Helpful when you have another button that you'd love to set the active tab and you want to identify your tab by a string route path, you can also use an <A /> which is probably ideal b/c then it'd be screen reader compliant
 * @param name - Name is helpful when you have multiple tabs on the same page and want to identify what set of tabs you'd love to set
 * @param route - The route path to navigate to
 */
export function setActiveByPath(name: string, route: Routes) {
  pathToOnTabClick.get(name)?.(route)
}


/**
 * Helpful when you have another button that you'd love to set the active tab and you want to identify your tab by hash
 * @param name - Name is helpful when you have multiple tabs on the same page and want to identify what set of tabs you'd love to set
 * @param hash - The tab id hash to scroll to
 */
export function setActiveByHash(name: string, hash: string) {
  hashToOnTabClick.get(name)?.(hash)
}

/** Used when the mode is `route` */
export class RouteTab<T_Path extends Routes> {
  label: string
  path: T_Path
  pathParams?: RoutePath2PathParams<T_Path>
  searchParams?: RoutePath2SearchParams<T_Path>

  constructor(label: string, route: T_Path, params?: { pathParams?: RoutePath2PathParams<T_Path>, searchParams?: RoutePath2SearchParams<T_Path> }) {
    this.label = label
    this.path = route
    this.pathParams = params?.pathParams
    this.searchParams = params?.searchParams
  }
}


/** Used when the mode is `scroll` */
export class HashTab {
  label: string
  hash: string

  constructor(label: string, hash: string) {
    this.label = label
    this.hash = hash
  }
}


/** Used when the mode is `content` */
export class ContentTab {
  label: string
  isInitiallyActive: boolean
  content: Accessor<JSX.Element>

  constructor(label: string, content: Accessor<JSX.Element>, isInitiallyActive = false) {
    this.label = label
    this.content = content
    this.isInitiallyActive = isInitiallyActive
  }
}


export type Tab<T extends Routes = any> = RouteTab<T> | HashTab | ContentTab


export type TabsProps = Parameters<typeof Tabs>[0]


export type Tabs = TabsProps['tabs']
