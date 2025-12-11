import { date2Input } from './date2Input'
import { createRenderEffect } from 'solid-js'
import { dateFromInput } from './dateFromInput'


/**
 * ### Sync state w/ input, textarea or select
 * - Purpose:
 *    - On init: input.value <- model.get()
 *    - On model.get() change: input.value <- model.get()
 *    - On input change: model.set(input.value)
 * - Supports textaea, select & input type:
 *    - Text
 *    - Checkbox
 *    - Radio
 *    - Date
 *    - Datetime-local
 * - Inspiration = AngularJS NgModel, the 🐐
 */
export function refModel<T>(model: { get: () => T; set: (v: T) => void }) {
  return (el: null | HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement) => {
    if (el instanceof HTMLInputElement || el instanceof HTMLTextAreaElement || el instanceof HTMLSelectElement) {
      createRenderEffect(() => { // on mount post paint + called again (sets value on input again) on state.get update
        const val = model.get()

        if (el instanceof HTMLTextAreaElement) el.value = val === undefined || val === null ? '' : String(val)
        else if (el instanceof HTMLSelectElement) el.value = val === undefined || val === null ? '' : String(val)
        else {
          switch (el.type) {
            case 'checkbox':
              el.checked = Boolean(val)
              break
            case 'radio':
              el.checked = val === el.value
              break
            case 'date':
              el.value = val instanceof Date ? date2Input('date-local', val) : String(val ?? '')
              break
            case 'datetime-local':
              el.value = val instanceof Date ? date2Input('datetime-local', val) : String(val ?? '')
              break
            default:
              el.value = val === undefined || val === null ? '' : String(val)
              break
          }
        }
      })

      el.addEventListener('input', onInput)
      el.addEventListener('change', onInput)

      function onInput (e: Event) {
        const target = e.target as
          | HTMLInputElement
          | HTMLTextAreaElement
          | HTMLSelectElement

        if (target instanceof HTMLInputElement) {
          const type = target.type

          switch (type) {
            case 'checkbox':
              model.set(target.checked as any)
              break
            case 'radio':
              if (target.checked) model.set(target.value as any)
              break
            case 'date': {
              if ((model.get as unknown) instanceof Date) {
                const parsed = dateFromInput(target.value, 'date')
                model.set(parsed as unknown as any)
              } else {
                model.set((target.value || '') as any)
              }
              break
            }
            case 'datetime-local': {
              if ((model.get as unknown) instanceof Date) {
                const parsed = dateFromInput(target.value, 'datetime-local')
                model.set(parsed as unknown as any)
              } else {
                model.set((target.value || '') as any)
              }
              break
            }
            default: {
              if (typeof model.get === 'number') {
                const parsed = Number(target.value)
                model.set(
                  Number.isNaN(parsed) ? (target.value as any) : (parsed as any),
                )
              } else {
                model.set(target.value as any)
              }
              break
            }
          }
        } else if (target instanceof HTMLTextAreaElement) {
          model.set(target.value as any)
        } else if (target instanceof HTMLSelectElement) {
          model.set(target.value as any)
        }
      }
    }
  }
}
