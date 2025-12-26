/**
 * 🧚‍♀️ How to access:
 *     - Plugin: cf
 *     - import { r2Worker } from '@ace/r2Worker'
 *     - import type { R2WorkerProps } from '@ace/r2Worker'
 */


import { env } from './env'
import { date2Iso } from './date2Iso'
import { r2CustomMetadataHeader } from './vars'
import { WorkerEntrypoint } from 'cloudflare:workers'
import type { R2ListOptions, R2ResEither, R2ResList } from './vanilla'


/**
 * ### Provides a Cloudflare Worker that has endpoints for Cloudflare R2
 * - 🚨 Do not write (`PUT` / `DELETE`) to this `worker` from the `Browser`. PLEASE write to your server first THEN validate the file on your server AND THEN call this worker from your server. This way you can secure this worker w/ a `secret` that is not expossed in the browser
 * - To create a new secret -> Bash: `ace password`
 * - To view a list of objects call -> `/?list=true`
 * - To view an HTML form to test locally call -> `http://localhost:8787/`
 * - To delete an object call -> DELETE `/<key>`
 * - To put an object call -> PUT `/<key>` or PUT `/` and we'll use the filename for the `key`
 * @example
  ```ts
  import { r2Worker } from '@ace/r2Worker'

  export default r2Worker({
    binding: 'acets',
    onValidatePut: ensureAuthenticated,
    onValidateDelete: ensureAuthenticated,
    onValidateGetList: ensureAuthenticated,
  })

  function ensureAuthenticated(request: Request) {
    if (request.headers.get('ACE_R2_SECRET') !== process.env.ACE_R2_SECRET) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 400,
        headers: { 'content-type': 'application/json' }
      })
    }
  }
  ```
 * @param props.binding Please ensure `props.binding` matches `wrangler.jsonc` → `r2_buckets` → `binding`
 * @param props.onValidatePut Optional, validations to occur when on `PUT` request is called. IF valid THEN return nothing. IF invalid THEN retrurn the error Response that we will give to the user & stop any further processing
 * @param props.onValidateGetOne Optional, validations to occur when on `GET` one object by key request is called. IF valid THEN return nothing. IF invalid THEN retrurn the error Response that we will give to the user & stop any further processing
 * @param props.onValidateGetList Optional, validations to occur when on `GET` list request is called. IF valid THEN return nothing. IF invalid THEN retrurn the error Response that we will give to the user & stop any further processing
 * @param props.onValidateDelete Optional, validations to occur when on `DELETE` request is called. IF valid THEN return nothing. IF invalid THEN retrurn the error Response that we will give to the user & stop any further processing
 */
export function r2Worker(props: {
  /** Please ensure `props.binding` matches `wrangler.jsonc` → `r2_buckets` → `binding` */
  binding: string

  /** Optional, validations to occur when on `PUT` request is called. IF valid THEN return nothing. IF invalid THEN retrurn the error Response that we will give to the user & stop any further processing */
  onValidatePut?: (request: Request) => void | Response | Promise<void | Response>,

  /** Optional, validations to occur when on `GET` one object by key request is called. IF valid THEN return nothing. IF invalid THEN retrurn the error Response that we will give to the user & stop any further processing */
  onValidateGetOne?: (request: Request) => void | Response | Promise<void | Response>,

  /** Optional, validations to occur when on `GET` list request is called. IF valid THEN return nothing. IF invalid THEN retrurn the error Response that we will give to the user & stop any further processing */
  onValidateGetList?: (request: Request) => void | Response | Promise<void | Response>,

  /** Optional, validations to occur when on `DELETE` request is called. IF valid THEN return nothing. IF invalid THEN retrurn the error Response that we will give to the user & stop any further processing */
  onValidateDelete?: (request: Request) => void | Response | Promise<void | Response>,
}) {
  return class UploadWorker extends WorkerEntrypoint<Env> {
    async fetch(request: Request) {
      try {
        const r2Bucket = this.env[props.binding as keyof typeof this.env]
        if (!r2Bucket || typeof r2Bucket !== 'object') throw new Error('Please ensure the props.binding passed to createUploadWorker() matches wrangler.jsonc → r2_buckets → binding')

        const url = new URL(request.url)
        const key = decodeURIComponent(url.pathname.slice(1)) // remove starting slash from pathname

        switch (request.method) {
          case 'PUT': return onPut(props, request, r2Bucket, key)
          case 'GET': return onGet(props, request, r2Bucket, key, url)
          case 'DELETE': return onDelete(props, request, r2Bucket, key)
          default: return json({ error: `Method "${request.method}" is not allowed` }, 405)
        }
      } catch (e) {
        return onCatch(e)
      }
    }
  }
}


