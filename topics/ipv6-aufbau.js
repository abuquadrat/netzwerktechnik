registerTopic({
  id: 'ipv6-aufbau',
  title: 'IPv6 – Aufbau',
  subtitle: '128 Bit, Hex-Blöcke & Kürzungsregeln',
  category: 'IPv6',
  icon: '🧬',
  color: '#60a5fa',

  levels: {
    1: `
      <h2>Warum überhaupt IPv6?</h2>
      <div class="analogy"><div class="big">📞</div><div>
        Stell dir IP-Adressen wie Telefonnummern vor. IPv4 hat nur <b>ca. 4,3 Milliarden</b> Nummern – weniger als es Menschen gibt, und jeder hat Handy, Laptop, Smart-TV …
        Die Nummern sind schlicht <b>ausgegangen</b>. IPv6 macht die Nummer viel länger: Es gibt so viele Adressen, dass man <b>jedem Sandkorn der Erde</b> Milliarden geben könnte.</div></div>
      <h2>Wie sieht so eine Adresse aus?</h2>
      <p><code>2001:0db8:0000:0000:0000:ff00:0042:8329</code></p>
      <ul>
        <li>Sie besteht aus <b>8 Blöcken</b>, getrennt durch <b>Doppelpunkte</b>.</li>
        <li>Jeder Block hat <b>4 Zeichen</b> – und zwar <b>hexadezimal</b> (0–9 und a–f).</li>
        <li>Das sieht lang aus, deshalb darf man <b>abkürzen</b> (siehe unten).</li>
      </ul>
      <div class="analogy"><div class="big">🏠</div><div>
        Wie eine Postadresse hat die IPv6-Adresse zwei Teile: <b>vorne die „Straße“</b> (das Netz, in dem du bist – das <b>Präfix</b>) und <b>hinten die „Hausnummer“</b> (dein Gerät – die <b>Interface-ID</b>). Meist ist jede Hälfte genau 64 Bit lang.</div></div>
      <h2>Abkürzen in zwei Regeln</h2>
      <ol>
        <li><b>Nullen am Anfang eines Blocks</b> dürfen weg: <code>0db8</code> → <code>db8</code>, <code>0000</code> → <code>0</code></li>
        <li><b>Mehrere Null-Blöcke hintereinander</b> dürfen <b>einmal</b> durch <code>::</code> ersetzt werden.</li>
      </ol>
      <div class="flow"><span>2001:0db8:0000:0000:0000:ff00:0042:8329</span><i>→</i><span>2001:db8:0:0:0:ff00:42:8329</span><i>→</i><span>2001:db8::ff00:42:8329</span></div>
      <div class="callout tip">Probier es unten im <b>Adress-Labor</b> aus – tippe eine Adresse ein und schau zu, wie sie gekürzt wird.</div>`,

    2: `
      <h2>Eckdaten</h2>
      <table class="tbl">
        <tr><th>Merkmal</th><th>IPv4</th><th>IPv6</th></tr>
        <tr><td>Länge</td><td>32 Bit</td><td><b>128 Bit</b></td></tr>
        <tr><td>Schreibweise</td><td>4 Oktette dezimal, Punkt</td><td><b>8 Blöcke à 16 Bit, hexadezimal, Doppelpunkt</b></td></tr>
        <tr><td>Anzahl Adressen</td><td>2³² ≈ 4,3 Mrd.</td><td>2¹²⁸ ≈ 3,4 × 10³⁸</td></tr>
        <tr><td>Netzanteil</td><td>Subnetzmaske / CIDR</td><td>nur <b>Präfixlänge</b> (z. B. /64)</td></tr>
        <tr><td>Broadcast</td><td>ja</td><td><b>nein</b> – stattdessen Multicast</td></tr>
        <tr><td>Header</td><td>20–60 Byte, variabel</td><td><b>40 Byte fest</b> (+ Extension Header)</td></tr>
        <tr><td>Adressauflösung</td><td>ARP</td><td>NDP (Neighbor Discovery, ICMPv6)</td></tr>
        <tr><td>Autokonfiguration</td><td>DHCP</td><td>SLAAC und/oder DHCPv6</td></tr>
      </table>
      <p>Ein Block (auch <b>Hextet</b> genannt) = 16 Bit = 4 Hex-Ziffern. Eine Hex-Ziffer = 4 Bit (<b>Nibble</b>). → 8 × 4 = <b>32 Hex-Ziffern</b> in einer vollen Adresse.</p>

      <h2>Aufbau einer Global-Unicast-Adresse</h2>
      <div class="blocks">
        <div class="blk c-net"><b>2001</b><small>1</small></div><div class="blk c-net"><b>0db8</b><small>2</small></div><div class="blk c-net"><b>abcd</b><small>3</small></div>
        <div class="blk c-sub"><b>0012</b><small>4</small></div>
        <div class="blk c-iid"><b>0000</b><small>5</small></div><div class="blk c-iid"><b>0000</b><small>6</small></div><div class="blk c-iid"><b>0000</b><small>7</small></div><div class="blk c-iid"><b>0001</b><small>8</small></div>
      </div>
      <div class="legend" style="margin-top:8px"><span class="c-net">Global Routing Prefix – 48 Bit (vom Provider)</span><span class="c-sub">Subnet-ID – 16 Bit (selbst planbar)</span><span class="c-iid">Interface-ID – 64 Bit (das Gerät)</span></div>
      <p>Präfix (Netzanteil) = Global Routing Prefix + Subnet-ID = <b>/64</b>. Schreibweise: <code>2001:db8:abcd:12::1/64</code></p>

      <h2>Kürzungsregeln</h2>
      <ol>
        <li><b>Führende Nullen</b> in jedem Block weglassen: <code>0042</code> → <code>42</code>, <code>0000</code> → <code>0</code>.</li>
        <li><b>Eine</b> zusammenhängende Folge von Null-Blöcken durch <code>::</code> ersetzen – <b>nur einmal pro Adresse</b>, sonst wäre unklar, wie viele Nullen wo fehlen.</li>
      </ol>
      <p>Empfehlung nach <b>RFC 5952</b> (eindeutige Schreibweise): Kleinbuchstaben, <b>die längste</b> Null-Folge kürzen, bei <b>Gleichstand die erste</b>, einen <b>einzelnen</b> Null-Block nicht mit <code>::</code> kürzen.</p>
      <div class="callout warn"><b>Nur führende</b> Nullen dürfen weg, nie die am Ende! <code>2010</code> bleibt <code>2010</code> (nicht <code>201</code>), <code>0100</code> wird zu <code>100</code>. Und <code>2001:db8::1::5</code> ist <b>ungültig</b> (zweimal <code>::</code>).</div>
      <h3>Rückwärts: Adresse ausschreiben</h3>
      <p>Zähle die vorhandenen Blöcke. Fehlende Blöcke bis 8 sind die, die <code>::</code> ersetzt. Beispiel <code>fe80::1:2</code>: 3 Blöcke vorhanden → <code>::</code> steht für 5 Null-Blöcke → <code>fe80:0000:0000:0000:0000:0000:0001:0002</code>.</p>
      <div class="callout exam">In Prüfungen kommt fast immer eine Aufgabe „Kürzen Sie maximal“ oder „Schreiben Sie vollständig aus“. Gehe stur die zwei Regeln durch und zähle am Ende die Blöcke nach (müssen 8 ergeben).</div>
      <h3>Besondere Schreibweisen</h3>
      <ul>
        <li>In URLs in eckigen Klammern: <code>http://[2001:db8::1]:8080/</code></li>
        <li>Link-Local mit Zonen-Index: <code>fe80::1%12</code> (Windows: Schnittstellen-Nummer)</li>
      </ul>`,

    3: `
      <h2>Der IPv6-Header (40 Byte, fest)</h2>
      <table class="tbl">
        <tr><th>Feld</th><th>Bit</th><th>Bedeutung</th></tr>
        <tr><td>Version</td><td>4</td><td>immer 6</td></tr>
        <tr><td>Traffic Class</td><td>8</td><td>Priorisierung (DSCP + ECN), entspricht ToS bei IPv4</td></tr>
        <tr><td>Flow Label</td><td>20</td><td>kennzeichnet zusammengehörige Pakete eines Datenstroms</td></tr>
        <tr><td>Payload Length</td><td>16</td><td>Länge der Nutzdaten (ohne Basis-Header)</td></tr>
        <tr><td>Next Header</td><td>8</td><td>was folgt: TCP (6), UDP (17), ICMPv6 (58) oder ein Extension Header</td></tr>
        <tr><td>Hop Limit</td><td>8</td><td>wie TTL bei IPv4 – jeder Router zieht 1 ab</td></tr>
        <tr><td>Source / Destination</td><td>je 128</td><td>Quell- und Zieladresse</td></tr>
      </table>
      <p><b>Weggefallen</b> gegenüber IPv4: Header-Prüfsumme (macht Schicht 2/4), Fragmentierungsfelder (in Extension Header ausgelagert), Optionen (→ Extension Header wie Hop-by-Hop, Routing, Fragment, AH, ESP).</p>
      <h3>Fragmentierung & MTU</h3>
      <p>Router fragmentieren <b>nicht</b> mehr. Nur der Absender darf fragmentieren; er ermittelt die passende Größe per <b>Path MTU Discovery</b> (ICMPv6 „Packet Too Big“). Jede IPv6-Strecke muss mindestens <b>1280 Byte MTU</b> können.</p>
      <h3>Adressraum in Zahlen</h3>
      <p>2¹²⁸ = 340.282.366.920.938.463.463.374.607.431.768.211.456 Adressen. Ein einziges /64-Netz hat 2⁶⁴ ≈ 1,8 × 10¹⁹ Adressen – das ist das 4-Milliarden-fache des gesamten IPv4-Internets.</p>
      <h3>Präfixe, die man kennen sollte</h3>
      <table class="tbl">
        <tr><td><code>2000::/3</code></td><td>Global Unicast (aktuell vergeben)</td></tr>
        <tr><td><code>2001:db8::/32</code></td><td>Dokumentation / Beispiele (RFC 3849)</td></tr>
        <tr><td><code>fe80::/10</code></td><td>Link-Local</td></tr>
        <tr><td><code>fc00::/7</code></td><td>Unique Local</td></tr>
        <tr><td><code>ff00::/8</code></td><td>Multicast</td></tr>
        <tr><td><code>::ffff:0:0/96</code></td><td>IPv4-mapped, z. B. <code>::ffff:192.0.2.1</code></td></tr>
        <tr><td><code>64:ff9b::/96</code></td><td>NAT64 (IPv6-only-Clients erreichen IPv4-Server)</td></tr>
      </table>
      <h3>Übergangstechniken</h3>
      <ul>
        <li><b>Dual Stack</b>: IPv4 und IPv6 parallel (Standard in Firmen und bei Providern).</li>
        <li><b>Tunnel</b> (6in4, 6to4, Teredo): IPv6 in IPv4 eingepackt.</li>
        <li><b>NAT64/DNS64</b>: Übersetzung zwischen den Welten.</li>
        <li><b>DS-Lite</b>: Kunde hat echtes IPv6, IPv4 wird beim Provider per CGN geteilt (typisch bei Kabelanbietern).</li>
      </ul>
      <div class="callout">Privatsphäre: Weil die Interface-ID früher aus der MAC-Adresse gebildet wurde (EUI-64), konnte man Geräte über Netze hinweg verfolgen. Heute nutzen Windows, macOS, Android & Co. <b>zufällige</b> bzw. <b>temporäre</b> Interface-IDs (Privacy Extensions, RFC 8981).</div>`,
  },

  merke: [
    '128 Bit = 8 Blöcke × 16 Bit = 32 Hex-Ziffern.',
    'Kürzen: 1) führende Nullen weg, 2) EINMAL :: für die längste Null-Folge.',
    'Nur FÜHRENDE Nullen dürfen weg – 2010 bleibt 2010.',
    'Standard-Aufteilung: 48 Bit Global Routing Prefix | 16 Bit Subnet-ID | 64 Bit Interface-ID.',
    'Kein Broadcast in IPv6, kein ARP (→ NDP), Header fest 40 Byte.',
  ],

  cheat: [
    ['Länge', '128 Bit, 8 Blöcke (Hextets) à 16 Bit, hexadezimal, Trenner „:“'],
    ['Kürzen', 'führende Nullen weg; einmal <code>::</code> für zusammenhängende Null-Blöcke (längste, bei Gleichstand erste)'],
    ['GUA-Aufbau', '48 Bit Global Routing Prefix | 16 Bit Subnet-ID | 64 Bit Interface-ID'],
    ['LAN-Präfix', '/64'],
    ['Header', '40 Byte fest; Hop Limit = TTL; Next Header = Protocol'],
    ['Mindest-MTU', '1280 Byte, Router fragmentieren nicht'],
    ['Doku-Präfix', '<code>2001:db8::/32</code>'],
    ['URL', '<code>http://[2001:db8::1]:8080</code>'],
  ],

  cards: [
    ['Wie lang ist eine IPv6-Adresse?', '<b>128 Bit</b> = 8 Blöcke à 16 Bit = 32 Hex-Ziffern'],
    ['Kürzungsregel 1', 'Führende Nullen in einem Block dürfen weg: <code>0db8</code> → <code>db8</code>, <code>0000</code> → <code>0</code>'],
    ['Kürzungsregel 2', 'Eine zusammenhängende Folge von Null-Blöcken darf <b>einmal</b> durch <code>::</code> ersetzt werden'],
    ['Warum darf :: nur einmal vorkommen?', 'Sonst wüsste man nicht, wie viele Null-Blöcke an welcher Stelle fehlen'],
    ['RFC 5952 – Empfehlungen', 'Kleinbuchstaben · längste Null-Folge kürzen · bei Gleichstand die erste · einzelnen 0-Block nicht mit :: kürzen'],
    ['Aufbau Global Unicast', '48 Bit Global Routing Prefix · 16 Bit Subnet-ID · 64 Bit Interface-ID'],
    ['IPv6-Basis-Header', '40 Byte fest (Version, Traffic Class, Flow Label, Payload Length, Next Header, Hop Limit, Quelle, Ziel)'],
    ['Was gibt es in IPv6 nicht mehr?', 'Broadcast, ARP (→ NDP), Header-Prüfsumme, Fragmentierung durch Router'],
    ['IPv6-Adresse in einer URL', 'In eckigen Klammern: <code>http://[2001:db8::1]:8080</code>'],
    ['Hextet / Nibble', 'Hextet = Block mit 16 Bit · Nibble = 4 Bit = eine Hex-Ziffer'],
  ],

  quiz: [
    { q: 'Wie viele Bit hat eine IPv6-Adresse?', a: ['128', '32', '64', '256'], c: 0, e: '128 Bit = 8 Blöcke à 16 Bit.' },
    { q: 'Wie viele Bit umfasst ein Block (Hextet) einer IPv6-Adresse?', a: ['16', '8', '4', '32'], c: 0, e: '4 Hex-Ziffern à 4 Bit = 16 Bit.' },
    { q: 'Welche Schreibweise entspricht <code>2001:0db8:0000:0000:0000:0000:0000:0001</code>?', a: ['2001:db8::1', '2001:db8::0001::', '2001:db8:::1', '2001:db8:1'], c: 0, e: 'Führende Nullen weg, die sechs Null-Blöcke werden zu ::' },
    { q: 'Welche Kürzung von <code>2001:db8:0:0:1:0:0:1</code> ist <b>NICHT</b> erlaubt?', a: ['2001:db8::1::1', '2001:db8::1:0:0:1', '2001:db8:0:0:1::1', '2001:0db8:0:0:1:0:0:1'], c: 0, e: ':: darf nur einmal vorkommen – sonst ist unklar, wie viele Nullen wo fehlen.' },
    { q: 'Darf man den Block <code>2010</code> zu <code>201</code> kürzen?', a: ['Nein – nur führende Nullen dürfen entfallen', 'Ja, Nullen dürfen immer weg', 'Ja, aber nur im letzten Block', 'Nur mit ::'], c: 0, e: '201 wäre 0201 – ein anderer Wert.' },
    { q: 'Wie viele Hex-Ziffern hat eine vollständig ausgeschriebene IPv6-Adresse?', a: ['32', '16', '64', '128'], c: 0, e: '8 Blöcke × 4 Ziffern = 32.' },
    { q: 'Was bedeutet <code>/64</code> in <code>2001:db8:1:1::10/64</code>?', a: ['Die ersten 64 Bit sind der Netzanteil (Präfix)', 'Das Netz hat 64 Hosts', 'Es gibt 64 Subnetze', 'Die Adresse ist 64 Bit lang'], c: 0, e: 'Die Präfixlänge sagt, wie viele Bit von links zum Netz gehören. Die restlichen 64 Bit sind die Interface-ID.' },
    { q: 'Typische Aufteilung einer Global-Unicast-Adresse?', a: ['48 Bit Routing Prefix, 16 Bit Subnet-ID, 64 Bit Interface-ID', '64 / 32 / 32 Bit', '32 / 32 / 64 Bit', '16 / 48 / 64 Bit'], c: 0, e: '48 + 16 = /64 Netzanteil, 64 Bit für das Gerät.' },
    { q: 'Wie groß ist der IPv6-Basis-Header?', a: ['40 Byte, fest', '20 Byte, variabel', '60 Byte', '128 Byte'], c: 0, e: 'Fester Header erleichtert Routern die Verarbeitung. Optionen stehen in Extension Headern.' },
    { q: 'Welche Übertragungsart gibt es bei IPv6 <b>nicht</b> mehr?', a: ['Broadcast', 'Multicast', 'Unicast', 'Anycast'], c: 0, e: 'Broadcast wurde durch Multicast-Gruppen (z. B. ff02::1) ersetzt.' },
    { q: 'Wie gibt man eine IPv6-Adresse mit Port in einer URL an?', a: ['http://[2001:db8::1]:8080', 'http://2001:db8::1:8080', 'http://(2001:db8::1):8080', 'http://2001:db8::1/8080'], c: 0, e: 'Eckige Klammern, weil der Doppelpunkt sonst mit dem Port verwechselt wird.' },
    { q: 'Welches IPv6-Feld entspricht der TTL von IPv4?', a: ['Hop Limit', 'Flow Label', 'Traffic Class', 'Next Header'], c: 0, e: 'Jeder Router verringert das Hop Limit um 1; bei 0 wird das Paket verworfen.' },
    { type: 'input', q: 'Kürze maximal (RFC 5952): <code>fe80:0000:0000:0000:0204:61ff:fe9d:f156</code>', accept: ['fe80::204:61ff:fe9d:f156'], norm: 'compact', e: 'Führende Nullen weg (0204 → 204), die drei Null-Blöcke → ::' },
    { type: 'input', q: 'Schreibe vollständig aus (alle 32 Ziffern): <code>2001:db8::8a2e:370:7334</code>', accept: ['2001:0db8:0000:0000:0000:8a2e:0370:7334'], norm: 'compact', e: '5 Blöcke vorhanden → :: ersetzt 3 Null-Blöcke. 370 → 0370.' },
  ],

  generators: [
    {
      name: 'Adressen kürzen',
      make() {
        let g; do { g = IPv6.randAddr(); } while (IPv6.zeroRun(g).len < 2 && Math.random() < .8);
        return { type: 'input', q: `Kürze maximal (RFC 5952): <code>${IPv6.expand(g)}</code>`, accept: [IPv6.compress(g)], norm: 'compact', placeholder: 'z. B. 2001:db8::1', e: `Ausgeschrieben: ${IPv6.expand(g)} → führende Nullen weg: ${IPv6.stripZeros(g)} → längste Null-Folge durch :: ersetzen.` };
      },
    },
    {
      name: 'Adressen ausschreiben',
      make() {
        let g; do { g = IPv6.randAddr(); } while (IPv6.zeroRun(g).len < 2);
        return { type: 'input', q: `Schreibe vollständig aus (8 Blöcke à 4 Ziffern): <code>${IPv6.compress(g)}</code>`, accept: [IPv6.expand(g)], norm: 'compact', placeholder: 'xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx:xxxx', e: `Vorhandene Blöcke zählen, :: füllt bis 8 auf, jeden Block auf 4 Ziffern mit Nullen links auffüllen.` };
      },
    },
  ],

  visuals: [
    {
      title: '🧪 Adress-Labor',
      render(root) {
        const ex = ['2001:0db8:0000:0000:0000:ff00:0042:8329', 'fe80:0000:0000:0000:021a:2bff:fe3c:4d5e', '2001:db8:0:1:0:0:0:1', '2001:0db8:0000:0001:0000:0000:0000:0000', '::1', '2001:db8::1::1'];
        root.innerHTML = `<div class="lab">
          <label class="field"><span>IPv6-Adresse eingeben (lang oder gekürzt)</span><input id="v6in" value="${ex[0]}" spellcheck="false"></label>
          <div class="ex-btns">${ex.map(e => `<button class="btn sm" data-ex="${e}">${e}</button>`).join('')}</div>
          <div id="v6out"></div></div>`;
        const inp = $('#v6in', root), out = $('#v6out', root);
        const seg = i => i < 3 ? 'c-net' : i < 4 ? 'c-sub' : 'c-iid';
        const upd = () => {
          try {
            const g = IPv6.parse(inp.value);
            const zr = IPv6.zeroRun(g);
            const s1 = g.map((v, i) => { const h = v.toString(16); return zr.len >= 2 && i >= zr.start && i < zr.start + zr.len ? `<mark>${h}</mark>` : h; }).join(':');
            const s0 = g.map((v, i) => { const h = IPv6.hex4(v); const lead = h.match(/^0*/)[0].slice(0, v === 0 ? 3 : undefined); return `<span style="opacity:.45">${lead}</span>${h.slice(lead.length)}`; }).join(':');
            out.innerHTML = `
              <div class="blocks">${g.map((v, i) => `<div class="blk ${seg(i)}"><b>${IPv6.hex4(v)}</b><small>Block ${i + 1}</small></div>`).join('')}</div>
              <div class="legend" style="margin:8px 0 14px"><span class="c-net">Global Routing Prefix (48 Bit)</span><span class="c-sub">Subnet-ID (16 Bit)</span><span class="c-iid">Interface-ID (64 Bit)</span></div>
              <ol class="steps">
                <li><b>Vollständig ausgeschrieben (graue Nullen dürfen weg)</b><code>${s0}</code></li>
                <li><b>Regel 1 – führende Nullen weg${zr.len >= 2 ? ' (markiert: längste Null-Folge)' : ''}</b><code>${s1}</code></li>
                <li><b>Regel 2 – ${zr.len >= 2 ? `${zr.len} Null-Blöcke (Block ${zr.start + 1}–${zr.start + zr.len}) → ::` : 'keine Folge von ≥ 2 Null-Blöcken → kein ::'}</b><code style="color:var(--accent);font-weight:700">${IPv6.compress(g)}</code></li>
              </ol>
              <p class="muted">Adresstyp: <b>${IPv6.classify(g).name}</b></p>
              <details><summary>Binärdarstellung (128 Bit)</summary><div class="binary">${g.map((v, i) => `<span class="${seg(i)}" style="color:var(--c)">${v.toString(2).padStart(16, '0').replace(/(.{4})/g, '$1 ').trim()}</span>`).join('')}</div></details>`;
          } catch (e) { out.innerHTML = `<div class="fb bad">⚠ ${esc(e.message)}</div>`; }
        };
        inp.oninput = upd;
        $$('[data-ex]', root).forEach(b => b.onclick = () => { inp.value = b.dataset.ex; upd(); });
        upd();
      },
    },
    {
      title: '🔢 Hex ↔ Binär',
      render(root) {
        root.innerHTML = `<div class="grid2">
          <div><label class="field"><span>Ein Block (1–4 Hex-Ziffern)</span><input id="hxIn" value="0db8" maxlength="4" spellcheck="false"></label><div id="hxOut" style="margin-top:12px"></div></div>
          <div><p class="muted" style="margin-top:0">Jede Hex-Ziffer = 4 Bit. Diese Tabelle solltest du im Schlaf können:</p>
          <table class="tbl" style="font-family:var(--mono)">${[0, 4, 8, 12].map(r => `<tr>${[0, 1, 2, 3].map(c => { const v = r + c; return `<td><b>${v.toString(16)}</b> = ${v.toString(2).padStart(4, '0')} <span class="muted">(${v})</span></td>`; }).join('')}</tr>`).join('')}</table></div></div>`;
        const inp = $('#hxIn', root), out = $('#hxOut', root);
        const upd = () => {
          const v = inp.value.trim().toLowerCase();
          if (!/^[0-9a-f]{1,4}$/.test(v)) { out.innerHTML = '<div class="fb bad">1–4 Hex-Ziffern (0–9, a–f)</div>'; return; }
          const p = v.padStart(4, '0'), n = parseInt(v, 16);
          out.innerHTML = `<div class="kpis">${[...p].map(d => `<div class="kpi"><span>Hex ${d}</span><b>${parseInt(d, 16).toString(2).padStart(4, '0')}</b></div>`).join('')}</div>
            <p>Binär: <code>${n.toString(2).padStart(16, '0').replace(/(.{4})/g, '$1 ').trim()}</code><br>Dezimal: <code>${fmtNum(n)}</code></p>`;
        };
        inp.oninput = upd; upd();
      },
    },
  ],
});
