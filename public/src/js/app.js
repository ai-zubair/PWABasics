if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/serviceWorker.js').then((registration)=>{
        // console.log("[Application]: Service Worker Registered!")
    }).catch(err=>{
        console.log("[Application]: Couldn't register service worker.",err);
    })
}

let deferredEvent;
window.addEventListener('beforeinstallprompt',(e)=>{
    // console.log("[Application]: Chrome attempted to show the install banner")
    e.preventDefault();
    deferredEvent = e;
    return false;
})