async function onPut(props: R2WorkerProps, request: CFRequest, r2Bucket: R2Bucket, key: string) {
  // validate
  if (props.onValidatePut) {
    const res = await props.onValidatePut(request)
    if (res instanceof Response) return res
  }

  const options: R2PutOptions = {
    onlyIf: createHeaders(request, [
      'If-Match',
      'If-None-Match',
      'If-Modified-Since',
      'If-Unmodified-Since',
    ]),
    httpMetadata: createHeaders(request, [
      'Content-Type',
      'Content-Language',
      'Content-Disposition',
      'Content-Encoding',
      'Cache-Control',
      'Expires',
    ]),
  }

  const customMetaRaw = request.headers.get(r2CustomMetadataHeader)

  if (customMetaRaw) {
    options.customMetadata = JSON.parse(customMetaRaw)
  }

  /**
   * - request.formData()
   *     - When we use request.formData() we tell the Worker
   *     - Wait until we have every single byte of this request, parse it, and put it in a variable
   *     - Workers has a 128MB memory limit so a 1GB upload w/ request.formData() will run out of memory
   * - request.body is a ReadableStream & lets us NOT pull the entire stream into memory, example:
   *     - ReadableStream is a garden hose
   *     - Water comes in one end and goes out the other
   *     - At any given moment, the hose only contains a few cups of water
   *     - But over an hour, it can move thousands of gallons
   */
  const res = await r2Bucket.put(key, request.body, options);

  return json({
    data: {
      key: res.key,
      version: res.version,
      size: res.size,
      etag: res.etag,
      httpEtag: res.httpEtag,
      uploaded: date2Iso(res.uploaded),
      httpMetadata: res.httpMetadata,
      customMetadata: res.customMetadata,
      range: res.range,
      checksums: res.checksums,
    }
  })
}



async function onGet(props: R2WorkerProps, request: CFRequest, r2Bucket: R2Bucket, key: string, url: URL) {
  if (url.searchParams.has('list')) { // list
    return onGetList(props, request, r2Bucket, url)
  }


  if (env === 'local' && url.pathname === '/') { // html
    return new Response(html, { headers: { 'Content-Type': 'text/html; charset=utf-8' } })
  }


  if (key) { // object
    return onGetOne(props, request, r2Bucket, key)
  }

  return json({ error: 'Not Found' }, 404)
}



async function onGetOne(props: R2WorkerProps, request: CFRequest, r2Bucket: R2Bucket, key: string) {
  // validate
  if (props.onValidateGetOne) {
    const res = await props.onValidateGetOne(request)
    if (res instanceof Response) return res
  }


  // get object
  const object = await r2Bucket.get(key, {
    range: createHeaders(request, ['Range']),
    onlyIf: createHeaders(request, [
      'If-Match',
      'If-None-Match',
      'If-Modified-Since',
      'If-Unmodified-Since',
    ]),
  })


  // 404
  if (object === null) {
    return json({ error: 'Object Not Found' }, 404)
  }


  const headers = new Headers()
  object.writeHttpMetadata(headers) // place http meta data onto object headers
  headers.set('etag', object.httpEtag) // place etag onto headers to help w/ browser caching


  /**
   * Handle `onlyIf` Conditional Hits (Missing Body)
   * - When R2 returns an object without a 'body', it indicates that the criteria provided in the 'onlyIf' option were not satisfied based on the object's metadata.
   * @status 304 Not Modified (Cache Validation)
   * - When the browser asks to skip the download if its local version is current:
   *     - 'If-None-Match': Skip if the ETag matches the server's version
   *     - 'If-Modified-Since': Skip if the file hasn't been changed since the provided date
   * @status 412 Precondition Failed (State Integrity)
   * - When the browser requires a specific server state to proceed:
   *     - 'If-Match': Only proceed if the server's ETag matches exactly (prevents mid-air collisions)
   *     - 'If-Unmodified-Since': Only proceed if the file hasn't been changed since a specific time
   * * 
   */
  if (!('body' in object) || object.body === null) {
    const isCacheCheck = request.headers.has('if-none-match') || request.headers.has('if-modified-since') // check cache hit

    return new Response(null, { // 304 tells the browser "Your copy is good"; 412 tells the browser "The condition you set failed"
      status: isCacheCheck ? 304 : 412,
      headers
    })
  }


  /**
   * - A Range Request is the browser saying: "Don't send me the whole file; just send me the bytes from X to Y."
   * - 206: Partial Content - Returning a slice
   * - 200: OK - Returning everything
   * - request.headers.has('range') -> browser requested a slice
   * - object.range -> r2 provided a slice (in the case where the requested range is out of bounds r2 may return all)
   */
  const isRangeRequest = (request.headers.has('range') && object.range)
  const status = isRangeRequest ? 206 : 200


  if (!isRangeRequest) headers.set('Content-Length', String(object.size))
  else { // helpful for video
    let start: number
    let end: number
    let chunkLength: number

    // the { suffix: number } case (Last X bytes)
    // A Suffix request is used when a client wants to grab data starting from the end of the file rather than the beginning
    if ('suffix' in object.range) {
      start = object.size - object.range.suffix
      end = object.size - 1
      chunkLength = object.range.suffix
    } else { // the { offset, length } or { offset } cases
      // jumped to the middle of a video, so now send a chunk from the middle
      start = object.range.offset ?? 0
      chunkLength = object.range.length ?? (object.size - start)
      end = start + chunkLength - 1
    }

    headers.set('Content-Length', String(chunkLength))
    headers.set('Content-Range', `bytes ${start}-${end}/${object.size}`)
  }

  return new Response(object.body, { status, headers })
}



