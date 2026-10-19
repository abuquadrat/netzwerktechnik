'use strict';
/* =========================================================
   Spiele – kurze Lernrunden (1–2 Min.), mit einer Hand spielbar.
   Inhalte kommen aus den Themen:
     t.quiz              → „Wahr oder Falsch?“ und Blitzrunde
     t.generators (MC)   → Blitzrunde
     t.games.blitz       → Blitzrunde: () => ({ q, a:[richtig, falsch…], c?, e })
     t.games.sort        → Sortier-Rausch: [{ name, q, bins:[…], items:[[text, bin, erklärung]] | make() }]
     t.games.seq         → Ablauf-Puzzle: [{ name, steps:[…] }]
     t.games.pairs       → Paare finden: [[begriff, bedeutung], …]
   ========================================================= */

/* ---------- Spieler: XP, Level, Serie ---------- */
const Player = {
  get d() { return (Store.data.player = Store.data.player || { xp: 0, days: {}, best: {}, daily: null }); },
  key(d) { return d.getFullYear() + '-' + String(d.getMonth() + 1).padStart(2, '0') + '-' + String(d.getDate()).padStart(2, '0'); },
  today() { return this.key(new Date()); },
  need(l) { return 50 * (l - 1) * l; },
  level() { let l = 1; while (this.d.xp >= this.need(l + 1)) l++; return l; },
  addXP(n) { this.d.xp += Math.max(0, Math.round(n)); this.d.days[this.today()] = true; Store.save(); },
  streak() {
    const d = new Date(); let n = 0;
    if (!this.d.days[this.key(d)]) d.setDate(d.getDate() - 1);
    while (this.d.days[this.key(d)]) { n++; d.setDate(d.getDate() - 1); }
    return n;
  },
  badge() {
    const l = this.level(), lo = this.need(l), hi = this.need(l + 1);
    return `<div class="pl-row"><div class="pl-lvl"><small>Level</small><b>${l}</b></div>
      <div class="pl-bar"><div class="bar"><i style="width:${(this.d.xp - lo) / (hi - lo) * 100}%"></i></div><small>${fmtNum(this.d.xp)} / ${fmtNum(hi)} XP</small></div>
      <div class="pl-streak"><b>🔥 ${this.streak()}</b><small>${this.streak() === 1 ? 'Tag' : 'Tage'} Serie</small></div></div>`;
  },
};

const GAMES = [
  { id: 'swipe', name: 'Wahr oder Falsch?', icon: '👆', desc: 'Aussage lesen, nach rechts (stimmt) oder links (falsch) wischen. 60 Sekunden.', kind: 'swipe' },
  { id: 'blitz', name: 'Blitzrunde', icon: '⚡', desc: 'Kürzen, rechnen, erkennen – tippe schnell die richtige Antwort. 60 Sekunden.', kind: 'blitz' },
  { id: 'sort', name: 'Sortier-Rausch', icon: '🗂️', desc: 'Jedes Kärtchen in die richtige Kiste, bevor die Zeit abläuft. 3 Leben.', kind: 'sort' },
  { id: 'seq', name: 'Ablauf-Puzzle', icon: '🧩', desc: 'Tippe die Schritte in der richtigen Reihenfolge: DORA, SLAAC, DNS …', kind: 'seq' },
  { id: 'pairs', name: 'Paare finden', icon: '🧠', desc: 'Memory: Begriff und Bedeutung zusammenbringen.', kind: 'pairs' },
];
let sessionRounds = 0;
const sleep = ms => new Promise(r => setTimeout(r, ms));
const mcQuiz = t => t.quiz.filter(q => q.type !== 'input' && !q.noShuffle && q.a.length >= 2);

function topicsFor(kind) {
  return App.topics.filter(t => {
    if (kind === 'swipe') return mcQuiz(t).length > 0;
    if (kind === 'blitz') return mcQuiz(t).length > 0 || (t.games?.blitz || []).length > 0;
    return (t.games?.[kind] || []).length > 0;
  });
}

