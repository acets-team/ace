/**
 * 🧚‍♀️ How to access:
 *     - Plugin: valibot
 *     - import { vReadableStream } from '@ace/vReadableStream'
 *     - import type { VReadableStreamProps } from '@ace/vReadableStream'
 */


import { bytesMB } from './bytes'
import type { Parser } from './types'


/**
 * - 🚨 Please upload files as `Readable Streams` when their file size exceeds `10MB` to not exceed Cloudflare's memory limit
 * - When we don't use Readable Stream's for upload and instead use formData -> the entire file get's loaded into Cloudflare's memory
 * - The Readable Stream Buffer Window Advantage:
 *     1. The Cloudflare Worker says to the Browser: "I have a 64KB bucket. Fill it."
 *     1. The Browser fills it.
 *     1. The Worker immediately hands that 64KB bucket to R2.
 *     1. Once R2 is done, the Worker's bucket is empty again. It tells the Browser: "Okay, give me the next 64KB."
 *     1. This let's us go way over `10MB`'s safely!
 * - 🚨 When using readable streams we will automatically ensure that the header `Content-Length` matches the streamed bytes length and throw if the streamed bytes length exceeds. This prevents `Header Lying` attacks.
 * @param props.maxSize - Max length as gotten from `Content-Length` header, example: If uploading a `1GB` file the `Content-Length` will be `1GB`
 * @param props.errorMessage Optional, defaults to "Please upload a valid file", starting error message, more specific messages appended
 * @param props.allowedMimeTypes Optional, if not set all mime types are valid, https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
 */
export function vReadableStream(props?: {
  maxSize?: number,
  errorMessage?: string,
  allowedMimeTypes?: string[],
}): Parser<Request> {
  return (req: unknown) => {
    if (!(req instanceof Request)) throw new Error('Please pass a Request', { cause: {req} })

    const headers = req.headers
    const error = props?.errorMessage ?? 'Please upload a valid file'

    // MIME
    const contentType = headers.get('content-type')
    if (props?.allowedMimeTypes && props.allowedMimeTypes.length > 0) {
      if (!contentType || !props.allowedMimeTypes.includes(contentType.toLowerCase())) {
        throw new Error(`${error}: Unsupported file type (${contentType})`)
      }
    }

    // Content-Length
    const contentLength = headers.get('content-length')
    if (!contentLength) {
      throw new Error(`${error}: Missing Content-Length header`)
    }

    const size = Number(contentLength)
    if (isNaN(size) || size <= 0) {
      throw new Error(`${error}: Invalid Content-Length`)
    }

    if (props?.maxSize && size > props.maxSize) {
      const mbLimit = props.maxSize / bytesMB
      throw new Error(`${error}: File size exceeds ${mbLimit}MB limit`)
    }

    return req
  }
}


export type VReadableStreamProps = Parameters<typeof vReadableStream>[0]
