import { r2Url } from './r2Url'
import { mergeObjects } from './merge'
import { r2CustomMetadataHeader } from './vars'
import type { R2HttpMetadata, R2ListOptions, R2OnlyIf } from './vanilla'


/**
 * - `Cloudflare R2` helper
 * - 🚨 Please only use from `ScopeBE`, b/c our `BE` (Backend Server) has access to the `secret` that should be required from our `r2Worker` to `PUT`, `DELETE` & `LIST`
 */
export class R2 {
  put(props: {
    requestInit?: Partial<RequestInit>,
    data: {
      file: File | ReadableStream<Uint8Array>,
      key?: string,
      onlyIf?: R2OnlyIf,
      httpMetadata?: R2HttpMetadata,
      customMetadata?: Record<string, string>
    }
  }) {
    const headers = new Headers(props.requestInit?.headers)

    if (props.data.file instanceof File) {
      // Content-Type
      if (props.data.file.type) {
        headers.set('Content-Type', props.data.file.type)
      }

      // Content-Length
      if (props.data.file.size) {
        headers.set('Content-Length', String(props.data.file.size))
      }
    }

    // onlyIf -> headers
    if (props.data.onlyIf) {
      for (const [k, v] of Object.entries(props.data.onlyIf)) {
        headers.set(k, String(v));
      }
    }

    // httpMetadata -> headers
    if (props.data.httpMetadata) {
      for (const [k, v] of Object.entries(props.data.httpMetadata)) {
        headers.set(k, String(v));
      }
    }

    // customMetadata -> headers
    if (props.data.customMetadata) {
      headers.set(r2CustomMetadataHeader, JSON.stringify(props.data.customMetadata));
    }

    const mergedInit: RequestInit = this.#getRequestInit({
      request: props.requestInit,
      required: { method: 'PUT', body: props.data.file, headers, duplex: 'half' },
    })

    // key
    let key = props.data.key

    if (!key && props.data.file instanceof File) {
      key = props.data.file.name || 'unamed_object'
    }

    return fetch(r2Url({ key }), mergedInit)
  }


  delete(props: {
    key: string
    requestInit?: Partial<RequestInit>,
  }) {
    const mergedInit: RequestInit = this.#getRequestInit({
      request: props.requestInit,
      required: { method: 'DELETE' },
    })

    return fetch(r2Url({ key: props.key }), mergedInit)
  }


  list(props: {
    options?: R2ListOptions,
    requestInit?: Partial<RequestInit>,
  }) {
    const searchParams = new URLSearchParams()

    searchParams.set('list', 'true')

    // use != null to allow 0, but catch undefined/null
    if (props.options?.limit != null) searchParams.set('limit', String(props.options.limit))
    if (props.options?.prefix != null) searchParams.set('prefix', props.options.prefix)
    if (props.options?.cursor != null) searchParams.set('cursor', props.options.cursor)
    if (props.options?.delimiter != null) searchParams.set('delimiter', props.options.delimiter)
    if (props.options?.startAfter != null) searchParams.set('startAfter', props.options.startAfter)

    for (const v of props.options?.include ?? []) {
      searchParams.append('include', v)
    }

    return fetch(r2Url({ searchParams }), props.requestInit)
  }


  #getRequestInit(props: Parameters<typeof mergeObjects>[0]) {
    return mergeObjects(props)
  }
}
