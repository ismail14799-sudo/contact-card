const fs=require('node:fs'),path=require('node:path'),crypto=require('node:crypto');
const root=path.resolve(__dirname,'..'),profile=JSON.parse(fs.readFileSync(process.argv[2]||path.join(root,'private/profile.json'),'utf8'));
const files=JSON.parse(fs.readFileSync(path.join(root,'release-files.json'),'utf8'));
const forbidden=[profile.name,profile.nameRu,profile.company,profile.phone,profile.phone?.replace(/\D/g,''),profile.email,profile.website,profile.telegram,profile.whatsapp,profile.max,profile.role,profile.roleRu,profile.portraitKey,profile.logoKey].filter(Boolean);
const linksFile=path.join(root,'private/links.json');
if(fs.existsSync(linksFile))for(const link of Object.values(JSON.parse(fs.readFileSync(linksFile,'utf8')))){
 try{const params=new URLSearchParams(new URL(link).hash.slice(1));if(params.get('k'))forbidden.push(params.get('k'));}catch{}
}
let bytes=0;
const genericIcons=new Set(['assets/app-icon-180.png','assets/app-icon-192.png','assets/app-icon-512.png']);
for(const file of files){
 if(/(^|\/)(private|artifacts|dist|\.git|\.openai)(\/|$)/.test(file)||(/\.(jpe?g|png|webp|vcf|pdf)$/i.test(file)&&!genericIcons.has(file)))throw new Error('Forbidden public file: '+file);
 const data=fs.readFileSync(path.join(root,file));bytes+=data.length;
 for(const secret of forbidden)if(data.includes(Buffer.from(secret)))throw new Error('Personal value or key in release file: '+file);
 if(file.endsWith('.enc')){if(!['CCP02','CCL02'].includes(data.subarray(0,5).toString()))throw new Error('Unrecognized encrypted image format');}
}
const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
for(const forbiddenCode of ['C.shareUrl(', 'C.decode(', 'CONTACT_PREVIEW_PROFILE', 'CONTACT_PORTRAIT', 'portrait.jpg'])if(app.includes(forbiddenCode))throw new Error('Unprotected application path: '+forbiddenCode);
console.log(JSON.stringify({publishable_files:files.length,publishable_bytes:bytes,actual_profile_values_and_keys_found:0,plaintext_personal_or_company_images:0,generic_app_icons:genericIcons.size,checked_on:new Date().toISOString().slice(0,10)}));
