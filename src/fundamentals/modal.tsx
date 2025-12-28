/**
 * 🧚‍♀️ How to access:
 *     - import { Modal, showModal, hideModal, isModalVisible, onShowModal, onHideModal  } from '@ace/modal'
 *     - import type { ModalProps } from '@ace/modal'
 */


import { modalVariant } from './vars'
import { Portal } from 'solid-js/web'
import { mergeStrings } from './merge'
import type { InferEnums } from './enums'
import { feComponent } from './feComponent'
import { createStyleFactory } from './createStyleFactory'
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
 * @param props.id How to identify a modal when using ex, `showModal(id)` and is set via `<Modal id="example">`
 * @param props.hideOnBackdropClick Optional, defaults to `true`, if you'd love a click on the modal to hide it
 * @param props.$div Optional, additonal props to place on the wrapper html div, ex: `id`, `class`, `style`
 * @param props.variant Optional, defaults to `center`, IF `center` then the modal is in the `center` of the screen, IF `top` then the modal is at the `top` of the screen
 * @param props.marginTop Optional, does nothing unless variant is `top`, space from top of screen, IF defined THEN sets value of of `--ace-modal-margin-top`
 * @param props.backdropBackground Optional, backdrop background color, IF defined THEN sets value of of `--ace-modal-backdrop-bg`
 */
export const Modal = feComponent((props: {
  /** How to identify a modal when using ex, `showModal(id)` and is set via `<Modal id="example">` */
  id: string
  /** The tsx content to place into the modal */
  children: JSX.Element
  /** Optional, defaults to `true`, if you'd love a click on the modal to hide it */
  hideOnBackdropClick?: boolean
  /** Optional, html dom div props to the wrapper */
  $div?: JSX.HTMLAttributes<HTMLDivElement>
  /** Optional, defaults to `center`, IF `center` then the modal is in the `center` of the screen, IF `top` then the modal is at the `top` of the screen */
  variant?: InferEnums<typeof modalVariant>
  /** Optional, does nothing unless variant is `top`, space from top of screen, IF defined then adds margin to top of modal from top of screen by seting value of `--ace-modal-margin-top` */
  marginTop?: string
  /** Optional, color of backdrop background, IF defined THEN sets value of of `--ace-modal-backdrop-bg` */
  backdropBackground?: string
}) => {
  if (modalVariant.has(props.id)) throw new Error('Please ensure the id for this modal is not the same as one of the modal variant options', { cause: { id: props.id } })

  // defaults, not using mergeProps to maintain reactivity
  if (props.variant == undefined) props.variant = 'center'
  if (props.hideOnBackdropClick == undefined) props.hideOnBackdropClick = true

  let modalRef: undefined | HTMLDivElement

  const [isOpen] = getVisibilitySignal(props.id)

  const { sm, createStyle } = createStyleFactory({ componentProps: props, requestStyle: props.$div?.style })

  const style = createStyle([
    sm('marginTop', '--ace-modal-margin-top'),
    sm('backdropBackground', '--ace-modal-backdrop-bg'),
  ])

  createEffect(() => {
    if (isOpen() && modalRef) modalRef.focus()
  })

  function close() {
    if (props.hideOnBackdropClick) hideModal(props.id)
  }

  return <>
    <Show when={isOpen()}>
      <Portal>
        <div id={`ace-modal--` + props.id} onClick={close} aria-hidden={isOpen() ? 'false' : 'true'} {...props.$div} style={style()} class={mergeStrings('ace-modal', `ace-modal--${props.variant}`, props.$div?.class)}>
          <div class="ace-modal__content" onClick={close}>
            <div class="ace-modal__modal" onClick={(e) => e.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby={`${props.id}-label`} tabIndex={-1}>{props.children}</div>
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


export type ModalProps = Parameters<typeof Modal>[0]
