'use strict';

/* ---------- Utilità ---------- */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const AUDIO_CACHE = 'm15-audio';
const CHARS_PER_SECOND = 15.5; // stima per la durata della voce del dispositivo

function fmtTime(sec) {
  sec = Math.max(0, Math.floor(sec || 0));
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}
const fmtMinutes = (sec) => `${Math.max(1, Math.round(sec / 60))} min`;

const store = {
  get(key, fallback) {
    try {
      const v = localStorage.getItem('m15:' + key);
      return v ? JSON.parse(v) : fallback;
    } catch { return fallback; }
  },
  set(key, value) {
    try { localStorage.setItem('m15:' + key, JSON.stringify(value)); } catch { /* storage non disponibile */ }
  },
};

const ICON = {
  play: '<svg viewBox="0 0 24 24"><path d="M8 5.5v13a1 1 0 0 0 1.5.86l10.6-6.5a1 1 0 0 0 0-1.72L9.5 4.64A1 1 0 0 0 8 5.5z"/></svg>',
  pause: '<svg viewBox="0 0 24 24"><rect x="6" y="5" width="4.2" height="14" rx="1.2"/><rect x="13.8" y="5" width="4.2" height="14" rx="1.2"/></svg>',
  back: '<svg viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" fill="none" stroke="currentColor" stroke-width="2.4" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  clock: '<svg viewBox="0 0 24 24"><path d="M12 2a10 10 0 1 0 0 20 10 10 0 0 0 0-20zm1 10.4 3.3 2-1 1.7L11 13V7h2z"/></svg>',
  text: '<svg viewBox="0 0 24 24"><path d="M4 5h16M4 10h16M4 15h10M4 20h7" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round"/></svg>',
  head: '<svg viewBox="0 0 24 24"><path d="M12 3a9 9 0 0 0-9 9v6a3 3 0 0 0 3 3h1a1 1 0 0 0 1-1v-6a1 1 0 0 0-1-1H5a7 7 0 0 1 14 0h-2a1 1 0 0 0-1 1v6a1 1 0 0 0 1 1h1a3 3 0 0 0 3-3v-6a9 9 0 0 0-9-9z"/></svg>',
  bookmark: '<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z" fill="none" stroke="currentColor" stroke-width="2" stroke-linejoin="round"/></svg>',
  bookmarkOn: '<svg viewBox="0 0 24 24"><path d="M6 3h12a1 1 0 0 1 1 1v17l-7-4.5L5 21V4a1 1 0 0 1 1-1z"/></svg>',
  check: '<svg viewBox="0 0 24 24"><path d="M5 12.5l4.5 4.5L19 7.5" fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"/></svg>',
  share: '<svg viewBox="0 0 24 24"><path d="M12 3v12M7.5 7.5 12 3l4.5 4.5M5 12v7a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-7" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"/></svg>',
};

/* ---------- Stato ---------- */

const state = {
  books: {},
  order: [],
  paths: [],
  audio: {},        // id -> {duration, chapters, hash} se esiste l'MP3 generato
  covers: {},       // id -> hash se esiste la copertina scaricata
  summaries: {},    // id -> {chapters: [{title, paragraphs}]}
  progress: store.get('progress', {}), // id -> {pos, dur, done, t}
  saved: store.get('saved', []),
  settings: Object.assign({ rate: 1, readerFs: 19, autoNext: true }, store.get('settings', {})),
  listened: store.get('listened', 0),
  filter: 'Tutti',
  query: '',
  toolbox: { categories: [], tools: [] },
  toolFilter: 'Tutti',
  flashcards: {},   // id libro -> [[domanda, risposta], ...]
  cards: store.get('cards', {}),  // 'libro:indice' -> {box, due}: le schede nel ripasso
  practice: Object.assign({ exercises: {}, notes: {}, challenge: null, reviewed: 0, reviewDays: [] }, store.get('practice', {})),
};

const saveProgress = () => store.set('progress', state.progress);

async function loadData() {
  const catalog = await fetch('data/books.json').then((r) => r.json());
  for (const b of catalog.books) state.books[b.id] = b;
  state.order = catalog.books.map((b) => b.id);
  state.paths = catalog.paths;
  try {
    const r = await fetch('audio/index.json', { cache: 'no-cache' });
    if (r.ok) state.audio = await r.json();
  } catch { /* nessun audio generato: si userà la voce del dispositivo */ }
  try {
    const r = await fetch('covers/index.json', { cache: 'no-cache' });
    if (r.ok) state.covers = await r.json();
  } catch { /* senza copertine si usano quelle grafiche */ }
  const [toolbox, flashcards] = await Promise.all(['data/toolbox.json', 'data/flashcards.json']
    .map((url) => fetch(url).then((r) => (r.ok ? r.json() : null)).catch(() => null)));
  if (toolbox) state.toolbox = toolbox;
  if (flashcards) state.flashcards = flashcards;
}

const coverUrl = (id) => (state.covers[id] ? `covers/${id}.jpg?v=${state.covers[id]}` : null);

async function getSummary(id) {
  if (state.summaries[id]) return state.summaries[id];
  const md = await fetch(`data/summaries/${id}.md`).then((r) => {
    if (!r.ok) throw new Error('Riassunto non trovato');
    return r.text();
  });
  const chapters = [];
  for (const raw of md.split('\n')) {
    const line = raw.trim();
    if (!line || line.startsWith('# ')) continue;
    if (line.startsWith('## ')) chapters.push({ title: line.slice(3).trim(), paragraphs: [] });
    else if (chapters.length) chapters[chapters.length - 1].paragraphs.push(line.replace(/\*\*/g, ''));
  }
  const chars = chapters.reduce((n, c) => n + c.title.length + c.paragraphs.join(' ').length, 0);
  return (state.summaries[id] = { chapters, chars });
}

function bookDuration(id) {
  if (state.audio[id]) return state.audio[id].duration;
  if (state.progress[id]?.dur) return state.progress[id].dur;
  return 15 * 60;
}

function progressRatio(id) {
  const p = state.progress[id];
  if (!p) return 0;
  if (p.done) return 1;
  return p.dur ? clamp(p.pos / p.dur, 0, 1) : 0;
}

const audioUrl = (id) => `audio/${id}.mp3?v=${state.audio[id]?.hash || ''}`;

/* ---------- Motori di riproduzione ---------- */

// Un solo elemento <audio> per tutta l'app: su iOS resta "sbloccato" dopo il primo tocco.
const audioEl = new Audio();
audioEl.preload = 'metadata';

class FileEngine {
  constructor(id, chapters, emit) {
    this.kind = 'file';
    this.chapters = chapters;
    this.emit = emit;
    this.knownDuration = state.audio[id].duration;
    this.handlers = {
      timeupdate: () => emit('time'),
      play: () => emit('state'),
      pause: () => emit('state'),
      ended: () => emit('ended'),
      error: () => emit('error'),
      loadedmetadata: () => {
        if (this.pendingSeek !== null) {
          audioEl.currentTime = this.pendingSeek;
          this.pendingSeek = null;
        }
        emit('time');
      },
    };
    this.pendingSeek = null;
    for (const [ev, fn] of Object.entries(this.handlers)) audioEl.addEventListener(ev, fn);
    audioEl.src = audioUrl(id);
  }
  // iOS ignora preload: finché i metadati non arrivano (cioè fino a play) teniamo da parte il seek.
  get time() { return this.pendingSeek ?? (audioEl.currentTime || 0); }
  get duration() { return Number.isFinite(audioEl.duration) && audioEl.duration > 0 ? audioEl.duration : this.knownDuration; }
  get playing() { return !audioEl.paused; }
  play() { return audioEl.play().catch((e) => { if (e.name !== 'AbortError') this.emit('error'); }); }
  pause() { audioEl.pause(); }
  seek(t) {
    const target = clamp(t, 0, this.duration - 0.5);
    if (audioEl.readyState > 0) audioEl.currentTime = target;
    else this.pendingSeek = target;
    this.emit('time');
  }
  setRate(r) { audioEl.playbackRate = r; audioEl.defaultPlaybackRate = r; }
  destroy() {
    audioEl.pause();
    for (const [ev, fn] of Object.entries(this.handlers)) audioEl.removeEventListener(ev, fn);
  }
}