async function onGetList(props: R2WorkerProps, request: CFRequest, r2Bucket: R2Bucket, url: URL) {
  // validate
  if (props.onValidateGetList) {
    const res = await props.onValidateGetList(request)
    if (res instanceof Response) return res
  }

  /**
   * - If the URL is: ?list=true&include=httpMetadata&include=customMetadata
   * - getAll('include') returns: ["httpMetadata", "customMetadata"]
   */
  const include = url.searchParams.getAll('include') as ('httpMetadata' | 'customMetadata')[]

  const options: R2ListOptions = {
    include: include.length > 0 ? include : undefined,
    prefix: url.searchParams.get('prefix') || undefined,
    cursor: url.searchParams.get('cursor') || undefined,
    delimiter: url.searchParams.get('delimiter') ?? undefined,
    startAfter: url.searchParams.get('startAfter') ?? undefined,
    limit: url.searchParams.has('limit') ? Number(url.searchParams.get('limit')) : 1000,
  }

  const list = await r2Bucket.list(options)

  const data: R2ResList = list.objects.map(obj => ({
    key: obj.key,
    etag: obj.etag,
    httpEtag: obj.httpEtag,
    httpMetadata: obj.httpMetadata,
    uploaded: date2Iso(obj.uploaded),
    customMetadata: obj.customMetadata
  }))

  return json({ data })
}



function createHeaders(request: CFRequest, keys: string[]): Headers {
  const headers = new Headers()

  for (const key of keys) {
    const value = request.headers.get(key)

    if (value) headers.set(key, value)
  }

  return headers
}



async function onDelete(props: R2WorkerProps, request: CFRequest, r2Bucket: R2Bucket, key: string) {
  if (props.onValidateDelete) {
    const res = await props.onValidateDelete(request)
    if (res instanceof Response) return res
  }

  await r2Bucket.delete(key)
  return json({ data: 'Deleted!' })
}



function onCatch(e: unknown) {
  const error = e instanceof Error
    ? e.message
    : typeof e === 'string'
      ? e
      : 'An Error Happened'

  return json({ error }, 400)
}



function json(res: R2ResEither, status = 200) {
  return new Response(JSON.stringify(res), {
    status,
    headers: {
      'Allow': 'PUT, GET, DELETE',
      'Content-Type': 'application/json'
    }
  })
}


type CFRequest = Request<unknown, CfProperties<unknown>>


export type R2WorkerProps = Parameters<typeof r2Worker>[0]


