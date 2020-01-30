const APP_SHELL_CACHE = 'appShell-v3'
const DYNAMIC_CACHE = 'dynamic-v3'

self.addEventListener('install',(event)=>{
    console.log("[Service Worker]: Installing Service Worker...");

    console.log("[Service Worker]: Pre-Caching the App Shell...")
    event.waitUntil( handlePreCaching() );/* remain in the installation phase until the pre-caching is done */
})

self.addEventListener('activate',(event)=>{
    console.log("[Service Worker]: Activating Service Worker...");

    console.log("[Service Worker]: Performing Cache cleanup...")
    event.waitUntil(handleCacheCleanUp());/* remain in the activation phase until the cache-cleanup is done */
})

self.addEventListener('fetch',(event)=>{
    
    event.respondWith(
        handleFetch(event.request).catch(err=>
            console.log("[Service Worker]: An error occurred in Fetch ",err)
        )
    );
    
})

async function handlePreCaching(){
    const appShellCache = await caches.open(APP_SHELL_CACHE);
    appShellCache.addAll([
        '/',
        '/index.html',
        '/src/js/app.js',
        '/src/js/feed.js',
        '/src/js/material.min.js',
        '/src/css/app.css',
        '/src/css/feed.css',
        '/src/images/main-image.jpg',
        'https://fonts.googleapis.com/css?family=Roboto:400,700',
        'https://fonts.googleapis.com/icon?family=Material+Icons',
        'https://cdnjs.cloudflare.com/ajax/libs/material-design-lite/1.3.0/material.indigo-pink.min.css'
    ]);
}

async function handleCacheCleanUp(){
    const existingCaches = await caches.keys();
    existingCaches.forEach(async(cache)=>{
        if(cache !== APP_SHELL_CACHE && cache !== DYNAMIC_CACHE){
            await caches.delete(cache);
        }
    })
}

async function handleFetch(request){
    const cacheResponse = await caches.match(request);
    if(cacheResponse)
        return cacheResponse;
    else{
        const networkResponse = await fetch(request);
        const dynamicCache = await caches.open(DYNAMIC_CACHE);
        dynamicCache.put(request.url,networkResponse.clone());
        return networkResponse;
    }
}