// Ripiego quando l'MP3 non esiste (o non è raggiungibile offline): legge il testo
// frase per frase con la sintesi vocale del dispositivo.
class SpeechEngine {
  constructor(id, summary, emit) {
    this.kind = 'speech';
    this.emit = emit;
    this.rate = 1;
    this.idx = 0;
    this.isPlaying = false;
    this.gen = 0;
    this.segs = [];
    this.chapters = [];
    const book = state.books[id];
    let t = 0;
    summary.chapters.forEach((ch, ci) => {
      this.chapters.push({ title: ch.title, start: t });
      const lines = [ch.title + '.', ...ch.paragraphs];
      if (ci === 0) lines.unshift(`${book.title}, di ${book.author}.`);
      for (const line of lines) {
        for (const sentence of line.split(/(?<=[.!?:;])\s+/)) {
          if (!sentence.trim()) continue;
          const dur = sentence.length / CHARS_PER_SECOND + 0.35;
          this.segs.push({ text: sentence, start: t, dur });
          t += dur;
        }
      }
    });
    this.total = t;
    this.segStartedAt = 0;
  }
  get time() {
    const seg = this.segs[this.idx];
    if (!seg) return this.total;
    if (!this.isPlaying) return seg.start;
    const elapsed = ((performance.now() - this.segStartedAt) / 1000) * this.rate;
    return seg.start + Math.min(elapsed, seg.dur);
  }
  get duration() { return this.total; }
  get playing() { return this.isPlaying; }
  play() {
    if (!('speechSynthesis' in window)) { this.emit('error'); return Promise.resolve(); }
    this.isPlaying = true;
    this.speak();
    this.timer = setInterval(() => this.emit('time'), 500);
    this.emit('state');
    return Promise.resolve();
  }
  pause() {
    this.isPlaying = false;
    this.gen++;
    clearInterval(this.timer);
    speechSynthesis.cancel();
    this.emit('state');
  }
  speak() {
    const gen = ++this.gen;
    const seg = this.segs[this.idx];
    if (!seg) { this.finish(); return; }
    const u = new SpeechSynthesisUtterance(seg.text);
    u.lang = 'it-IT';
    const voice = pickVoice();
    if (voice) u.voice = voice;
    u.rate = this.rate;
    const next = () => {
      if (gen !== this.gen || !this.isPlaying) return;
      this.idx++;
      if (this.idx >= this.segs.length) this.finish();
      else this.speak();
    };
    u.onend = next;
    u.onerror = (e) => { if (e.error !== 'interrupted' && e.error !== 'canceled') next(); };
    const go = () => {
      if (gen !== this.gen) return;
      this.segStartedAt = performance.now();
      speechSynthesis.speak(u);
    };
    // Su Safari uno speak() subito dopo cancel() a volte viene ignorato; se però non c'è
    // nulla da interrompere parliamo subito, per restare dentro il gesto dell'utente.
    if (speechSynthesis.speaking || speechSynthesis.pending) {
      speechSynthesis.cancel();
      setTimeout(go, 80);
    } else {
      go();
    }
  }
  finish() {
    this.isPlaying = false;
    clearInterval(this.timer);
    this.idx = this.segs.length;
    this.emit('state');
    this.emit('ended');
  }
  seek(t) {
    let i = this.segs.findIndex((s) => s.start + s.dur > t);
    if (i < 0) i = this.segs.length - 1;
    this.idx = Math.max(0, i);
    if (this.isPlaying) this.speak();
    this.emit('time');
  }
  setRate(r) {
    this.rate = r;
    if (this.isPlaying) this.speak();
  }
  destroy() {
    this.isPlaying = false;
    this.gen++;
    clearInterval(this.timer);
    if ('speechSynthesis' in window) speechSynthesis.cancel();
  }
}

let cachedVoice;
function pickVoice() {
  if (cachedVoice !== undefined) return cachedVoice;
  const voices = speechSynthesis.getVoices().filter((v) => v.lang && v.lang.toLowerCase().startsWith('it'));
  if (!voices.length) return null; // le voci possono non essere ancora caricate: riprova al prossimo giro
  const score = (v) => (/premium|enhanced|migliorat|natural|neural/i.test(v.name) ? 4 : 0)
    + (/alice|federica|emma|luca|paola/i.test(v.name) ? 2 : 0) + (v.localService ? 1 : 0);
  cachedVoice = voices.sort((a, b) => score(b) - score(a))[0];
  return cachedVoice;
}
if ('speechSynthesis' in window) speechSynthesis.addEventListener?.('voiceschanged', () => { cachedVoice = undefined; });

/* ---------- Player ---------- */

const RATES = [0.8, 1, 1.2, 1.4, 1.6, 2];
const SLEEP_OPTIONS = [
  { label: 'Disattivato', value: null },
  { label: '5 minuti', value: 5 },
  { label: '15 minuti', value: 15 },
  { label: '30 minuti', value: 30 },
  { label: '45 minuti', value: 45 },
  { label: 'Fine del capitolo', value: 'chapter' },
];

