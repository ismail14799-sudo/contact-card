const {test}=require('node:test');
const assert=require('node:assert/strict');
const {createDecipheriv}=require('node:crypto');
const C=require('../core.js'),S=require('../secure.js'),Q=require('../vendor/qrcode.js');
const p={name:'Alex Example',role:'Operations Lead',roleRu:'Руководитель отдела',company:'Example LLC',phone:'+12345678901',email:'alex@example.org',website:'https://example.org/',telegram:'https://t.me/example',whatsapp:'https://wa.me/example',max:'https://max.ru/u/example',portrait:true,portraitKey:S.b64(new Uint8Array(32).fill(7))};
const encode=s=>new TextEncoder().encode(s);

test('Russian names follow the chosen language in text, contact files and encrypted links',async()=>{
 const profile={...p,nameRu:'Алекс Пример',logoKey:S.b64(new Uint8Array(32).fill(9))};
 const u=new URL(await S.createLink(C.pack(profile),'https://example.org/',false,'ru'));
 const opened=await S.openHash(u.hash),decoded=C.unpack(opened.packed);
 assert.equal(opened.lang,'ru');assert.equal(C.displayName(decoded,'ru'),profile.nameRu);assert.equal(C.displayName(decoded,'en'),p.name);
 assert.ok(C.plainText(decoded,'ru').startsWith(profile.nameRu));assert.ok(C.vcard(decoded,'ru').includes('FN:'+profile.nameRu));
 const hidden=C.unpack(C.pack(C.snapshot(profile,['name','email'])));assert.equal(hidden.logoKey,undefined);assert.equal(hidden.nameRu,profile.nameRu);
 assert.equal(C.snapshot(profile,['company']).nameRu,undefined);
 await assert.rejects(()=>S.openHash(u.hash+'&lang=en'));
});
test('the company logo is authenticated and cannot be opened as a portrait',async()=>{
 const png=Uint8Array.from([137,80,78,71,13,10,26,10,...new Uint8Array(128).fill(23)]),encrypted=await S.encryptLogo(png);
 assert.deepEqual(await S.decryptLogo(encrypted.file,encrypted.key),png);
 await assert.rejects(()=>S.decryptPortrait(encrypted.file,encrypted.key));
 const tampered=encrypted.file.slice();tampered[21]^=1;await assert.rejects(()=>S.decryptLogo(tampered,encrypted.key));
 const profile={...p,logoKey:encrypted.key};
 for(let mask=1;mask<1024;mask++){const fields=C.FIELDS.filter((_,i)=>mask&(1<<i)),filtered=C.unpack(C.pack(C.snapshot(profile,fields)));if(!fields.includes('company'))assert.equal(filtered.logoKey,undefined);}
});

