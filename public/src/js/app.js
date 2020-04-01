const notificationButtons = document.getElementsByClassName('enable-notifications');

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

if( 'Notification' in window && Notification.permission !== 'granted'){

    for (let i = 0; i < notificationButtons.length; i++) {
        notificationButtons[i].style.display = "inline-block";
        notificationButtons[i].addEventListener('click',requestUserPermission);
    }
}

async function requestUserPermission(){
    let permissionValue;
    if( promiseBasedPermission() ){
        permissionValue = await Notification.requestPermission();
    }else{
        Notification.requestPermission( permission =>{
            permissionValue = permission;
        })
    }

    if( permissionValue !== 'granted' ){
        console.log('User has denied permission!')
    }else{
        console.log('User has granted permission!');
        showConfirmationNotification();
    }
}

function promiseBasedPermission() {
    try {
        Notification.requestPermission().then();
    } catch (error) {
        return false;
    }
    return true;
}

async function showConfirmationNotification(){
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    serviceWorkerRegistration.showNotification('Successfully subscribed to notifications!',{
        body: 'Now youll recieve a lot of notificaitons',
        icon:'/src/images/notificon.png',
        badge:'/src/images/notifbadge.svg',
        image:'/src/images/notifimage.jpg',
        sound:'',
        vibrate:[100,100,100,100],
        tag:'subscription-message',
        data:{
            type: 'subscribe'
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
    // new Notification('Successfully subscribed to notifications!');
}