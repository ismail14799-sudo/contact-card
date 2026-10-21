const { test } = require('node:test');
const assert = require('node:assert/strict');
const C = require('../core.js');
const qrFactory = require('../vendor/qrcode.js');
const fixture = {name:'Alex Example',role:'Operations Lead',roleRu:'Руководитель отдела',company:'Example LLC / Sample LLC',phone:'+12345678901',email:'alex@example.org',website:'https://example.org/',telegram:'https://t.me/example',whatsapp:'https://wa.me/example',max:'https://max.ru/u/example',portrait:true};

test('a selected snapshot omits private fields from the URL, VCF and plain text',()=>{
  const p=C.snapshot(fixture,['name','company','email']);
  const encoded=C.encode(p),decoded=C.decode(encoded),vcf=C.vcard(decoded),txt=C.plainText(decoded);
  assert.deepEqual(Object.keys(decoded),['name','company','email']);
  for(const value of [fixture.phone,fixture.role,fixture.roleRu,fixture.website,fixture.telegram,fixture.whatsapp,fixture.max]) {
    assert.ok(!JSON.stringify(decoded).includes(value));assert.ok(!vcf.includes(value));assert.ok(!txt.includes(value));
  }
  assert.ok(!Object.hasOwn(decoded,'portrait'));
  assert.ok(vcf.includes('EMAIL;TYPE=INTERNET,WORK:alex@example.org'));
});
test('Russian text survives Unicode encoding and vCard export',()=>{
  const p=C.decode(C.encode(fixture));assert.equal(p.roleRu,fixture.roleRu);
  assert.ok(C.vcard(p,'ru').includes('TITLE:Руководитель отдела'));
});
test('untrusted payload fields and unsafe links are discarded',()=>{
  const p=C.snapshot({...fixture,website:'javascript:alert(1)',telegram:'data:text/html,secret',adminPassword:'must-not-appear'});
  assert.equal(p.website,undefined);assert.equal(p.telegram,undefined);assert.equal(p.adminPassword,undefined);
  const data=btoa(JSON.stringify({v:1,d:{n:'Contact',password:'secret',w:'javascript:alert(1)',rr:'hidden role'}}));
  const decoded=C.decode(data.replace(/=/g,''));assert.deepEqual(Object.keys(decoded),['name']);
});
test('CRLF injection cannot add a contact or arbitrary vCard property',()=>{
  const vcf=C.vcard({...fixture,name:'Test\r\nEND:VCARD\r\nBEGIN:VCARD',company:'A;B,C\\D'});
  assert.equal(vcf.split('\r\n').filter(l=>l==='BEGIN:VCARD').length,1);
  assert.equal(vcf.split('\r\n').filter(l=>l==='END:VCARD').length,1);
  assert.ok(vcf.includes('ORG:A\\;B\\,C\\\\D'));
});
test('vCard folding preserves UTF-8 and stays within 75 octets',()=>{
  const vcf=C.vcard({...fixture,company:'Компания'.repeat(20),max:'https://max.ru/u/'+ 'a'.repeat(300)},'ru');
  for(const line of vcf.split('\r\n'))assert.ok(Buffer.byteLength(line,'utf8')<=75);
  const unfolded=vcf.replace(/\r\n /g,'');assert.ok(unfolded.includes('Компания'.repeat(20)));
});
test('share links use a fragment with only selected fields and clear query state',()=>{
  const p=C.snapshot(fixture,['name','telegram']);
  const u=new URL(C.shareUrl(p,'https://example.org/card/?private=bad#setup=bad'));
  assert.equal(u.search,'');assert.ok(u.hash.startsWith('#c='));
  assert.equal(C.decode(u.hash.slice(3)).phone,undefined);
});
test('malformed and unsupported payloads fail closed',()=>{
  for(const bad of ['', 'not+a+payload', 'a'.repeat(12001), btoa('{"v":99,"d":{"n":"N"}}').replace(/=/g,''), btoa('{"v":1,"d":{}}').replace(/=/g,'')]) assert.throws(()=>C.decode(bad));
});
test('all sharing subsets keep excluded values out of each export',()=>{
  for(let mask=1;mask<1024;mask++){
    const keys=C.FIELDS.filter((_,i)=>mask&(1<<i)),p=C.snapshot(fixture,keys),round=C.decode(C.encode(p));
    for(const k of C.FIELDS) if(!keys.includes(k)) assert.equal(round[k],undefined);
    if(!keys.includes('role'))assert.equal(round.roleRu,undefined);
    const txt=C.plainText(round),vcf=C.vcard(round);
    if(!keys.includes('phone')){assert.ok(!txt.includes(fixture.phone));assert.ok(!vcf.includes(fixture.phone));}
  }
});
test('web and offline QR payloads fit and generate with UTF-8 support',()=>{
  qrFactory.stringToBytes=qrFactory.stringToBytesFuncs['UTF-8'];
  for(const value of [C.shareUrl(fixture,'https://example.org/card/'),C.vcard(fixture),C.vcard(fixture,'ru')]){
    const qr=qrFactory(0,'M');qr.addData(value);qr.make();
    assert.ok(qr.getModuleCount()<=177);assert.ok(qr.createSvgTag({cellSize:4,margin:16}).includes('<svg'));
  }
});
test('HTML escaping protects export content',()=>{
  assert.equal(C.html('<img src=x onerror="boom">&'), '&lt;img src=x onerror=&quot;boom&quot;&gt;&amp;');
});
test('compact offline vCard preserves selected social links without duplication',()=>{
  const vcf=C.vcard(fixture,'en',{compact:true}).replace(/\r\n /g,'');
  for(const field of ['telegram','whatsapp','max'])assert.equal(vcf.split(fixture[field]).length-1,1);
  assert.ok(!vcf.includes('X-SOCIALPROFILE'));
  assert.ok(vcf.includes('TEL;TYPE=CELL:'+fixture.phone));
});
