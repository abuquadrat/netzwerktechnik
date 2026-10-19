'use strict';
/* =========================================================
   Netzwerktechnik-Trainer – Kern
   Themen registrieren sich in topics/*.js über registerTopic({...}).
   Aufbau eines Themas: siehe topics/_vorlage.js
   ========================================================= */

const App = { topics: [], byId: {}, categories: [], cleanup: [], cur: [] };

function registerTopic(t) {
  if (App.byId[t.id]) { console.warn('Doppelte Themen-ID:', t.id); return; }
  for (const k of ['quiz', 'cards', 'cheat', 'generators', 'visuals', 'merke']) t[k] = t[k] || [];
  t.levels = t.levels || {};
  t.color = t.color || '#2dd4bf';
  App.topics.push(t);
  App.byId[t.id] = t;
  if (!App.categories.includes(t.category)) App.categories.push(t.category);
}

/* ---------- Helfer ---------- */
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const esc = s => String(s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const rnd = n => Math.floor(Math.random() * n);
const pick = a => a[rnd(a.length)];
function shuffle(a) { a = [...a]; for (let i = a.length - 1; i > 0; i--) { const j = rnd(i + 1); [a[i], a[j]] = [a[j], a[i]]; } return a; }
const fmtTime = ms => { const s = Math.floor(ms / 1000); return String(Math.floor(s / 60)).padStart(2, '0') + ':' + String(s % 60).padStart(2, '0'); };
const fmtNum = n => (typeof n === 'bigint' ? n : Number(n)).toLocaleString('de-DE');
function onCleanup(fn) { App.cleanup.push(fn); }
function runCleanup() { App.cleanup.splice(0).forEach(f => { try { f(); } catch (e) { console.error(e); } }); }
function onKey(fn) { document.addEventListener('keydown', fn); onCleanup(() => document.removeEventListener('keydown', fn)); }

/* ---------- Speicher (localStorage) ---------- */
const Store = {
  key: 'nwt-progress-v1',
  data: null,
  load() {
    try { this.data = JSON.parse(localStorage.getItem(this.key)) || {}; } catch (e) { this.data = {}; }
    this.data.topics = this.data.topics || {};
    this.data.mistakes = this.data.mistakes || [];
    this.data.settings = this.data.settings || {};
    this.data.exams = this.data.exams || [];
  },
  save() { try { localStorage.setItem(this.key, JSON.stringify(this.data)); } catch (e) { /* privat/blockiert */ } },
  topic(id) { return (this.data.topics[id] = this.data.topics[id] || { read: [], best: 0, attempts: 0 }); },
};

function topicProgress(id) {
  const p = Store.topic(id);
  return Math.round(Math.min(p.read.length, 3) / 3 * 40 + (p.best || 0) * 0.6);
}

/* ---------- Antwort-Normalisierung für Eingabefragen ---------- */
const Norm = {
  text: s => String(s).trim().toLowerCase().replace(/\s+/g, ' '),
  compact: s => String(s).toLowerCase().replace(/\s+/g, ''),
  num: s => {
    let v = String(s).trim().replace(/\s/g, '').replace(/[a-zäöü%/]+$/i, '');
    if (/^\d{1,3}(\.\d{3})+$/.test(v)) v = v.replace(/\./g, '');
    v = v.replace(',', '.');
    const n = parseFloat(v);
    return isNaN(n) ? '#' + s : String(n);
  },
  ipv6: s => { try { return IPv6.expand(String(s).trim().replace(/\/\d+$/, '')); } catch (e) { return '#' + s; } },
  iid: s => String(s).toLowerCase().replace(/\s/g, '').replace(/^:+|:+$/g, '').split(':').map(g => g.padStart(4, '0')).join(''),
  dns: s => String(s).trim().toLowerCase().replace(/\.+$/, ''),
};
function checkInput(q, val) {
  const n = Norm[q.norm || 'text'];
  const v = n(val);
  return q.accept.some(a => n(a) === v);
}

/* ---------- Fehlerliste ---------- */
const qKey = q => (q.topicId || '') + '|' + q.q;
function addMistake(q) {
  const k = qKey(q);
  if (Store.data.mistakes.some(m => qKey(m) === k)) return;
  Store.data.mistakes.push(JSON.parse(JSON.stringify(q)));
  if (Store.data.mistakes.length > 250) Store.data.mistakes.shift();
  Store.save();
}
function removeMistake(q) {
  const k = qKey(q), before = Store.data.mistakes.length;
  Store.data.mistakes = Store.data.mistakes.filter(m => qKey(m) !== k);
  if (Store.data.mistakes.length !== before) Store.save();
}

/* =========================================================
   UI-Bausteine (von Themen-Visualisierungen nutzbar)
   ========================================================= */
const UI = {};
let uidCounter = 0;

UI.ring = (pct, label) => `<div class="ring" style="--p:${pct}"><div><b>${pct}%</b><span>${label}</span></div></div>`;
UI.pkt = rows => `<table class="pkt-tbl">${rows.map(([k, v]) => `<tr><th>${k}</th><td>${v}</td></tr>`).join('')}</table>`;
UI.terminal = (html, title = 'Eingabeaufforderung') => `<div class="terminal"><span class="tb">● ● ●&nbsp;&nbsp; ${title}</span><span class="pre">${html}</span></div>`;

/**
 * Animiertes Sequenzdiagramm.
 * cfg = { actors:[{id,label,icon,off}], steps:[{from,to,label,kind:'uc'|'bc'|'mc'|'err'|'self',title,html}], intro, onStep(i,panel) }
 */
UI.sequence = function (root, cfg) {
  const uid = 'sq' + (++uidCounter);
  let cur = -1, timer = null;
  const W = 760, n = cfg.actors.length, pad = 96;
  const ax = {};
  cfg.actors.forEach((a, i) => { ax[a.id] = n === 1 ? W / 2 : pad + i * (W - 2 * pad) / (n - 1); });
  root.innerHTML = `<div class="seq">
    <div class="seq-svg"></div>
    <div class="seq-legend"><span class="lg-uc">Unicast</span><span class="lg-bc">Broadcast</span><span class="lg-mc">Multicast</span><span class="lg-self">Interner Schritt</span><span class="lg-err">Keine Antwort / Fehler</span></div>
    <div class="seq-ctrl">
      <button class="btn sm" data-a="reset" title="Von vorn">⏮</button>
      <button class="btn sm" data-a="prev">◀ Zurück</button>
      <button class="btn sm primary" data-a="next">Weiter ▶</button>
      <button class="btn sm" data-a="play">⏵ Automatisch</button>
      <span class="seq-count"></span>
    </div>
    <div class="seq-panel"></div></div>`;
  const svgBox = $('.seq-svg', root), panel = $('.seq-panel', root), count = $('.seq-count', root);
  const btn = a => $(`[data-a="${a}"]`, root);

  function draw() {
    const H = 72 + cfg.steps.length * 54 + 16;
    let s = `<svg viewBox="0 0 ${W} ${H}" class="seq-diagram" xmlns="http://www.w3.org/2000/svg"><defs>` +
      ['uc', 'bc', 'mc', 'err', 'self'].map(k => `<marker id="${uid}-${k}" class="mk-${k}" viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M0,0 L10,5 L0,10 z"/></marker>`).join('') + '</defs>';
    cfg.actors.forEach(a => {
      const x = ax[a.id];
      s += `<line class="life" x1="${x}" y1="54" x2="${x}" y2="${H - 6}"/>
        <rect class="actor ${a.off ? 'off' : ''}" x="${x - 74}" y="8" width="148" height="44" rx="11"/>
        <text class="actor-t" x="${x}" y="36" text-anchor="middle">${a.icon || ''} ${a.label}</text>`;
    });
    cfg.steps.forEach((st, i) => {
      if (i > cur) return;
      const y = 72 + i * 54 + 22, k = st.kind || (st.from === st.to ? 'self' : 'uc'), isCur = i === cur;
      const cls = `msg k-${k} ${isCur ? 'cur' : 'past'}`;
      if (st.from === st.to) {
        const x = ax[st.from], left = x > W / 2;
        const d = left ? `M${x} ${y - 10} h-40 v20 h34` : `M${x} ${y - 10} h40 v20 h-34`;
        s += `<g class="${cls}"><path class="ln" d="${d}" marker-end="url(#${uid}-${k})"/>
          <text class="ml" x="${left ? x - 50 : x + 50}" y="${y + 5}" text-anchor="${left ? 'end' : 'start'}">${i + 1}. ${st.label}</text></g>`;
      } else {
        const x1 = ax[st.from], x2 = ax[st.to], dir = x2 > x1 ? 1 : -1, xs = x1 + dir * 4, xe = x2 - dir * 6;
        s += `<g class="${cls}"><line class="ln" x1="${xs}" y1="${y}" x2="${xe}" y2="${y}" marker-end="url(#${uid}-${k})"/>
          <text class="ml" x="${(x1 + x2) / 2}" y="${y - 9}" text-anchor="middle">${i + 1}. ${st.label}</text>
          ${isCur ? `<circle class="pkt" r="7" cx="${xs}" cy="${y}"><animate attributeName="cx" from="${xs}" to="${k === 'err' ? (xs + xe) / 2 : xe}" dur="0.9s" fill="freeze"/>${k === 'err' ? '<animate attributeName="opacity" from="1" to="0" begin="0.6s" dur="0.4s" fill="freeze"/>' : ''}</circle>` : ''}</g>`;
      }
    });
    svgBox.innerHTML = s + '</svg>';
    if (cur < 0) panel.innerHTML = `<div class="seq-intro">${cfg.intro || 'Klicke auf <b>Weiter</b>, um den Ablauf Schritt für Schritt zu sehen.'}</div>`;
    else { const st = cfg.steps[cur]; panel.innerHTML = `<h3><span class="stepno">${cur + 1}</span> ${st.title || st.label}</h3>${st.html || ''}`; }
    count.textContent = `Schritt ${cur + 1} / ${cfg.steps.length}`;
    btn('prev').disabled = cur < 0;
    btn('next').disabled = cur >= cfg.steps.length - 1;
    cfg.onStep && cfg.onStep(cur, panel);
  }
  function stop() { clearInterval(timer); timer = null; btn('play').textContent = '⏵ Automatisch'; }
  function go(i) { cur = Math.max(-1, Math.min(cfg.steps.length - 1, i)); draw(); }
  root.querySelector('.seq-ctrl').addEventListener('click', e => {
    const a = e.target.closest('[data-a]')?.dataset.a;
    if (!a) return;
    if (a !== 'play') stop();
    if (a === 'reset') go(-1);
    if (a === 'prev') go(cur - 1);
    if (a === 'next') go(cur + 1);
    if (a === 'play') {
      if (timer) return stop();
      if (cur >= cfg.steps.length - 1) go(-1);
      btn('play').textContent = '⏸ Pause';
      go(cur + 1);
      timer = setInterval(() => {
        if (!root.isConnected) return stop();
        if (cur >= cfg.steps.length - 1) return stop();
        go(cur + 1);
      }, 2800);
    }
  });
  draw();
  return { go, stop };
};

/* =========================================================
   Quiz-Engine
   Frage: {q, a:[...], c:index, e:'Erklärung'}  (Multiple Choice)
      oder {type:'input', q, accept:[...], norm:'text'|'compact'|'num'|'ipv6'|'iid'|'dns', e, hint, placeholder}
   ========================================================= */
function runQuiz(root, questions, opts = {}) {
  const st = { i: 0, score: 0, wrong: [], results: [], start: Date.now(), locked: false };
  let timerId = null;
  if (opts.timer) {
    timerId = setInterval(() => {
      if (!root.isConnected) return clearInterval(timerId);
      const t = $('.quiz-timer', root); if (t) t.textContent = fmtTime(Date.now() - st.start);
    }, 1000);
    onCleanup(() => clearInterval(timerId));
  }
  let curOpts = [];
  const correctText = q => q.type === 'input' ? `<code>${esc(q.accept[0])}</code>` : q.a[q.c];

  function render() {
    if (st.i >= questions.length) return finish();
    const q = questions[st.i];
    st.locked = false;
    const topic = q.topicId && App.byId[q.topicId];
    root.innerHTML = `<div class="quiz card">
      <div class="quiz-top"><span class="muted">Frage ${st.i + 1} von ${questions.length}</span>
        ${opts.showTopic && topic ? `<span class="chip" style="--tc:${topic.color}">${topic.icon} ${topic.title}</span>` : ''}
        <span class="spacer"></span>${opts.timer ? `<span class="quiz-timer">${fmtTime(Date.now() - st.start)}</span>` : ''}
        <span class="quiz-score">✔ ${st.score}</span></div>
      <div class="bar"><i style="width:${st.i / questions.length * 100}%"></i></div>
      <div class="quiz-q">${q.q}</div>
      <div class="quiz-body"></div><div class="quiz-feedback"></div><div class="quiz-actions"></div></div>`;
    const body = $('.quiz-body', root);
    if (q.type === 'input') {
      body.innerHTML = `<form class="quiz-input"><input type="text" autocomplete="off" spellcheck="false" placeholder="${esc(q.placeholder || 'Antwort eingeben …')}"><button class="btn primary">Prüfen</button></form>${q.hint ? `<p class="hint">💡 ${q.hint}</p>` : ''}`;
      const f = $('form', body), inp = $('input', body);
      inp.focus();
      f.onsubmit = e => {
        e.preventDefault();
        if (st.locked || !inp.value.trim()) return;
        const ok = checkInput(q, inp.value);
        inp.disabled = true; inp.classList.add(ok ? 'ok' : 'bad'); $('button', f).disabled = true;
        answer(ok);
      };
    } else {
      curOpts = q.a.map((t, i) => ({ t, ok: i === q.c }));
      if (!q.noShuffle) curOpts = shuffle(curOpts);
      body.innerHTML = `<div class="opts">${curOpts.map((o, i) => `<button class="opt" data-i="${i}"><span class="key">${i + 1}</span><span>${o.t}</span></button>`).join('')}</div>`;
      $$('.opt', body).forEach(b => b.onclick = () => choose(+b.dataset.i));
    }
  }
  function choose(i) {
    if (st.locked || !curOpts[i]) return;
    const btns = $$('.opt', root);
    btns.forEach((b, j) => { b.disabled = true; if (curOpts[j].ok) b.classList.add('ok'); });
    if (!curOpts[i].ok) btns[i].classList.add('bad');
    answer(curOpts[i].ok);
  }
  function answer(ok) {
    st.locked = true;
    const q = questions[st.i];
    st.results.push({ q, ok });
    if (ok) { st.score++; removeMistake(q); } else { st.wrong.push(q); addMistake(q); }
    opts.onAnswer && opts.onAnswer(q, ok);
    $('.quiz-score', root).textContent = '✔ ' + st.score;
    $('.quiz-feedback', root).innerHTML = `<div class="fb ${ok ? 'ok' : 'bad'}"><b>${ok ? '✅ Richtig!' : '❌ Leider falsch.'}</b>${!ok ? ` Richtig wäre: ${correctText(q)}` : ''}${q.e ? `<p>${q.e}</p>` : ''}</div>`;
    $('.quiz-actions', root).innerHTML = `<button class="btn primary" id="qNext">${st.i + 1 < questions.length ? 'Weiter →' : 'Auswertung →'}</button>`;
    const nb = $('#qNext', root);
    nb.onclick = () => { st.i++; render(); };
    nb.focus();
  }
  function finish() {
    clearInterval(timerId);
    const pct = questions.length ? Math.round(st.score / questions.length * 100) : 0;
    const msg = pct >= 90 ? '🏆 Hervorragend!' : pct >= 75 ? '🎉 Sehr gut!' : pct >= 50 ? '👍 Solide – da geht noch was.' : '💪 Dranbleiben! Lies die Erklärungen nochmal.';
    root.innerHTML = `<div class="card result">${UI.ring(pct, 'richtig')}
      <div style="flex:1;min-width:250px"><h2>${msg}</h2>
      <p>${st.score} von ${questions.length} Fragen richtig${opts.timer ? ` · Zeit: <b>${fmtTime(Date.now() - st.start)}</b>` : ''}.</p>
      ${opts.extra ? opts.extra(st) : ''}
      <div class="row">${opts.again ? '<button class="btn primary" id="qAgain">🔁 Nochmal</button>' : ''}
      ${opts.backHref ? `<a class="btn" href="${opts.backHref}">← Zurück</a>` : ''}
      ${st.wrong.length ? '<a class="btn" href="#/fehler">🩹 Zum Fehlertraining</a>' : ''}</div></div></div>
      ${st.wrong.length ? `<div class="card"><h3>Das solltest du wiederholen</h3>${st.wrong.map(q => `<div class="review"><div class="rq">${q.q}</div><div class="ra">✔ ${correctText(q)}</div>${q.e ? `<div class="re">${q.e}</div>` : ''}</div>`).join('')}</div>` : ''}`;
    if (opts.again) $('#qAgain', root).onclick = opts.again;
    if (typeof Player !== 'undefined') Player.addXP(st.score * 5);
    opts.onFinish && opts.onFinish(pct, st);
  }
  onKey(e => {
    if (!root.isConnected || st.locked || e.target.tagName === 'INPUT') return;
    const n = parseInt(e.key, 10);
    if (n >= 1 && n <= 9) choose(n - 1);
  });
  render();
}

function buildTopicQuiz(t, perGen = 2) {
  const qs = t.quiz.map(q => ({ ...q, topicId: t.id }));
  t.generators.forEach(g => { for (let i = 0; i < perGen; i++) qs.push({ ...g.make(), topicId: t.id }); });
  return shuffle(qs);
}

/* =========================================================
   Ansichten
   ========================================================= */
const LEVELS = {
  1: { name: 'Einfach', icon: '🌱', desc: 'Mit Alltagsbildern erklärt' },
  2: { name: 'Prüfungswissen', icon: '📘', desc: 'Das musst du können' },
  3: { name: 'Profi', icon: '🚀', desc: 'Tiefer & Hintergründe' },
};

function renderNav() {
  const [page, a] = App.cur;
  const m = Store.data.mistakes.length;
  const link = (href, label, active, extra = '') => `<a href="${href}" class="${active ? 'active' : ''}">${label}${extra}</a>`;
  $('#nav').innerHTML =
    link('#/', '<span class="ni">🏠</span>Übersicht', !page) +
    link('#/spiele', '<span class="ni">🎮</span>Spiele', page === 'spiele' || page === 'spiel') +
    link('#/pruefung', '<span class="ni">📝</span>Prüfungsmodus', page === 'pruefung') +
    link('#/fehler', '<span class="ni">🩹</span>Fehlertraining', page === 'fehler', m ? `<span class="badge">${m}</span>` : '') +
    link('#/karten', '<span class="ni">🃏</span>Karteikarten', page === 'karten') +
    link('#/trainer', '<span class="ni">🧮</span>Rechentrainer', page === 'trainer') +
    link('#/spick', '<span class="ni">📋</span>Spickzettel', page === 'spick') +
    App.categories.map(cat => `<div class="nav-sec">${cat}</div>` + App.topics.filter(t => t.category === cat).map(t =>
      link(`#/thema/${t.id}`, `<span class="ni">${t.icon}</span>${t.title}`, (page === 'thema' || page === 'quiz') && a === t.id, `<span class="pct">${topicProgress(t.id)}%</span>`)).join('')).join('');
}

function topicCard(t) {
  const p = Store.topic(t.id);
  return `<a class="tcard" href="#/thema/${t.id}" style="--tc:${t.color}">
    <div class="tcard-icon">${t.icon}</div>
    <div class="tcard-body"><h3>${t.title}</h3><p>${t.subtitle || ''}</p>
      <div class="bar"><i style="width:${topicProgress(t.id)}%"></i></div>
      <div class="tcard-meta"><span class="dots" title="Gelesene Stufen">${[1, 2, 3].map(l => `<i class="${p.read.includes(l) ? 'on' : ''}"></i>`).join('')} Stufen</span><span>Quiz-Bestwert: ${p.best || 0}%</span></div>
    </div></a>`;
}

function examCountdown() {
  const d = Store.data.settings.examDate;
  let txt = 'Prüfungsdatum eintragen:';
  if (d) {
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const diff = Math.round((new Date(d + 'T00:00') - today) / 86400000);
    txt = diff > 1 ? `Noch <b>${diff} Tage</b> bis zur Prüfung` : diff === 1 ? '<b>Morgen</b> ist Prüfung – du schaffst das!' : diff === 0 ? '<b>Heute</b> ist Prüfung – viel Erfolg! 🍀' : 'Prüfung geschafft? 🎉';
  }
  return `<label class="exam-date">📅 ${txt}<input type="date" id="examDate" value="${d || ''}"></label>`;
}

function viewHome(main) {
  const total = App.topics.length;
  const avg = total ? Math.round(App.topics.reduce((s, t) => s + topicProgress(t.id), 0) / total) : 0;
  const next = [...App.topics].sort((a, b) => topicProgress(a.id) - topicProgress(b.id))[0];
  const bests = App.topics.map(t => Store.topic(t.id).best || 0);
  const avgBest = total ? Math.round(bests.reduce((a, b) => a + b, 0) / total) : 0;
  const readAll = App.topics.filter(t => Store.topic(t.id).read.length >= 3).length;
  main.innerHTML = `
    <section class="hero">
      <div><h1>Netzwerktechnik – <span class="grad">verstehen statt pauken</span></h1>
        <p>Jedes Thema in drei Schwierigkeitsstufen, mit animierten Abläufen, Rechnern zum Ausprobieren, Quizzen und Karteikarten. Dein Fortschritt wird auf diesem Gerät gespeichert.</p>
        <div class="hero-actions">
          ${next ? `<a class="btn primary big" href="#/thema/${next.id}">▶ Weiter mit: ${next.title}</a>` : ''}
          <a class="btn big" href="#/spiele">🎮 Spielen</a>
          <a class="btn big" href="#/pruefung">📝 Prüfungsmodus</a>
        </div></div>
      <div class="hero-side">${UI.ring(avg, 'Gesamtfortschritt')}${examCountdown()}</div>
    </section>
    <a class="card home-player" href="#/spiele">${Player.badge()}</a>
    <div class="stats">
      <div class="stat"><b>${total}</b><span>Themen</span></div>
      <div class="stat"><b>${readAll}/${total}</b><span>komplett gelesen (alle 3 Stufen)</span></div>
      <div class="stat"><b>${avgBest}%</b><span>Ø Quiz-Bestwert</span></div>
      <div class="stat"><b>${Store.data.mistakes.length}</b><span>offene Fehler <a href="#/fehler">→ üben</a></span></div>
    </div>
    ${App.categories.map(cat => `<h2 class="sec-title">${cat}</h2><div class="grid cards">${App.topics.filter(t => t.category === cat).map(topicCard).join('')}</div>`).join('')}
    <div class="card" style="margin-top:34px"><h2>🗺️ So lernst du am effektivsten</h2>
      <div class="flow"><span>🌱 Einfach lesen</span><i>→</i><span>🔬 Visualisierung durchklicken</span><i>→</i><span>📘 Prüfungswissen</span><i>→</i><span>🎯 Themen-Quiz</span><i>→</i><span>🩹 Fehlertraining</span><i>→</i><span>📝 Prüfungsmodus</span></div>
      <p class="muted">Tipp: Am Abend vor der Prüfung nur noch Karteikarten und den Spickzettel durchgehen.</p></div>`;
  $('#examDate').onchange = e => { Store.data.settings.examDate = e.target.value; Store.save(); viewHome(main); };
}

function viewTopic(main, t) {
  const st = Store.topic(t.id);
  const idx = App.topics.indexOf(t);
  const prev = App.topics[idx - 1], next = App.topics[idx + 1];
  main.innerHTML = `
    <header class="topic-head" style="--tc:${t.color}">
      <div class="topic-icon">${t.icon}</div>
      <div class="topic-title"><div class="crumb"><a href="#/">Übersicht</a> › ${t.category}</div><h1>${t.title}</h1><p>${t.subtitle || ''}</p></div>
      <div class="topic-actions"><a class="btn primary" href="#/quiz/${t.id}">🎯 Quiz starten</a><a class="btn" href="#/spiele/${t.id}">🎮 Spielen</a>${t.cards.length ? `<a class="btn" href="#/karten/${t.id}">🃏 Karteikarten</a>` : ''}</div>
    </header>
    <div class="level-tabs">${[1, 2, 3].map(l => `<button data-l="${l}">${LEVELS[l].icon} ${LEVELS[l].name}<span class="tick">${st.read.includes(l) ? '✔' : ''}</span><small>${LEVELS[l].desc}</small></button>`).join('')}</div>
    <article class="card content" id="lvlContent"></article>
    ${t.visuals.length ? `<section class="card" id="visCard"><div class="sec-head"><h2>🔬 Interaktiv ausprobieren</h2><div class="vtabs">${t.visuals.map((v, i) => `<button class="btn sm" data-v="${i}">${v.title}</button>`).join('')}</div></div><div id="visRoot"></div></section>` : ''}
    ${t.merke.length ? `<section class="card merke"><h2>🧠 Merksätze</h2><ul>${t.merke.map(m => `<li>${m}</li>`).join('')}</ul></section>` : ''}
    <div class="card"><div class="row" style="margin:0"><b>Bereit?</b><span class="muted">Teste dein Wissen zu ${t.title}.</span><span class="spacer"></span><a class="btn primary" href="#/quiz/${t.id}">🎯 Quiz starten</a></div></div>
    <nav class="pager">${prev ? `<a class="btn" href="#/thema/${prev.id}">← ${prev.icon} ${prev.title}</a>` : '<span></span>'}${next ? `<a class="btn" href="#/thema/${next.id}">${next.icon} ${next.title} →</a>` : ''}</nav>`;

  function setLevel(l) {
    if (!t.levels[l]) l = 2;
    Store.data.settings.level = l;
    if (!st.read.includes(l)) st.read.push(l);
    Store.save();
    $('#lvlContent').innerHTML = t.levels[l] || '<p class="muted">Für diese Stufe gibt es noch keinen Inhalt.</p>';
    $$('.level-tabs button').forEach(b => {
      const bl = +b.dataset.l;
      b.classList.toggle('active', bl === l);
      $('.tick', b).textContent = st.read.includes(bl) ? '✔' : '';
    });
    renderNav();
  }
  $$('.level-tabs button').forEach(b => b.onclick = () => setLevel(+b.dataset.l));
  setLevel(Store.data.settings.level || 2);

  if (t.visuals.length) {
    const showVis = i => {
      $$('.vtabs .btn').forEach(b => b.classList.toggle('on', +b.dataset.v === i));
      const r = $('#visRoot'); r.innerHTML = '';
      try { t.visuals[i].render(r); } catch (e) { r.innerHTML = `<div class="fb bad">Fehler in der Visualisierung: ${esc(e.message)}</div>`; console.error(e); }
    };
    $$('.vtabs .btn').forEach(b => b.onclick = () => showVis(+b.dataset.v));
    showVis(0);
  }
}

function viewTopicQuiz(main, t) {
  if (!t) return viewHome(main);
  main.innerHTML = `<div class="page-head"><a href="#/thema/${t.id}" class="back">← zurück zu ${t.title}</a><h1>🎯 Quiz: ${t.title}</h1><p class="muted">Tastatur: <code>1</code>–<code>4</code> wählt eine Antwort, <code>Enter</code> geht weiter.</p></div><div id="quizRoot"></div>`;
  runQuiz($('#quizRoot'), buildTopicQuiz(t), {
    backHref: `#/thema/${t.id}`,
    again: () => viewTopicQuiz(main, t),
    onFinish(pct) { const s = Store.topic(t.id); s.best = Math.max(s.best || 0, pct); s.attempts = (s.attempts || 0) + 1; Store.save(); renderNav(); },
  });
}

function viewExam(main) {
  const hist = Store.data.exams.slice(-5).reverse();
  main.innerHTML = `<div class="page-head"><h1>📝 Prüfungsmodus</h1><p class="muted">Gemischte Fragen aus allen gewählten Themen mit Zeitmessung – wie in der echten Prüfung. Rechenaufgaben werden jedes Mal neu erzeugt.</p></div>
    <div class="card" id="examSetup">
      <h3 style="margin-top:0">Themen</h3>
      <div class="checks">${App.topics.map(t => `<label class="check"><input type="checkbox" value="${t.id}" checked> ${t.icon} ${t.title}</label>`).join('')}</div>
      <h3>Anzahl Fragen</h3>
      <div class="seg">${[10, 20, 30, 50].map(n => `<label><input type="radio" name="n" value="${n}" ${n === 20 ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
      <button class="btn primary big" id="examGo">▶ Prüfung starten</button>
      ${hist.length ? `<h3>Letzte Ergebnisse</h3><table class="tbl"><tr><th>Datum</th><th>Fragen</th><th>Ergebnis</th><th>Zeit</th></tr>${hist.map(h => `<tr><td>${new Date(h.date).toLocaleString('de-DE', { dateStyle: 'short', timeStyle: 'short' })}</td><td>${h.n}</td><td><b>${h.pct}%</b></td><td>${fmtTime(h.ms)}</td></tr>`).join('')}</table>` : ''}
    </div><div id="quizRoot"></div>`;
  $('#examGo').onclick = () => {
    const ids = $$('#examSetup input[type=checkbox]:checked').map(c => c.value);
    if (!ids.length) return alert('Bitte mindestens ein Thema wählen.');
    const n = +$('#examSetup input[name=n]:checked').value;
    let pool = [];
    ids.forEach(id => { pool = pool.concat(buildTopicQuiz(App.byId[id], 3)); });
    const qs = shuffle(pool).slice(0, n);
    $('#examSetup').remove();
    runQuiz($('#quizRoot'), qs, {
      timer: true, showTopic: true, again: () => viewExam(main), backHref: '#/',
      extra: s => {
        const by = {};
        s.results.forEach(r => { const b = by[r.q.topicId] = by[r.q.topicId] || { ok: 0, n: 0 }; b.n++; if (r.ok) b.ok++; });
        return `<table class="tbl">${Object.entries(by).map(([id, b]) => { const t = App.byId[id]; const p = Math.round(b.ok / b.n * 100); return `<tr><td>${t.icon} ${t.title}</td><td>${b.ok}/${b.n}</td><td style="width:40%"><div class="bar"><i style="width:${p}%"></i></div></td><td>${p < 60 ? `<a href="#/thema/${id}">wiederholen</a>` : '✔'}</td></tr>`; }).join('')}</table>`;
      },
      onFinish(pct, s) { Store.data.exams.push({ date: Date.now(), n: qs.length, pct, ms: Date.now() - s.start }); Store.save(); renderNav(); },
    });
  };
}

function viewMistakes(main) {
  const list = Store.data.mistakes;
  main.innerHTML = `<div class="page-head"><h1>🩹 Fehlertraining</h1><p class="muted">Jede falsch beantwortete Frage landet hier. Beantwortest du sie richtig, verschwindet sie von der Liste.</p></div><div id="quizRoot"></div>`;
  const r = $('#quizRoot');
  if (!list.length) { r.innerHTML = `<div class="card empty">🎉 Keine offenen Fehler!<div class="row center"><a class="btn primary" href="#/pruefung">📝 Prüfungsmodus</a></div></div>`; return; }
  const by = {};
  list.forEach(q => { by[q.topicId] = (by[q.topicId] || 0) + 1; });
  r.innerHTML = `<div class="card"><p><b>${list.length}</b> offene Fragen:</p>
    <div class="row">${Object.entries(by).map(([id, n]) => { const t = App.byId[id]; return t ? `<span class="chip" style="--tc:${t.color}">${t.icon} ${t.title}: ${n}</span>` : ''; }).join('')}</div>
    <div class="row"><button class="btn primary big" id="mStart">▶ Fehler üben</button><button class="btn danger" id="mClear">Liste leeren</button></div></div>`;
  $('#mStart').onclick = () => runQuiz(r, shuffle(list.map(q => ({ ...q }))), { showTopic: true, again: () => viewMistakes(main), backHref: '#/', onFinish: () => renderNav() });
  $('#mClear').onclick = () => { if (confirm('Fehlerliste wirklich leeren?')) { Store.data.mistakes = []; Store.save(); renderNav(); viewMistakes(main); } };
}

function viewCards(main, id) {
  if (!id) {
    main.innerHTML = `<div class="page-head"><h1>🃏 Karteikarten</h1><p class="muted">Begriff lesen, im Kopf beantworten, umdrehen. Gewusste Karten fliegen raus, die anderen kommen wieder.</p></div>
      <div class="grid cards" style="margin-top:20px">
        <a class="tcard" href="#/karten/alle" style="--tc:var(--accent)"><div class="tcard-icon">🔀</div><div class="tcard-body"><h3>Alle Themen gemischt</h3><p>${App.topics.reduce((s, t) => s + t.cards.length, 0)} Karten</p></div></a>
        ${App.topics.filter(t => t.cards.length).map(t => `<a class="tcard" href="#/karten/${t.id}" style="--tc:${t.color}"><div class="tcard-icon">${t.icon}</div><div class="tcard-body"><h3>${t.title}</h3><p>${t.cards.length} Karten</p></div></a>`).join('')}
      </div>`;
    return;
  }
  const t = App.byId[id];
  let queue = shuffle((t ? [t] : App.topics).flatMap(tt => tt.cards.map(c => ({ f: c[0], b: c[1], t: tt }))));
  const total = queue.length;
  let known = 0, rounds = 0;
  main.innerHTML = `<div class="page-head"><a class="back" href="#/karten">← alle Stapel</a><h1>🃏 ${t ? t.icon + ' ' + t.title : 'Alle Themen'}</h1><p class="muted">Leertaste = umdrehen · <code>←</code> nochmal · <code>→</code> gewusst</p></div><div id="fcRoot"></div>`;
  const r = $('#fcRoot');
  function show() {
    if (!queue.length) {
      r.innerHTML = `<div class="card empty">🎉 Stapel geschafft! ${total} Karten in ${rounds} Durchgängen.<div class="row center"><a class="btn primary" href="#/karten/${id}">🔁 Nochmal</a><a class="btn" href="#/karten">Anderer Stapel</a></div></div>`;
      return;
    }
    const c = queue[0];
    r.innerHTML = `<div class="bar" style="max-width:640px;margin:10px auto"><i style="width:${known / total * 100}%"></i></div>
      <p class="center muted" style="display:flex">${known} von ${total} gewusst · noch ${queue.length} im Stapel</p>
      <div class="fc-wrap"><div class="fc" tabindex="0"><div class="fc-inner">
        <div class="fc-front"><span class="chip" style="--tc:${c.t.color}">${c.t.icon} ${c.t.title}</span><div>${c.f}</div><small>Klicken oder Leertaste zum Umdrehen</small></div>
        <div class="fc-back"><div>${c.b}</div></div></div></div></div>
      <div class="row center"><button class="btn bad big" id="fcAgain">↺ Nochmal</button><button class="btn good big" id="fcKnow">✔ Gewusst</button></div>`;
    const fc = $('.fc', r);
    fc.onclick = () => fc.classList.toggle('flipped');
    $('#fcAgain').onclick = again;
    $('#fcKnow').onclick = know;
  }
  function know() { queue.shift(); known++; rounds++; show(); }
  function again() { const c = queue.shift(); queue.splice(Math.min(3, queue.length), 0, c); rounds++; show(); }
  onKey(e => {
    if (!queue.length) return;
    if (e.key === ' ') { e.preventDefault(); $('.fc', r)?.classList.toggle('flipped'); }
    if (e.key === 'ArrowRight') know();
    if (e.key === 'ArrowLeft') again();
  });
  show();
}

function viewTrainer(main, id, gi) {
  const t = App.byId[id];
  if (!t || !t.generators[gi]) {
    main.innerHTML = `<div class="page-head"><h1>🧮 Rechentrainer</h1><p class="muted">Endlos neue Aufgaben – perfekt für Subnetting, Kürzen und Umrechnen. Jede Runde hat 10 frisch erzeugte Aufgaben.</p></div>
      ${App.topics.filter(x => x.generators.length).map(x => `<div class="card"><h3 style="margin-top:0">${x.icon} ${x.title}</h3><div class="row">${x.generators.map((g, i) => `<a class="btn" href="#/trainer/${x.id}/${i}">${g.name}</a>`).join('')}</div></div>`).join('')}`;
    return;
  }
  const g = t.generators[gi];
  main.innerHTML = `<div class="page-head"><a class="back" href="#/trainer">← Rechentrainer</a><h1>🧮 ${g.name}</h1><p class="muted">${t.icon} ${t.title}</p></div><div id="quizRoot"></div>`;
  const qs = Array.from({ length: 10 }, () => ({ ...g.make(), topicId: t.id }));
  runQuiz($('#quizRoot'), qs, { again: () => viewTrainer(main, id, gi), backHref: '#/trainer' });
}

function viewTopics(main) {
  main.innerHTML = `<div class="page-head"><h1>📚 Alle Themen</h1><p class="muted">Tippe ein Thema an, um loszulernen.</p></div>
    ${App.categories.map(cat => `<h2 class="sec-title">${cat}</h2><div class="grid cards">${App.topics.filter(t => t.category === cat).map(topicCard).join('')}</div>`).join('')}
    <h2 class="sec-title">Werkzeuge</h2><div class="row"><a class="btn" href="#/trainer">🧮 Rechentrainer</a><a class="btn" href="#/spick">📋 Spickzettel</a></div>`;
}

function viewCheat(main) {
  main.innerHTML = `<div class="page-head"><h1>📋 Spickzettel</h1><p class="muted">Alle wichtigen Zahlen, Präfixe und Begriffe auf einen Blick.</p>
    <div class="row no-print"><button class="btn" onclick="window.print()">🖨️ Drucken / als PDF speichern</button></div></div>
    ${App.topics.filter(t => t.cheat.length).map(t => `<div class="card cheat"><h3 style="margin-top:0">${t.icon} ${t.title}</h3><div class="tbl-wrap"><table class="tbl">${t.cheat.map(([k, v]) => `<tr><td>${k}</td><td>${v}</td></tr>`).join('')}</table></div></div>`).join('')}`;
}

/* ---------- Router ---------- */
function route() {
  runCleanup();
  const parts = location.hash.replace(/^#\/?/, '').split('/').map(decodeURIComponent);
  App.cur = parts;
  const [page = '', a, b] = parts;
  const main = $('#main');
  window.scrollTo(0, 0);
  $('.sidebar').classList.remove('open');
  renderNav();
  const tabFor = { thema: 'themen', quiz: 'themen', trainer: 'themen', spick: 'themen', spiel: 'spiele', karten: 'spiele' };
  $$('#tabbar a').forEach(x => x.classList.toggle('active', x.dataset.p === (tabFor[page] ?? page)));
  switch (page) {
    case 'thema': return App.byId[a] ? viewTopic(main, App.byId[a]) : viewHome(main);
    case 'quiz': return viewTopicQuiz(main, App.byId[a]);
    case 'pruefung': return viewExam(main);
    case 'fehler': return viewMistakes(main);
    case 'karten': return viewCards(main, a);
    case 'trainer': return viewTrainer(main, a, +b);
    case 'spick': return viewCheat(main);
    case 'themen': return viewTopics(main);
    case 'spiele': return viewGames(main, a);
    case 'spiel': return viewPlay(main, a, b);
    default: return viewHome(main);
  }
}

function start() {
  Store.load();
  const theme = Store.data.settings.theme || 'dark';
  document.documentElement.dataset.theme = theme;
  $('#themeBtn').onclick = () => {
    const tn = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
    document.documentElement.dataset.theme = tn; Store.data.settings.theme = tn; Store.save();
  };
  $('#resetBtn').onclick = () => {
    if (confirm('Gesamten Lernfortschritt (gelesene Stufen, Quiz-Ergebnisse, Fehlerliste) löschen?')) {
      Store.data = { settings: Store.data.settings, topics: {}, mistakes: [], exams: [] }; Store.save(); route();
    }
  };
  $('#menuBtn').onclick = () => $('.sidebar').classList.toggle('open');
  window.addEventListener('hashchange', route);
  route();
  // Offline-Fähigkeit (nur über http/https, nicht bei file://)
  if ('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('sw.js').catch(() => {});
}
document.addEventListener('DOMContentLoaded', start);
