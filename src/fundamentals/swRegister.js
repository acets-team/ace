// @ts-check


(async () => {
  if (!('serviceWorker' in navigator)) document.body.classList.add('sw-ready') // no SW support so just show page
  else await navigator.serviceWorker.register('/sw.js', { type: 'module' }) // requesting a sw be registered, installed & activated
})()