const player = {
  id: null,
  engine: null,
  context: null,    // {pathId} quando l'ascolto è partito da un percorso
  sleep: null,      // {until} oppure {chapter}
  dragging: false,
  lastSave: 0,
  lastTime: null,

  get book() { return state.books[this.id]; },

  // Sincrona quando possibile: su iOS play() e speak() devono partire dentro il tocco dell'utente.
  load(id, { chapter = null, autoplay = true, forceSpeech = false } = {}) {
    if (this.id === id && this.engine && chapter === null && !forceSpeech) {
      if (autoplay && !this.engine.playing) this.engine.play();
      return Promise.resolve();
    }
    const useFile = state.audio[id] && !forceSpeech;
    if (!useFile && !state.summaries[id]) {
      return getSummary(id).then(() => this.load(id, { chapter, autoplay, forceSpeech }));
    }
    this.saveNow();
    this.engine?.destroy();
    this.id = id;
    this.lastTime = null;
    const emit = (type) => this.onEvent(type);
    this.engine = useFile
      ? new FileEngine(id, state.audio[id].chapters, emit)
      : new SpeechEngine(id, state.summaries[id], emit);
    this.engine.setRate(state.settings.rate);
    store.set('last', id);

    const p = state.progress[id];
    let start = 0;
    if (chapter !== null) start = this.engine.chapters[chapter]?.start || 0;
    else if (p && !p.done && p.pos > 5) start = Math.max(0, p.pos - 3);
    if (start) this.engine.seek(start);

    if (autoplay) this.engine.play();
    this.setupMediaSession();
    renderPlayerStatic();
    updatePlayerUI();
    return Promise.resolve();
  },

  toggle() {
    if (!this.engine) return;
    if (this.engine.playing) this.engine.pause();
    else this.engine.play();
  },

  skip(delta) {
    if (!this.engine) return;
    this.engine.seek(this.engine.time + delta);
  },

  chapterIndex(t = this.engine?.time || 0) {
    const chs = this.engine?.chapters || [];
    let i = 0;
    chs.forEach((c, idx) => { if (t >= c.start - 0.25) i = idx; });
    return i;
  },

  gotoChapter(i) {
    const chs = this.engine?.chapters || [];
    if (!chs.length) return;
    i = clamp(i, 0, chs.length - 1);
    this.engine.seek(chs[i].start + 0.01);
    if (!this.engine.playing) this.engine.play();
  },

  prevChapter() {
    const i = this.chapterIndex();
    const startOfCurrent = this.engine.chapters[i].start;
    this.gotoChapter(this.engine.time - startOfCurrent > 4 ? i : i - 1);
  },

  setRate(r) {
    state.settings.rate = r;
    store.set('settings', state.settings);
    this.engine?.setRate(r);
    updatePlayerUI();
  },

  onEvent(type) {
    if (type === 'error') {
      if (this.engine?.kind === 'file') {
        toast('Audio non disponibile: uso la voce del dispositivo');
        const pos = this.engine.time;
        const id = this.id;
        this.engine.destroy();
        this.engine = null;
        this.id = null;
        this.load(id, { autoplay: false, forceSpeech: true }).then(() => {
          this.engine.seek(pos);
          this.engine.play();
        });
      } else {
        toast('La sintesi vocale non è disponibile su questo dispositivo');
      }
      return;
    }
    if (type === 'ended') {
      this.markDone(this.id, true);
      this.sleep = null;
      // Ascolto continuo: si passa subito al prossimo libro del percorso, senza attese,
      // così l'audio prosegue anche a schermo bloccato.
      const next = state.settings.autoNext ? this.nextInPath() : null;
      if (next) {
        toast(`Ora: ${state.books[next].title}`);
        this.load(next, { autoplay: true });
        return;
      }
      toast('Riassunto completato 🎉');
    }
    if (type === 'time' && this.engine) {
      const t = this.engine.time;
      if (this.engine.playing && this.lastTime !== null) {
        const delta = t - this.lastTime;
        if (delta > 0 && delta < 3) state.listened += delta;
      }
      this.lastTime = t;
      this.checkSleep();
      if (Date.now() - this.lastSave > 4000) this.saveNow();
    }
    if (type === 'state') {
      this.lastTime = this.engine?.time ?? null;
      this.saveNow();
    }
    updatePlayerUI();
  },

  checkSleep() {
    if (!this.sleep || !this.engine.playing) return;
    const expired = this.sleep.until
      ? Date.now() >= this.sleep.until
      : this.chapterIndex() !== this.sleep.chapter;
    if (expired) {
      this.sleep = null;
      this.engine.pause();
      toast('Timer: riproduzione in pausa');
    }
  },

  saveNow() {
    if (!this.engine || !this.id) return;
    this.lastSave = Date.now();
    const prev = state.progress[this.id] || {};
    const pos = this.engine.time;
    const dur = this.engine.duration;
    state.progress[this.id] = { pos, dur, done: prev.done || (dur > 0 && pos / dur > 0.97), t: Date.now() };
    saveProgress();
    store.set('listened', state.listened);
  },

  markDone(id, done) {
    const p = state.progress[id] || { pos: 0, dur: bookDuration(id) };
    p.done = done;
    if (!done) p.pos = 0;
    p.t = Date.now();
    state.progress[id] = p;
    saveProgress();
    if (done) addToDeck(id);
  },

  nextInPath() {
    const path = state.paths.find((pth) => pth.id === this.context?.pathId);
    const i = path ? path.books.indexOf(this.id) : -1;
    if (i < 0) return null;
    return path.books.slice(i + 1).find((bid) => !state.progress[bid]?.done) || null;
  },

  setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const b = this.book;
    const base = new URL('.', location.href).href;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: b.title,
      artist: b.author,
      album: 'Manager in 15',
      artwork: coverUrl(b.id)
        ? [{ src: base + coverUrl(b.id), type: 'image/jpeg' }]
        : [
          { src: base + 'icons/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: base + 'icons/icon-512.png', sizes: '512x512', type: 'image/png' },
        ],
    });
    const handlers = {
      play: () => this.engine.play(),
      pause: () => this.engine.pause(),
      seekbackward: (d) => this.skip(-(d.seekOffset || 15)),
      seekforward: (d) => this.skip(d.seekOffset || 30),
      seekto: (d) => this.engine.seek(d.seekTime),
      previoustrack: () => this.prevChapter(),
      nexttrack: () => this.gotoChapter(this.chapterIndex() + 1),
    };
    for (const [action, fn] of Object.entries(handlers)) {
      try { navigator.mediaSession.setActionHandler(action, fn); } catch { /* azione non supportata */ }
    }
  },
};

/* ---------- UI del player ---------- */

const playerEl = $('#player');
const miniEl = $('#mini-player');

// La copertina grafica resta sotto l'immagine: se l'immagine non carica, si vede quella.
function coverHTML(b, extra = '') {
  const url = coverUrl(b.id);
  const img = url ? `<img src="${url}" alt="" loading="lazy" decoding="async" onerror="this.remove()">` : '';
  return `<div class="cover" style="--c1:${b.colors[0]};--c2:${b.colors[1]}" role="img" aria-label="Copertina di ${esc(b.title)}">
    <div class="cover-title">${esc(b.title)}</div>
    <div class="cover-author">${esc(b.author)}</div>${img}${extra}
  </div>`;
}

function renderPlayerStatic() {
  const b = player.book;
  if (!b) return;
  playerEl.style.setProperty('--c1', b.colors[0]);
  $('.player-cover', playerEl).innerHTML = coverHTML(b);
  $('.player-title', playerEl).textContent = b.title;
  $('.player-author', playerEl).textContent = b.author;
  $('.mini-title', miniEl).textContent = b.title;
  const url = coverUrl(b.id);
  $('.mini-cover', miniEl).style.cssText = `--c1:${b.colors[0]};--c2:${b.colors[1]}`
    + (url ? `;background:center/cover url("${url}"), linear-gradient(150deg, ${b.colors[0]}, ${b.colors[1]})` : '');
  const speech = player.engine?.kind === 'speech';
  const note = $('.engine-note', playerEl);
  note.hidden = !speech;
  note.textContent = speech
    ? 'Lettura con la voce del dispositivo: tieni lo schermo acceso. Con l\'audio MP3 la riproduzione continua anche a schermo bloccato.'
    : '';
  $('[data-action="download"]', playerEl).hidden = speech || !('caches' in window);
  const next = state.settings.autoNext ? player.nextInPath() : null;
  const nextEl = $('.player-next', playerEl);
  nextEl.hidden = !next;
  nextEl.textContent = next ? `Poi nel percorso: ${state.books[next].title}` : '';
  refreshDownloadButton();
  miniEl.hidden = false;
  document.body.classList.add('has-mini');
}

function updatePlayerUI() {
  const e = player.engine;
  if (!e) return;
  const t = e.time;
  const d = e.duration || 1;
  const pct = clamp((t / d) * 100, 0, 100);
  const playIcon = e.playing ? ICON.pause : ICON.play;
  const label = e.playing ? 'Pausa' : 'Riproduci';

  const toggle = $('.play-btn', playerEl);
  if (toggle.dataset.icon !== String(e.playing)) {
    toggle.innerHTML = playIcon;
    toggle.dataset.icon = String(e.playing);
    toggle.setAttribute('aria-label', label);
    const mini = $('.mini-toggle', miniEl);
    mini.innerHTML = playIcon;
    mini.setAttribute('aria-label', label);
  }
  const ci = player.chapterIndex(t);
  const chTitle = e.chapters[ci]?.title || '';
  $('.player-chapter', playerEl).textContent = chTitle;
  $('.mini-sub', miniEl).textContent = `${chTitle} · ${fmtTime(d - t)} rimanenti`;
  $('.mini-progress span', miniEl).style.width = pct + '%';

  if (!player.dragging) {
    const bar = $('.seek-bar', playerEl);
    bar.value = String(Math.round(pct * 10));
    bar.style.setProperty('--p', pct + '%');
    $('.t-cur', playerEl).textContent = fmtTime(t);
    $('.t-left', playerEl).textContent = '-' + fmtTime(d - t);
  }
  $('[data-action="speed"]', playerEl).textContent = `${String(state.settings.rate).replace('.', ',')}×`;
  const sleepBtn = $('[data-action="sleep"]', playerEl);
  sleepBtn.classList.toggle('on', !!player.sleep);
  sleepBtn.textContent = player.sleep?.until
    ? `Timer ${Math.max(1, Math.ceil((player.sleep.until - Date.now()) / 60000))}′`
    : player.sleep ? 'Timer: capitolo' : 'Timer';

  if ('mediaSession' in navigator) {
    navigator.mediaSession.playbackState = e.playing ? 'playing' : 'paused';
    if (e.kind === 'file' && navigator.mediaSession.setPositionState && Number.isFinite(e.duration)) {
      try {
        navigator.mediaSession.setPositionState({ duration: e.duration, playbackRate: state.settings.rate, position: clamp(t, 0, e.duration) });
      } catch { /* valori non ancora validi */ }
    }
  }
  // Evidenzia il capitolo corrente nelle pagine aperte.
  if (route.name === 'book' && route.id === player.id) {
    $$('.toc li').forEach((li, i) => li.classList.toggle('current', i === ci));
  }
  if (route.name === 'read' && route.id === player.id) {
    $$('.reader h2').forEach((h, i) => h.classList.toggle('current', i === ci));
  }
}

