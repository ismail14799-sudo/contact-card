/* Device-local card editor. Share links are independent selected-field snapshots. */
(() => {
  'use strict';
  const C = window.ContactCore;
  const S = window.ContactSecure;
  const $ = id => document.getElementById(id);
  const ICONS = {
    userPlus: '<path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M20 8v6m-3-3h6"/>',
    download: '<path d="M12 3v12m-5-5 5 5 5-5M5 16v4h14v-4"/>',
    copy: '<rect x="8" y="8" width="12" height="13" rx="2"/><path d="M16 8V5a2 2 0 0 0-2-2H5a2 2 0 0 0-2 2v11a2 2 0 0 0 2 2h3"/>',
    sliders: '<path d="M4 7h7m4 0h5M4 17h3m4 0h9"/><circle cx="13" cy="7" r="2"/><circle cx="9" cy="17" r="2"/>',
    qr: '<rect x="3" y="3" width="6" height="6" rx="1"/><rect x="15" y="3" width="6" height="6" rx="1"/><rect x="3" y="15" width="6" height="6" rx="1"/><path d="M15 15h3v3h3m-6 3h3m3-9v3M12 3v3m0 6h3M3 12h3"/>',
    share: '<path d="M12 16V3m-4 4 4-4 4 4M7 10H5a2 2 0 0 0-2 2v7a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7a2 2 0 0 0-2-2h-2"/>',
    moon: '<path d="M20.8 13A8.6 8.6 0 0 1 11 3.2 8.8 8.8 0 1 0 20.8 13Z"/>',
    sun: '<circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/>',
    phone: '<path d="M22 16.9v3a2 2 0 0 1-2.2 2 19.8 19.8 0 0 1-8.6-3.1 19.5 19.5 0 0 1-6-6 19.8 19.8 0 0 1-3.1-8.7A2 2 0 0 1 4.1 2h3a2 2 0 0 1 2 1.7c.1 1 .4 2 .7 2.9a2 2 0 0 1-.5 2.1L8 10a16 16 0 0 0 6 6l1.3-1.3a2 2 0 0 1 2.1-.5c.9.3 1.9.6 2.9.7a2 2 0 0 1 1.7 2Z"/>',
    mail: '<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 7 9 6 9-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3a19 19 0 0 1 0 18 19 19 0 0 1 0-18Z"/>',
    telegram: '<path d="m21 3-4 18-6-6-4 3 1-6L3 9 21 3Z"/><path d="m8 12 9-6-6 9"/>',
    chat: '<path d="M21 11.5a8.4 8.4 0 0 1-.9 3.8 8.5 8.5 0 0 1-7.6 4.7 8.4 8.4 0 0 1-3.8-.9L3 21l1.9-5.7a8.4 8.4 0 0 1-.9-3.8 8.5 8.5 0 0 1 4.7-7.6 8.4 8.4 0 0 1 3.8-.9h.5a8.5 8.5 0 0 1 8 8v.5Z"/>',
    close: '<path d="m6 6 12 12M18 6 6 18"/>',
    shield: '<path d="M12 3 3 7v5c0 5 9 9 9 9s9-4 9-9V7l-9-4Z"/><path d="m8 12 3 3 5-6"/>',
    arrow: '<path d="M5 12h14m-6-6 6 6-6 6"/>',
    link: '<path d="M10 13a5 5 0 0 0 7 .1l3-3a5 5 0 0 0-7-7l-2 2M14 11a5 5 0 0 0-7-.1l-3 3a5 5 0 0 0 7 7l2-2"/>',
    contact: '<rect x="5" y="3" width="15" height="18" rx="2"/><path d="M3 7h4m-4 5h4m-4 5h4M10 17a3 3 0 0 1 6 0"/><circle cx="13" cy="10" r="2"/>',
    text: '<path d="M5 4h14v16H5V4Zm3 4h8M8 12h8m-8 4h5"/>',
    card: '<rect x="3" y="5" width="18" height="14" rx="2"/><circle cx="8" cy="10" r="2"/><path d="M5 16a3 3 0 0 1 6 0m3-6h4m-4 4h4"/>',
    printer: '<path d="M6 9V3h12v6M6 17H4a2 2 0 0 1-2-2v-4a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v4a2 2 0 0 1-2 2h-2"/><path d="M6 14h12v7H6v-7Z"/>',
    person: '<circle cx="12" cy="8" r="4"/><path d="M4 21v-2a6 6 0 0 1 6-6h4a6 6 0 0 1 6 6v2"/>',
    bag: '<rect x="3" y="7" width="18" height="14" rx="2"/><path d="M8 7V5a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2M3 13a27 27 0 0 0 18 0"/>',
    image: '<rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8" cy="8" r="1.5"/><path d="m21 15-5-5-6 8-3-3-4 5"/>'
  };
  const icon = name => '<svg class="icon" viewBox="0 0 24 24" aria-hidden="true">' + (ICONS[name] || ICONS.card) + '</svg>';
  const I18N = {
    en: {
      brand:'Contact', yourSpace:'YOUR CONTACT SPACE', emptyTitle:'Your card.\nYour choice.', emptyText:'Open a shared card link, or create a card that stays on this device until you share it.',createCard:'Create Your Card',
      letsConnect:'LET’S CONNECT', personalConnection:'A PERSONAL CONNECTION',saveContact:'Save Contact',download:'Download',saveHint:'Opens a contact file. Confirm “Add contact” on your phone, or import the downloaded file.',copy:'Copy',choose:'Choose',share:'Share',yourChoice:'YOUR CHOICE',chooseTitle:'Choose what to share.',chooseText:'Only selected details appear in the shared card, contact file and copied text.',allDetails:'All Details',business:'Business',minimal:'Minimal',apply:'Preview Selection',editDetails:'Edit My Details',meetAndConnect:'MEET & CONNECT',qrTitle:'One scan. Connected.',webCard:'Web Card',offlineContact:'Offline Contact',copyLink:'Copy Link',qrSelection:'The QR uses your current selection. Choose fields before sharing.',downloadCard:'Keep a copy.',contactFile:'Contact File',contactFileHint:'VCF · import into your address book',textFile:'Text File',textFileHint:'TXT · selected details, ready to send',offlineCard:'Offline Card',offlineCardHint:'HTML · view your selected card without internet',printPdf:'Print / Save PDF',printPdfHint:'Choose “Save as PDF” in the print menu',shareTitle:'Share your way.',cardLink:'Card Link',shareLimit:'Anyone with this link can view and forward the selected details. Shared links and downloaded copies cannot be recalled.',onYourDevice:'ON THIS DEVICE',editTitle:'Your details.',editHint:'Saved in this browser only. Changes create a new sharing link; earlier links keep their original details.',saveDetails:'Save My Details',myCard:'My Card',copyManually:'Copy Your Details',name:'Name',role:'Job Title',roleRu:'Job Title · Russian',company:'Companies',phone:'Phone',email:'Email',website:'Website',telegram:'Telegram',whatsapp:'WhatsApp',max:'MAX',portrait:'Portrait',portraitDescription:'Pencil portrait',required:'Always included',selected:'details included',copied:'Copied',saved:'Details saved on this device',downloaded:'Contact file ready',fallbackName:'Contact',webDescription:'Opens the selected web card. The person scanning needs internet.',offlineDescription:'Saves selected contact details without internet, with a compatible QR reader. Portraits are not included.',offlineQrCopy:'Copy Contact Text',noFields:'Include at least one detail.',invalidLink:'This card link is incomplete. Open the full link you received, or create a new card.',webUnavailable:'A web QR needs the published website address. The offline contact QR is ready to use.',localShare:'The web card will be shareable after the site is published. You can use the offline QR and contact file now.',storageUnavailable:'Browser storage is unavailable. Keep a backup of your card before closing this page.',nameRequired:'Enter your name.',emailInvalid:'Enter a valid email address.',urlInvalid:'Use a complete HTTPS link.',countSuffix:'selected details',selectionNote:'A contact card, thoughtfully shared.',selectedNote:'Your sharing selection is shown above.',noPortrait:'Not included',downloadError:'Could not prepare the download. Please try again.',newCard:'Create a contact card',chooseClose:'Close',appearance:'Switch appearance',copyField:'Copy',previewOnly:'Preview · not published',unknown:'Not set'
    },
    ru: {
      brand:'Контакт',yourSpace:'ВАШИ КОНТАКТЫ',emptyTitle:'Ваша карточка.\nВаш выбор.',emptyText:'Откройте ссылку на карточку или создайте свою. Данные останутся в этом браузере, пока вы ими не поделитесь.',createCard:'Создать карточку',letsConnect:'БУДЕМ НА СВЯЗИ',personalConnection:'ЛИЧНОЕ ЗНАКОМСТВО',saveContact:'Сохранить контакт',download:'Скачать',saveHint:'Откроется файл контакта. Подтвердите добавление на телефоне или импортируйте скачанный файл.',copy:'Копировать',choose:'Данные',share:'Поделиться',yourChoice:'ВАШ ВЫБОР',chooseTitle:'Выберите данные.',chooseText:'В карточку, файл контакта и скопированный текст попадут только выбранные данные.',allDetails:'Все данные',business:'Деловые',minimal:'Минимум',apply:'Посмотреть карточку',editDetails:'Изменить мои данные',meetAndConnect:'ЗНАКОМСТВО И ОБЩЕНИЕ',qrTitle:'Один скан — на связи.',webCard:'Веб-карточка',offlineContact:'Без интернета',copyLink:'Ссылка',qrSelection:'QR содержит выбранные данные. Настройте их перед отправкой.',downloadCard:'Сохраните копию.',contactFile:'Файл контакта',contactFileHint:'VCF · импорт в адресную книгу',textFile:'Текстовый файл',textFileHint:'TXT · выбранные данные для отправки',offlineCard:'Карточка без интернета',offlineCardHint:'HTML · просмотр без подключения к сети',printPdf:'Печать / Сохранить PDF',printPdfHint:'Выберите «Сохранить как PDF» в меню печати',shareTitle:'Поделитесь по-своему.',cardLink:'Ссылка на карточку',shareLimit:'Любой получатель ссылки может просмотреть и переслать выбранные данные. Отозвать ссылки и скачанные копии нельзя.',onYourDevice:'НА ЭТОМ УСТРОЙСТВЕ',editTitle:'Ваши данные.',editHint:'Сохраняются только в этом браузере. Изменения создают новую ссылку; старые ссылки сохраняют прежние данные.',saveDetails:'Сохранить данные',myCard:'Моя карточка',copyManually:'Скопируйте данные',name:'Имя',role:'Должность',roleRu:'Должность · по-русски',company:'Компании',phone:'Телефон',email:'Эл. почта',website:'Сайт',telegram:'Telegram',whatsapp:'WhatsApp',max:'MAX',portrait:'Портрет',portraitDescription:'Портрет карандашом',required:'Включено всегда',selected:'полей включено',copied:'Скопировано',saved:'Данные сохранены на этом устройстве',downloaded:'Файл контакта готов',fallbackName:'Контакт',webDescription:'Открывает выбранную веб-карточку. Получателю нужен интернет.',offlineDescription:'Сохраняет выбранные контакты без интернета в совместимом QR-сканере. Без портрета.',offlineQrCopy:'Копировать текст',noFields:'Выберите хотя бы одно поле.',invalidLink:'Ссылка неполная. Откройте полученную ссылку целиком или создайте карточку.',webUnavailable:'Для веб-QR нужен адрес опубликованного сайта. QR контакта без интернета уже доступен.',localShare:'Веб-ссылку можно будет отправлять после публикации сайта. QR без интернета и файл контакта уже доступны.',storageUnavailable:'Хранилище браузера недоступно. Сохраните копию карточки перед закрытием страницы.',nameRequired:'Введите имя.',emailInvalid:'Введите корректный адрес почты.',urlInvalid:'Укажите полную HTTPS-ссылку.',countSuffix:'выбранных полей',selectionNote:'Знакомство начинается с контакта.',selectedNote:'Выше показаны данные для отправки.',noPortrait:'Не включён',downloadError:'Не удалось подготовить файл. Попробуйте ещё раз.',newCard:'Создать карточку контакта',chooseClose:'Закрыть',appearance:'Изменить оформление',copyField:'Копировать',previewOnly:'Предпросмотр · не опубликовано',unknown:'Не указано'
    }
  };
  Object.assign(I18N.en,{skipContact:'Skip to contact',language:'Language',cardActions:'Card actions',sharingPresets:'Sharing presets',qrType:'QR type',cardLinkLabel:'Card link',copyDetailsLabel:'Details to copy',portraitLabel:'PORTRAIT'});
  Object.assign(I18N.ru,{skipContact:'К контактам',language:'Язык',cardActions:'Действия с карточкой',sharingPresets:'Наборы данных',qrType:'Тип QR',cardLinkLabel:'Ссылка на карточку',copyDetailsLabel:'Данные для копирования',portraitLabel:'ПОРТРЕТ'});
  Object.assign(I18N.en,{yourSpace:'A PRIVATE CONNECTION',emptyTitle:'This card\nis protected.',emptyText:'Open the full link from the QR code to view this card. Its key unlocks the selected details on your device.',createCard:'Open Card Link',unlockTitle:'Open a protected card.',unlockLabel:'Paste the complete card link',openCard:'Open Card',invalidLink:'This link could not unlock the card. Paste the complete QR link, including everything after #.',cryptoUnavailable:'Open this card in an up-to-date browser using its HTTPS link.',portraitUnavailable:'The portrait could not be opened. The contact details are still available.',preparing:'Preparing…',shareLimit:'Anyone with this complete link holds the key and can view or forward the selected details. Shared links and saved copies cannot be recalled.',webDescription:'Opens your encrypted card with the key in this QR. A new recipient needs internet.',protectedNote:'Opened with your private card link.'});
  Object.assign(I18N.ru,{yourSpace:'ЛИЧНОЕ ЗНАКОМСТВО',emptyTitle:'Карточка\nзащищена.',emptyText:'Откройте полную ссылку из QR-кода. Её ключ откроет выбранные данные на вашем устройстве.',createCard:'Открыть ссылку',unlockTitle:'Откройте защищённую карточку.',unlockLabel:'Вставьте полную ссылку на карточку',openCard:'Открыть карточку',invalidLink:'Не удалось открыть карточку. Вставьте полную ссылку из QR, включая часть после #.',cryptoUnavailable:'Откройте карточку по HTTPS-ссылке в современном браузере.',portraitUnavailable:'Не удалось открыть портрет. Контактные данные по-прежнему доступны.',preparing:'Подготовка…',shareLimit:'Полная ссылка содержит ключ. Её получатель может просмотреть и переслать выбранные данные. Отозвать ссылки и сохранённые копии нельзя.',webDescription:'Открывает зашифрованную карточку ключом из этого QR. Новому получателю нужен интернет.',protectedNote:'Открыто по вашей защищённой ссылке.'});
  const state = {lang:'en',source:null,selected:new Set(C.FIELDS),draft:new Set(),owner:false,shared:false,qrMode:'web',qr:null,theme:'light',preview:false};
  let ownerProfile = null, toastTimer, currentDialog = null;
  let portraitRequest=0,qrRequest=0,loadRequest=0;
  const portraitCache=new Map(),linkCache=new Map();
  function t(key) { return I18N[state.lang][key] || I18N.en[key] || key; }
  function safeStorageRead(key) { try { return localStorage.getItem(key); } catch { return null; } }
  function safeStorageWrite(key, value) { try { localStorage.setItem(key, value); return true; } catch { return false; } }
  function selectedCard() { return C.snapshot(state.source || {}, [...state.selected]); }
  function setIcons(root = document) { root.querySelectorAll('[data-icon]').forEach(el => el.innerHTML = icon(el.dataset.icon)); }
  function toast(message) { clearTimeout(toastTimer); $('toast').textContent = message; $('toast').classList.add('visible'); toastTimer = setTimeout(() => $('toast').classList.remove('visible'), 3500); }
  function setTheme(theme) { state.theme = theme; document.documentElement.dataset.theme = theme; $('theme-button').innerHTML = icon(theme === 'dark' ? 'sun' : 'moon'); safeStorageWrite('contact-theme-v1',theme); }
  function setLanguage(lang) {
    state.lang = lang === 'ru' ? 'ru' : 'en'; document.documentElement.lang = state.lang;
    document.querySelectorAll('[data-i18n]').forEach(el => { if (el.dataset.i18n === 'emptyTitle') el.innerHTML = t(el.dataset.i18n).split('\n').map(C.html).join('<br>'); else el.textContent = t(el.dataset.i18n); });
    document.querySelectorAll('[data-lang]').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.lang === state.lang)));
    document.querySelectorAll('[data-close]').forEach(el => el.setAttribute('aria-label',t('chooseClose')));
    $('theme-button').setAttribute('aria-label',t('appearance'));
    document.querySelector('.skip').textContent=t('skipContact');
    document.querySelector('.language').setAttribute('aria-label',t('language'));
    $('brand').setAttribute('aria-label',t('brand'));
    $('action-dock').setAttribute('aria-label',t('cardActions'));
    document.querySelector('.presets').setAttribute('aria-label',t('sharingPresets'));
    document.querySelector('.qr-mode').setAttribute('aria-label',t('qrType'));
    document.querySelector('.art-index span:last-child').textContent=t('portraitLabel');
    $('share-link').setAttribute('aria-label',t('cardLinkLabel'));
    $('manual-copy').setAttribute('aria-label',t('copyDetailsLabel'));
    render(); if ($('fields-dialog').open) renderFields(); if ($('qr-dialog').open) renderQr();
  }
  function availableFields() { return C.FIELDS.filter(key => key === 'portrait' ? state.source?.portrait : !!state.source?.[key]); }
  function render() {
    const p = selectedCard(), hasCard = !!state.source;
    $('empty').hidden = hasCard; $('contact').hidden = !hasCard; $('action-dock').hidden = !hasCard; $('card-footer').hidden = !hasCard;
    if (!hasCard) {
      document.title='Protected Contact Card';
      for(const id of ['contact-name','contact-role','contact-company','contact-rows','social-links','field-options','edit-fields','qr-art','qr-owner','selection-note','share-selection'])$(id).textContent='';
      $('share-link').value='';$('manual-copy').value='';$('portrait').alt='';renderPortrait({});
      return;
    }
    const name = p.name || t('fallbackName');
    $('contact-name').textContent = name; $('contact-role').textContent = p.role ? (state.lang === 'ru' && p.roleRu ? p.roleRu : p.role) : '';
    $('contact-role').hidden = !p.role; $('contact-company').textContent = p.company || ''; $('contact-company').hidden = !p.company;
    document.title = name + ' · ' + t('brand');
    $('portrait-column').hidden = !p.portrait; $('contact').classList.toggle('no-portrait',!p.portrait);
    renderPortrait(p);
    const rows = [];
    if (p.phone) rows.push(['phone', 'phone', p.phone, 'tel:' + p.phone.replace(/[^+\d]/g,'')]);
    if (p.email) rows.push(['email','mail',p.email,'mailto:' + p.email]);
    if (p.website) rows.push(['website','globe',p.website.replace(/^https:\/\//,'').replace(/\/$/,''),p.website]);
    $('contact-rows').innerHTML = rows.map(([key, symbol, value, href]) => '<div class="contact-row">' + '<span class="row-symbol">' + icon(symbol) + '</span><a class="row-body" href="' + C.html(href) + '"' + (key === 'website' ? ' target="_blank" rel="noopener noreferrer"' : '') + '><span class="row-label">' + C.html(t(key)) + '</span><span class="row-value" translate="no">' + C.html(value) + '</span></a><button class="row-copy" type="button" data-copy-field="' + key + '" aria-label="' + C.html(t('copyField') + ' ' + t(key)) + '">' + icon('copy') + '</button></div>').join('');
    $('contact-rows').hidden = rows.length === 0;
    $('social-links').innerHTML = ['telegram','whatsapp','max'].filter(k => p[k]).map(k => '<a class="social-link" target="_blank" rel="noopener noreferrer" href="' + C.html(p[k]) + '">' + icon(k === 'telegram' ? 'telegram' : 'chat') + '<span translate="no">' + t(k) + '</span></a>').join('');
    $('social-links').hidden = !$('social-links').children.length;
    $('selection-note').textContent = state.preview ? t('previewOnly') : (state.selected.size < availableFields().length ? t('selectedNote') : t('protectedNote'));
    $('owner-home').hidden = !ownerProfile || state.owner;
    $('edit-card').hidden = !state.owner;
    $('choose-fields').setAttribute('aria-label',t('chooseTitle'));
    currentLink().catch(()=>{});
  }
  async function portraitUrl(p){
    if(!p.portrait||!p.portraitKey)return '';
    if(!portraitCache.has(p.portraitKey)){
      const promise=(async()=>{
        const response=await fetch('./data/portrait.enc',{credentials:'omit',referrerPolicy:'no-referrer'});
        if(!response.ok)throw new Error('Portrait unavailable');
        const decrypted=await S.decryptPortrait(await response.arrayBuffer(),p.portraitKey);
        if(decrypted[0]!==255||decrypted[1]!==216||decrypted[2]!==255)throw new Error('Invalid portrait');
        return URL.createObjectURL(new Blob([decrypted],{type:'image/jpeg'}));
      })();
      portraitCache.set(p.portraitKey,promise);
      promise.catch(()=>portraitCache.delete(p.portraitKey));
    }
    return portraitCache.get(p.portraitKey);
  }
  async function renderPortrait(p){
    const request=++portraitRequest;
    if(!p.portrait||!p.portraitKey){$('portrait').removeAttribute('src');$('portrait-column').hidden=true;$('contact').classList.add('no-portrait');return;}
    $('portrait').alt=t('portraitDescription')+(p.name?' · '+p.name:'');
    try{
      const url=await portraitUrl(p);if(request!==portraitRequest)return;
      $('portrait').src=url;$('portrait-column').hidden=false;$('contact').classList.remove('no-portrait');
    }catch{if(request===portraitRequest){$('portrait-column').hidden=true;$('contact').classList.add('no-portrait');toast(t('portraitUnavailable'));}}
  }
  function closeDialog(id) { const dialog = id ? $(id) : currentDialog; if (dialog?.open) dialog.close(); currentDialog = null; document.body.classList.remove('dialog-open'); }
  function openDialog(id) {
    closeDialog(); currentDialog = $(id); currentDialog.showModal(); document.body.classList.add('dialog-open');
  }
  function fieldValue(key) {
    if (key === 'portrait') return t('portraitDescription');
    if (key === 'role' && state.lang === 'ru') return state.source.roleRu || state.source.role;
    if (['telegram','whatsapp'].includes(key)) {
      try { const u = new URL(state.source[key]); return '@' + u.pathname.split('/').filter(Boolean).pop(); } catch { return state.source[key]; }
    }
    if (key === 'max') return 'MAX';
    return state.source[key] || '';
  }
  function renderFields() {
    const symbols = {name:'person',role:'bag',company:'bag',phone:'phone',email:'mail',website:'globe',telegram:'telegram',whatsapp:'chat',max:'chat',portrait:'image'};
    $('field-options').innerHTML = availableFields().map(key => '<label class="field-option" for="toggle-' + key + '"><span class="row-symbol">' + icon(symbols[key]) + '</span><span class="field-text"><span class="field-name">' + C.html(t(key)) + '</span><span class="field-value" translate="no">' + C.html(key === 'name' ? fieldValue(key) + ' · ' + t('required') : fieldValue(key)) + '</span></span><span class="switch"><input id="toggle-' + key + '" type="checkbox" role="switch" data-field="' + key + '" ' + (state.draft.has(key) ? 'checked ' : '') + (key === 'name' ? 'disabled ' : '') + 'aria-label="' + C.html(t(key)) + '"><span class="switch-visual" aria-hidden="true"></span></span></label>').join('');
    updateFieldCount();
  }
  function updateFieldCount() { $('field-count').textContent = [...state.draft].filter(k=>availableFields().includes(k)).length + ' / ' + availableFields().length + ' ' + t('selected'); }
  function openFields() { state.draft = new Set(state.selected); renderFields(); openDialog('fields-dialog'); }
  function canonicalBase() {
    if (window.CONTACT_BASE_URL && /^https:\/\//.test(window.CONTACT_BASE_URL)) return window.CONTACT_BASE_URL;
    if (location.protocol === 'https:' && !/terminal\.local|localhost|127\.0\.0\.1/.test(location.hostname)) return location.href;
    return null;
  }
  async function currentLink() {
    const base=canonicalBase();if(!base||!S.available())return '';
    const p=selectedCard(),cacheKey=JSON.stringify(C.pack(p));
    if(!linkCache.has(cacheKey)){
      if(linkCache.size>50)linkCache.clear();
      const promise=S.createLink(C.pack(p),base);linkCache.set(cacheKey,promise);promise.catch(()=>linkCache.delete(cacheKey));
    }
    return linkCache.get(cacheKey);
  }
  async function copy(value) {
    try {
      if (navigator.clipboard && window.isSecureContext) { await navigator.clipboard.writeText(value); toast(t('copied')); return; }
      const el = document.createElement('textarea'); el.value = value; el.className='copy-buffer'; document.body.append(el); el.select();
      const done = document.execCommand('copy'); el.remove(); if (done) { toast(t('copied')); return; }
    } catch { /* Show a selectable fallback when clipboard access is unavailable. */ }
    $('manual-copy').value = value; openDialog('message-dialog'); $('manual-copy').select();
  }
  function downloadBlob(blob, name) {
    const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = name; document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),60000);
  }
  const fileName = suffix => (selectedCard().name || 'Contact').replace(/[^\p{L}\p{N} ._-]/gu,'').trim().replace(/\s+/g,'-') + suffix;
  function exportVcard(openContact = false) {
    const blob = new Blob([C.vcard(selectedCard(),state.lang)],{type:'text/vcard;charset=utf-8'});
    if (openContact && /iPhone|iPad|iPod/.test(navigator.userAgent)) {
      const url = URL.createObjectURL(blob), a = document.createElement('a'); a.href = url; a.download = fileName('.vcf'); document.body.append(a); a.click(); a.remove(); setTimeout(()=>URL.revokeObjectURL(url),60000);
    } else downloadBlob(blob,fileName('.vcf'));
    toast(t('downloaded'));
  }
  async function renderQr() {
    const request=++qrRequest,mode=state.qrMode;
    state.qr=null;$('qr-art').textContent=t('preparing');
    for(const id of ['qr-png','qr-svg','qr-copy'])$(id).disabled=true;
    document.querySelectorAll('[data-qr-mode]').forEach(el => el.setAttribute('aria-pressed',String(el.dataset.qrMode === state.qrMode)));
    let data='';try{data=mode==='offline'?C.vcard(selectedCard(),state.lang,{compact:true}):await currentLink();}catch{data='';}
    if(request!==qrRequest||mode!==state.qrMode)return;
    $('qr-owner').textContent = selectedCard().name || t('fallbackName');
    $('qr-description').textContent = state.qrMode === 'web' ? t('webDescription') : t('offlineDescription');
    $('qr-copy').innerHTML = icon(state.qrMode === 'web' ? 'link' : 'copy') + '<span>' + t(state.qrMode === 'web' ? 'copyLink' : 'offlineQrCopy') + '</span>';
    if (!data) { state.qr = null; $('qr-art').textContent = t('webUnavailable'); $('qr-description').textContent = ''; }
    else {
      try {
        qrcode.stringToBytes = qrcode.stringToBytesFuncs['UTF-8']; const qr = qrcode(0,'M'); qr.addData(data); qr.make(); state.qr = qr;
        $('qr-art').innerHTML = qr.createSvgTag({cellSize:4,margin:16,scalable:true,alt:{text:state.qrMode === 'web' ? t('webCard') : t('offlineContact'),id:'qr-alt'}});
      } catch { state.qr = null; $('qr-art').textContent = t('downloadError'); }
    }
    for (const id of ['qr-png','qr-svg','qr-copy']) $(id).disabled = !state.qr;
  }
  function downloadQr(format) {
    if (!state.qr) return;
    const kind = state.qrMode === 'web' ? '-Web-QR' : '-Offline-QR';
    if (format === 'svg') downloadBlob(new Blob([state.qr.createSvgTag({cellSize:10,margin:40,scalable:true})],{type:'image/svg+xml'}),fileName(kind+'.svg'));
    else {
      const qr = state.qr, modules=qr.getModuleCount(), cell=Math.max(8,Math.ceil(1600/(modules+8))),size=(modules+8)*cell;
      const canvas=document.createElement('canvas'); canvas.width=canvas.height=size; const ctx=canvas.getContext('2d'); ctx.fillStyle='#fff';ctx.fillRect(0,0,size,size);ctx.fillStyle='#000';
      for(let r=0;r<modules;r++) for(let c=0;c<modules;c++) if(qr.isDark(r,c)) ctx.fillRect((c+4)*cell,(r+4)*cell,cell,cell);
      canvas.toBlob(blob=>{ if(blob) downloadBlob(blob,fileName(kind+'.png')); },'image/png');
    }
  }
  async function openShare() {
    let link='';try{link=await currentLink();}catch{toast(t('cryptoUnavailable'));return;}if(!link){toast(S.available()?t('localShare'):t('cryptoUnavailable'));return;}
    $('share-link').value=link; $('share-selection').textContent=C.FIELDS.filter(k=>selectedCard()[k]).length+' '+t('countSuffix');
    $('native-share').hidden = !navigator.share; openDialog('share-dialog');
  }
  function openEdit() {
    closeDialog(); const p = ownerProfile || {};
    const types={phone:'tel',email:'email',website:'url',telegram:'url',whatsapp:'url',max:'url'};
    $('edit-fields').innerHTML = ['name','role','roleRu','company','phone','email','website','telegram','whatsapp','max'].map(key=>'<label for="edit-'+key+'"><span>'+C.html(t(key))+'</span><input id="edit-'+key+'" name="'+key+'" type="'+(types[key]||'text')+'" value="'+C.html(p[key])+'" maxlength="'+(['website','telegram','whatsapp','max'].includes(key)?600:160)+'" autocomplete="'+({name:'name',company:'organization',phone:'tel',email:'email'}[key]||'off')+'" spellcheck="false"'+(key==='name'?' required':'')+'></label>').join('');
    $('edit-error').textContent=''; openDialog('edit-dialog');
  }
  async function exportOfflineHtml() {
    const p = selectedCard(); let photo='';
    if (p.portrait) {
      try {
        const url=await portraitUrl(p);
        if(url){const res=await fetch(url);photo=await new Promise((resolve,reject)=>{const reader=new FileReader();reader.onload=()=>resolve(reader.result);reader.onerror=reject;res.blob().then(b=>reader.readAsDataURL(b));});}
      } catch { /* The contact data is still exported if the image is unavailable. */ }
    }
    const h=C.html, data = C.plainText(p,state.lang), vcf='data:text/vcard;charset=utf-8,'+encodeURIComponent(C.vcard(p,state.lang));
    const doc='<!doctype html><html lang="'+state.lang+'"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><meta name="referrer" content="no-referrer"><title>'+h(p.name||t('fallbackName'))+'</title><style>body{font-family:-apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;background:#f6f6f5;color:#202123;margin:0;padding:34px 23px}main{max-width:420px;margin:auto}img{display:block;width:190px;height:245px;object-fit:cover;object-position:top;margin:0 auto 28px;border-radius:8px 8px 100px 100px}h1{font-size:35px;letter-spacing:-.04em;line-height:1.1;text-align:center}pre{font:14px/1.9 -apple-system,BlinkMacSystemFont,"Segoe UI",Arial,sans-serif;white-space:pre-wrap;overflow-wrap:anywhere;padding:25px 0;border-top:1px solid #ddd}a{display:block;padding:15px;background:#202123;color:white;text-decoration:none;text-align:center;border-radius:40px;font-size:14px;font-weight:600}p{font-size:11px;color:#777;text-align:center;margin-top:22px}</style></head><body><main>'+(photo?'<img src="'+h(photo)+'" alt="'+h(t('portraitDescription'))+'" width="190" height="245">':'')+'<h1>'+h(p.name||t('fallbackName'))+'</h1><pre>'+h(data)+'</pre><a download="'+h(fileName('.vcf'))+'" href="'+h(vcf)+'">'+h(t('saveContact'))+'</a><p>'+h(t('saveHint'))+'</p></main></body></html>';
    downloadBlob(new Blob([doc],{type:'text/html;charset=utf-8'}),fileName('-Offline-Card.html'));
  }
  async function loadInitialState() {
    const request=++loadRequest,sourceHash=location.hash;
    closeDialog();state.source=null;state.owner=false;state.shared=false;state.qr=null;++qrRequest;
    linkCache.clear();for(const promise of portraitCache.values())promise.then(url=>URL.revokeObjectURL(url)).catch(()=>{});portraitCache.clear();render();
    const stored = safeStorageRead('protected-contact-owner-v2');
    if (stored) try { ownerProfile=C.normalize(JSON.parse(stored)); } catch { /* Ignore broken device-local state. */ }
    try {
      if(sourceHash){
        if(!S.available())throw new Error('Crypto unavailable');
        const opened=await S.openHash(sourceHash),profile=C.unpack(opened.packed);
        if(request!==loadRequest||location.hash!==sourceHash)return;
        if(opened.owner){
          ownerProfile=profile;state.source=profile;state.owner=true;
          if(!safeStorageWrite('protected-contact-owner-v2',JSON.stringify(ownerProfile)))toast(t('storageUnavailable'));
          history.replaceState(null,'',location.pathname+location.search);
        }else{state.source=profile;state.shared=true;}
      }
      else if(ownerProfile?.name) { state.source=ownerProfile;state.owner=true; }
    } catch { if(request!==loadRequest||location.hash!==sourceHash)return;state.source=null;state.owner=false;toast(S.available()?t('invalidLink'):t('cryptoUnavailable')); }
    if(request!==loadRequest)return;
    state.selected=new Set(state.source?availableFields():C.FIELDS);
    if(state.owner&&!state.preview) { const saved=safeStorageRead('protected-contact-selection-v2'); if(saved) try{const parsed=JSON.parse(saved); if(Array.isArray(parsed))state.selected=new Set(parsed.filter(k=>availableFields().includes(k)));if(state.source.name)state.selected.add('name');}catch{} }
  }
  window.addEventListener('hashchange',()=>loadInitialState().then(render));
  document.querySelectorAll('[data-lang]').forEach(el=>el.addEventListener('click',()=>setLanguage(el.dataset.lang)));
  document.querySelectorAll('[data-close]').forEach(el=>el.addEventListener('click',()=>closeDialog()));
  document.querySelectorAll('dialog').forEach(dialog=>{dialog.addEventListener('close',()=>document.body.classList.remove('dialog-open'));dialog.addEventListener('click',event=>{if(event.target===dialog){const r=dialog.getBoundingClientRect();if(event.clientX<r.left||event.clientX>r.right||event.clientY<r.top||event.clientY>r.bottom)closeDialog();}});});
  $('theme-button').addEventListener('click',()=>setTheme(state.theme==='light'?'dark':'light'));
  $('new-card').addEventListener('click',()=>{$('unlock-link').value='';$('unlock-error').textContent='';openDialog('unlock-dialog');});
  document.querySelector('.skip').addEventListener('click',e=>{e.preventDefault();$('main').focus();$('main').scrollIntoView();});
  $('unlock-form').addEventListener('submit',async e=>{e.preventDefault();const input=$('unlock-link').value.trim();let hash='';try{hash=input.startsWith('#')?input:new URL(input).hash;S.parseHash(hash);if(!S.available())throw new Error('HTTPS required');const opened=await S.openHash(hash);C.unpack(opened.packed);history.replaceState(null,'',location.pathname+location.search+hash);closeDialog();await loadInitialState();render();}catch{$('unlock-error').textContent=S.available()?t('invalidLink'):t('cryptoUnavailable');}});
  $('save-contact').addEventListener('click',()=>exportVcard(true));
  $('download-menu').addEventListener('click',()=>openDialog('download-dialog'));
  $('download-vcf').addEventListener('click',()=>exportVcard());
  $('download-text').addEventListener('click',()=>downloadBlob(new Blob([C.plainText(selectedCard(),state.lang)],{type:'text/plain;charset=utf-8'}),fileName('.txt')));
  $('download-html').addEventListener('click',async()=>{try{await exportOfflineHtml();}catch{toast(t('downloadError'));}});
  $('print-card').addEventListener('click',()=>{closeDialog();window.print();});
  $('copy-details').addEventListener('click',()=>copy(C.plainText(selectedCard(),state.lang)));
  $('contact-rows').addEventListener('click',e=>{const button=e.target.closest('[data-copy-field]');if(button)copy(selectedCard()[button.dataset.copyField]||'');});
  $('choose-fields').addEventListener('click',openFields);
  $('field-options').addEventListener('change',e=>{if(!e.target.dataset.field)return;e.target.checked?state.draft.add(e.target.dataset.field):state.draft.delete(e.target.dataset.field);updateFieldCount();});
  document.querySelectorAll('[data-preset]').forEach(el=>el.addEventListener('click',()=>{const preset=el.dataset.preset;const fields=preset==='all'?availableFields():preset==='business'?['name','role','company','email','website','portrait']:['name','email','telegram'];state.draft=new Set(fields.filter(k=>availableFields().includes(k)));if(state.source.name)state.draft.add('name');renderFields();}));
  $('apply-fields').addEventListener('click',async()=>{state.selected=new Set(state.draft);if(state.owner)safeStorageWrite('protected-contact-selection-v2',JSON.stringify([...state.selected]));render();closeDialog();try{const link=await currentLink();if(link)history.replaceState(null,'',location.pathname+location.search+new URL(link).hash);}catch{toast(t('cryptoUnavailable'));}});
  $('edit-card').addEventListener('click',openEdit);
  $('show-qr').addEventListener('click',()=>{state.qrMode=canonicalBase()?'web':'offline';renderQr();openDialog('qr-dialog');});
  document.querySelectorAll('[data-qr-mode]').forEach(el=>el.addEventListener('click',()=>{state.qrMode=el.dataset.qrMode;renderQr();}));
  $('qr-svg').addEventListener('click',()=>downloadQr('svg'));$('qr-png').addEventListener('click',()=>downloadQr('png'));
  $('qr-copy').addEventListener('click',async()=>{try{copy(state.qrMode==='web'?await currentLink():C.vcard(selectedCard(),state.lang,{compact:true}));}catch{toast(t('cryptoUnavailable'));}});
  $('share-card').addEventListener('click',openShare);
  $('copy-share-link').addEventListener('click',()=>copy($('share-link').value));
  $('native-share').addEventListener('click',async()=>{if(!navigator.share)return;try{const url=$('share-link').value;if(url)await navigator.share({title:selectedCard().name||'Contact',url});}catch(error){if(error.name!=='AbortError')copy($('share-link').value);}});
  $('owner-home').addEventListener('click',()=>{state.source=ownerProfile;state.owner=true;state.shared=false;state.selected=new Set(availableFields());history.replaceState(null,'',location.pathname+location.search);render();});
  $('edit-form').addEventListener('submit',e=>{
    e.preventDefault();const values=Object.fromEntries(new FormData(e.currentTarget));const p=C.normalize({...values,portrait:ownerProfile?.portrait||false,portraitKey:ownerProfile?.portraitKey||''});
    let error='',field='';if(!p.name){error=t('nameRequired');field='name';}else if(values.email&&!p.email){error=t('emailInvalid');field='email';}else for(const k of ['website','telegram','whatsapp','max'])if(values[k]&&!p[k]){error=t('urlInvalid');field=k;break;}
    if(error){$('edit-error').textContent=error;$('edit-'+field).focus();return;}
    ownerProfile=p;state.source=p;state.owner=true;state.shared=false;state.selected=new Set(availableFields());
    if(!safeStorageWrite('protected-contact-owner-v2',JSON.stringify(p)))toast(t('storageUnavailable'));else toast(t('saved'));
    safeStorageWrite('protected-contact-selection-v2',JSON.stringify([...state.selected]));closeDialog();render();
  });
  setIcons();setTheme(safeStorageRead('contact-theme-v1')||'light');setLanguage('en');loadInitialState().then(()=>setLanguage('en'));
  if(location.protocol!=='file:'&&'serviceWorker'in navigator&&!state.preview)navigator.serviceWorker.register('./sw.js').catch(()=>{});
})();
