var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');
var sharedMomentsArea = document.querySelector('#shared-moments');
var installPromotion = document.getElementById('promotion');

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
  if('serviceWorker' in navigator){
    removeServiceWorkers();
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
const postdbUrl = "https://pwabasics-199ce.firebaseio.com/posts.json"

var cardCreatedFromNetworkResponse = false; 
cacheThenNetworkFetch(postdbUrl);

function cacheThenNetworkFetch(dataURL){
  fetchFromIDB('posts');
  fetchFromNetwork(dataURL);
}

async function fetchFromIDB(dataStore){
  console.log("[Application]: Fetching the card Data from the IDB...");
  const IDBResponse = await iDBUtils.readFromDB(dataStore);
  if( IDBResponse.length > 0 ){
    if (cardCreatedFromNetworkResponse) {
      console.log("IDB response received but card already created using network response.")
      return;
    } else {
      console.log("Creating the card from IDB response",IDBResponse);
      updateUI(IDBResponse);
    }
  }else{
    console.log("IDB returned an empty response...")
  }
}

async function fetchFromNetwork(dataURL){
  console.log("[Application]: Fetching the card Data from the network");
  try{
    const networkResponse = await fetch(dataURL);
    const responseData = await networkResponse.json();
    console.log("[Application]: Creating CARD from network data...")
    cardCreatedFromNetworkResponse = true;
    clearCards(); //instead of appending a new card replaces the older card which was created from the cache
    updateUI(responseData);
  }catch(err){
    console.log("Oops! Network fetch failed!");
  }
}