function openPlayer() {
  if (!player.engine) return;
  playerEl.hidden = false;
  document.documentElement.style.overflow = 'hidden';
  updatePlayerUI();
}
function closePlayer() {
  playerEl.hidden = true;
  document.documentElement.style.overflow = '';
}

const seekBar = $('.seek-bar', playerEl);
seekBar.addEventListener('input', () => {
  if (!player.engine) return;
  player.dragging = true;
  const pct = seekBar.value / 10;
  const d = player.engine.duration;
  seekBar.style.setProperty('--p', pct + '%');
  $('.t-cur', playerEl).textContent = fmtTime((pct / 100) * d);
  $('.t-left', playerEl).textContent = '-' + fmtTime(d - (pct / 100) * d);
});
seekBar.addEventListener('change', () => {
  if (!player.engine) return;
  player.engine.seek((seekBar.value / 1000) * player.engine.duration);
  player.dragging = false;
});

/* ---------- Download offline ---------- */

async function isDownloaded(id) {
  if (!('caches' in window) || !state.audio[id]) return false;
  const cache = await caches.open(AUDIO_CACHE);
  return !!(await cache.match(audioUrl(id)));
}

async function refreshDownloadButton() {
  const btn = $('[data-action="download"]', playerEl);
  if (!player.id || btn.hidden || btn.dataset.busy) return;
  const done = await isDownloaded(player.id);
  btn.textContent = done ? 'Scaricato ✓' : 'Scarica';
  btn.classList.toggle('on', done);
}

async function downloadAudio(id, btn) {
  if (await isDownloaded(id)) {
    openSheet(`<h3>Audio scaricato</h3>
      <p style="color:var(--text-2);margin-bottom:8px">Questo riassunto è disponibile offline.</p>
      <button class="option" data-action="remove-download" data-id="${id}">Rimuovi dal dispositivo</button>`);
    return;
  }
  const url = audioUrl(id);
  btn.dataset.busy = '1';
  try {
    const res = await fetch(url);
    if (!res.ok || !res.body) throw new Error(res.statusText);
    const total = Number(res.headers.get('content-length')) || 0;
    const reader = res.body.getReader();
    const parts = [];
    let got = 0;
    for (;;) {
      const { done, value } = await reader.read();
      if (done) break;
      parts.push(value);
      got += value.length;
      btn.textContent = total ? `${Math.round((got / total) * 100)}%` : `${(got / 1e6).toFixed(1)} MB`;
    }
    const blob = new Blob(parts, { type: 'audio/mpeg' });
    const cache = await caches.open(AUDIO_CACHE);
    await cache.put(url, new Response(blob, { headers: { 'Content-Type': 'audio/mpeg', 'Content-Length': String(blob.size) } }));
    toast('Disponibile offline');
  } catch {
    toast('Download non riuscito');
  } finally {
    delete btn.dataset.busy;
    refreshDownloadButton();
  }
}

async function removeDownload(id) {
  const cache = await caches.open(AUDIO_CACHE);
  for (const req of await cache.keys()) {
    if (new URL(req.url).pathname.endsWith(`/audio/${id}.mp3`)) await cache.delete(req);
  }
  toast('Audio rimosso dal dispositivo');
  refreshDownloadButton();
  if (route.name === 'library') render();
}

/* ---------- Sheet e toast ---------- */

const sheetEl = $('#sheet');
function openSheet(html) {
  $('.sheet-content', sheetEl).innerHTML = html;
  sheetEl.hidden = false;
}
function closeSheet() { sheetEl.hidden = true; }

let toastTimer;
function toast(msg) {
  const el = $('#toast');
  el.textContent = msg;
  el.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('show'), 2600);
}

/* ---------- Viste ---------- */

const view = $('#view');
let route = { name: 'home' };

function parseRoute() {
  const parts = location.hash.replace(/^#\/?/, '').split('/').filter(Boolean);
  const [a, b] = parts;
  if (a === 'libro' && state.books[b]) return { name: 'book', id: b };
  if (a === 'leggi' && state.books[b]) return { name: 'read', id: b };
  if (a === 'percorsi') return { name: 'paths' };
  if (a === 'percorso' && state.paths.some((p) => p.id === b)) return { name: 'path', id: b };
  if (a === 'libreria') return { name: 'library' };
  if (a === 'pratica') return { name: 'practice' };
  if (a === 'ripasso') return { name: 'review', id: state.books[b] ? b : null };
  if (a === 'strumenti') return { name: 'tools' };
  if (a === 'strumento' && state.toolbox.tools.some((t) => t.id === b)) return { name: 'tool', id: b };
  return { name: 'home' };
}

function bookCard(id) {
  const b = state.books[id];
  const p = state.progress[id];
  const ratio = progressRatio(id);
  const status = p?.done
    ? '<div class="done">✓ Completato</div>'
    : ratio > 0 ? `<div class="bar"><span style="width:${ratio * 100}%"></span></div>` : '';
  return `<a class="book-card" href="#/libro/${id}">
    ${coverHTML(b)}
    <div class="meta"><div class="t">${esc(b.title)}</div><div class="a">${fmtMinutes(bookDuration(id))} · ${esc(b.author)}</div>${status}</div>
  </a>`;
}

function pathStats(path) {
  const done = path.books.filter((id) => state.progress[id]?.done).length;
  return { done, total: path.books.length };
}

function pathCard(path, i) {
  const { done, total } = pathStats(path);
  const colors = path.colors || (i % 2 ? ['#11998e', '#2a5298'] : ['#ff7a59', '#6a5af9']);
  return `<a class="path-card" href="#/percorso/${path.id}" style="--c1:${colors[0]};--c2:${colors[1]}">
    <div class="k">Percorso · ${total} libri</div>
    <h3>${esc(path.title)}</h3>
    <p>${esc(path.description)}</p>
    <div class="progress"><div class="bar"><span style="width:${(done / total) * 100}%"></span></div>${done}/${total}</div>
  </a>`;
}

function greeting() {
  const h = new Date().getHours();
  return h < 13 ? 'Buongiorno' : h < 18 ? 'Buon pomeriggio' : 'Buonasera';
}

function continueCard() {
  const candidates = Object.entries(state.progress)
    .filter(([id, p]) => state.books[id] && !p.done && p.pos > 5)
    .sort((a, b) => b[1].t - a[1].t);
  if (!candidates.length) return '';
  const [id, p] = candidates[0];
  const b = state.books[id];
  return `<section class="section">
    <div class="continue">
      <a href="#/libro/${id}" style="display:contents">
        ${coverHTML(b)}
        <div class="info">
          <div class="k">Continua ad ascoltare</div>
          <div class="t">${esc(b.title)}</div>
          <div class="s">${fmtMinutes(Math.max(0, p.dur - p.pos))} rimanenti</div>
          <div class="bar"><span style="width:${progressRatio(id) * 100}%"></span></div>
        </div>
      </a>
      <button class="round-play" data-action="play" data-id="${id}" aria-label="Riprendi">${ICON.play}</button>
    </div>
  </section>`;
}

function installTip() {
  const standalone = window.matchMedia('(display-mode: standalone)').matches || navigator.standalone;
  const ios = /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1);
  if (standalone || !ios || store.get('tipClosed', false)) return '';
  return `<div class="install-tip">${ICON.share}
    <div><b>Installa l'app su iPhone</b><br>Tocca il pulsante Condividi di Safari e scegli «Aggiungi alla schermata Home».</div>
    <button class="close" data-action="close-tip" aria-label="Chiudi">×</button>
  </div>`;
}

function filteredBooks() {
  const q = state.query.trim().toLowerCase();
  return state.order.filter((id) => {
    const b = state.books[id];
    if (state.filter !== 'Tutti' && b.category !== state.filter) return false;
    return !q || `${b.title} ${b.originalTitle} ${b.author} ${b.category}`.toLowerCase().includes(q);
  });
}

function gridHTML() {
  const list = filteredBooks();
  return list.length ? list.map(bookCard).join('') : '<p class="empty" style="grid-column:1/-1">Nessun libro trovato.</p>';
}

