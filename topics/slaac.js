registerTopic({
  id: 'slaac',
  title: 'SLAAC',
  subtitle: 'Stateless Address Autoconfiguration',
  category: 'IPv6',
  icon: '⚙️',
  color: '#2dd4bf',

  levels: {
    1: `
      <h2>Adresse ohne DHCP-Server</h2>
      <div class="analogy"><div class="big">🏘️</div><div>
        Du ziehst in eine neue Straße. Statt beim Amt eine Hausnummer zu beantragen, machst du es so:
        <ol style="margin:6px 0 0">
          <li>Du rufst laut: „<b>Hallo, gibt es hier einen Router?</b>“</li>
          <li>Der Router antwortet: „<b>Diese Straße heißt 2001:db8:1:1</b> – und ich bin dein Weg nach draußen.“</li>
          <li>Du hängst <b>deine eigene Hausnummer</b> dran (aus deiner MAC-Adresse oder ausgewürfelt).</li>
          <li>Du fragst kurz: „<b>Wohnt hier schon jemand mit dieser Nummer?</b>“ – keine Antwort → die Nummer gehört dir.</li>
        </ol></div></div>
      <p>Das ist <b>SLAAC</b>: Der Rechner bildet seine IPv6-Adresse <b>selbst</b>. „Stateless“ heißt: Niemand führt eine Liste, wer welche Adresse hat – anders als ein DHCP-Server.</p>
      <div class="flow"><span>📣 RS: „Router da?“</span><i>→</i><span>📬 RA: „Präfix 2001:db8:1:1::/64“</span><i>→</i><span>🧩 Präfix + eigene ID</span><i>→</i><span>🔍 DAD: „Doppelt?“</span><i>→</i><span>✅ Fertig</span></div>
      <div class="callout tip">Unten kannst du den Ablauf <b>animiert</b> durchklicken und mit dem <b>EUI-64-Rechner</b> aus einer MAC-Adresse eine Interface-ID bauen.</div>`,

    2: `
      <h2>Ablauf von SLAAC</h2>
      <ol>
        <li><b>Link-Local-Adresse bilden:</b> <code>fe80::</code> + Interface-ID (EUI-64 oder zufällig).</li>
        <li><b>DAD für die LLA:</b> Neighbor Solicitation (NS, ICMPv6 Typ 135) von <code>::</code> an die Solicited-Node-Adresse. Kommt keine Antwort, ist die Adresse frei.</li>
        <li><b>Router Solicitation (RS)</b> – ICMPv6 <b>Typ 133</b> – an <code>ff02::2</code> (alle Router).</li>
        <li><b>Router Advertisement (RA)</b> – ICMPv6 <b>Typ 134</b> – an <code>ff02::1</code> (alle Knoten). Inhalt: <b>Präfix /64</b>, Flags, Lebensdauer, oft DNS-Server (RDNSS). Router senden RAs außerdem regelmäßig unaufgefordert.</li>
        <li><b>Globale Adresse bilden:</b> Präfix aus dem RA + Interface-ID.</li>
        <li><b>DAD für die neue Adresse</b>, dann ist sie nutzbar.</li>
        <li><b>Standardgateway</b> = <b>Link-Local-Adresse des Routers</b> (Absender des RA).</li>
      </ol>
      <h2>EUI-64: Interface-ID aus der MAC</h2>
      <table class="tbl" style="font-family:var(--mono)">
        <tr><td>MAC-Adresse (48 Bit)</td><td>00:1A:2B:3C:4D:5E</td></tr>
        <tr><td>1. In der Mitte teilen</td><td>001A2B | 3C4D5E</td></tr>
        <tr><td>2. FFFE einfügen</td><td>001A2B<b style="color:var(--warn)">FFFE</b>3C4D5E</td></tr>
        <tr><td>3. 7. Bit invertieren (U/L-Bit)</td><td><b style="color:var(--warn)">02</b>1A2BFFFE3C4D5E &nbsp;(00 = 0000 00<b>0</b>0 → 0000 00<b>1</b>0 = 02)</td></tr>
        <tr><td>Interface-ID (64 Bit)</td><td><b>021a:2bff:fe3c:4d5e</b></td></tr>
        <tr><td>Link-Local-Adresse</td><td>fe80::21a:2bff:fe3c:4d5e</td></tr>
      </table>
      <div class="callout warn">Das <b>7. Bit</b> von links des ersten Bytes wird <b>umgedreht</b> – nicht immer „auf 1 gesetzt“! Aus <code>02</code> wird <code>00</code>, aus <code>0c</code> wird <code>0e</code>, aus <code>a4</code> wird <code>a6</code>. Schnelltrick: An der <b>2. Hex-Ziffer</b> ±2 rechnen (0↔2, 4↔6, 8↔a, c↔e, 1↔3, 5↔7, 9↔b, d↔f).</div>
      <h2>Die Flags im Router Advertisement</h2>
      <table class="tbl">
        <tr><th>Flag</th><th>Name</th><th>Bedeutung</th></tr>
        <tr><td><b>A</b></td><td>Autonomous (in der Präfix-Info)</td><td>Host darf aus diesem Präfix per SLAAC eine Adresse bilden</td></tr>
        <tr><td><b>M</b></td><td>Managed</td><td>Adresse per <b>stateful DHCPv6</b> holen</td></tr>
        <tr><td><b>O</b></td><td>Other Configuration</td><td>Zusatzinfos (DNS, Domain) per <b>stateless DHCPv6</b> holen</td></tr>
      </table>
      <table class="tbl">
        <tr><th>Variante</th><th>A</th><th>M</th><th>O</th><th>Adresse von</th><th>DNS von</th></tr>
        <tr><td>Nur SLAAC</td><td>1</td><td>0</td><td>0</td><td>SLAAC</td><td>RA (RDNSS)</td></tr>
        <tr><td>SLAAC + stateless DHCPv6</td><td>1</td><td>0</td><td>1</td><td>SLAAC</td><td>DHCPv6</td></tr>
        <tr><td>Stateful DHCPv6</td><td>0</td><td>1</td><td>(1)</td><td>DHCPv6</td><td>DHCPv6</td></tr>
      </table>
      <div class="callout exam">Das <b>Standardgateway kommt immer aus dem RA</b> – DHCPv6 kann gar kein Gateway verteilen! Ohne Router-Advertisement kein Default-Gateway.</div>
      <h3>SLAAC vs. DHCPv6</h3>
      <ul>
        <li><b>SLAAC (stateless):</b> kein Server, keine Liste – einfach, aber der Admin weiß nicht genau, wer welche Adresse hat.</li>
        <li><b>Stateful DHCPv6:</b> Server vergibt und protokolliert Adressen (wie DHCPv4) – mehr Kontrolle.</li>
        <li>SLAAC funktioniert nur mit <b>/64</b>-Präfixen.</li>
      </ul>`,

    3: `
      <h2>Neighbor Discovery Protocol (NDP) – die Nachrichten</h2>
      <table class="tbl">
        <tr><th>Typ</th><th>Nachricht</th><th>Zweck</th></tr>
        <tr><td>133</td><td>Router Solicitation (RS)</td><td>Host sucht Router (an ff02::2)</td></tr>
        <tr><td>134</td><td>Router Advertisement (RA)</td><td>Router verkündet Präfix, Flags, MTU, Gateway (an ff02::1 oder unicast)</td></tr>
        <tr><td>135</td><td>Neighbor Solicitation (NS)</td><td>MAC-Adresse erfragen (wie ARP-Request) und DAD</td></tr>
        <tr><td>136</td><td>Neighbor Advertisement (NA)</td><td>Antwort mit MAC (wie ARP-Reply)</td></tr>
        <tr><td>137</td><td>Redirect</td><td>Router nennt besseren Next-Hop</td></tr>
      </table>
      <p>Alle NDP-Pakete haben <b>Hop Limit 255</b>. Kommt ein Paket mit kleinerem Wert an, wurde es geroutet → wird verworfen (Schutz vor Angriffen von außen).</p>
      <h3>Lebensdauer von Adressen</h3>
      <p>Jedes Präfix im RA hat eine <b>Preferred Lifetime</b> und eine <b>Valid Lifetime</b>. Zustände einer Adresse: <i>tentative</i> (DAD läuft) → <i>preferred</i> (normal nutzbar) → <i>deprecated</i> (nur noch bestehende Verbindungen) → <i>invalid</i> (entfernt). So lassen sich Präfixwechsel des Providers sanft durchführen.</p>
      <h3>Datenschutz: Warum Windows kein EUI-64 nutzt</h3>
      <ul>
        <li>EUI-64 enthält die MAC → ein Gerät ist in <b>jedem</b> Netz an der gleichen Interface-ID erkennbar (Tracking).</li>
        <li><b>Temporäre Adressen</b> (Privacy Extensions, RFC 8981): zufällige IID, wechselt regelmäßig (z. B. täglich), für ausgehende Verbindungen.</li>
        <li><b>Stable Privacy</b> (RFC 7217): pro Netz stabile, aber nicht aus der MAC ableitbare IID (Hash aus Präfix, Schnittstelle, Geheimnis).</li>
        <li>Windows: <code>netsh interface ipv6 set global randomizeidentifiers=disabled</code> schaltet auf EUI-64-ähnliche IDs um.</li>
      </ul>
      <h3>Sicherheit</h3>
      <ul>
        <li><b>Rogue RA:</b> Ein Angreifer sendet eigene RAs und wird zum Gateway (Man-in-the-Middle). Schutz: <b>RA Guard</b> am Switch.</li>
        <li><b>SEND</b> (Secure Neighbor Discovery) signiert NDP-Nachrichten kryptografisch – kaum verbreitet.</li>
      </ul>
      <h3>Router-Konfiguration (Cisco, vereinfacht)</h3>
      ${UI.terminal(`interface GigabitEthernet0/1
 ipv6 address 2001:db8:1:1::1/64
 ipv6 nd other-config-flag        <span class="hl">! O-Flag setzen</span>
 ipv6 dhcp server DNS-ONLY
!
ipv6 unicast-routing                <span class="hl">! ohne das sendet der Router keine RAs</span>`, 'Router-Konfiguration')}`,
  },

  merke: [
    'SLAAC: RS (133) an ff02::2 → RA (134) mit Präfix → Präfix + Interface-ID → DAD.',
    'EUI-64: MAC teilen, FFFE einfügen, 7. Bit umdrehen.',
    'DAD sendet eine Neighbor Solicitation von :: an die Solicited-Node-Adresse.',
    'M-Flag = stateful DHCPv6 · O-Flag = stateless DHCPv6 (nur Zusatzinfos).',
    'Das Standardgateway kommt immer aus dem RA (Link-Local des Routers).',
    'SLAAC funktioniert nur mit /64.',
  ],

  cheat: [
    ['SLAAC-Ablauf', 'LLA bilden → DAD → RS (133) an ff02::2 → RA (134) an ff02::1 → GUA bilden → DAD'],
    ['EUI-64', 'MAC teilen · FFFE einfügen · 7. Bit (U/L) invertieren'],
    ['Beispiel', '00:1A:2B:3C:4D:5E → <code>021a:2bff:fe3c:4d5e</code>'],
    ['NDP-Typen', '133 RS · 134 RA · 135 NS · 136 NA · 137 Redirect'],
    ['RA-Flags', 'A = SLAAC erlaubt · M = stateful DHCPv6 · O = stateless DHCPv6'],
    ['Gateway', 'immer per RA, = LLA des Routers'],
    ['DAD', 'NS von <code>::</code> an <code>ff02::1:ffXX:XXXX</code>; Antwort (NA) = Adresse doppelt'],
  ],

  cards: [
    ['Wofür steht SLAAC?', 'Stateless Address Autoconfiguration – Host bildet seine IPv6-Adresse selbst'],
    ['Router Solicitation', 'ICMPv6 Typ 133, an <code>ff02::2</code> – „Gibt es einen Router?“'],
    ['Router Advertisement', 'ICMPv6 Typ 134, an <code>ff02::1</code> – Präfix, Flags, Gateway, ggf. DNS'],
    ['EUI-64 in 3 Schritten', '1. MAC teilen 2. FFFE einfügen 3. 7. Bit invertieren'],
    ['00:1A:2B:3C:4D:5E als EUI-64', '<code>021a:2bff:fe3c:4d5e</code>'],
    ['DAD', 'Duplicate Address Detection: NS von :: an Solicited-Node – kommt eine NA, ist die Adresse doppelt'],
    ['M-Flag', 'Managed → Adresse per stateful DHCPv6'],
    ['O-Flag', 'Other → Zusatzinfos (DNS) per stateless DHCPv6, Adresse weiter per SLAAC'],
    ['Woher kommt das IPv6-Default-Gateway?', 'Immer aus dem Router Advertisement (LLA des Routers) – nie aus DHCPv6'],
    ['Privacy Extensions', 'Zufällige, wechselnde Interface-IDs statt EUI-64 → kein Tracking über die MAC'],
  ],

  quiz: [
    { q: 'Wofür steht SLAAC?', a: ['Stateless Address Autoconfiguration', 'Static Link Address Assignment Configuration', 'Secure Local Address Allocation', 'Stateful Automatic Address Control'], c: 0, e: '„Stateless“ = kein Server führt Buch über vergebene Adressen.' },
    { q: 'Woher bekommt der Host bei SLAAC das Netzpräfix?', a: ['Aus dem Router Advertisement (RA)', 'Vom DHCPv4-Server', 'Aus seiner MAC-Adresse', 'Vom DNS-Server'], c: 0, e: 'Die MAC liefert (bei EUI-64) nur die Interface-ID.' },
    { q: 'An welche Adresse sendet ein Host die Router Solicitation?', a: ['ff02::2 (alle Router)', 'ff02::1 (alle Knoten)', '::1', 'ff02::1:2'], c: 0, e: 'Nur Router sollen sich angesprochen fühlen.' },
    { q: 'Welche ICMPv6-Typen haben RS und RA?', a: ['RS = 133, RA = 134', 'RS = 134, RA = 133', 'RS = 135, RA = 136', 'RS = 1, RA = 2'], c: 0, e: '135/136 sind Neighbor Solicitation/Advertisement.' },
    { q: 'Was wird bei EUI-64 in die Mitte der MAC-Adresse eingefügt?', a: ['FFFE', 'FFFF', '0000', 'FE80'], c: 0, e: 'Damit wird aus 48 Bit eine 64-Bit-Interface-ID.' },
    { q: 'Welches Bit wird bei EUI-64 invertiert?', a: ['Das 7. Bit des ersten Bytes (U/L-Bit)', 'Das letzte Bit', 'Das 1. Bit', 'Kein Bit'], c: 0, e: 'Universal/Local-Bit: 0 = weltweit eindeutige MAC → in IPv6 als 1 dargestellt.' },
    { q: 'MAC <code>00:1A:2B:3C:4D:5E</code> → welche Interface-ID ergibt EUI-64?', a: ['021a:2bff:fe3c:4d5e', '001a:2bff:fe3c:4d5e', '021a:2bff:ff3c:4d5e', 'fe80:1a2b:3c4d:5e00'], c: 0, e: '00 → 02 (7. Bit gedreht), FFFE in die Mitte.' },
    { q: 'Was ist DAD?', a: ['Duplicate Address Detection – prüft per Neighbor Solicitation, ob die Adresse schon benutzt wird', 'Dynamic Address Distribution', 'DHCP Address Discover', 'Default Address Domain'], c: 0, e: 'Erst nach erfolgreichem DAD wird die Adresse benutzt.' },
    { q: 'Welche Quelladresse hat die Neighbor Solicitation bei DAD?', a: ['::', '::1', 'fe80::1', 'ff02::1'], c: 0, e: 'Der Host hat ja noch keine gültige Adresse – also die Unspecified-Adresse.' },
    { q: 'Ein RA hat das <b>M-Flag = 1</b>. Was bedeutet das?', a: ['Adresse per stateful DHCPv6 beziehen', 'Nur SLAAC verwenden', 'Der Router ist ein Multicast-Router', 'Die MTU wird mitgeteilt'], c: 0, e: 'M = Managed Address Configuration.' },
    { q: 'RA mit <b>M = 0, O = 1</b>. Was macht der Host?', a: ['Adresse per SLAAC, Zusatzinfos (z. B. DNS) per stateless DHCPv6', 'Keine Adresse bilden', 'Alles per stateful DHCPv6', 'APIPA verwenden'], c: 0, e: 'O = Other Configuration.' },
    { q: 'Welches Gateway trägt ein Host nach SLAAC ein?', a: ['Die Link-Local-Adresse des Routers', 'Die GUA des Routers', 'ff02::2', '::'], c: 0, e: 'Der RA wird von der LLA des Routers gesendet.' },
    { q: 'Kann DHCPv6 ein Standardgateway verteilen?', a: ['Nein, das Gateway kommt immer aus dem Router Advertisement', 'Ja, mit Option 3', 'Ja, aber nur stateful', 'Nur bei Windows'], c: 0, e: 'Option 3 (Router) gibt es nur bei DHCPv4.' },
    { q: 'Warum nutzen Windows & Co. meist <b>keine</b> EUI-64-Interface-ID?', a: ['Datenschutz: aus der MAC wäre das Gerät überall wiedererkennbar', 'EUI-64 ist verboten', 'Windows-PCs haben keine MAC', 'EUI-64 funktioniert nur mit /48'], c: 0, e: 'Stattdessen zufällige bzw. temporäre IDs (Privacy Extensions).' },
    { q: 'Welche Präfixlänge setzt SLAAC voraus?', a: ['/64', '/48', '/56', '/128'], c: 0, e: '64 Bit Präfix + 64 Bit Interface-ID = 128.' },
  ],

  generators: [
    {
      name: 'EUI-64 berechnen',
      make() {
        const mac = Array.from({ length: 6 }, (_, i) => (i === 0 ? rnd(64) * 4 : rnd(256)).toString(16).padStart(2, '0'));
        const r = IPv6.eui64(mac.join(''));
        return { type: 'input', q: `Bilde die EUI-64-Interface-ID aus der MAC <code>${mac.join(':').toUpperCase()}</code>`, accept: [r.iidFull], norm: 'iid', placeholder: 'xxxx:xxxx:xxxx:xxxx', hint: 'Teilen · FFFE einfügen · 7. Bit drehen', e: `${mac.slice(0, 3).join('')} | ${mac.slice(3).join('')} → FFFE einfügen → erstes Byte ${mac[0]} → ${r.flipped.toString(16).padStart(2, '0')} → <code>${r.iidFull}</code>` };
      },
    },
    {
      name: 'Link-Local aus MAC',
      make() {
        const mac = Array.from({ length: 6 }, () => rnd(256).toString(16).padStart(2, '0'));
        const r = IPv6.eui64(mac.join(''));
        const lla = IPv6.compress([0xfe80, 0, 0, 0, ...r.groups]);
        return { type: 'input', q: `Welche Link-Local-Adresse bildet ein Host per EUI-64 aus der MAC <code>${mac.join('-').toUpperCase()}</code>?`, accept: [lla], norm: 'ipv6', placeholder: 'fe80::…', e: `fe80:: + EUI-64 (${r.iidFull}) → <code>${lla}</code>` };
      },
    },
  ],

  visuals: [
    {
      title: '🎬 Ablauf animiert',
      render(root) {
        UI.sequence(root, {
          intro: 'Ein Laptop (MAC <code>00:1A:2B:3C:4D:5E</code>) wird ans Netz angeschlossen. Klicke auf <b>Weiter</b> und verfolge, wie er ganz ohne DHCP-Server zu seiner Adresse kommt.',
          actors: [{ id: 'pc', label: 'Laptop', icon: '💻' }, { id: 'r', label: 'Router', icon: '📶' }, { id: 'n', label: 'Andere Hosts', icon: '🖥️' }],
          steps: [
            { from: 'pc', to: 'pc', label: 'LLA bilden', title: 'Link-Local-Adresse selbst bilden', html: `<p>Der Laptop nimmt <code>fe80::/64</code> und hängt eine Interface-ID an (hier per EUI-64 aus der MAC):</p>${UI.pkt([['Adresse (tentative)', 'fe80::21a:2bff:fe3c:4d5e']])}<p class="muted">Noch ist die Adresse „vorläufig“ (tentative).</p>` },
            { from: 'pc', to: 'n', label: 'NS (DAD) an ff02::1:ff3c:4d5e', kind: 'mc', title: 'Duplicate Address Detection', html: `${UI.pkt([['Typ', 'Neighbor Solicitation (ICMPv6 135)'], ['Quelle', ':: (Unspecified – noch keine Adresse!)'], ['Ziel', 'ff02::1:ff3c:4d5e (Solicited-Node)'], ['Frage', '„Benutzt jemand fe80::21a:2bff:fe3c:4d5e?“']])}` },
            { from: 'pc', to: 'pc', label: 'keine Antwort → LLA gültig', title: 'Keine Antwort = Adresse frei', html: '<p>Antwortet niemand mit einer Neighbor Advertisement, ist die Adresse eindeutig. Ab jetzt kann der Laptop im lokalen Link kommunizieren.</p>' },
            { from: 'pc', to: 'r', label: 'RS an ff02::2', kind: 'mc', title: 'Router Solicitation', html: `${UI.pkt([['Typ', 'Router Solicitation (ICMPv6 133)'], ['Quelle', 'fe80::21a:2bff:fe3c:4d5e'], ['Ziel', 'ff02::2 (alle Router)'], ['Frage', '„Gibt es hier einen Router? Welches Präfix gilt?“']])}` },
            { from: 'r', to: 'pc', label: 'RA an ff02::1', kind: 'mc', title: 'Router Advertisement', html: `${UI.pkt([['Typ', 'Router Advertisement (ICMPv6 134)'], ['Quelle', 'fe80::1 (LLA des Routers)'], ['Ziel', 'ff02::1 (alle Knoten)'], ['Präfix', '2001:db8:1:1::/64, A-Flag = 1'], ['Flags', 'M = 0, O = 0 → reines SLAAC'], ['RDNSS', '2001:db8:1:1::53 (DNS-Server)'], ['Router-Lifetime', '1800 s']])}<p class="muted">Router senden RAs zusätzlich regelmäßig unaufgefordert.</p>` },
            { from: 'pc', to: 'pc', label: 'GUA bilden', title: 'Globale Adresse bilden', html: `<p>Präfix aus dem RA + eigene Interface-ID:</p>${UI.pkt([['Präfix', '2001:db8:1:1'], ['Interface-ID', '21a:2bff:fe3c:4d5e'], ['GUA', '<b>2001:db8:1:1:21a:2bff:fe3c:4d5e/64</b>']])}` },
            { from: 'pc', to: 'n', label: 'NS (DAD) für die GUA', kind: 'mc', title: 'DAD für die neue Adresse', html: '<p>Auch die globale Adresse wird per Neighbor Solicitation von <code>::</code> geprüft (gleiche Solicited-Node-Gruppe, da gleiche letzte 24 Bit).</p>' },
            { from: 'pc', to: 'pc', label: 'fertig konfiguriert ✔', title: 'Ergebnis', html: UI.terminal(`IPv6-Adresse. . . . . . . . . . . : <span class="ok">2001:db8:1:1:21a:2bff:fe3c:4d5e</span>
Verbindungslokale IPv6-Adresse  . : fe80::21a:2bff:fe3c:4d5e%12
Standardgateway . . . . . . . . . : <span class="ok">fe80::1%12</span>
DNS-Server  . . . . . . . . . . . : 2001:db8:1:1::53`) + '<p>Das Gateway ist die <b>Link-Local-Adresse des Routers</b> – sie stand als Absender im RA.</p>' },
          ],
        });
      },
    },
    {
      title: '🧩 EUI-64-Rechner',
      render(root) {
        root.innerHTML = `<div class="lab">
          <div class="grid2">
            <label class="field"><span>MAC-Adresse</span><input id="euIn" value="00:1A:2B:3C:4D:5E" spellcheck="false"></label>
            <label class="field"><span>Präfix aus dem RA</span><input id="euPf" value="2001:db8:1:1::/64" spellcheck="false"></label>
          </div>
          <div class="ex-btns"><button class="btn sm" data-m="00:1A:2B:3C:4D:5E">00:1A:2B:3C:4D:5E</button><button class="btn sm" data-m="A4:5E:60:E1:22:9B">A4:5E:60:E1:22:9B</button><button class="btn sm" data-m="02:50:56:C0:00:08">02:50:56:C0:00:08</button><button class="btn sm" data-m="B8:27:EB:12:34:56">B8:27:EB:12:34:56</button></div>
          <div id="euOut"></div></div>`;
        const inp = $('#euIn', root), pf = $('#euPf', root), out = $('#euOut', root);
        const upd = () => {
          try {
            const r = IPv6.eui64(inp.value);
            const h = r.mac.map(b => b.toString(16).padStart(2, '0'));
            const b0 = r.mac[0].toString(2).padStart(8, '0'), f0 = r.flipped.toString(2).padStart(8, '0');
            let gua = '';
            try { const { addr } = IPv6.splitPrefix(pf.value); const p = IPv6.network(IPv6.parse(addr), 64); gua = IPv6.compress([...p.slice(0, 4), ...r.groups]); } catch (e) { gua = '(Präfix ungültig)'; }
            out.innerHTML = `<ol class="steps">
              <li><b>MAC in der Mitte teilen</b><code>${h.slice(0, 3).join('')} <span class="muted">|</span> ${h.slice(3).join('')}</code></li>
              <li><b>FFFE einfügen</b><code>${h.slice(0, 3).join('')}<mark>fffe</mark>${h.slice(3).join('')}</code></li>
              <li><b>7. Bit des ersten Bytes umdrehen</b><code>${h[0]} = ${b0.slice(0, 6)}<mark>${b0[6]}</mark>${b0[7]} → ${f0.slice(0, 6)}<mark>${f0[6]}</mark>${f0[7]} = ${r.flipped.toString(16).padStart(2, '0')}</code></li>
              <li><b>Interface-ID (in 4er-Blöcke teilen)</b><code style="color:var(--accent);font-weight:700">${r.iidFull}</code></li>
              <li><b>Link-Local-Adresse</b><code>${IPv6.compress([0xfe80, 0, 0, 0, ...r.groups])}</code></li>
              <li><b>Globale Adresse (Präfix + Interface-ID)</b><code>${gua}</code></li></ol>
              <p class="muted">${b0[6] === '0' ? 'Bit war 0 (weltweit eindeutige Hersteller-MAC) → wird 1.' : 'Bit war 1 (lokal administrierte MAC, z. B. VM) → wird 0.'}</p>`;
          } catch (e) { out.innerHTML = `<div class="fb bad">⚠ ${esc(e.message)}</div>`; }
        };
        inp.oninput = upd; pf.oninput = upd;
        $$('[data-m]', root).forEach(b => b.onclick = () => { inp.value = b.dataset.m; upd(); });
        upd();
      },
    },
    {
      title: '🚩 RA-Flags',
      render(root) {
        root.innerHTML = `<p class="muted" style="margin-top:0">Schalte die Flags im Router Advertisement um und sieh, wie sich der Host verhält.</p>
          <div class="row" id="flags">
            <button class="btn on" data-f="A">A-Flag (Autonomous)</button>
            <button class="btn" data-f="M">M-Flag (Managed)</button>
            <button class="btn" data-f="O">O-Flag (Other)</button>
          </div><div id="flOut" style="margin-top:14px"></div>`;
        const f = { A: true, M: false, O: false };
        const upd = () => {
          $$('[data-f]', root).forEach(b => b.classList.toggle('on', f[b.dataset.f]));
          let title, addr, dns, note = '';
          if (f.M) { title = 'Stateful DHCPv6'; addr = 'vom DHCPv6-Server (SARR: Solicit, Advertise, Request, Reply)' + (f.A ? ' <b>und zusätzlich</b> eine SLAAC-Adresse (A = 1)' : ''); dns = 'vom DHCPv6-Server'; if (!f.O) note = 'O ist bei M = 1 bedeutungslos – der DHCPv6-Server liefert ohnehin alle Infos.'; }
          else if (f.A && f.O) { title = 'SLAAC + stateless DHCPv6'; addr = 'per SLAAC selbst gebildet'; dns = 'vom DHCPv6-Server (nur Zusatzinfos, keine Adressvergabe)'; }
          else if (f.A) { title = 'Reines SLAAC'; addr = 'per SLAAC selbst gebildet'; dns = 'per RDNSS-Option im RA (RFC 8106) – fehlt sie, hat der Host keinen DNS-Server!'; }
          else if (f.O) { title = 'Nur Zusatzinfos'; addr = 'keine automatische GUA – nur die Link-Local-Adresse'; dns = 'vom DHCPv6-Server'; note = 'Unübliche Kombination.'; }
          else { title = 'Keine Autokonfiguration'; addr = 'nur Link-Local – GUA muss manuell eingetragen werden'; dns = 'manuell'; }
          $('#flOut', root).innerHTML = `<div class="result-box"><h3>${title}</h3>
            <table class="pkt-tbl"><tr><th>Adresse</th><td style="font-family:inherit">${addr}</td></tr><tr><th>DNS-Server</th><td style="font-family:inherit">${dns}</td></tr><tr><th>Standardgateway</th><td style="font-family:inherit"><b>immer aus dem RA</b> (fe80:: des Routers)</td></tr></table>
            ${note ? `<p class="muted" style="margin-bottom:0">${note}</p>` : ''}</div>`;
        };
        $$('[data-f]', root).forEach(b => b.onclick = () => { f[b.dataset.f] = !f[b.dataset.f]; upd(); });
        upd();
      },
    },
  ],
});
