(function(){
  'use strict';
  function sendEvent(action,label){
    try{
      if(window.dataLayer && typeof window.dataLayer.push==='function'){
        window.dataLayer.push({event:'cta_click',category:'CTA',action:action,label:label});
      }
      if(window.gtag && typeof window.gtag==='function'){
        window.gtag('event',action,{event_category:'CTA',event_label:label});
      }
    }catch(e){console.warn('CTA analytics error',e)}
    // graceful fallback for debugging
    if(!window.dataLayer && !window.gtag) console.log('CTA event',action,label);
  }
  function getLabel(el){
    if(!el) return '';
    if(el.dataset && el.dataset.ctaLabel) return el.dataset.ctaLabel;
    if(el.getAttribute('aria-label')) return el.getAttribute('aria-label');
    if(el.href) return el.href.replace(/^https?:\/\//,'');
    return (el.textContent||'').trim().slice(0,60);
  }
  document.addEventListener('click',function(e){
    var el = e.target.closest && e.target.closest('.btn--primary, .btn--secondary, .btn--outline, .cta-strip a');
    if(!el) return;
    var label = getLabel(el);
    var action = 'click_'+(
      el.classList.contains('btn--primary') ? 'book_now' :
      el.classList.contains('btn--secondary') ? 'secondary' : 'contact'
    );
    sendEvent(action,label);
  },false);
})();