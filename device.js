/* A saved capability stays in this browser, only after an explicit action. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('./secure.js'));
  else root.ContactDevice=factory(root.ContactSecure);
})(typeof globalThis==='object'?globalThis:this,function(S){
  'use strict';
  const KEY='protected-contact-saved-link-v2';
  function localLink(value,base){
    const page=new URL(base),url=new URL(value);
    if(url.origin!==page.origin||url.pathname!==page.pathname||url.protocol!=='https:')throw new Error('Use a link for this card');
    S.parseHash(url.hash);
    const hash=new URLSearchParams(url.hash.slice(1));hash.delete('mode');url.hash=hash.toString();url.search='';
    return url.href;
  }
  function save(storage,value,base){const link=localLink(value,base);storage.setItem(KEY,link);return link;}
  function read(storage,base){try{const value=storage.getItem(KEY);return value?localLink(value,base):'';}catch{return '';}}
  function forget(storage){for(const key of [KEY,'protected-contact-owner-v2','protected-contact-selection-v2'])storage.removeItem(key);}
  return {save,read,forget};
});