function renderHome() {
  const categories = ['Tutti', ...new Set(state.order.map((id) => state.books[id].category))];
  return `
    <header class="page-head"><div><p>${greeting()}</p><h1>Manager in 15</h1></div></header>
    ${installTip()}
    ${continueCard()}
    <section class="section">
      <h2 class="section-title">Percorsi <a href="#/percorsi"><small>Vedi tutti</small></a></h2>
      <div class="paths-row">${state.paths.map(pathCard).join('')}</div>
    </section>
    <section class="section">
      <h2 class="section-title">Tutti i riassunti <small>${state.order.length} libri</small></h2>
      <input type="search" class="search" placeholder="Cerca per titolo, autore o tema" value="${esc(state.query)}" aria-label="Cerca un libro" enterkeyhint="search">
      <div class="chips">${categories.map((c) => `<button class="chip ${c === state.filter ? 'active' : ''}" data-action="filter" data-value="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="grid" id="book-grid">${gridHTML()}</div>
    </section>`;
}

function renderPaths() {
  return `
    <header class="page-head"><div><h1>Percorsi</h1><p>Libri scelti e ordinati per imparare passo dopo passo.</p></div></header>
    <div class="paths-list">${state.paths.map(pathCard).join('')}</div>`;
}

function backLink(fallback = '#/') {
  return `<button class="back" data-action="back" data-fallback="${fallback}">${ICON.back}Indietro</button>`;
}

function renderPath(id) {
  const i = state.paths.findIndex((p) => p.id === id);
  const path = state.paths[i];
  const next = path.books.find((bid) => !state.progress[bid]?.done);
  const started = path.books.some((bid) => state.progress[bid]);
  return `
    ${backLink('#/percorsi')}
    ${pathCard(path, i)}
    <p class="hint">${state.settings.autoNext
      ? 'Ascolto continuo attivo: alla fine di un riassunto parte il successivo del percorso.'
      : 'Ascolto continuo disattivato: puoi attivarlo in Libreria.'}</p>
    ${next ? `<button class="btn primary" style="width:100%;margin-top:14px" data-action="play" data-id="${next}" data-path="${path.id}">${ICON.play}${started ? 'Continua il percorso' : 'Inizia il percorso'}</button>` : '<p class="empty" style="margin-top:14px">Hai completato tutto il percorso. Ottimo lavoro!</p>'}
    <section class="section">
      <ol class="steps">
        ${path.books.map((bid, n) => {
          const b = state.books[bid];
          const done = state.progress[bid]?.done;
          return `<li class="step ${done ? 'done' : ''}">
            <span class="num">${done ? ICON.check.replace('<svg', '<svg width="16" height="16"') : n + 1}</span>
            <a href="#/libro/${bid}" style="display:contents">${coverHTML(b)}<div class="info"><div class="t">${esc(b.title)}</div><div class="s">${esc(b.author)} · ${fmtMinutes(bookDuration(bid))}</div></div></a>
            <button class="icon-btn" data-action="play" data-id="${bid}" data-path="${path.id}" aria-label="Ascolta ${esc(b.title)}">${ICON.play}</button>
          </li>`;
        }).join('')}
      </ol>
    </section>`;
}

async function renderBook(id) {
  const b = state.books[id];
  const summary = await getSummary(id);
  const p = state.progress[id];
  const saved = state.saved.includes(id);
  const chapters = state.audio[id]?.chapters
    || summary.chapters.reduce((acc, ch) => {
      const start = acc.length ? acc[acc.length - 1].start + acc[acc.length - 1].len : 0;
      acc.push({ title: ch.title, start, len: (ch.title.length + ch.paragraphs.join(' ').length) / CHARS_PER_SECOND });
      return acc;
    }, []);
  const inProgress = p && !p.done && p.pos > 5;
  return `
    ${backLink()}
    <div class="detail-hero" style="--c1:${b.colors[0]};--c2:${b.colors[1]}">
      ${coverHTML(b)}
      <h1>${esc(b.title)}</h1>
      ${b.originalTitle !== b.title ? `<p class="orig">${esc(b.originalTitle)}</p>` : ''}
      <p class="author">${esc(b.author)} · ${b.year}</p>
      <div class="facts">
        <span class="fact">${ICON.clock}${fmtMinutes(bookDuration(id))}</span>
        <span class="fact">${ICON.head}Audio + testo</span>
        <span class="fact">${esc(b.category)}</span>
      </div>
    </div>
    <div class="actions">
      <button class="btn primary" data-action="play" data-id="${id}">${ICON.play}${inProgress ? 'Continua' : 'Ascolta'}</button>
      <a class="btn" href="#/leggi/${id}">${ICON.text}Leggi</a>
      <button class="btn square ${saved ? 'saved' : ''}" data-action="save" data-id="${id}" aria-label="${saved ? 'Rimuovi dai salvati' : 'Salva'}">${saved ? ICON.bookmarkOn : ICON.bookmark}</button>
    </div>
    <p class="tagline">${esc(b.tagline)}</p>
    <section class="section" style="--c1:${b.colors[0]};--c2:${b.colors[1]}">
      <h2 class="section-title">Idee chiave</h2>
      <div class="ideas">${b.keyIdeas.map((k, i) => `<div class="idea"><b>${i + 1}</b>${esc(k)}</div>`).join('')}</div>
    </section>
    <section class="section">
      <h2 class="section-title">Capitoli <small>${chapters.length}</small></h2>
      <ol class="toc">${chapters.map((c, i) => `<li><button data-action="play-chapter" data-id="${id}" data-chapter="${i}">
        <span class="n">${i + 1}</span><span class="tt">${esc(c.title)}</span><span class="tm">${fmtTime(c.start)}</span></button></li>`).join('')}</ol>
      <button class="btn mark-done" data-action="toggle-done" data-id="${id}">${p?.done ? 'Segna come da ascoltare' : `${ICON.check}Segna come completato`}</button>
    </section>
    ${practiceSectionsHTML(id, summary)}`;
}

async function renderRead(id) {
  const b = state.books[id];
  const summary = await getSummary(id);
  return `
    <div class="reader-bar">
      ${backLink(`#/libro/${id}`)}
      <div class="reader-tools">
        <button class="pill" data-action="font" data-delta="-1" aria-label="Testo più piccolo">A−</button>
        <button class="pill" data-action="font" data-delta="1" aria-label="Testo più grande">A+</button>
        <button class="pill" data-action="open-note" data-id="${id}" aria-label="Le mie note">Note</button>
        <button class="pill on" data-action="play" data-id="${id}" aria-label="Ascolta">▶︎ Ascolta</button>
      </div>
    </div>
    <article class="reader" style="--reader-fs:${state.settings.readerFs}px">
      <h1>${esc(b.title)}</h1>
      <p class="by">${esc(b.author)} · ${fmtMinutes(bookDuration(id))} di ascolto</p>
      ${summary.chapters.map((c, i) => `<h2 id="ch-${i}">${esc(c.title)}</h2>${c.paragraphs.map((p) => `<p>${esc(p)}</p>`).join('')}`).join('')}
    </article>`;
}

function renderLibrary() {
  const ids = state.order;
  const done = ids.filter((id) => state.progress[id]?.done);
  const inProgress = ids.filter((id) => !state.progress[id]?.done && progressRatio(id) > 0)
    .sort((a, b) => state.progress[b].t - state.progress[a].t);
  const saved = state.saved.filter((id) => state.books[id]);
  const block = (title, list, empty) => `<section class="section">
      <h2 class="section-title">${title} <small>${list.length}</small></h2>
      ${list.length ? `<div class="grid">${list.map(bookCard).join('')}</div>` : `<p class="empty">${empty}</p>`}
    </section>`;
  return `
    <header class="page-head"><div><h1>Libreria</h1><p>I tuoi progressi e i libri salvati.</p></div></header>
    <div class="stats">
      <div class="stat"><b>${done.length}</b><span>completati</span></div>
      <div class="stat"><b>${Math.round(state.listened / 60)}</b><span>minuti ascoltati</span></div>
      <div class="stat"><b>${inProgress.length}</b><span>in corso</span></div>
    </div>
    ${block('In corso', inProgress, 'Nessun ascolto in corso. Scegli un libro da Scopri.')}
    ${block('Salvati', saved, 'Tocca il segnalibro in un libro per salvarlo qui.')}
    ${block('Completati', done, 'Qui troverai i riassunti che hai finito.')}
    <section class="section">
      <h2 class="section-title">Impostazioni</h2>
      ${'caches' in window && Object.keys(state.audio).length ? '<button class="option" data-action="download-all">Scarica tutti gli audio per l\'ascolto offline</button><button class="option" data-action="clear-downloads">Rimuovi gli audio scaricati</button>' : ''}
      <button class="option" data-action="toggle-autonext">Ascolto continuo nei percorsi <span class="val">${state.settings.autoNext ? 'Attivo' : 'Disattivo'}</span></button>
      <button class="option" data-action="reset">Azzera progressi e statistiche</button>
      <p style="color:var(--text-3);font-size:13px;margin-top:14px">${Object.keys(state.audio).length
        ? 'Audio generati con sintesi vocale neurale (Piper, voce italiana).'
        : 'Gli audio MP3 non sono ancora stati generati: i riassunti vengono letti con la voce del dispositivo.'}</p>
    </section>`;
}

async function render() {
  route = parseRoute();
  $$('.tabbar a').forEach((a) => {
    const tab = {
      home: 'home', book: 'home', read: 'home', paths: 'paths', path: 'paths', library: 'library',
      practice: 'practice', review: 'practice', tools: 'tools', tool: 'tools',
    }[route.name];
    a.classList.toggle('active', a.dataset.tab === tab);
  });
  let html;
  try {
    if (route.name === 'book') html = await renderBook(route.id);
    else if (route.name === 'read') html = await renderRead(route.id);
    else if (route.name === 'paths') html = renderPaths();
    else if (route.name === 'path') html = renderPath(route.id);
    else if (route.name === 'library') html = renderLibrary();
    else if (route.name === 'practice') html = await renderPractice();
    else if (route.name === 'review') { startReview(route.id); html = renderReview(); }
    else if (route.name === 'tools') html = renderTools();
    else if (route.name === 'tool') html = renderTool(route.id);
    else html = renderHome();
  } catch {
    html = `${backLink()}<p class="empty">Contenuto non disponibile offline. Riprova quando sei connesso.</p>`;
  }
  view.innerHTML = html;
  if (player.engine) updatePlayerUI();
  if (route.name === 'read' && player.id === route.id && player.engine) {
    $(`#ch-${player.chapterIndex()}`)?.scrollIntoView();
  }
}