const html = `
<!DOCTYPE html>
<html lang="en">

<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Ace R2</title>
  <style>
    :root {
      --ace-font-size: 1.8rem;
      --ace-line-height: 1.41;
      --ace-font-semibold: 500;
      --ace-font-bold: 600;
      --ace-font-family: system-ui, sans-serif;

      --ace-easing: ease-in-out;
      --ace-duration-fast: 120ms;
      --ace-duration-normal: 300ms;

      --ace-space: 0.45rem;
      --ace-radius: 0.45rem;
      --ace-content-max-width: 69rem;

      --ace-primary: oklch(71.998% 0.17242 303.058);
      --ace-primary-hover: oklch(60.801% 0.24812 298.426);
      --ace-primary-foreground: var(--ace-background);

      --ace-destructive: oklch(0.69 0.21 18);
      --ace-destructive-hover: oklch(0.69 0.27 18);
      --ace-destructive-foreground: var(--ace-background);

      --ace-background: oklch(18.22% 0.00002 271.152);
      --ace-foreground: oklch(90.67% 0.0001 271.152);
      --ace-muted: oklch(73.802% 0.00008 271.152);
      --ace-border: oklch(32.109% 0.00004 271.152);
      --ace-card: oklch(23.503% 0.00003 271.152);

      --ace-input: oklch(28.502% 0.00003 271.152);
      --ace-input-foreground: oklch(90.67% 0.0001 271.152);

      --ace-ring-width: 0.3rem;
      --ace-ring: oklch(60.483% 0.21664 257.23 / 0.6);

      --ace-card-shadow: 0 0 20px oklch(0% 0 0 / 0.5);

      --ace-fast-transition: all var(--ace-duration-fast) var(--ace-easing);
      --ace-transition: all var(--ace-duration-normal) var(--ace-easing);
      --ace-prop-transition: var(--ace-duration-normal) var(--ace-easing);
      --ace-fast-prop-transition: var(--ace-duration-fast) var(--ace-easing);
    }

    *,
    *::before,
    *::after {
      box-sizing: border-box;
    }

    *:focus-visible {
      outline: none;
      box-shadow: 0 0 0 var(--ace-ring-width) var(--ace-ring);
    }

    html {
      font-size: 62.5%;
    }

    body,
    input,
    button,
    textarea {
      font-size: var(--ace-font-size);
      font-family: var(--ace-font-family);
    }

    body {
      background-color: var(--ace-background);
      color: var(--ace-foreground);
      margin: 0;
      padding: calc(var(--ace-space) * 3);
    }

    h1 {
      color: var(--ace-primary);
      text-align: center;
    }

    h2 {
      margin-bottom: calc(var(--ace-space) * 2);
    }

    .container {
      max-width: var(--ace-content-max-width);
      margin: 0 auto;
      background: var(--ace-card);
      padding: calc(var(--ace-space) * 3);
      border-radius: calc(var(--ace-radius) * 3);
      box-shadow: var(--ace-card-shadow);
    }

    label {
      display: block;
      font-weight: bold;
      margin-bottom: calc(var(--ace-space) / 2);
    }

    button {
      transition: var(--ace-transition);
    }

    input,
    .textarea-grow {
      margin-bottom: calc(var(--ace-space) * 5);
    }

    input,
    textarea,
    .submit,
    .textarea-grow::after {
      width: 100%;
      padding: calc(var(--ace-space) * 2);
      margin-top: var(--ace-space);
      border-radius: calc(var(--ace-radius) * 2);
      border: 1px solid var(--ace-border);
      background: var(--ace-input);
      color: var(--ace-input-foreground);
    }

    .submit {
      background: var(--ace-primary);
      color: var(--ace-primary-foreground);
      font-weight: var(--ace-font-bold);
      cursor: pointer;
      border: none;
    }

    .submit:hover {
      background: var(--ace-primary-hover);
    }

    .object-card {
      background: var(--ace-input);
      padding: calc(var(--ace-space) * 3);
      border-radius: calc(var(--ace-radius) * 2);
      margin-bottom: calc(var(--ace-space) * 2);
      display: flex;
      justify-content: space-between;
      align-items: flex-start;
    }

    .object-info {
      flex: 1;
      margin-right: var(--ace-space);
    }

    .object-info a {
      color: var(--ace-primary);
    }

    .object-info p {
      margin: var(--ace-space) 0;
      word-break: break-word;
    }

    .object-info .meta {
      color: var(--ace-muted);
    }

    .delete-btn {
      background: var(--ace-destructive);
      color: var(--ace-destructive-foreground);
      padding: var(--ace-space) calc(var(--ace-space) * 2);
      font-weight: var(--ace-font-bold);
      cursor: pointer;
      border-radius: calc(var(--ace-radius) * 2);
      border: none;
      width: auto;
      font-size: 90%;
    }

    .delete-btn:hover {
      background: var(--ace-destructive-hover);
    }

    pre {
      background: var(--ace-input);
      padding: calc(var(--ace-space) * 3);
      border-radius: calc(var(--ace-radius) * 2);
      overflow-x: auto;
    }

    .textarea-grow {
      display: grid;
    }

    .textarea-grow::after { /* This mirrors the content of the textarea */
      content: attr(data-replicated-value) " ";
      visibility: hidden;
    }

    .textarea-grow > textarea,
    .textarea-grow::after { /* Both elements must have identical padding/font/border */
      grid-area: 1 / 1 / 2 / 2;
      resize: none;
      white-space: pre;
      overflow-x: auto;
      overflow-y: hidden;
    }
  </style>
</head>

<body>
  <h1>Ace R2 Test</h1>
  <div class="container">
    <form id="uploadForm">
      <label for="file">File:</label>
      <input type="file" id="file" name="file">

      <label for="key">Key (optional):</label>
      <input type="text" id="key" name="key">

      <label for="customMetadata">Custom Metadata (JSON, optional):</label>
      <div class="textarea-grow">
        <textarea name="customMetadata" id="customMetadata" placeholder='{"author":"Ace","tag":"demo"}'></textarea>
      </div>

      <label for="httpMetadata">Http Metadata (JSON, optional):</label>
      <div class="textarea-grow">
        <textarea name="httpMetadata" id="httpMetadata" placeholder='{"Content-Language":"en-US"}'></textarea>
      </div>

      <label for="onlyIf">Only If (JSON, optional):</label>
      <div class="textarea-grow">
        <textarea name="onlyIf" id="onlyIf" placeholder='{"If-Match":"abc"}'></textarea>
      </div>

      <button class="submit" type="submit">Upload File</button>
    </form>

    <h2>Response</h2>
    <div class="textarea-grow">
      <textarea id="response">Response</textarea>
    </div>

    <h2>Current Objects in Bucket</h2>
    <div id="objects"></div>

    <h2>Notes:</h2>
    <div class="textarea-grow">
      <textarea name="pre">/**
 * # Custom MetaData:
 *     - Header: x-ace-r2-custom-metadata
 *     - Format: Record<string, string>
 * # httpMetadata:
 *     - Format: Record<string, string>
 *     - Lets us store HTTP metadata with the object, record keys:
 *     - Content-Type: https://developer.mozilla.org/en-US/docs/Web/HTTP/Guides/MIME_types/Common_types
 *     - Content-Language: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Language
 *     - Content-Disposition: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Disposition
 *     - Content-Encoding: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Content-Encoding
 *     - Cache-Control: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control
 *     - Expires: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Cache-Control
 * # onlyIf:
 *     - Format: Record<string, string>
 *     - Conditional headers, return null when invalid, record keys:
 *     - If-Match: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Match
 *     - If-None-Match: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-None-Match
 *     - If-Modified-Since: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Modified-Since
 *     - If-Unmodified-Since: https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/If-Unmodified-Since
 * # Header Dates
 *     - @ onlyIf > If-Modified-Since & If-Unmodified-Since
 *     - new Date().toUTCString()
 *     - Example: Wed, 21 Oct 2015 07:28:00 GMT
 *     - https://developer.mozilla.org/en-US/docs/Web/HTTP/Reference/Headers/Last-Modified
 * # ETag
 *     - hash/fingerprint of an R2 object
 *     - Created by Cloudflare
 *     - Really helpful from a caching perspective
 */</textarea>
    </div>
  </div>

  <script>
    // @ts-check

    const dom = {
      response: document.getElementById('response'),
      objects: document.getElementById('objects'),
      uploadForm: document.getElementById('uploadForm'),
    }

    dom.responseWrapper = dom.response?.closest('.textarea-grow')

    if (!dom.uploadForm) throw new Error('!dom.uploadForm')

    dom.uploadForm.addEventListener('submit', onSubmit)

    window.addEventListener('DOMContentLoaded', onLoad)


    function onLoad() {
      getObjects()

      /** @type {NodeListOf<HTMLDivElement>} */
      const containers = document.querySelectorAll('.textarea-grow')

      containers.forEach(container => { // set the initial value for the ghost element
        const textarea = container.querySelector('textarea')
        if (!textarea) throw new Error('!textarea')

        container.dataset.replicatedValue = textarea?.value

        textarea.addEventListener('input', (e) => container.dataset.replicatedValue = textarea.value)
      })
    }


    /** @param e {SubmitEvent} */
    async function onSubmit(e) {
      if (!(e.target instanceof HTMLFormElement)) throw new Error('e.target is not a form')

      e.preventDefault()

      const fd = new FormData(e.target)
      const file = fd.get('file')

      if (!(file instanceof File) || !file.size) {
        return writeResponse({ error: 'No file selected!' })
      }

      const key = fd.get('key') || file.name
      if (!key || typeof key !== 'string') return writeResponse({ error: '!key' })

      if (!validateJson(fd, 'onlyIf')) return

      if (!validateJson(fd, 'httpMetadata')) return

      if (!validateJson(fd, 'customMetadata')) return

      const headers = new Headers()

      // httpMetadata -> headers
      const rawHttpMetadata = fd.get('httpMetadata')?.toString()

      if (rawHttpMetadata) {
        const entries = Object.entries(JSON.parse(rawHttpMetadata))
        for (const [k, v] of entries) headers.set(k, String(v))
      }

      // onlyIf -> headers
      const rawOnlyIf = fd.get('onlyIf')?.toString()

      if (rawOnlyIf) {
        const entries = Object.entries(JSON.parse(rawOnlyIf))
        for (const [k, v] of entries) headers.set(k, String(v))
      }

      // customMetadata -> headers
      const rawCustomMetadata = fd.get('customMetadata')?.toString()
      if (rawCustomMetadata) headers.set('x-ace-r2-custom-metadata', rawCustomMetadata)

      try {
        const response = await fetch(r2Url(key), { method: "PUT", headers, body: file })
        const res = await response.json()

        if (res.data) await getObjects()
        return writeResponse(res)
      } catch (err) {
        return writeResponse({ error: err.message })
      }
    }


    async function getObjects() {
      if (!dom.objects) throw new Error('!dom.objects')

      const response = await fetch('/?list=true&include=httpMetadata&include=customMetadata')
      const res = await response.json()

      if (res.error) writeResponse(res.error)
      else if (res.data) {
        dom.objects.innerHTML = ''

        for (const obj of res.data) {
          const card = document.createElement('div');
          card.className = 'object-card';

          const info = document.createElement('div');
          info.className = 'object-info';

          const link = document.createElement('a');
          link.href = '/' + encodeURIComponent(obj.key);
          link.target = '_blank';
          link.textContent = obj.key;
          info.appendChild(link);

          if (obj.httpMetadata) {
            const p = document.createElement('p');
            p.className = 'meta';
            p.textContent = 'HTTP Metadata: ' + JSON.stringify(obj.httpMetadata);
            info.appendChild(p);
          }

          if (obj.customMetadata) {
            const p = document.createElement('p');
            p.className = 'meta';
            p.textContent = 'Custom Metadata: ' + JSON.stringify(obj.customMetadata);
            info.appendChild(p);
          }

          const delBtn = document.createElement('button');
          delBtn.textContent = 'Delete';
          delBtn.className = 'delete-btn';
          delBtn.onclick = async () => { await deleteObject(obj.key); };

          card.appendChild(info);
          card.appendChild(delBtn);

          dom.objects.appendChild(card);
        }
      }
    }


    async function deleteObject(key) {
      const res = await fetch(r2Url(key), { method: 'DELETE' })
      writeResponse(await res.json())
      getObjects()
    }


    /** @param key {string} */
    function r2Url(key) {
      const url = new URL(window.location.origin)

        // encode parts & not slashes
        const encodedKey = key
          .split('/')
          .map(encodeURIComponent)
          .join('/')

        // slash guard
        // ensures basePath and keyPath will always have exactly one slash between them
        const keyPath = encodedKey.startsWith('/')
          ? encodedKey.slice(1)
          : encodedKey

        const basePath = url.pathname.endsWith('/')
          ? url.pathname.slice(0, -1)
          : url.pathname

        url.pathname = basePath + '/' + keyPath

        return url.href
      }


    function writeResponse(value) {
      if (!(dom.response instanceof HTMLTextAreaElement)) throw new Error('dom.response is not a textarea')
      dom.response.value = JSON.stringify(value, null, 2)
      dom.responseWrapper.dataset.replicatedValue = dom.response.value
    }


    function validateJson(fd, name) {
      const asString = fd.get(name) || '{}'

      try {
        JSON.parse(asString)
        fd.set(name, asString)
        return true
      } catch (e) {
        writeResponse({ error: 'Invalid JSON @ ' + name })
      }

      return false
    }
  </script>

</body>

</html>
`