registerTopic({
  id: 'apipa',
  title: 'APIPA',
  subtitle: 'Automatic Private IP Addressing – 169.254.x.x',
  category: 'Adressvergabe',
  icon: '🆘',
  color: '#f87171',

  levels: {
    1: `
      <h2>Der Notfallplan, wenn DHCP schweigt</h2>
      <div class="analogy"><div class="big">🏕️</div><div>
        Du kommst ins Hotel, aber <b>die Rezeption ist nicht besetzt</b>. Statt draußen zu warten, baust du dir in der Lobby <b>ein Zelt mit einem selbst ausgedachten Namensschild</b> auf.
        Mit den anderen Gästen in der Lobby kannst du reden – aber <b>raus in die Stadt</b> (Internet) kommst du so nicht.</div></div>
      <p>Genau das ist <b>APIPA</b>: Bekommt ein Windows-PC keine Antwort von einem DHCP-Server, gibt er sich <b>selbst</b> eine Adresse aus dem Bereich <b>169.254.x.x</b>.</p>
      <ul>
        <li>✅ Kommunikation mit anderen Geräten im <b>gleichen Netzsegment</b>, die auch APIPA haben.</li>
        <li>❌ <b>Kein Internet</b>, kein Gateway, kein DNS.</li>
      </ul>
      <div class="callout exam">Siehst du bei <code>ipconfig</code> eine Adresse mit <b>169.254</b>, weißt du sofort: <b>Der PC hat keinen DHCP-Server erreicht.</b> Das ist eine der häufigsten Fehlersuche-Fragen!</div>`,

    2: `
      <h2>Eckdaten</h2>
      <table class="tbl">
        <tr><td>Name</td><td><b>A</b>utomatic <b>P</b>rivate <b>IP</b> <b>A</b>ddressing (Microsoft-Begriff) – allgemein <b>IPv4 Link-Local</b> / Zeroconf (RFC 3927)</td></tr>
        <tr><td>Adressbereich</td><td><code>169.254.0.0/16</code></td></tr>
        <tr><td>Nutzbar</td><td><code>169.254.1.0</code> – <code>169.254.254.255</code> (erstes und letztes /24 reserviert)</td></tr>
        <tr><td>Subnetzmaske</td><td><code>255.255.0.0</code></td></tr>
        <tr><td>Gateway / DNS</td><td><b>keins</b></td></tr>
        <tr><td>Routing</td><td>Router leiten 169.254.x.x <b>nicht</b> weiter</td></tr>
      </table>
      <h2>Ablauf</h2>
      <ol>
        <li>Client sendet <b>DHCPDISCOVER</b> – es kommt <b>keine Antwort</b> (mehrere Versuche).</li>
        <li>Client wählt eine <b>zufällige Adresse</b> aus 169.254.1.0 – 169.254.254.255.</li>
        <li>Prüfung per <b>ARP</b> (ARP-Probe): „Hat jemand diese Adresse?“ Bei Konflikt → neue Zufallsadresse.</li>
        <li>Adresse wird mit Maske 255.255.0.0 und <b>ohne Gateway</b> konfiguriert.</li>
        <li>Im Hintergrund sucht Windows <b>alle 5 Minuten</b> weiter nach einem DHCP-Server. Antwortet einer, wird die APIPA-Adresse ersetzt.</li>
      </ol>
      <h2>Fehlersuche: „Mein PC hat 169.254.x.x“</h2>
      <table class="tbl">
        <tr><th>Mögliche Ursache</th><th>Prüfen</th></tr>
        <tr><td>Kabel / WLAN</td><td>Link-LED, Kabel tauschen, WLAN verbunden?</td></tr>
        <tr><td>Falsches VLAN am Switch-Port</td><td>Switch-Konfiguration</td></tr>
        <tr><td>DHCP-Dienst gestoppt / Server aus</td><td>Dienst am Server bzw. Router prüfen</td></tr>
        <tr><td>Pool erschöpft</td><td>Freie Adressen im Bereich? Lease zu lang?</td></tr>
        <tr><td>DHCP-Relay fehlt (Server in anderem Netz)</td><td><code>ip helper-address</code> am Router</td></tr>
        <tr><td>Firewall blockiert UDP 67/68</td><td>Firewall-Regeln</td></tr>
      </table>
      <p>Danach: <code>ipconfig /release</code> und <code>ipconfig /renew</code>.</p>
      <h2>Vergleich mit IPv6</h2>
      <p>Bei IPv6 ist das Prinzip <b>Normalfall</b>: Jede Schnittstelle hat <b>immer</b> eine Link-Local-Adresse <code>fe80::/10</code>. Bei IPv4 ist 169.254.x.x ein <b>Warnsignal</b>.</p>
      <div class="callout warn">APIPA ist <b>kein</b> privater Adressbereich nach RFC 1918! Die privaten Bereiche sind 10.0.0.0/8, 172.16.0.0/12 und 192.168.0.0/16. 169.254.0.0/16 ist <b>Link-Local</b>.</div>`,

    3: `
      <h2>RFC 3927 im Detail</h2>
      <h3>Adresswahl</h3>
      <p>Die Zufallszahl wird oft aus der <b>MAC-Adresse geseedet</b>. Dadurch bekommt ein Gerät bei jedem Neustart meist <b>dieselbe</b> APIPA-Adresse – praktisch, weil Verbindungen zwischen zwei APIPA-Geräten so stabiler sind.</p>
      <h3>ARP-Probe und Announcement</h3>
      <ul>
        <li><b>Probe:</b> ARP-Request mit <b>Sender-IP 0.0.0.0</b> und Ziel-IP = gewünschte Adresse, mehrfach mit zufälligem Abstand. Antwortet jemand → Konflikt.</li>
        <li><b>Announcement:</b> Gratuitous ARP, damit alle Nachbarn ihre ARP-Caches aktualisieren.</li>
        <li><b>Konfliktverteidigung:</b> Erkennt ein Host später einen Konflikt, verteidigt er die Adresse einmal per ARP; bei erneutem Konflikt wählt er eine neue.</li>
      </ul>
      <h3>Windows-Details</h3>
      <ul>
        <li><b>Alternative Konfiguration</b> (IPv4-Eigenschaften): statt APIPA eine benutzerdefinierte statische IP, falls kein DHCP antwortet – beliebt bei Laptops zwischen Firma und Zuhause.</li>
        <li>APIPA abschalten per Registry: <code>IPAutoconfigurationEnabled = 0</code> (unter Tcpip\\Parameters).</li>
        <li>Anzeige in <code>ipconfig</code>: „<b>Autokonfiguration IPv4-Adresse</b>“.</li>
      </ul>
      <h3>Wo 169.254 sonst auftaucht</h3>
      <ul>
        <li><b>Zeroconf</b>-Geräte (Drucker, Kameras) ohne DHCP – Namensauflösung dann oft über <b>mDNS</b> (Bonjour, <code>*.local</code>).</li>
        <li>Direktverbindung zweier PCs per Kabel ohne Router.</li>
        <li>Cloud: <code>169.254.169.254</code> ist bei AWS, Azure & Co. der <b>Metadaten-Dienst</b> der VM.</li>
        <li>Linux/macOS: <code>avahi-autoipd</code> bzw. eingebaut – gleiche Logik.</li>
      </ul>
      <h3>Warum keine Kommunikation über Router?</h3>
      <p>RFC 3927 verbietet Routern ausdrücklich das Weiterleiten von Paketen mit Quell- oder Zieladresse aus 169.254.0.0/16. Da kein Gateway gesetzt ist, würde der Host Pakete in fremde Netze ohnehin nicht abschicken.</p>`,
  },

  merke: [
    'APIPA = 169.254.0.0/16, Maske 255.255.0.0, kein Gateway, kein DNS.',
    'Entsteht, wenn kein DHCP-Server antwortet → Fehlersymptom!',
    'Adresse wird per ARP auf Konflikte geprüft.',
    'Windows sucht alle 5 Minuten weiter nach DHCP.',
    'Nur Kommunikation im eigenen Segment, kein Internet.',
    'IPv6-Gegenstück: Link-Local fe80::/10 (dort aber normal).',
  ],

  cheat: [
    ['Bereich', '<code>169.254.0.0/16</code> (nutzbar 169.254.1.0 – 169.254.254.255)'],
    ['Maske', '255.255.0.0'],
    ['Gateway / DNS', 'keine'],
    ['Auslöser', 'DHCP-Server antwortet nicht'],
    ['Konfliktprüfung', 'ARP-Probe (Sender-IP 0.0.0.0)'],
    ['Wiederholung', 'Windows sucht alle 5 Minuten weiter nach DHCP'],
    ['Allg. Name', 'IPv4 Link-Local, Zeroconf (RFC 3927)'],
    ['Alternative', 'Windows „Alternative Konfiguration“ (statische Fallback-IP)'],
  ],

  cards: [
    ['APIPA – wofür steht es?', 'Automatic Private IP Addressing'],
    ['APIPA-Adressbereich', '<code>169.254.0.0/16</code>, Maske 255.255.0.0'],
    ['Wann greift APIPA?', 'Wenn der Client keine Antwort von einem DHCP-Server bekommt'],
    ['Was geht mit APIPA, was nicht?', '✅ Kommunikation im eigenen Segment · ❌ Internet, Routing, DNS'],
    ['Wie prüft der Host, ob die APIPA-Adresse frei ist?', 'Per ARP-Probe'],
    ['ipconfig zeigt 169.254.12.7 – Diagnose?', 'DHCP-Server nicht erreichbar: Kabel, VLAN, Dienst, Pool voll, Relay, Firewall'],
    ['Wie oft sucht Windows nach DHCP, wenn APIPA aktiv ist?', 'Etwa alle 5 Minuten'],
    ['IPv6-Pendant zu APIPA', 'Link-Local <code>fe80::/10</code>'],
  ],

  quiz: [
    { q: 'Aus welchem Bereich stammen APIPA-Adressen?', a: ['169.254.0.0/16', '192.168.0.0/16', '10.0.0.0/8', '172.16.0.0/12'], c: 0, e: 'Die anderen drei sind private Bereiche nach RFC 1918.' },
    { q: 'Wann vergibt sich ein Windows-PC eine APIPA-Adresse?', a: ['Wenn kein DHCP-Server antwortet', 'Bei jedem Systemstart', 'Wenn der DNS-Server ausfällt', 'Wenn eine statische IP eingetragen ist'], c: 0, e: 'APIPA ist der Fallback für DHCP.' },
    { q: 'Welche Subnetzmaske hat eine APIPA-Adresse?', a: ['255.255.0.0', '255.255.255.0', '255.0.0.0', '255.255.255.255'], c: 0, e: '/16 → 255.255.0.0.' },
    { q: 'Was ist mit einer APIPA-Adresse möglich?', a: ['Kommunikation mit Geräten im selben Segment, die ebenfalls APIPA nutzen', 'Internetzugang', 'Routing in andere Netze', 'DNS-Auflösung über den Provider'], c: 0, e: 'Kein Gateway, kein DNS – nur lokal.' },
    { q: 'Welches Standardgateway wird bei APIPA eingetragen?', a: ['Keines', '169.254.0.1', '192.168.1.1', 'Das zuletzt per DHCP erhaltene'], c: 0, e: 'Deshalb ist kein Internet möglich.' },
    { q: 'Wie stellt der Rechner sicher, dass die APIPA-Adresse nicht schon vergeben ist?', a: ['Per ARP (ARP-Probe)', 'Per DNS-Abfrage', 'Per Ping an 8.8.8.8', 'Gar nicht'], c: 0, e: 'ARP-Request mit Sender-IP 0.0.0.0 für die gewünschte Adresse.' },
    { q: 'Sucht Windows nach der APIPA-Vergabe weiter nach einem DHCP-Server?', a: ['Ja, etwa alle 5 Minuten', 'Nein, nie wieder', 'Nur nach einem Neustart', 'Jede Sekunde'], c: 0, e: 'Antwortet ein Server, wird die APIPA-Adresse ersetzt.' },
    { q: '<code>ipconfig</code> zeigt <code>169.254.12.7</code>. Was ist die wahrscheinlichste Ursache?', a: ['Der DHCP-Server ist nicht erreichbar (Kabel, VLAN, Dienst, Pool voll …)', 'Der DNS-Server ist falsch eingetragen', 'Der Browser ist defekt', 'Die Firewall blockiert HTTP'], c: 0, e: 'APIPA = DHCP hat nicht geantwortet.' },
    { q: 'Was ist das IPv6-Gegenstück zu APIPA?', a: ['Link-Local-Adresse fe80::/10', 'Unique Local fd00::/8', 'Loopback ::1', 'Multicast ff02::1'], c: 0, e: 'Bei IPv6 ist die LLA aber immer vorhanden, nicht nur im Fehlerfall.' },
    { q: 'Welcher Bereich ist laut RFC 3927 für APIPA nutzbar?', a: ['169.254.1.0 – 169.254.254.255', '169.254.0.0 – 169.254.255.255 komplett', '169.254.0.1 – 169.254.0.254', '169.254.1.1 – 169.254.1.254'], c: 0, e: 'Das erste und letzte /24 (169.254.0.x und 169.254.255.x) sind reserviert.' },
    { q: 'Wie heißt APIPA herstellerneutral?', a: ['IPv4 Link-Local / Zeroconf', 'NAT', 'DHCP-Relay', 'Supernetting'], c: 0, e: 'APIPA ist der Microsoft-Name, das Verfahren steht in RFC 3927.' },
    { q: 'Wofür steht APIPA?', a: ['Automatic Private IP Addressing', 'Automatic Public IP Allocation', 'Advanced Private Internet Protocol Address', 'Auto Protocol for IP Assignment'], c: 0 },
    { q: 'Ist 169.254.0.0/16 ein privater Adressbereich nach RFC 1918?', a: ['Nein, es ist ein Link-Local-Bereich', 'Ja, der vierte private Bereich', 'Ja, aber nur für Windows', 'Nur in IPv6'], c: 0, e: 'RFC 1918: 10/8, 172.16/12, 192.168/16.' },
    { q: 'Womit kann man unter Windows statt APIPA eine feste Ausweich-IP festlegen?', a: ['„Alternative Konfiguration“ in den IPv4-Eigenschaften', 'ipconfig /flushdns', 'Im DNS-Server', 'Gar nicht'], c: 0, e: 'Greift nur, wenn kein DHCP-Server antwortet.' },
  ],

  generators: [
    {
      name: 'APIPA erkennen',
      make() {
        const o = () => rnd(256);
        const cands = [
          [true, `169.254.${1 + rnd(254)}.${o()}`],
          [true, `169.254.${1 + rnd(254)}.${o()}`],
          [false, `169.${pick([245, 253, 255, 154])}.${o()}.${o()}`],
          [false, `192.168.${o()}.${1 + rnd(254)}`],
          [false, `10.169.254.${1 + rnd(254)}`],
          [false, `172.${16 + rnd(16)}.${o()}.${o()}`],
          [false, `${pick([11, 54, 85, 203])}.254.169.${o()}`],
        ];
        const [isA, ip] = pick(cands);
        return { q: `Ist <code>${ip}</code> eine APIPA-Adresse?`, a: ['Ja', 'Nein'], c: isA ? 0 : 1, noShuffle: true, e: isA ? 'Liegt in 169.254.0.0/16 → APIPA (DHCP hat nicht geantwortet).' : 'Nur 169.254.x.x ist APIPA. Genau auf die ersten beiden Oktette achten!' };
      },
    },
  ],

  visuals: [
    {
      title: '🧪 Simulator: DHCP an/aus',
      render(root) {
        root.innerHTML = `<div class="row" style="margin:0 0 12px"><b>DHCP-Server:</b>
          <button class="btn on" data-s="on">🟢 erreichbar</button><button class="btn" data-s="off">🔴 ausgefallen</button></div><div id="apSeq"></div>`;
        const ip = '169.254.' + (1 + rnd(254)) + '.' + rnd(256);
        const run = on => {
          $$('[data-s]', root).forEach(b => b.classList.toggle('on', (b.dataset.s === 'on') === on));
          const actors = [{ id: 'pc', label: 'PC', icon: '💻' }, { id: 'net', label: 'Andere im LAN', icon: '🖥️' }, { id: 's', label: 'DHCP-Server', icon: on ? '🗄️' : '❌', off: !on }];
          const steps = on ? [
            { from: 'pc', to: 's', label: 'DHCPDISCOVER', kind: 'bc', title: 'Discover', html: '<p>Der PC sucht per Broadcast einen DHCP-Server.</p>' },
            { from: 's', to: 'pc', label: 'DHCPOFFER', kind: 'bc', title: 'Offer', html: '<p>Der Server antwortet mit einem Angebot: 192.168.1.100.</p>' },
            { from: 'pc', to: 's', label: 'DHCPREQUEST', kind: 'bc', title: 'Request' },
            { from: 's', to: 'pc', label: 'DHCPACK', kind: 'bc', title: 'Acknowledge – alles normal', html: UI.terminal(`Ethernet-Adapter Ethernet:
   IPv4-Adresse  . . . . . . . . . . : <span class="ok">192.168.1.100</span>(Bevorzugt)
   Subnetzmaske  . . . . . . . . . . : 255.255.255.0
   Standardgateway . . . . . . . . . : 192.168.1.1`) + '<p>✅ Internet funktioniert. Jetzt schalte oben den Server <b>aus</b> und vergleiche!</p>' },
          ] : [
            { from: 'pc', to: 's', label: 'DHCPDISCOVER …', kind: 'err', title: 'Discover – keine Antwort', html: '<p>Der Broadcast geht raus, aber <b>niemand antwortet</b>.</p>' },
            { from: 'pc', to: 's', label: 'DHCPDISCOVER (Wiederholung) …', kind: 'err', title: 'Weitere Versuche', html: '<p>Windows wiederholt den Discover mehrmals (mit wachsendem Abstand). Wieder nichts.</p>' },
            { from: 'pc', to: 'pc', label: `Zufallsadresse ${ip}`, title: 'APIPA: selbst eine Adresse wählen', html: `<p>Zufällig aus 169.254.1.0 – 169.254.254.255 gewählt: <code>${ip}</code></p>` },
            { from: 'pc', to: 'net', label: `ARP-Probe: Wer hat ${ip}?`, kind: 'bc', title: 'Konfliktprüfung per ARP', html: UI.pkt([['Typ', 'ARP-Request (Broadcast)'], ['Sender-IP', '0.0.0.0'], ['Ziel-IP', ip], ['Bedeutung', '„Benutzt jemand diese Adresse?“']]) },
            { from: 'pc', to: 'pc', label: 'keine Antwort → Adresse nutzen', title: 'APIPA-Adresse aktiv', html: UI.terminal(`Ethernet-Adapter Ethernet:
   Autokonfiguration IPv4-Adresse  . : <span class="hl">${ip}</span>(Bevorzugt)
   Subnetzmaske  . . . . . . . . . . : <span class="hl">255.255.0.0</span>
   Standardgateway . . . . . . . . . : <span class="hl">(leer)</span>`) + '<p>❌ Kein Gateway → <b>kein Internet</b>. Nur Geräte im selben Segment mit 169.254.x.x sind erreichbar.</p>' },
            { from: 'pc', to: 's', label: 'alle 5 Min.: DHCPDISCOVER', kind: 'err', title: 'Im Hintergrund weiter suchen', html: '<p>Windows versucht es etwa <b>alle 5 Minuten</b> erneut. Sobald ein DHCP-Server antwortet, wird die APIPA-Adresse ersetzt.</p>' },
          ];
          UI.sequence($('#apSeq', root), { actors, steps, intro: on ? 'Normalfall: Ein DHCP-Server ist erreichbar.' : 'Fehlerfall: Der DHCP-Server ist ausgefallen (oder Kabel/VLAN falsch).' });
        };
        $$('[data-s]', root).forEach(b => b.onclick = () => run(b.dataset.s === 'on'));
        run(false);
      },
    },
    {
      title: '🔎 IPv4-Adress-Check',
      render(root) {
        root.innerHTML = `<div class="lab"><label class="field"><span>IPv4-Adresse prüfen</span><input id="v4In" value="169.254.37.112" spellcheck="false"></label>
          <div class="ex-btns">${['169.254.37.112', '192.168.1.20', '10.0.0.5', '172.20.1.1', '172.32.1.1', '127.0.0.1', '8.8.8.8', '100.64.0.1', '224.0.0.251', '255.255.255.255', '0.0.0.0'].map(e => `<button class="btn sm" data-ex="${e}">${e}</button>`).join('')}</div>
          <div id="v4Out"></div></div>`;
        const inp = $('#v4In', root), out = $('#v4Out', root);
        const cls = ip => {
          const [a, b] = ip;
          if (ip.every(x => x === 0)) return ['❔ Unspezifiziert 0.0.0.0', 'Quelladresse bei DHCPDISCOVER, „noch keine Adresse“.', 'var(--muted)'];
          if (ip.every(x => x === 255)) return ['📢 Limited Broadcast', 'Ziel des DHCPDISCOVER – an alle im Segment.', 'var(--warn)'];
          if (a === 169 && b === 254) return ['🆘 APIPA / Link-Local (169.254.0.0/16)', 'DHCP hat nicht geantwortet! Kein Gateway, kein Internet.', 'var(--bad)'];
          if (a === 10) return ['🏠 Privat (10.0.0.0/8)', 'RFC 1918 – im Internet nicht routbar, NAT nötig.', 'var(--good)'];
          if (a === 172 && b >= 16 && b <= 31) return ['🏠 Privat (172.16.0.0/12)', 'RFC 1918 – reicht von 172.16.0.0 bis 172.31.255.255.', 'var(--good)'];
          if (a === 192 && b === 168) return ['🏠 Privat (192.168.0.0/16)', 'RFC 1918 – typisch im Heimnetz.', 'var(--good)'];
          if (a === 127) return ['🪞 Loopback (127.0.0.0/8)', 'Der Rechner selbst.', 'var(--accent2)'];
          if (a === 100 && b >= 64 && b <= 127) return ['🏢 Carrier-Grade NAT (100.64.0.0/10)', 'Providerinterne Adressen (z. B. DS-Lite/CGN).', 'var(--info)'];
          if (a >= 224 && a <= 239) return ['📡 Multicast (224.0.0.0/4)', 'Gruppenadresse.', 'var(--accent)'];
          if (a >= 240) return ['🚫 Reserviert (240.0.0.0/4)', 'Nicht verwendbar.', 'var(--muted)'];
          return ['🌍 Öffentlich', 'Im Internet routbar.', 'var(--info)'];
        };
        const upd = () => {
          const p = inp.value.trim().split('.');
          if (p.length !== 4 || p.some(x => !/^\d{1,3}$/.test(x) || +x > 255)) { out.innerHTML = '<div class="fb bad">⚠ Gültige IPv4-Adresse: 4 Zahlen 0–255, getrennt durch Punkte</div>'; return; }
          const ip = p.map(Number), [t, d, c] = cls(ip);
          out.innerHTML = `<div class="result-box" style="border-color:${c}"><h3>${t}</h3><p style="margin:0">${d}</p><p class="muted" style="margin:6px 0 0">Binär: <code>${ip.map(x => x.toString(2).padStart(8, '0')).join('.')}</code></p></div>`;
        };
        inp.oninput = upd;
        $$('[data-ex]', root).forEach(b => b.onclick = () => { inp.value = b.dataset.ex; upd(); });
        upd();
      },
    },
  ],
});
