var shareImageButton = document.querySelector('#share-image-button');
var createPostArea = document.querySelector('#create-post');
var closeCreatePostModalButton = document.querySelector('#close-create-post-modal-btn');

function openCreatePostModal() {
  createPostArea.style.display = 'block';
  if(deferredEvent){
    console.log("%c[Application]" ,'font-size: 20px;font-weight:bold;color:red',": Showing the custom install banner");
    deferredEvent.prompt();
    
    console.log("%c[Application]" ,'font-size: 20px;font-weight:bold;color:red',": Waiting for the user choice");
    deferredEvent.userChoice.then(choiceResult=>{
      if(choiceResult.outcome === 'accepted'){
        console.log("%c[Application]",'font-size: 20px;font-weight:bold;color:red'," User installed the app");
      }else{
        console.log("%c[Application]",'font-size: 20px;font-weight:bold;color:red'," User did not install the app");
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
