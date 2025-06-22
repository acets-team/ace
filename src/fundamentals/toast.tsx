/**
 * 🧚‍♀️ How to access:
 *     - import { showToast, successIcon, infoIcon, dangerIcon, closeIcon, toastStyleDark, toastStyleLight, toastIconStyleSuccess, toastIconStyleInfo, toastIconStyleDanger } from '@ace/toast'
 *     - import type { ShowToastProps, ShowToast } from '@ace/toast'
 */


import { isServer, render } from 'solid-js/web'
import { createSignal,onMount, createEffect, For, Show, type Component, type JSX } from 'solid-js'



const [toasts, setToasts] = createSignal<ToastItem[]>([])


if (!isServer) {
  const ToastWrapper: Component = () => {
    return <>
      <div id="ace-toast-wrapper" aria-live="polite" aria-atomic="false">
        <For each={toasts()}>
          {toast => <ToastItemComponent toast={toast} onRemove={removeToastFromSignal} />}
        </For>
      </div>
    </>
  }

  const container = document.createElement('div')
  document.body.appendChild(container)
  render(() => <ToastWrapper />, container)
}


/**
 * ### Aria compliant toast notifications!
 * Add to `app.tsx` => `import '@ace/toast.styles.css'` & then:
 * ### Dark Mode:
 * @example
  ```tsx
  <button onClick={() => showToast({ value: ['Dark', 'Info'], type: 'info' })}>Dark Info</button>
  <button onClick={() => showToast({ value: ['Dark', 'Success'], type: 'success' })}>Dark Success</button>
  <button onClick={() => showToast({ value: 'Dark Danger', type: 'danger' })}>Dark Danger</button>
  ```
 * ### Light Mode:
 * @example
  ```tsx
  <button onClick={() => showToast({ value: 'Light Info', type: 'info', toastProps: {style: toastStyleLight} })}>Light Info</button>

  <button onClick={() => showToast({ value: 'Light Success', type: 'success', toastProps: {style: toastStyleLight} })}>Light Success</button>

  <button onClick={() => showToast({ value: 'Light Danger', type: 'danger', toastProps: {style: toastStyleLight} })}>Light Danger</button>
  ```
 * 
 * ### Custom Styles w/ tsx, TS:
 * @example
  ```ts
  import type { JSX } from 'solid-js'
  import { showToast, toastStyleLight } from '@ace/toast'

  const toastStyleLavender: JSX.CSSProperties = {
    ...toastStyleLight,
    '--ace-toast-bg-color': 'rgb(243, 232, 255)',
    '--ace-toast-text-color': 'rgb(76, 29, 149)',
    '--ace-toast-border-color': 'rgb(192, 132, 252)',
    '--ace-toast-icon-color': 'rgb(109, 40, 217)',
    '--ace-toast-icon-border': '1px solid rgb(192, 132, 252)',
    '--ace-toast-icon-bg-color': 'rgb(233, 213, 255)',
    '--ace-toast-close-color': 'rgb(139, 92, 246)',
    '--ace-toast-close-hover-border': 'rgb(167, 139, 250)',
    '--ace-toast-close-hover-bg-color': 'rgba(165, 180, 252, 0.2)',
  }
  ```
 * ### Custom Styles w/ tsx, TSX:
  ```tsx
    <button onClick={() => showToast({ value: 'Custom Lavender 💜', toastProps: {style: toastStyleLavender} })}>Custom Lavender 💜</button>
  ```
 * 
 * ### Custom Styles w/ css, TSX:
 * @example
  ```tsx
  <button class="brand" onClick={() => showToast({ value: 'Emerald 🌿', toastProps: {class: 'emerald toast'} })}>Emerald 🌿</button>
  ```
 * ### Custom Styles w/ css, CSS:
  ```css
  #ace-toast-wrapper {
    .toast.emerald {
      --ace-toast-bg-color: rgb(6, 95, 70);
      --ace-toast-border-color: rgb(16, 185, 129);
      --ace-toast-icon-color: rgb(6, 78, 59);
      --ace-toast-icon-border: 1px solid rgb(16, 185, 129);
      --ace-toast-icon-bg-color: rgb(209, 250, 229);
      --ace-toast-close-color: rgb(134, 239, 172);
      --ace-toast-close-hover-border: rgb(52, 211, 153);
      --ace-toast-close-hover-bg-color: rgba(16, 185, 129, 0.2);
    }
  }
  ```
 * 
 * @param props.type - Sets the `icon` and applies `toastProps.style`, setting an `icon` as well will overide the type icon and setting custom `toastProps.style` will merge w/ the type style
 * @param props.value - One string shows as `<span>` and multiple strings in an array shows as an unordered list
 * @param props.ms - How many ms to show the toast, defaults to `9000`
 * @param props.icon - The icon to display in the `toast`, if no icon is set we'll set the icon based on the type
 * @param props.animationSpeed - How many ms does it take for the toast to hide, defaults to 600 b/c in the css for `.toast` > `transition: var(--ace-toast-transition, all 0.6s ease);`
 * @param props.toastProps - Additonal props you'd love to place on the html div toast like `style` or `class`
 */