/* ---------- Fragen bauen ---------- */
function makeStatement(t) {
  const q = pick(mcQuiz(t));
  const truth = Math.random() < 0.5;
  return { t, q: q.q, ans: truth ? q.a[q.c] : pick(q.a.filter((_, i) => i !== q.c)), truth, correct: q.a[q.c], e: q.e, src: q };
}
function makeBlitz(t) {
  if (!t._mcGens) t._mcGens = t.generators.filter(g => { try { return g.make().type !== 'input'; } catch (e) { return false; } }).map(g => () => g.make());
  const gens = [...(t.games?.blitz || []), ...t._mcGens];
  const mc = mcQuiz(t);
  if (gens.length && (!mc.length || Math.random() < 0.65)) {
    const r = pick(gens)();
    return { t, q: r.q, a: r.a, c: r.c || 0, e: r.e, src: null };
  }
  const q = pick(mc);
  const wrong = shuffle(q.a.filter((_, i) => i !== q.c)).slice(0, 2);
  return { t, q: q.q, a: [q.a[q.c], ...wrong], c: 0, e: q.e, src: q };
}

/* ---------- Gemeinsamer Spielrahmen ---------- */
function shell(root, title) {
  root.innerHTML = `
    <div class="g-hud"><a class="g-x" href="#/spiele" aria-label="Beenden">✕</a><div class="g-title">${title}</div>
      <div class="g-stat g-combo" hidden></div><div class="g-stat g-lives" hidden></div><div class="g-stat g-score">0</div></div>
    <div class="g-timebar"><i style="width:100%"></i></div>
    <div class="g-stage"></div>
    <div class="g-controls"></div>`;
  const ui = {
    stage: $('.g-stage', root), controls: $('.g-controls', root),
    score(n) { $('.g-score', root).textContent = fmtNum(n); },
    combo(c) { const el = $('.g-combo', root); const m = mult(c); el.hidden = m < 2; el.textContent = `🔥 x${m}`; },
    lives(n, max = 3) { const el = $('.g-lives', root); el.hidden = false; el.textContent = '❤️'.repeat(Math.max(0, n)) + '🖤'.repeat(Math.max(0, max - n)); },
    time(f) { const b = $('.g-timebar', root); $('i', b).style.width = Math.max(0, f * 100) + '%'; b.classList.toggle('low', f < 0.25); },
    flash(ok, html, ms) {
      return new Promise(res => {
        const el = document.createElement('div');
        el.className = 'g-fb ' + (ok ? 'ok' : 'bad');
        el.innerHTML = html + (ms > 1200 ? '<small>Tippen zum Weitermachen</small>' : '');
        root.appendChild(el);
        let done = false;
        const close = () => { if (done) return; done = true; el.remove(); res(); };
        el.onclick = close;
        setTimeout(close, ms);
      });
    },
  };
  return ui;
}
const mult = c => 1 + Math.min(3, Math.floor(c / 3));
function buzz(ok) { try { navigator.vibrate && navigator.vibrate(ok ? 15 : [40, 40, 40]); } catch (e) { /* iOS: keine Vibration */ } }

/** Countdown, pausierbar; stoppt automatisch, wenn das Spiel verlassen wird */
function countdown(root, secs, onTick, onEnd) {
  let left = secs * 1000, last = Date.now(), paused = false;
  const T = { over: false, pause() { paused = true; }, resume() { paused = false; last = Date.now(); }, stop() { T.over = true; clearInterval(id); }, add(s) { left = Math.min(secs * 1000, left + s * 1000); } };
  const id = setInterval(() => {
    if (!root.isConnected) return T.stop();
    const now = Date.now();
    if (!paused) left -= now - last;
    last = now;
    onTick(left / (secs * 1000));
    if (left <= 0) { T.stop(); onEnd(); }
  }, 100);
  onCleanup(() => T.stop());
  return T;
}

/* =========================================================
   Spiel 1: Wahr oder Falsch? (Wischen)
   ========================================================= */
function bindSwipe(el, cb) {
  let x0 = null, dx = 0;
  el.addEventListener('pointerdown', e => { x0 = e.clientX; dx = 0; el.setPointerCapture(e.pointerId); el.style.transition = 'none'; });
  el.addEventListener('pointermove', e => {
    if (x0 === null) return;
    dx = e.clientX - x0;
    el.style.transform = `translateX(${dx}px) rotate(${dx / 18}deg)`;
    el.classList.toggle('lean-r', dx > 40); el.classList.toggle('lean-l', dx < -40);
  });
  const end = () => {
    if (x0 === null) return;
    x0 = null; el.style.transition = '';
    if (Math.abs(dx) > 80) cb(dx > 0 ? 1 : 0);
    else { el.style.transform = ''; el.classList.remove('lean-r', 'lean-l'); }
  };
  el.addEventListener('pointerup', end); el.addEventListener('pointercancel', end);
}

function playSwipe(root, topics, done) {
  const ui = shell(root, '👆 Wahr oder Falsch?');
  let score = 0, combo = 0, n = 0, ok = 0, busy = false, cur;
  const review = [];
  ui.controls.innerHTML = `<div class="g-two"><button class="g-btn no" data-v="0">✗<small>Falsch</small></button><button class="g-btn yes" data-v="1">✓<small>Stimmt</small></button></div><p class="g-hint">oder die Karte nach links / rechts wischen</p>`;
  const timer = countdown(root, 60, f => ui.time(f), () => { if (!busy) finish(); });
  function next() {
    cur = makeStatement(pick(topics));
    ui.stage.innerHTML = `<div class="swipe-card"><span class="chip" style="--tc:${cur.t.color}">${cur.t.icon} ${cur.t.title}</span>
      <div class="sc-q">${cur.q}</div><div class="sc-a">${cur.ans}</div>
      <div class="sc-stamp yes">STIMMT</div><div class="sc-stamp no">FALSCH</div></div>`;
    bindSwipe($('.swipe-card', ui.stage), answer);
  }
  async function answer(v) {
    if (busy || timer.over) return;
    busy = true; n++;
    const card = $('.swipe-card', ui.stage);
    card.style.transition = 'transform .25s, opacity .25s';
    card.style.transform = `translateX(${v ? 130 : -130}%) rotate(${v ? 18 : -18}deg)`;
    card.style.opacity = '0';
    const right = (v === 1) === cur.truth;
    buzz(right);
    if (right) { ok++; combo++; score += 10 * mult(combo); ui.score(score); ui.combo(combo); await sleep(260); }
    else {
      combo = 0; ui.combo(0);
      review.push({ t: cur.t, q: cur.q, a: cur.correct, e: cur.e });
      addMistake({ ...cur.src, topicId: cur.t.id });
      timer.pause();
      await ui.flash(false, `<b>${cur.truth ? '❌ Doch, das stimmt!' : '❌ Stimmt nicht.'}</b>${cur.truth ? '' : `<div>Richtig: <b>${cur.correct}</b></div>`}${cur.e ? `<p>${cur.e}</p>` : ''}`, 3500);
      timer.resume();
    }
    busy = false;
    if (timer.over) finish(); else next();
  }
  ui.controls.onclick = e => { const b = e.target.closest('[data-v]'); if (b) answer(+b.dataset.v); };
  let finished = false;
  function finish() { if (finished) return; finished = true; done({ score, ok, n, review, xp: score / 2 }); }
  next();
}

/* =========================================================
   Spiel 2: Blitzrunde (Multiple Choice, große Buttons) – auch Tages-Challenge
   ========================================================= */
function playBlitz(root, topics, done, opt = {}) {
  const daily = !!opt.daily, total = daily ? 10 : Infinity;
  const ui = shell(root, daily ? '📅 Tages-Challenge' : '⚡ Blitzrunde');
  let score = 0, combo = 0, n = 0, ok = 0, busy = false, cur, opts = [], finished = false;
  const review = [];
  const timer = daily ? null : countdown(root, 60, f => ui.time(f), () => { if (!busy) finish(); });
  if (daily) ui.time(1);
  function next() {
    if (n >= total) return finish();
    cur = makeBlitz(pick(topics));
    opts = cur.a.map((t, i) => ({ t, ok: i === cur.c }));
    if (!(cur.a.length === 2 && /^(Ja|Nein)$/.test(cur.a[0]))) opts = shuffle(opts);
    ui.stage.innerHTML = `<div class="g-card"><span class="chip" style="--tc:${cur.t.color}">${cur.t.icon} ${cur.t.title}</span>${daily ? `<span class="g-count">${n + 1} / ${total}</span>` : ''}<div class="g-q">${cur.q}</div></div>`;
    ui.controls.innerHTML = `<div class="g-opts">${opts.map((o, i) => `<button class="g-opt" data-i="${i}">${o.t}</button>`).join('')}</div>`;
  }
  async function answer(i) {
    if (busy || (timer && timer.over)) return;
    busy = true; n++;
    const btns = $$('.g-opt', ui.controls);
    btns.forEach((b, j) => { b.disabled = true; if (opts[j].ok) b.classList.add('ok'); });
    const right = opts[i].ok;
    buzz(right);
    if (daily) ui.time(1 - n / total);
    if (right) { ok++; combo++; score += 10 * mult(combo); ui.score(score); ui.combo(combo); await sleep(420); }
    else {
      btns[i].classList.add('bad'); combo = 0; ui.combo(0);
      const correct = cur.a[cur.c];
      review.push({ t: cur.t, q: cur.q, a: correct, e: cur.e });
      if (cur.src) addMistake({ ...cur.src, topicId: cur.t.id });
      timer && timer.pause();
      await ui.flash(false, `<b>❌ Richtig wäre: ${correct}</b>${cur.e ? `<p>${cur.e}</p>` : ''}`, 3500);
      timer && timer.resume();
    }
    busy = false;
    if (timer && timer.over) finish(); else next();
  }
  ui.controls.onclick = e => { const b = e.target.closest('[data-i]'); if (b) answer(+b.dataset.i); };
  function finish() {
    if (finished) return; finished = true;
    let xp = score / 2, title;
    if (daily) {
      const first = Player.d.daily !== Player.today();
      if (first) { xp += 100; Player.d.daily = Player.today(); title = 'Tages-Challenge geschafft! +100 XP Bonus'; }
      else title = 'Tages-Challenge (Bonus heute schon geholt)';
    }
    done({ score, ok, n, review, xp, title });
  }
  next();
}

/* =========================================================
   Spiel 3: Sortier-Rausch
   ========================================================= */
function playSort(root, topics, done) {
  const t = pick(topics), set = pick(t.games.sort);
  const items = set.make ? Array.from({ length: 12 }, () => set.make()) : shuffle(set.items).slice(0, 12);
  const ui = shell(root, `🗂️ ${set.name}`);
  let score = 0, combo = 0, ok = 0, i = 0, lives = 3, busy = false, timer = null, finished = false;
  const review = [];
  ui.lives(lives);
  ui.controls.innerHTML = `<div class="g-opts ${set.bins.length > 3 ? 'g-grid2' : ''}">${set.bins.map((b, k) => `<button class="g-opt g-bin" data-b="${k}">${b}</button>`).join('')}</div>`;
  function next() {
    if (i >= items.length || lives <= 0) return finish();
    const [text] = items[i];
    ui.stage.innerHTML = `<div class="g-card sort-card"><span class="chip" style="--tc:${t.color}">${t.icon} ${set.q || set.name}</span><span class="g-count">${i + 1} / ${items.length}</span><div class="g-item">${text}</div></div>`;
    const secs = Math.max(4, 10 - i * 0.5);
    timer = countdown(root, secs, f => ui.time(f), () => answer(-1));
    busy = false;
  }
  async function answer(b) {
    if (busy) return;
    busy = true; timer && timer.stop();
    const [text, bin, expl] = items[i];
    const right = b === bin;
    buzz(right);
    $$('.g-bin', ui.controls).forEach((el, k) => { if (k === bin) el.classList.add('ok'); else if (k === b) el.classList.add('bad'); });
    if (right) { ok++; combo++; score += 10 * mult(combo); ui.score(score); ui.combo(combo); await sleep(380); }
    else {
      lives--; combo = 0; ui.combo(0); ui.lives(lives);
      review.push({ t, q: text, a: set.bins[bin], e: expl });
      await ui.flash(false, `<b>${b < 0 ? '⏰ Zu langsam!' : '❌ Daneben!'}</b><div>„${text}“ gehört zu <b>${set.bins[bin]}</b></div>${expl ? `<p>${expl}</p>` : ''}`, 3500);
    }
    $$('.g-bin', ui.controls).forEach(el => el.classList.remove('ok', 'bad'));
    i++;
    next();
  }
  ui.controls.onclick = e => { const el = e.target.closest('[data-b]'); if (el) answer(+el.dataset.b); };
  function finish() { if (finished) return; finished = true; timer && timer.stop(); done({ score, ok, n: Math.min(i, items.length), review, xp: score / 2, title: lives <= 0 ? 'Keine Leben mehr!' : 'Alles einsortiert!' }); }
  next();
}

/* =========================================================
   Spiel 4: Ablauf-Puzzle
   ========================================================= */
function playSeq(root, topics, done) {
  const puzzles = shuffle(topics.flatMap(t => t.games.seq.map(s => ({ ...s, t })))).slice(0, 3);
  const ui = shell(root, '🧩 Ablauf-Puzzle');
  let p = 0, score = 0, ok = 0, steps = 0;
  const review = [];
  function start() {
    if (p >= puzzles.length) return done({ score, ok, n: steps, review, xp: score / 2, title: 'Alle Abläufe sortiert!' });
    const s = puzzles[p];
    let pos = 0, errors = 0;
    ui.time(1 - p / puzzles.length);
    const draw = () => {
      ui.stage.innerHTML = `<div class="g-card seq-card"><span class="chip" style="--tc:${s.t.color}">${s.t.icon} Puzzle ${p + 1} / ${puzzles.length}</span>
        <div class="g-q">${s.name}</div>
        <ol class="seq-slots">${s.steps.map((st, k) => `<li class="${k < pos ? 'done' : k === pos ? 'next' : ''}">${k < pos ? st : k === pos ? 'Was kommt jetzt?' : '…'}</li>`).join('')}</ol></div>`;
      const sl = $('.seq-slots li.next', ui.stage) || $('.seq-slots li:last-child', ui.stage);
      sl && sl.scrollIntoView({ block: 'nearest' });
    };
    const order = shuffle(s.steps.map((st, k) => ({ st, k })));
    ui.controls.innerHTML = `<div class="g-chips">${order.map(o => `<button class="g-chip" data-k="${o.k}">${o.st}</button>`).join('')}</div>`;
    draw();
    ui.controls.onclick = async e => {
      const b = e.target.closest('[data-k]');
      if (!b || b.disabled) return;
      const k = +b.dataset.k;
      steps++;
      if (s.steps[k] === s.steps[pos]) {
        buzz(true); ok++; pos++; b.disabled = true; b.classList.add('ok'); draw();
        if (pos >= s.steps.length) {
          const pts = Math.max(10, 50 - errors * 10);
          score += pts; ui.score(score);
          if (errors) review.push({ t: s.t, q: s.name, a: s.steps.map((x, j) => `${j + 1}. ${x}`).join('<br>'), e: '' });
          await ui.flash(true, `<b>${errors === 0 ? '⭐⭐⭐ Perfekt!' : errors <= 2 ? '⭐⭐ Gut!' : '⭐ Geschafft!'}</b><div>${s.name}: ${errors} Fehler · +${pts} Punkte</div>${s.note ? `<p>${s.note}</p>` : ''}`, 2600);
          p++; start();
        }
      } else {
        buzz(false); errors++;
        b.classList.add('shake'); setTimeout(() => b.classList.remove('shake'), 400);
        $('.seq-slots li.next', ui.stage)?.classList.add('wrong');
        setTimeout(() => $('.seq-slots li.next', ui.stage)?.classList.remove('wrong'), 400);
      }
    };
  }
  ui.score(0);
  start();
}

/* =========================================================
   Spiel 5: Paare finden (Memory)
   ========================================================= */
async function playPairs(root, topics, done) {
  const all = shuffle(topics.flatMap(t => t.games.pairs.map(([a, b]) => ({ a, b, t }))));
  const chosen = [], seen = new Set();
  for (const p of all) { if (chosen.length >= 6) break; if (seen.has(p.a) || seen.has(p.b)) continue; seen.add(p.a); seen.add(p.b); chosen.push(p); }
  const tiles = shuffle(chosen.flatMap((p, k) => [{ txt: p.a, k, term: true }, { txt: p.b, k }]));
  const ui = shell(root, '🧠 Paare finden');
  let open = [], matched = 0, moves = 0, busy = true;
  const start = Date.now();
  ui.stage.innerHTML = `<div class="g-card"><div class="g-q" id="pmsg">👀 Einprägen …</div><div class="pair-log"></div></div>`;
  ui.controls.innerHTML = `<div class="pairs">${tiles.map((x, i) => `<button class="tile up ${x.term ? 'term' : ''}" data-i="${i}"><span>${x.txt}</span></button>`).join('')}</div>`;
  const msg = () => $('#pmsg', ui.stage);
  for (let s = 3; s > 0; s--) { if (!root.isConnected) return; ui.time(s / 3); await sleep(1000); }
  ui.time(1);
  $$('.tile', ui.controls).forEach(b => b.classList.remove('up'));
  msg().textContent = 'Finde die Paare: Begriff + Bedeutung';
  busy = false;
  ui.controls.onclick = async e => {
    const b = e.target.closest('.tile');
    if (!b || busy || b.classList.contains('up')) return;
    b.classList.add('up'); open.push(b);
    if (open.length < 2) return;
    moves++; busy = true;
    const [x, y] = open.map(o => tiles[+o.dataset.i]);
    if (x.k === y.k) {
      buzz(true); matched++;
      open.forEach(o => o.classList.add('match'));
      const p = chosen[x.k];
      $('.pair-log', ui.stage).insertAdjacentHTML('afterbegin', `<div><b>${p.a}</b> = ${p.b}</div>`);
      ui.score(matched); ui.time(1 - matched / chosen.length);
      open = []; busy = false;
      if (matched === chosen.length) {
        const secs = Math.round((Date.now() - start) / 1000);
        const score = Math.max(20, 150 - (moves - chosen.length) * 10);
        await sleep(500);
        done({ score, ok: matched, n: moves, review: [], xp: score / 2, title: `Alle Paare in ${moves} Zügen (${secs} s)!`, pairs: chosen });
      }
    } else {
      buzz(false);
      await sleep(900);
      open.forEach(o => o.classList.remove('up'));
      open = []; busy = false;
    }
  };
}

const PLAY = { swipe: playSwipe, blitz: playBlitz, sort: playSort, seq: playSeq, pairs: playPairs };

/* =========================================================
   Auswertung
   ========================================================= */
function showResult(root, g, topicId, res, again) {
  sessionRounds++;
  const before = Player.level();
  Player.addXP(res.xp);
  const after = Player.level();
  const bk = g.id + ':' + (topicId || 'alle');
  const best = Player.d.best[bk] || 0;
  const record = res.score > best && res.score > 0;
  if (record) { Player.d.best[bk] = res.score; Store.save(); }
  const topicErr = {};
  res.review.forEach(r => { topicErr[r.t.id] = (topicErr[r.t.id] || 0) + 1; });
  const weak = Object.entries(topicErr).sort((a, b) => b[1] - a[1])[0];
  const weakT = weak ? App.byId[weak[0]] : (topicId && App.byId[topicId]);
  const pct = res.n ? res.ok / res.n : 1;
  root.innerHTML = `<div class="g-result">
    <div class="g-big">${pct >= .9 ? '🏆' : pct >= .7 ? '🎉' : pct >= .5 ? '👍' : '💪'}</div>
    <h2>${res.title || 'Zeit um!'}</h2>
    <div class="kpis">
      <div class="kpi"><span>Punkte</span><b>${fmtNum(res.score)}</b></div>
      ${g.id === 'pairs' ? `<div class="kpi"><span>Züge</span><b>${res.n}</b></div>` : `<div class="kpi"><span>Richtig</span><b>${res.ok} / ${res.n}</b></div>`}
      <div class="kpi"><span>XP</span><b>+${Math.round(res.xp)}</b></div>
    </div>
    ${record && best ? '<div class="g-banner">🏅 Neuer Rekord!</div>' : ''}
    ${after > before ? `<div class="g-banner">⬆️ Level ${after} erreicht!</div>` : ''}
    ${Player.badge()}
    ${res.review.length ? `<div class="card g-review"><h3>📌 Merk dir das</h3>${res.review.slice(0, 8).map(r => `<div class="review"><div class="rq">${r.q}</div><div class="ra">✔ ${r.a}</div>${r.e ? `<div class="re">${r.e}</div>` : ''}</div>`).join('')}</div>` : ''}
    ${res.pairs ? `<div class="card g-review"><h3>📌 Die Paare</h3>${res.pairs.map(p => `<div class="review"><b>${p.a}</b> = ${p.b}</div>`).join('')}</div>` : ''}
    ${sessionRounds >= 3 && sessionRounds % 3 === 0 ? `<div class="callout tip">☕ Schon ${sessionRounds} Runden gespielt! Lies zwischendurch kurz ${weakT ? `<a href="#/thema/${weakT.id}">${weakT.icon} ${weakT.title}</a>` : 'ein Thema'} nach – so bleibt mehr hängen.</div>` : ''}
    <div class="g-res-actions">
      <button class="btn primary big" id="gAgain">🔁 Nochmal</button>
      ${weakT ? `<a class="btn" href="#/thema/${weakT.id}">📖 ${weakT.title} lesen</a>` : ''}
      <a class="btn" href="#/spiele">🎮 Alle Spiele</a>
    </div></div>`;
  $('#gAgain', root).onclick = again;
  renderNav();
}

/* =========================================================
   Ansichten
   ========================================================= */
function viewGames(main, topicId) {
  const sel = App.byId[topicId] ? topicId : 'alle';
  const dailyDone = Player.d.daily === Player.today();
  main.innerHTML = `<div class="page-head"><h1>🎮 Spiele</h1><p class="muted">Kurze Runden (1–2 Minuten), mit einer Hand spielbar. Nach jeder Runde siehst du, was du dir merken solltest.</p></div>
    <div class="card">${Player.badge()}</div>
    <a class="daily ${dailyDone ? 'done' : ''}" href="#/spiel/daily/alle">
      <span class="daily-ic">📅</span><span><b>Tages-Challenge</b><small>${dailyDone ? '✔ Heute geschafft – morgen wieder!' : '10 Fragen aus allen Themen · +100 XP Bonus'}</small></span><span class="daily-go">${dailyDone ? '↻' : '▶'}</span></a>
    <h2 class="sec-title">Thema wählen</h2>
    <div class="g-topics"><a class="chip ${sel === 'alle' ? 'on' : ''}" href="#/spiele">🔀 Alle Themen</a>${App.topics.map(t => `<a class="chip ${sel === t.id ? 'on' : ''}" style="--tc:${t.color}" href="#/spiele/${t.id}">${t.icon} ${t.title}</a>`).join('')}</div>
    <h2 class="sec-title">Spiele</h2>
    <div class="game-grid">${GAMES.map(g => {
      const ok = sel === 'alle' ? topicsFor(g.kind).length : topicsFor(g.kind).some(t => t.id === sel);
      const best = Player.d.best[g.id + ':' + sel];
      return ok ? `<a class="gtile" href="#/spiel/${g.id}/${sel}"><span class="gt-ic">${g.icon}</span><b>${g.name}</b><small>${g.desc}</small>${best ? `<span class="gt-best">🏅 ${fmtNum(best)}</span>` : ''}</a>`
        : `<div class="gtile off"><span class="gt-ic">${g.icon}</span><b>${g.name}</b><small>Für dieses Thema nicht verfügbar</small></div>`;
    }).join('')}
      <a class="gtile" href="#/karten/${sel === 'alle' ? 'alle' : sel}"><span class="gt-ic">🃏</span><b>Karteikarten</b><small>Umdrehen, „gewusst“ oder „nochmal“ – in Ruhe wiederholen.</small></a>
    </div>`;
}

function viewPlay(main, gameId, topicId) {
  if (gameId === 'daily') {
    startGame(main, { id: 'daily', name: 'Tages-Challenge' }, App.topics, 'alle', (r, ts, d) => playBlitz(r, ts, d, { daily: true }));
    return;
  }
  const g = GAMES.find(x => x.id === gameId);
  if (!g) return viewGames(main);
  let topics = topicsFor(g.kind);
  if (topicId && topicId !== 'alle') topics = topics.filter(t => t.id === topicId);
  if (!topics.length) return viewGames(main);
  startGame(main, g, topics, topicId, PLAY[g.id]);
}

function startGame(main, g, topics, topicId, play) {
  document.body.classList.add('gaming');
  onCleanup(() => document.body.classList.remove('gaming'));
  main.innerHTML = '<div class="game" id="game"></div>';
  const root = $('#game');
  const run = () => play(root, topics, res => showResult(root, g, topicId, res, run));
  run();
}
