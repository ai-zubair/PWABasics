importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
importScripts('/src/js/idb.js');
importScripts('/utils/assets.js'); 
importScripts('/utils/iDButils.js');
importScripts('/utils/sw_utils.js');

const cacheExpiration = new workbox.expiration.ExpirationPlugin({
    maxAgeSeconds: 60*60*24*5,
    maxEntries: 10,
    purgeOnQuotaError: true
})

const SWR_APIS = new workbox.strategies.StaleWhileRevalidate({
    cacheName : 'google-apis',
    plugins: [
        cacheExpiration
    ]
})

const SWR_MD =  new workbox.strategies.StaleWhileRevalidate({
    cacheName : 'material-design',
    plugins: [
        cacheExpiration
    ]
})

const SWR_FBS = new workbox.strategies.StaleWhileRevalidate({
    cacheName : 'firebase-storage',
    plugins: [
        cacheExpiration
    ]
}) 

workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/,SWR_FBS)
workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/,SWR_APIS)
workbox.routing.registerRoute("https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",SWR_MD)
workbox.routing.registerRoute("https://pwabasics-199ce.firebaseio.com/posts.json",(context)=>{sw_utils.handleCacheThenNetwork(context.request)});

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);