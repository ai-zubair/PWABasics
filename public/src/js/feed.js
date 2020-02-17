var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var installPromotion = document.getElementById('promotion');
var postForm = document.getElementById("postForm");
var titleInput = document.getElementById("title");
var locationInput = document.getElementById("location");

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

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  // if('serviceWorker' in navigator){
  //   removeServiceWorkers();
  // }
}

async function removeServiceWorkers(){
  const registeredServiceWorkers = await navigator.serviceWorker.getRegistrations();
  registeredServiceWorkers.forEach(async(serviceWorker)=>{
    await serviceWorker.unregister();
  })
}

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
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

async function sendDataToServer(data){
  const serverResponse = await fetch(postdbUrl,{
    method: 'POST',
    headers:{
      'Content-Type' : 'application/json',
      'Accept' : 'application/json'
    },
    body: JSON.stringify(data)
  })
  console.log("Sent data to the server!",serverResponse);
}

postForm.addEventListener('submit',async(event)=>{
  event.preventDefault();//prevent the default event behaviour

  if( titleInput.value.trim() === '' || locationInput.value.trim() === '' ){ //basic form validaiton
    alert('Please Enter Valid Data!');
    return;
  }

  const postData = { //data to send
    id: Date.now(),
    title: titleInput.value,
    location: locationInput.value,
    poster:'https://firebasestorage.googleapis.com/v0/b/pwabasics-199ce.appspot.com/o/testimg.jpeg?alt=media&token=21e78c60-f38e-4474-b19e-d013d2d54f2e'
  }

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
    sendDataToServer(postData).catch(err=>{console.log('sending post data to the server failed!')});
  }
  closeCreatePostModal();
})