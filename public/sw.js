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

workbox.precaching.precacheAndRoute([{"revision":"0a27a4163254fc8fce870c8cc3a3f94f","url":"404.html"},{"revision":"8fbeaf19e8f789d658a0cb120080301d","url":"index.html"},{"revision":"9f8f36782372a5793e9f6ac60030ae12","url":"manifest.json"},{"revision":"94fd8eee23438e75ece86e91e3323104","url":"offline.html"},{"revision":"a1c270833e793cd65bf378211a5c9e03","url":"serviceWorker.js"},{"revision":"756d4a61b41801d11d74d9dcccbc8ac5","url":"src/css/app.css"},{"revision":"7cf79a0f7ac202bd162df9f897ca58f4","url":"src/css/feed.css"},{"revision":"1c6d81b27c9d423bece9869b07a7bd73","url":"src/css/help.css"},{"revision":"8d92a40e1164e674c47c281f577dc037","url":"src/js/app.js"},{"revision":"27d8606aa283f8691004ec8a368277bc","url":"src/js/feed.js"},{"revision":"b251871521d06f4089d02f260eb37022","url":"src/js/idb.js"},{"revision":"713af0c6ce93dbbce2f00bf0a98d0541","url":"src/js/material.min.js"},{"revision":"281239a1de53e72625934e822319c75c","url":"utils/assets.js"},{"revision":"a87c42d97026aba89f54661ad72d480c","url":"utils/iDButils.js"},{"revision":"01a5f72cbf76541b8f76ff22ee3082ad","url":"utils/sw_utils.js"},{"revision":"1718bb0f80c018e314f4c60332063ee8","url":"workbox-97be742a.js"},{"revision":"b4750ebaf6277569ca4492c3769b50b4","url":"workbox-ec4d79a7.js"},{"revision":"31b19bffae4ea13ca0f2178ddb639403","url":"src/images/main-image-lg.jpg"},{"revision":"c6bb733c2f39c60e3c139f814d2d14bb","url":"src/images/main-image-sm.jpg"},{"revision":"5c66d091b0dc200e8e89e56c589821fb","url":"src/images/main-image.jpg"},{"revision":"186fe65fce1b0b70064b3a9c113da924","url":"src/images/notificon.png"},{"revision":"a4ea51d9efbcfccebc48620570a03363","url":"src/images/notifimage.jpg"},{"revision":"0f282d64b0fb306daf12050e812d6a19","url":"src/images/sf-boat.jpg"}]);