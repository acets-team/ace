/**
 * 🧚‍♀️ How to access:
 *     - import { Modal, showModal, hideModal, isModalVisible, onShowModal, onHideModal  } from '@ace/modal'
 *     - import type { ModalProps } from '@ace/modal'
 */


import { Portal } from 'solid-js/web'
import { feComponent } from './feComponent'
import { createEffect, createSignal, Show, type JSX, type Signal } from 'solid-js'


const id2OnShow = new Map<string, () => void>()
const id2OnHide = new Map<string, () => void>()
const id2Signal = new Map<string, ReturnType<typeof createSignal<boolean>>>()


/**
 * ### Aria compliant modal component
 * Add to `app.tsx` => `import '@ace/modal.styles.css'` & then:
 * @example
    ```tsx
    import { Modal, showModal, hideModal } from '@ace/modal'

    <button onClick={() => showModal('flyer')} type="button">
      <img src={flyer} />
    </button>
    
    <Modal id="flyer">
      <img src={flyer} />
      <button onClick={() => hideModal('flyer')} type="button"></button>
    </Modal>
    ```
 * @example
    ```css
    #ace-modal--flyer {

      img {
        width: 100%;
      }
    }
    ```
 * @param props.id - How to identify a modal when using ex, `showModal(id)` and is set via `<Modal id="example">`
 * @param props.hideOnBackdropClick - Optional, defaults to `true`, if you'd love a click on the modal to hide it
 * @param props.divProps - Optional, html dom div props to the wrapper
 * @param props.children - The tsx content to place into the modal
 */
export const Modal = feComponent(({id, children, hideOnBackdropClick = true, divProps}: ModalProps) => {
  let modalRef: undefined | HTMLDivElement

  const [isOpen] = getVisibilitySignal(id)

  createEffect(() => {
    if (isOpen() && modalRef) modalRef.focus()
  })

  function close() {
    if (hideOnBackdropClick) hideModal(id)
  }

  return <>
    <Show when={isOpen()}>
      <Portal>
        <div id={`ace-modal--` + id} class="ace-modal" onClick={close} aria-hidden={isOpen() ? 'false' : 'true'} {...divProps}>
          <div class="content" onClick={close}>
            <div class="modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={`${id}-label`} tabIndex={-1}>{children}</div>
          </div>
        </div>
      </Portal>
    </Show>
  </>
})


/**
 * Show a modal
 * @param id - How to identify a modal when using ex, `showModal(id)` and is set via `<Modal id="example">`
 */
export function showModal(id: string) {
  getVisibilitySignal(id)[1](true)
  id2OnShow.get(id)?.()
}


/**
 * Hide a modal
 * @param id - How to identify a modal when using ex, `showModal(id)` and is set via `<Modal id="example">`
 */
export function hideModal(id: string) {
  getVisibilitySignal(id)[1](false)
  id2OnHide.get(id)?.()
}


/**
 * Call a function whenever a modal is opened
 * @param id - How to identify a modal when using ex, `showModal(id)` and is set via `<Modal id="example">`
 * @param fn - The function to call when this modal is shown
 */
export function onShowModal(id: string, fn: () => void | Promise<void>) {
  id2OnShow.set(id, fn)
}


/**
 * Call a function whenever a modal is closed
 * @param id - How to identify a modal when using ex, `showModal(id)` and is set via `<Modal id="example">`
 * @param fn - The function to call when this modal is closed
 */
export function onHideModal(id: string, fn: () => void | Promise<void>) {
  id2OnHide.set(id, fn)
}


/**
 * Determine if modal is visible
 * @param id - How to identify a modal when using ex, `showModal(id)` and is set via `<Modal id="example">`
 */
export function isModalVisible(id: string): boolean {
  return getVisibilitySignal(id)[0]() // returns the current boolean state
}


function getVisibilitySignal(id: string): Signal<boolean> {
  let signal = id2Signal.get(id)

  if (!signal) {
    signal = createSignal(false)
    id2Signal.set(id, signal)
  }

  return signal
}


export type ModalProps = {
  /** How to identify a modal when using ex, `showModal(id)` and is set via `<Modal id="example">` */
  id: string
  /** The tsx content to place into the modal */
  children: JSX.Element
  /** Optional, defaults to `true`, if you'd love a click on the modal to hide it */
  hideOnBackdropClick?: boolean
  /** Optional, html dom div props to the wrapper */
  divProps?: JSX.HTMLAttributes<HTMLDivElement>
}
