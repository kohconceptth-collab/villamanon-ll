(()=>{
  const fullscreenButton=document.getElementById('exitFullscreenBtn');
  if(!fullscreenButton) return;

  const getFullscreenElement=()=>(
    document.fullscreenElement||
    document.webkitFullscreenElement||
    document.msFullscreenElement
  );

  const updateFullscreenButton=()=>{
    const isFullscreen=Boolean(getFullscreenElement());
    fullscreenButton.setAttribute('aria-pressed',String(isFullscreen));
    fullscreenButton.setAttribute(
      'aria-label',
      isFullscreen ? 'Quitter le plein écran' : 'Activer le plein écran'
    );
    fullscreenButton.classList.toggle('is-fullscreen',isFullscreen);
  };

  const toggleFullscreen=async()=>{
    const root=document.documentElement;
    const isFullscreen=Boolean(getFullscreenElement());

    try{
      if(isFullscreen){
        const exit=
          document.exitFullscreen||
          document.webkitExitFullscreen||
          document.msExitFullscreen;
        if(exit) await exit.call(document);
      }else{
        const request=
          root.requestFullscreen||
          root.webkitRequestFullscreen||
          root.msRequestFullscreen;
        if(request){
          try{
            await request.call(root,{navigationUI:'hide'});
          }catch(error){
            await request.call(root);
          }
        }
      }
    }catch(error){
      console.warn('Le changement de mode plein écran a échoué.',error);
    }finally{
      updateFullscreenButton();
    }
  };

  fullscreenButton.addEventListener('click',event=>{
    event.preventDefault();
    event.stopPropagation();
    toggleFullscreen();
  });

  ['fullscreenchange','webkitfullscreenchange','MSFullscreenChange'].forEach(eventName=>{
    document.addEventListener(eventName,updateFullscreenButton);
  });

  updateFullscreenButton();
})();
