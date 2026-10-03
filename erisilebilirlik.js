/*!
 * Erişilebilirlik Menüsü — bağımsız, bağımlılıksız (jQuery/Vue gerekmez)
 * Kullanım:
 *   <script src="/_Resources/js/erisilebilirlik.js" defer
 *           data-color="#1d4f91"      (ana renk, isteğe bağlı)
 *           data-position="right"     (right | left)
 *           data-offset="20"          (kenardan uzaklık, px)
 *           data-content="main, #content, .content, article"   (sesli okunacak alan)
 *           data-skip="nav, .navbar, #menu, footer">   (okunmayacak alanlar; ardından script etiketi kapatılır)
 */
(function () {
  'use strict';
  if (window.__vabA11yLoaded) return;
  window.__vabA11yLoaded = true;

  /* ------------------------------------------------------------------ ayarlar */
  var scriptEl = document.currentScript;
  function attr(name, def) {
    var v = scriptEl && scriptEl.getAttribute(name);
    return v ? v : def;
  }
  var CFG = {
    color: attr('data-color', '#1d4f91'),
    position: attr('data-position', 'right') === 'left' ? 'left' : 'right',
    offset: parseInt(attr('data-offset', '20'), 10) || 20,
    content: attr('data-content', 'main, [role="main"], #content, .content, article'),
    skip: attr('data-skip', 'nav, [role="navigation"], .navbar, #menu, .menu, .dikeyMenu, footer, [aria-hidden="true"], script, style, noscript')
  };

  var KEY = 'vab-a11y-v1';
  var HOST_ID = 'vab-host';
  var html = document.documentElement;
  var LANG = /^en/i.test(html.lang || '') ? 'en' : 'tr';

  var T = {
    tr: {
      open: 'Erişilebilirlik menüsünü aç', title: 'Erişilebilirlik', close: 'Kapat',
      speech: 'Sesli okuma', play: 'Oku', resume: 'Devam', pause: 'Duraklat', stop: 'Durdur',
      rate: 'Hız', clickRead: 'Dokunduğum yerden oku',
      clickReadHint: 'Açıkken bir paragrafa dokunun; okuma oradan başlar ve devam eder. Bu sırada bağlantılar açılmaz.',
      hoverRead: 'Üzerine gelince oku',
      needClick: 'Sesli okumayı başlatmak için sayfada bir kez tıklayın.',
      hoverReadHint: 'Açıkken fareyi bir metnin, bağlantının ya da görselin üzerinde kısa bir süre tutun; o kısım okunur. Tarayıcılar her yeni sayfada ilk okumadan önce bir tıklama ister.',
      prev: 'Önceki paragraf', next: 'Sonraki paragraf', jump: 'Bölüme git', para: 'Paragraf',
      noHeadings: 'Bu sayfada başlık bulunamadı.', player: 'Sesli okuma kontrolleri',
      noSpeech: 'Tarayıcınız sesli okumayı desteklemiyor.',
      text: 'Metin', size: 'Metin boyutu', smaller: 'Metni küçült', bigger: 'Metni büyüt',
      ls: 'Harf aralığı', lh: 'Satır aralığı', ws: 'Kelime aralığı', font: 'Okunaklı yazı',
      links: 'Bağlantıları vurgula', align: 'Hizalama',
      alignVals: ['Varsayılan', 'Sola', 'Ortala', 'Sağa'],
      color: 'Renk ve kontrast', invert: 'Ters renk', hc: 'Yüksek kontrast', gray: 'Gri ton',
      aids: 'Okuma yardımcıları', guide: 'Okuma kılavuzu', mask: 'Okuma maskesi',
      cursor: 'Büyük imleç', noanim: 'Animasyonları durdur',
      reset: 'Tüm ayarları sıfırla', resetDone: 'Ayarlar sıfırlandı', on: 'açık', off: 'kapalı',
      nothing: 'Okunacak metin bulunamadı'
    },
    en: {
      open: 'Open accessibility menu', title: 'Accessibility', close: 'Close',
      speech: 'Text to speech', play: 'Read', resume: 'Resume', pause: 'Pause', stop: 'Stop',
      rate: 'Speed', clickRead: 'Read from where I tap',
      clickReadHint: 'While on, tap a paragraph to start reading from there. Links are not followed meanwhile.',
      hoverRead: 'Read on hover',
      needClick: 'Click once anywhere on the page to enable reading aloud.',
      hoverReadHint: 'While on, rest the mouse on a text, link or image for a moment to hear it. Browsers require one click on each new page before the first reading.',
      prev: 'Previous paragraph', next: 'Next paragraph', jump: 'Jump to section', para: 'Paragraph',
      noHeadings: 'No headings found on this page.', player: 'Reading controls',
      noSpeech: 'Your browser does not support text to speech.',
      text: 'Text', size: 'Text size', smaller: 'Decrease text size', bigger: 'Increase text size',
      ls: 'Letter spacing', lh: 'Line height', ws: 'Word spacing', font: 'Readable font',
      links: 'Highlight links', align: 'Alignment',
      alignVals: ['Default', 'Left', 'Center', 'Right'],
      color: 'Color & contrast', invert: 'Invert colors', hc: 'High contrast', gray: 'Grayscale',
      aids: 'Reading aids', guide: 'Reading guide', mask: 'Reading mask',
      cursor: 'Big cursor', noanim: 'Stop animations',
      reset: 'Reset all settings', resetDone: 'Settings reset', on: 'on', off: 'off',
      nothing: 'No text found to read'
    }
  }[LANG];

  /* ------------------------------------------------------------------ durum */
  var DEFAULTS = {
    fs: 0, ls: false, lh: false, ws: false, font: false, links: false, align: 0,
    invert: false, hc: false, gray: false, guide: false, mask: false, cursor: false,
    noanim: false, rate: 1, clickRead: false, hoverRead: false
  };
  var FS = [1, 1.15, 1.3, 1.5, 1.75];
  var CLASS = {
    ls: 'vab-ls', lh: 'vab-lh', ws: 'vab-ws', font: 'vab-font', links: 'vab-links',
    invert: 'vab-invert', hc: 'vab-hc', gray: 'vab-gray', cursor: 'vab-cursor', noanim: 'vab-noanim',
    clickRead: 'vab-clickread', hoverRead: 'vab-hoverread'
  };
  var ALIGN = ['', 'vab-al-left', 'vab-al-center', 'vab-al-right'];

  function loadState() {
    var saved = {};
    try { saved = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { saved = {}; }
    var s = {};
    for (var k in DEFAULTS) {
      s[k] = (k in saved && typeof saved[k] === typeof DEFAULTS[k]) ? saved[k] : DEFAULTS[k];
    }
    s.clickRead = false; // her açılışta kapalı başlasın
    if (!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches)) s.hoverRead = false;
    s.fs = Math.max(0, Math.min(FS.length - 1, s.fs | 0));
    s.align = Math.max(0, Math.min(3, s.align | 0));
    s.rate = Math.max(0.5, Math.min(2, Number(s.rate) || 1));
    return s;
  }
  function saveState() {
    try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* gizli mod vb. */ }
  }
  var state = loadState();

  /* ------------------------------------------------------------------ sayfaya uygulanan CSS */
  var P = 'body > :not(#' + HOST_ID + ')';
  var TEXT = 'p,li,dd,dt,td,th,blockquote,figcaption,label,h1,h2,h3,h4,h5,h6';
  function all(c) { return 'html.' + c + ' ' + P + ',html.' + c + ' ' + P + ' *'; }
  function textEls(c) { return 'html.' + c + ' ' + P + ' :is(' + TEXT + '),html.' + c + ' ' + P + ':is(' + TEXT + ')'; }

  var cursorSvg = "<svg xmlns='http://www.w3.org/2000/svg' width='48' height='48' viewBox='0 0 24 24'>" +
    "<path d='M4 2l15 11-6.6 1.1 3.9 7.3-3 1.6-3.9-7.4L4 20z' fill='black' stroke='white' stroke-width='1.3' stroke-linejoin='round'/></svg>";
  var ICON_SKIP = ':not(i):not(.fa):not([class*="fa-"]):not(.glyphicon):not([class*="glyphicon-"])';

  var PAGE_CSS = [
    all('vab-ls') + '{letter-spacing:.12em!important}',
    all('vab-ws') + '{word-spacing:.16em!important}',
    textEls('vab-lh') + '{line-height:1.9!important}',
    'html.vab-font ' + P + ICON_SKIP + ',html.vab-font ' + P + ' *' + ICON_SKIP +
      '{font-family:Verdana,Tahoma,"Segoe UI",Arial,sans-serif!important}',
    'html.vab-links ' + P + ' a{text-decoration:underline!important;text-decoration-thickness:2px!important;' +
      'text-underline-offset:3px!important;outline:2px dashed currentColor!important;outline-offset:2px!important}',
    all('vab-al-left') + '{text-align:left!important}',
    all('vab-al-center') + '{text-align:center!important}',
    all('vab-al-right') + '{text-align:right!important}',
    // Ters renk ve gri ton birlikte çalışabilsin diye filtreler değişkenle birleştiriliyor
    'html.vab-invert,html.vab-gray{filter:var(--vab-inv,) var(--vab-gs,)}',
    'html.vab-invert{--vab-inv:invert(1) hue-rotate(180deg);background-color:#fff}',
    'html.vab-gray{--vab-gs:grayscale(1)}',
    // Fotoğraflar ve menünün kendisi ters çevrilmesin
    'html.vab-invert :is(img,video,iframe,canvas,object,embed),html.vab-invert #' + HOST_ID +
      '{filter:invert(1) hue-rotate(180deg)}',
    // Yüksek kontrast (siyah zemin, beyaz metin, sarı bağlantı)
    'html.vab-hc,html.vab-hc body,' + all('vab-hc') +
      '{background-color:#000!important;background-image:none!important;color:#fff!important;' +
      'border-color:#fff!important;box-shadow:none!important;text-shadow:none!important}',
    'html.vab-hc ' + P + ' a,html.vab-hc ' + P + ' a *{color:#ffeb3b!important}',
    'html.vab-hc ' + P + ' :is(button,input,select,textarea){border:2px solid #fff!important}',
    'html.vab-hc ' + P + ' :is(img,svg,video){background-color:transparent!important}',
    'html.vab-cursor,html.vab-cursor *{cursor:url("data:image/svg+xml,' + encodeURIComponent(cursorSvg) +
      '") 8 4,auto!important}',
    'html.vab-noanim *,html.vab-noanim *::before,html.vab-noanim *::after{animation-duration:0s!important;' +
      'animation-delay:0s!important;animation-iteration-count:1!important;transition-duration:0s!important;' +
      'transition-delay:0s!important;scroll-behavior:auto!important}',
    'html.vab-clickread ' + P + ' :is(' + TEXT + ',a){cursor:help}',
    'html.vab-hoverread ' + P + ' :is(' + TEXT + ',a,button,img[alt]):hover{outline:2px dotted #d99a00!important;outline-offset:2px!important}',
    '.vab-reading{outline:3px solid #ffbf00!important;outline-offset:2px!important;' +
      'background-color:rgba(255,235,59,.35)!important}'
  ].join('\n');

  function injectPageCss() {
    if (document.getElementById('vab-style')) return;
    var st = document.createElement('style');
    st.id = 'vab-style';
    st.textContent = PAGE_CSS;
    (document.head || html).appendChild(st);
  }

  /* ------------------------------------------------------------------ metin boyutu */
  // px tabanlı CSS'lerde (Bootstrap 3 gibi) rem ölçekleme işe yaramadığı için her öğenin
  // orijinal boyutu bir kez ölçülüp çarpanla yeniden yazılıyor; sıfırlanınca eski hali geri konuyor.
  var appliedFs = 0;
  var fontReady = false;
  function applyFontSize() {
    if (!document.body) return;
    var f = FS[state.fs] || 1;
    if (f === 1 && appliedFs === 0) return;
    var nodes = document.body.getElementsByTagName('*');
    var list = [], i, el;
    for (i = 0; i < nodes.length; i++) {
      el = nodes[i];
      if (el.id === HOST_ID || el.namespaceURI !== 'http://www.w3.org/1999/xhtml') continue;
      if (/^(SCRIPT|STYLE|NOSCRIPT|TEMPLATE|IMG|VIDEO|IFRAME|CANVAS|BR|HR)$/.test(el.tagName)) continue;
      list.push(el);
    }
    // 1. geçiş: henüz ölçülmemiş öğelerin orijinal boyutunu kaydet (hiçbir şeyi değiştirmeden)
    if (f !== 1) {
      for (i = 0; i < list.length; i++) {
        el = list[i];
        if (!el.hasAttribute('data-vab-fs')) {
          el.setAttribute('data-vab-fs', parseFloat(getComputedStyle(el).fontSize) || 0);
          el.setAttribute('data-vab-fs0', el.style.getPropertyValue('font-size') + '|' +
            el.style.getPropertyPriority('font-size'));
        }
      }
    }
    // 2. geçiş: uygula ya da geri al
    for (i = 0; i < list.length; i++) {
      el = list[i];
      var base = el.getAttribute('data-vab-fs');
      if (base === null) continue;
      if (f === 1) {
        var orig = (el.getAttribute('data-vab-fs0') || '|').split('|');
        el.style.removeProperty('font-size');
        if (orig[0]) el.style.setProperty('font-size', orig[0], orig[1]);
        el.removeAttribute('data-vab-fs');
        el.removeAttribute('data-vab-fs0');
      } else {
        el.style.setProperty('font-size', (parseFloat(base) * f).toFixed(2) + 'px', 'important');
      }
    }
    appliedFs = state.fs;
  }

  /* ------------------------------------------------------------------ sesli okuma */
  var synth = ('speechSynthesis' in window) ? window.speechSynthesis : null;
  var speech = { chunks: [], starts: [], i: 0, token: 0, active: false, paused: false, el: null };
  var jumpChunks = [];

  function isVisible(el) {
    return !!(el.offsetWidth || el.offsetHeight || el.getClientRects().length);
  }
  function splitText(text) {
    var parts = text.match(/[^.!?…]+[.!?…]*["'”’)]*\s*/g) || [text];
    var out = [], buf = '';
    for (var i = 0; i < parts.length; i++) {
      if (buf && (buf + parts[i]).length > 220) { out.push(buf.trim()); buf = ''; }
      buf += parts[i];
    }
    if (buf.trim()) out.push(buf.trim());
    return out;
  }
  function chunksFromBlock(el, text) {
    return splitText(text).map(function (t) { return { text: t, el: el }; });
  }
  function collectPageChunks() {
    var scope = null;
    try { scope = document.querySelector(CFG.content); } catch (e) { scope = null; }
    if (!scope) scope = document.body;

    var out = [];
    var nodes = scope.querySelectorAll(TEXT);
    for (var i = 0; i < nodes.length; i++) {
      var n = nodes[i];
      try { if (n.closest(CFG.skip)) continue; } catch (e) { /* geçersiz seçici */ }
      if (scope === document.body && n.closest('header')) continue;
      if (!isVisible(n) || n.querySelector(TEXT)) continue;
      var t;
      if (/^T[DH]$/.test(n.tagName) && n.closest('tr')) {
        // Tablolar satır satır okunur: hücreler virgülle birleştirilir
        var row = n.closest('tr');
        if (out.length && out[out.length - 1].el === row) continue;
        var cells = row.querySelectorAll('td,th'), parts = [];
        for (var c = 0; c < cells.length; c++) {
          var ct = (cells[c].innerText || '').replace(/\s+/g, ' ').trim();
          if (ct) parts.push(ct);
        }
        n = row;
        t = parts.join(', ');
      } else {
        t = (n.innerText || '').replace(/\s+/g, ' ').trim();
      }
      if (t.length < 2) continue;
      out = out.concat(chunksFromBlock(n, t));
    }
    if (!out.length) {
      var raw = (scope.innerText || '').replace(/\s+/g, ' ').trim();
      if (raw) out = chunksFromBlock(null, raw);
    }
    return out;
  }
  function pickVoice() {
    var want = LANG === 'en' ? 'en' : 'tr';
    var voices = synth.getVoices() || [];
    for (var i = 0; i < voices.length; i++) {
      if ((voices[i].lang || '').toLowerCase().indexOf(want) === 0) return voices[i];
    }
    return null;
  }
  function clearHighlight() {
    if (speech.el) { speech.el.classList.remove('vab-reading'); speech.el = null; }
  }
  function speakNext(tok) {
    if (tok !== speech.token) return;
    clearHighlight();
    if (speech.i >= speech.chunks.length) { stopSpeech(); return; }
    var c = speech.chunks[speech.i];
    var u = new SpeechSynthesisUtterance(c.text);
    u.lang = LANG === 'en' ? 'en-US' : 'tr-TR';
    var v = pickVoice();
    if (v) u.voice = v;
    u.rate = state.rate;
    u.onend = function () {
      if (tok !== speech.token) return;
      speech.i++;
      speakNext(tok);
    };
    u.onerror = function (e) {
      if (tok !== speech.token || e.error === 'interrupted' || e.error === 'canceled') return;
      if (e.error === 'not-allowed') {
        if (state.hoverRead && c.el) hover.pending = c.el;
        stopSpeech();
        showToast(T.needClick);
        return;
      }
      speech.i++;
      speakNext(tok);
    };
    if (c.el && document.contains(c.el)) {
      c.el.classList.add('vab-reading');
      speech.el = c.el;
      var r = c.el.getBoundingClientRect();
      if (r.top < 0 || r.bottom > window.innerHeight) {
        c.el.scrollIntoView({ block: 'center', behavior: state.noanim ? 'auto' : 'smooth' });
      }
    }
    speech.utt = u; // Chrome, referansı tutulmayan okumayı yarıda kesebiliyor
    synth.speak(u);
    syncUI();
  }
  function speakFrom(i) {
    if (!synth || !speech.chunks.length) return;
    var tok = ++speech.token;
    var busy = synth.speaking || synth.pending || synth.paused;
    if (synth.paused) synth.resume(); // iOS duraklatılmış motorda yeni okumayı başlatmaz
    if (busy) synth.cancel();
    speech.i = i;
    speech.active = true;
    speech.paused = false;
    syncUI();
    // iOS Safari ilk okumayı yalnızca dokunuşla aynı anda başlatır, bu yüzden boşta ise hemen konuş.
    // Chrome ise cancel()'dan hemen sonra gelen speak()'i bazen yutar; o durumda kısa gecikme ver.
    if (busy) setTimeout(function () { speakNext(tok); }, 60);
    else speakNext(tok);
  }
  // Parçaları ayarla ve her paragrafın ilk parçasının sırasını hesapla (önceki/sonraki için)
  function setChunks(list) {
    speech.chunks = list;
    speech.starts = [];
    for (var i = 0; i < list.length; i++) {
      if (i === 0 || !list[i].el || list[i].el !== list[i - 1].el) speech.starts.push(i);
    }
  }
  function blockIndexOf(i) {
    var b = 0;
    for (var k = 0; k < speech.starts.length; k++) { if (speech.starts[k] <= i) b = k; else break; }
    return b;
  }
  function startPageReading(fromIndex) {
    setChunks(collectPageChunks());
    if (!speech.chunks.length) { announce(T.nothing); return false; }
    speakFrom(fromIndex || 0);
    return true;
  }
  function playSpeech() {
    if (!synth) return;
    if (speech.active && speech.paused) {
      synth.resume();
      speech.paused = false;
      syncUI();
      return;
    }
    var sel = String(window.getSelection ? window.getSelection() : '').trim();
    if (sel) { setChunks(chunksFromBlock(null, sel)); speakFrom(0); return; }
    startPageReading(0);
  }
  function togglePlay() {
    if (speech.active && !speech.paused) pauseSpeech();
    else playSpeech();
  }
  function goBlock(dir) {
    if (!synth) return;
    if (!speech.active || !speech.chunks.length) { startPageReading(0); return; }
    var b = blockIndexOf(speech.i) + dir;
    if (b < 0) b = 0;
    if (b >= speech.starts.length) { stopSpeech(); return; }
    speakFrom(speech.starts[b]);
  }
  function buildJumpList() {
    if (!ui.jump) return;
    jumpChunks = collectPageChunks();
    var out = '', seen = 0;
    for (var i = 0; i < jumpChunks.length; i++) {
      var el = jumpChunks[i].el;
      if (!el || !/^H[1-4]$/.test(el.tagName) || (i > 0 && jumpChunks[i - 1].el === el)) continue;
      var label = (el.innerText || '').replace(/\s+/g, ' ').trim().replace(/[<>&"]/g, function (ch) {
        return { '<': '&lt;', '>': '&gt;', '&': '&amp;', '"': '&quot;' }[ch];
      });
      out += '<li><button type="button" data-act="jump" data-idx="' + i + '" class="lvl' + el.tagName.charAt(1) +
        '">' + label + '</button></li>';
      seen++;
    }
    ui.jump.innerHTML = seen ? out : '<li class="empty">' + T.noHeadings + '</li>';
  }
  function pauseSpeech() {
    if (!synth || !speech.active) return;
    synth.pause();
    speech.paused = true;
    syncUI();
  }
  function stopSpeech() {
    speech.token++;
    if (synth) synth.cancel();
    speech.active = false;
    speech.paused = false;
    clearHighlight();
    syncUI();
  }
  function onDocClickRead(e) {
    if (!state.clickRead || !synth) return;
    var path = e.composedPath ? e.composedPath() : [];
    if (host && path.indexOf(host) > -1) return;
    var t = e.target;
    if (!t || !t.closest || t.closest('input,select,textarea,[contenteditable="true"]')) return;
    var block = t.closest(TEXT) || t.closest('a,button') || t;
    var text = (block.innerText || '').replace(/\s+/g, ' ').trim();
    if (!text) return;
    if (t.closest('a')) e.preventDefault();
    // Dokunulan paragrafı sayfa akışında bul; bulunursa oradan devam ederek oku
    var page = collectPageChunks();
    for (var i = 0; i < page.length; i++) {
      var el = page[i].el;
      if (el && (el === block || el.contains(block) || block.contains(el))) {
        setChunks(page);
        speakFrom(i);
        return;
      }
    }
    setChunks(chunksFromBlock(block, text));
    speakFrom(0);
  }

  /* ------------------------------------------------------------------ üzerine gelince oku */
  var canHover = !!(window.matchMedia && window.matchMedia('(hover: hover) and (pointer: fine)').matches);
  var hover = { el: null, timer: null, lastRead: null, pending: null };
  function pageActivated() {
    // Tarayıcı, sayfada bir tıklama/tuş olmadan sesli okumaya izin vermez
    return !(navigator.userActivation && !navigator.userActivation.hasBeenActive);
  }
  function readHoverEl(el) {
    var text = hoverText(el);
    if (!text) return;
    hover.lastRead = el;
    setChunks(chunksFromBlock(el.tagName === 'IMG' ? null : el, text));
    speakFrom(0);
  }
  function onFirstGesture(e) {
    if (!hover.pending) return;
    var path = e.composedPath ? e.composedPath() : [];
    if (host && path.indexOf(host) > -1) return;
    var el = hover.pending;
    hover.pending = null;
    hideToast();
    if (state.hoverRead && document.contains(el)) readHoverEl(el); // tıklama anında, izin varken oku
  }
  function hoverTarget(t) {
    if (!t || !t.closest) return null;
    var el = t.closest(TEXT + ',a,button,img[alt],[aria-label]');
    if (!el || el === document.body || el === html) return null;
    return el;
  }
  function hoverText(el) {
    if (el.tagName === 'IMG') return (el.getAttribute('alt') || '').trim();
    var t = (el.innerText || '').replace(/\s+/g, ' ').trim();
    if (!t) t = (el.getAttribute('aria-label') || el.getAttribute('title') || '').trim();
    return t;
  }
  function onHoverOver(e) {
    if (!state.hoverRead || !synth || e.pointerType === 'touch' || e.pointerType === 'pen') return;
    var path = e.composedPath ? e.composedPath() : [];
    if (host && path.indexOf(host) > -1) { clearTimeout(hover.timer); hover.el = null; return; }
    var el = hoverTarget(e.target);
    if (el === hover.el) return;
    hover.el = el;
    clearTimeout(hover.timer);
    if (!el) return;
    hover.timer = setTimeout(function () {
      if (hover.el !== el) return;
      if (el === hover.lastRead && speech.active) return; // aynı öğe zaten okunuyor
      if (!pageActivated()) {
        hover.pending = el;
        showToast(T.needClick);
        return;
      }
      readHoverEl(el);
    }, 450);
  }

  /* ------------------------------------------------------------------ arayüz */
  var host, shadow, ui = {};
  var open = false;
  var pointerY = null, rafPending = false;
  var jqFxOffByUs = false;

  var ICON = '<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">' +
    '<circle cx="12" cy="12" r="10.6" fill="none" stroke="currentColor" stroke-width="1.6"/>' +
    '<circle cx="12" cy="6.4" r="1.75" fill="currentColor"/>' +
    '<path d="M6.6 9.3l5.4 1.1 5.4-1.1M12 10.4v3.5m0 0l-2.5 5.1M12 13.9l2.5 5.1" fill="none" ' +
    'stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/></svg>';

  function svg(inner) {
    return '<svg viewBox="0 0 16 16" width="16" height="16" aria-hidden="true" focusable="false" fill="none" ' +
      'stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round">' + inner + '</svg>';
  }
  var G = {
    ws: svg('<path d="M1.5 4v8M14.5 4v8M4.5 8h7M6.5 6l-2 2 2 2M9.5 6l2 2-2 2"/>'),
    lh: svg('<path d="M3 4h10M3 8h10M3 12h10"/>'),
    invert: svg('<circle cx="8" cy="8" r="6.2"/><path d="M8 1.8a6.2 6.2 0 0 1 0 12.4z" fill="currentColor"/>'),
    hc: svg('<rect x="2" y="2" width="12" height="12" rx="2" fill="currentColor"/>'),
    gray: svg('<circle cx="8" cy="8" r="6.2"/><circle cx="8" cy="8" r="3" fill="currentColor" opacity=".5"/>'),
    guide: svg('<path d="M1 8h14"/><path d="M3 4.5h7M3 11.5h9" opacity=".45"/>'),
    mask: svg('<rect x="1.5" y="1.5" width="13" height="4" fill="currentColor"/><rect x="1.5" y="10.5" width="13" height="4" fill="currentColor"/>'),
    cursor: svg('<path d="M3 1.5l9.5 7-4 .7 2.4 4.6-2 1-2.4-4.7L3 13z" fill="currentColor"/>'),
    noanim: svg('<path d="M5.5 3v10M10.5 3v10" stroke-width="2.4"/>'),
    click: svg('<path d="M6 8V3a1.2 1.2 0 0 1 2.4 0v4l3.6.9c.8.2 1.3 1 1.1 1.8L12.3 14H6.8L3.6 10.5a1.1 1.1 0 0 1 1.6-1.5z"/>'),
    prev: svg('<path d="M3.5 3v10" stroke-width="2"/><path d="M13 3.5L6 8l7 4.5z" fill="currentColor"/>'),
    next: svg('<path d="M12.5 3v10" stroke-width="2"/><path d="M3 3.5L10 8l-7 4.5z" fill="currentColor"/>'),
    stop: svg('<rect x="3.5" y="3.5" width="9" height="9" rx="1" fill="currentColor"/>'),
    play: svg('<path d="M4.5 2.8l9 5.2-9 5.2z" fill="currentColor"/>'),
    pause: svg('<path d="M5.5 3v10M10.5 3v10" stroke-width="2.6"/>'),
    hover: svg('<path d="M3 1.5l9.5 7-4 .7 2.4 4.6-2 1-2.4-4.7L3 13z"/><path d="M12.5 11.5c1 .6 1.6 1.6 1.6 2.8M11.3 13.2c.4.3.7.8.7 1.3" />'),
    align: svg('<path d="M2 3.5h12M2 6.5h8M2 9.5h12M2 12.5h8"/>')
  };

  function tile(key, label, glyph, extra) {
    return '<button type="button" class="tile' + (extra ? ' ' + extra : '') + '" data-toggle="' + key +
      '" aria-pressed="false"><span class="g" aria-hidden="true">' + glyph + '</span><span class="lbl">' +
      label + '</span></button>';
  }

  var UI_CSS = [
    ':host{all:initial}',
    '*{box-sizing:border-box}',
    '[hidden]{display:none!important}',
    '.wrap{position:absolute;inset:0;pointer-events:none;color:#1b1f24;',
    '  font:15px/1.45 system-ui,-apple-system,"Segoe UI",Roboto,Arial,sans-serif;-webkit-font-smoothing:antialiased}',
    'button{font:inherit;color:inherit;cursor:pointer;margin:0;touch-action:manipulation;-webkit-tap-highlight-color:transparent}',
    ':focus-visible{outline:3px solid #ffbf00;outline-offset:2px}',
    '.fab{pointer-events:auto;position:absolute;bottom:calc(var(--o) + env(safe-area-inset-bottom, 0px));touch-action:manipulation;width:58px;height:58px;padding:0;border-radius:50%;',
    '  border:3px solid #fff;background:var(--c);color:#fff;box-shadow:0 4px 16px rgba(0,0,0,.3);',
    '  display:grid;place-items:center;transition:transform .15s}',
    '.fab:hover{transform:scale(1.06)}',
    '.fab svg{width:36px;height:36px}',
    '.right .fab{right:var(--o)}.left .fab{left:var(--o)}',
    '.panel{pointer-events:auto;position:absolute;bottom:calc(var(--o) + 70px + env(safe-area-inset-bottom, 0px));width:min(372px,calc(100% - 24px));',
    '  max-height:calc(100% - var(--o) - 90px - env(safe-area-inset-bottom, 0px) - env(safe-area-inset-top, 0px));display:flex;flex-direction:column;background:#fff;',
    '  border-radius:16px;box-shadow:0 14px 44px rgba(0,0,0,.3);overflow:hidden}',
    '.right .panel{right:min(var(--o),12px)}.left .panel{left:min(var(--o),12px)}',
    '@media (min-width:480px){.right .panel{right:var(--o)}.left .panel{left:var(--o)}}',
    '.head{display:flex;align-items:center;justify-content:space-between;padding:12px 12px 12px 18px;',
    '  background:var(--c);color:#fff}',
    'h2{margin:0;font-size:17px;font-weight:700}',
    '.x{width:40px;height:40px;border:0;border-radius:10px;background:transparent;color:#fff;font-size:26px;line-height:1}',
    '.x:hover{background:rgba(255,255,255,.18)}',
    '.body{overflow:auto;padding:4px 16px 16px;overscroll-behavior:contain}',
    'section{padding:14px 0;border-bottom:1px solid #e6e8eb}',
    'h3{margin:0 0 10px;font-size:12.5px;font-weight:700;letter-spacing:.05em;text-transform:uppercase;color:#56606b}',
    '.grid{display:grid;grid-template-columns:1fr 1fr;gap:8px}',
    '.full{grid-column:1/-1}',
    '.hovergrid{margin-top:10px}',
    '.toast{pointer-events:none;position:absolute;left:50%;transform:translateX(-50%);',
    '  bottom:calc(var(--o) + 72px + env(safe-area-inset-bottom, 0px));max-width:calc(100% - 32px);width:max-content;',
    '  background:#1b1f24;color:#fff;padding:11px 16px;border-radius:12px;font-size:14.5px;line-height:1.35;',
    '  box-shadow:0 6px 20px rgba(0,0,0,.3);text-align:center}',
    '.tile{display:flex;align-items:center;gap:9px;min-height:50px;padding:8px 10px;text-align:left;',
    '  background:#f2f4f6;border:2px solid transparent;border-radius:11px;font-size:14px;line-height:1.25}',
    '.tile:hover{border-color:#c5ced8}',
    '.tile[aria-pressed="true"]{background:#fff;border-color:var(--c);color:var(--c);font-weight:600}',
    '.g{flex:none;width:28px;height:28px;display:grid;place-items:center;border-radius:7px;background:#fff;',
    '  font-weight:700;font-size:12px;white-space:nowrap;color:var(--c)}',
    '.tile[aria-pressed="true"] .g{background:var(--c);color:#fff}',
    '.ctrl{display:grid;grid-template-columns:48px 1fr 48px 48px;gap:8px}',
    '.btn.ic{display:grid;place-items:center;padding:0}',
    '.btn svg{width:18px;height:18px;vertical-align:-3px}',
    '.btn.pri{display:flex;align-items:center;justify-content:center;gap:8px}',
    '.status{margin:8px 2px 0;min-height:1.2em;font-size:13px;color:#56606b;font-variant-numeric:tabular-nums}',
    '.jumpbox{margin-top:12px;border:1px solid #e1e5ea;border-radius:11px;padding:0 12px}',
    '.jumpbox summary{cursor:pointer;padding:11px 0;font-weight:600;font-size:14px;color:var(--c)}',
    '.jump{list-style:none;margin:0 0 10px;padding:0;max-height:200px;overflow:auto;display:grid;gap:2px}',
    '.jump button{width:100%;text-align:left;border:0;background:transparent;padding:9px 8px;border-radius:8px;font-size:14px}',
    '.jump button:hover{background:#f2f4f6}',
    '.jump .lvl3,.jump .lvl4{padding-left:22px;font-size:13.5px;color:#3d4650}',
    '.jump .empty{padding:6px 2px 10px;font-size:13px;color:#56606b}',
    '.mini{pointer-events:auto;position:absolute;bottom:calc(var(--o) + 4px + env(safe-area-inset-bottom, 0px));',
    '  display:flex;gap:4px;padding:4px;background:#fff;border-radius:999px;box-shadow:0 4px 16px rgba(0,0,0,.28)}',
    '.right .mini{right:calc(var(--o) + 66px)}.left .mini{left:calc(var(--o) + 66px)}',
    '.mini button{width:44px;height:44px;border:0;border-radius:50%;background:transparent;color:var(--c);display:grid;place-items:center;padding:0}',
    '.mini button:hover{background:#eef2f7}',
    '.mini .mt{background:var(--c);color:#fff}',
    '.mini .mt:hover{background:var(--c)}',
    '.mini svg{width:18px;height:18px}',
    '.btn{flex:1;min-height:44px;border-radius:11px;border:2px solid var(--c);background:#fff;color:var(--c);font-weight:600}',
    '.btn.pri{background:var(--c);color:#fff}',
    '.btn:disabled{opacity:.4;cursor:default}',
    '.rate{display:flex;align-items:center;gap:10px;margin:12px 0;font-size:14px}',
    '.rate input{flex:1;accent-color:var(--c);min-width:0}',
    '.rate output{min-width:42px;text-align:right;font-weight:700;font-variant-numeric:tabular-nums}',
    '.hint{margin:8px 2px 0;font-size:12.5px;color:#56606b}',
    '.size{display:flex;align-items:center;gap:8px;margin-bottom:10px}',
    '.size button{width:56px;height:44px;border-radius:11px;border:2px solid var(--c);background:#fff;color:var(--c);',
    '  font-weight:700;font-size:16px}',
    '.size button:disabled{opacity:.4;cursor:default}',
    '.size .val{flex:1;text-align:center;font-weight:700;font-size:16px;font-variant-numeric:tabular-nums}',
    '.reset{margin-top:16px;width:100%;min-height:46px;border:0;border-radius:11px;background:#b42318;color:#fff;font-weight:600}',
    '.reset:hover{background:#912018}',
    '.guide{position:absolute;left:0;right:0;height:16px;margin-top:-8px;background:rgba(255,191,0,.25);',
    '  border-top:3px solid #d99a00;border-bottom:3px solid #d99a00;pointer-events:none}',
    '.mtop,.mbot{position:absolute;left:0;right:0;background:rgba(0,0,0,.62);pointer-events:none}',
    '.mtop{top:0}.mbot{bottom:0}',
    '.sr{position:absolute;width:1px;height:1px;overflow:hidden;clip:rect(0 0 0 0);white-space:nowrap}',
    '@media (prefers-reduced-motion:reduce){.fab{transition:none}}'
  ].join('\n');

  function buildUI() {
    if (document.getElementById(HOST_ID)) return;
    host = document.createElement('div');
    host.id = HOST_ID;
    host.setAttribute('style', 'position:fixed;inset:0;z-index:2147483000;pointer-events:none;' +
      'display:block;margin:0;padding:0;border:0;background:none');
    shadow = host.attachShadow({ mode: 'open' });

    shadow.innerHTML =
      '<style>' + UI_CSS + '</style>' +
      '<div class="wrap ' + CFG.position + '" style="--c:' + CFG.color + ';--o:' + CFG.offset + 'px">' +
        '<div class="guide" hidden></div><div class="mtop" hidden></div><div class="mbot" hidden></div>' +
        '<button type="button" class="fab" aria-expanded="false" aria-controls="vab-panel" aria-label="' +
          T.open + '" title="' + T.title + '">' + ICON + '</button>' +
        '<div class="panel" id="vab-panel" role="dialog" aria-labelledby="vab-title" hidden>' +
          '<div class="head"><h2 id="vab-title">' + T.title + '</h2>' +
            '<button type="button" class="x" aria-label="' + T.close + '">×</button></div>' +
          '<div class="body">' +
            '<section aria-labelledby="vab-s1"><h3 id="vab-s1">' + T.speech + '</h3>' +
              '<div class="speech">' +
                '<div class="ctrl" role="group" aria-label="' + T.player + '">' +
                  '<button type="button" class="btn ic" data-act="prev" aria-label="' + T.prev + '">' + G.prev + '</button>' +
                  '<button type="button" class="btn pri" data-act="toggle"></button>' +
                  '<button type="button" class="btn ic" data-act="next" aria-label="' + T.next + '">' + G.next + '</button>' +
                  '<button type="button" class="btn ic" data-act="stop" aria-label="' + T.stop + '">' + G.stop + '</button>' +
                '</div>' +
                '<p class="status" aria-live="polite"></p>' +
                '<label class="rate"><span>' + T.rate + '</span>' +
                  '<input type="range" min="0.5" max="2" step="0.1"><output>1.0×</output></label>' +
                '<div class="grid">' + tile('clickRead', T.clickRead, G.click, 'full') + '</div>' +
                '<p class="hint">' + T.clickReadHint + '</p>' +
                (canHover ? '<div class="grid hovergrid">' + tile('hoverRead', T.hoverRead, G.hover, 'full') + '</div>' +
                  '<p class="hint">' + T.hoverReadHint + '</p>' : '') +
                '<details class="jumpbox"><summary>' + T.jump + '</summary><ul class="jump"></ul></details>' +
              '</div>' +
              '<p class="hint nosupport" hidden>' + T.noSpeech + '</p>' +
            '</section>' +
            '<section aria-labelledby="vab-s2"><h3 id="vab-s2">' + T.text + '</h3>' +
              '<div class="size" role="group" aria-label="' + T.size + '">' +
                '<button type="button" data-act="fs-" aria-label="' + T.smaller + '">A−</button>' +
                '<span class="val" aria-live="polite"></span>' +
                '<button type="button" data-act="fs+" aria-label="' + T.bigger + '">A+</button>' +
              '</div>' +
              '<div class="grid">' +
                tile('ls', T.ls, 'A↔') + tile('lh', T.lh, G.lh) +
                tile('ws', T.ws, G.ws) + tile('font', T.font, 'Aa') +
                tile('links', T.links, '<u>a</u>') +
                '<button type="button" class="tile" data-act="align"><span class="g" aria-hidden="true">' + G.align + '</span>' +
                  '<span class="lbl"></span></button>' +
              '</div>' +
            '</section>' +
            '<section aria-labelledby="vab-s3"><h3 id="vab-s3">' + T.color + '</h3>' +
              '<div class="grid">' +
                tile('invert', T.invert, G.invert) + tile('hc', T.hc, G.hc) + tile('gray', T.gray, G.gray) +
              '</div>' +
            '</section>' +
            '<section aria-labelledby="vab-s4"><h3 id="vab-s4">' + T.aids + '</h3>' +
              '<div class="grid">' +
                tile('guide', T.guide, G.guide) + tile('mask', T.mask, G.mask) +
                tile('cursor', T.cursor, G.cursor) + tile('noanim', T.noanim, G.noanim) +
              '</div>' +
            '</section>' +
            '<button type="button" class="reset" data-act="reset">↺ ' + T.reset + '</button>' +
          '</div>' +
        '</div>' +
        '<div class="mini" role="group" aria-label="' + T.player + '" hidden>' +
          '<button type="button" data-act="prev" aria-label="' + T.prev + '">' + G.prev + '</button>' +
          '<button type="button" data-act="toggle" class="mt"></button>' +
          '<button type="button" data-act="next" aria-label="' + T.next + '">' + G.next + '</button>' +
          '<button type="button" data-act="stop" aria-label="' + T.stop + '">' + G.stop + '</button>' +
        '</div>' +
        '<div class="toast" role="status" aria-live="polite" hidden></div>' +
        '<div class="sr" role="status" aria-live="polite"></div>' +
      '</div>';

    ui.fab = shadow.querySelector('.fab');
    ui.panel = shadow.querySelector('.panel');
    ui.close = shadow.querySelector('.x');
    ui.rate = shadow.querySelector('.rate input');
    ui.rateOut = shadow.querySelector('.rate output');
    ui.sizeVal = shadow.querySelector('.size .val');
    ui.alignLbl = shadow.querySelector('[data-act="align"] .lbl');
    ui.guide = shadow.querySelector('.guide');
    ui.mtop = shadow.querySelector('.mtop');
    ui.mbot = shadow.querySelector('.mbot');
    ui.sr = shadow.querySelector('.sr');
    ui.status = shadow.querySelector('.status');
    ui.jump = shadow.querySelector('.jump');
    ui.mini = shadow.querySelector('.mini');
    ui.toast = shadow.querySelector('.toast');
    shadow.querySelector('.jumpbox').addEventListener('toggle', function (e) {
      if (e.target.open) buildJumpList();
    });

    if (!synth) {
      shadow.querySelector('.speech').hidden = true;
      shadow.querySelector('.nosupport').hidden = false;
    }

    // Klavye kullanıcıları menüye erken ulaşsın diye <body>'nin ilk öğesi olarak ekleniyor
    document.body.insertBefore(host, document.body.firstChild);

    ui.fab.addEventListener('click', function () { setOpen(!open); });
    ui.close.addEventListener('click', function () { setOpen(false); ui.fab.focus(); });
    shadow.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && open) { e.stopPropagation(); setOpen(false); ui.fab.focus(); }
    });
    shadow.addEventListener('click', onUiClick);
    ui.rate.addEventListener('input', function () {
      state.rate = Number(ui.rate.value) || 1;
      ui.rateOut.textContent = state.rate.toFixed(1) + '×';
      saveState();
    });
    ui.rate.addEventListener('change', function () {
      if (speech.active && !speech.paused) speakFrom(speech.i);
    });
    document.addEventListener('click', function (e) {
      if (!open) return;
      var path = e.composedPath ? e.composedPath() : [];
      if (path.indexOf(host) === -1) setOpen(false);
    });
    document.addEventListener('click', onDocClickRead, true);
    if (canHover) {
      document.addEventListener('pointerover', onHoverOver, { passive: true });
      document.addEventListener('pointerdown', onFirstGesture, true);
      document.addEventListener('keydown', onFirstGesture, true);
    }
    window.addEventListener('pointermove', onPointerMove, { passive: true });
    window.addEventListener('pagehide', function () { if (synth) synth.cancel(); });

    syncUI();
  }

  function setOpen(v) {
    open = v;
    ui.panel.hidden = !v;
    ui.fab.setAttribute('aria-expanded', v ? 'true' : 'false');
    if (v) ui.close.focus();
    syncUI();
  }

  var toastTimer = null;
  function showToast(msg) {
    if (!ui.toast) return;
    ui.toast.textContent = msg;
    ui.toast.hidden = false;
    clearTimeout(toastTimer);
    toastTimer = setTimeout(hideToast, 7000);
  }
  function hideToast() {
    clearTimeout(toastTimer);
    if (ui.toast) ui.toast.hidden = true;
  }

  function announce(msg) {
    if (!ui.sr) return;
    ui.sr.textContent = '';
    setTimeout(function () { ui.sr.textContent = msg; }, 40);
  }

  function onUiClick(e) {
    var b = e.target.closest('[data-toggle],[data-act]');
    if (!b) return;
    var key = b.getAttribute('data-toggle');
    if (key) {
      state[key] = !state[key];
      if (key === 'invert' && state.invert) state.hc = false;
      if (key === 'hc' && state.hc) state.invert = false;
      if (key === 'clickRead' && !state.clickRead) stopSpeech();
      if (key === 'hoverRead' && !state.hoverRead) { clearTimeout(hover.timer); hover.el = null; hover.pending = null; hideToast(); stopSpeech(); }
      apply();
      announce(b.querySelector('.lbl').textContent + ': ' + (state[key] ? T.on : T.off));
      return;
    }
    switch (b.getAttribute('data-act')) {
      case 'toggle': togglePlay(); break;
      case 'prev': goBlock(-1); break;
      case 'next': goBlock(1); break;
      case 'stop': stopSpeech(); break;
      case 'jump':
        if (!jumpChunks.length) break;
        setChunks(jumpChunks);
        speakFrom(parseInt(b.getAttribute('data-idx'), 10) || 0);
        break;
      case 'fs+':
      case 'fs-':
        state.fs = Math.max(0, Math.min(FS.length - 1, state.fs + (b.getAttribute('data-act') === 'fs+' ? 1 : -1)));
        apply();
        break;
      case 'align':
        state.align = (state.align + 1) % 4;
        apply();
        announce(T.align + ': ' + T.alignVals[state.align]);
        break;
      case 'reset':
        stopSpeech();
        state = JSON.parse(JSON.stringify(DEFAULTS));
        apply();
        try { localStorage.removeItem(KEY); } catch (err) { /* yok say */ }
        announce(T.resetDone);
        break;
    }
  }

  /* ------------------------------------------------------------------ okuma kılavuzu / maskesi */
  function onPointerMove(e) {
    if (!state.guide && !state.mask) return;
    pointerY = e.clientY;
    if (!rafPending) { rafPending = true; requestAnimationFrame(positionOverlays); }
  }
  function positionOverlays() {
    rafPending = false;
    if (!ui.guide) return;
    var y = pointerY === null ? Math.round(window.innerHeight / 2) : pointerY;
    var half = 60;
    ui.guide.style.top = y + 'px';
    ui.mtop.style.height = Math.max(0, y - half) + 'px';
    ui.mbot.style.height = Math.max(0, window.innerHeight - y - half) + 'px';
  }

  /* ------------------------------------------------------------------ uygula + arayüzü eşitle */
  function apply() {
    for (var k in CLASS) html.classList.toggle(CLASS[k], !!state[k]);
    for (var i = 1; i < ALIGN.length; i++) html.classList.toggle(ALIGN[i], state.align === i);

    // jQuery animasyonlarını (slider, slideToggle vb.) da anında bitir
    if (window.jQuery && window.jQuery.fx) {
      if (state.noanim) { window.jQuery.fx.off = true; jqFxOffByUs = true; }
      else if (jqFxOffByUs) { window.jQuery.fx.off = false; jqFxOffByUs = false; }
    }

    if (fontReady && state.fs !== appliedFs) applyFontSize();
    saveState();
    syncUI();
  }

  function syncUI() {
    if (!shadow) return;
    var toggles = shadow.querySelectorAll('[data-toggle]');
    for (var i = 0; i < toggles.length; i++) {
      var k = toggles[i].getAttribute('data-toggle');
      toggles[i].setAttribute('aria-pressed', state[k] ? 'true' : 'false');
    }
    ui.sizeVal.textContent = '%' + Math.round(FS[state.fs] * 100);
    shadow.querySelector('[data-act="fs-"]').disabled = state.fs === 0;
    shadow.querySelector('[data-act="fs+"]').disabled = state.fs === FS.length - 1;
    ui.alignLbl.textContent = T.align + ': ' + T.alignVals[state.align];
    shadow.querySelector('[data-act="align"]').setAttribute('aria-pressed', state.align ? 'true' : 'false');
    ui.rate.value = String(state.rate);
    ui.rateOut.textContent = state.rate.toFixed(1) + '×';

    var playing = speech.active && !speech.paused;
    var tLabel = playing ? T.pause : (speech.active ? T.resume : T.play);
    var tIcon = playing ? G.pause : G.play;
    var toggles2 = shadow.querySelectorAll('[data-act="toggle"]');
    for (var t = 0; t < toggles2.length; t++) {
      toggles2[t].innerHTML = toggles2[t].classList.contains('mt') ? tIcon : tIcon + '<span>' + tLabel + '</span>';
      toggles2[t].setAttribute('aria-label', tLabel);
    }
    var stops = shadow.querySelectorAll('[data-act="stop"]');
    for (var s2 = 0; s2 < stops.length; s2++) stops[s2].disabled = !speech.active;
    if (speech.active && speech.starts.length > 1) {
      ui.status.textContent = T.para + ' ' + (blockIndexOf(speech.i) + 1) + ' / ' + speech.starts.length;
    } else {
      ui.status.textContent = '';
    }
    ui.mini.hidden = !(speech.active && !open);

    ui.guide.hidden = !state.guide;
    ui.mtop.hidden = ui.mbot.hidden = !state.mask;
    if (state.guide || state.mask) positionOverlays();
  }

  /* ------------------------------------------------------------------ başlat */
  injectPageCss();
  for (var c in CLASS) html.classList.toggle(CLASS[c], !!state[c]); // yanıp sönmeyi önlemek için hemen
  for (var a = 1; a < ALIGN.length; a++) html.classList.toggle(ALIGN[a], state.align === a);

  function init() {
    buildUI();
    apply();
  }
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();

  // Metin boyutunu, slider vb. sayfa betikleri çalışıp sayfa tamamen yüklendikten sonra uygula
  function onReady() {
    fontReady = true;
    if (state.fs !== appliedFs) applyFontSize();
  }
  if (document.readyState === 'complete') setTimeout(onReady, 0);
  else window.addEventListener('load', onReady);
})();
