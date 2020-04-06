const sw_utils = function(){
    
    async function handlePreCaching(){
        const appShellCache = await caches.open(assets.APP_SHELL_CACHE);
        return appShellCache.addAll(assets.STATIC_ASSETS);
    }
    
    async function handleCacheCleanUp(){
        const existingCaches = await caches.keys();
        existingCaches.forEach(async(cache)=>{
            if(cache !== assets.APP_SHELL_CACHE ){
                await caches.delete(cache);
            }
        })
    }
    
    async function handleFetchCWNF(request){
        const cacheResponse = await caches.match(request);
        if(cacheResponse)
            return cacheResponse;
        else{
            const networkResponse = await fetch(request);
            const dynamicCache = await caches.open(assets.DYNAMIC_CACHE);
            // trimCache(DYNAMIC_CACHE,10);
            dynamicCache.put(request.url,networkResponse.clone());
            // showStorageDetails();
            return networkResponse;
        }
    }
    
    async function handleFetchNWCF(request){
        try{
            const networkResponse = await fetch(request);
            const dynamicCache = await caches.open(assets.DYNAMIC_CACHE);
            // trimCache(DYNAMIC_CACHE,10);
            dynamicCache.put(request.url,networkResponse.clone());
            return networkResponse;
        }catch(err){
            const cacheResponse = await caches.match(request);
            if(cacheResponse){
                return cacheResponse;
            }
            else{
                throw new Error('Response could not be retrieved!');
            }
        }
    }
    
    async function handleFetchCacheOnly(request){
        
        const cacheResponse = await caches.match(request);
        if(cacheResponse)
            return cacheResponse;
        else{
            throw new Error('Response not found in the cache!');
        }
    }
    
    async function handleFetchNetworkOnly(request){
        return fetch(request);
    }
    
    async function handleNetworkThenCache(request){
        const networkResponse = await fetch(request);
        const parsedResponse = await networkResponse.clone().json();
        // await iDBUtils.cleanIfNotPresent('posts',parsedResponse);
        const responseList = Object.values(parsedResponse);
        await iDBUtils.clearDBstore('posts');
        iDBUtils.addToDB('posts',responseList);
        return networkResponse;
    }
    
    async function handleFailedFetch(request){
        if(request.headers.get('accept').includes('text/html')){
            const appShellCache = await caches.open(assets.APP_SHELL_CACHE);
            const fallBackPage = await appShellCache.match('/offline.html');
            return fallBackPage;
        }else{
            return null;
        }
    }
    
    async function trimCache(cacheName, numberOfItemsToKeep){
        const cacheToTrim  = await caches.open(cacheName);
        const cachedItems  = await cacheToTrim.keys();
        let currentNumberOfItems = cachedItems.length;
        let i = 0;
        while( currentNumberOfItems > numberOfItemsToKeep ){
            await cacheToTrim.delete(cachedItems[i++]);
            currentNumberOfItems--;
        }
    }
    
    async function showStorageDetails(){
        if( navigator.storage && navigator.storage.estimate ){
            const {
                quota : allocatedStorage,
                usage : usedStorage,
                usageDetails } = await navigator.storage.estimate();
    
            const percentUsed = (usedStorage/allocatedStorage*100);
            console.log(`You've used ${percentUsed} of the available storage.Here are the details: `,usageDetails);
        }
    }
    
    function requestMatcher(request, listOfUrl) {
        const URL2match = new URL(request.url);
        for (let i = 0; i < listOfUrl.length; i++) {
            if( URL2match.pathname === listOfUrl[i] || URL2match.href === listOfUrl[i] ){
                return true;
            }
        }
        return false;
    }
    
    function promiseAny(promiseList) {
        return new Promise((resolve,reject=>{
            /* ensure that all list values are promises */
            promiseList = promiseList.map( promiseValue => Promise.resolve(promiseValue));
    
            /* resolve this new promise when any one of the promises from the list resolves */
            promiseList.forEach( promise => promise.then(resolve) );
    
            /* reject this new promise when all the promises from the list reject */
            promiseList.reduce( (acc,curr) => acc.catch( () => curr  ))
                       .catch( () => reject(Error('All promises failed')))
        }));    
    }
    
    function handleCacheNetworkRace(request) {
        return promiseAny([fetch(request),caches.match(request)]);
    }

    const postdbUrl = "https://us-central1-pwabasics-199ce.cloudfunctions.net/sendPostToServer";

    function sendDataToServer(post){
        return fetch(postdbUrl,{
            method: 'POST',
            headers:{
              'Content-Type' : 'application/json',
              'Accept' : 'application/json'
            },
            body: JSON.stringify(post)
          })
    }

    async function syncPostsToServer(){
        const savedPosts = await iDBUtils.readFromDB('sync'); //read all the posts saved for sync

        savedPosts.forEach(async(post)=>{ //for each of the saved posts
            const serverResponse = await sendDataToServer(post);//send the post to the server
            if(serverResponse.ok){
                await iDBUtils.removeFromStore('sync',post.id);//delete the post from IDB
            }
        })
    }

    function showUserNotification(notificationData){
        return self.registration.showNotification("New post added",{
            body: 'Someone added a new post!',
            icon:'/src/images/notificon.png',
            badge:'/src/images/notifbadge.svg',
            image: notificationData.poster,
            sound:'/src/images/decay.mp3',
            vibrate:[100,100,100,100],
            tag:'subscription-message',
            data:{
                postImage: notificationData.poster
            },
            silent:false,
            renotify:true,
            requireInteraction: true,
            actions: [
                {
                    action:'say-yes',
                    title: 'OH-YEAH!'
                },
                {
                    action:'say-nay',
                    title: 'OH-NO!'
                }
            ],
            timestamp: Date.now()
        
        })

    }

    async function handleNotificationClick(notification){
        const urlToNavigateTo = notification.data.postImage;
        const openClients = await clients.matchAll({
            type: 'window',
            includeUncontrolled: true
        })

        let matchedWindowClient = null;

        for (let i = 0; i < openClients.length; i++) {
            if( openClients[i].url === urlToNavigateTo ){
                matchedWindowClient = openClients[i];
                break;
            }
            
        }
        if(matchedWindowClient){
            await matchedWindowClient.focus();
        }else{
            await clients.openWindow(urlToNavigateTo);
        }
    }

    return {
        handlePreCaching,
        handleCacheCleanUp,
        handleFetchCWNF,
        handleFetchCacheOnly,
        handleNetworkThenCache,
        handleFailedFetch,
        requestMatcher,
        syncPostsToServer,
        showUserNotification,
        handleNotificationClick
    }
}();