/* ---------- Pratica: esercizi, sfida della settimana, note e ripasso ---------- */

const DAY = 86400000;
const BOX_DAYS = [0, 1, 3, 7, 14, 30]; // giorni di attesa prima del ripasso, per ogni scatola
const savePractice = () => store.set('practice', state.practice);
const saveCards = () => store.set('cards', state.cards);

// Le date sono mezzanotti locali, calcolate con il calendario per non sbagliare con l'ora legale.
function today(offsetDays = 0) {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  d.setDate(d.getDate() + offsetDays);
  return d.getTime();
}
const dayKey = (t) => { const d = new Date(t); return `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`; };

const ORDINAL = /^(Primo|Secondo|Terzo|Quarto|Quinto|Sesto|Settimo|Ottavo):\s*/;
function exercisesOf(summary) {
  const chapter = summary.chapters.find((c) => c.title.startsWith('Come metterlo in pratica'));
  if (!chapter) return [];
  return chapter.paragraphs.filter((t) => ORDINAL.test(t))
    .map((t) => t.replace(ORDINAL, '').replace(/^./, (c) => c.toUpperCase()));
}

function toggleExercise(bookId, index, forceDone = false) {
  const done = new Set(state.practice.exercises[bookId] || []);
  const nowDone = forceDone || !done.has(index);
  if (nowDone) done.add(index); else done.delete(index);
  state.practice.exercises[bookId] = [...done].sort();
  const ch = state.practice.challenge;
  if (nowDone && ch && ch.bookId === bookId && ch.index === index) {
    state.practice.challenge = null;
    toast('Sfida completata 💪');
  }
  savePractice();
  render();
}

const cardIds = (bookId) => (state.flashcards[bookId] || []).map((_, i) => `${bookId}:${i}`);
function cardContent(cardId) {
  const [bookId, i] = cardId.split(':');
  const card = state.flashcards[bookId]?.[Number(i)];
  return card ? { bookId, q: card[0], a: card[1] } : null;
}

// Un libro completato entra nel ripasso: le sue schede tornano a partire da domani.
function addToDeck(bookId) {
  let added = 0;
  for (const cid of cardIds(bookId)) {
    if (!state.cards[cid]) { state.cards[cid] = { box: 1, due: today(1) }; added++; }
  }
  if (added) saveCards();
}

const dueCards = () => Object.entries(state.cards)
  .filter(([cid, c]) => c.due <= today() && cardContent(cid))
  .sort((a, b) => a[1].due - b[1].due)
  .map(([cid]) => cid);

// Ripasso a scatole: chi sa la risposta sale di scatola e torna più tardi, chi sbaglia riparte.
function gradeCard(cid, grade) {
  const c = state.cards[cid] || { box: 1 };
  if (grade === 'again') c.box = 1;
  if (grade === 'good') c.box = Math.min(5, c.box + 1);
  c.due = today(BOX_DAYS[c.box]);
  state.cards[cid] = c;
  saveCards();
  state.practice.reviewed += 1;
  state.practice.reviewDays = [...new Set([...state.practice.reviewDays, dayKey(today())])].slice(-60);
  savePractice();
}

function reviewStreak() {
  const days = new Set(state.practice.reviewDays);
  let offset = days.has(dayKey(today())) ? 0 : -1; // la serie resta valida finché non salti un giorno intero
  let n = 0;
  while (days.has(dayKey(today(offset)))) { n++; offset--; }
  return n;
}

let review = null;
function startReview(bookId) {
  review = {
    bookId,
    queue: bookId ? cardIds(bookId) : dueCards().slice(0, 20),
    i: 0,
    count: 0,
    revealed: false,
    requeued: new Set(),
  };
}
const refreshReview = () => { view.innerHTML = renderReview(); };

function renderReview() {
  const r = review;
  const head = backLink(r.bookId ? `#/libro/${r.bookId}` : '#/pratica');
  if (!r.queue.length) {
    return `${head}<div class="review-end"><h1>Niente da ripassare</h1>
      <p>Per oggi hai finito. Le schede tornano a intervalli crescenti: 1, 3, 7, 14 e 30 giorni.</p>
      <a class="btn primary" href="#/pratica">Torna a Pratica</a></div>`;
  }
  if (r.i >= r.queue.length) {
    const tomorrow = Object.values(state.cards).filter((c) => c.due === today(1)).length;
    return `${head}<div class="review-end"><div class="big">🎉</div><h1>Ripasso completato</h1>
      <p>Hai ripassato ${r.count} ${r.count === 1 ? 'scheda' : 'schede'}.${tomorrow ? ` Domani ti aspettano ${tomorrow} schede.` : ''}</p>
      <a class="btn primary" href="#/pratica">Torna a Pratica</a></div>`;
  }
  const c = cardContent(r.queue[r.i]);
  const b = state.books[c.bookId];
  return `${head}
    <div class="review" style="--c1:${b.colors[0]}">
      <div class="review-progress"><span style="width:${(r.i / r.queue.length) * 100}%"></span></div>
      <div class="review-meta">${r.i + 1} di ${r.queue.length} · ${esc(b.title)}</div>
      <div class="flashcard">
        <div class="q">${esc(c.q)}</div>
        ${r.revealed ? `<div class="a">${esc(c.a)}</div>` : ''}
      </div>
      ${r.revealed
        ? `<div class="grades">
            <button class="btn" data-action="grade" data-grade="again">Da rivedere</button>
            <button class="btn" data-action="grade" data-grade="hard">Più o meno</button>
            <button class="btn primary" data-action="grade" data-grade="good">La sapevo</button>
          </div>`
        : `<button class="btn primary wide" data-action="reveal">Mostra la risposta</button>
          <p class="hint">Prova a rispondere ad alta voce prima di girare la scheda: ricordare costa fatica, ed è proprio questo che fissa le idee.</p>`}
    </div>`;
}

