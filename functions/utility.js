const admin = require('firebase-admin');
const webpush = require('web-push');
const vapidKeys = require('./config');
const {Storage} = require('@google-cloud/storage');
const projectStorage = new Storage();
const {uuid} = require('uuidv4');

async function uploadFileToCloud(uploadFile){
    /* get the default firebase cloud storage bucket */
    const defaultBucket = projectStorage.bucket('pwabasics-199ce.appspot.com');

    /* obtain a public download token */
    const publicDownloadToken = uuid();

    /* upload configurations */
    const uploadFileOptions = {
        uploadType:'media',
        metadata:{
            metadata:{
                contentType:uploadFile.type,
                firebaseStorageDownloadTokens:publicDownloadToken
            }
        }
    }

    const fileURL = `https://firebasestorage.googleapis.com/v0/b/${defaultBucket.name}/o/${uploadFile.name}?alt=media&token=${publicDownloadToken}`;
    /* upload the file */
    const uploadResponse = await defaultBucket.upload('/tmp/'+uploadFile.name,uploadFileOptions);

    if(uploadResponse){
        return fileURL
    }
    
}


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
    sendPushNotification,
    uploadFileToCloud
}