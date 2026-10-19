registerTopic({
  id: 'dhcp',
  title: 'DHCP',
  subtitle: 'DORA, Lease & Zuweisungsarten',
  category: 'Adressvergabe',
  icon: '📨',
  color: '#fb923c',

  levels: {
    1: `
      <h2>Was macht DHCP?</h2>
      <div class="analogy"><div class="big">🏨</div><div>
        DHCP ist die <b>Hotelrezeption</b> des Netzwerks. Du kommst an (Gerät wird eingeschaltet) und sagst: „Ich brauche ein Zimmer!“
        Die Rezeption gibt dir einen <b>Schlüssel</b> (IP-Adresse) – aber nur <b>für eine bestimmte Zeit</b> (die <b>Lease</b>). Dazu bekommst du noch Infos: wo der Ausgang ist (Gateway) und wo die Auskunft (DNS-Server).</div></div>
      <p>So muss niemand an jedem PC per Hand eine Adresse eintragen. <b>DHCP = Dynamic Host Configuration Protocol</b>.</p>
      <h2>Das Gespräch: D-O-R-A</h2>
      <div class="flow"><span>🙋 <b>D</b>iscover<br><small>„Ist hier ein DHCP-Server?“</small></span><i>→</i><span>🎁 <b>O</b>ffer<br><small>„Du kannst .100 haben“</small></span><i>→</i><span>✋ <b>R</b>equest<br><small>„Ja, die nehm ich!“</small></span><i>→</i><span>✅ <b>A</b>cknowledge<br><small>„Abgemacht!“</small></span></div>
      <p>Eselsbrücke: <b>DORA</b> – wie Dora the Explorer, die sich ihre Adresse erkundet. 🧭</p>
      <h2>Drei Arten, eine Adresse zu bekommen</h2>
      <table class="tbl">
        <tr><td>🔄 <b>Dynamisch</b></td><td>Du bekommst irgendein freies Zimmer – <b>auf Zeit</b>. Gehst du, wird es irgendwann neu vergeben.</td></tr>
        <tr><td>♾️ <b>Automatisch</b></td><td>Du bekommst irgendein freies Zimmer – aber es bleibt <b>für immer deins</b>.</td></tr>
        <tr><td>📌 <b>Manuell</b> (Reservierung)</td><td>Die Rezeption hat für dich <b>ein bestimmtes Zimmer reserviert</b> – du bekommst immer genau das. Erkannt wirst du an deiner MAC-Adresse.</td></tr>
      </table>`,

    2: `
      <h2>DHCP-Grundlagen</h2>
      <ul>
        <li>Transport: <b>UDP</b> – <b>Server Port 67</b>, <b>Client Port 68</b>.</li>
        <li>Verteilt u. a.: <b>IP-Adresse, Subnetzmaske, Standardgateway, DNS-Server, Lease-Dauer</b>, Domain-Name.</li>
        <li>Der Server verwaltet einen <b>Bereich (Scope/Pool)</b>, z. B. 192.168.1.100 – 192.168.1.199, und kann Adressen <b>ausschließen</b> (z. B. für Drucker, Server).</li>
      </ul>
      <h2>Der DORA-Prozess</h2>
      <div class="tbl-wrap"><table class="tbl">
        <tr><th>#</th><th>Nachricht</th><th>Richtung</th><th>Quell-IP:Port</th><th>Ziel-IP:Port</th><th>Inhalt</th></tr>
        <tr><td>1</td><td><b>DHCPDISCOVER</b></td><td>Client → alle</td><td><code>0.0.0.0:68</code></td><td><code>255.255.255.255:67</code></td><td>MAC des Clients, „Ich suche einen Server“</td></tr>
        <tr><td>2</td><td><b>DHCPOFFER</b></td><td>Server → Client</td><td><code>192.168.1.1:67</code></td><td>Broadcast oder Unicast <code>:68</code></td><td>Angebot: IP, Maske, Gateway, DNS, Lease</td></tr>
        <tr><td>3</td><td><b>DHCPREQUEST</b></td><td>Client → alle</td><td><code>0.0.0.0:68</code></td><td><code>255.255.255.255:67</code></td><td>„Ich nehme das Angebot von Server X“</td></tr>
        <tr><td>4</td><td><b>DHCPACK</b></td><td>Server → Client</td><td><code>192.168.1.1:67</code></td><td>Broadcast oder Unicast <code>:68</code></td><td>Bestätigung – Adresse darf genutzt werden</td></tr>
      </table></div>
      <div class="callout exam">Warum ist der <b>Request ein Broadcast</b>, obwohl der Client den Server schon kennt? Damit <b>alle anderen DHCP-Server</b> mitbekommen, dass ihr Angebot abgelehnt wurde, und ihre reservierten Adressen wieder freigeben.</div>
      <h2>Zuweisungsarten (RFC 2131)</h2>
      <table class="tbl">
        <tr><th>Art</th><th>Wie?</th><th>Lease</th><th>Einsatz</th></tr>
        <tr><td><b>Automatische Zuweisung</b></td><td>Server wählt eine freie Adresse aus dem Pool und ordnet sie dem Client <b>dauerhaft</b> zu.</td><td>unbegrenzt</td><td>feste Umgebungen, Client soll immer „seine“ Adresse behalten</td></tr>
        <tr><td><b>Dynamische Zuweisung</b></td><td>Server wählt eine freie Adresse aus dem Pool und <b>verleiht</b> sie.</td><td>begrenzt (z. B. 8 h, 1 Tag, 8 Tage)</td><td>Standard: Büro-PCs, WLAN, Gäste</td></tr>
        <tr><td><b>Manuelle Zuweisung</b> (statisch / Reservierung)</td><td>Admin legt im Server fest: <b>MAC-Adresse → bestimmte IP</b>.</td><td>meist unbegrenzt</td><td>Drucker, Server, Access Points, Kameras</td></tr>
      </table>
      <div class="callout warn">„Manuelle Zuweisung“ bei DHCP heißt <b>nicht</b>, die IP am PC selbst einzutippen! Der Client nutzt weiterhin DHCP – nur der <b>Server</b> hat eine feste Zuordnung MAC → IP (Reservierung).</div>
      <h2>Lease-Verlängerung</h2>
      <table class="tbl">
        <tr><th>Zeitpunkt</th><th>Phase</th><th>Was passiert?</th></tr>
        <tr><td><b>50 %</b> (T1)</td><td>Renewing</td><td>Client fragt <b>per Unicast</b> bei <b>seinem</b> Server: DHCPREQUEST → DHCPACK</td></tr>
        <tr><td><b>87,5 %</b> (T2)</td><td>Rebinding</td><td>Eigener Server antwortet nicht → DHCPREQUEST als <b>Broadcast</b> an <b>beliebige</b> Server</td></tr>
        <tr><td>100 %</td><td>Ablauf</td><td>Adresse wird aufgegeben, neuer DORA-Prozess (ggf. APIPA)</td></tr>
      </table>
      <h2>Weitere DHCP-Nachrichten</h2>
      <table class="tbl">
        <tr><td><b>DHCPNAK</b></td><td>Server lehnt ab (z. B. Client will Adresse aus einem anderen Netz)</td></tr>
        <tr><td><b>DHCPDECLINE</b></td><td>Client meldet: angebotene Adresse ist schon belegt (per ARP festgestellt)</td></tr>
        <tr><td><b>DHCPRELEASE</b></td><td>Client gibt Adresse freiwillig zurück (<code>ipconfig /release</code>)</td></tr>
        <tr><td><b>DHCPINFORM</b></td><td>Client hat schon eine (statische) IP und will nur Zusatzinfos</td></tr>
      </table>
      <h2>DHCP über Router hinweg: Relay-Agent</h2>
      <p>Router leiten <b>keine Broadcasts</b> weiter. Steht der DHCP-Server in einem anderen Netz, nimmt ein <b>DHCP-Relay-Agent</b> (meist der Router, Cisco: <code>ip helper-address</code>) den Broadcast an und schickt ihn als <b>Unicast</b> an den Server. Über das Feld <b>giaddr</b> erkennt der Server, aus welchem Netz die Anfrage kommt und welchen Pool er nehmen muss.</p>
      <h2>Wichtige Windows-Befehle</h2>
      <table class="tbl" style="font-family:var(--mono)">
        <tr><td>ipconfig /all</td><td style="font-family:inherit">Zeigt DHCP-Server, Lease-Beginn und -Ende</td></tr>
        <tr><td>ipconfig /release</td><td style="font-family:inherit">Adresse zurückgeben</td></tr>
        <tr><td>ipconfig /renew</td><td style="font-family:inherit">Neue Adresse anfordern (DORA)</td></tr>
      </table>`,

    3: `
      <h2>Unter der Haube</h2>
      <h3>Wichtige Felder im DHCP-Paket</h3>
      <table class="tbl">
        <tr><td><code>op</code></td><td>1 = Request (Client), 2 = Reply (Server)</td></tr>
        <tr><td><code>xid</code></td><td>Transaktions-ID – ordnet Antworten der Anfrage zu</td></tr>
        <tr><td><code>ciaddr</code></td><td>aktuelle Client-IP (nur bei Renew)</td></tr>
        <tr><td><code>yiaddr</code></td><td>„your IP“ – die angebotene Adresse</td></tr>
        <tr><td><code>giaddr</code></td><td>Gateway-IP des Relay-Agents</td></tr>
        <tr><td><code>chaddr</code></td><td>Hardware-(MAC-)Adresse des Clients</td></tr>
        <tr><td>Flags</td><td>Broadcast-Bit: Client kann Unicast noch nicht empfangen → Antwort per Broadcast</td></tr>
      </table>
      <h3>Häufige Optionen</h3>
      <table class="tbl">
        <tr><th>Nr.</th><th>Option</th></tr>
        <tr><td>1</td><td>Subnetzmaske</td></tr>
        <tr><td>3</td><td>Router (Standardgateway)</td></tr>
        <tr><td>6</td><td>DNS-Server</td></tr>
        <tr><td>15</td><td>Domain-Name</td></tr>
        <tr><td>50</td><td>Requested IP Address (Wunschadresse)</td></tr>
        <tr><td>51</td><td>Lease-Zeit</td></tr>
        <tr><td>53</td><td>Nachrichtentyp (1 Discover … 5 ACK, 6 NAK, 7 Release)</td></tr>
        <tr><td>54</td><td>Server Identifier</td></tr>
        <tr><td>66 / 67</td><td>TFTP-Server / Bootdatei (PXE-Boot, IP-Telefone)</td></tr>
        <tr><td>82</td><td>Relay Agent Information (Switch-Port, VLAN)</td></tr>
      </table>
      <h3>Konflikterkennung</h3>
      <p>Viele Server pingen eine Adresse vor dem Angebot. Der Client prüft nach dem ACK per <b>ARP</b> (Gratuitous ARP / ARP-Probe), ob die IP schon jemand nutzt – falls ja: <b>DHCPDECLINE</b> und Neustart.</p>
      <h3>Ausfallsicherheit</h3>
      <ul>
        <li><b>Split Scope (80/20-Regel):</b> Server A verwaltet 80 % des Pools, Server B 20 % – fällt A aus, versorgt B die Clients übergangsweise.</li>
        <li><b>DHCP-Failover</b> (Windows Server ab 2012): Load-Balancing oder Hot-Standby, Leases werden synchronisiert.</li>
      </ul>
      <h3>Angriffe & Schutz</h3>
      <ul>
        <li><b>Rogue DHCP-Server:</b> Fremder Server verteilt falsches Gateway/DNS → Man-in-the-Middle.</li>
        <li><b>DHCP Starvation:</b> Angreifer fordert mit gefälschten MACs alle Adressen an → Pool leer → Clients landen bei APIPA.</li>
        <li>Schutz: <b>DHCP Snooping</b> am Switch (nur „trusted“ Ports dürfen Offers/ACKs senden), Port Security.</li>
      </ul>
      <h3>DHCPv6</h3>
      <ul>
        <li>Ports: <b>UDP 546 (Client)</b>, <b>547 (Server)</b>. Clients senden an <code>ff02::1:2</code>.</li>
        <li>Ablauf <b>SARR</b>: Solicit → Advertise → Request → Reply (oder Rapid Commit: Solicit → Reply).</li>
        <li>Identifikation per <b>DUID</b> statt MAC.</li>
        <li>Verteilt <b>kein Standardgateway</b> – das kommt per Router Advertisement.</li>
        <li><b>Prefix Delegation</b> (DHCPv6-PD): Provider gibt dem Kundenrouter ein ganzes Präfix (z. B. /56).</li>
      </ul>`,
  },

  merke: [
    'DORA: Discover → Offer → Request → Acknowledge.',
    'UDP 67 = Server, 68 = Client. Discover: 0.0.0.0 → 255.255.255.255.',
    'Automatisch = dauerhaft aus dem Pool · Dynamisch = auf Zeit · Manuell = Reservierung MAC → IP.',
    'T1 = 50 % (Unicast an eigenen Server) · T2 = 87,5 % (Broadcast an alle).',
    'Router leiten keine Broadcasts → DHCP-Relay-Agent (ip helper-address).',
    'DHCPv6: UDP 546/547, SARR, kein Gateway.',
  ],

  cheat: [
    ['Ports', 'UDP 67 (Server), UDP 68 (Client) · DHCPv6: 547 / 546'],
    ['DORA', 'Discover (Broadcast) → Offer → Request (Broadcast) → ACK'],
    ['Discover', '<code>0.0.0.0:68</code> → <code>255.255.255.255:67</code>'],
    ['Automatisch', 'Adresse aus Pool, <b>unbegrenzte</b> Lease'],
    ['Dynamisch', 'Adresse aus Pool, <b>begrenzte</b> Lease'],
    ['Manuell', 'Reservierung: MAC → feste IP (im Server konfiguriert)'],
    ['Lease', 'T1 50 % Renewing (Unicast) · T2 87,5 % Rebinding (Broadcast) · 100 % Ablauf'],
    ['Weitere Nachrichten', 'NAK (Ablehnung) · DECLINE (Adresse belegt) · RELEASE (Rückgabe) · INFORM (nur Optionen)'],
    ['Optionen', '1 Maske · 3 Gateway · 6 DNS · 15 Domain · 51 Lease · 53 Typ · 54 Server-ID · 82 Relay-Info'],
    ['Relay', 'leitet Broadcast als Unicast weiter, Feld giaddr; Cisco <code>ip helper-address</code>'],
  ],

  cards: [
    ['DORA', 'Discover · Offer · Request · Acknowledge'],
    ['DHCP-Ports', 'UDP 67 Server · UDP 68 Client'],
    ['Quell- und Ziel-IP des DHCPDISCOVER', '0.0.0.0 → 255.255.255.255'],
    ['Automatische Zuweisung', 'Adresse aus dem Pool, dem Client <b>dauerhaft</b> zugeordnet (unbegrenzte Lease)'],
    ['Dynamische Zuweisung', 'Adresse aus dem Pool, <b>zeitlich begrenzt</b> verliehen (Lease)'],
    ['Manuelle Zuweisung', 'Admin reserviert im Server eine <b>feste IP für eine MAC-Adresse</b>'],
    ['T1 – wann und wie?', 'Nach 50 % der Lease: Unicast-Request an den eigenen Server (Renewing)'],
    ['T2 – wann und wie?', 'Nach 87,5 %: Broadcast-Request an alle Server (Rebinding)'],
    ['Warum ist der DHCPREQUEST ein Broadcast?', 'Damit alle Server erfahren, welches Angebot angenommen wurde'],
    ['DHCP-Relay-Agent', 'Leitet DHCP-Broadcasts als Unicast an einen Server in einem anderen Netz weiter (giaddr)'],
    ['DHCPDECLINE', 'Client meldet: angebotene IP ist bereits belegt (ARP-Prüfung)'],
    ['DHCPv6-Ablauf', 'SARR: Solicit · Advertise · Request · Reply (UDP 546/547)'],
  ],

  quiz: [
    { q: 'In welcher Reihenfolge läuft die DHCP-Adressvergabe ab?', a: ['Discover, Offer, Request, Acknowledge', 'Request, Offer, Discover, Acknowledge', 'Offer, Discover, Acknowledge, Request', 'Discover, Request, Offer, Acknowledge'], c: 0, e: 'Merkwort DORA.' },
    { q: 'Welche Ports verwendet DHCP?', a: ['Server UDP 67, Client UDP 68', 'Server TCP 67, Client TCP 68', 'Server UDP 68, Client UDP 67', 'UDP 53'], c: 0, e: '53 ist DNS. DHCP nutzt UDP, weil der Client noch keine IP für eine TCP-Verbindung hat.' },
    { q: 'Welche Quell-IP hat ein DHCPDISCOVER?', a: ['0.0.0.0', '255.255.255.255', '169.254.0.1', 'die IP des DHCP-Servers'], c: 0, e: 'Der Client hat noch keine Adresse.' },
    { q: 'Welche Ziel-IP hat ein DHCPDISCOVER?', a: ['255.255.255.255', '0.0.0.0', '224.0.0.1', 'die IP des DHCP-Servers'], c: 0, e: 'Der Client kennt den Server nicht → Broadcast.' },
    { q: 'Was bedeutet <b>manuelle Zuweisung</b> bei DHCP?', a: ['Der Admin reserviert im DHCP-Server eine feste IP für eine bestimmte MAC-Adresse', 'Der Client bekommt zufällig eine Adresse auf Zeit', 'Der Benutzer tippt die IP am PC ein, ohne DHCP', 'Die Adresse wird per APIPA gewählt'], c: 0, e: 'Typisch für Drucker und Server. Der Client bleibt DHCP-Client.' },
    { q: 'Was bedeutet <b>automatische Zuweisung</b> bei DHCP?', a: ['Der Server vergibt eine Adresse aus dem Pool, die dem Client dauerhaft zugeordnet bleibt', 'Die Adresse wird zeitlich begrenzt verliehen', 'Der Admin legt MAC → IP fest', 'Der Client nimmt eine Adresse aus 169.254.0.0/16'], c: 0, e: 'Wie dynamisch, aber mit unbegrenzter Lease.' },
    { q: 'Was unterscheidet die <b>dynamische</b> von der <b>automatischen</b> Zuweisung?', a: ['Bei dynamischer Zuweisung ist die Lease zeitlich begrenzt', 'Bei dynamischer Zuweisung legt der Admin die IP fest', 'Bei automatischer Zuweisung gibt es keinen Pool', 'Es gibt keinen Unterschied'], c: 0, e: 'Beide nehmen Adressen aus dem Pool – nur die Lease-Dauer unterscheidet sich.' },
    { q: 'Wann versucht ein Client erstmals, seine Lease zu verlängern?', a: ['Nach 50 % der Lease-Zeit (T1)', 'Nach 87,5 % (T2)', 'Nach 100 %', 'Nach 25 %'], c: 0, e: 'Unicast-DHCPREQUEST an den eigenen Server.' },
    { q: 'Was passiert bei 87,5 % der Lease-Zeit, wenn der eigene Server nicht geantwortet hat?', a: ['Rebinding: DHCPREQUEST als Broadcast an beliebige DHCP-Server', 'Renewing: Unicast an den eigenen Server', 'Die Lease endet sofort', 'Der Client wechselt auf APIPA'], c: 0, e: 'Jeder DHCP-Server, der die Lease bestätigen kann, darf antworten.' },
    { q: 'Warum wird der DHCPREQUEST als Broadcast gesendet?', a: ['Damit alle DHCP-Server erfahren, welches Angebot angenommen wurde', 'Weil der Server keine IP hat', 'Damit der Router ihn weiterleitet', 'Damit der DNS-Server informiert wird'], c: 0, e: 'Abgelehnte Server geben ihre Angebote wieder frei.' },
    { q: 'Der DHCP-Server steht in einem anderen Subnetz. Was wird benötigt?', a: ['Ein DHCP-Relay-Agent (z. B. ip helper-address am Router)', 'Nichts, Router leiten Broadcasts weiter', 'Eine statische Route', 'Ein DNS-Server'], c: 0, e: 'Router leiten keine Broadcasts weiter.' },
    { q: 'Welche Information verteilt DHCP <b>nicht</b>?', a: ['Die MAC-Adresse des Clients', 'Die Subnetzmaske', 'Das Standardgateway', 'Die DNS-Server'], c: 0, e: 'Die MAC hat der Client selbst – der Server nutzt sie zur Identifikation.' },
    { q: 'Was sendet ein Client, wenn die zugewiesene Adresse laut ARP schon belegt ist?', a: ['DHCPDECLINE', 'DHCPRELEASE', 'DHCPNAK', 'DHCPINFORM'], c: 0, e: 'NAK sendet der Server, nicht der Client.' },
    { q: 'Mit welchem Befehl fordert man unter Windows eine neue DHCP-Adresse an?', a: ['ipconfig /renew', 'ipconfig /flushdns', 'ping /renew', 'netstat -r'], c: 0, e: '/release gibt die Adresse zurück, /renew startet DORA.' },
    { q: 'Wie heißt der Ablauf bei DHCPv6?', a: ['Solicit, Advertise, Request, Reply', 'Discover, Offer, Request, Acknowledge', 'Router Solicitation, Router Advertisement', 'Neighbor Solicitation, Neighbor Advertisement'], c: 0, e: 'Merkwort SARR, Ports 546/547.' },
    { q: 'Welche DHCP-Option enthält das Standardgateway?', a: ['Option 3 (Router)', 'Option 6', 'Option 51', 'Option 1'], c: 0, e: '1 = Maske, 6 = DNS, 51 = Lease-Zeit.' },
  ],

  generators: [
    {
      name: 'Lease-Zeiten (T1/T2)',
      make() {
        const leases = [[8, 'Stunden'], [24, 'Stunden'], [12, 'Stunden'], [16, 'Stunden'], [8, 'Tage'], [4, 'Tage'], [2, 'Tage'], [48, 'Stunden']];
        const [v, unit] = pick(leases);
        const which = pick(['T1', 'T2']);
        const ans = which === 'T1' ? v * 0.5 : v * 0.875;
        return { type: 'input', q: `Die Lease-Dauer beträgt <b>${v} ${unit}</b>. Nach wie vielen ${unit} erreicht der Client <b>${which}</b> (${which === 'T1' ? 'Renewing' : 'Rebinding'})?`, accept: [String(ans)], norm: 'num', placeholder: 'Zahl, z. B. 4 oder 10,5', e: `${which} = ${which === 'T1' ? '50 %' : '87,5 %'} von ${v} = ${String(ans).replace('.', ',')} ${unit}.` };
      },
    },
    {
      name: 'DORA-Pakete zuordnen',
      make() {
        const items = [
          ['DHCPDISCOVER', '0.0.0.0:68 → 255.255.255.255:67', 'Client sucht einen Server'],
          ['DHCPOFFER', 'Server:67 → Client:68', 'Server bietet eine Adresse an'],
          ['DHCPREQUEST', '0.0.0.0:68 → 255.255.255.255:67', 'Client nimmt ein Angebot an'],
          ['DHCPACK', 'Server:67 → Client:68', 'Server bestätigt die Vergabe'],
        ];
        const i = rnd(4);
        const names = items.map(x => x[0]);
        return { q: `Welche Nachricht ist Schritt <b>${i + 1}</b> von DORA (${items[i][2].toLowerCase()})?`, a: [names[i], ...names.filter((_, j) => j !== i)], c: 0, e: `${items[i][0]}: ${items[i][1]}.` };
      },
    },
  ],

  games: {
    blitz: [
      () => {
        const v = pick([4, 6, 8, 10, 12, 16, 24, 48]), which = pick(['T1', 'T2']);
        const f = x => String(Math.round(x * 100) / 100).replace('.', ',') + ' h';
        const right = which === 'T1' ? v * .5 : v * .875;
        const wrong = [...new Set([which === 'T1' ? v * .875 : v * .5, v * .75, v * .25])].filter(x => x !== right).slice(0, 2);
        return { q: `Lease = <b>${v} Stunden</b>. Wann ist <b>${which}</b> (${which === 'T1' ? 'Renewing' : 'Rebinding'})?`, a: [right, ...wrong].map(f), e: `${which} = ${which === 'T1' ? '50 %' : '87,5 %'} der Lease = ${f(right)}.` };
      },
      () => pick([
        { q: 'Welchen Port nutzt der DHCP-Server?', a: ['UDP 67', 'UDP 68', 'TCP 53'], e: 'Server 67, Client 68.' },
        { q: 'Quell-IP des DHCPDISCOVER?', a: ['0.0.0.0', '255.255.255.255', '169.254.0.1'], e: 'Der Client hat noch keine Adresse.' },
        { q: 'Ziel-IP des DHCPDISCOVER?', a: ['255.255.255.255', '0.0.0.0', 'IP des Servers'], e: 'Broadcast – der Server ist unbekannt.' },
        { q: 'Client meldet: angebotene IP ist belegt', a: ['DHCPDECLINE', 'DHCPNAK', 'DHCPRELEASE'], e: 'NAK kommt vom Server.' },
        { q: 'DHCP über Router hinweg braucht …', a: ['Relay-Agent', 'NAT', 'APIPA'], e: 'z. B. ip helper-address.' },
        { q: 'DHCPv6-Ablauf?', a: ['SARR', 'DORA', 'RS/RA'], e: 'Solicit, Advertise, Request, Reply.' },
        { q: 'Welche Option ist das Gateway?', a: ['Option 3', 'Option 6', 'Option 51'], e: '1 Maske, 3 Router, 6 DNS, 51 Lease.' },
      ]),
    ],
    sort: [
      {
        name: 'Zuweisungsart', q: 'Welche DHCP-Zuweisungsart passt?', bins: ['🔄 Dynamisch', '♾️ Automatisch', '📌 Manuell'],
        items: [['Gäste-WLAN: Adresse für 1 Tag', 0, 'Begrenzte Lease aus dem Pool = dynamisch.'], ['Drucker bekommt immer 192.168.1.50 – per MAC festgelegt', 2, 'Reservierung MAC → IP = manuell.'], ['Freie Adresse aus dem Pool, für immer behalten', 1, 'Unbegrenzte Lease = automatisch.'], ['Lease läuft nach 8 Stunden ab', 0, 'Zeitlich begrenzt = dynamisch.'], ['Reservierung im DHCP-Server', 2, 'Admin legt die IP fest = manuell.'], ['Unbegrenzte Lease, IP vom Server gewählt', 1, 'Automatisch.'], ['Fileserver: MAC AA:BB:CC… → 192.168.1.10', 2, 'Feste Zuordnung = manuell.'], ['Büro-Laptop, Lease 8 Tage', 0, 'Dynamisch.'], ['Pool füllt sich mit Geräten, die nie wiederkommen', 1, 'Risiko der automatischen Zuweisung.']],
      },
      {
        name: 'Broadcast oder Unicast?', q: 'Wie wird die Nachricht gesendet?', bins: ['📢 Broadcast', '🎯 Unicast'],
        items: [['DHCPDISCOVER', 0, 'Client kennt den Server nicht.'], ['DHCPREQUEST beim ersten Bezug', 0, 'Damit alle Server erfahren, welches Angebot gewählt wurde.'], ['DHCPREQUEST bei T1 (50 %)', 1, 'Renewing: direkt an den eigenen Server.'], ['DHCPREQUEST bei T2 (87,5 %)', 0, 'Rebinding: an alle Server.'], ['Relay-Agent → DHCP-Server', 1, 'Der Relay macht aus dem Broadcast einen Unicast.'], ['DHCPRELEASE', 1, 'Client hat IP und kennt den Server.']],
      },
    ],
    seq: [
      { name: 'DORA', steps: ['DHCPDISCOVER (Client sucht Server)', 'DHCPOFFER (Server bietet IP an)', 'DHCPREQUEST (Client nimmt an)', 'DHCPACK (Server bestätigt)'] },
      { name: 'Lease-Lebenszyklus', steps: ['DORA – Adresse erhalten', 'Bound: Adresse nutzen', 'T1 (50 %): Request per Unicast', 'T2 (87,5 %): Request per Broadcast', 'Lease abgelaufen: Adresse aufgeben', 'Neuer DHCPDISCOVER'] },
    ],
    pairs: [['UDP 67', 'DHCP-Server'], ['UDP 68', 'DHCP-Client'], ['T1', '50 % der Lease'], ['T2', '87,5 % der Lease'], ['DHCPDECLINE', 'Adresse ist belegt'], ['DHCPNAK', 'Server lehnt ab'], ['ip helper-address', 'Relay-Agent'], ['Option 3', 'Standardgateway'], ['Option 6', 'DNS-Server'], ['Reservierung', 'manuelle Zuweisung']],
  },

  visuals: [
    {
      title: '🎬 DORA animiert',
      render(root) {
        UI.sequence(root, {
          intro: 'Ein neuer PC (MAC <code>00:1A:2B:3C:4D:5E</code>) wird eingeschaltet. Der DHCP-Server <code>192.168.1.1</code> hat den Pool <code>192.168.1.100–199</code>.',
          actors: [{ id: 'c', label: 'Client', icon: '💻' }, { id: 's', label: 'DHCP-Server', icon: '🗄️' }],
          steps: [
            { from: 'c', to: 's', label: 'DHCPDISCOVER', kind: 'bc', title: 'Discover – „Ist hier ein DHCP-Server?“', html: UI.pkt([['Quell-MAC', '00:1A:2B:3C:4D:5E'], ['Ziel-MAC', 'FF:FF:FF:FF:FF:FF (Broadcast)'], ['Quell-IP:Port', '0.0.0.0:68'], ['Ziel-IP:Port', '255.255.255.255:67'], ['Optionen', 'Typ 53 = Discover, 55 = gewünschte Parameter (Maske, Router, DNS)']]) + '<p class="muted">Der Client hat keine IP und kennt keinen Server → Broadcast.</p>' },
            { from: 's', to: 'c', label: 'DHCPOFFER', kind: 'bc', title: 'Offer – „Du kannst 192.168.1.100 haben“', html: UI.pkt([['Quell-IP:Port', '192.168.1.1:67'], ['Ziel-IP:Port', '255.255.255.255:68 (oder Unicast an die MAC)'], ['yiaddr (angeboten)', '192.168.1.100'], ['Maske (Opt. 1)', '255.255.255.0'], ['Gateway (Opt. 3)', '192.168.1.1'], ['DNS (Opt. 6)', '192.168.1.1'], ['Lease (Opt. 51)', '8 Stunden']]) + '<p class="muted">Der Server merkt sich die Adresse kurz als „angeboten“.</p>' },
            { from: 'c', to: 's', label: 'DHCPREQUEST', kind: 'bc', title: 'Request – „Ich nehme das Angebot von 192.168.1.1“', html: UI.pkt([['Quell-IP:Port', '0.0.0.0:68'], ['Ziel-IP:Port', '255.255.255.255:67'], ['Opt. 50 (Wunsch-IP)', '192.168.1.100'], ['Opt. 54 (Server-ID)', '192.168.1.1']]) + '<p>Weiterhin <b>Broadcast</b> – so erfahren auch andere DHCP-Server, dass ihr Angebot abgelehnt wurde.</p>' },
            { from: 's', to: 'c', label: 'DHCPACK', kind: 'bc', title: 'Acknowledge – „Abgemacht!“', html: UI.pkt([['Quell-IP:Port', '192.168.1.1:67'], ['Ziel-IP:Port', '255.255.255.255:68 (oder Unicast)'], ['yiaddr', '192.168.1.100'], ['Lease', '8 h → T1 = 4 h, T2 = 7 h']]) + '<p class="muted">Der Server trägt die Lease fest in seine Datenbank ein.</p>' },
            { from: 'c', to: 'c', label: 'ARP-Prüfung & fertig', title: 'Konfiguriert!', html: '<p>Der Client prüft per ARP, ob 192.168.1.100 wirklich frei ist, und konfiguriert sich dann:</p>' + UI.terminal(`C:\\> ipconfig /all
   DHCP aktiviert. . . . . . . . . . : Ja
   IPv4-Adresse  . . . . . . . . . . : <span class="ok">192.168.1.100</span>(Bevorzugt)
   Subnetzmaske  . . . . . . . . . . : 255.255.255.0
   Lease erhalten. . . . . . . . . . : Montag, 19. Oktober 2026 08:00:00
   Lease läuft ab. . . . . . . . . . : Montag, 19. Oktober 2026 16:00:00
   Standardgateway . . . . . . . . . : 192.168.1.1
   DHCP-Server . . . . . . . . . . . : 192.168.1.1
   DNS-Server  . . . . . . . . . . . : 192.168.1.1`) },
            { from: 'c', to: 's', label: 'nach 4 h (T1): DHCPREQUEST', kind: 'uc', title: 'Renewing bei 50 % – Unicast', html: UI.pkt([['Quell-IP', '192.168.1.100:68'], ['Ziel-IP', '192.168.1.1:67 (Unicast!)'], ['ciaddr', '192.168.1.100']]) + '<p>Jetzt hat der Client eine IP und kennt den Server → direkter Unicast.</p>' },
            { from: 's', to: 'c', label: 'DHCPACK – Lease erneuert', kind: 'uc', title: 'Lease verlängert', html: '<p>Die Lease beginnt von vorn (wieder 8 h). Antwortet der Server nicht, versucht es der Client bei <b>87,5 %</b> per Broadcast bei <b>allen</b> Servern (Rebinding).</p>' },
          ],
        });
      },
    },
    {
      title: '🏊 Zuweisungsarten-Simulator',
      render(root) {
        const NET = '192.168.1.';
        const POOL = Array.from({ length: 10 }, (_, i) => 100 + i);
        const RES = { 'AA:BB:CC:00:00:01': { ip: 50, name: '🖨️ Drucker' }, 'AA:BB:CC:00:00:02': { ip: 10, name: '🗄️ Fileserver' } };
        let mode = 'dyn', leases = {}, clients = [], day = 0, log = [];
        const reset = () => { leases = {}; clients = []; day = 0; log = []; };
        const randMac = () => Array.from({ length: 6 }, () => rnd(256).toString(16).padStart(2, '0')).join(':').toUpperCase();
        const names = ['💻 Laptop', '📱 Handy', '🖥️ PC', '📺 Smart-TV', '🎮 Konsole', '⌚ Watch'];
        root.innerHTML = `<div class="lab">
          <div class="row" style="margin:0" id="modes">
            <button class="btn" data-m="dyn">🔄 Dynamisch (Lease 2 Tage)</button>
            <button class="btn" data-m="auto">♾️ Automatisch (unbegrenzt)</button>
            <button class="btn" data-m="man">📌 Nur Manuell (Reservierungen)</button>
          </div>
          <div id="modeInfo" class="callout"></div>
          <div class="row" style="margin:0">
            <button class="btn primary" id="aNew">+ Neues Gerät verbindet sich</button>
            <button class="btn" id="aPrn">🖨️ Drucker verbindet sich</button>
            <button class="btn" id="aOff">🔌 Ein Gerät geht offline</button>
            <button class="btn" id="aDay">⏩ 1 Tag vorspulen</button>
            <span class="spacer"></span><span class="muted" id="dayOut"></span>
          </div>
          <div><b>Reservierungen</b> <span class="muted">(manuelle Zuweisung: MAC → IP)</span><div class="pool" style="margin-top:6px" id="resPool"></div></div>
          <div><b>Pool ${NET}100 – ${NET}109</b><div class="pool" style="margin-top:6px" id="pool"></div></div>
          <div class="log" id="log"></div></div>`;
        const info = {
          dyn: 'Adressen werden aus dem Pool <b>verliehen</b>. Ist ein Gerät länger als die Lease (2 Tage) weg, wird die Adresse wieder frei.',
          auto: 'Adressen kommen aus dem Pool, bleiben dem Gerät aber <b>für immer</b>. Der Pool kann sich mit Geräten füllen, die nie wiederkommen!',
          man: 'Der Server vergibt <b>nur</b> Adressen an Geräte, deren MAC reserviert ist. Unbekannte Geräte bekommen nichts (→ APIPA).',
        };
        const L = m => { log.unshift(`[Tag ${day}] ${m}`); };
        function connect(mac, name) {
          let c = clients.find(x => x.mac === mac);
          if (!c) { c = { mac, name, online: true, ip: null }; clients.push(c); } else c.online = true;
          if (RES[mac]) { c.ip = RES[mac].ip; c.res = true; L(`${name} (${mac}) → DORA → Reservierung gefunden → <b>${NET}${c.ip}</b> (immer dieselbe)`); return; }
          if (mode === 'man') { c.ip = null; L(`${name} (${mac}) → DORA → <b style="color:var(--bad)">keine Reservierung, kein Angebot</b> → Gerät nutzt APIPA 169.254.x.x`); return; }
          const own = Object.entries(leases).find(([, l]) => l.mac === mac);
          if (own) { own[1].exp = mode === 'dyn' ? day + 2 : Infinity; c.ip = +own[0]; L(`${name} bekommt seine alte Adresse <b>${NET}${own[0]}</b> zurück`); return; }
          const free = POOL.find(ip => !leases[ip]);
          if (free === undefined) { c.ip = null; L(`${name} → <b style="color:var(--bad)">Pool erschöpft!</b> Kein DHCPOFFER → APIPA`); return; }
          leases[free] = { mac, name, exp: mode === 'dyn' ? day + 2 : Infinity };
          c.ip = free;
          L(`${name} (${mac}) → DORA → <b>${NET}${free}</b>${mode === 'dyn' ? ', Lease bis Tag ' + (day + 2) : ', unbegrenzt'}`);
        }
        function draw() {
          $$('[data-m]', root).forEach(b => b.classList.toggle('on', b.dataset.m === mode));
          $('#modeInfo', root).innerHTML = info[mode];
          $('#dayOut', root).textContent = `Tag ${day}`;
          $('#resPool', root).innerHTML = Object.entries(RES).map(([mac, r]) => { const c = clients.find(x => x.mac === mac); return `<div class="slot res ${c && !c.online ? 'offline' : ''}"><b>${NET}${r.ip}</b>${r.name}<br><span class="muted">${mac}</span><br>${c ? (c.online ? '🟢 online' : '⚪ offline') : '– noch nicht verbunden'}</div>`; }).join('');
          $('#pool', root).innerHTML = POOL.map(ip => { const l = leases[ip]; if (!l) return `<div class="slot"><b>${NET}${ip}</b><span class="muted">frei</span></div>`; const c = clients.find(x => x.mac === l.mac); return `<div class="slot used ${c && !c.online ? 'offline' : ''}"><b>${NET}${ip}</b>${l.name}<br><span class="muted">${l.exp === Infinity ? '♾️ unbegrenzt' : 'bis Tag ' + l.exp}</span><br>${c && c.online ? '🟢 online' : '⚪ offline'}</div>`; }).join('');
          $('#log', root).innerHTML = log.slice(0, 30).map(x => `<div>${x}</div>`).join('') || '<div class="muted">Klicke auf „Neues Gerät verbindet sich“ …</div>';
        }
        $$('[data-m]', root).forEach(b => b.onclick = () => { mode = b.dataset.m; reset(); L(`Modus gewechselt: ${b.textContent.trim()} – alles zurückgesetzt`); draw(); });
        $('#aNew', root).onclick = () => { connect(randMac(), pick(names)); draw(); };
        $('#aPrn', root).onclick = () => { connect('AA:BB:CC:00:00:01', '🖨️ Drucker'); draw(); };
        $('#aOff', root).onclick = () => { const on = clients.filter(c => c.online && c.ip !== null); if (!on.length) { L('Kein Gerät online.'); return draw(); } const c = pick(on); c.online = false; L(`${c.name} geht offline (Adresse ${NET}${c.ip} bleibt vorerst reserviert)`); draw(); };
        $('#aDay', root).onclick = () => {
          day++;
          clients.filter(c => c.online && !c.res && c.ip !== null && leases[c.ip]).forEach(c => { if (leases[c.ip].exp !== Infinity) leases[c.ip].exp = day + 2; });
          Object.entries(leases).forEach(([ip, l]) => { if (l.exp <= day) { L(`Lease von ${l.name} für ${NET}${ip} <b>abgelaufen</b> → Adresse wieder frei`); delete leases[ip]; const c = clients.find(x => x.mac === l.mac); if (c) c.ip = null; } });
          if (clients.some(c => c.online && !c.res && c.ip !== null) && mode === 'dyn') L('Online-Geräte verlängern ihre Lease automatisch (T1 bei 50 %).');
          draw();
        };
        draw();
      },
    },
    {
      title: '⏱️ Lease-Zeitstrahl',
      render(root) {
        root.innerHTML = `<div class="lab">
          <label class="field" style="max-width:320px"><span>Lease-Dauer (Stunden)</span><input type="number" id="lsH" value="8" min="1"></label>
          <div class="timeline"><div class="tl-bound">Bound</div><div class="tl-renew">Renewing</div><div class="tl-rebind">Rebind</div><div class="tl-cursor" id="lsCur"></div></div>
          <div class="tl-marks" id="lsMarks"></div>
          <label class="field"><span>Zeit seit Lease-Beginn – schieb mich!</span><input type="range" id="lsT" min="0" max="1000" value="200"></label>
          <div id="lsOut"></div></div>`;
        const h = $('#lsH', root), t = $('#lsT', root), out = $('#lsOut', root);
        const f = x => (Math.round(x * 100) / 100).toLocaleString('de-DE');
        const upd = () => {
          const H = Math.max(1, +h.value || 8), p = +t.value / 10, now = H * p / 100;
          $('#lsCur', root).style.left = `calc(${p}% - 2px)`;
          $('#lsMarks', root).innerHTML = `<span style="left:0%;transform:none">0 h</span><span style="left:50%">T1 = ${f(H * .5)} h</span><span style="left:87.5%">T2 = ${f(H * .875)} h</span><span style="left:100%;transform:translateX(-100%)">${f(H)} h</span>`;
          let s;
          if (p < 50) s = ['🟢 Bound', 'Alles gut. Der Client nutzt seine Adresse, es wird nichts gesendet.'];
          else if (p < 87.5) s = ['🟡 Renewing (ab T1 = 50 %)', 'Client sendet <b>DHCPREQUEST per Unicast an seinen Server</b>. Antwortet dieser mit DHCPACK, beginnt die Lease neu.'];
          else if (p < 100) s = ['🔴 Rebinding (ab T2 = 87,5 %)', 'Der eigene Server hat nicht geantwortet. Client sendet <b>DHCPREQUEST per Broadcast</b> – jeder DHCP-Server darf die Lease bestätigen.'];
          else s = ['⚫ Lease abgelaufen', 'Client muss die IP sofort aufgeben und mit <b>DHCPDISCOVER</b> neu anfangen. Antwortet niemand → APIPA.'];
          out.innerHTML = `<div class="result-box"><h3>${s[0]}</h3><p style="margin:0">Zeitpunkt: <b>${f(now)} h</b> von ${f(H)} h (${f(p)} %). ${s[1]}</p></div>`;
        };
        h.oninput = upd; t.oninput = upd; upd();
      },
    },
  ],
});
