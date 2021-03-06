const shareImageButton            = document.querySelector('#share-image-button');
const createPostArea              = document.querySelector('#create-post');
const closeCreatePostModalButton  = document.querySelector('#close-create-post-modal-btn');
const sharedMomentsArea           = document.querySelector('#shared-moments');
const installPromotion            = document.getElementById('promotion');
const postForm                    = document.getElementById("postForm");
const titleInput                  = document.getElementById("title");
const locationInput               = document.getElementById("location");
const videoPlayer                 = document.getElementById("player");
const pictureCanvas               = document.getElementById("canvas");
const captureImageButton          = document.getElementById("capture-btn");
const imagePickerContainer        = document.getElementById("pick-image");
const imagePicker                 = document.getElementById("image-picker");

function showPromotion(){
  if(deferredEvent){
    console.log("[Application]: Showing the custom install banner");
    deferredEvent.prompt();
    
    console.log("[Application]: Waiting for the user choice");
    deferredEvent.userChoice.then(choiceResult=>{
      if(choiceResult.outcome === 'accepted'){
        console.log("[Application]: User installed the app");
      }else{
        console.log("[Application]: User did not install the app");
      }
      deferredEvent = null;
    })
  }
}

let userPicture;

captureImageButton.addEventListener('click',event=>{
  videoPlayer.style.display = 'none';
  pictureCanvas.style.display = 'block';
  captureImageButton.style.display = 'none';
  const pictureCanvasContext = pictureCanvas.getContext('2d');
  flipCanvasHorizontally(pictureCanvas,pictureCanvasContext); //flip the drawing board for mirror effect
  pictureCanvasContext.drawImage(videoPlayer,0,0,pictureCanvas.width,videoPlayer.videoHeight/(videoPlayer.videoWidth/pictureCanvas.width));
  pictureCanvas.toBlob((pictureBlob)=>{
    userPicture = pictureBlob;
    console.log(pictureBlob)
  })
  flipCanvasHorizontally(pictureCanvas,pictureCanvasContext); //reflip to original state for further drawings
  stopUserVideoStream();
})

function stopUserVideoStream(){
  const videoStream = videoPlayer.srcObject;
  const videoTrack = videoStream.getVideoTracks()[0];
  videoTrack.stop();
}

function flipCanvasHorizontally(canvas,canvasDrawingContext){
  canvasDrawingContext.translate(canvas.width,0);
  canvasDrawingContext.scale(-1, 1);
}

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  // if('serviceWorker' in navigator){
  //   removeServiceWorkers();
  // }
  intialiseUserMediaDevices(); //polyfilling for navigator.mediaDevices.getUserMedia()
}

function getUserMediaWrapper(mediaStreamOptions){
  return navigator.mediaDevices.getUserMedia(mediaStreamOptions).catch(err=>null);
}

async function intialiseUserMediaDevices(){ 
  generateGetUserMediaPolyfill();
  const mediaStreamOptions = {
    video : {
      facingMode : 'user'
    }
  }
  const userVideoStream = await getUserMediaWrapper(mediaStreamOptions);

  if(userVideoStream){
    videoPlayer.srcObject = userVideoStream;
    videoPlayer.style.display = 'block';
    captureImageButton.style.display = 'block';
  }else{
    imagePickerContainer.style.display = 'block';
    captureImageButton.style.display = 'none';
  }
}

imagePicker.addEventListener('change',(event)=>{
  userPicture = event.target.files[0];
})

function generateGetUserMediaPolyfill(){
  if(!('mediaDevices' in navigator)){
    navigator.mediaDevices = {};
  }

  if(!('getUserMedia' in navigator.mediaDevices)){
    navigator.mediaDevices.getUserMedia = function(constraints){

      const getUserMedia = navigator.webkitGetUserMedia || navigator.mozGetUserMedia;

      if( !getUserMedia ){
        return Promise.reject(new Error('Get user media method is not implemented'))
      }

      return new Promise((resolve,reject)=>{
        getUserMedia.call(navigator,constraints,resolve,reject);
      })

    }
  }
}

async function removeServiceWorkers(){
  const registeredServiceWorkers = await navigator.serviceWorker.getRegistrations();
  registeredServiceWorkers.forEach(async(serviceWorker)=>{
    await serviceWorker.unregister();
  })
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
  videoPlayer.srcObject?stopUserVideoStream():null;
  videoPlayer.style.display = 'none';
  imagePickerContainer.style.display = 'none';
  pictureCanvas.style.display = 'none';
}
if(!(window.matchMedia('display-mode: standalone').matches)){ /* if PWA is opened in the web browser */
  installPromotion.innerText = "Install PWA";
  installPromotion.addEventListener('click',showPromotion);
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);

