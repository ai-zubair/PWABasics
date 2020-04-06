const admin = require('firebase-admin');
const webpush = require('web-push');
const vapidKeys = require('./config');

function fetchPushSubscriptions(){
    return admin.database().ref('pushSubscriptions').once("value");
}

function sendNotification(subscription, data){
    return webpush.sendNotification(subscription,JSON.stringify(data)).catch(err=>{
        if (err.statusCode === 404 || err.statusCode === 410) {
            console.log('Subscription has expired or is no longer valid: ', err);
            // return deleteSubscriptionFromDatabase(subscription._id);
          }else{
            throw err;
          }
    })
}

async function asyncWrapper(subscription,notificationPayload){
    const pushServiceResponse = await sendNotification(subscription.val(),notificationPayload);
    console.log(pushServiceResponse);
}
async function sendPushNotification( notificationPayload ){
    webpush.setVapidDetails('mailto:zubair.bashirzubair@gmail.com',vapidKeys.publicKey,vapidKeys.privateKey); //IDENTIFY THE APPLICATION SERVER
    const pushSubscriptions = await fetchPushSubscriptions(); //fetch PS datasnapshot
    console.log(pushSubscriptions.val());
    pushSubscriptions.forEach( (subscription)=>{
        asyncWrapper(subscription,notificationPayload);
    });
}

module.exports = {
    sendPushNotification
}