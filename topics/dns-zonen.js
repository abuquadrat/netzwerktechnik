registerTopic({
  id: 'dns-zonen',
  title: 'DNS – Zonen & Records',
  subtitle: 'Forward- und Reverse-Lookupzone, Resource Records',
  category: 'Namensauflösung',
  icon: '🔁',
  color: '#22d3ee',

  levels: {
    1: `
      <h2>Zwei Richtungen</h2>
      <div class="analogy"><div class="big">📇</div><div>
        <b>Forward-Lookup</b>: „Wie ist die Telefonnummer von <b>Max</b>?“ → Name rein, Nummer raus.<br>
        <b>Reverse-Lookup</b>: „<b>Wem gehört</b> die Nummer 0151-123456?“ → Nummer rein, Name raus.</div></div>
      <table class="tbl">
        <tr><th></th><th>Forward-Lookupzone</th><th>Reverse-Lookupzone</th></tr>
        <tr><td>Frage</td><td>Name → IP</td><td>IP → Name</td></tr>
        <tr><td>Beispiel</td><td><code>www.firma.local</code> → <code>192.168.1.20</code></td><td><code>192.168.1.20</code> → <code>www.firma.local</code></td></tr>
        <tr><td>Wichtigster Eintrag</td><td><b>A</b> (IPv4) / <b>AAAA</b> (IPv6)</td><td><b>PTR</b> (Pointer)</td></tr>
      </table>
      <h2>Was ist eine Zone?</h2>
      <p>Eine Zone ist die <b>Liste</b>, die ein DNS-Server für einen Bereich führt – wie eine Seite im Telefonbuch. Jede Zeile ist ein <b>Resource Record</b> (Eintrag).</p>
      <div class="analogy"><div class="big">🔄</div><div>
        Der Trick beim Reverse-Lookup: Die IP-Adresse wird <b>rückwärts</b> geschrieben, weil DNS-Namen von rechts nach links immer genauer werden, IP-Adressen aber von links nach rechts.
        Aus <code>192.168.1.20</code> wird <code>20.1.168.192.in-addr.arpa</code>.</div></div>`,

    2: `
      <h2>Forward-Lookupzone</h2>
      <p>Enthält die Zuordnung <b>Name → IP-Adresse</b> und weitere Infos zur Domain. Name der Zone = Domainname, z. B. <code>firma.local</code>.</p>
      <h3>Die wichtigsten Resource Records</h3>
      <div class="tbl-wrap"><table class="tbl">
        <tr><th>Typ</th><th>Bedeutung</th><th>Beispiel</th></tr>
        <tr><td><b>A</b></td><td>Name → IPv4-Adresse</td><td><code>www IN A 192.168.1.20</code></td></tr>
        <tr><td><b>AAAA</b></td><td>Name → IPv6-Adresse („Quad-A“)</td><td><code>www IN AAAA 2001:db8:1::20</code></td></tr>
        <tr><td><b>CNAME</b></td><td>Alias – verweist auf einen anderen Namen</td><td><code>intranet IN CNAME www.firma.local.</code></td></tr>
        <tr><td><b>MX</b></td><td>Mailserver der Domain (mit Priorität, kleiner = bevorzugt)</td><td><code>@ IN MX 10 mail.firma.local.</code></td></tr>
        <tr><td><b>NS</b></td><td>Zuständiger Nameserver der Zone</td><td><code>@ IN NS ns1.firma.local.</code></td></tr>
        <tr><td><b>SOA</b></td><td>Start of Authority – Kopf der Zone (Primary-Server, Admin, Seriennummer, Timer)</td><td>genau einer pro Zone</td></tr>
        <tr><td><b>PTR</b></td><td>IP → Name (nur in Reverse-Zonen)</td><td><code>20 IN PTR www.firma.local.</code></td></tr>
        <tr><td><b>TXT</b></td><td>Freitext, z. B. SPF, Domain-Verifizierung</td><td><code>@ IN TXT "v=spf1 mx -all"</code></td></tr>
        <tr><td><b>SRV</b></td><td>Dienst + Port + Host (z. B. Active Directory, SIP)</td><td><code>_ldap._tcp IN SRV 0 100 389 dc1</code></td></tr>
      </table></div>
      <p><code>@</code> steht für den Zonennamen selbst. Namen <b>ohne</b> Punkt am Ende werden um den Zonennamen ergänzt, Namen <b>mit</b> Punkt sind absolut (FQDN).</p>

      <h2>Reverse-Lookupzone</h2>
      <p>Enthält die Zuordnung <b>IP-Adresse → Name</b> über <b>PTR-Records</b>. Sie liegt unter der speziellen Domain <code>in-addr.arpa</code> (IPv4) bzw. <code>ip6.arpa</code> (IPv6).</p>
      <h3>Zonennamen bilden (IPv4)</h3>
      <ol>
        <li>Netzanteil nehmen: <code>192.168.1.0/24</code> → <code>192.168.1</code></li>
        <li><b>Oktette umdrehen</b>: <code>1.168.192</code></li>
        <li><code>.in-addr.arpa</code> anhängen: <b><code>1.168.192.in-addr.arpa</code></b></li>
      </ol>
      <p>PTR-Eintrag für den Host <code>192.168.1.20</code> in dieser Zone: <code>20 IN PTR www.firma.local.</code> – vollständiger Name: <code>20.1.168.192.in-addr.arpa</code>.</p>
      <table class="tbl">
        <tr><th>Netz</th><th>Reverse-Zone</th></tr>
        <tr><td>192.168.1.0/24</td><td><code>1.168.192.in-addr.arpa</code></td></tr>
        <tr><td>172.16.0.0/16</td><td><code>16.172.in-addr.arpa</code></td></tr>
        <tr><td>10.0.0.0/8</td><td><code>10.in-addr.arpa</code></td></tr>
      </table>
      <div class="callout warn">Die häufigste Falle: <code>192.168.1.in-addr.arpa</code> ist <b>falsch</b> – die Oktette müssen <b>rückwärts</b> stehen!</div>
      <h3>Wozu Reverse-Lookup?</h3>
      <ul>
        <li><b>Mailserver</b> prüfen, ob die IP eines sendenden Servers einen passenden Namen hat (Spam-Schutz).</li>
        <li><b>Logs und Tools</b> (Firewall, <code>tracert</code>, <code>netstat</code>) zeigen Namen statt nackter IPs.</li>
        <li>Fehlersuche: <code>nslookup 192.168.1.20</code> zeigt, wer hinter einer IP steckt.</li>
      </ul>

      <h2>Zonentypen (Windows-Server)</h2>
      <table class="tbl">
        <tr><th>Typ</th><th>Beschreibung</th></tr>
        <tr><td><b>Primäre Zone</b></td><td>Originalkopie, <b>lesen und schreiben</b>. Hier werden Einträge gepflegt.</td></tr>
        <tr><td><b>Sekundäre Zone</b></td><td><b>schreibgeschützte Kopie</b>, wird per <b>Zonentransfer</b> vom Primary geholt – Lastverteilung & Ausfallsicherheit.</td></tr>
        <tr><td><b>Stubzone</b></td><td>enthält nur SOA, NS und Glue – weiß, wer zuständig ist.</td></tr>
        <tr><td><b>AD-integriert</b></td><td>Zone im Active Directory gespeichert, Replikation über AD, sichere dynamische Updates.</td></tr>
      </table>
      <div class="callout exam">Zonentransfer: <b>AXFR</b> = vollständig, <b>IXFR</b> = nur Änderungen, über <b>TCP 53</b>. Der Secondary erkennt Änderungen an der höheren <b>Seriennummer</b> im SOA.</div>`,

    3: `
      <h2>Zonendatei im Detail (BIND-Format)</h2>
      ${UI.terminal(`$ORIGIN firma.local.
$TTL 3600
@   IN SOA ns1.firma.local. hostmaster.firma.local. (
        2026101901 ; Serial  (JJJJMMTTnn)
        3600       ; Refresh – so oft fragt der Secondary nach
        900        ; Retry   – bei Fehler erneut nach
        1209600    ; Expire  – danach verwirft der Secondary die Zone
        300 )      ; Minimum – TTL für negative Antworten (NXDOMAIN)`, 'firma.local.zone')}
      <ul>
        <li>Die zweite Angabe im SOA (<code>hostmaster.firma.local.</code>) ist eine <b>E-Mail-Adresse</b> – der erste Punkt steht für das @.</li>
        <li><b>Serial erhöhen</b> nicht vergessen, sonst bemerken Secondaries die Änderung nicht.</li>
      </ul>
      <h3>IPv6-Reverse (ip6.arpa)</h3>
      <p>Bei IPv6 wird <b>jede Hex-Ziffer (Nibble)</b> einzeln umgedreht und mit Punkten getrennt. Für <code>2001:db8::1</code>:</p>
      <p><code style="white-space:normal;word-break:break-all">1.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa</code></p>
      <p>Zone für <code>2001:db8:1:1::/64</code>: <code>1.0.0.0.1.0.0.0.8.b.d.0.1.0.0.2.ip6.arpa</code> (16 Nibbles = 64 Bit).</p>
      <h3>Classless Reverse Delegation (RFC 2317)</h3>
      <p>Hat ein Kunde nur ein /27 (z. B. 203.0.113.32/27), kann der Provider ihm nicht die ganze /24-Reverse-Zone geben. Lösung: CNAMEs in der Provider-Zone, die auf eine Unterzone wie <code>32/27.113.0.203.in-addr.arpa</code> verweisen.</p>
      <h3>Dynamisches DNS (DDNS)</h3>
      <p>Clients oder der DHCP-Server tragen A- und PTR-Records <b>automatisch</b> ein, sobald eine Adresse vergeben wird. Im Active Directory Standard – mit <b>sicheren Updates</b> nur für Domänenmitglieder.</p>
      <h3>Regeln & Stolpersteine</h3>
      <ul>
        <li>Ein <b>CNAME</b> darf nicht neben anderen Records gleichen Namens stehen – deshalb kein CNAME an der Zonenspitze (<code>@</code>).</li>
        <li>MX und NS sollen auf <b>A/AAAA-Namen</b> zeigen, nicht auf CNAMEs.</li>
        <li><b>FCrDNS</b> (Forward-confirmed reverse DNS): PTR zeigt auf einen Namen, dessen A-Record wieder auf dieselbe IP zeigt – wichtig für Mailserver.</li>
        <li>Fehlender Punkt am Ende: <code>www.firma.local</code> (ohne Punkt) in der Zone firma.local wird zu <code>www.firma.local.firma.local.</code></li>
      </ul>
      <h3>Werkzeuge</h3>
      ${UI.terminal(`C:\\> nslookup -type=MX firma.local
C:\\> nslookup -type=SOA firma.local
C:\\> nslookup 192.168.1.20          <span class="hl">← Reverse-Lookup (PTR)</span>
$ dig -x 192.168.1.20               <span class="hl">← Linux: Reverse-Lookup</span>
$ dig firma.local AXFR @ns1         <span class="hl">← Zonentransfer anfordern</span>`)}`,
  },

  merke: [
    'Forward = Name → IP (A, AAAA) · Reverse = IP → Name (PTR).',
    'Reverse-Zone: Netz-Oktette umdrehen + .in-addr.arpa → 1.168.192.in-addr.arpa.',
    'IPv6-Reverse: jede Hex-Ziffer einzeln rückwärts + .ip6.arpa.',
    'SOA = Kopf der Zone, NS = Nameserver, MX = Mail, CNAME = Alias.',
    'Primäre Zone = schreibbar, sekundäre Zone = Kopie per Zonentransfer (AXFR/IXFR, TCP 53).',
    'Seriennummer im SOA erhöhen, damit Secondaries die Änderung holen.',
  ],

  cheat: [
    ['Forward-Lookupzone', 'Name → IP · Records A, AAAA, CNAME, MX, NS, SOA, TXT, SRV'],
    ['Reverse-Lookupzone', 'IP → Name · PTR-Records · <code>in-addr.arpa</code> / <code>ip6.arpa</code>'],
    ['Reverse-Zonenname', '192.168.1.0/24 → <code>1.168.192.in-addr.arpa</code>'],
    ['PTR-Name', '192.168.1.20 → <code>20.1.168.192.in-addr.arpa</code>'],
    ['A / AAAA', 'IPv4 / IPv6-Adresse'],
    ['CNAME', 'Alias auf anderen Namen (nicht an der Zonenspitze)'],
    ['MX', 'Mailserver mit Priorität (kleiner = bevorzugt)'],
    ['SOA', 'Primary-NS, Admin-Mail, Serial, Refresh, Retry, Expire, Minimum-TTL'],
    ['Zonentypen', 'Primär (rw) · Sekundär (ro, Zonentransfer) · Stub · AD-integriert'],
    ['Zonentransfer', 'AXFR (komplett) · IXFR (inkrementell) · TCP 53'],
  ],

  cards: [
    ['Forward-Lookupzone', 'Löst Namen in IP-Adressen auf (A, AAAA)'],
    ['Reverse-Lookupzone', 'Löst IP-Adressen in Namen auf (PTR)'],
    ['A-Record vs. AAAA-Record', 'A = IPv4-Adresse · AAAA = IPv6-Adresse'],
    ['PTR-Record', 'Pointer: IP → Name, steht in der Reverse-Zone'],
    ['Reverse-Zone für 192.168.1.0/24', '<code>1.168.192.in-addr.arpa</code>'],
    ['CNAME', 'Alias – verweist auf einen anderen Namen'],
    ['MX-Record', 'Mailserver der Domain, mit Priorität (kleiner Wert = bevorzugt)'],
    ['SOA-Record', 'Start of Authority: Primary-Server, Verantwortlicher, Seriennummer, Timer'],
    ['NS-Record', 'Gibt die zuständigen Nameserver der Zone an'],
    ['Primäre vs. sekundäre Zone', 'Primär = schreibbare Originalkopie · Sekundär = schreibgeschützte Kopie per Zonentransfer'],
    ['AXFR vs. IXFR', 'Vollständiger vs. inkrementeller Zonentransfer (TCP 53)'],
    ['Domain für IPv6-Reverse', '<code>ip6.arpa</code> – jede Hex-Ziffer einzeln rückwärts'],
  ],

  quiz: [
    { q: 'Was macht eine <b>Forward-Lookupzone</b>?', a: ['Name → IP-Adresse', 'IP-Adresse → Name', 'MAC → IP', 'IP → MAC'], c: 0 },
    { q: 'Was macht eine <b>Reverse-Lookupzone</b>?', a: ['IP-Adresse → Name (PTR)', 'Name → IP-Adresse', 'Name → Mailserver', 'IP → MAC'], c: 0 },
    { q: 'Welcher Record-Typ ordnet einem Namen eine <b>IPv6</b>-Adresse zu?', a: ['AAAA', 'A', 'PTR', 'A6v'], c: 0, e: 'A = IPv4, AAAA = IPv6 (viermal so lang).' },
    { q: 'Welcher Record-Typ steht in einer Reverse-Lookupzone?', a: ['PTR', 'A', 'CNAME', 'MX'], c: 0 },
    { q: 'Wie heißt die Reverse-Lookupzone für <code>192.168.1.0/24</code>?', a: ['1.168.192.in-addr.arpa', '192.168.1.in-addr.arpa', '0.1.168.192.in-addr.arpa', '192.168.1.0.arpa'], c: 0, e: 'Netzanteil rückwärts + .in-addr.arpa.' },
    { q: 'Wie heißt die Reverse-Zone für <code>172.16.0.0/16</code>?', a: ['16.172.in-addr.arpa', '172.16.in-addr.arpa', '0.0.16.172.in-addr.arpa', '172.16.0.0.in-addr.arpa'], c: 0 },
    { q: 'Welcher Record gibt den Mailserver einer Domain an?', a: ['MX', 'MS', 'PTR', 'SRV'], c: 0 },
    { q: 'Welcher Record ist ein Alias auf einen anderen Namen?', a: ['CNAME', 'A', 'PTR', 'NS'], c: 0 },
    { q: 'Welcher Record enthält Seriennummer, Refresh-, Retry- und Expire-Zeit der Zone?', a: ['SOA', 'NS', 'TXT', 'SRV'], c: 0, e: 'Start of Authority – genau einer pro Zone.' },
    { q: 'Welcher Record gibt die zuständigen Nameserver einer Zone an?', a: ['NS', 'SOA', 'MX', 'PTR'], c: 0 },
    { q: 'Unter welcher Domain liegen IPv6-Reverse-Einträge?', a: ['ip6.arpa', 'in-addr.arpa', 'ipv6.arpa', 'in6.arpa'], c: 0 },
    { q: 'Was ist eine <b>sekundäre Zone</b>?', a: ['Eine schreibgeschützte Kopie, die per Zonentransfer vom Primary aktualisiert wird', 'Die Hauptzone mit Schreibrechten', 'Eine Reverse-Zone', 'Der DNS-Cache des Clients'], c: 0 },
    { q: 'Wie heißen die Arten des Zonentransfers?', a: ['AXFR (vollständig) und IXFR (inkrementell)', 'DORA und SARR', 'RS und RA', 'ARP und RARP'], c: 0, e: 'Läuft über TCP Port 53.' },
    { q: '<code>nslookup 8.8.8.8</code> führt welche Abfrage aus?', a: ['Reverse-Lookup (PTR)', 'Forward-Lookup (A)', 'Zonentransfer', 'MX-Abfrage'], c: 0, e: 'Gibt man eine IP ein, fragt nslookup den PTR-Record ab.' },
    { q: 'Wofür nutzt man Reverse-Lookups in der Praxis?', a: ['Logs lesbar machen, Mailserver-Prüfung (Spam), Fehlersuche', 'Webseiten schneller laden', 'IP-Adressen vergeben', 'Verbindungen verschlüsseln'], c: 0 },
    { q: 'Warum muss man nach einer Änderung die Seriennummer im SOA erhöhen?', a: ['Damit sekundäre Server erkennen, dass sich die Zone geändert hat', 'Damit die TTL zurückgesetzt wird', 'Damit DHCP informiert wird', 'Das ist nicht nötig'], c: 0 },
    { q: 'Ein MX-Record hat Priorität 10, ein anderer 20. Welcher wird bevorzugt?', a: ['10 – kleinerer Wert = höhere Priorität', '20 – größerer Wert = höhere Priorität', 'Beide gleich, zufällig', 'Der zuerst eingetragene'], c: 0 },
    { type: 'input', q: 'Wie lautet der vollständige PTR-Name für <code>10.0.5.33</code>?', accept: ['33.5.0.10.in-addr.arpa'], norm: 'dns', placeholder: '….in-addr.arpa', e: 'Alle vier Oktette rückwärts + .in-addr.arpa.' },
  ],

  generators: [
    {
      name: 'PTR-Namen bilden',
      make() {
        const ip = [pick([192, 10, 172, 203]), rnd(256), rnd(256), 1 + rnd(254)];
        if (ip[0] === 192) ip[1] = 168;
        if (ip[0] === 172) ip[1] = 16 + rnd(16);
        const ans = [...ip].reverse().join('.') + '.in-addr.arpa';
        return { type: 'input', q: `Wie lautet der PTR-Name (Reverse-Lookup) für <code>${ip.join('.')}</code>?`, accept: [ans], norm: 'dns', placeholder: '….in-addr.arpa', e: `Oktette rückwärts: <code>${ans}</code>` };
      },
    },
    {
      name: 'Reverse-Zone benennen',
      make() {
        const pfx = pick([8, 16, 24, 24, 24]);
        const ip = [pick([192, 10, 172]), rnd(256), rnd(256), 0];
        if (ip[0] === 192) ip[1] = 168;
        if (ip[0] === 172) ip[1] = 16 + rnd(16);
        if (pfx <= 16) ip[2] = 0;
        if (pfx === 8) { ip[0] = 10; ip[1] = 0; }
        const net = ip.slice(0, pfx / 8);
        const ans = [...net].reverse().join('.') + '.in-addr.arpa';
        return { type: 'input', q: `Wie heißt die Reverse-Lookupzone für das Netz <code>${ip.join('.')}/${pfx}</code>?`, accept: [ans], norm: 'dns', placeholder: '….in-addr.arpa', e: `Netzanteil (${net.join('.')}) rückwärts + .in-addr.arpa → <code>${ans}</code>` };
      },
    },
    {
      name: 'Record-Typen',
      make() {
        const R = [
          ['A', 'einem Namen eine IPv4-Adresse zuordnen'], ['AAAA', 'einem Namen eine IPv6-Adresse zuordnen'], ['PTR', 'einer IP-Adresse einen Namen zuordnen'],
          ['MX', 'den Mailserver einer Domain festlegen'], ['CNAME', 'einen Alias für einen anderen Namen anlegen'], ['NS', 'die zuständigen Nameserver einer Zone angeben'],
          ['SOA', 'Seriennummer und Timer der Zone festlegen'], ['SRV', 'einen Dienst mit Port angeben (z. B. LDAP im AD)'], ['TXT', 'einen SPF-Eintrag hinterlegen'],
        ];
        const i = rnd(R.length);
        const wrong = shuffle(R.filter((_, j) => j !== i)).slice(0, 3).map(x => x[0]);
        return { q: `Welchen Record-Typ benötigst du, um ${R[i][1]}?`, a: [R[i][0], ...wrong], c: 0, e: `${R[i][0]}-Record.` };
      },
    },
  ],

  games: {
    blitz: [
      () => {
        const ip = [pick([192, 10, 172]), rnd(256), rnd(256), 1 + rnd(254)];
        if (ip[0] === 192) ip[1] = 168;
        if (ip[0] === 172) ip[1] = 16 + rnd(16);
        const r = [...ip].reverse();
        return { q: `PTR-Name für <code>${ip.join('.')}</code>?`, a: [r.join('.') + '.in-addr.arpa', ip.join('.') + '.in-addr.arpa', r.slice(1).join('.') + '.in-addr.arpa'], e: 'Alle vier Oktette rückwärts + .in-addr.arpa. Ohne das Host-Oktett wäre es nur der Zonenname.' };
      },
      () => {
        const n = [pick([192, 10, 172]), rnd(256), rnd(256)];
        if (n[0] === 192) n[1] = 168;
        if (n[0] === 172) n[1] = 16 + rnd(16);
        return { q: `Reverse-Zone für <code>${n.join('.')}.0/24</code>?`, a: [[...n].reverse().join('.') + '.in-addr.arpa', n.join('.') + '.in-addr.arpa', '0.' + [...n].reverse().join('.') + '.in-addr.arpa'], e: 'Netzanteil rückwärts + .in-addr.arpa.' };
      },
    ],
    sort: [
      {
        name: 'Forward oder Reverse?', q: 'Forward- oder Reverse-Lookupzone?', bins: ['➡️ Forward (Name → IP)', '🔁 Reverse (IP → Name)'],
        items: [['A-Record', 0], ['PTR-Record', 1], ['1.168.192.in-addr.arpa', 1, 'in-addr.arpa = Reverse-Zone.'], ['firma.local', 0, 'Domainname = Forward-Zone.'], ['nslookup www.firma.de', 0, 'Name gesucht → Forward.'], ['nslookup 8.8.8.8', 1, 'IP eingegeben → PTR-Abfrage.'], ['AAAA-Record', 0], ['… .ip6.arpa', 1, 'IPv6-Reverse.'], ['MX-Record', 0], ['20 IN PTR www.firma.local.', 1], ['www IN A 192.168.1.20', 0], ['Mailserver prüft, ob die IP einen Namen hat', 1, 'Reverse-Lookup gegen Spam.']],
      },
      {
        name: 'Welcher Record?', q: 'Welcher Record-Typ passt?', bins: ['A / AAAA', 'PTR', 'MX', 'CNAME'],
        items: [['Name → IPv4-Adresse', 0], ['Name → IPv6-Adresse', 0, 'AAAA.'], ['IP → Name', 1], ['Mailserver der Domain', 2], ['Alias auf einen anderen Namen', 3], ['intranet → www.firma.local.', 3, 'Ein Name zeigt auf einen anderen Namen = CNAME.'], ['@ IN MX 10 mail.firma.local.', 2], ['20.1.168.192.in-addr.arpa', 1], ['Spam-Check: passt der Name zur IP?', 1], ['www → 2001:db8::20', 0, 'AAAA-Record.']],
      },
    ],
    seq: [
      { name: 'Reverse-Zone anlegen (192.168.1.0/24)', steps: ['Netzanteil bestimmen: 192.168.1', 'Oktette umdrehen: 1.168.192', '.in-addr.arpa anhängen', 'PTR-Records eintragen: 20 → www.firma.local.'] },
      { name: 'Änderung an einer Zone', steps: ['Record in der primären Zone ändern', 'Seriennummer im SOA erhöhen', 'Secondary fragt nach (Refresh)', 'Höhere Serial erkannt', 'Zonentransfer (IXFR/AXFR, TCP 53)'] },
    ],
    pairs: [['A', 'IPv4-Adresse'], ['AAAA', 'IPv6-Adresse'], ['PTR', 'IP → Name'], ['MX', 'Mailserver'], ['CNAME', 'Alias'], ['SOA', 'Zonenkopf'], ['NS', 'Nameserver'], ['AXFR', 'kompletter Transfer'], ['IXFR', 'nur Änderungen'], ['in-addr.arpa', 'IPv4-Reverse']],
  },

  visuals: [
    {
      title: '🔁 Forward vs. Reverse',
      render(root) {
        const ZONE = { 'www.firma.local': '192.168.1.20', 'mail.firma.local': '192.168.1.25', 'ns1.firma.local': '192.168.1.2', 'pc10.firma.local': '192.168.1.10', 'drucker.firma.local': '192.168.1.50' };
        const REV = Object.fromEntries(Object.entries(ZONE).map(([n, ip]) => [ip, n]));
        root.innerHTML = `<div class="lab">
          <label class="field"><span>Namen <b>oder</b> IP-Adresse eingeben</span><input id="frIn" value="www.firma.local" spellcheck="false"></label>
          <div class="ex-btns">${['www.firma.local', '192.168.1.20', 'mail.firma.local', '192.168.1.50', '2001:db8::1', 'gibtsnicht.firma.local'].map(e => `<button class="btn sm" data-ex="${e}">${e}</button>`).join('')}</div>
          <div id="frOut"></div></div>`;
        const inp = $('#frIn', root), out = $('#frOut', root);
        const upd = () => {
          const v = inp.value.trim().toLowerCase().replace(/\.$/, '');
          const v4 = v.split('.');
          let html;
          if (v4.length === 4 && v4.every(x => /^\d{1,3}$/.test(x) && +x < 256)) {
            const rev = [...v4].reverse();
            const name = REV[v];
            html = `<div class="result-box"><h3>🔁 Reverse-Lookup (IP → Name)</h3>
              <ol class="steps">
                <li><b>IP-Adresse</b><code>${v}</code></li>
                <li><b>Oktette umdrehen</b><code>${rev.join('.')}</code></li>
                <li><b>.in-addr.arpa anhängen → Abfrage nach PTR</b><code>${rev.join('.')}.in-addr.arpa</code></li>
                <li><b>Zuständige Zone (bei /24)</b><code>${rev.slice(1).join('.')}.in-addr.arpa</code></li>
                <li><b>Eintrag in der Zone</b><code>${rev[0]}  IN  PTR  ${name ? name + '.' : '???'}</code></li>
              </ol><p style="margin-bottom:0">${name ? `✅ Antwort: <b>${name}</b>` : '❌ In unserer Beispiel-Zone gibt es keinen PTR für diese IP → <b>NXDOMAIN</b>.'}</p></div>`;
          } else if (v.includes(':')) {
            try {
              const nib = IPv6.expand(v).replace(/:/g, '').split('').reverse().join('.');
              html = `<div class="result-box"><h3>🔁 IPv6-Reverse-Lookup</h3><ol class="steps">
                <li><b>Vollständig ausschreiben</b><code>${IPv6.expand(v)}</code></li>
                <li><b>Alle 32 Hex-Ziffern einzeln rückwärts, mit Punkten getrennt + .ip6.arpa</b><code>${nib}.ip6.arpa</code></li></ol></div>`;
            } catch (e) { html = `<div class="fb bad">⚠ ${esc(e.message)}</div>`; }
          } else if (/^[a-z0-9.-]+$/.test(v)) {
            const ip = ZONE[v];
            const inZone = v.endsWith('.firma.local');
            html = `<div class="result-box"><h3>➡️ Forward-Lookup (Name → IP)</h3><ol class="steps">
              <li><b>Gesuchter Name (FQDN)</b><code>${v}.</code></li>
              <li><b>Zuständige Forward-Lookupzone</b><code>${inZone ? 'firma.local' : v.split('.').slice(1).join('.') || v}</code></li>
              <li><b>Eintrag in der Zone</b><code>${inZone ? v.replace('.firma.local', '') : v}  IN  A  ${ip || '???'}</code></li></ol>
              <p style="margin-bottom:0">${ip ? `✅ Antwort: <b>${ip}</b>` : inZone ? '❌ Kein solcher Eintrag in der Zone → <b>NXDOMAIN</b>.' : 'ℹ️ Gehört nicht zur Beispielzone firma.local – der Resolver würde die Hierarchie durchlaufen (siehe „DNS – Hierarchie“).'}</p></div>`;
          } else html = '<div class="fb bad">⚠ Bitte einen Namen oder eine IP-Adresse eingeben.</div>';
          out.innerHTML = html;
        };
        inp.oninput = upd;
        $$('[data-ex]', root).forEach(b => b.onclick = () => { inp.value = b.dataset.ex; upd(); });
        upd();
      },
    },
    {
      title: '📄 Zonendatei erkunden',
      render(root) {
        const Z = {
          fwd: { title: 'Forward-Zone firma.local', rows: [
            ['$TTL 3600', '', 'Standard-TTL: Einträge dürfen 3600 s (1 h) gecacht werden.'],
            ['@        IN  SOA   ns1.firma.local. hostmaster.firma.local. ( 2026101901 3600 900 1209600 300 )', 'SOA', 'Start of Authority: Primary-Nameserver ns1, Verantwortlicher hostmaster@firma.local, Seriennummer, Refresh, Retry, Expire, Minimum-TTL. Genau einer pro Zone.'],
            ['@        IN  NS    ns1.firma.local.', 'NS', 'Nameserver der Zone. @ = der Zonenname selbst (firma.local).'],
            ['ns1      IN  A     192.168.1.2', 'A', 'Der Nameserver selbst braucht natürlich auch einen A-Record.'],
            ['www      IN  A     192.168.1.20', 'A', 'www.firma.local → 192.168.1.20 (IPv4). Ohne Punkt am Ende → wird um „.firma.local“ ergänzt.'],
            ['www      IN  AAAA  2001:db8:1:1::20', 'AAAA', 'Derselbe Name hat zusätzlich eine IPv6-Adresse (Dual Stack).'],
            ['intranet IN  CNAME www.firma.local.', 'CNAME', 'Alias: intranet.firma.local ist nur ein anderer Name für www.firma.local.'],
            ['mail     IN  A     192.168.1.25', 'A', 'IPv4-Adresse des Mailservers.'],
            ['@        IN  MX 10 mail.firma.local.', 'MX', 'Mails an @firma.local gehen an mail.firma.local. Priorität 10 (kleiner = bevorzugt).'],
            ['_ldap._tcp IN SRV  0 100 389 dc1.firma.local.', 'SRV', 'Dienst LDAP über TCP: Priorität 0, Gewicht 100, Port 389, Host dc1 – so finden Clients den Domain Controller im AD.'],
            ['@        IN  TXT   "v=spf1 mx -all"', 'TXT', 'SPF: Nur die MX-Server dürfen Mails für firma.local versenden.'],
          ] },
          rev: { title: 'Reverse-Zone 1.168.192.in-addr.arpa', rows: [
            ['$TTL 3600', '', 'Standard-TTL der Reverse-Zone.'],
            ['@   IN  SOA  ns1.firma.local. hostmaster.firma.local. ( 2026101901 3600 900 1209600 300 )', 'SOA', 'Auch eine Reverse-Zone hat einen SOA. @ = 1.168.192.in-addr.arpa'],
            ['@   IN  NS   ns1.firma.local.', 'NS', 'Zuständiger Nameserver.'],
            ['2   IN  PTR  ns1.firma.local.', 'PTR', '2.1.168.192.in-addr.arpa → ns1.firma.local, also 192.168.1.2 → ns1.'],
            ['20  IN  PTR  www.firma.local.', 'PTR', '192.168.1.20 → www.firma.local. Nur das letzte Oktett steht links, der Rest ist der Zonenname.'],
            ['25  IN  PTR  mail.firma.local.', 'PTR', '192.168.1.25 → mail.firma.local – wichtig, damit andere Mailserver unsere Mails nicht als Spam ablehnen.'],
            ['50  IN  PTR  drucker.firma.local.', 'PTR', '192.168.1.50 → drucker.firma.local.'],
          ] },
        };
        let cur = 'fwd';
        root.innerHTML = `<div class="row" style="margin:0 0 12px"><button class="btn" data-z="fwd">➡️ Forward-Zone</button><button class="btn" data-z="rev">🔁 Reverse-Zone</button><span class="muted">Klicke auf eine Zeile!</span></div>
          <div class="zone" id="zn"></div><div class="result-box" id="znOut" style="margin-top:12px"></div>`;
        const draw = () => {
          $$('[data-z]', root).forEach(b => b.classList.toggle('on', b.dataset.z === cur));
          const z = Z[cur];
          $('#zn', root).innerHTML = `<div class="cm">; ${z.title}</div>` + z.rows.map((r, i) => `<div data-i="${i}">${esc(r[0]).replace(new RegExp(`\\b(${r[1] || '§'})\\b`), '<span class="ty">$1</span>')}</div>`).join('');
          $$('#zn [data-i]', root).forEach(d => d.onclick = () => {
            $$('#zn [data-i]', root).forEach(x => x.classList.remove('on')); d.classList.add('on');
            const r = z.rows[+d.dataset.i];
            $('#znOut', root).innerHTML = `<h3>${r[1] ? `<code>${r[1]}</code>-Record` : 'Direktive'}</h3><p style="margin:0">${r[2]}</p>`;
          });
          $('#zn [data-i="4"]', root).click();
        };
        $$('[data-z]', root).forEach(b => b.onclick = () => { cur = b.dataset.z; draw(); });
        draw();
      },
    },
  ],
});
