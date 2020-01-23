if (navigator.serviceWorker) {
    navigator.serviceWorker.register('/serviceWorker.js').then((registration)=>{
        console.log("%c[Application]" ,'font-size: 20px;font-weight:bold;color:red',': Service Worker Registered!',registration)
    })
}
let deferredEvent;
window.addEventListener('beforeinstallprompt',(e)=>{
    console.log("%c[Application]" ,'font-size: 20px;font-weight:bold;color:red',": Chrome attempted to show the install banner")
    e.preventDefault();
    deferredEvent = e;
    return false;
})