importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');

const SWR_APIS = new workbox.strategies.StaleWhileRevalidate({
    cacheName : 'google-apis'
})

const SWR_MD =  new workbox.strategies.StaleWhileRevalidate({
    cacheName : 'material-design'
})

const SWR_FBS = new workbox.strategies.StaleWhileRevalidate({
    cacheName : 'firebase-storage'
})

workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/,SWR_FBS)
workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/,SWR_APIS)
workbox.routing.registerRoute("https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",SWR_MD)

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);