test('encrypted contact link round-trips UTF-8 fields and portrait capability',async()=>{
 const link=await S.createLink(C.pack(p),'https://example.org/card/?old=discarded#old');
 const u=new URL(link),opened=await S.openHash(u.hash);assert.equal(u.search,'');assert.deepEqual(C.unpack(opened.packed),C.snapshot(p));
 assert.equal(opened.owner,false);assert.ok(!link.includes(p.name));assert.ok(!link.includes(p.email));assert.ok(!link.includes(p.portraitKey));
});
test('fresh links use independent random keys and IVs',async()=>{
 const links=await Promise.all(Array.from({length:12},()=>S.createLink(C.pack(p),'https://example.org/')));
 const envelopes=links.map(l=>S.parseHash(new URL(l).hash));
 assert.equal(new Set(envelopes.map(e=>e.key)).size,12);assert.equal(new Set(envelopes.map(e=>e.iv)).size,12);
 assert.ok(envelopes.every(e=>S.bytes(e.key).length===32&&S.bytes(e.iv).length===12));
});
test('missing key, malformed link and duplicate parameters fail closed',async()=>{
 const link=new URL(await S.createLink(C.pack(p),'https://example.org/'));
 for(const parameter of ['v','k','i','d']){const h=new URLSearchParams(link.hash.slice(1));h.delete(parameter);await assert.rejects(()=>S.openHash('#'+h));}
 await assert.rejects(()=>S.openHash(link.hash+'&k=duplicate'));
 await assert.rejects(()=>S.openHash('#c=old-unencrypted-format'));
 await assert.rejects(()=>S.openHash('#v=2&k=abc&i=abc&d=abc'));
});
test('wrong key and modified ciphertext fail authentication',async()=>{
 const envelope=S.parseHash(new URL(await S.createLink(C.pack(p),'https://example.org/')).hash);
 await assert.rejects(()=>S.open({...envelope,key:S.b64(new Uint8Array(32).fill(13))}));
 const modified=S.bytes(envelope.ciphertext);modified[modified.length-1]^=1;
 await assert.rejects(()=>S.open({...envelope,ciphertext:S.b64(modified)}));
});
test('AES-GCM output interoperates with independent Node crypto implementation',async()=>{
 const encrypted=await S.seal(encode('authenticated example'),'card');
 const ciphertext=Buffer.from(S.bytes(encrypted.ciphertext));
 const decipher=createDecipheriv('aes-256-gcm',Buffer.from(S.bytes(encrypted.key)),Buffer.from(S.bytes(encrypted.iv)));
 decipher.setAAD(Buffer.from('contact-card:payload:v2'));decipher.setAuthTag(ciphertext.subarray(-16));
 const plaintext=Buffer.concat([decipher.update(ciphertext.subarray(0,-16)),decipher.final()]);
 assert.equal(plaintext.toString(),'authenticated example');
});
test('portrait asset is authenticated, opaque and purpose-separated',async()=>{
 const original=Uint8Array.from([255,216,255,224,...new Uint8Array(128).fill(19)]);
 const encrypted=await S.encryptPortrait(original);assert.ok(!Buffer.from(encrypted.file).includes(Buffer.from(original)));
 assert.deepEqual(await S.decryptPortrait(encrypted.file,encrypted.key),original);
 await assert.rejects(()=>S.decryptPortrait(encrypted.file,S.b64(new Uint8Array(32).fill(3))));
 const tampered=encrypted.file.slice();tampered[20]^=1;await assert.rejects(()=>S.decryptPortrait(tampered,encrypted.key));
 const cardEnvelope=await S.seal(encode('example'),'card');await assert.rejects(()=>S.open(cardEnvelope,'portrait'));
});
test('restricted snapshots omit hidden text and image key before encryption',async()=>{
 const restricted=C.snapshot(p,['name','company','email']),url=new URL(await S.createLink(C.pack(restricted),'https://example.org/'));
 const opened=C.unpack((await S.openHash(url.hash)).packed);
 for(const key of ['phone','role','roleRu','website','telegram','whatsapp','max','portrait','portraitKey'])assert.equal(opened[key],undefined);
 assert.ok(!JSON.stringify(opened).includes(p.portraitKey));assert.ok(!C.vcard(opened).includes(p.phone));
});
test('every field subset removes its excluded values and portrait key',()=>{
 for(let mask=1;mask<1024;mask++){
  const fields=C.FIELDS.filter((_,i)=>mask&(1<<i)),filtered=C.unpack(C.pack(C.snapshot(p,fields)));
  for(const key of C.FIELDS)if(!fields.includes(key))assert.equal(filtered[key],undefined);
  if(!fields.includes('portrait'))assert.equal(filtered.portraitKey,undefined);
  if(!fields.includes('role'))assert.equal(filtered.roleRu,undefined);
 }
});
test('a protected card link fits standard QR capacity',async()=>{
 Q.stringToBytes=Q.stringToBytesFuncs['UTF-8'];
 const link=await S.createLink(C.pack(p),'https://example.org/protected-card/');
 const qr=Q(0,'M');qr.addData(link);qr.make();assert.ok(qr.getModuleCount()<=177);
});
test('owner launch flag preserves encryption and stays out of normal share links',async()=>{
 const owner=new URL(await S.createLink(C.pack(p),'https://example.org/',true));
 assert.equal((await S.openHash(owner.hash)).owner,true);
 const shared=new URL(await S.createLink(C.pack(p),'https://example.org/'));
 assert.equal(S.parseHash(shared.hash).owner,false);
});
