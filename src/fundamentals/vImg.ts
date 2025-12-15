/**
 * 🧚‍♀️ How to access:
 *     - Plugin: valibot
 *     - import { vImg } from '@ace/vImg'
 */


import { custom } from 'valibot'
import { isFile } from '../isFile'


/**
 * ### Valibot validation to know input is an image
 * - Does the same validations as `vFile` + a mime check: `if (!file.type.startsWith('image/'))`
 * @example
  ```ts
  import { bytesMB } from '@ace/bytes'

  export const info = new ApiInfo({
    method: 'POST',
    path: '/api/form-data',
    parser: vParser.api({
      body: {
        date: vDate(),
        email: vEmail(),
        picture: vImg({
          maxSize: 2 * bytesMB,
          allowedExtensions: ['jpg'],
          errorMessage: 'Please provide a jpg that is less then 2MB'
        })
      }
    })
  })
  ```
 * @param props.maxSize Optional, in bytes, IF defined we will throw an error if the file size is greater then `props.maxSize`
 * @param props.allowedExtensions Optional, IF defined we will throw an error if the extension is not w/in the `props.allowedExtensions`
 * @param props.errorMessage Optional, defaults to `Please provide a picture`
 */
export function vImg(props?: { maxSize?: number, errorMessage?: string, allowedExtensions?: string[] }) {
  return custom<File>(
    (file) => {
      const result = isFile(file, props)

      if (result.status === false) return false
      if (!result.file.type.startsWith('image/')) return false // mime check

      return true
    },
    props?.errorMessage ?? 'Please provide a picture'
  )
}
