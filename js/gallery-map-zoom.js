(function(){
  function makeZoomable(img, container){
    if(!img || img.dataset.zoomReady === "1") return;
    img.dataset.zoomReady = "1";

    let scale = 1, x = 0, y = 0;
    let startScale = 1, startDistance = 0;
    let startX = 0, startY = 0, baseX = 0, baseY = 0;
    let lastTap = 0;

    const clamp = (v,min,max)=>Math.max(min,Math.min(max,v));
    function apply(animate){
      img.style.transition = animate ? "transform .18s ease" : "none";
      if(scale <= 1){
        scale = 1; x = 0; y = 0;
        img.classList.remove("is-zoomed");
      }else{
        img.classList.add("is-zoomed");
        const maxX = (container.clientWidth * (scale - 1)) / 2;
        const maxY = (container.clientHeight * (scale - 1)) / 2;
        x = clamp(x,-maxX,maxX);
        y = clamp(y,-maxY,maxY);
      }
      img.style.transform = `translate3d(${x}px,${y}px,0) scale(${scale})`;
    }
    function reset(){ scale=1;x=0;y=0;apply(true); }

    container.addEventListener("touchstart", function(e){
      if(e.touches.length===2){
        startDistance = Math.hypot(
          e.touches[0].clientX-e.touches[1].clientX,
          e.touches[0].clientY-e.touches[1].clientY
        );
        startScale = scale;
      }else if(e.touches.length===1){
        startX=e.touches[0].clientX;
        startY=e.touches[0].clientY;
        baseX=x;baseY=y;
        const now=Date.now();
        if(now-lastTap<300){
          scale = scale>1 ? 1 : 2.5;
          x=0;y=0;apply(true);
          e.preventDefault();
        }
        lastTap=now;
      }
    },{passive:false});

    container.addEventListener("touchmove", function(e){
      if(e.touches.length===2){
        const d=Math.hypot(
          e.touches[0].clientX-e.touches[1].clientX,
          e.touches[0].clientY-e.touches[1].clientY
        );
        scale=clamp(startScale*(d/startDistance),1,4);
        apply(false);
        e.preventDefault();
      }else if(e.touches.length===1 && scale>1){
        x=baseX+(e.touches[0].clientX-startX);
        y=baseY+(e.touches[0].clientY-startY);
        apply(false);
        e.preventDefault();
      }
    },{passive:false});

    container.addEventListener("touchend", function(){
      if(scale<1.05) reset(); else apply(true);
    });

    container.addEventListener("dblclick", function(e){
      scale = scale>1 ? 1 : 2.5;
      x=0;y=0;apply(true);
      e.preventDefault();
    });

    img._resetZoom = reset;
  }

  function initGalleryZoom(){
    document.querySelectorAll(".gallery-modal__slide").forEach(slide=>{
      const img=slide.querySelector("img");
      if(img) makeZoomable(img,slide);
    });
  }

  const galleryObserver = new MutationObserver(initGalleryZoom);
  galleryObserver.observe(document.body,{childList:true,subtree:true});
  initGalleryZoom();

  /* Remise à zéro lors d'un changement de photo */
  document.addEventListener("click",function(e){
    if(e.target.closest(".gallery-modal__prev,.gallery-modal__next,.gallery-modal__thumb")){
      document.querySelectorAll(".gallery-modal__slide img").forEach(img=>img._resetZoom&&img._resetZoom());
    }
  });

  /* Pop-up de la carte de localisation uniquement */
  const mapImg=document.querySelector("#rawai-lifestyle .map-wrap img");
  const modal=document.getElementById("mapPhotoModal");
  const modalImg=modal && modal.querySelector(".map-photo-modal__img");
  const viewport=modal && modal.querySelector(".map-photo-modal__viewport");
  const closeBtn=modal && modal.querySelector(".map-photo-modal__close");

  if(mapImg && modal && modalImg && viewport){
    modalImg.src=mapImg.currentSrc || mapImg.src;
    makeZoomable(modalImg,viewport);

    mapImg.setAttribute("tabindex","0");
    mapImg.setAttribute("role","button");
    mapImg.setAttribute("aria-label","Agrandir la carte de localisation");

    function openMap(){
      modalImg.src=mapImg.currentSrc || mapImg.src;
      modal.classList.add("open");
      modal.setAttribute("aria-hidden","false");
      document.body.style.overflow="hidden";
    }
    function closeMap(){
      modal.classList.remove("open");
      modal.setAttribute("aria-hidden","true");
      document.body.style.overflow="";
      if(modalImg._resetZoom) modalImg._resetZoom();
    }

    mapImg.addEventListener("click",openMap);
    mapImg.addEventListener("keydown",e=>{
      if(e.key==="Enter" || e.key===" "){e.preventDefault();openMap();}
    });
    closeBtn.addEventListener("click",closeMap);
    modal.addEventListener("click",e=>{if(e.target===modal) closeMap();});
    document.addEventListener("keydown",e=>{if(e.key==="Escape" && modal.classList.contains("open")) closeMap();});
  }
})();
