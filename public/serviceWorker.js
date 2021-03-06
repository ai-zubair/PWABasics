importScripts('/src/js/idb.js');
importScripts('/utils/assets.js'); 
importScripts('/utils/iDButils.js');
importScripts('/utils/sw_utils.js');

self.addEventListener('install',(event)=>{

    event.waitUntil( sw_utils.handlePreCaching() );/* remain in the installation phase until the pre-caching is done */

})

self.addEventListener('activate',(event)=>{
    
    event.waitUntil(sw_utils.handleCacheCleanUp());/* remain in the activation phase until the cache-cleanup is done */
})

self.addEventListener('fetch',(event)=>{

    const assetRequest = event.request;

    if(sw_utils.requestMatcher(assetRequest,assets.NTC_ASSETS)){
        event.respondWith(
            sw_utils.handleCacheThenNetwork(assetRequest).catch(()=> sw_utils.handleFailedFetch(assetRequest))
        );
    }else if(sw_utils.requestMatcher(assetRequest,assets.STATIC_ASSETS)){
        event.respondWith(
            sw_utils.handleFetchCacheOnly(assetRequest).catch(()=> sw_utils.handleFailedFetch(assetRequest))
        );
    }else{
        event.respondWith(
            sw_utils.handleFetchCWNF(assetRequest).catch(()=> sw_utils.handleFailedFetch(assetRequest))
        );
    }
    
})

self.addEventListener('sync',(event)=>{
    
    if( event.tag === 'new-post-sync' ){
        event.waitUntil(sw_utils.syncPostsToServer());
    }
})

self.addEventListener('push',(event)=>{
    
    const notificationData = event.data.json();
    event.waitUntil(
        sw_utils.showUserNotification(notificationData)
    );
})

self.addEventListener('notificationclick',(event)=>{
    
    event.waitUntil(
        sw_utils.handleNotificationClick(event.notification)
    )
    event.notification.close();
})

self.addEventListener('notificationclose',event=>{
    console.log('notification closed',event);
})