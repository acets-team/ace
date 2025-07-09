/**
 * 🧚‍♀️ How to access:
 *     - import { Tabs, ContentTab, RouteTab, HashTab, setActiveByTabIndex, setActiveByPath, setActiveByHash } from '@ace/tabs'
 *     - import type { TabsProps, Tabs } from '@ace/tabs'
 */


import { routes } from './createApp'
import { buildURL } from './buildURL'
import { useLocation } from '@solidjs/router'
import { pathnameToMatch } from '../pathnameToMatch'
import type { Routes, RoutePath2PathParams, RoutePath2SearchParams } from './types'
import { createSignal, createEffect, onMount, For, Show, type JSX } from 'solid-js'


/**
 * ### Show lovely tabs
 * Add to `app.tsx` => `import '@ace/tabs.styles.css'` & then:
 * @example
  ```tsx
  <Tabs
    mode="route"
    variant="pill"
    tabs={[
      new RouteTab('Home', '/'),
      new RouteTab('About', '/about'),
      new RouteTab('Members', '/members'),
    ]}
  />
  ```
 * @example
  ```tsx
  <Tabs
    name="nav"
    mode="scroll"
    variant="underline"
    scrollMargin={74}
    tabs={[
      new HashTab('Home', '#banner'),
      new HashTab('Offerings', '#carousel'),
      new HashTab('Spiritual Retreats', '#retreats'),
    ]}
  />
  ```
 * @example
  ```tsx
  <Tabs
    mode="content"
    variant="classic"
    tabs={[
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
 * @param props.name - Name is helpful when you have multiple tabs on the same page and want to use `setActiveByTabIndex()`, `setActiveByPath()` or `setActiveByHash()`
 * @param props.mode - `content` requires each tab to be a `ContentTab` and shows different content based on which tab is selected. `scroll` requires each tab to be a `HashTab` and scrolls to different content based on which tab is selected. `route` requires each tab to be a `RouteTab` and navigates to different pages based on which tab is selected.
 * @param props.variant - `underline` is google style, `classic` is bootstrap style, and `pill` looks like rounded buttons
 * @param props.scrollMargin - If `props.mode` is `scroll` set `scrollMargin` if you'd love the scroll to end some pixels above the scrolled to item
 * @param props.tabsProps - Set if you'd love to add your own props to the tabs html div element like class, style or id
 */
