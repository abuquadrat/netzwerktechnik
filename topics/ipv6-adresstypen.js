registerTopic({
  id: 'ipv6-adresstypen',
  title: 'IPv6-Adresstypen',
  subtitle: 'LLA, ULA, GUA, Loopback, Unspecified, Multicast',
  category: 'IPv6',
  icon: '🏷️',
  color: '#a78bfa',

  levels: {
    1: `
      <h2>Ein Gerät – mehrere Adressen</h2>
      <p>Bei IPv6 hat eine Netzwerkkarte fast immer <b>mehrere Adressen gleichzeitig</b>, je nachdem, mit wem sie redet. Stell dir ein Haus vor:</p>
      <table class="tbl">
        <tr><th></th><th>Adresstyp</th><th>Vergleich</th></tr>
        <tr><td>🛋️</td><td><b>Link-Local</b> <code>fe80::</code></td><td>Der Rufname <b>im eigenen Zimmer</b>. Funktioniert nur mit denen, die direkt neben dir sitzen (gleiches Netzsegment). Jedes Gerät gibt sich diesen Namen <b>automatisch</b>.</td></tr>
        <tr><td>🏢</td><td><b>Unique Local</b> <code>fd…</code></td><td>Die <b>Durchwahl in der Firma</b>. Klappt im ganzen Firmennetz, aber nicht von außen. Wie 192.168.x.x bei IPv4.</td></tr>
        <tr><td>🌍</td><td><b>Global Unicast</b> <code>2… / 3…</code></td><td>Die <b>weltweite Telefonnummer</b>. Damit bist du im Internet erreichbar.</td></tr>
        <tr><td>🪞</td><td><b>Loopback</b> <code>::1</code></td><td><b>Selbstgespräch</b> – der Rechner redet mit sich selbst (wie 127.0.0.1).</td></tr>
        <tr><td>❔</td><td><b>Unspecified</b> <code>::</code></td><td>„<b>Ich habe noch keine Nummer</b>.“ Wird benutzt, solange ein Gerät noch keine Adresse hat.</td></tr>
        <tr><td>📢</td><td><b>Multicast</b> <code>ff…</code></td><td>Eine <b>Durchsage an eine Gruppe</b>, z. B. „an alle Router“. Ersetzt den Broadcast, den es in IPv6 nicht mehr gibt.</td></tr>
      </table>
      <div class="callout tip">Man erkennt den Typ fast immer schon an den <b>ersten Zeichen</b>: <code>fe80</code> = Link-Local, <code>fd</code> = Unique Local, <code>2</code>/<code>3</code> = Global, <code>ff</code> = Multicast.</div>`,

    2: `
      <h2>Übersicht der Adresstypen</h2>
      <div class="tbl-wrap"><table class="tbl">
        <tr><th>Typ</th><th>Präfix</th><th>Erkennbar an</th><th>Gültigkeit / Routing</th><th>IPv4-Gegenstück</th></tr>
        <tr><td><b>Global Unicast (GUA)</b></td><td><code>2000::/3</code></td><td>2xxx, 3xxx</td><td>weltweit, im Internet routbar</td><td>öffentliche IP</td></tr>
        <tr><td><b>Link-Local (LLA)</b></td><td><code>fe80::/10</code></td><td>fe80 … febf (in der Praxis immer <code>fe80::/64</code>)</td><td>nur im lokalen Link, <b>nie geroutet</b></td><td>169.254.0.0/16 (APIPA)</td></tr>
        <tr><td><b>Unique Local (ULA)</b></td><td><code>fc00::/7</code></td><td>praktisch immer <code>fd</code></td><td>innerhalb der Organisation, nicht im Internet</td><td>10/8, 172.16/12, 192.168/16</td></tr>
        <tr><td><b>Loopback</b></td><td><code>::1/128</code></td><td>genau <code>::1</code></td><td>nur der Host selbst</td><td>127.0.0.1</td></tr>
        <tr><td><b>Unspecified</b></td><td><code>::/128</code></td><td>genau <code>::</code></td><td>nie als Ziel, nur als Quelle „ohne Adresse“</td><td>0.0.0.0</td></tr>
        <tr><td><b>Multicast</b></td><td><code>ff00::/8</code></td><td>ff</td><td>je nach Scope</td><td>224.0.0.0/4 + Broadcast</td></tr>
      </table></div>

      <h3>Link-Local-Adresse (LLA)</h3>
      <ul>
        <li>Wird <b>automatisch auf jeder IPv6-Schnittstelle</b> gebildet – auch ohne Router oder DHCP: <code>fe80::</code> + Interface-ID.</li>
        <li>Wird für <b>Neighbor Discovery</b>, Router Advertisements und Routing-Protokolle gebraucht.</li>
        <li>Das <b>Standardgateway</b> eines Hosts ist meist die <b>Link-Local-Adresse des Routers</b>.</li>
        <li>Weil jede Schnittstelle fe80:: hat, braucht man zur Unterscheidung den Zonen-Index: <code>ping fe80::1%12</code>.</li>
      </ul>
      <h3>Unique Local Address (ULA)</h3>
      <p>Aufbau: <code>fd</code> + <b>40 Bit zufällige Global-ID</b> + 16 Bit Subnet-ID + 64 Bit Interface-ID. Durch die Zufalls-ID sind ULAs „wahrscheinlich eindeutig“ – fusionieren zwei Firmen, gibt es (anders als bei 192.168.1.0) kaum Kollisionen.</p>
      <h3>Loopback <code>::1</code> und Unspecified <code>::</code></h3>
      <ul>
        <li><code>::1</code> = <code>0000:…:0001</code> – Test des eigenen TCP/IP-Stacks: <code>ping ::1</code>.</li>
        <li><code>::</code> = alles Nullen – Quelladresse bei <b>DAD</b> (Duplicate Address Detection) und bei DHCPv6-Anfragen, bevor eine Adresse existiert. In Server-Konfigurationen heißt <code>[::]:80</code> „auf allen Adressen lauschen“.</li>
      </ul>
      <h3>Multicast <code>ff00::/8</code></h3>
      <p>Aufbau: <code>ff</code> | 4 Bit Flags | <b>4 Bit Scope</b> | 112 Bit Gruppen-ID. Der Scope steht in der <b>4. Hex-Ziffer</b>: <code>ff0<b>2</b>::1</code> → 2 = Link-Local.</p>
      <table class="tbl">
        <tr><th>Adresse</th><th>Bedeutung</th></tr>
        <tr><td><code>ff02::1</code></td><td><b>Alle Knoten</b> im Link (Ersatz für Broadcast)</td></tr>
        <tr><td><code>ff02::2</code></td><td><b>Alle Router</b> im Link (Ziel der Router Solicitation)</td></tr>
        <tr><td><code>ff02::1:2</code></td><td>Alle DHCPv6-Server und Relay-Agents</td></tr>
        <tr><td><code>ff02::1:ffXX:XXXX</code></td><td><b>Solicited-Node</b>-Adresse (letzte 24 Bit der Unicast-Adresse) – für Neighbor Discovery und DAD</td></tr>
        <tr><td><code>ff02::5 / ::6</code></td><td>OSPFv3-Router / Designated Router</td></tr>
      </table>
      <p>Scopes: <code>1</code> Interface · <code>2</code> Link · <code>5</code> Site · <code>8</code> Organisation · <code>e</code> Global.</p>
      <div class="callout warn">Es gibt <b>keinen Broadcast</b> in IPv6. Antwortest du in der Prüfung „Broadcast an ff02::1“, ist das falsch – es ist ein <b>Multicast</b> an alle Knoten.</div>
      <div class="callout exam">Häufige Aufgabe: „Ordnen Sie die Adressen den Typen zu.“ Schau nur auf die ersten Zeichen: <code>fe80</code>, <code>fd</code>, <code>2/3</code>, <code>ff</code>, <code>::1</code>, <code>::</code>.</div>
      <h3>Anycast</h3>
      <p>Eine Unicast-Adresse, die <b>mehreren Geräten</b> zugewiesen ist; das Paket geht an das <b>nächstgelegene</b>. Hat keinen eigenen Adressbereich (Beispiel: DNS-Root-Server).</p>`,

    3: `
      <h2>Details für Fortgeschrittene</h2>
      <h3>Link-Local genau betrachtet</h3>
      <p>Reserviert ist <code>fe80::/10</code>, laut RFC 4291 müssen die folgenden 54 Bit aber 0 sein – effektiv also <code>fe80::/64</code>. Adressen wie <code>febf::1</code> liegen zwar im Bereich, kommen praktisch nicht vor.</p>
      <h3>ULA-Global-ID erzeugen (RFC 4193)</h3>
      <p>Zeitstempel + EUI-64 → SHA-1 → die niedrigsten 40 Bit sind die Global-ID. Das 8. Bit (L-Bit) = 1 bedeutet „lokal vergeben“ → deshalb <code>fd</code>. <code>fc00::/8</code> (L = 0) war für eine zentrale Vergabe vorgesehen, die es nie gab.</p>
      <h3>Solicited-Node-Multicast</h3>
      <p>Statt wie ARP alle per Broadcast zu stören, fragt NDP nur eine winzige Gruppe: <code>ff02::1:ff</code> + <b>letzte 24 Bit</b> der gesuchten Adresse. Beispiel: <code>2001:db8::21a:2bff:fe<b>3c:4d5e</b></code> → <code>ff02::1:ff<b>3c:4d5e</b></code>.</p>
      <p>Auf Ethernet wird jede IPv6-Multicast-Adresse auf die MAC <code>33:33:</code> + letzte 32 Bit abgebildet → <code>33:33:ff:3c:4d:5e</code>. Die Netzwerkkarte filtert das in Hardware.</p>
      <h3>Welche Adressen hat ein typischer Windows-PC?</h3>
      ${UI.terminal(`C:\\> ipconfig

Ethernet-Adapter Ethernet:
   IPv6-Adresse. . . . . . . . . . . : <span class="hl">2001:db8:1:1:8d4c:1a2b:3c4d:5e6f</span>   ← GUA (stabil)
   Temporäre IPv6-Adresse. . . . . . : <span class="hl">2001:db8:1:1:f1e2:d3c4:b5a6:9788</span>   ← GUA (Privacy, wechselt)
   Verbindungslokale IPv6-Adresse  . : <span class="hl">fe80::8d4c:1a2b:3c4d:5e6f%12</span>      ← LLA + Zonen-Index
   IPv4-Adresse  . . . . . . . . . . : 192.168.1.23
   Standardgateway . . . . . . . . . : <span class="hl">fe80::1%12</span>                       ← LLA des Routers
                                       192.168.1.1`)}
      <p>Dazu kommt er automatisch in Multicast-Gruppen: ff02::1, ff02::1:ff… (je eine pro Unicast-Adresse).</p>
      <h3>Adressauswahl (RFC 6724)</h3>
      <p>Hat ein Host mehrere Adressen, wählt er die Quelladresse nach Regeln: passender Scope (LLA für Link-Ziele), bevorzugt nicht veraltete Adressen, temporäre vor stabilen (für ausgehende Verbindungen), längste Präfix-Übereinstimmung. Ähnlich wird bei IPv6/IPv4 meist <b>IPv6 bevorzugt</b> (Happy Eyeballs sorgt für schnelles Fallback).</p>
      <h3>Weitere reservierte Bereiche</h3>
      <table class="tbl">
        <tr><td><code>fec0::/10</code></td><td>Site-Local – veraltet (RFC 3879), durch ULA ersetzt</td></tr>
        <tr><td><code>::ffff:0:0/96</code></td><td>IPv4-mapped</td></tr>
        <tr><td><code>2002::/16</code></td><td>6to4-Tunnel</td></tr>
        <tr><td><code>2001::/32</code></td><td>Teredo</td></tr>
        <tr><td><code>100::/64</code></td><td>Discard-Only (Blackhole)</td></tr>
      </table>`,
  },

  merke: [
    'fe80 = Link-Local (immer da, nie geroutet) · fd = Unique Local (privat) · 2/3 = Global.',
    '::1 = Loopback (127.0.0.1) · :: = Unspecified (0.0.0.0).',
    'ff = Multicast, 4. Hex-Ziffer = Scope (ff02 = Link).',
    'ff02::1 alle Knoten · ff02::2 alle Router · ff02::1:2 DHCPv6.',
    'IPv6 kennt keinen Broadcast.',
    'Standardgateway ist meist die Link-Local-Adresse des Routers.',
  ],

  cheat: [
    ['Global Unicast', '<code>2000::/3</code> (2xxx, 3xxx) – Internet'],
    ['Link-Local', '<code>fe80::/10</code> – nur lokaler Link, automatisch'],
    ['Unique Local', '<code>fc00::/7</code>, genutzt <code>fd00::/8</code> – privat'],
    ['Loopback', '<code>::1/128</code>'],
    ['Unspecified', '<code>::/128</code>'],
    ['Multicast', '<code>ff00::/8</code>; Scope: 1 Interface, 2 Link, 5 Site, 8 Org, e Global'],
    ['Wichtige Gruppen', '<code>ff02::1</code> alle Knoten · <code>ff02::2</code> alle Router · <code>ff02::1:2</code> DHCPv6 · <code>ff02::1:ffXX:XXXX</code> Solicited-Node'],
    ['Multicast-MAC', '<code>33:33:</code> + letzte 32 Bit'],
  ],

  cards: [
    ['Präfix Link-Local', '<code>fe80::/10</code> – automatisch auf jeder Schnittstelle, nicht routbar'],
    ['Präfix Unique Local', '<code>fc00::/7</code> – in der Praxis <code>fd00::/8</code>, privat wie 192.168.x.x'],
    ['Präfix Global Unicast', '<code>2000::/3</code> – beginnt mit 2 oder 3'],
    ['Loopback-Adresse', '<code>::1</code> (wie 127.0.0.1)'],
    ['Unspecified-Adresse', '<code>::</code> – „noch keine Adresse“, z. B. Quelle bei DAD'],
    ['Präfix Multicast', '<code>ff00::/8</code>'],
    ['ff02::1', 'Alle Knoten (All-Nodes) im lokalen Link'],
    ['ff02::2', 'Alle Router (All-Routers) im lokalen Link'],
    ['Solicited-Node-Adresse', '<code>ff02::1:ff</code> + die letzten 24 Bit der Unicast-Adresse'],
    ['Aufbau einer ULA', 'fd | 40 Bit zufällige Global-ID | 16 Bit Subnet-ID | 64 Bit Interface-ID'],
    ['Anycast', 'Gleiche Adresse auf mehreren Geräten, das nächste antwortet. Kein eigener Bereich.'],
  ],

  quiz: [
    { q: 'Welches Präfix haben Link-Local-Adressen?', a: ['fe80::/10', 'fc00::/7', 'ff00::/8', '2000::/3'], c: 0, e: 'fe80::/10 – in der Praxis fe80::/64.' },
    { q: 'Welches Präfix haben Unique-Local-Adressen?', a: ['fc00::/7 (in der Praxis fd00::/8)', 'fe80::/10', 'fec0::/10', '2001:db8::/32'], c: 0, e: 'fec0::/10 war Site-Local und ist veraltet.' },
    { q: 'Wie lautet die IPv6-Loopback-Adresse?', a: ['::1', '::', 'fe80::1', 'ff02::1'], c: 0, e: '::1 entspricht 127.0.0.1.' },
    { q: 'Wofür wird die Unspecified-Adresse <code>::</code> verwendet?', a: ['Als Quelladresse, solange ein Host noch keine eigene Adresse hat (z. B. DAD)', 'Als Standardgateway', 'Als Broadcast-Adresse', 'Als Zieladresse für alle Router'], c: 0, e: 'Sie darf nie als Zieladresse benutzt werden.' },
    { q: 'Welche Adresse erreicht <b>alle Knoten</b> im lokalen Link?', a: ['ff02::1', 'ff02::2', 'ff02::1:2', 'fe80::1'], c: 0, e: 'ff02::2 wären alle Router, ff02::1:2 alle DHCPv6-Server.' },
    { q: 'Wen erreicht <code>ff02::2</code>?', a: ['Alle Router im lokalen Link', 'Alle Knoten', 'Alle DHCPv6-Server', 'Den Standardgateway per Unicast'], c: 0, e: 'Hosts senden ihre Router Solicitation an ff02::2.' },
    { q: 'Wird eine Link-Local-Adresse von Routern weitergeleitet?', a: ['Nein, sie ist nur im lokalen Segment gültig', 'Ja, weltweit', 'Nur innerhalb der Firma', 'Nur mit NAT'], c: 0, e: 'Router leiten fe80::-Pakete nie in andere Netze weiter.' },
    { q: 'Welche Aussage zu ULAs ist richtig?', a: ['Vergleichbar mit privaten IPv4-Adressen, nicht im Internet geroutet', 'Weltweit eindeutig und im Internet routbar', 'Werden automatisch auf jeder Schnittstelle gebildet', 'Gibt es nur für Loopback'], c: 0, e: 'Automatisch auf jeder Schnittstelle ist die LLA.' },
    { q: 'Was hat <b>jede</b> IPv6-fähige Schnittstelle immer?', a: ['Eine Link-Local-Adresse', 'Eine ULA', 'Eine GUA', 'Eine statische Adresse'], c: 0, e: 'Die LLA wird automatisch gebildet, selbst wenn kein Router existiert.' },
    { q: 'Was ersetzt in IPv6 den Broadcast?', a: ['Multicast (z. B. ff02::1)', 'Anycast', 'APIPA', 'Loopback'], c: 0, e: 'Multicast-Gruppen erreichen nur interessierte Empfänger.' },
    { q: 'Was bedeutet die <b>2</b> in <code>ff02::1</code>?', a: ['Scope Link-Local', 'Scope Global', 'Version 2', 'Gruppe Nummer 2'], c: 0, e: 'Die 4. Hex-Ziffer ist der Scope: 1 Interface, 2 Link, 5 Site, 8 Organisation, e Global.' },
    { q: 'Welcher Typ ist <code>fd12:3456:789a:1::10</code>?', a: ['Unique Local (ULA)', 'Link-Local', 'Global Unicast', 'Multicast'], c: 0, e: 'Beginnt mit fd → ULA.' },
    { q: 'Wie lautet die Solicited-Node-Adresse zu <code>2001:db8::21a:2bff:fe3c:4d5e</code>?', a: ['ff02::1:ff3c:4d5e', 'ff02::1:fe3c:4d5e', 'ff02::3c:4d5e', 'ff05::1:3'], c: 0, e: 'ff02::1:ff + letzte 24 Bit (3c:4d5e).' },
    { q: 'Welches IPv4-Gegenstück hat die Link-Local-Adresse?', a: ['169.254.0.0/16 (APIPA)', '127.0.0.1', '192.168.0.0/16', '0.0.0.0'], c: 0, e: 'Beide sind nur im lokalen Segment gültig und werden automatisch vergeben.' },
    { q: 'Was ist das Standardgateway eines IPv6-Hosts in der Regel?', a: ['Die Link-Local-Adresse des Routers', 'Die GUA des Providers', 'ff02::2', '::1'], c: 0, e: 'Router Advertisements kommen von der LLA des Routers – diese wird als Gateway eingetragen.' },
  ],

  generators: [
    {
      name: 'Adresstyp erkennen',
      make() {
        const h = () => rnd(0x10000).toString(16);
        const samples = [
          ['lla', `fe80::${h()}:${h()}:${h()}:${h()}`],
          ['ula', `fd${rnd(256).toString(16).padStart(2, '0')}:${h()}:${h()}:${rnd(16)}::${h()}`],
          ['gua', `${pick(['2001', '2a02', '2003', '2a00', '2600'])}:${h()}:${h()}:${h()}::${h()}`],
          ['mc', pick(['ff02::1', 'ff02::2', 'ff02::1:2', 'ff05::1:3', `ff02::1:ff${rnd(256).toString(16).padStart(2, '0')}:${h()}`])],
          ['lo', '::1'],
          ['unspec', '::'],
        ];
        const [key, addr] = pick(samples);
        const names = { lla: 'Link-Local (LLA)', ula: 'Unique Local (ULA)', gua: 'Global Unicast (GUA)', mc: 'Multicast', lo: 'Loopback', unspec: 'Unspecified' };
        const wrong = shuffle(Object.keys(names).filter(k => k !== key)).slice(0, 3);
        const all = [key, ...wrong];
        const T = IPv6.TYPES[key];
        return { q: `Welcher Adresstyp ist <code>${addr}</code>?`, a: all.map(k => names[k]), c: 0, e: `${names[key]}: ${T.prefix}. ${T.desc}` };
      },
    },
    {
      name: 'Solicited-Node berechnen',
      make() {
        const g = [0x2001, 0xdb8, rnd(0x10000), rnd(0x10000), rnd(0x10000), rnd(0x10000), rnd(0x10000), rnd(0x10000)];
        const sn = IPv6.solicitedNode(g);
        return { type: 'input', q: `Wie lautet die Solicited-Node-Multicast-Adresse zu <code>${IPv6.compress(g)}</code>?`, accept: [IPv6.compress(sn)], norm: 'ipv6', placeholder: 'ff02::1:ff…', e: `ff02::1:ff + letzte 24 Bit → <code>${IPv6.compress(sn)}</code>` };
      },
    },
  ],

  visuals: [
    {
      title: '🔍 Adress-Detektiv',
      render(root) {
        const ex = ['fe80::21a:2bff:fe3c:4d5e', 'fd12:3456:789a:1::10', '2a02:8070:1234:5600::1', '2001:db8::1', '::1', '::', 'ff02::1', 'ff02::2', 'ff02::1:ff3c:4d5e', 'fec0::1'];
        const order = ['gua', 'lla', 'ula', 'lo', 'unspec', 'mc'];
        root.innerHTML = `<div class="lab">
          <label class="field"><span>Adresse eingeben – der Detektiv bestimmt den Typ</span><input id="clIn" value="fe80::21a:2bff:fe3c:4d5e" spellcheck="false"></label>
          <div class="ex-btns">${ex.map(e => `<button class="btn sm" data-ex="${e}">${e}</button>`).join('')}</div>
          <div id="clOut"></div>
          <div class="typecards">${order.map(k => { const T = IPv6.TYPES[k]; return `<div class="typecard" data-k="${k}"><h4>${T.name}</h4><code>${T.prefix}</code><p>${T.desc}</p></div>`; }).join('')}</div></div>`;
        const inp = $('#clIn', root), out = $('#clOut', root);
        const upd = () => {
          $$('.typecard', root).forEach(c => c.classList.remove('hit'));
          try {
            const g = IPv6.parse(inp.value);
            const c = IPv6.classify(g);
            const k = c.key === 'doc' ? 'gua' : c.key;
            const card = $(`.typecard[data-k="${k}"]`, root); if (card) card.classList.add('hit');
            const b1 = g[0].toString(2).padStart(16, '0');
            out.innerHTML = `<div class="result-box"><h3>➡ ${c.name}</h3>
              <p style="margin:4px 0">Präfix: <code>${c.prefix}</code> · Ausgeschrieben: <code>${IPv6.expand(g)}</code></p>
              <p style="margin:4px 0">${c.desc}</p>${c.extra ? `<p style="margin:4px 0"><b>${c.extra}</b></p>` : ''}
              <p class="muted" style="margin:4px 0">Erster Block binär: <code>${b1.replace(/(.{4})/g, '$1 ').trim()}</code></p></div>`;
          } catch (e) { out.innerHTML = `<div class="fb bad">⚠ ${esc(e.message)}</div>`; }
        };
        inp.oninput = upd;
        $$('[data-ex]', root).forEach(b => b.onclick = () => { inp.value = b.dataset.ex; upd(); });
        $$('.typecard', root).forEach(c => c.onclick = () => { const m = { gua: '2001:db8:abcd:12::1', lla: 'fe80::1', ula: 'fd00:abcd:1234:1::1', lo: '::1', unspec: '::', mc: 'ff02::1' }; inp.value = m[c.dataset.k]; upd(); });
        upd();
      },
    },
    {
      title: '📡 Solicited-Node',
      render(root) {
        root.innerHTML = `<div class="lab">
          <p class="muted" style="margin:0">Jede Unicast-Adresse tritt automatisch einer Multicast-Gruppe bei. Darüber läuft Neighbor Discovery (Ersatz für ARP) und DAD.</p>
          <label class="field"><span>Unicast-Adresse</span><input id="snIn" value="2001:db8:1:1:21a:2bff:fe3c:4d5e" spellcheck="false"></label>
          <div id="snOut2"></div></div>`;
        const inp = $('#snIn', root), out = $('#snOut2', root);
        const upd = () => {
          try {
            const g = IPv6.parse(inp.value);
            const full = IPv6.expand(g);
            const last24 = full.slice(-7);
            const sn = IPv6.solicitedNode(g);
            const mac = '33:33:' + IPv6.expand(sn).replace(/:/g, '').slice(-8).match(/../g).join(':');
            out.innerHTML = `<ol class="steps">
              <li><b>Ausgeschrieben</b><code>${full.slice(0, -7)}<mark>${last24}</mark></code></li>
              <li><b>Letzte 24 Bit nehmen</b><code>${last24.replace(':', '')}</code></li>
              <li><b>Vor ff02::1:ff setzen → Solicited-Node-Adresse</b><code style="color:var(--accent);font-weight:700">${IPv6.compress(sn)}</code></li>
              <li><b>Ethernet-Multicast-MAC (33:33 + letzte 32 Bit)</b><code>${mac}</code></li></ol>`;
          } catch (e) { out.innerHTML = `<div class="fb bad">⚠ ${esc(e.message)}</div>`; }
        };
        inp.oninput = upd; upd();
      },
    },
  ],
});