export const showToast: ShowToast = ({ type, value, ms = 9000, icon, toastProps, animationSpeed = 600 }) => {
  animationSpeed += 30 // padding

  const id = typeof toastProps?.id === 'string' ? toastProps.id : 'toast-' + crypto.randomUUID()

  const toast: ToastItem = { // create toast
    id,
    ms,
    type,
    icon: icon ?? defaultIconForType(type),
    list: Array.isArray(value) ? value : [value],
    toastProps: {
      ...toastProps,
      style: {
        ...defaultStyleForType(type),
        ...(toastProps?.style && typeof toastProps.style === 'object' ? toastProps.style : {}),
      }
    }
  }

  setToasts(prev => [...prev, toast]) // add toast to toasts signal

  const timeoutSmooth = setTimeout( () => smoothHide(document.getElementById(toast.id)), ms) // 

  const timeoutSignal = setTimeout( () => removeToastFromSignal(toast.id), ms + animationSpeed )

  return {
    id: toast.id,
    remove() {
      clearTimeout(timeoutSmooth)
      clearTimeout(timeoutSignal)
      smoothHide(document.getElementById(toast.id))
      setTimeout(() => removeToastFromSignal(toast.id), animationSpeed)
    }
  }
}


function removeToastFromSignal (id: string) {
  setToasts(list => {
    const idx = list.findIndex(t => t.id === id)
    if (idx === -1) return list
    const updated = [...list]
    updated.splice(idx, 1)
    return updated
  })
}

const ToastItemComponent: Component<{ toast: ToastItem, onRemove: (id: string) => void }> = (props) => {
  let refToast: HTMLDivElement | undefined
  const [isHiding, setIsHiding] = createSignal(false)

  function onCloseClick() {
    setIsHiding(true)
    smoothHide(refToast)
    setTimeout(() => props.onRemove(props.toast.id), 630)
  }

  onMount(() => refToast?.focus())
  createEffect(() => isHiding() && refToast && smoothHide(refToast))

  return <>
    <div
      id={props.toast.id}
      role="alert"
      tabIndex={0}
      ref={el => refToast = el!}
      classList={{ toast: true, [props.toast.type || '']: true }}
      {...props.toast.toastProps}>

      <div class="icon-wrapper">
        <div class="icon">{props.toast.icon}</div>
      </div>

      <Show when={props.toast.list.length > 1} fallback={<span>{props.toast.list[0]}</span>}>
        <ul>
          <For each={props.toast.list}>{item => <li>{item}</li>}</For>
        </ul>
      </Show>

      <button class="close" aria-label="Dismiss toast notification" onClick={onCloseClick}>
        {closeIcon()}
      </button>
    </div>
  </>
}

function smoothHide(el: unknown) {
  if (!(el instanceof HTMLElement)) return

  el.style.maxHeight = `${el.scrollHeight}px` // set the current height explicitly

  requestAnimationFrame(() => { // wait one animation frame (≈16ms), this ensures the browser commits the first style change before starting the transition
    el.style.margin = '0'
    el.style.opacity = '0'
    el.style.padding = '0'
    el.style.maxHeight = '0'
    el.style.borderWidth = '0'
  })
}

function defaultIconForType(type?: ShowToastProps['type']): JSX.Element {
  switch (type) {
    case 'success': return successIcon()
    case 'danger': return dangerIcon()
    default: return infoIcon()
  }
}

function defaultStyleForType(type?: ShowToastProps['type']): JSX.CSSProperties {
  switch (type) {
    case 'success': return { ...toastStyleDark, ...toastIconStyleSuccess }
    case 'danger': return { ...toastStyleDark, ...toastIconStyleDanger }
    case 'info': return { ...toastStyleDark, ...toastIconStyleInfo  }
    default: return {}
  }
}


