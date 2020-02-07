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

function createCard() {
  console.log("someone called me!");
  var cardWrapper = document.createElement('div');
  cardWrapper.className = 'shared-moment-card mdl-card mdl-shadow--2dp';
  var cardTitle = document.createElement('div');
  cardTitle.className = 'mdl-card__title';
  cardTitle.style.backgroundImage = 'url("/src/images/sf-boat.jpg")';
  cardTitle.style.backgroundSize = 'cover';
  cardTitle.style.height = '180px';
  cardWrapper.appendChild(cardTitle);
  var cardTitleTextElement = document.createElement('h2');
  cardTitleTextElement.className = 'mdl-card__title-text';
  cardTitleTextElement.textContent = 'San Francisco Trip';
  cardTitleTextElement.style.color = 'white';
  cardTitle.appendChild(cardTitleTextElement);
  var cardSupportingText = document.createElement('div');
  cardSupportingText.className = 'mdl-card__supporting-text';
  cardSupportingText.textContent = 'In San Francisco';
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

const dataURL = 'https://httpbin.org/get';
var cardCreatedFromNetworkResponse = false; 
cacheThenNetworkFetch(dataURL);

function cacheThenNetworkFetch(dataURL){
  fetchFromCache(dataURL);
  fetchFromNetwork(dataURL);
}

async function fetchFromCache(dataURL){
  console.log("[Application]: Fetching the card Data from the cache...");
  const cacheResponse = await caches.match(dataURL)
  if(cacheResponse){
    const responseData = await cacheResponse.json();
    if (cardCreatedFromNetworkResponse) {
      console.log("Cache response received but card already created using network response.")
      return;
    } else {
      console.log("Creating the card from cache response");
      createCard(responseData);
    }
  }else{
    console.log("[Application]: Fetching from the cache failed...")
  }
}

async function fetchFromNetwork(dataURL){
  console.log("[Application]: Fetching the card Data from the network");
  try{
    const networkResponse = await fetch(dataURL);
    const responseData = networkResponse.json();
    console.log("[Application]: Creating CARD from network data...")
    cardCreatedFromNetworkResponse = true;
    clearCards(); //instead of appending a new card replaces the older card which was created from the cache
    createCard(responseData);
  }catch(err){
    console.log("Oops! Network fetch failed!");
  }
}