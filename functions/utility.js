const admin = require('firebase-admin');
const webpush = require('web-push');
const vapidKeys = require('./config');
// const {Storage} = require('@google-cloud/storage');
// const storageConfiguration = {
//     projectId: 'pwabasics-199ce',
//     keyFilename: 'pwa-fb-key.json'
// }
// const projectStorage = new Storage(storageConfiguration);
const {uuid} = require('uuidv4');

async function uploadFileToCloud(uploadFile){
    /* get the default firebase cloud storage bucket */
    const defaultBucket = admin.storage().bucket();

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

async function saveUserPost(postData){
    const userPost = {
        id: postData.fields.id,
        title: postData.fields.title,
        location: postData.fields.location,
        poster: postData.fileURL
    }
    const dbResponse = await storeToDB(userPost);

    if(dbResponse){
       try{
            await sendPushNotification(userPost);
            return true;  
       }catch(err){
            return null;
       } 
    }
}
function fetchPushSubscriptions(){
    return admin.database().ref('pushSubscriptions').once("value");
}

async function removePushSubscription(subscriptionKey){
    await admin.database().ref(`/pushSubscriptions/${subscriptionKey}`).remove();
}

function storeToDB(data){
    return admin.database().ref('posts').push(data).catch(err=>null);
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
    uploadFileToCloud,
    saveUserPost
}