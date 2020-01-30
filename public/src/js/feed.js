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

function createCard() {
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
  cardWrapper.appendChild(cardSupportingText);
  componentHandler.upgradeElement(cardWrapper);
  sharedMomentsArea.appendChild(cardWrapper);
}

fetch('https://httpbin.org/get') //fetching arbitrary data
  .then(function(res) {
    return res.json();
  })
  .then(function(data) { //creating a hard coded card
    createCard();
  });
