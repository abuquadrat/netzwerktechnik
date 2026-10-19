registerTopic({
  id: 'dns-hierarchie',
  title: 'DNS – Hierarchie',
  subtitle: 'Root, TLD, Parent- & Child-Domain, Auflösung',
  category: 'Namensauflösung',
  icon: '🌳',
  color: '#34d399',

  levels: {
    1: `
      <h2>Das Telefonbuch des Internets</h2>
      <div class="analogy"><div class="big">📒</div><div>
        Computer reden mit <b>Nummern</b> (IP-Adressen), Menschen merken sich lieber <b>Namen</b>. Das <b>DNS</b> (Domain Name System) übersetzt: <code>www.beispiel.de</code> → <code>203.0.113.10</code>.</div></div>
      <h2>Namen werden von hinten gelesen</h2>
      <div class="analogy"><div class="big">🗂️</div><div>
        Ein Domainname ist wie ein <b>Ordnerpfad</b>, nur rückwärts geschrieben. <code>www.beispiel.de.</code> heißt eigentlich:
        <b>Hauptordner „.“</b> → Ordner <b>„de“</b> → Ordner <b>„beispiel“</b> → Datei <b>„www“</b>.</div></div>
      <div class="fqdn" style="--c:var(--iid)"><span class="lv-host">www<small>Host / Subdomain</small></span><i>.</i><span class="lv-sld">beispiel<small>Second-Level</small></span><i>.</i><span class="lv-tld">de<small>Top-Level</small></span><i>.</i><span class="lv-root">&nbsp;<small>Root</small></span></div>
      <ul>
        <li><b>Root (.)</b> – die Wurzel, ganz oben. Der Punkt am Ende wird meist weggelassen.</li>
        <li><b>TLD</b> (Top-Level-Domain) – <code>.de</code>, <code>.com</code>, <code>.org</code></li>
        <li><b>Second-Level-Domain</b> – der Name, den man kauft: <code>beispiel</code></li>
        <li><b>Subdomain</b> – frei wählbar vom Besitzer: <code>www</code>, <code>shop</code>, <code>mail</code></li>
      </ul>
      <h2>Eltern und Kinder</h2>
      <p>Jede Domain hat eine <b>Parent-Domain</b> (die Ebene darüber) und kann <b>Child-Domains</b> haben (darunter). <code>shop.beispiel.de</code> ist ein <b>Kind</b> von <code>beispiel.de</code>, und <code>beispiel.de</code> ist ein Kind von <code>de</code>.</p>
      <div class="callout tip">Klick dich unten durch den <b>Domain-Baum</b> und schau dir die <b>animierte Namensauflösung</b> an – da sieht man, wie ein Name Schritt für Schritt gefunden wird.</div>`,

    2: `
      <h2>Die DNS-Hierarchie</h2>
      <table class="tbl">
        <tr><th>Ebene</th><th>Beispiel</th><th>Wer verwaltet?</th></tr>
        <tr><td><b>Root-Domain</b> „.“</td><td>(der letzte Punkt)</td><td>ICANN/IANA, 13 Root-Server-Namen a – m.root-servers.net (per Anycast weltweit hunderte Instanzen)</td></tr>
        <tr><td><b>Top-Level-Domain (TLD)</b></td><td><code>de</code>, <code>com</code></td><td>Registry, z. B. <b>DENIC</b> für .de, Verisign für .com</td></tr>
        <tr><td><b>Second-Level-Domain (SLD)</b></td><td><code>beispiel</code>.de</td><td>Domaininhaber (registriert über einen Registrar)</td></tr>
        <tr><td><b>Subdomain / Third-Level</b></td><td><code>shop</code>.beispiel.de</td><td>Domaininhaber selbst</td></tr>
        <tr><td><b>Hostname</b></td><td><code>www</code>.beispiel.de</td><td>einzelner Rechner/Dienst (A/AAAA-Record)</td></tr>
      </table>
      <h3>Arten von TLDs</h3>
      <ul>
        <li><b>gTLD</b> (generic): <code>.com</code>, <code>.org</code>, <code>.net</code>, <code>.info</code> – und neue gTLDs wie <code>.berlin</code>, <code>.app</code>, <code>.shop</code></li>
        <li><b>ccTLD</b> (country code): <code>.de</code>, <code>.at</code>, <code>.ch</code>, <code>.uk</code></li>
        <li><b>sTLD</b> (sponsored): <code>.edu</code>, <code>.gov</code>, <code>.mil</code></li>
        <li><b>Infrastruktur-TLD</b>: <code>.arpa</code> – u. a. für Reverse-Lookups (<code>in-addr.arpa</code>)</li>
      </ul>
      <h3>Parent-Domain und Child-Domain</h3>
      <p>Der DNS-Namensraum ist ein <b>Baum</b>. Jeder Knoten über einem anderen ist dessen <b>Parent-Domain</b>, jeder darunter eine <b>Child-Domain</b>:</p>
      <div class="flow"><span>. (Root)</span><i>→ Parent von →</i><span>de</span><i>→ Parent von →</i><span>beispiel.de</span><i>→ Parent von →</i><span>shop.beispiel.de</span></div>
      <p>Die Parent-Zone <b>delegiert</b> die Verantwortung für eine Child-Domain, indem sie <b>NS-Records</b> enthält, die auf die zuständigen Nameserver der Child-Zone zeigen. Beispiel: Die .de-Zone (DENIC) enthält „beispiel.de → NS ns1.beispiel-hosting.de“.</p>
      <div class="callout">Auch im <b>Active Directory</b> spricht man von Parent- und Child-Domain: <code>firma.local</code> (Parent) und <code>vertrieb.firma.local</code> (Child) bilden zusammen einen <b>Tree</b>, mehrere Trees einen <b>Forest</b>.</div>
      <h3>FQDN</h3>
      <p><b>Fully Qualified Domain Name</b> = vollständiger Name bis zur Root, mit abschließendem Punkt: <code>www.beispiel.de.</code> – max. 253 Zeichen, jedes Label max. 63 Zeichen.</p>

      <h2>Namensauflösung</h2>
      <ol>
        <li>Client prüft <b>lokal</b>: DNS-Cache (inkl. <code>hosts</code>-Datei).</li>
        <li>Client fragt seinen <b>DNS-Resolver</b> (Router, Firmen-DNS oder Provider) – <b>rekursive Anfrage</b>: „Gib mir bitte die fertige Antwort.“</li>
        <li>Der Resolver fragt <b>iterativ</b>: <b>Root-Server</b> → „frag die .de-Server“ → <b>TLD-Server</b> → „frag ns1.beispiel.de“ → <b>autoritativer Server</b> → Antwort.</li>
        <li>Resolver <b>speichert</b> das Ergebnis für die Dauer der <b>TTL</b> im Cache und antwortet dem Client.</li>
      </ol>
      <table class="tbl">
        <tr><th>Rekursive Anfrage</th><th>Iterative Anfrage</th></tr>
        <tr><td>Der Gefragte muss die <b>vollständige Antwort</b> liefern und erledigt alle Zwischenschritte selbst.</td><td>Der Gefragte antwortet mit dem, was er weiß – oft nur einem <b>Verweis (Referral)</b> auf den nächsten zuständigen Server.</td></tr>
        <tr><td>Client → Resolver</td><td>Resolver → Root / TLD / autoritativ</td></tr>
      </table>
      <div class="callout exam">Merke: <b>Client fragt rekursiv, Resolver fragt iterativ.</b> Und: DNS nutzt <b>Port 53</b> – normalerweise <b>UDP</b>, bei großen Antworten und Zonentransfers <b>TCP</b>.</div>
      <h3>Autoritativ oder nicht?</h3>
      <p>Eine <b>autoritative</b> Antwort kommt vom Server, der die Zone verwaltet. Antworten aus einem Cache sind <b>nicht autoritativ</b> – deshalb zeigt <code>nslookup</code> oft „Nicht autorisierende Antwort“.</p>`,

    3: `
      <h2>Tiefer in die Hierarchie</h2>
      <h3>Domain ≠ Zone</h3>
      <p>Eine <b>Domain</b> ist ein Teilbaum des Namensraums. Eine <b>Zone</b> ist der Teil davon, den <b>ein</b> Nameserver verwaltet. Wird <code>shop.beispiel.de</code> an andere Server delegiert, gehört es zwar zur <b>Domain</b> beispiel.de, aber <b>nicht zur Zone</b> beispiel.de.</p>
      <h3>Delegation und Glue-Records</h3>
      <p>Liegt der Nameserver innerhalb der delegierten Domain (<code>beispiel.de NS ns1.beispiel.de</code>), entsteht ein Henne-Ei-Problem. Lösung: Die Parent-Zone liefert die IP des Nameservers gleich mit – das ist der <b>Glue-Record</b> (ein A/AAAA-Record in der Parent-Zone).</p>
      <h3>Resolver-Reihenfolge unter Windows</h3>
      <ol>
        <li>Eigener Hostname</li>
        <li>DNS-Client-Cache (enthält auch die <code>C:\\Windows\\System32\\drivers\\etc\\hosts</code>)</li>
        <li>Konfigurierte DNS-Server (aus DHCP oder statisch)</li>
        <li>Fallback: LLMNR, NetBIOS, mDNS (lokale Namensauflösung)</li>
      </ol>
      ${UI.terminal(`C:\\> ipconfig /displaydns     <span class="hl">← Cache anzeigen</span>
C:\\> ipconfig /flushdns       <span class="hl">← Cache leeren</span>
C:\\> nslookup www.beispiel.de

Server:  fritz.box
Address:  192.168.178.1

Nicht autorisierende Antwort:
Name:    www.beispiel.de
Address:  203.0.113.10`)}
      <h3>Weitere Begriffe</h3>
      <table class="tbl">
        <tr><td><b>Forwarder</b></td><td>Firmen-DNS leitet Anfragen, die er nicht kennt, an einen anderen Resolver weiter (z. B. Provider) statt selbst iterativ zu suchen.</td></tr>
        <tr><td><b>Conditional Forwarder</b></td><td>Weiterleitung nur für bestimmte Domains (z. B. Partnerfirma).</td></tr>
        <tr><td><b>Negative Caching</b></td><td>Auch „gibt es nicht“ (NXDOMAIN) wird gecacht – Dauer steht im SOA.</td></tr>
        <tr><td><b>DNSSEC</b></td><td>Signiert DNS-Antworten (RRSIG, DNSKEY, DS) – schützt vor Cache-Poisoning, die Vertrauenskette beginnt an der Root.</td></tr>
        <tr><td><b>DoH / DoT</b></td><td>DNS über HTTPS (Port 443) bzw. TLS (Port 853) – verschlüsselt die Anfragen.</td></tr>
        <tr><td><b>Split-Brain-DNS</b></td><td>Intern liefert derselbe Name eine andere (private) IP als extern.</td></tr>
      </table>
      <h3>Root-Server</h3>
      <p>Die 13 Namen a.root-servers.net bis m.root-servers.net stammen aus der Zeit, als eine DNS-Antwort in ein 512-Byte-UDP-Paket passen musste. Dank <b>Anycast</b> stehen weltweit über 1.500 Instanzen. Resolver kennen sie aus der <b>Root-Hints</b>-Datei.</p>`,
  },

  merke: [
    'Hierarchie von rechts nach links: Root (.) → TLD → Second-Level → Subdomain → Host.',
    'gTLD = .com/.org/.net · ccTLD = .de/.at/.ch.',
    'Parent-Domain = Ebene darüber, Child-Domain = Ebene darunter; Delegation per NS-Record.',
    'FQDN endet mit Punkt: www.beispiel.de.',
    'Client → Resolver rekursiv, Resolver → Root/TLD/Autoritativ iterativ.',
    'DNS = Port 53, UDP (TCP für große Antworten & Zonentransfer).',
  ],

  cheat: [
    ['Ebenen', 'Root „.“ → TLD → Second-Level-Domain → Subdomain → Host'],
    ['TLD-Arten', 'gTLD (.com .org .net) · ccTLD (.de .at) · sTLD (.edu .gov) · .arpa'],
    ['Parent / Child', '<code>beispiel.de</code> ist Parent von <code>shop.beispiel.de</code> (Child); Delegation per NS-Record'],
    ['FQDN', 'vollständig bis zur Root mit Punkt: <code>www.beispiel.de.</code> (max. 253 Zeichen, Label max. 63)'],
    ['Rekursiv', 'Client → Resolver: „fertige Antwort bitte“'],
    ['Iterativ', 'Resolver → Root → TLD → autoritativ: Antwort oder Verweis'],
    ['Root-Server', '13 Namen (a–m.root-servers.net), per Anycast > 1.500 Instanzen'],
    ['Port', '53 UDP, TCP für > 512 Byte / Zonentransfer · DoT 853 · DoH 443'],
    ['Befehle', '<code>nslookup</code> · <code>ipconfig /displaydns</code> · <code>ipconfig /flushdns</code>'],
  ],

  cards: [
    ['Wofür braucht man DNS?', 'Übersetzt Namen in IP-Adressen (Forward) und IP-Adressen in Namen (Reverse)'],
    ['Oberste Ebene im DNS', 'Die Root-Domain „.“'],
    ['TLD von www.beispiel.de', '<code>de</code> – eine ccTLD'],
    ['Second-Level-Domain von www.beispiel.de', '<code>beispiel</code>'],
    ['Parent-Domain', 'Die nächsthöhere Ebene im Baum, z. B. <code>beispiel.de</code> für <code>shop.beispiel.de</code>'],
    ['Child-Domain', 'Eine Domain unterhalb einer anderen, z. B. <code>shop.beispiel.de</code> unter <code>beispiel.de</code>'],
    ['Wie delegiert die Parent-Zone an die Child-Zone?', 'Über NS-Records (+ Glue-Records)'],
    ['FQDN', 'Fully Qualified Domain Name – vollständiger Name inkl. Root-Punkt'],
    ['gTLD vs. ccTLD', 'generic (.com, .org) vs. country code (.de, .at)'],
    ['Rekursive Anfrage', 'Der Gefragte liefert die komplette Antwort und fragt selbst weiter (Client → Resolver)'],
    ['Iterative Anfrage', 'Der Gefragte liefert Antwort oder Verweis auf den nächsten Server (Resolver → Root/TLD)'],
    ['TTL im DNS', 'Wie lange ein Eintrag im Cache gehalten werden darf (Sekunden)'],
  ],

  quiz: [
    { q: 'Wofür wird DNS hauptsächlich verwendet?', a: ['Übersetzung von Namen in IP-Adressen (und umgekehrt)', 'Vergabe von IP-Adressen', 'Verschlüsselung von Webseiten', 'Routing zwischen Netzen'], c: 0, e: 'IP-Vergabe macht DHCP.' },
    { q: 'Was ist die oberste Ebene der DNS-Hierarchie?', a: ['Die Root-Domain „.“', 'Die TLD', '.com', 'www'], c: 0, e: 'Darunter folgen die TLDs.' },
    { q: 'Was ist „de“ in <code>www.beispiel.de.</code>?', a: ['Top-Level-Domain (ccTLD)', 'Second-Level-Domain', 'Subdomain', 'Root'], c: 0 },
    { q: 'Was ist „beispiel“ in <code>www.beispiel.de</code>?', a: ['Second-Level-Domain', 'Top-Level-Domain', 'Root-Domain', 'Resource Record'], c: 0 },
    { q: 'Was ist ein FQDN?', a: ['Der vollständige Name bis zur Root, z. B. www.beispiel.de.', 'Nur der Hostname', 'Die IP-Adresse eines Servers', 'Die Top-Level-Domain'], c: 0, e: 'Fully Qualified Domain Name – mit abschließendem Punkt.' },
    { q: 'In welcher Beziehung steht <code>shop.beispiel.de</code> zu <code>beispiel.de</code>?', a: ['Child-Domain (Subdomain) von beispiel.de', 'Parent-Domain von beispiel.de', 'TLD', 'Root-Domain'], c: 0, e: 'beispiel.de ist die Parent-Domain.' },
    { q: 'Was ist die Parent-Domain von <code>beispiel.de</code>?', a: ['de', 'www.beispiel.de', 'shop.beispiel.de', 'beispiel'], c: 0, e: 'Und die Parent-Domain von de ist die Root.' },
    { q: 'Welche ist eine generische TLD (gTLD)?', a: ['.com', '.de', '.at', '.ch'], c: 0, e: '.de, .at, .ch sind Länder-TLDs (ccTLD).' },
    { q: 'Welche ist eine Länder-TLD (ccTLD)?', a: ['.de', '.com', '.org', '.info'], c: 0 },
    { q: 'Wie verweist eine Parent-Zone auf die Nameserver einer Child-Zone?', a: ['Über NS-Records (Delegation)', 'Über PTR-Records', 'Über MX-Records', 'Über DHCP-Option 6'], c: 0 },
    { q: 'Welchen Port verwendet DNS standardmäßig?', a: ['53 (UDP, bei großen Antworten/Zonentransfer TCP)', '67/68', '80', '25'], c: 0 },
    { q: 'Was kennzeichnet eine <b>rekursive</b> Anfrage?', a: ['Der Client verlangt eine fertige Antwort – der Resolver erledigt die ganze Suche', 'Der Server antwortet nur mit einem Verweis', 'Der Client fragt nacheinander Root, TLD und autoritativen Server', 'Es wird die hosts-Datei gelesen'], c: 0 },
    { q: 'Was kennzeichnet eine <b>iterative</b> Anfrage?', a: ['Der befragte Server liefert die Antwort oder einen Verweis auf den nächsten zuständigen Server', 'Der Server fragt selbst so lange weiter, bis er die Antwort hat', 'Die Anfrage geht per Broadcast ins LAN', 'Es wird ein Zonentransfer gestartet'], c: 0, e: 'So fragt der Resolver Root- und TLD-Server.' },
    { q: 'Wie viele Root-Server-<b>Namen</b> gibt es?', a: ['13 (a bis m), real über 1.500 Instanzen per Anycast', 'Genau 1', '255', 'Unbegrenzt viele'], c: 0 },
    { q: 'Was gibt die TTL eines DNS-Eintrags an?', a: ['Wie lange der Eintrag gecacht werden darf', 'Die Anzahl der Router bis zum Ziel', 'Die Lease-Zeit', 'Die Größe der Zone'], c: 0 },
    { q: 'Was prüft ein Windows-PC <b>vor</b> der Anfrage an den DNS-Server?', a: ['Den lokalen DNS-Cache inklusive hosts-Datei', 'Die Root-Server', 'Den TLD-Server', 'Den DHCP-Server'], c: 0 },
    { q: '<code>nslookup</code> meldet „Nicht autorisierende Antwort“. Was bedeutet das?', a: ['Die Antwort kam aus dem Cache des Resolvers, nicht direkt vom zuständigen Server', 'Die Antwort ist falsch', 'Der Name existiert nicht', 'Der DNS-Server ist offline'], c: 0 },
  ],

  generators: [
    {
      name: 'Domain-Ebenen bestimmen',
      make() {
        const host = pick(['www', 'mail', 'shop', 'vpn', 'intranet', 'cloud']);
        const sld = pick(['beispiel', 'firma', 'schule', 'netzwerk', 'kaffee', 'it-ausbildung']);
        const tld = pick(['de', 'com', 'org', 'net', 'at', 'berlin']);
        const sub = Math.random() < .4 ? pick(['intern', 'dev', 'eu', 'hh']) : null;
        const labels = sub ? [host, sub, sld, tld] : [host, sld, tld];
        const fqdn = labels.join('.') + '.';
        const uniq = a => a.filter((v, i) => a.indexOf(v) === i);
        const ask = pick(['tld', 'sld', 'parent', 'root']);
        if (ask === 'tld') return { q: `Welcher Teil von <code>${fqdn}</code> ist die Top-Level-Domain?`, a: uniq([tld, sld, host, '. (Punkt)']), c: 0, e: `TLD = ganz rechts vor dem Root-Punkt: ${tld}.` };
        if (ask === 'sld') return { q: `Welcher Teil von <code>${fqdn}</code> ist die Second-Level-Domain?`, a: uniq([sld, tld, host, sub || '. (Punkt)']), c: 0, e: `SLD = direkt links von der TLD: ${sld}.` };
        if (ask === 'root') return { q: `Wofür steht der letzte Punkt in <code>${fqdn}</code>?`, a: ['Die Root-Domain', 'Die TLD', 'Nichts, Tippfehler', 'Die Subdomain'], c: 0, e: 'Der abschließende Punkt macht den Namen zum FQDN.' };
        const name = labels.join('.');
        const parent = labels.slice(1).join('.');
        return { q: `Wie lautet die Parent-Domain von <code>${name}</code>?`, a: uniq([parent, labels.slice(2).join('.'), labels[0] + '.' + tld, name + '.' + tld]), c: 0, e: `Ganz links ein Label abschneiden: ${parent}.` };
      },
    },
  ],

  visuals: [
    {
      title: '🌳 Domain-Baum',
      render(root) {
        const N = [
          { id: 'root', l: '.', x: 380, y: 34, p: null, lv: 'root' },
          { id: 'com', l: 'com', x: 110, y: 118, p: 'root', lv: 'tld' },
          { id: 'de', l: 'de', x: 330, y: 118, p: 'root', lv: 'tld' },
          { id: 'org', l: 'org', x: 520, y: 118, p: 'root', lv: 'tld' },
          { id: 'arpa', l: 'arpa', x: 680, y: 118, p: 'root', lv: 'tld' },
          { id: 'firma', l: 'firma', x: 110, y: 202, p: 'com', lv: 'sld' },
          { id: 'beispiel', l: 'beispiel', x: 300, y: 202, p: 'de', lv: 'sld' },
          { id: 'schule', l: 'schule', x: 420, y: 202, p: 'de', lv: 'sld' },
          { id: 'wiki', l: 'wikipedia', x: 540, y: 202, p: 'org', lv: 'sld' },
          { id: 'inaddr', l: 'in-addr', x: 680, y: 202, p: 'arpa', lv: 'sld' },
          { id: 'fwww', l: 'www', x: 60, y: 286, p: 'firma', lv: 'host' },
          { id: 'fmail', l: 'mail', x: 160, y: 286, p: 'firma', lv: 'host' },
          { id: 'bwww', l: 'www', x: 250, y: 286, p: 'beispiel', lv: 'host' },
          { id: 'bshop', l: 'shop', x: 350, y: 286, p: 'beispiel', lv: 'sub' },
          { id: 'smoodle', l: 'moodle', x: 450, y: 286, p: 'schule', lv: 'host' },
          { id: 'wde', l: 'de', x: 560, y: 286, p: 'wiki', lv: 'sub' },
          { id: 'r192', l: '192', x: 680, y: 286, p: 'inaddr', lv: 'sub' },
          { id: 'bsapi', l: 'api', x: 350, y: 362, p: 'bshop', lv: 'host' },
          { id: 'r168', l: '168', x: 680, y: 362, p: 'r192', lv: 'sub' },
        ];
        const by = Object.fromEntries(N.map(n => [n.id, n]));
        const LV = { root: 'Root-Domain', tld: 'Top-Level-Domain (TLD)', sld: 'Second-Level-Domain', sub: 'Subdomain', host: 'Host (Subdomain/Record)' };
        const fq = n => { const a = []; let c = n; while (c && c.id !== 'root') { a.push(c); c = by[c.p]; } return a; };
        root.innerHTML = `<div class="tree"><svg viewBox="0 0 760 392" xmlns="http://www.w3.org/2000/svg">
          ${N.filter(n => n.p).map(n => `<line class="edge" data-e="${n.id}" x1="${by[n.p].x}" y1="${by[n.p].y + 15}" x2="${n.x}" y2="${n.y - 15}"/>`).join('')}
          ${N.map(n => { const w = Math.max(44, n.l.length * 10 + 22); return `<g class="node lv-${n.lv}" data-n="${n.id}"><rect x="${n.x - w / 2}" y="${n.y - 15}" width="${w}" height="30" rx="9"/><text x="${n.x}" y="${n.y + 5}" text-anchor="middle">${n.l}</text></g>`; }).join('')}
          </svg></div>
          <div class="legend" style="margin:6px 0 12px"><span class="lv-root">Root</span><span class="lv-tld">TLD</span><span class="lv-sld">Second-Level</span><span class="lv-sub">Subdomain</span><span class="lv-host">Host</span></div>
          <div id="trOut" class="result-box"></div>`;
        const out = $('#trOut', root);
        const sel = id => {
          const n = by[id], path = fq(n);
          $$('.node', root).forEach(g => g.classList.remove('on'));
          $$('.edge', root).forEach(e => e.classList.remove('on'));
          let c = n; while (c) { $(`.node[data-n="${c.id}"]`, root).classList.add('on'); if (c.p) $(`.edge[data-e="${c.id}"]`, root).classList.add('on'); c = by[c.p]; }
          const name = path.map(x => x.l).join('.');
          const parent = n.p ? (by[n.p].id === 'root' ? '. (Root)' : fq(by[n.p]).map(x => x.l).join('.')) : '– (hat keine)';
          const kids = N.filter(x => x.p === id).map(x => [x.l, ...path.map(y => y.l)].join('.'));
          const isRev = path.some(x => x.id === 'arpa');
          out.innerHTML = `<div class="fqdn">${path.map(x => `<span class="lv-${x.lv}">${x.l}<small>${LV[x.lv].split(' (')[0]}</small></span><i>.</i>`).join('')}<span class="lv-root">&nbsp;<small>Root</small></span></div>
            <table class="pkt-tbl">
              <tr><th>Ebene</th><td style="font-family:inherit"><b>${LV[n.lv]}</b></td></tr>
              <tr><th>FQDN</th><td>${name ? name + '.' : '.'}</td></tr>
              <tr><th>Parent-Domain</th><td>${parent}</td></tr>
              <tr><th>Child-Domains</th><td>${kids.length ? kids.join(', ') : '– (keine im Beispiel)'}</td></tr>
            </table>
            ${n.id === 'root' ? '<p>Die Wurzel des DNS. Zuständig: 13 Root-Server-Namen (a–m.root-servers.net). Sie kennen nur die TLD-Server.</p>' : ''}
            ${n.lv === 'tld' && n.id !== 'arpa' ? `<p>${['de'].includes(n.id) ? 'Länder-TLD (ccTLD), verwaltet von der DENIC.' : 'Generische TLD (gTLD).'} Die TLD-Server delegieren per NS-Records an die Second-Level-Domains.</p>` : ''}
            ${isRev ? '<p>🔁 Der <b>.arpa</b>-Zweig wird für <b>Reverse-Lookups</b> genutzt: 192.168.x.x steht unter <code>168.192.in-addr.arpa</code> (Oktette rückwärts!). Mehr dazu im Thema „DNS – Zonen“.</p>' : ''}`;
        };
        $$('.node', root).forEach(g => g.onclick = () => sel(g.dataset.n));
        sel('bwww');
      },
    },
    {
      title: '🎬 Namensauflösung animiert',
      render(root) {
        UI.sequence(root, {
          intro: 'Du tippst <code>www.beispiel.de</code> in den Browser. Der Cache ist leer. Wer fragt hier wen?',
          actors: [{ id: 'c', label: 'Client', icon: '💻' }, { id: 'r', label: 'Resolver', icon: '🧭' }, { id: 'root', label: 'Root-Server', icon: '🌐' }, { id: 'tld', label: '.de-Server', icon: '🇩🇪' }, { id: 'auth', label: 'ns1.beispiel.de', icon: '📗' }],
          steps: [
            { from: 'c', to: 'c', label: 'Cache & hosts prüfen', title: 'Lokal nachsehen', html: '<p>Zuerst schaut der Client in seinen <b>DNS-Cache</b> (inkl. hosts-Datei). Kein Eintrag → weiter zum Resolver.</p>' },
            { from: 'c', to: 'r', label: 'www.beispiel.de? (rekursiv)', title: 'Rekursive Anfrage an den Resolver', html: UI.pkt([['Typ', 'Standard-Query, A-Record'], ['Flag', 'RD = 1 (Recursion Desired)'], ['Port', 'UDP 53']]) + '<p>„Bitte besorg mir die <b>fertige</b> Antwort.“ Der Resolver ist z. B. der Router, der Firmen-DNS oder der Provider-DNS.</p>' },
            { from: 'r', to: 'root', label: 'www.beispiel.de? (iterativ)', title: 'Resolver fragt die Root', html: '<p>Der Resolver kennt die Root-Server aus seinen <b>Root-Hints</b>. Er fragt <b>iterativ</b>.</p>' },
            { from: 'root', to: 'r', label: 'Verweis: frag a.nic.de', title: 'Referral von der Root', html: '<p>Die Root kennt beispiel.de nicht, aber sie weiß, wer für <b>.de</b> zuständig ist → <b>Verweis</b> (NS-Records + IPs der .de-Server).</p>' },
            { from: 'r', to: 'tld', label: 'www.beispiel.de?', title: 'Resolver fragt den TLD-Server', html: '<p>Nächste Ebene: Die .de-Server der DENIC.</p>' },
            { from: 'tld', to: 'r', label: 'Verweis: frag ns1.beispiel.de', title: 'Referral vom TLD-Server (Delegation)', html: '<p>In der .de-Zone steht die <b>Delegation</b> an die Child-Zone: <code>beispiel.de NS ns1.beispiel.de</code> + Glue-Record mit dessen IP.</p>' },
            { from: 'r', to: 'auth', label: 'www.beispiel.de?', title: 'Resolver fragt den autoritativen Server', html: '<p>Dieser Server verwaltet die Zone beispiel.de und kennt die Antwort sicher.</p>' },
            { from: 'auth', to: 'r', label: 'A 203.0.113.10, TTL 3600', title: 'Autoritative Antwort', html: UI.pkt([['Record', 'www.beispiel.de. 3600 IN A 203.0.113.10'], ['Flag', 'AA = 1 (Authoritative Answer)']]) },
            { from: 'r', to: 'r', label: 'im Cache speichern (TTL)', title: 'Caching', html: '<p>Der Resolver merkt sich die Antwort <b>3600 Sekunden</b>. Die nächste Anfrage nach www.beispiel.de beantwortet er sofort aus dem Cache.</p>' },
            { from: 'r', to: 'c', label: '203.0.113.10', title: 'Antwort an den Client', html: '<p>Für den Client ist das eine <b>nicht autoritative</b> Antwort (sie kommt vom Resolver, nicht vom Zonen-Server). Jetzt kann der Browser die TCP-Verbindung zu 203.0.113.10 aufbauen.</p><div class="callout exam" style="margin-bottom:0">Client → Resolver = <b>rekursiv</b> · Resolver → Root/TLD/Autoritativ = <b>iterativ</b></div>' },
          ],
        });
      },
    },
    {
      title: '✂️ FQDN zerlegen',
      render(root) {
        root.innerHTML = `<div class="lab"><label class="field"><span>Beliebigen Domainnamen eingeben</span><input id="fqIn" value="api.shop.beispiel.de" spellcheck="false"></label><div id="fqOut"></div></div>`;
        const inp = $('#fqIn', root), out = $('#fqOut', root);
        const upd = () => {
          const labels = inp.value.trim().toLowerCase().replace(/\.+$/, '').split('.').filter(Boolean);
          if (!labels.length) { out.innerHTML = ''; return; }
          const bad = labels.find(l => !/^[a-z0-9äöüß]([a-z0-9äöüß-]{0,61}[a-z0-9äöüß])?$/.test(l));
          const n = labels.length;
          const lv = i => i === n - 1 ? ['tld', 'TLD'] : i === n - 2 ? ['sld', 'Second-Level'] : i === 0 && n > 2 ? ['host', 'Host'] : ['sub', 'Subdomain'];
          const chain = labels.map((_, i) => labels.slice(i).join('.'));
          out.innerHTML = `${bad ? `<div class="fb bad">⚠ Ungültiges Label „${esc(bad)}“ (nur Buchstaben, Ziffern, Bindestrich; max. 63 Zeichen)</div>` : ''}
            <div class="fqdn">${labels.map((l, i) => `<span class="lv-${lv(i)[0]}">${esc(l)}<small>${lv(i)[1]}</small></span><i>.</i>`).join('')}<span class="lv-root">&nbsp;<small>Root</small></span></div>
            <p class="muted">Länge: ${labels.join('.').length + 1} von max. 253 Zeichen · FQDN: <code>${esc(labels.join('.'))}.</code></p>
            <table class="tbl"><tr><th>Domain</th><th>Parent-Domain</th></tr>
            ${chain.map((d, i) => `<tr><td><code>${esc(d)}</code></td><td><code>${i < n - 1 ? esc(chain[i + 1]) : '. (Root)'}</code></td></tr>`).join('')}
            <tr><td><code>.</code></td><td>– (Root hat keine Parent-Domain)</td></tr></table>`;
        };
        inp.oninput = upd; upd();
      },
    },
  ],
});
