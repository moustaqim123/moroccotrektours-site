(function(){
  const MANIFEST_PATH = '/cms-manifest.json';
  let manifest = null;

  function resolveKey(obj, key) {
    return key.split('.').reduce((o,k)=> (o && o[k] !== undefined) ? o[k] : undefined, obj);
  }

  function setBackground(el, url){
    try{
      el.style.backgroundImage = `url(${url})`;
      // Verify applied value
      const cs = window.getComputedStyle(el);
      const applied = cs && cs.backgroundImage ? cs.backgroundImage : '';
      const needle = typeof url === 'string' ? url.split('/').pop() : url;
      if(!applied || applied === 'none' || (needle && applied.indexOf(needle) === -1)){
        console.error('cms-sync: background replacement failed for', el, 'expected', url, 'applied', applied);
        try{ el.setAttribute('data-cms-failed','true'); }catch(e){}
      } else {
        el.removeAttribute('data-cms-failed');
      }
    }catch(e){ el.style.backgroundImage = ''; console.warn('cms-sync: setBackground error', e); }
  }

  async function loadManifest(){
    try{
      const res = await fetch(MANIFEST_PATH, {cache: 'no-store'});
      if(!res.ok) throw new Error('Manifest fetch failed: ' + res.status);
      manifest = await res.json();
      applyManifest();
    }catch(err){
      console.warn('cms-sync: could not load manifest', err);
    }
  }

  function applyManifest(){
    if(!manifest) return;

    // data-cms-image: supports <img> and background on other elements
    document.querySelectorAll('[data-cms-image]').forEach(el=>{
      const key = el.getAttribute('data-cms-image');
      const val = resolveKey(manifest, key);
      if(val){
        if(el.tagName === 'IMG'){
          if(el.getAttribute('src') !== val){ el.src = val; console.info('cms-sync: updated', key, '->', val); }
        }else{
          setBackground(el, val);
        }
      }else{
        // missing image key: remove visual and warn
        if(el.tagName === 'IMG'){
          try{ el.removeAttribute('src'); }catch(e){}
        }else{
          try{ el.style.backgroundImage = ''; }catch(e){}
        }
        console.warn('cms-sync: missing image manifest key', key, el);
        try{ el.setAttribute('data-cms-missing','true'); }catch(e){}
      }
    });

    // data-cms-bg: force background-image from manifest key
    document.querySelectorAll('[data-cms-bg]').forEach(el=>{
      const key = el.getAttribute('data-cms-bg');
      const val = resolveKey(manifest, key);
      if(val){
        setBackground(el, val);
      }else{
        // Missing or empty key: render nothing and warn
        try{ el.style.backgroundImage = ''; }catch(e){}
        console.warn('cms-sync: missing background manifest key', key, el);
        try{ el.setAttribute('data-cms-missing','true'); }catch(e){}
      }
    });

    // Replace legacy logo references (best-effort)
    document.querySelectorAll('img').forEach(img=>{
      if(img.getAttribute('data-cms-image')) return;
      const srcAttr = img.getAttribute('src') || '';
      if(srcAttr.indexOf('images/logo.png') !== -1){
        const newLogo = resolveKey(manifest, 'site.logo');
        if(newLogo){ img.src = newLogo; console.info('cms-sync: replaced legacy logo src'); }
      }
    });

    // WhatsApp links: data-cms-whatsapp="tour-slug" or "site"
    document.querySelectorAll('[data-cms-whatsapp]').forEach(a=>{
      const slug = a.getAttribute('data-cms-whatsapp');
      const pkg = (manifest.packages && manifest.packages[slug]) ? manifest.packages[slug] : null;
      const phone = (pkg && pkg.whatsapp) ? pkg.whatsapp : resolveKey(manifest, 'site.whatsapp_default') || '';
      const rawMsg = (pkg && pkg.whatsapp_message) ? pkg.whatsapp_message : resolveKey(manifest, 'site.whatsapp_message') || `Hello! I'm interested in ${slug}`;
      const msg = encodeURIComponent(rawMsg.replace(/\s+/g,' '));
      if(phone){ const url = `https://wa.me/${phone}?text=${msg}`; if(a.href !== url){ a.href = url; a.setAttribute('target','_blank'); console.info('cms-sync: set whatsapp for', slug); } }
    });

    // Simple validation: log any img elements whose src is local but no cms key
    document.querySelectorAll('img').forEach(img=>{
      if(img.hasAttribute('data-cms-image')) return;
      const srcAttr = img.getAttribute('src') || '';
      const isLocal = srcAttr.startsWith('images/') || srcAttr.startsWith('/images/') || srcAttr.indexOf('assets/images/') !== -1;
      if(isLocal){ console.warn('cms-sync: local image without CMS control detected', srcAttr, img); }
    });
  }

  // Continuous enforcement: re-apply manifest periodically
  function startEnforcement(){
    setInterval(()=>{
      if(!manifest) loadManifest(); else applyManifest();
    }, 30000); // every 30s
  }

  // Init
  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', ()=>{ loadManifest().then(startEnforcement); });
  }else{
    loadManifest().then(startEnforcement);
  }
})();