export function Tabs({ tabs, name, mode = 'content', variant = 'underline', scrollMargin = 0, tabsProps }: TabsProps) {
  const location = useLocation()

  const pathToTabIndex = new Map<Routes, number>()
  const hashToTabIndex = new Map<string, number>()

  let initialContentIndex = 0
  let foundContentInitial = false

  tabs.forEach((tab, i) => {
    if (tab instanceof RouteTab) pathToTabIndex.set(tab.path, i)
    else if (tab instanceof HashTab) hashToTabIndex.set(tab.hash, i)
    else if (tab instanceof ContentTab && tab.isInitiallyActive && !foundContentInitial) {
      initialContentIndex = i
      foundContentInitial = true
    }
  })

  let initialIndex: number | undefined = undefined

  if (mode === 'content') initialIndex = initialContentIndex

  const [active, setActive] = createSignal<number | undefined>(initialIndex) // must be after tabs foreach 
  const [firstRender, setFirstRender] = createSignal(true)

  createEffect(() => {
    if (mode !== 'route') return
    const match = pathnameToMatch(location.pathname, routes)

    if (!match) return
    const tabIndex = pathToTabIndex.get(match.handler.values.path as Routes)

    if (tabIndex === undefined || !tabs[tabIndex]) return
    onTabClick(tabIndex, tabs[tabIndex])
  })

  let divTabs: HTMLDivElement | undefined
  let divActiveIndicator: HTMLDivElement | undefined

  const scrollData: { idx: number; top: number }[] = []
  const hashCache = new Map<string, { el: HTMLElement; idx: number }>()

  let ticking = false
  let scrollingProgrammatic = false
  let scrollEndTimeout = 0

  function computeScrollData() {
    scrollData.length = 0

    for (const { el, idx } of hashCache.values()) {
      scrollData.push({ idx, top: el.offsetTop })
    }
    scrollData.sort((a, b) => a.top - b.top)

    let currentTabIndex = 0
    const point = window.scrollY + scrollMargin

    for (const { idx, top } of scrollData) {
      if (top <= point) currentTabIndex = idx
      else break
    }

    setActive(currentTabIndex)
  }

  function onScrollRAF() {
    ticking = false
    if (scrollingProgrammatic) return

    const point = window.scrollY + scrollMargin
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

    divActiveIndicator.style.width = `${tabEl.offsetWidth}px`
    divActiveIndicator.style.transform = `translateX(${tabEl.offsetLeft}px)`

    if (variant !== 'underline') {
      divActiveIndicator.style.height = `${tabEl.offsetHeight}px`
    }
  }

  function onTabClick(i: number, tab: RouteTab<any> | HashTab | ContentTab, ev?: MouseEvent) {
    if (mode === 'content' || mode === 'route') setActive(i)
    else if (mode === 'scroll' && tab instanceof HashTab) {
      ev?.preventDefault()
      scrollingProgrammatic = true
      setActive(i)
      const el = hashCache.get(tab.hash)?.el
      if (!el) return

      const override = Number(el.dataset.tabsScrollMargin)
      const margin = isNaN(override) ? scrollMargin : override
      const top = el.getBoundingClientRect().top + window.scrollY - margin

      window.scrollTo({ top, behavior: 'smooth' })
    }
  }

  onMount(() => {
    if (name) {
      indexToOnTabClick.set(name, i => onTabClick(i, tabs[i]!))

      pathToOnTabClick.set(name, r => {
        const i = pathToTabIndex.get(r)
        if (i != null) onTabClick(i, tabs[i]!)
      })

      hashToOnTabClick.set(name, h => {
        const i = hashToTabIndex.get(h)
        if (i != null) onTabClick(i, tabs[i]!)
      })
    }

    positionIndicator()

    window.addEventListener('resize', positionIndicator)

    if (mode === 'scroll') {
      tabs.forEach((tab, i) => {
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

    return () => { // onCleanup
      if (name) {
        indexToOnTabClick.delete(name)
        pathToOnTabClick.delete(name)
        hashToOnTabClick.delete(name)
      }

      window.removeEventListener('resize', positionIndicator)

      if (mode === 'scroll') {
        window.removeEventListener('resize', computeScrollData)
        window.removeEventListener('scroll', onScroll)
      }
    }
  })

  createEffect(positionIndicator)

  const accessibilityProps: JSX.HTMLAttributes<HTMLDivElement> = mode === 'content' ? { role: 'tablist', 'aria-orientation': 'horizontal' } : {}

  return <>
    <div class={`ace-tabs ${variant}`}>
      <div class="tabs" ref={divTabs} {...accessibilityProps} {...tabsProps}>
        <For each={tabs}>
          {(tab, i) => {
            const isActive = () => i() === active()

            return <>
              { tab instanceof HashTab && <a href={tab.hash} class={`tab ${isActive() ? 'active' : ''}`} aria-current={isActive() ? 'page' : undefined} onClick={ev => onTabClick(i(), tab, ev)}>{tab.label}</a> }

              { tab instanceof RouteTab && <a href={buildURL((tab as RouteTab<any>).path, {pathParams: (tab as RouteTab<any>).pathParams, searchParams: (tab as RouteTab<any>).searchParams})} class={`tab ${isActive() ? 'active' : ''}`} onClick={ev => onTabClick(i(), tab, ev)} > {tab.label} </a> }

              { tab instanceof ContentTab && <div id={`tab-${i()}`} role="tab" tabindex={isActive() ? 0 : -1} aria-selected={isActive()} aria-controls={`tab-content-${i()}`} class={`tab ${isActive() ? 'active' : ''}`} onClick={() => onTabClick(i(), tab)} > {tab.label} </div> }
            </>
          }}
        </For>

        <div class="marker" ref={divActiveIndicator} style={{ transition: firstRender() ? 'none' : undefined, opacity: firstRender() ? '0' : '1' }}></div>
      </div>

      <Show when={mode === 'content'}>
        <div class="tab-contents">
          <For each={tabs}>
            {(tab, i) => {
              return <>
                <div id={`tab-content-${i()}`} classList={{ 'tab-content': true, active: i() === active() }} role="tabpanel" aria-labelledby={`tab-${i()}`} hidden={active() !== i()}>
                  {tab instanceof ContentTab ? tab.content : null}
                </div>
              </>
            }}
          </For>
        </div>
      </Show>
    </div>
  </>
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
  content: JSX.Element
  isInitiallyActive: boolean

  constructor(label: string, content: JSX.Element, isInitiallyActive = false) {
    this.label = label
    this.content = content
    this.isInitiallyActive = isInitiallyActive
  }
}


export type TabsProps = {
  /** An array of `RouteTab`, `HashTab` or `ContentTab` objects. Place the Tabs component in a layout when using a mode of `route` to keep the animation smooth between routes */
  tabs: Tabs
  /** Name is helpful when you have multiple tabs on the same page and want to use `setActiveByTabIndex()`, `setActiveByPath()` or `setActiveByHash()` */
  name?: string
  /** `content` requires each tab to be a `ContentTab` and shows different content based on which tab is selected. `scroll` requires each tab to be a `HashTab` and scrolls to different content based on which tab is selected. `route` requires each tab to be a `RouteTab` and navigates to different pages based on which tab is selected. */
  mode: 'content' | 'scroll' | 'route'
  /** `underline` is google style, `classic` is bootstrap style, and `pill` looks like rounded buttons */
  variant: 'underline' | 'pill' | 'classic'
  /** If `props.mode` is `scroll` set `scrollMargin` if you'd love the scroll to end some pixels above the scrolled to item */
  scrollMargin?: number
  /** Set if you'd love to add your own props to the tabs html div element like class, style or id */
  tabsProps?: JSX.HTMLAttributes<HTMLDivElement>
}


export type Tabs = RouteTab<any>[] | HashTab[] | ContentTab[]
