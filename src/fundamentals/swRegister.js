// @ts-check


(async () => {
  if (!('serviceWorker' in navigator)) document.body.classList.add('sw-ready') // no SW support so just show page
  else {
    const swIsActive = Boolean(navigator.serviceWorker.controller) // points to the Service Worker that is currently controlling the page

    const showPage = () => { // if we just add the class immediately the browser may batch the style changes together & skip the animation
      requestAnimationFrame(() => document.body.classList.add('sw-ready'))
    }

    if (swIsActive) showPage()
    else document.body.classList.remove('sw-ready') // hide till reload finishes

    await navigator.serviceWorker.register('/sw.js', { type: 'module' }) // requesting a sw be registered, installed & activated
    await navigator.serviceWorker.ready // resolves when the service worker is active and ready to handle fetches

    if (swIsActive) showPage()
    else window.location.reload() // first install complete b/c the sw will only be not active once (here)
  }
})()
