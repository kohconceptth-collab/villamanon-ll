(()=>{
  const reduceMotion=window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* Apparitions des sections et de leurs principaux composants */
  const revealTargets=[];
  document.querySelectorAll('main .section, section.section').forEach((section)=>{
    const candidates=[
      ...section.querySelectorAll(
        ':scope > .wrap > .number-title,'+
        ':scope > .wrap > .plan-heading,'+
        ':scope > .wrap > .plan-switcher,'+
        ':scope > .wrap > .plan-stage,'+
        ':scope > .wrap > .rawai-combined > *,'+
        ':scope > .wrap > .grid-3 > *,'+
        ':scope > .wrap > .sim-grid > *,'+
        ':scope > .wrap > .contact-grid > *,'+
        ':scope > .wrap > .details-grid > *'
      )
    ];
    const unique=candidates.length?candidates:[...section.querySelectorAll(':scope > .wrap > *')];
    unique.slice(0,12).forEach((element,index)=>{
      if(element.classList.contains('premium-reveal')) return;
      element.classList.add('premium-reveal');
      element.style.setProperty('--premium-delay',`${Math.min(index,7)*70}ms`);
      if(index%3===1 && window.innerWidth>900) element.dataset.premiumDirection='left';
      if(index%3===2 && window.innerWidth>900) element.dataset.premiumDirection='right';
      revealTargets.push(element);
    });
  });

  document.documentElement.classList.add('premium-motion-ready');

  if(reduceMotion || !('IntersectionObserver' in window)){
    revealTargets.forEach(el=>el.classList.add('is-visible'));
  }else{
    const observer=new IntersectionObserver((entries)=>{
      entries.forEach(entry=>{
        if(entry.isIntersecting){
          entry.target.classList.add('is-visible');
          observer.unobserve(entry.target);
        }
      });
    },{threshold:.12,rootMargin:'0px 0px -7% 0px'});
    revealTargets.forEach(el=>observer.observe(el));
  }

  /* Galerie : ambiance colorée, compteur et mise en avant fluide */
  const gallery=document.querySelector('#bedroomGallery');
  const track=document.querySelector('#galleryTrack');
  const current=document.querySelector('#galleryCurrent');

  function syncPremiumGallery(){
    if(!gallery || !track || !current) return;
    const slides=[...track.querySelectorAll('.gallery-modal__slide')];
    const index=Math.max(0,Math.min(slides.length-1,(parseInt(current.textContent,10)||1)-1));
    slides.forEach((slide,i)=>slide.classList.toggle('premium-active',i===index));
    const image=slides[index]?.querySelector('img');
    if(image?.src){
      gallery.style.setProperty('--gallery-ambient-image',`url("${image.src}")`);
    }
  }

  if(gallery && current){
    new MutationObserver(syncPremiumGallery).observe(current,{childList:true,characterData:true,subtree:true});
    gallery.addEventListener('transitionend',syncPremiumGallery);
    document.querySelectorAll('#galleryPrev,#galleryNext,.gallery-modal__dot').forEach(button=>{
      button.addEventListener('click',()=>requestAnimationFrame(syncPremiumGallery));
    });
    syncPremiumGallery();
  }

  /* Plan interactif : survol/focus = aperçu de la pièce et photo associée */
  const stage=document.querySelector('#planStage');
  const hotspots=[...document.querySelectorAll('#planHotspots .hotspot')];
  const galleryImages=[...document.querySelectorAll('#galleryTrack .gallery-modal__slide img')]
    .map(img=>img.currentSrc||img.src)
    .filter(Boolean);

  if(stage && hotspots.length && galleryImages.length){
    const preview=document.createElement('aside');
    preview.className='plan-room-preview';
    preview.setAttribute('aria-live','polite');
    preview.innerHTML=
      '<img alt="" decoding="async">'+
      '<div class="plan-room-preview__body">'+
        '<strong class="plan-room-preview__title"></strong>'+
        '<span class="plan-room-preview__hint">Cliquez pour voir les photos</span>'+
      '</div>';
    // La vignette est rattachée à la page afin que sa position fixe soit
    // calculée par rapport à l'écran, et non par rapport au plan.
    document.body.appendChild(preview);

    const previewImage=preview.querySelector('img');
    const previewTitle=preview.querySelector('.plan-room-preview__title');

    const zoneIndexes={
      'bedroom-1':15,
      'bedroom-2':19,
      'bedroom-3':23,
      'bedroom-4':25,
      'living-tv':7,
      'kitchen':9,
      'pool':5,
      'sala':6
    };

    let hideTimer;

    function showRoom(hotspot){
      if(!window.matchMedia('(min-width:1025px)').matches) return;
      clearTimeout(hideTimer);
      const index=zoneIndexes[hotspot.dataset.zone] ?? 0;
      const source=galleryImages[index]||galleryImages[0];
      previewImage.src=source;
      previewImage.alt=hotspot.dataset.title||'Aperçu de la pièce';
      previewTitle.textContent=hotspot.dataset.title||'Villa Manon';
      preview.classList.add('show');
      hotspots.forEach(item=>item.classList.toggle('premium-hotspot-active',item===hotspot));

      const left=parseFloat(hotspot.style.left)||50;
      preview.style.left=left<45?'auto':'18px';
      preview.style.right=left<45?'18px':'auto';
    }

    function hideRoom(){
      hideTimer=setTimeout(()=>{
        preview.classList.remove('show');
        hotspots.forEach(item=>item.classList.remove('premium-hotspot-active'));
      },120);
    }

    hotspots.forEach(hotspot=>{
      hotspot.addEventListener('pointerenter',()=>showRoom(hotspot));
      hotspot.addEventListener('pointerleave',hideRoom);
      hotspot.addEventListener('focus',()=>showRoom(hotspot));
      hotspot.addEventListener('blur',hideRoom);
    });

    stage.addEventListener('pointerleave',hideRoom);
  }
})();