function practiceSectionsHTML(id, summary) {
  const exercises = exercisesOf(summary);
  const done = new Set(state.practice.exercises[id] || []);
  const ch = state.practice.challenge;
  const cards = cardIds(id);
  const inDeck = cards.filter((cid) => state.cards[cid]).length;
  return `
    ${exercises.length ? `<section class="section">
      <h2 class="section-title">Mettilo in pratica <small>${done.size}/${exercises.length}</small></h2>
      <ul class="exercises">${exercises.map((text, i) => `<li class="exercise ${done.has(i) ? 'done' : ''}">
        <button class="check" data-action="toggle-ex" data-id="${id}" data-index="${i}" aria-pressed="${done.has(i)}" aria-label="Segna come fatto">${ICON.check}</button>
        <div class="ex-body"><span class="ex-text">${esc(text)}</span>
          ${ch && ch.bookId === id && ch.index === i ? '<span class="tag">Sfida della settimana</span>'
            : done.has(i) ? '' : `<button class="link" data-action="set-challenge" data-id="${id}" data-index="${i}">Fanne la sfida della settimana</button>`}
        </div></li>`).join('')}</ul>
    </section>` : ''}
    ${cards.length ? `<section class="section">
      <h2 class="section-title">Ripasso</h2>
      <div class="review-cta"><p>${cards.length} schede per fissare le idee chiave.${inDeck ? ` ${inDeck} sono nel tuo ripasso periodico.` : ' Entrano nel ripasso periodico quando completi il riassunto.'}</p>
        <a class="btn" href="#/ripasso/${id}">Ripassa questo libro</a></div>
    </section>` : ''}
    <section class="section">
      <h2 class="section-title">Le mie note</h2>
      <textarea class="note" data-note="${id}" rows="5" placeholder="Come applichi questo libro nel tuo team?">${esc(state.practice.notes[id] || '')}</textarea>
      <p class="hint">Salvate automaticamente su questo dispositivo.</p>
    </section>`;
}

async function challengeHTML() {
  const ch = state.practice.challenge;
  if (ch && state.books[ch.bookId]) {
    const text = exercisesOf(await getSummary(ch.bookId))[ch.index] || '';
    const day = Math.round((today() - ch.start) / DAY) + 1;
    const over = day > 7;
    return `<div class="challenge">
      <div class="k">${over ? 'Settimana conclusa: com\'è andata?' : `Giorno ${day} di 7`} · <a href="#/libro/${ch.bookId}">${esc(state.books[ch.bookId].title)}</a></div>
      <p>${esc(text)}</p>
      <div class="row-btns">
        <button class="btn primary" data-action="challenge-done">${ICON.check}Fatto</button>
        <button class="btn" data-action="challenge-drop">${over ? 'Non ci sono riuscito' : 'Cambia sfida'}</button>
      </div></div>`;
  }
  // Nessuna sfida attiva: proponiamo il primo esercizio non fatto dei libri ascoltati di recente.
  const recent = state.order.filter((id) => state.progress[id])
    .sort((a, b) => (state.progress[b].t || 0) - (state.progress[a].t || 0)).slice(0, 5);
  for (const id of recent) {
    const exercises = exercisesOf(await getSummary(id));
    const done = new Set(state.practice.exercises[id] || []);
    const i = exercises.findIndex((_, k) => !done.has(k));
    if (i >= 0) {
      return `<div class="challenge suggest">
        <div class="k">Proposta da <a href="#/libro/${id}">${esc(state.books[id].title)}</a></div>
        <p>${esc(exercises[i])}</p>
        <div class="row-btns"><button class="btn primary" data-action="set-challenge" data-id="${id}" data-index="${i}">Accetta la sfida</button></div>
      </div>`;
    }
  }
  return '<p class="empty">Ascolta un riassunto: ti proporrò un esercizio da mettere in pratica per una settimana. Puoi anche sceglierlo dalla pagina di ogni libro.</p>';
}

function miniRow(id, sub) {
  return `<a class="mini-row" href="#/libro/${id}">${coverHTML(state.books[id])}
    <div class="info"><div class="t">${esc(state.books[id].title)}</div><div class="s">${esc(sub)}</div></div></a>`;
}

async function renderPractice() {
  const due = dueCards().length;
  const deck = Object.keys(state.cards).filter(cardContent).length;
  let challenge;
  try { challenge = await challengeHTML(); } catch { challenge = '<p class="empty">Sfida non disponibile offline.</p>'; }
  const withExercises = state.order.filter((id) => state.practice.exercises[id]?.length);
  const withNotes = state.order.filter((id) => state.practice.notes[id]);
  return `
    <header class="page-head"><div><h1>Pratica</h1><p>Ripassa, metti in pratica, rifletti.</p></div></header>
    <section class="review-hero">
      <div class="k">Ripasso di oggi</div>
      <div class="big">${due}</div>
      <div class="s">${due === 1 ? 'scheda da ripassare' : 'schede da ripassare'}</div>
      ${due ? '<a class="btn primary" href="#/ripasso">Inizia il ripasso</a>'
        : `<p class="s">${deck ? 'Per oggi hai finito: torna domani.' : 'Completa un riassunto per aggiungere le sue schede al ripasso, oppure ripassa un libro dalla sua pagina.'}</p>`}
    </section>
    <div class="stats" style="margin-top:12px">
      <div class="stat"><b>${deck}</b><span>schede nel ripasso</span></div>
      <div class="stat"><b>${state.practice.reviewed}</b><span>ripassate in tutto</span></div>
      <div class="stat"><b>${reviewStreak()}</b><span>giorni di fila</span></div>
    </div>
    <section class="section">
      <h2 class="section-title">Sfida della settimana</h2>
      ${challenge}
    </section>
    <section class="section">
      <h2 class="section-title">I tuoi esercizi</h2>
      ${withExercises.length ? withExercises.map((id) => miniRow(id, state.practice.exercises[id].length === 1 ? '1 esercizio fatto' : `${state.practice.exercises[id].length} esercizi fatti`)).join('')
        : '<p class="empty">Spunta gli esercizi nella sezione «Mettilo in pratica» di ogni libro.</p>'}
    </section>
    <section class="section">
      <h2 class="section-title">Le tue note <small>${withNotes.length}</small></h2>
      ${withNotes.length ? withNotes.map((id) => miniRow(id, state.practice.notes[id].replace(/\s+/g, ' '))).join('')
        : '<p class="empty">Le note che scrivi nella pagina di un libro o durante la lettura compaiono qui.</p>'}
    </section>`;
}

/* ---------- Strumenti ---------- */

function blockHTML(block) {
  const list = (tag, items) => `<${tag}>${items.map((t) => `<li>${esc(t)}</li>`).join('')}</${tag}>`;
  return `<h2>${esc(block.h)}</h2>${(block.p || []).map((t) => `<p>${esc(t)}</p>`).join('')}`
    + (block.ul ? list('ul', block.ul) : '') + (block.ol ? list('ol', block.ol) : '');
}

function renderTools() {
  const categories = ['Tutti', ...state.toolbox.categories];
  const list = state.toolbox.tools.filter((t) => state.toolFilter === 'Tutti' || t.category === state.toolFilter);
  return `
    <header class="page-head"><div><h1>Strumenti</h1><p>Schede pronte per il tuo lavoro di Scrum Master e team leader.</p></div></header>
    <div class="chips">${categories.map((c) => `<button class="chip ${c === state.toolFilter ? 'active' : ''}" data-action="tool-filter" data-value="${esc(c)}">${esc(c)}</button>`).join('')}</div>
    <div class="tools-list">${list.map((t) => `<a class="tool-card" href="#/strumento/${t.id}">
      <div class="k">${esc(t.category)}</div><div class="t">${esc(t.title)}</div><div class="s">${esc(t.summary)}</div></a>`).join('')}</div>`;
}

function renderTool(id) {
  const t = state.toolbox.tools.find((x) => x.id === id);
  const books = t.books.filter((bid) => state.books[bid]);
  return `
    ${backLink('#/strumenti')}
    <article class="tool">
      <div class="k">${esc(t.category)}</div>
      <h1>${esc(t.title)}</h1>
      <p class="lead">${esc(t.summary)}</p>
      ${t.blocks.map(blockHTML).join('')}
    </article>
    <section class="section">
      <h2 class="section-title">Dai libri</h2>
      <div class="row">${books.map(bookCard).join('')}</div>
    </section>`;
}

