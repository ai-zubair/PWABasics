const functions = require('firebase-functions');
const admin = require('firebase-admin');
const utils = require('./utility');
const cors = require('cors')({origin:true}) //exports a function to which we pass origin true to allow cors
const formidable = require('formidable-serverless');
const fs = require('fs');

const serviceAccount = require("./pwa-fb-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pwabasics-199ce.firebaseio.com"
});  //required before using any of the firebase services

const runTimeOptions = {
    timeoutSeconds : 90
}
exports.sendPostToServer = functions.runWith(runTimeOptions).https.onRequest((request, response) => {
    return cors(request,response,()=>{
        const userPostForm = new formidable.IncomingForm();
        
        userPostForm.parse(request,async(err,fields,files)=>{
            const uploadFile = files.poster;

            /* ensure that the file to upload has been placed at the correct temporary location on the server */
            fs.renameSync(uploadFile.path,`/tmp/${uploadFile.name}`)

            /* upload the file to the cloud storage */
            const fileURL = await utils.uploadFileToCloud(uploadFile);

            if(fileURL){
                /* save the user post to the database and send notification */
                const saveResponse = await utils.saveUserPost({fields,fileURL})
                
                if(saveResponse){
                    response.status(201).json({
                        message : 'POST_SAVED',
                        id : fields.id
                    })
                }else{
                    response.status(500).json({
                        err,
                        errcode: 'SAVE_POST_FAILED'
                    })
                }
            }else{
                /* send back an error response to the client */
                response.status(500).json({
                    errcode: 'FILE_UPLOAD_FAILED'
                })
            }
            
        })
    })
});

exports.sendPushSubscriptionToServer = functions.https.onRequest((request, response) => {
    
    return cors(request,response,async()=>{
        if(request.body && request.body.endpoint && request.body.keys && request.body.keys.p256dh && request.body.keys.auth){
            try{
                await admin.database().ref('pushSubscriptions').push(request.body);
                response.status(201).json({message: 'Push Subscription Created'})
            }catch(err){
                response.status(500).json({
                    id : "Could not save a valid push subscription."
                })
            }
        }else{
            response.status(500).json({
                id : "Invalid push subscription"
            })
        }
    })
});

