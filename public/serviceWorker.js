// oninstall = (event) => {
//     console.log("[Service Worker] : Installing Service Worker...",event);
// }

// onactivate = (event) => {
//     console.log("[Service Worker] : Activated Service Worker...",event);
// }

self.addEventListener('install',(event)=>{
    console.log("%c[Service Worker]" ,'font-size: 20px;font-weight:bold;color:blue',": Installing Service Worker...",event);
})

self.addEventListener('activate',(event)=>{
    console.log("%c[Service Worker]" ,'font-size: 20px;font-weight:bold;color:blue',": Activating Service Worker...",event);
})

self.addEventListener('fetch',(event)=>{
    console.log("%c[Service Worker]" ,'font-size: 20px;font-weight:bold;color:blue',": Fetching assest...",event);
    event.respondWith(fetch(event.request));
})