export const toastStyleDark: JSX.CSSProperties = {
  '--ace-toast-text-color': 'rgb(214, 217, 223)',
  '--ace-toast-border-color': 'rgb(55, 65, 81)',
  '--ace-toast-bg-color': 'rgb(31, 41, 55)',

  '--ace-toast-close-color': 'rgb(156, 163, 175)',
  '--ace-toast-close-hover-border': 'rgb(117, 126, 139)',
  '--ace-toast-close-hover-bg-color': 'rgb(75, 85, 99)',
}

export const toastStyleLight: JSX.CSSProperties = {
  '--ace-toast-text-color': 'rgb(31, 41, 55)',
  '--ace-toast-border-color': 'rgb(203, 213, 225)',
  '--ace-toast-bg-color': 'rgb(255, 255, 255)',

  '--ace-toast-close-color': 'rgb(107, 114, 128)',
  '--ace-toast-close-hover-border': 'rgb(156, 163, 175)',
  '--ace-toast-close-hover-bg-color': 'rgb(229, 231, 235)'
}

export const toastIconStyleSuccess: JSX.CSSProperties = {
  '--ace-toast-icon-color': 'rgb(3, 84, 63)',
  '--ace-toast-icon-border': '1px solid rgb(14, 159, 110)',
  '--ace-toast-icon-bg-color': 'rgb(188, 240, 218)',
}

export const toastIconStyleInfo: JSX.CSSProperties = {
  '--ace-toast-icon-color': 'rgb(30, 66, 159)',
  '--ace-toast-icon-border': '1px solid rgb(63, 131, 248)',
  '--ace-toast-icon-bg-color': 'rgb(195, 221, 253)',
}

export const toastIconStyleDanger: JSX.CSSProperties = {
  '--ace-toast-icon-color': 'rgb(153, 27, 27)',
  '--ace-toast-icon-border': '1px solid rgb(248, 113, 113)',
  '--ace-toast-icon-bg-color': 'rgb(254, 202, 202)',
}


export const successIcon = () => <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /></svg>

export const infoIcon = () => <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"> <path d="M12 17q.425 0 .713-.288Q13 16.425 13 16v-4.025q0-.425-.287-.7Q12.425 11 12 11t-.712.287Q11 11.575 11 12v4.025q0 .425.288.7q.287.275.712.275Zm0-8q.425 0 .713-.288Q13 8.425 13 8t-.287-.713Q12.425 7 12 7t-.712.287Q11 7.575 11 8t.288.712Q11.575 9 12 9Zm0 13q-2.075 0-3.9-.788q-1.825-.787-3.175-2.137q-1.35-1.35-2.137-3.175Q2 14.075 2 12t.788-3.9q.787-1.825 2.137-3.175q1.35-1.35 3.175-2.138Q9.925 2 12 2t3.9.787q1.825.788 3.175 2.138q1.35 1.35 2.137 3.175Q22 9.925 22 12t-.788 3.9q-.787 1.825-2.137 3.175q-1.35 1.35-3.175 2.137Q14.075 22 12 22Z"/></svg>

export const dangerIcon = () => <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M18 10A8 8 0 1 1 2 10a8 8 0 0 1 16 0ZM9 7a1 1 0 1 1 2 0v3a1 1 0 1 1-2 0V7Zm1 7a1 1 0 1 1 0-2 1 1 0 0 1 0 2Z" clip-rule="evenodd" /></svg>

export const closeIcon = () => <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"> <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd"/></svg>



export type ShowToastProps = {
  /** Sets the `icon` and applies `toastProps.style`, setting an `icon` as well will overide the type icon and setting custom `toastProps.style` will merge w/ the type style */
  type?: 'info' | 'success' | 'danger'
  /** One string shows as `<span>` and multiple strings in an array shows as an unordered list */
  value: string | string[]
  /** How many ms to show the toast, defaults to `9000` */
  ms?: number
  /** The icon to display in the `toast`, if no icon is set we'll set the icon based on the type */
  icon?: JSX.Element
  /** Additonal props you'd love to place on the html div toast like `style` or `class` */
  toastProps?: JSX.HTMLAttributes<HTMLDivElement>,
  /** How many ms does it take for the toast to hide, defaults to 600 b/c in the css for `.toast` > `transition: var(--ace-toast-transition, all 0.6s ease);` */
  animationSpeed?: number
}


export type ShowToast = (props: ShowToastProps) => {
  /** The DOM id for this toast */
  id: string
  /** A function to remove the toast */
  remove: () => void
}


type ToastItem = {
  id: string
  type?: ShowToastProps['type']
  list: string[]
  ms: number
  icon?: JSX.Element
  toastProps?: JSX.HTMLAttributes<HTMLDivElement>
}
