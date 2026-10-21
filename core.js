/* Contact snapshots and exports. No profile is embedded in this module. */
(function (root, factory) {
  if (typeof module === 'object' && module.exports) module.exports = factory();
  else root.ContactCore = factory();
})(typeof globalThis === 'object' ? globalThis : this, function () {
  'use strict';
  const FIELDS = ['name', 'role', 'company', 'phone', 'email', 'website', 'telegram', 'whatsapp', 'max', 'portrait'];
  const KEYS = ['n', 'r', 'o', 'p', 'e', 'w', 't', 'a', 'm', 'i'];
  function clean(value, max = 240) {
    return typeof value === 'string' ? value.replace(/[\u0000-\u001f\u007f]/g, ' ').trim().slice(0, max) : '';
  }
  function safeUrl(value) {
    try { const url = new URL(clean(value, 600)); return url.protocol === 'https:' ? url.href : ''; } catch { return ''; }
  }
  function normalize(input = {}) {
    const p = Object.create(null);
    p.name = clean(input.name, 100);
    p.nameRu = clean(input.nameRu, 100);
    p.role = clean(input.role, 100);
    p.roleRu = clean(input.roleRu, 120);
    p.company = clean(input.company, 160);
    p.phone = clean(input.phone, 40).replace(/[^+\d() .-]/g, '');
    const email = clean(input.email, 160);
    p.email = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email) ? email : '';
    for (const key of ['website', 'telegram', 'whatsapp', 'max']) p[key] = safeUrl(input[key]);
    p.portrait = input.portrait === true;
    p.portraitKey = p.portrait && typeof input.portraitKey === 'string' && /^[A-Za-z0-9_-]{43}$/.test(input.portraitKey) ? input.portraitKey : '';
    p.logoKey = p.company && typeof input.logoKey === 'string' && /^[A-Za-z0-9_-]{43}$/.test(input.logoKey) ? input.logoKey : '';
    return p;
  }
  function snapshot(input, selected = FIELDS) {
    const p = normalize(input), allow = new Set(selected), out = Object.create(null);
    for (const key of FIELDS) {
      if (!allow.has(key)) continue;
      if (key === 'portrait') { if (p.portrait) { out.portrait = true; if (p.portraitKey) out.portraitKey = p.portraitKey; } }
      else if (p[key]) out[key] = p[key];
      if (key === 'name' && p.name && p.nameRu) out.nameRu = p.nameRu;
      if (key === 'role' && p.roleRu) out.roleRu = p.roleRu;
      if (key === 'company' && p.company && p.logoKey) out.logoKey = p.logoKey;
    }
    return out;
  }
  function pack(profile) {
    const p = snapshot(profile), values = [];
    for (let i = 0; i < FIELDS.length; i++) {
      const value = p[FIELDS[i]];
      if (value) values.push([KEYS[i], value]);
    }
    if (p.roleRu) values.push(['rr', p.roleRu]);
    if (p.nameRu) values.push(['nr', p.nameRu]);
    if (p.company && p.logoKey) values.push(['lk', p.logoKey]);
    if (p.portrait && p.portraitKey) values.push(['ik', p.portraitKey]);
    return { v: 1, d: Object.fromEntries(values) };
  }
  function encode(profile) {
    const bytes = new TextEncoder().encode(JSON.stringify(pack(profile)));
    let binary = ''; for (const b of bytes) binary += String.fromCharCode(b);
    return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
  }
  function decode(code) {
    if (typeof code !== 'string' || code.length > 12000 || !/^[A-Za-z0-9_-]+$/.test(code)) throw new Error('Invalid card link');
    const binary = atob(code.replace(/-/g, '+').replace(/_/g, '/'));
    const object = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(Uint8Array.from(binary, c => c.charCodeAt(0))));
    return unpack(object);
  }
  function unpack(object) {
    if (!object || object.v !== 1 || !object.d || typeof object.d !== 'object' || Array.isArray(object.d)) throw new Error('Unsupported card link');
    const p = Object.create(null);
    for (let i = 0; i < FIELDS.length; i++) p[FIELDS[i]] = object.d[KEYS[i]];
    if (p.role) p.roleRu = object.d.rr;
    if (p.name) p.nameRu = object.d.nr;
    if (p.company) p.logoKey = object.d.lk;
    if (p.portrait === true) p.portraitKey = object.d.ik;
    const out = snapshot(p);
    if (!Object.keys(out).length) throw new Error('Empty contact card');
    return out;
  }
  function shareUrl(profile, base) {
    const u = new URL(base);
    u.search = ''; u.hash = 'c=' + encode(profile);
    return u.href;
  }
  const escapeV = value => String(value).replace(/\\/g, '\\\\').replace(/\r?\n/g, '\\n').replace(/;/g, '\\;').replace(/,/g, '\\,');
  const displayName = (profile, lang = 'en') => lang === 'ru' && profile.nameRu ? profile.nameRu : profile.name;
  function fold(line) {
    const output = []; let segment = '', count = 0;
    for (const character of line) {
      const size = new TextEncoder().encode(character).length;
      if (count + size > 75) { output.push(segment); segment = ' '; count = 1; }
      segment += character; count += size;
    }
    output.push(segment); return output.join('\r\n');
  }
  function vcard(input, lang = 'en', options = {}) {
    const p = snapshot(input), lines = ['BEGIN:VCARD', 'VERSION:3.0'];
    const name = displayName(p,lang) || 'Contact';
    const parts = name.split(/\s+/), family = parts.length > 1 ? parts.pop() : '';
    lines.push('N:' + escapeV(family) + ';' + escapeV(parts.join(' ')) + ';;;', 'FN:' + escapeV(name));
    if (p.role) lines.push('TITLE:' + escapeV(lang === 'ru' && p.roleRu ? p.roleRu : p.role));
    if (p.company) lines.push('ORG:' + escapeV(p.company));
    if (p.phone) lines.push('TEL;TYPE=CELL:' + p.phone.replace(/[^+\d]/g, ''));
    if (p.email) lines.push('EMAIL;TYPE=INTERNET,WORK:' + p.email);
    if (p.website) lines.push('URL;TYPE=WORK:' + p.website);
    const social = [];
    for (const key of ['telegram', 'whatsapp', 'max']) if (p[key]) {
      if (!options.compact) lines.push('X-SOCIALPROFILE;TYPE=' + key + ':' + p[key]);
      social.push((key === 'max' ? 'MAX' : key[0].toUpperCase() + key.slice(1)) + ': ' + p[key]);
    }
    if (social.length) lines.push('NOTE:' + escapeV(social.join('\n')));
    lines.push('END:VCARD'); return lines.map(fold).join('\r\n') + '\r\n';
  }
  function plainText(input, lang = 'en') {
    const p = snapshot(input), labels = lang === 'ru' ? ['Телефон', 'Эл. почта', 'Сайт'] : ['Phone', 'Email', 'Website'];
    return [displayName(p,lang), p.role && (lang === 'ru' && p.roleRu ? p.roleRu : p.role), p.company,
      p.phone && labels[0] + ': ' + p.phone, p.email && labels[1] + ': ' + p.email,
      p.website && labels[2] + ': ' + p.website,
      p.telegram && 'Telegram: ' + p.telegram, p.whatsapp && 'WhatsApp: ' + p.whatsapp, p.max && 'MAX: ' + p.max].filter(Boolean).join('\n');
  }
  const html = s => String(s || '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  return { FIELDS, normalize, snapshot, pack, unpack, encode, decode, shareUrl, vcard, plainText, displayName, html };
});
