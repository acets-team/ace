/**
 * 🧚‍♀️ How to access:
 *     - import { showToast, ToastProvider } from '@ace/toast'
 */


import { onMount, createEffect, createSignal, createContext, For, Show, ParentComponent } from 'solid-js';


export let showToast: ShowToast = () => { // if we call showToast() before mounting the ToastProvider => error
  throw new Error('showToast() was called outside before mounting a wrapper <ToastProvider>')
}


const ToastContext = createContext<ToastContextValue>()



export const ToastProvider: ParentComponent = (props) => {
  const [toasts, setToasts] = createSignal<ToastItem[]>([])

  showToast = (type, items, ms = 9000) => {
    const toast: ToastItem = { // create toast item
      ms,
      type,
      id: crypto.randomUUID(),
      list: Array.isArray(items) ? items : [items],
    }

    setToasts((prev) => [...prev, toast]) // add toast item

    const timeoutSmooth = setTimeout(() => smoothHide(document.querySelector<HTMLDivElement>('#toast-' + toast.id) || undefined), ms) // in x ms smooth remove

    const timeoutDOM = setTimeout(() => removeToastFromList(toast.id), 630 + ms) // post smooth remove => remove from toasts list

    return { // return the id and a function to remove the toast item
      id: toast.id,
      remove () {
        clearTimeout(timeoutDOM)
        clearTimeout(timeoutSmooth)
        smoothHide(document.querySelector<HTMLDivElement>('#toast-' + toast.id) || undefined)

        setTimeout(() => {
          removeToastFromList(toast.id)
        }, 630)
      }
    }
  }

  function removeToastFromList (id: string) {
    setToasts((toastsCurrent) => {
      const removeToastIndex = toastsCurrent.findIndex((t) => t.id === id)

      if (removeToastIndex === -1) return toastsCurrent

      const toastsUpdated = [...toastsCurrent]

      toastsUpdated.splice(removeToastIndex, 1)

      return toastsUpdated
    })
  }

  return <>
    <ToastContext.Provider value={{ toasts: toasts(), showToast }}>
      {props.children}
      <div id="ace-toast-wrapper" aria-live="polite" aria-atomic="false">
        <For each={toasts()}>{
          (toast) => <ToastItemComponent toast={toast} onRemove={removeToastFromList} />
        }</For>
      </div>
    </ToastContext.Provider>
  </>
}


const ToastItemComponent: ParentComponent<ToastItemProps> = (props) => {
  let refToast: HTMLDivElement | undefined
  const [isHiding, setIsHiding] = createSignal(false)

  function onCloseClick() {
    setIsHiding(true)
    smoothHide(refToast)
    setTimeout(() => props.onRemove(props.toast.id), 630) // on animation complete => removes toast from DOM
  }

  onMount(() => { // on toast item component mount => focus the toast
    refToast?.focus()
  })

  createEffect(() => {
    if (refToast && isHiding()) smoothHide(refToast)
  })

  return <>
    <div
      role="alert" // tells screen-readers interrupt whatever they were narrating & read out this content
      tabIndex={0} // tells browser to treat this div like a focusable element
      ref={el => refToast = el!}
      id={'toast-' + props.toast.id}
      classList={{ 'toast': true, [props.toast.type]: true }}>

      <div class="icon-wrapper">
        <div class="icon">
          <Show when={props.toast.type === 'success'} fallback={svg_info()}>
            {svg_success()}
          </Show>
        </div>
      </div>

      <Show when={props.toast.list.length > 1} fallback={<span>{props.toast.list[0]}</span>} >
        <ul>
          <For each={props.toast.list}>{
            (toast) => <li>{toast}</li>
          }</For>
        </ul>
      </Show>

      <button class="close" aria-label="Dismiss toast notification" onClick={onCloseClick}>{svg_close()}</button>
    </div>
  </>
}


function smoothHide(refToast: HTMLDivElement | undefined) {
  if (refToast) {
    refToast.style.maxHeight = `${refToast.scrollHeight}px`

    requestAnimationFrame(() => {
      refToast.style.margin = '0'
      refToast.style.opacity = '0'
      refToast.style.padding = '0'
      refToast.style.maxHeight = '0'
      refToast.style.borderWidth = '0'
    })
  } 
}


type ToastType = 'info' | 'success'


type ToastItem = {
  id: string,
  type: ToastType,
  list: string[],
  ms: number,
}


type ToastContextValue = {
  toasts: ToastItem[],
  showToast: ShowToast,
}


type ShowToast = (type: ToastType, items: string | string[], ms?: number ) => { id: string; remove: () => void }


type ToastItemProps = {
  toast: ToastItem,
  onRemove: (id: string) => void,
}


const svg_success = () => <svg aria-hidden="true" fill="currentColor" viewBox="0 0 20 20"> <path fill-rule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clip-rule="evenodd" /> </svg>


const svg_info = () => <svg aria-hidden="true" fill="currentColor" viewBox="0 0 24 24"> <path d="M12 17q.425 0 .713-.288Q13 16.425 13 16v-4.025q0-.425-.287-.7Q12.425 11 12 11t-.712.287Q11 11.575 11 12v4.025q0 .425.288.7q.287.275.712.275Zm0-8q.425 0 .713-.288Q13 8.425 13 8t-.287-.713Q12.425 7 12 7t-.712.287Q11 7.575 11 8t.288.712Q11.575 9 12 9Zm0 13q-2.075 0-3.9-.788q-1.825-.787-3.175-2.137q-1.35-1.35-2.137-3.175Q2 14.075 2 12t.788-3.9q.787-1.825 2.137-3.175q1.35-1.35 3.175-2.138Q9.925 2 12 2t3.9.787q1.825.788 3.175 2.138q1.35 1.35 2.137 3.175Q22 9.925 22 12t-.788 3.9q-.787 1.825-2.137 3.175q-1.35 1.35-3.175 2.137Q14.075 22 12 22Z"/> </svg>


const svg_close = () => <svg fill="currentColor" viewBox="0 0 20 20" aria-hidden="true"> <path fill-rule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clip-rule="evenodd" /> </svg>