/* ---------- Azioni ---------- */

let navDepth = 0;
window.addEventListener('hashchange', () => {
  navDepth++;
  render().then(() => window.scrollTo(0, 0));
});

document.addEventListener('click', async (ev) => {
  const el = ev.target.closest('[data-action]');
  if (!el) return;
  const { action, id } = el.dataset;
  switch (action) {
    case 'play':
      player.context = el.dataset.path ? { pathId: el.dataset.path } : null;
      player.load(id).then(() => { renderPlayerStatic(); openPlayer(); });
      break;
    case 'play-chapter':
      player.load(id, { chapter: Number(el.dataset.chapter) }).then(openPlayer);
      break;
    case 'toggle': player.toggle(); break;
    case 'open-player': openPlayer(); break;
    case 'close-player': closePlayer(); break;
    case 'rewind': player.skip(-15); break;
    case 'back':
      if (navDepth > 0) { navDepth -= 2; history.back(); } else location.hash = el.dataset.fallback || '#/';
      break;
    case 'fwd': player.skip(30); break;
    case 'prev-chapter': player.prevChapter(); break;
    case 'next-chapter': player.gotoChapter(player.chapterIndex() + 1); break;
    case 'open-text':
      closePlayer();
      location.hash = `#/leggi/${player.id}`;
      break;
    case 'speed': {
      const i = RATES.indexOf(state.settings.rate);
      player.setRate(RATES[(i + 1) % RATES.length]);
      break;
    }
    case 'sleep':
      openSheet(`<h3>Timer di spegnimento</h3>${SLEEP_OPTIONS.map((o, i) =>
        `<button class="option" data-action="set-sleep" data-index="${i}">${o.label}</button>`).join('')}`);
      break;
    case 'set-sleep': {
      const opt = SLEEP_OPTIONS[Number(el.dataset.index)];
      player.sleep = opt.value === null ? null
        : opt.value === 'chapter' ? { chapter: player.chapterIndex() }
        : { until: Date.now() + opt.value * 60000 };
      closeSheet();
      toast(opt.value === null ? 'Timer disattivato' : `Timer: ${opt.label.toLowerCase()}`);
      updatePlayerUI();
      break;
    }
    case 'chapters': {
      const current = player.chapterIndex();
      openSheet(`<h3>Capitoli</h3>${player.engine.chapters.map((c, i) =>
        `<button class="option ${i === current ? 'selected' : ''}" data-action="goto-chapter" data-index="${i}"><span>${i + 1}. ${esc(c.title)}</span><span style="color:var(--text-3);font-size:13px">${fmtTime(c.start)}</span></button>`).join('')}`);
      break;
    }
    case 'goto-chapter':
      player.gotoChapter(Number(el.dataset.index));
      closeSheet();
      break;
    case 'download': downloadAudio(player.id, el); break;
    case 'remove-download': closeSheet(); removeDownload(el.dataset.id); break;
    case 'close-sheet': closeSheet(); break;
    case 'filter':
      state.filter = el.dataset.value;
      render();
      break;
    case 'save': {
      const i = state.saved.indexOf(id);
      if (i >= 0) state.saved.splice(i, 1); else state.saved.unshift(id);
      store.set('saved', state.saved);
      toast(i >= 0 ? 'Rimosso dai salvati' : 'Salvato in Libreria');
      render();
      break;
    }
    case 'toggle-done':
      player.markDone(id, !state.progress[id]?.done);
      render();
      break;
    case 'toggle-ex': toggleExercise(id, Number(el.dataset.index)); break;
    case 'set-challenge':
      state.practice.challenge = { bookId: id, index: Number(el.dataset.index), start: today() };
      savePractice();
      toast('Sfida della settimana impostata');
      render();
      break;
    case 'challenge-done': {
      const ch = state.practice.challenge;
      if (ch) toggleExercise(ch.bookId, ch.index, true);
      break;
    }
    case 'challenge-drop':
      state.practice.challenge = null;
      savePractice();
      render();
      break;
    case 'open-note':
      openSheet(`<h3>Le mie note · ${esc(state.books[id].title)}</h3>
        <textarea class="note" data-note="${id}" rows="8" placeholder="Come applichi questo libro nel tuo team?">${esc(state.practice.notes[id] || '')}</textarea>
        <p class="hint">Salvate automaticamente su questo dispositivo.</p>`);
      $('.note', sheetEl).focus();
      break;
    case 'reveal':
      review.revealed = true;
      refreshReview();
      break;
    case 'grade': {
      const cid = review.queue[review.i];
      const grade = el.dataset.grade;
      gradeCard(cid, grade);
      if (grade === 'again' && !review.requeued.has(cid)) {
        review.requeued.add(cid);
        review.queue.push(cid);
      }
      review.i++;
      review.count++;
      review.revealed = false;
      refreshReview();
      window.scrollTo(0, 0);
      break;
    }
    case 'tool-filter':
      state.toolFilter = el.dataset.value;
      render();
      break;
    case 'toggle-autonext':
      state.settings.autoNext = !state.settings.autoNext;
      store.set('settings', state.settings);
      renderPlayerStatic();
      render();
      break;
    case 'font': {
      state.settings.readerFs = clamp(state.settings.readerFs + Number(el.dataset.delta), 15, 26);
      store.set('settings', state.settings);
      $('.reader')?.style.setProperty('--reader-fs', state.settings.readerFs + 'px');
      break;
    }
    case 'close-tip':
      store.set('tipClosed', true);
      el.closest('.install-tip').remove();
      break;
    case 'download-all': {
      el.textContent = 'Download in corso…';
      const fake = document.createElement('button');
      for (const bid of Object.keys(state.audio)) {
        if (!(await isDownloaded(bid))) await downloadAudio(bid, fake);
      }
      el.textContent = 'Tutti gli audio sono disponibili offline ✓';
      break;
    }
    case 'clear-downloads':
      await caches.delete(AUDIO_CACHE);
      toast('Audio scaricati rimossi');
      refreshDownloadButton();
      break;
    case 'reset':
      if (confirm('Vuoi davvero azzerare progressi, salvati e statistiche?')) {
        state.progress = {};
        state.saved = [];
        state.listened = 0;
        saveProgress();
        store.set('saved', []);
        store.set('listened', 0);
        render();
      }
      break;
  }
});

// La ricerca aggiorna solo la griglia, così la tastiera resta aperta.
let noteTimer;
document.addEventListener('input', (e) => {
  if (e.target.matches('.search')) {
    state.query = e.target.value;
    $('#book-grid').innerHTML = gridHTML();
  }
  if (e.target.matches('.note')) {
    const { note } = e.target.dataset;
    const value = e.target.value;
    clearTimeout(noteTimer);
    noteTimer = setTimeout(() => {
      if (value.trim()) state.practice.notes[note] = value;
      else delete state.practice.notes[note];
      savePractice();
    }, 400);
  }
});

document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') { if (!sheetEl.hidden) closeSheet(); else if (!playerEl.hidden) closePlayer(); }
  if (e.key === ' ' && e.target === document.body && player.engine) { e.preventDefault(); player.toggle(); }
});

document.addEventListener('visibilitychange', () => { if (document.hidden) player.saveNow(); });
window.addEventListener('pagehide', () => player.saveNow());

/* ---------- Avvio ---------- */

async function start() {
  try {
    await loadData();
  } catch {
    view.innerHTML = '<p class="empty">Impossibile caricare il catalogo. Controlla la connessione e riprova.</p>';
    return;
  }
  await render();
  // Senza MP3 servono i testi per la voce del dispositivo: li carichiamo subito, così
  // il tocco su "Ascolta" può avviare la lettura senza attese di rete.
  if (!Object.keys(state.audio).length) {
    Promise.all(state.order.map((id) => getSummary(id).catch(() => null)));
  }
  // Prepara il mini player sull'ultimo libro ascoltato, senza avviare l'audio.
  const last = store.get('last', null);
  if (last && state.books[last] && !state.progress[last]?.done) {
    player.load(last, { autoplay: false }).then(updatePlayerUI).catch(() => {});
  }
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.register('sw.js').catch(() => {});
  }
}

start();
