// @ts-check
/// <reference lib="webworker" />

/**
 * @example
  ```
  // public/sw.js

  import { addOfflineSupport } from '../.ace/addOfflineSupport'

  addOfflineSupport(import.meta.url, [
    'https://cdn.jsdelivr.net/npm/chart.js@4.5.0/dist/chart.umd.min.js',
    'https://cdn.jsdelivr.net/npm/markdown-it@14.1.0/dist/markdown-it.min.js',
    'https://cdn.jsdelivr.net/npm/ag-grid-community@34.2.0/dist/ag-grid-community.min.js',
  ])
  ```
 * @param {string} url - `import.meta.url`
 * @param {string[]} [cdnAssets=[]] - Optional, defaults to empty array, list of CDN assets to cache
 * @returns {void}
 */
export const addOfflineSupport = (url, cdnAssets = []) => {
  const cacheKey = getCacheKey(url)

  /** @type {ServiceWorkerGlobalScope} */
  const sw = /** @type {any} */ (self)

  sw.addEventListener('install', onInstall(cacheKey, cdnAssets))

  sw.addEventListener('fetch', onFetch(cacheKey))

  sw.addEventListener('activate', onActivate(cacheKey))
}


/**
 * @param {string} url 
 * @returns {string}
 */
function getCacheKey(url) {
  const CACHE_NAME = new URL(url).pathname.split('/').pop() // "sw_v4.js"
  const CACHE_NAME_NO_EXT = CACHE_NAME?.replace(/\.[^/.]+$/, "") // "sw_v4"
  return CACHE_NAME_NO_EXT ?? ''
}


/**
 * - On install add cdn assets to cache b/c our onFetch() does not see the request to cdn assets
 * @param {string} cacheKey - How we are identifiying this cache versioned assets
 * @param {string[]} CDN_ASSETS
 * @returns {(e: ExtendableEvent) => void}
 */
export const onInstall = (cacheKey, CDN_ASSETS) => {
  /** @param {ExtendableEvent} event */
  return (event) => {
    event.waitUntil(
      caches.open(cacheKey).then(cache => cache.addAll(CDN_ASSETS))
    )
  }
}


/**
 * - On fetch requests:
 *    - Add response to cache for offline support
 *    - IF offline & we got cache response for this request THEN give the cache response back
 * @param {string} cacheKey - How we are identifiying this cache versioned assets
 * @returns {(e: FetchEvent) => void}
 */
export const onFetch = (cacheKey) => {
  /** @param {FetchEvent} event */
  return (event) => {
    event.respondWith((async () => {
      try {
        const networkResponse = await fetch(event.request) // do fetch

        const cache = await caches.open(cacheKey) // open cache

        cache.put(event.request, networkResponse.clone()) // place clone response in cache

        return networkResponse // return response
      } catch (error) { // Maybe offline
        if (!navigator.onLine) { // definitly offline
          const cachedResponse = await caches.match(event.request) // get cache response

          
          return cachedResponse ?? new Response('Offline', { status: 503 }) // return cached response OR fallback response
        }

        return new Response('Network error', { status: 502 }) // fallback for other fetch errors
      }
    })())
  }
}



/**
 * Remove all from cache but current version
 * @param {string} cacheKey 
 * @returns {(e: ExtendableEvent) => void}
 */
export const onActivate = (cacheKey) => {
  /** @param {ExtendableEvent} event */
  return (event) => {
    event.waitUntil(
      caches.keys().then(keys => {
        return Promise.all(
          keys
            .filter(k => k !== cacheKey) // renoves the current cachename from the list
            .map(k => caches.delete(k)) // deletes all other caches
        )
      })
    )

    // Claim clients so the SW starts controlling pages immediately
    /** @type {ServiceWorkerGlobalScope} */
    const sw = /** @type {any} */ (self)
    sw.clients.claim()
  }
}
