/* =========================================================
   VORLAGE für ein neues Thema.
   1. Datei kopieren, z. B. nach topics/nat.js
   2. Inhalte anpassen
   3. In index.html eintragen:  <script src="topics/nat.js?v=1"></script>
   Diese Vorlage selbst wird NICHT geladen.
   ========================================================= */
registerTopic({
  id: 'mein-thema',                 // eindeutig, nur a-z, 0-9, Bindestrich
  title: 'Mein Thema',
  subtitle: 'Kurzbeschreibung',
  category: 'Adressvergabe',        // bestehende Kategorie oder neue (erscheint automatisch)
  icon: '📦',
  color: '#60a5fa',

  // Drei Erklär-Stufen (HTML). Nützliche Klassen: tbl, callout (tip|warn|exam), analogy, flow, blocks
  levels: {
    1: `<h2>Einfach erklärt</h2><div class="analogy"><div class="big">🍕</div><div>Alltagsvergleich …</div></div>`,
    2: `<h2>Prüfungswissen</h2><table class="tbl"><tr><th>A</th><th>B</th></tr><tr><td>…</td><td>…</td></tr></table>
        <div class="callout exam">Typische Prüfungsfrage …</div>`,
    3: `<h2>Profi</h2><p>Details, RFCs, Praxis …</p>`,
  },

  merke: ['Merksatz 1', 'Merksatz 2'],
  cheat: [['Begriff', 'Erklärung']],                  // Spickzettel-Zeilen
  cards: [['Vorderseite (Frage)', 'Rückseite (Antwort)']], // Karteikarten

  // Quiz: Multiple Choice -> c = Index der richtigen Antwort in a (wird gemischt)
  //       Eingabe -> type:'input', accept:[...], norm: 'text'|'compact'|'num'|'ipv6'|'iid'|'dns'
  quiz: [
    { q: 'Frage?', a: ['richtig', 'falsch 1', 'falsch 2', 'falsch 3'], c: 0, e: 'Erklärung' },
    { type: 'input', q: 'Rechenfrage?', accept: ['42'], norm: 'num', e: 'Rechenweg' },
  ],

  // Optional: Aufgaben-Generatoren (Rechentrainer, Prüfungsmodus). make() liefert eine Quizfrage.
  generators: [
    { name: 'Zufallsaufgabe', make() { const n = 2 + rnd(10); return { type: 'input', q: `2 hoch ${n}?`, accept: [String(2 ** n)], norm: 'num' }; } },
  ],

  // Optional: Inhalte für die Spiele (Wahr/Falsch nutzt automatisch die Quizfragen)
  games: {
    blitz: [() => ({ q: 'Kurze Frage?', a: ['richtig', 'falsch', 'falsch'], e: 'Erklärung' })], // a[0] = richtig
    sort: [{ name: 'Sortieren', q: 'Wohin gehört das?', bins: ['Kiste A', 'Kiste B'], items: [['Begriff', 0, 'Erklärung']] }], // oder make() => [text, bin, erklärung]
    seq: [{ name: 'Ablauf', steps: ['Schritt 1', 'Schritt 2', 'Schritt 3'] }],
    pairs: [['Begriff', 'kurze Bedeutung']], // mind. 6 Paare, kurz halten (Memory-Kacheln)
  },

  // Optional: interaktive Visualisierungen. Bausteine: UI.sequence (animierter Paketablauf), UI.pkt, UI.terminal
  visuals: [
    {
      title: '🎬 Ablauf',
      render(root) {
        UI.sequence(root, {
          actors: [{ id: 'a', label: 'Client', icon: '💻' }, { id: 'b', label: 'Server', icon: '🗄️' }],
          steps: [
            { from: 'a', to: 'b', label: 'Anfrage', kind: 'bc', title: 'Schritt 1', html: UI.pkt([['Quelle', '…'], ['Ziel', '…']]) },
            { from: 'b', to: 'a', label: 'Antwort', kind: 'uc', title: 'Schritt 2', html: '<p>…</p>' },
          ],
        });
      },
    },
  ],
});
