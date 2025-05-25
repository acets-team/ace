/**
 * 🧚‍♀️ How to access:
 *     - import { Tabs, ContentTab, RouteTab, HashTab, setActiveByTabIndex, setActiveByPath, setActiveByHash } from '@ace/tabs'
 *     - import type { TabsProps, Tabs } from '@ace/tabs'
 */


import { routes } from './createApp'
import type { Routes } from './types'
import { buildURL } from '../buildURL'
import { useLocation } from '@solidjs/router'
import { pathnameToMatch } from '../pathnameToMatch'
import { createSignal, createEffect, onMount, For, Show, type JSX } from 'solid-js'


export function Tabs({ tabs, name, mode = 'content', variant = 'underline', scrollMargin = 0, ...requestedProps }: TabsProps) {
  const location = useLocation()

  const pathToTabIndex = new Map<Routes, number>()
  const hashToTabIndex = new Map<string, number>()

  let initialContentIndex = 0
  let foundContentInitial = false

  tabs.forEach((tab, i) => {
    if (tab instanceof RouteTab) pathToTabIndex.set(tab.route, i)
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

  function onTabClick(i: number, tab: RouteTab | HashTab | ContentTab, ev?: MouseEvent) {
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
      <div class="tabs" ref={divTabs} {...accessibilityProps} {...requestedProps}>
        <For each={tabs}>
          {(tab, i) => {
            const isActive = () => i() === active()

            return <>
              { tab instanceof HashTab && <a href={tab.hash} class={`tab ${isActive() ? 'active' : ''}`} aria-current={isActive() ? 'page' : undefined} onClick={ev => onTabClick(i(), tab, ev)}>{tab.label}</a> }

              { tab instanceof RouteTab && <a href={buildURL((tab as RouteTab).route, (tab as RouteTab).params)} class={`tab ${isActive() ? 'active' : ''}`} onClick={ev => onTabClick(i(), tab, ev)} > {tab.label} </a> }

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


export function setActiveByTabIndex(name: string, i: number) {
  indexToOnTabClick.get(name)?.(i)
}


export function setActiveByPath(name: string, route: Routes) {
  pathToOnTabClick.get(name)?.(route)
}


export function setActiveByHash(name: string, hash: string) {
  hashToOnTabClick.get(name)?.(hash)
}


export class RouteTab {
  label: string
  route: Routes
  params?: any

  constructor(label: string, route: Routes, params?: any) {
    this.label = label
    this.route = route
    this.params = params
  }
}


export class HashTab {
  label: string
  hash: string

  constructor(label: string, hash: string) {
    this.label = label
    this.hash = hash
  }
}


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
  tabs: Tabs
  name?: string
  mode: 'content' | 'scroll' | 'route'
  variant: 'underline' | 'pill' | 'classic'
  scrollMargin?: number
} & JSX.HTMLAttributes<HTMLDivElement>


export type Tabs = RouteTab[] | HashTab[] | ContentTab[]
