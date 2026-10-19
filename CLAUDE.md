# Netzwerktechnik-Trainer

Offline-Lern-App (Deutsch) für die FISI/IT-Prüfung. Reines HTML/CSS/JS, kein Build, kein Server – wird per `file://` über die Desktop-Verknüpfung geöffnet.

## Struktur
- `index.html` – lädt Kern + alle Themen-Skripte (Reihenfolge = Reihenfolge in der App)
- `js/app.js` – Router, Speicher (localStorage `nwt-progress-v1`), Quiz-Engine, Karteikarten, Prüfungsmodus, Rechentrainer, Spickzettel, UI-Bausteine (`UI.sequence`, `UI.pkt`, `UI.terminal`)
- `js/ipv6.js` – IPv6-Helfer (parse, compress, subnet, classify, eui64, solicitedNode)
- `topics/*.js` – ein Thema pro Datei via `registerTopic({...})`; Vorlage: `topics/_vorlage.js`
- `tools/verknuepfung-erstellen.ps1` – erzeugt `assets/icon.ico` und die Desktop-Verknüpfung neu

## Neues Thema hinzufügen
1. `topics/_vorlage.js` kopieren, Felder füllen: 3 Erklärstufen, merke, cheat, cards, quiz (≥ 10 Fragen), optional generators + visuals.
2. In `index.html` als `<script src="topics/<id>.js?v=1">` eintragen.
3. Bei Änderungen an bestehenden Dateien die `?v=`-Nummer in `index.html` erhöhen (Cache).
   iPhone-PWA: neue Dateien in `sw.js` → `FILES` eintragen und `VERSION` erhöhen, danach neu veröffentlichen.
4. Testen: lokaler Server (`python -m http.server 8765 --directory .`), dann im Browser per JS prüfen, dass alle `visuals` rendern und jede Generator-Frage ihre eigene `accept[0]` besteht (`checkInput`).

## Inhaltliche Konventionen
- Alles auf Deutsch, Umlaute direkt (UTF-8). Niveau: IHK-Prüfung FISI, Profi-Stufe darf tiefer gehen.
- Multiple Choice: richtige Antwort an Index `c` (Optionen werden gemischt); keine „Alle genannten“-Antworten.
- In Template-Literals kein `${` im Fließtext verwenden.
- Bisherige Themen: IPv6 (Aufbau, Subnetting, Adresstypen inkl. LLA/ULA/Loopback/Unspecified/Multicast, SLAAC), DHCP (DORA, automatische/dynamische/manuelle Zuweisung), APIPA, DNS (Hierarchie: Root/TLD/Parent-/Child-Domain; Forward-/Reverse-Lookupzone).
