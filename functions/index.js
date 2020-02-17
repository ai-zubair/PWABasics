const functions = require('firebase-functions');
const admin = require('firebase-admin');
const cors = require('cors')({origin:true}) //exports a function to which we pass origin true to allow cors

const serviceAccount = require("./pwa-fb-key.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  databaseURL: "https://pwabasics-199ce.firebaseio.com"
}); //required before using any of the firebase services

exports.sendPostToServer = functions.https.onRequest((request, response) => {
    const {id,title,location,poster} = request.body;
    const postData = {id,title,location,poster}
    return cors(request,response,async()=>{
        try{
            await admin.database().ref('posts').push(postData);
            response.status(201).json({message: 'Post Stored', id})
        }catch(err){
            response.status(500).json({err})
        }
    })
});