function clearCards(){
  while(sharedMomentsArea.hasChildNodes()){
    sharedMomentsArea.removeChild(sharedMomentsArea.lastChild);
  }
}

function createCard(cardData) {

  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = `url(${cardData.poster})`;
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = cardData.title;
  cardTitleTextElement.style.color = 'white';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = `In ${cardData.location}`;
  cardSupportingText.style.textAlign = 'center';
  // var cardSaveButton = document.createElement('button');
  // cardSaveButton.textContent = 'SAVE'
  // cardSaveButton.addEventListener('click',onSaveButtonClick)
  // cardSupportingText.append(cardSaveButton);
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

//cache-on-demand for the feed card
// async function onSaveButtonClick(event){
//   console.log('Save button clicked!');
//   const userRequestedCache = await caches.open('userRequested');
//   userRequestedCache.addAll(['/src/images/sf-boat.jpg','https://httpbin.org/get']);
// }

function updateUI(postData){
  const postDataArray = Object.values(postData);
  for (let i = 0; i < postDataArray.length; i++) {
    createCard(postDataArray[i]);
  }
}
const fetchdbUrl = "https://pwabasics-199ce.firebaseio.com/posts.json";
const postdbUrl = "https://us-central1-pwabasics-199ce.cloudfunctions.net/sendPostToServer"

var cardCreatedFromNetworkResponse = false; 
cacheThenNetworkFetch(fetchdbUrl);

function cacheThenNetworkFetch(dataURL){
  fetchFromIDB('posts');
  fetchFromNetwork(dataURL);
}

async function fetchFromIDB(dataStore){
  // console.log("[Application]: Fetching the card Data from the IDB...");
  const IDBResponse = await iDBUtils.readFromDB(dataStore);
  if( IDBResponse.length > 0 ){
    if (cardCreatedFromNetworkResponse) {
      // console.log("IDB response received but card already created using network response.")
      return;
    } else {
      // console.log("Creating the card from IDB response");
      console.table(IDBResponse);
      updateUI(IDBResponse);
    }
  }else{
    // console.log("IDB returned an empty response...")
  }
}

async function fetchFromNetwork(dataURL){
  // console.log("[Application]: Fetching the card Data from the network");
  try{
    const networkResponse = await fetch(dataURL);
    const responseData = await networkResponse.json();
    // console.log("[Application]: Creating CARD from network data...")
    cardCreatedFromNetworkResponse = true;
    clearCards(); //instead of appending a new card replaces the older card which was created from the cache
    updateUI(responseData);
  }catch(err){
    // console.log("Oops! Network fetch failed!");
  }
}

async function sendDataToServer(postFormData){
  const serverResponse = await fetch(postdbUrl,{
    method: 'POST',
    body: postFormData
  })
  console.log("Sent data to the server!",serverResponse);
}

function createFormData(userPost){
  const userFormData = new FormData();
  for (const dataKey in userPost) {
    if(dataKey === 'poster'){
      userFormData.append(dataKey,userPost[dataKey],`${userPost.id}.png`)
    }else{
      userFormData.append(dataKey,userPost[dataKey]);
    }
  }
  return userFormData;
}

postForm.addEventListener('submit',async(event)=>{
  event.preventDefault();//prevent the default event behaviour

  if( titleInput.value.trim() === '' || locationInput.value.trim() === '' ){ //basic form validaiton
    alert('Please Enter Valid Data!');
    return;
  }

  const postData = {                 //data to send
    id: Date.now(),
    title: titleInput.value,
    location: locationInput.value,
    poster: userPicture
  };

  if( 'serviceWorker' in navigator && 'SyncManager' in window ){ //backward compatability check
    
    await iDBUtils.addToDB('sync',[postData]); //storing the task data in IDB

    const serviceWorkerRegistration = await navigator.serviceWorker.ready; //registering a sync task
    await serviceWorkerRegistration.sync.register('new-post-sync'); //registering a sync task
    
    //the following code uses MDL to show user notification and is not neccassary for BG-Sync but just a UX feature
    const snackbarContainer = document.getElementById('confirmation-toast');
    const notificationData = { message: 'Your post has been saved for syncing!' };
    snackbarContainer.MaterialSnackbar.showSnackbar(notificationData);
    //end of notification code

  }else{ //add a fallback for the older browsers and simply send the data to the server
    const userPostForm = createFormData(postData);
    sendDataToServer(userPostForm).catch(err=>{console.log('sending post data to the server failed!')});
  }
  closeCreatePostModal();
})