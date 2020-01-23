var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
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

function closeCreatePostModal() {
  createPostArea.style.display = 'none';
}

shareImageButton.addEventListener('click', openCreatePostModal);

closeCreatePostModalButton.addEventListener('click', closeCreatePostModal);
