// @ts-check


(async () => {
  if (!('serviceWorker' in navigator)) document.body.classList.add('sw-ready') // no SW support so just show page
  else {
    const swIsActive = Boolean(navigator.serviceWorker.controller) // points to the Service Worker that is currently controlling the page

    await navigator.serviceWorker.register('/sw.js', { type: 'module' }) // requesting a sw be registered, installed & activated

    if (!swIsActive) {
      await navigator.serviceWorker.ready // resolves when the service worker is active and ready to handle fetches
      window.location.reload() // a service worker is not really operating til there is a page load afte activation, so we do this immediately
    }
  }
})()
