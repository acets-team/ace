// @ts-check

/// <reference lib="webworker" />

/**
 * Adds offline caching and fetch-handling logic to a Service Worker.
 * @param {Object} options
 * @param {string} options.cacheName - The cache name, ex: "offline-cache-v-1.0.0"
 * @param {string[]} [options.installUrls] - Optional, defaults to an empty string, cache is lazy, meaning we cache what we see, good for performance but that means if offline, someone will only have in cache what they have seen, so if they never went to page x it's not in cache. Use this array to say on install of the service worker (in a seperate thread so not blocking the dom) cache these items
 * @param {Response} [options.page404Response] - Optional, defaults to `defaultPage404Response`, when offline & don't have the requested page in cache provide this
 */
export function swAddOffLineSupport({ cacheName, installUrls = [], page404Response = defaultPage404Response }) {
  /** @type {ServiceWorkerGlobalScope} */
  const sw = /** @type {any} */ (self)


  sw.addEventListener('install', (event) => {
    sw.skipWaiting()
    onInstall(event)
  })

  sw.addEventListener('activate', (event) => {
    event.waitUntil(sw.clients.claim())
    onActivate(event)
  })

  sw.addEventListener('fetch', (event) => {
    onFetch(event)
  })


  /**
   * - Cleans up old caches during service worker activation
   * @param {ExtendableEvent} event The activate event
   */
  function onActivate(event) {
    event.waitUntil(
      (async () => {
        const cacheNames = await caches.keys()

        await Promise.all(
          cacheNames
            .filter((name) => name !== cacheName)
            .map((name) => caches.delete(name))
        )
      })()
    )
  }



  /**
   * - Does nothing if the method is not GET
   * - Does nothing if request not initiated from our origin (ex: gmail magic link) (don't cache when coming from somewhere else b/c sw scope gets confused & errors)
   * @param {FetchEvent} event
   */
  function onFetch(event) {
    if (event.request.method !== 'GET') return

    if (event.request.mode !== 'navigate') event.respondWith(onGETRequest(event.request))
    else {
      const reqUrl = new URL(event.request.url)
      const origin = self.location.origin

      if (reqUrl.origin === origin && event.clientId) {
        event.respondWith(onPageRequest(event.request))
      }
    }
  }



  /**
   * - Used only for request.mode === 'navigate' (HTML docs)
   * - Tries network, falls back to cache
   * - Returns a custom offline HTML page if nothing cached
   * - Tries to match exact request, and if not found, also looks for / or /index.html
   * - Caches if fetched successfully
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async function onPageRequest(request) {
    try {
      const networkResponse = await fetch(request) // try to get from the network.

      if (networkResponse && networkResponse.ok) { // IF successful => cache it and return it
        const cache = await caches.open(cacheName)
        cache.put(request, networkResponse.clone())
      }

      return networkResponse
    } catch (error) {
      const cache = await caches.open(cacheName) // access current cache db

      const cachedResponse = await cache.match(request) // search for page in cache

      if (cachedResponse) { // IF page in cache => give page from cache
        return cachedResponse
      }

      return page404Response
    }
  }



  /**
   * - For all non-HTML GET requests, aka static assets and API data (ex: JS, CSS, fonts, images, JSON)
   * - Tries network, falls back to cache
   * - Returns 404/empty response if nothing cached
   * - Only tries to match the exact request
   * - Caches if fetched successfully
   * @param {Request} request
   * @returns {Promise<Response>}
   */
  async function onGETRequest(request) {
    try {
      // 1. Try to get from the network.
      const networkResponse = await fetch(request)

      // 2. If successful, cache it.
      if (networkResponse && networkResponse.ok) {
        const cache = await caches.open(cacheName)
        cache.put(request, networkResponse.clone())
      }
      return networkResponse
    } catch (error) {
      const cache = await caches.open(cacheName)
      const cachedResponse = await cache.match(request)

      if (cachedResponse) {
        return cachedResponse
      }

      return new Response(null, { status: 404, statusText: 'Not Found in Cache' })
    }
  }



  /**
   * - Automatically caches resources on install
   * - Puting crucial pages you'd love to have offline support here is suggested!
   * @param {ExtendableEvent} event The install event.
   */
  const onInstall = (event) => {
    if (installUrls.length) {
      event.waitUntil(
        (async () => {
          try {
            const cache = await caches.open(cacheName)
            await cache.addAll(installUrls)
          } catch (error) {
            console.error('[SW] onInstall:', error)
          }
        })()
      )
    }
  }
}



export const defaultPage404Response = new Response( // generic offline HTML
  '<!DOCTYPE html><html><head><title>Offline</title><meta name="viewport" content="width=device-width, initial-scale=1"></head><body style="font-family: sans-serif text-align: center padding: 20px"><h1>You are offline</h1><p>This page has not been saved for offline use. Please check your connection and try again.</p></body></html>',
  {
    status: 503,
    statusText: 'Service Unavailable',
    headers: { 'Content-Type': 'text/html' }
  }
)
