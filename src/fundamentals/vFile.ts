/**
 * 🧚‍♀️ How to access:
 *     - Plugin: valibot
 *     - import { vFile } from '@ace/vFile'
 */


import { custom } from 'valibot'
import { isFile } from '../isFile'


/**
 * ### Valibot validation to know input is a file
 * @param props.maxSize Optional, in bytes, IF defined we will throw an error if the file size is greater then `props.maxSize`
 * @param props.allowedExtensions Optional, IF defined we will throw an error if the extension is not w/in the `props.allowedExtensions`
 * @param props.errorMessage Optional, defaults to `Please provide a file`
 */
export function vFile(props?: { maxSize?: number, errorMessage?: string, allowedExtensions?: string[] }) {
  return custom<File>(
    (file) => isFile(file, props).status,
    props?.errorMessage ?? 'Please provide a file'
  )
}
