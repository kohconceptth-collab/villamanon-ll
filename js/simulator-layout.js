(function(){
  const section = document.querySelector('#investment');
  if(!section) return;

  const toggle = section.querySelector(
    '[aria-expanded], .invest-toggle, .simulator-toggle, .roi-toggle, button'
  );

  const candidates = [
    '.invest-panel',
    '.simulator-content',
    '.roi-content',
    '.collapse-content',
    '[data-collapse-content]'
  ];

  let panel = null;
  for(const selector of candidates){
    panel = section.querySelector(selector);
    if(panel) break;
  }

  if(!toggle || !panel) return;

  function sync(){
    const expanded = toggle.getAttribute('aria-expanded') === 'true' ||
                     panel.hidden === false && (
                       panel.classList.contains('open') ||
                       panel.classList.contains('active') ||
                       panel.classList.contains('is-open')
                     );

    if(expanded){
      section.classList.add('is-open');
      panel.style.removeProperty('display');
      panel.style.removeProperty('height');
      panel.style.removeProperty('min-height');
      panel.style.removeProperty('max-height');
      panel.style.removeProperty('padding-top');
      panel.style.removeProperty('padding-bottom');
      panel.style.removeProperty('margin');
    }else{
      section.classList.remove('is-open');
      panel.style.minHeight = '0';
      panel.style.maxHeight = '0';
      panel.style.height = '0';
      panel.style.paddingTop = '0';
      panel.style.paddingBottom = '0';
      panel.style.marginTop = '0';
      panel.style.marginBottom = '0';
      panel.style.overflow = 'hidden';
    }
  }

  toggle.addEventListener('click',()=>requestAnimationFrame(sync));
  new MutationObserver(sync).observe(panel,{
    attributes:true,
    attributeFilter:['class','hidden','style','aria-hidden']
  });
  new MutationObserver(sync).observe(toggle,{
    attributes:true,
    attributeFilter:['class','aria-expanded']
  });

  sync();
})();
