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
        // showConfirmationNotification();
        configurePushSubscription();
    }
}

async function configurePushSubscription(){
    const serviceWorkerRegistration = await navigator.serviceWorker.ready;
    const pushManager = serviceWorkerRegistration.pushManager
    const existingSubscription = await pushManager.getSubscription();

    if( !existingSubscription ){
        const publicKeyString = "BPs_NgcqW_2q07__tmW5UFfzlNF-VQOPd7xM9GrSQ57vUsR2xsvdzJq6dtUTwGFAk10ux2egXO478NVASMRKByk";
        const vapidPublicKey = urlBase64ToUint8Array(publicKeyString);
        const pushSubscription = await pushManager.subscribe({
            userVisibleOnly : true,
            applicationServerKey : vapidPublicKey
        })
        const serverResponse = await sendPushSubscriptionToServer(pushSubscription);
        if(serverResponse.ok){
            console.log('Push Subscription Saved sucessfully',await serverResponse.json());
        }else{
            console.log('PS save failed',await serverResponse.json())
        }
    }
}

function sendPushSubscriptionToServer(pushSubscription){
    const pushSubURL = "http://localhost:5000/sendPushSubscriptionToServer"
    return fetch(pushSubURL,{
        method : 'POST',
        headers : {
            "Content-Type"  : "application/json",
            "Accept" : "application/json"
        },
        body : JSON.stringify(pushSubscription)
    })
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

function urlBase64ToUint8Array(base64String) {
    var padding = '='.repeat((4 - base64String.length % 4) % 4);
    var base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');
  
    var rawData = window.atob(base64);
    var outputArray = new Uint8Array(rawData.length);
  
    for (var i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }