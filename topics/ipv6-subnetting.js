registerTopic({
  id: 'ipv6-subnetting',
  title: 'IPv6-Subnetting',
  subtitle: 'Präfixe aufteilen, Subnetze berechnen',
  category: 'IPv6',
  icon: '✂️',
  color: '#f59e0b',

  levels: {
    1: `
      <h2>Worum geht's?</h2>
      <div class="analogy"><div class="big">🍕</div><div>
        Dein Provider gibt dir eine riesige Pizza: z. B. ein <b>/48-Netz</b>. Du schneidest sie in Stücke – eines für jede Abteilung, jedes VLAN, jedes WLAN. Jedes Stück ist ein <b>Subnetz</b>.
        Bei IPv6 ist ein Stück fürs normale LAN immer gleich groß: ein <b>/64</b>.</div></div>
      <h2>Die Zahl hinter dem Schrägstrich</h2>
      <p>Die Präfixlänge sagt, <b>wie viele Bit von links „festgelegt“</b> sind. Je <b>größer</b> die Zahl, desto <b>kleiner</b> das Netz:</p>
      <ul>
        <li><code>/48</code> = eine ganze Firma / ein Standort</li>
        <li><code>/56</code> = typisch für einen Privatanschluss</li>
        <li><code>/64</code> = <b>ein einzelnes LAN</b></li>
      </ul>
      <h2>Wie viele Stücke bekomme ich?</h2>
      <p>Jedes zusätzliche Bit <b>verdoppelt</b> die Anzahl der Subnetze. Von /48 auf /64 sind es 16 Bit mehr → 2 × 2 × 2 … (16-mal) = <b>65.536 Subnetze</b>.</p>
      <div class="analogy"><div class="big">🔢</div><div>
        Bei IPv6 ist Subnetting oft <b>einfacher</b> als bei IPv4: Wenn man in <b>4er-Schritten</b> teilt (/48 → /52 → /56 → /60 → /64), zählt man einfach eine <b>Hex-Ziffer</b> hoch – wie bei einem Kilometerzähler.</div></div>
      <div class="flow"><span>2001:db8:abcd:<b>0</b>000::/52</span><span>2001:db8:abcd:<b>1</b>000::/52</span><span>2001:db8:abcd:<b>2</b>000::/52</span><i>…</i><span>2001:db8:abcd:<b>f</b>000::/52</span></div>`,

    2: `
      <h2>Grundformeln</h2>
      <table class="tbl">
        <tr><th>Was?</th><th>Formel</th><th>Beispiel</th></tr>
        <tr><td>Anzahl Subnetze</td><td><b>2<sup>(neues Präfix − altes Präfix)</sup></b></td><td>/48 → /56: 2⁸ = 256</td></tr>
        <tr><td>Adressen pro Subnetz</td><td>2<sup>(128 − Präfix)</sup></td><td>/64: 2⁶⁴</td></tr>
        <tr><td>Benötigte Bits für N Subnetze</td><td>kleinstes n mit 2ⁿ ≥ N</td><td>10 Subnetze → n = 4 (16 ≥ 10)</td></tr>
      </table>
      <h2>Nibble-Grenzen (der einfache Fall)</h2>
      <p>Eine Hex-Ziffer = 4 Bit. Liegt das neue Präfix auf einem Vielfachen von 4, ändert sich pro Subnetz genau eine Hex-Stelle.</p>
      <table class="tbl">
        <tr><th>Von /48 nach</th><th>geliehene Bits</th><th>Subnetze</th><th>welche Ziffern zählen?</th></tr>
        <tr><td>/52</td><td>4</td><td>16</td><td>1. Ziffer des 4. Blocks: <code>x000</code></td></tr>
        <tr><td>/56</td><td>8</td><td>256</td><td>1.–2. Ziffer: <code>xx00</code></td></tr>
        <tr><td>/60</td><td>12</td><td>4.096</td><td>1.–3. Ziffer: <code>xxx0</code></td></tr>
        <tr><td>/64</td><td>16</td><td>65.536</td><td>ganzer 4. Block: <code>xxxx</code></td></tr>
      </table>
      <h2>Kochrezept für jede Aufgabe</h2>
      <ol>
        <li><b>Bits bestimmen:</b> Wie viele Subnetze? → kleinstes n mit 2ⁿ ≥ Anzahl.</li>
        <li><b>Neues Präfix</b> = altes Präfix + n.</li>
        <li><b>Block finden:</b> In welchem 16-Bit-Block liegt das letzte Netz-Bit? Block 1 = Bit 1–16, Block 2 = 17–32, Block 3 = 33–48, <b>Block 4 = 49–64</b>.</li>
        <li><b>Schrittweite</b> in diesem Block = 2<sup>(Blockende − neues Präfix)</sup>, dann in Hex umrechnen.</li>
        <li><b>Subnetze aufzählen:</b> 0, 1 × Schritt, 2 × Schritt, …</li>
      </ol>
      <h3>Beispiel: 2001:db8:abcd::/48 in 4 Subnetze</h3>
      <ol>
        <li>4 Subnetze → 2² = 4 → <b>n = 2</b></li>
        <li>Neues Präfix: 48 + 2 = <b>/50</b></li>
        <li>Bit 50 liegt im <b>4. Block</b> (49–64)</li>
        <li>Schrittweite = 2<sup>64−50</sup> = 2¹⁴ = 16.384 = <b>0x4000</b></li>
        <li>Subnetze:</li>
      </ol>
      <table class="tbl" style="font-family:var(--mono)">
        <tr><td>1.</td><td>2001:db8:abcd:<b>0000</b>::/50</td></tr>
        <tr><td>2.</td><td>2001:db8:abcd:<b>4000</b>::/50</td></tr>
        <tr><td>3.</td><td>2001:db8:abcd:<b>8000</b>::/50</td></tr>
        <tr><td>4.</td><td>2001:db8:abcd:<b>c000</b>::/50</td></tr>
      </table>
      <div class="callout exam">Schreibe dir die Zweierpotenzen von 2⁰ bis 2¹⁶ auf und die Hex-Werte 0x1000 (4096), 0x2000, 0x4000 (16384), 0x8000 (32768). Damit lässt sich jede Schrittweite schnell bestimmen.</div>
      <div class="callout warn">Das <b>erste</b> Subnetz ist Nummer 0 (die Subnet-ID ist 0000)! Das „3. Subnetz“ hat also den Index 2.</div>
      <h3>Warum immer /64 im LAN?</h3>
      <p>SLAAC bildet eine <b>64-Bit-Interface-ID</b>. Ist das Präfix länger als /64, funktioniert die automatische Adressbildung nicht. Daher: Subnetting nur im Bereich zwischen dem zugewiesenen Präfix und /64.</p>`,

    3: `
      <h2>Adressplanung in der Praxis</h2>
      <p>Statt wild durchzunummerieren plant man <b>hierarchisch</b>, damit Routen zusammengefasst werden können (Route Summarization):</p>
      <div class="flow"><span>/48 Unternehmen</span><i>→</i><span>/52 Standort (16 Stück)</span><i>→</i><span>/56 Gebäude (16 pro Standort)</span><i>→</i><span>/60 Etage</span><i>→</i><span>/64 VLAN</span></div>
      <p>Beispiel: <code>2001:db8:abcd:<b>1</b><b style="color:var(--sub)">2</b><b style="color:var(--iid)">3</b><b style="color:var(--accent2)">4</b>::/64</code> = Standort 1, Gebäude 2, Etage 3, VLAN 4 – direkt an der Adresse ablesbar.</p>
      <p>Tipp: VLAN-ID in die Subnet-ID schreiben (VLAN 120 → <code>…:0120::/64</code>) – macht Fehlersuche leichter.</p>
      <h3>Sonderfälle</h3>
      <table class="tbl">
        <tr><td><b>/127</b></td><td>Point-to-Point-Links zwischen Routern (RFC 6164) – schützt vor Neighbor-Cache-Exhaustion. Häufig wird aber auch einfach ein /64 reserviert.</td></tr>
        <tr><td><b>/128</b></td><td>Einzelne Host-Route, z. B. Loopback-Adressen von Routern.</td></tr>
        <tr><td><b>/56 vs. /48 vs. /60</b></td><td>Empfehlung RIPE-690: Endkunden mindestens /56, Firmen /48. Manche Provider geben nur /60 oder /64 – dann ist kein Subnetting möglich!</td></tr>
      </table>
      <h3>Erste und letzte Adresse</h3>
      <p>Netzadresse = alle Host-Bits 0, letzte Adresse = alle Host-Bits 1. Bei <code>2001:db8:abcd:4000::/50</code>:</p>
      <ul>
        <li>von <code>2001:db8:abcd:4000::</code></li>
        <li>bis <code>2001:db8:abcd:7fff:ffff:ffff:ffff:ffff</code></li>
      </ul>
      <p>Es gibt keine Broadcast-Adresse – theoretisch sind alle Adressen nutzbar. Ausnahmen: die <b>Subnet-Router-Anycast</b>-Adresse (Interface-ID nur Nullen) und reservierte Anycast-Adressen am Ende.</p>
      <h3>Binär verstehen (nicht-Nibble-Grenzen)</h3>
      <p>Bei <code>/50</code> gehören vom 4. Block nur die <b>ersten 2 Bit</b> zur Subnet-ID: <code><b>00</b>00 0000 0000 0000</code>. Mögliche Werte: 00, 01, 10, 11 → binär an die Stelle geschoben: <code>0000</code>, <code>4000</code>, <code>8000</code>, <code>c000</code>. Zwischen 0x4000 und 0x7fff liegt alles im 2. Subnetz.</p>
      <h3>Präfix-Zusammenfassung</h3>
      <p>Die 16 Netze <code>2001:db8:abcd:1000::/56</code> bis <code>2001:db8:abcd:1f00::/56</code> lassen sich zu einer Route <code>2001:db8:abcd:1000::/52</code> zusammenfassen – Grundprinzip für kleine Routing-Tabellen.</p>`,
  },

  merke: [
    'Anzahl Subnetze = 2^(neues Präfix − altes Präfix).',
    '/48 → /64 = 65.536 · /56 → /64 = 256 · /60 → /64 = 16 Subnetze.',
    'Ein LAN bekommt immer /64 (wegen SLAAC).',
    'In 4er-Schritten teilen = eine Hex-Ziffer pro Schritt hochzählen.',
    'Schrittweite = 2^(Blockende − neues Präfix); Block 4 endet bei Bit 64.',
    'Das erste Subnetz hat die Subnet-ID 0.',
  ],

  cheat: [
    ['Subnetze', '2<sup>(n_neu − n_alt)</sup>'],
    ['/48 → /64', '65.536 Subnetze'],
    ['/56 → /64', '256 Subnetze'],
    ['/60 → /64', '16 Subnetze'],
    ['Blockgrenzen', 'Block 1: Bit 1–16 · 2: 17–32 · 3: 33–48 · 4: 49–64'],
    ['Schrittweite', '2<sup>(Blockende − neues Präfix)</sup> im betroffenen Block'],
    ['Hex-Schritte', '0x1000 = 4.096 · 0x2000 = 8.192 · 0x4000 = 16.384 · 0x8000 = 32.768'],
    ['Typisch', 'Firma /48 · Privatkunde /56 (oder /60) · LAN /64 · P2P /127 · Host /128'],
  ],

  cards: [
    ['Formel: Anzahl Subnetze', '2<sup>(neues Präfix − altes Präfix)</sup>'],
    ['Wie viele /64 in einem /48?', '2¹⁶ = <b>65.536</b>'],
    ['Wie viele /64 in einem /56?', '2⁸ = <b>256</b>'],
    ['Wie viele /64 in einem /60?', '2⁴ = <b>16</b>'],
    ['Welches Präfix für ein normales LAN?', '<b>/64</b> – SLAAC braucht eine 64-Bit-Interface-ID'],
    ['Nibble-Grenze', 'Präfix ist Vielfaches von 4 → genau eine Hex-Ziffer pro 4 Bit ändert sich'],
    ['/48 in 4 Subnetze teilen', '/50 → 4. Block: 0000, 4000, 8000, c000'],
    ['Bits für N Subnetze', 'kleinstes n mit 2ⁿ ≥ N (z. B. 10 Subnetze → 4 Bit)'],
    ['Zweites /52 von 2001:db8:abcd::/48', '2001:db8:abcd:1000::/52'],
  ],

  quiz: [
    { q: 'Wie viele /64-Subnetze enthält ein /48-Präfix?', a: ['65.536', '256', '16', '4.096'], c: 0, e: '64 − 48 = 16 Bit → 2¹⁶ = 65.536.' },
    { q: 'Wie viele /64-Subnetze enthält ein /56-Präfix?', a: ['256', '65.536', '128', '8'], c: 0, e: '64 − 56 = 8 Bit → 2⁸ = 256.' },
    { q: 'Wie berechnet man die Anzahl der Subnetze?', a: ['2^(neues Präfix − altes Präfix)', '2^(neues Präfix)', 'neues Präfix − altes Präfix', '2^(128 − Präfix)'], c: 0, e: 'Jedes geliehene Bit verdoppelt die Anzahl. 2^(128 − Präfix) wäre die Anzahl der Adressen.' },
    { q: 'Welche Präfixlänge bekommt ein normales LAN-Segment?', a: ['/64', '/48', '/128', '/56'], c: 0, e: 'SLAAC benötigt eine 64-Bit-Interface-ID.' },
    { q: 'Du teilst <code>2001:db8:abcd::/48</code> in 4 gleich große Subnetze. Welches Präfix haben sie?', a: ['/50', '/52', '/49', '/64'], c: 0, e: '4 = 2² → 2 Bit leihen → /50.' },
    { q: 'Welche Werte hat der 4. Block bei der Teilung /48 → /50?', a: ['0000, 4000, 8000, c000', '0000, 0001, 0002, 0003', '0000, 1000, 2000, 3000', '0000, 2000, 4000, 6000'], c: 0, e: 'Schrittweite 2^(64−50) = 2¹⁴ = 0x4000.' },
    { q: 'Wie viele Bit entspricht eine Hex-Ziffer?', a: ['4 (ein Nibble)', '8', '16', '2'], c: 0, e: 'Deshalb ist Subnetting in 4er-Schritten so bequem.' },
    { q: 'Wie lautet das <b>zweite</b> /52-Subnetz von <code>2001:db8:abcd::/48</code>?', a: ['2001:db8:abcd:1000::/52', '2001:db8:abcd:1::/52', '2001:db8:abcd:100::/52', '2001:db8:abce::/52'], c: 0, e: '/52 = 4 Bit im 4. Block → die erste Hex-Ziffer zählt: 0000, 1000, 2000 …' },
    { q: 'Wie viele Adressen hat ein /64-Netz?', a: ['2⁶⁴ ≈ 1,8 × 10¹⁹', '2³²', '254', '65.536'], c: 0, e: '128 − 64 = 64 Host-Bits.' },
    { q: 'Eine Firma hat ein /48 und gibt jedem Standort ein /56. Wie viele Standorte sind möglich?', a: ['256', '16', '65.536', '56'], c: 0, e: '56 − 48 = 8 Bit → 256.' },
    { q: 'Du brauchst aus einem /48 genau 10 Subnetze. Welches Präfix ist <b>mindestens</b> nötig?', a: ['/52', '/50', '/58', '/49'], c: 0, e: '2³ = 8 reicht nicht, 2⁴ = 16 ≥ 10 → 4 Bit → /52.' },
    { q: 'Welches Präfix wird für Point-to-Point-Verbindungen zwischen Routern empfohlen?', a: ['/127', '/30', '/48', '/56'], c: 0, e: 'RFC 6164 empfiehlt /127 (in der Praxis wird oft trotzdem ein /64 reserviert). /30 ist IPv4.' },
    { type: 'input', q: 'Wie lautet das <b>letzte</b> /64-Subnetz von <code>2001:db8:abcd::/48</code>?', accept: ['2001:db8:abcd:ffff::'], norm: 'ipv6', placeholder: 'Subnetz-Adresse', e: 'Die 16 Bit Subnet-ID laufen von 0000 bis ffff.' },
    { type: 'input', q: 'Wie lautet das <b>3.</b> /56-Subnetz von <code>2001:db8:1200::/48</code>?', accept: ['2001:db8:1200:200::'], norm: 'ipv6', e: '/56 = 8 Bit → Subnet-IDs 00xx: 0000, 0100, 0200 → das dritte ist 0200.' },
  ],

  generators: [
    {
      name: 'Anzahl Subnetze',
      make() {
        const a = pick([32, 40, 44, 48, 48, 52, 56]);
        const b = Math.min(64, a + 1 + rnd(Math.min(16, 64 - a)));
        const n = 2 ** (b - a);
        return { type: 'input', q: `Wie viele <code>/${b}</code>-Subnetze passen in ein <code>/${a}</code>-Präfix?`, accept: [String(n)], norm: 'num', e: `${b} − ${a} = ${b - a} Bit → 2^${b - a} = ${fmtNum(n)}.` };
      },
    },
    {
      name: 'n-tes Subnetz finden',
      make() {
        const base = [0x2001, 0xdb8, rnd(0x10000), 0, 0, 0, 0, 0];
        const newLen = pick([50, 51, 52, 52, 54, 56, 56, 60, 64]);
        const max = Math.min(2 ** (newLen - 48), 16);
        const k = 1 + rnd(max);
        const sn = IPv6.subnet(base, 48, newLen, k - 1);
        return { type: 'input', q: `Netz <code>${IPv6.compress(base)}/48</code> wird in <code>/${newLen}</code>-Subnetze geteilt. Wie lautet das <b>${k}.</b> Subnetz?`, accept: [IPv6.compress(sn)], norm: 'ipv6', placeholder: 'Subnetz-Adresse (ohne oder mit /Präfix)', hint: 'Das 1. Subnetz hat die Subnet-ID 0.', e: `Schrittweite im 4. Block: 2^(64−${newLen}) = ${fmtNum(2 ** (64 - newLen))} = 0x${(2 ** (64 - newLen)).toString(16)}. ${k}. Subnetz = (${k} − 1) × Schritt → <code>${IPv6.compress(sn)}/${newLen}</code>` };
      },
    },
    {
      name: 'Benötigtes Präfix',
      make() {
        const a = pick([48, 48, 56, 52]);
        const N = 2 + rnd(a === 56 ? 60 : 300);
        const bits = Math.ceil(Math.log2(N));
        return { type: 'input', q: `Du hast ein <code>/${a}</code> und brauchst <b>${N}</b> gleich große Subnetze. Welche Präfixlänge ist mindestens nötig? (nur die Zahl)`, accept: [String(a + bits)], norm: 'num', placeholder: 'z. B. 52', e: `2^${bits} = ${2 ** bits} ≥ ${N}${bits > 1 ? `, 2^${bits - 1} = ${2 ** (bits - 1)} reicht nicht` : ''} → ${a} + ${bits} = /${a + bits}.` };
      },
    },
  ],

  games: {
    blitz: [
      () => {
        const a = pick([48, 48, 52, 56, 60]), d = 1 + rnd(Math.min(16, 64 - a)), b = a + d;
        const c = 2 ** d;
        const wrong = [...new Set([2 ** (d + 1), d > 1 ? 2 ** (d - 1) : 2 ** (d + 2), d * 2 === c ? 2 ** (d + 2) : d * 2])].filter(x => x !== c).slice(0, 2);
        return { q: `Wie viele <code>/${b}</code>-Subnetze passen in ein <code>/${a}</code>?`, a: [c, ...wrong].map(fmtNum), e: `${b} − ${a} = ${d} Bit → 2^${d} = ${fmtNum(c)}.` };
      },
      () => {
        const base = [0x2001, 0xdb8, rnd(0x10000), 0, 0, 0, 0, 0], k = 2 + rnd(7);
        const right = IPv6.compress(IPv6.subnet(base, 48, 52, k - 1));
        const off = IPv6.compress(IPv6.subnet(base, 48, 52, k));
        const g2 = [...base]; g2[3] = k - 1;
        return { q: `<code>${IPv6.compress(base)}/48</code> → /52. Wie lautet das <b>${k}.</b> Subnetz?`, a: [right, off, IPv6.compress(g2)].map(x => x + '/52'), e: `/52 = erste Hex-Ziffer des 4. Blocks zählt. Das 1. Subnetz ist 0000 → das ${k}. ist ${(k - 1).toString(16)}000.` };
      },
      () => {
        const N = 3 + rnd(120), bits = Math.ceil(Math.log2(N));
        return { q: `/48 und du brauchst <b>${N}</b> Subnetze. Mindest-Präfix?`, a: [48 + bits, 48 + bits - 1, 48 + bits + 1].map(x => '/' + x), e: `2^${bits} = ${2 ** bits} ≥ ${N} → /${48 + bits}.` };
      },
    ],
    sort: [
      {
        name: 'Nibble-Grenze?', q: 'Liegt das Präfix auf einer Nibble-Grenze?', bins: ['✅ ja (Vielfaches von 4)', '❌ nein'],
        make() { const p = 33 + rnd(32); return [`/${p}`, p % 4 === 0 ? 0 : 1, p % 4 === 0 ? `${p} = 4 × ${p / 4} → pro Stufe genau eine Hex-Ziffer.` : `${p} ist kein Vielfaches von 4 – die Grenze liegt mitten in einer Hex-Ziffer.`]; },
      },
      {
        name: 'Typisches Präfix', q: 'Wofür ist das Präfix typisch?', bins: ['🏢 Firma / Standort', '🏠 Privatkunde', '💻 ein LAN', '🔗 Router-Link / Host'],
        items: [['/48', 0, 'Standard-Zuteilung für Firmen'], ['/52', 0, 'Großer Standort innerhalb eines /48'], ['/56', 1, 'Empfohlene Größe für Privatkunden'], ['/60', 1, 'Manche Provider geben Privatkunden nur /60'], ['/64', 2, 'Jedes LAN/VLAN – wegen SLAAC'], ['/127', 3, 'Point-to-Point zwischen Routern (RFC 6164)'], ['/128', 3, 'Einzelner Host, z. B. Loopback eines Routers']],
      },
    ],
    seq: [{ name: 'Subnetting-Rezept', steps: ['Benötigte Bits: kleinstes n mit 2^n ≥ Anzahl', 'Neues Präfix = altes Präfix + n', 'Block finden, in dem die Grenze liegt', 'Schrittweite = 2^(Blockende − neues Präfix)', 'Subnetze aufzählen: 0, 1×, 2× Schrittweite …'] }],
    pairs: [['/48 → /64', '65.536 Subnetze'], ['/56 → /64', '256 Subnetze'], ['/60 → /64', '16 Subnetze'], ['/52 → /64', '4.096 Subnetze'], ['/48 → /50', '4 Subnetze'], ['0x4000', '16.384'], ['0x8000', '32.768'], ['1 Hex-Ziffer', '4 Bit (Nibble)']],
  },

  visuals: [
    {
      title: '🧮 Subnetz-Rechner',
      render(root) {
        root.innerHTML = `<div class="lab">
          <div class="grid2">
            <label class="field"><span>Ausgangsnetz mit Präfix</span><input id="snBase" value="2001:db8:abcd::/48" spellcheck="false"></label>
            <label class="field"><span>Neues Präfix: <b id="snLenOut" style="color:var(--text)"></b></span><input type="range" id="snLen" min="49" max="64" value="50"></label>
          </div>
          <label class="field" style="max-width:300px"><span>Subnetz Nr. anzeigen (1 = erstes)</span><input id="snK" type="number" min="1" value="1"></label>
          <div id="snOut"></div></div>`;
        const base = $('#snBase', root), len = $('#snLen', root), kIn = $('#snK', root), out = $('#snOut', root);
        const upd = () => {
          try {
            const { addr, len: bl } = IPv6.splitPrefix(base.value);
            if (bl === null) throw new Error('Bitte die Präfixlänge mit angeben, z. B. /48');
            if (bl < 1 || bl > 127) throw new Error('Präfixlänge zwischen 1 und 127');
            const g = IPv6.parse(addr);
            len.min = bl + 1; len.max = Math.max(64, bl + 1);
            if (+len.value <= bl) len.value = bl + 1;
            const nl = +len.value;
            $('#snLenOut', root).textContent = '/' + nl;
            const bits = nl - bl, count = 1n << BigInt(bits);
            let k = Math.max(1, parseInt(kIn.value, 10) || 1);
            if (BigInt(k) > count) { k = Number(count > 100000n ? 100000n : count); kIn.value = k; }
            const blk = Math.floor((nl - 1) / 16), stepExp = 16 * (blk + 1) - nl;
            const step = 1n << BigInt(stepExp);
            const sn = IPv6.subnet(g, bl, nl, k - 1);
            const hex = IPv6.expand(sn).replace(/:/g, '');
            const nib = [];
            for (let i = 0; i < 32; i++) {
              const s0 = i * 4, parts = [0, 1, 2, 3].map(j => s0 + j < bl ? 'var(--net)' : s0 + j < nl ? 'var(--sub)' : 'var(--line)');
              const bg = parts.every(p => p === parts[0]) ? parts[0] : `linear-gradient(90deg, ${parts.map((p, j) => `${p} ${j * 25}%, ${p} ${(j + 1) * 25}%`).join(', ')})`;
              nib.push(`<div class="nib" style="background:${bg};${parts[3] === 'var(--line)' && parts[0] === 'var(--line)' ? 'color:var(--muted)' : ''}">${hex[i]}</div>`);
              if (i % 4 === 3 && i < 31) nib.push('<div class="nib-sep">:</div>');
            }
            const show = Number(count < 8n ? count : 8n);
            const rows = [];
            for (let i = 0; i < show; i++) rows.push(i);
            const net = IPv6.network(g, bl);
            const row = i => { const s = IPv6.subnet(g, bl, nl, i); return `<tr${i === k - 1 ? ' style="background:color-mix(in srgb,var(--accent) 15%,transparent)"' : ''}><td>${fmtNum(BigInt(i) + 1n)}.</td><td><code>${IPv6.compress(s)}/${nl}</code></td><td><code>${IPv6.compress(IPv6.lastAddr(s, nl))}</code></td></tr>`; };
            out.innerHTML = `
              ${IPv6.compress(net) !== IPv6.compress(g) ? `<div class="callout warn">Die eingegebene Adresse ist keine Netzadresse – gerechnet wird mit <code>${IPv6.compress(net)}/${bl}</code>.</div>` : ''}
              <div class="kpis">
                <div class="kpi"><span>Geliehene Bits</span><b>${bits}</b></div>
                <div class="kpi"><span>Anzahl Subnetze (2^${bits})</span><b>${fmtNum(count)}</b></div>
                <div class="kpi"><span>Grenze liegt im</span><b>${blk + 1}. Block</b></div>
                <div class="kpi"><span>Schrittweite dort</span><b>${fmtNum(step)} = 0x${step.toString(16)}</b></div>
              </div>
              <p style="margin:16px 0 6px"><b>${k}. Subnetz</b> – Bit für Bit (jedes Kästchen = 1 Hex-Ziffer = 4 Bit):</p>
              <div class="nibbles">${nib.join('')}</div>
              <div class="legend" style="margin:8px 0 14px"><span style="--c:var(--net)">Ursprüngliches Präfix /${bl}</span><span style="--c:var(--sub)">Subnetz-Bits (${bits})</span><span style="--c:var(--line)">Interface-/Host-Bits</span></div>
              <div class="tbl-wrap"><table class="tbl"><tr><th>Nr.</th><th>Subnetz</th><th>Letzte Adresse</th></tr>
                ${rows.map(row).join('')}
                ${count > 8n ? `<tr><td colspan="3" class="muted">… ${fmtNum(count - 9n)} weitere …</td></tr>${row(count - 1n)}` : ''}
                ${k > show && BigInt(k) < count ? row(k - 1) : ''}
              </table></div>`;
          } catch (e) { out.innerHTML = `<div class="fb bad">⚠ ${esc(e.message)}</div>`; }
        };
        [base, len, kIn].forEach(x => x.oninput = upd);
        upd();
      },
    },
    {
      title: '📐 Präfix-Tabelle',
      render(root) {
        const rows = [[32, 'Provider / große Organisation (LIR)'], [40, ''], [44, ''], [48, 'Unternehmen, Standort (Standard für Firmen)'], [52, 'großer Standort'], [56, 'Privatkunde (empfohlen)'], [60, 'Privatkunde (manche Provider)'], [62, ''], [64, 'EIN LAN / VLAN']];
        root.innerHTML = `<p class="muted" style="margin-top:0">Wie viele /64-Netze stecken in welchem Präfix? Die Balken zeigen die Größe logarithmisch.</p>
          <table class="tbl"><tr><th>Präfix</th><th>Anzahl /64</th><th style="width:38%">Größe</th><th>Typisch für</th></tr>
          ${rows.map(([p, d]) => { const n = 2n ** BigInt(64 - p); return `<tr><td><b>/${p}</b></td><td><code>${fmtNum(n)}</code></td><td><div class="bar"><i style="width:${Math.max(3, (64 - p) / 32 * 100)}%"></i></div></td><td>${d}</td></tr>`; }).join('')}</table>
          <div class="callout tip">Merkhilfe: Jede 4 Bit = Faktor 16. /60 → 16, /56 → 256, /52 → 4.096, /48 → 65.536.</div>`;
      },
    },
  ],
});
