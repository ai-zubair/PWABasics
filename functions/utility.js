const admin = require('firebase-admin');
const webpush = require('web-push');
const vapidKeys = require('./config');

function fetchPushSubscriptions(){
    return admin.database().ref('pushSubscriptions').once("value");
}

async function removePushSubscription(subscriptionKey){
    await admin.database().ref(`/pushSubscriptions/${subscriptionKey}`).remove();
}

function sendNotification(subscription, data){
    return webpush.sendNotification(subscription.val(),JSON.stringify(data)).catch(err=>{
        if (err.statusCode === 404 || err.statusCode === 410) {
            console.log('Subscription has expired or is no longer valid: ', err);
            removePushSubscription(subscription.key);
          }else{
            throw err;
          }
    })
}

async function asyncWrapper(subscription,notificationPayload){
    const pushServiceResponse = await sendNotification(subscription,notificationPayload);
    console.log(pushServiceResponse);
}
async function sendPushNotification( notificationPayload ){
    webpush.setVapidDetails('mailto:zubair.bashirzubair@gmail.com',vapidKeys.publicKey,vapidKeys.privateKey); //IDENTIFY THE APPLICATION SERVER
    const pushSubscriptions = await fetchPushSubscriptions(); //fetch PS datasnapshot
    pushSubscriptions.forEach( (subscription)=>{
        asyncWrapper(subscription,notificationPayload);
    });
}

module.exports = {
    sendPushNotification
}