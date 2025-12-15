/**
 * 🧚‍♀️ How to access:
 *     - Plugin: vanilla
 *     - import { createFormDataObject } from '@ace/createFormDataObject'
 */


import type { FormDataObject } from './vanilla'


/**
 * ### Convert `FormData` into an `object` where the form `name` is the `key` & its form `value` is the `value`
 * - Works for file inputs, text inputs, textareas, checkboxes, radio buttons and multi-select fields
 * - Helpful b/c `Valibot` / `Parsers` validate `objects` not `formData`
 * - Single-value fields become `string | File`
 * - Repeated fields become `(string | File)[]`
 * - FormData always returns strings for inputs (`text`, `number`, `date`, etc.)
 * @param formData - The FormData to convert
 */
export function createFormDataObject(formData: FormData): FormDataObject {
  const fdObj: FormDataObject = {}

  for (const [key, value] of formData.entries()) {
    const existing = fdObj[key]

    if (existing === undefined) fdObj[key] = value
    else {
      if (Array.isArray(existing)) existing.push(value)
      else fdObj[key] = [existing, value]
    }
  }

  return fdObj
}
