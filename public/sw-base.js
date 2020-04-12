importScripts('https://storage.googleapis.com/workbox-cdn/releases/5.1.2/workbox-sw.js');
importScripts('/src/js/idb.js');
importScripts('/utils/assets.js'); 
importScripts('/utils/iDButils.js');
importScripts('/utils/sw_utils.js');

workbox.precaching.precacheAndRoute(self.__WB_MANIFEST);

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

const fallBackRoute = new workbox.routing.Route((matchContext)=>{
    if(matchContext.request.headers.get('accept').includes('text/html')){
        return true;
    }
},async(handleContext)=>{
    try{
        debugger;
        const response = await sw_utils.handleFetchCWNF(handleContext.request);
        return response;
    }catch(err){
        return caches.match(workbox.precaching.getCacheKeyForURL('/404.html'));
        
    }
})

workbox.routing.registerRoute(/.*(?:firebasestorage\.googleapis)\.com.*$/,SWR_FBS)
workbox.routing.registerRoute(/.*(?:googleapis|gstatic)\.com.*$/,SWR_APIS)
workbox.routing.registerRoute("https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css",SWR_MD)
workbox.routing.registerRoute("https://pwabasics-199ce.firebaseio.com/posts.json",(context)=>{sw_utils.handleCacheThenNetwork(context.request)});
workbox.routing.registerRoute(fallBackRoute);