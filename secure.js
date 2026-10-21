/* AES-256-GCM envelopes. No key, profile or plaintext portrait is embedded here. */
(function(root,factory){
  if(typeof module==='object'&&module.exports)module.exports=factory(require('node:crypto').webcrypto);
  else root.ContactSecure=factory(root.crypto);
})(typeof globalThis==='object'?globalThis:this,function(crypto){
  'use strict';
  const encoder=new TextEncoder();
  const PURPOSES={card:'contact-card:payload:v2',portrait:'contact-card:portrait:v2',logo:'contact-card:logo:v2'};
  function available(){return !!crypto?.subtle&&typeof crypto.getRandomValues==='function';}
  function b64(bytes){let value='';for(const byte of new Uint8Array(bytes))value+=String.fromCharCode(byte);return btoa(value).replace(/\+/g,'-').replace(/\//g,'_').replace(/=+$/,'');}
  function bytes(value,max=20000){
    if(typeof value!=='string'||value.length>max||!/^[A-Za-z0-9_-]+$/.test(value))throw new Error('Invalid encrypted link');
    const raw=atob(value.replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from(raw,c=>c.charCodeAt(0));
  }
  function requireCrypto(){if(!available())throw new Error('Secure HTTPS browser required');}
  async function keyFrom(raw,usages){
    requireCrypto();const value=typeof raw==='string'?bytes(raw,43):new Uint8Array(raw);
    if(value.length!==32)throw new Error('Invalid encryption key');
    return crypto.subtle.importKey('raw',value,{name:'AES-GCM'},false,usages);
  }
  async function seal(data,purpose='card'){
    requireCrypto();if(!PURPOSES[purpose])throw new Error('Invalid encryption purpose');
    const raw=crypto.getRandomValues(new Uint8Array(32)),iv=crypto.getRandomValues(new Uint8Array(12));
    const key=await keyFrom(raw,['encrypt']);
    const ciphertext=await crypto.subtle.encrypt({name:'AES-GCM',iv,additionalData:encoder.encode(PURPOSES[purpose]),tagLength:128},key,data);
    return {key:b64(raw),iv:b64(iv),ciphertext:b64(ciphertext)};
  }
  async function open(envelope,purpose='card'){
    requireCrypto();if(!PURPOSES[purpose])throw new Error('Invalid encryption purpose');
    const iv=bytes(envelope.iv,16),ciphertext=bytes(envelope.ciphertext,purpose==='card'?20000:4000000);
    if(iv.length!==12||ciphertext.length<16)throw new Error('Invalid encrypted payload');
    const key=await keyFrom(envelope.key,['decrypt']);
    return new Uint8Array(await crypto.subtle.decrypt({name:'AES-GCM',iv,additionalData:encoder.encode(PURPOSES[purpose]),tagLength:128},key,ciphertext));
  }
  async function createLink(packed,base,owner=false,lang='en'){
    const e=await seal(encoder.encode(JSON.stringify(packed)),'card');
    const url=new URL(base);url.search='';url.hash=new URLSearchParams({v:'2',k:e.key,i:e.iv,d:e.ciphertext,...(owner?{mode:'owner'}:{}),...(lang==='ru'?{lang:'ru'}:{})}).toString();
    return url.href;
  }
  function parseHash(hash){
    if(typeof hash!=='string'||hash.length>24000)throw new Error('Invalid encrypted link');
    const p=new URLSearchParams(hash.replace(/^#/,''));
    if(p.get('v')!=='2'||!p.get('k')||!p.get('i')||!p.get('d'))throw new Error('Missing key or encrypted data');
    for(const name of ['v','k','i','d','mode','lang'])if(p.getAll(name).length>1)throw new Error('Duplicate link parameter');
    return {key:p.get('k'),iv:p.get('i'),ciphertext:p.get('d'),owner:p.get('mode')==='owner',lang:p.get('lang')==='ru'?'ru':'en'};
  }
  async function openHash(hash){
    const e=parseHash(hash);const plaintext=await open(e,'card');
    return {packed:JSON.parse(new TextDecoder('utf-8',{fatal:true}).decode(plaintext)),owner:e.owner,lang:e.lang};
  }
  async function encryptImage(input,purpose,magic){
    const e=await seal(input,purpose),iv=bytes(e.iv),ciphertext=bytes(e.ciphertext,4000000),file=new Uint8Array(5+iv.length+ciphertext.length);
    file.set(encoder.encode(magic));file.set(iv,5);file.set(ciphertext,17);
    return {key:e.key,file};
  }
  async function decryptImage(input,key,purpose,magic){
    const file=new Uint8Array(input);
    if(file.length<33||file.length>3000000||new TextDecoder().decode(file.slice(0,5))!==magic)throw new Error('Invalid encrypted image');
    return open({key,iv:b64(file.slice(5,17)),ciphertext:b64(file.slice(17))},purpose);
  }
  const encryptPortrait=input=>encryptImage(input,'portrait','CCP02');
  const decryptPortrait=(input,key)=>decryptImage(input,key,'portrait','CCP02');
  const encryptLogo=input=>encryptImage(input,'logo','CCL02');
  const decryptLogo=(input,key)=>decryptImage(input,key,'logo','CCL02');
  return {available,b64,bytes,seal,open,createLink,parseHash,openHash,encryptPortrait,decryptPortrait,encryptLogo,decryptLogo};
});
