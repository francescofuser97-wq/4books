'use strict';

/* ---------- Utilità ---------- */

const $ = (sel, el = document) => el.querySelector(sel);
const $$ = (sel, el = document) => [...el.querySelectorAll(sel)];
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

const AUDIO_CACHE = 'm15-audio';
const CHARS_PER_SECOND = 14; // stima per la durata della voce del dispositivo

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
  summaries: {},    // id -> {chapters: [{title, paragraphs}]}
  progress: store.get('progress', {}), // id -> {pos, dur, done, t}
  saved: store.get('saved', []),
  settings: Object.assign({ rate: 1, readerFs: 19 }, store.get('settings', {})),
  listened: store.get('listened', 0),
  filter: 'Tutti',
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
}

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
  },

  setupMediaSession() {
    if (!('mediaSession' in navigator)) return;
    const b = this.book;
    const base = new URL('.', location.href).href;
    navigator.mediaSession.metadata = new MediaMetadata({
      title: b.title,
      artist: b.author,
      album: 'Manager in 15',
      artwork: [
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

function coverHTML(b, extra = '') {
  return `<div class="cover" style="--c1:${b.colors[0]};--c2:${b.colors[1]}">
    <div class="cover-title">${esc(b.title)}</div>
    <div class="cover-author">${esc(b.author)}</div>${extra}
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
  $('.mini-cover', miniEl).style.cssText = `--c1:${b.colors[0]};--c2:${b.colors[1]}`;
  const speech = player.engine?.kind === 'speech';
  const note = $('.engine-note', playerEl);
  note.hidden = !speech;
  note.textContent = speech
    ? 'Lettura con la voce del dispositivo: tieni lo schermo acceso. Con l\'audio MP3 la riproduzione continua anche a schermo bloccato.'
    : '';
  $('[data-action="download"]', playerEl).hidden = speech || !('caches' in window);
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
  const first = state.books[path.books[0]];
  const second = state.books[path.books[1]] || first;
  const colors = i % 2 ? [second.colors[0], first.colors[1]] : ['#ff7a59', '#6a5af9'];
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

function renderHome() {
  const categories = ['Tutti', ...new Set(state.order.map((id) => state.books[id].category))];
  const list = state.order.filter((id) => state.filter === 'Tutti' || state.books[id].category === state.filter);
  return `
    <header class="page-head"><div><p>${greeting()}</p><h1>Manager in 15</h1></div></header>
    ${installTip()}
    ${continueCard()}
    <section class="section">
      <h2 class="section-title">Percorsi <a href="#/percorsi"><small>Vedi tutti</small></a></h2>
      <div class="paths-list">${state.paths.map(pathCard).join('')}</div>
    </section>
    <section class="section">
      <h2 class="section-title">Tutti i riassunti <small>${state.order.length} libri</small></h2>
      <div class="chips">${categories.map((c) => `<button class="chip ${c === state.filter ? 'active' : ''}" data-action="filter" data-value="${esc(c)}">${esc(c)}</button>`).join('')}</div>
      <div class="grid">${list.map(bookCard).join('')}</div>
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
    ${next ? `<button class="btn primary" style="width:100%;margin-top:14px" data-action="play" data-id="${next}">${ICON.play}${started ? 'Continua il percorso' : 'Inizia il percorso'}</button>` : '<p class="empty" style="margin-top:14px">Hai completato tutto il percorso. Ottimo lavoro!</p>'}
    <section class="section">
      <ol class="steps">
        ${path.books.map((bid, n) => {
          const b = state.books[bid];
          const done = state.progress[bid]?.done;
          return `<li class="step ${done ? 'done' : ''}">
            <span class="num">${done ? ICON.check.replace('<svg', '<svg width="16" height="16"') : n + 1}</span>
            <a href="#/libro/${bid}" style="display:contents">${coverHTML(b)}<div class="info"><div class="t">${esc(b.title)}</div><div class="s">${esc(b.author)} · ${fmtMinutes(bookDuration(bid))}</div></div></a>
            <button class="icon-btn" data-action="play" data-id="${bid}" aria-label="Ascolta ${esc(b.title)}">${ICON.play}</button>
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
    </section>`;
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
      <button class="option" data-action="reset">Azzera progressi e statistiche</button>
      <p style="color:var(--text-3);font-size:13px;margin-top:14px">${Object.keys(state.audio).length
        ? 'Audio generati con sintesi vocale neurale (Piper, voce italiana).'
        : 'Gli audio MP3 non sono ancora stati generati: i riassunti vengono letti con la voce del dispositivo.'}</p>
    </section>`;
}

async function render() {
  route = parseRoute();
  $$('.tabbar a').forEach((a) => {
    const tab = { home: 'home', book: 'home', read: 'home', paths: 'paths', path: 'paths', library: 'library' }[route.name];
    a.classList.toggle('active', a.dataset.tab === tab);
  });
  let html;
  try {
    if (route.name === 'book') html = await renderBook(route.id);
    else if (route.name === 'read') html = await renderRead(route.id);
    else if (route.name === 'paths') html = renderPaths();
    else if (route.name === 'path') html = renderPath(route.id);
    else if (route.name === 'library') html = renderLibrary();
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
      player.load(id).then(openPlayer);
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
