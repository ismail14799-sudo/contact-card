const {test}=require('node:test'),assert=require('node:assert/strict');
const D=require('../device.js'),S=require('../secure.js'),C=require('../core.js');
const base='https://example.org/card/';
function storage(){const map=new Map();return {getItem:k=>map.get(k)||null,setItem:(k,v)=>map.set(k,v),removeItem:k=>map.delete(k),map};}
test('remembering a card restores only the encrypted selected capability and locale',async()=>{
 const p={name:'Alex Example',nameRu:'Алекс Пример',email:'alex@example.org'};
 const link=await S.createLink(C.pack(p),base,true,'ru'),device=storage();
 assert.equal(D.read(device,base),'');
 const saved=D.save(device,link,base);assert.equal(new URLSearchParams(new URL(saved).hash.slice(1)).has('mode'),false);
 assert.equal(D.read(device,base),saved);assert.ok(!JSON.stringify([...device.map]).includes(p.email));
 const restored=await S.openHash(new URL(D.read(device,base)).hash);assert.equal(restored.lang,'ru');assert.equal(restored.owner,false);assert.deepEqual(C.unpack(restored.packed),C.snapshot(p));
});
test('device storage rejects foreign paths, foreign origins and incomplete links',async()=>{
 const link=new URL(await S.createLink(C.pack({name:'Example'}),base)),device=storage();
 for(const bad of [link.href.replace('example.org','other.example'),link.href.replace('/card/','/other/'),base+'#v=2',base.replace('https:','http:')+link.hash])assert.throws(()=>D.save(device,bad,base));
 device.setItem('protected-contact-saved-link-v2','broken');assert.equal(D.read(device,base),'');
});
test('forgetting removes the saved card and owner copy without changing other site preferences',async()=>{
 const device=storage(),link=await S.createLink(C.pack({name:'Example'}),base);
 D.save(device,link,base);device.setItem('protected-contact-owner-v2','owner');device.setItem('protected-contact-selection-v2','selection');device.setItem('contact-theme-v1','dark');
 D.forget(device);assert.equal(D.read(device,base),'');assert.equal(device.getItem('protected-contact-owner-v2'),null);assert.equal(device.getItem('protected-contact-selection-v2'),null);assert.equal(device.getItem('contact-theme-v1'),'dark');
});
