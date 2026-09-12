# Firebase für die Klasse

Die vorhandene Anwendung bleibt erhalten. Für GitHub Pages werden weiterhin keine Installation und kein Build benötigt.

## Einmalige Einrichtung

1. In Firebase beim Projekt **die-gestohlene-mona-lisa** unter **Authentication → Anmeldemethode → Anonym** den Anbieter aktivieren. Das ist bereits erfolgreich getestet.
2. Unter **Realtime Database → Regeln** den gesamten Inhalt von `database.rules.json` einfügen und **Veröffentlichen** wählen. Die Regeln gelten für diese Datenbank; sie ersetzen deren bisherige Regeln.
3. In der ersten Zeile von `script.js` für den echten Unterrichtstest einstellen:

   ```js
   const DEMO_MODE = false;
   ```

   Mit `true` läuft weiterhin die lokale Demo ohne Firebase. Die Speicherbereiche beider Modi sind getrennt.
4. `index.html`, `style.css`, `script.js`, **`firebase-sync.js`** und den Ordner `assets` gemeinsam in das GitHub-Pages-Verzeichnis hochladen. Die JSON-Regeln müssen in Firebase veröffentlicht werden; ein Upload der JSON-Datei zu GitHub allein aktiviert sie nicht.
5. Auf allen iPads dieselbe GitHub-Pages-Adresse öffnen und die Seite neu laden. Die Firebase-Module werden über HTTPS von Googles CDN geladen. Im Firebase-Modus die Anwendung über HTTPS oder einen lokalen Webserver öffnen, nicht per Doppelklick als `file://`.

## Erster Test

- Auf Gerät 1 eine Gruppe mit drei Personen erstellen und den vierstelligen Code weitergeben.
- Auf zwei weiteren Geräten beitreten: Die Rollen A, B und C sowie der vollständige Warteraum müssen auf allen drei Geräten erscheinen.
- Die Fallakte öffnen. Jede Person liest ihre eigenen Karten und bestätigt anschließend ihre Bereitschaft.
- Auf der gemeinsamen Wand verschiedene Karten gleichzeitig verschieben, eine Verbindung anlegen und löschen sowie einen Joker öffnen. Die Änderungen müssen bei allen erscheinen.
- Auf einem Gerät kurz die Verbindung trennen, eine Karte ablegen und wieder verbinden. Die Meldung muss verschwinden und die Änderung übertragen werden.
- Das gemeinsame Urteil und die Begründungen abgeben. Die Auflösung wird erst nach bestätigter vollständiger Beweisführung freigeschaltet. Die eigenen Merksätze bleiben gerätespezifisch.

Für mehrere unabhängige Rollen verschiedene Geräte oder getrennte Browserprofile verwenden. Mehrere Tabs desselben Browserprofils verwenden im Firebase-Modus dieselbe anonyme Gerätekennung. Im Demo-Modus können Tabs weiterhin verschiedene Rollen übernehmen.

## Daten und Synchronisation

- Die zufällige anonyme Firebase-UID dient als `MEMBER_ID`. Firebase Authentication speichert sie dauerhaft im jeweiligen Browser. Die App fragt keine Namen oder E-Mail-Adressen ab.
- Persönliche Notizen, Kartenmarkierungen, unbeantwortete Entwürfe und eigene Merksätze bleiben ausschließlich im lokalen Browser-Speicher.
- Gemeinsam gespeichert werden Mitglieder/Rollen/Verbindungsstatus, Phasen, Bereitschaft, Kartenpositionen, Verbindungen, aussortierte Karten, Joker, Urteil und Auflösungsstatus. Hinzu kommen eingereichte Begründungen zur bestehenden Abschlussprüfung sowie das gemeinsame Feld „Vermutungen und offene Fragen“ einschließlich Handschrift.
- Die Gruppenkennung `settings.instanceId` verhindert, dass eine alte Sitzung versehentlich eine neu angelegte Gruppe mit wiederverwendetem Code verändert.
- Transaktionen reservieren Gruppencodes und Rollen und wenden Änderungen auf den aktuellen Gruppenstand an. Gleichzeitige Änderungen verschiedener Karten überschreiben dadurch nicht die gesamte Wand mit einem veralteten Stand. Bei derselben Karte bzw. demselben gemeinsamen Text gilt die zuletzt bestätigte Änderung.
- Kartenbewegungen werden erst beim Ablegen übertragen. Listener stellen den empfangenen Stand dar, ohne ihn erneut zu speichern.
- `onDisconnect` kennzeichnet unterbrochene Geräte als offline. Eine unterbrochene Verbindung gibt deren Rolle nicht frei. Im Warteraum kann die Gruppe bewusst verlassen werden; die Rollen der übrigen Geräte bleiben gleich.
- Bei einer Unterbrechung bleiben Änderungen im offenen Tab vorgemerkt und werden bei Wiederverbindung übertragen. **Den Tab bis dahin geöffnet lassen.** Ungesendete Änderungen werden über ein Neuladen hinweg nicht automatisch wieder in Firebase eingespielt. Lokale Notizen bleiben gespeichert; die gemeinsame Wand wird bei Wiederaufnahme vom Server geladen.
- Das gemeinsame Zurücksetzen löscht die betreffende Gruppe. Andere Gruppen bleiben bestehen. Auf den anderen Geräten lokal gespeicherte persönliche Notizen werden dadurch nicht fern-gelöscht.

Die mitgelieferten Regeln erlauben anonym angemeldeten Geräten den Zugriff auf einen konkreten Gruppencode, nicht das Auflisten aller Gruppen. Gruppenmitglieder dürfen gemeinsam arbeiten und ihre Gruppe zurücksetzen; weitere Geräte dürfen im Warteraum beitreten. Dies ist eine kooperative Unterrichtsanwendung, keine manipulationssichere Prüfungsplattform.

## Geänderte Dateien

- `script.js`: bestehende Funktionen mit Firebase-Transport verbunden; Demo-Modus erhalten.
- `firebase-sync.js`: CDN-Module, anonyme Anmeldung, Transaktionen, Echtzeit-Listener und Wiederverbindung.
- `index.html`: Meldungsfeld für Verbindungsprobleme; bei normaler Verbindung unsichtbar.
- `database.rules.json`: Regeln zur Veröffentlichung in Firebase.
- `FIREBASE-ANLEITUNG.md`: diese Anleitung.

`style.css`, Karteninhalte und Bilddateien bleiben unverändert.

## Technische Referenzen

Offizielle Firebase-Dokumentation: [Browser-Module ohne Build](https://firebase.google.com/docs/web/alt-setup), [anonyme Anmeldung](https://firebase.google.com/docs/auth/web/anonymous-auth), [Transaktionen](https://firebase.google.com/docs/database/web/read-and-write), [Verbindungsstatus und Offline-Verhalten](https://firebase.google.com/docs/database/web/offline-capabilities), [Datenbankregeln](https://firebase.google.com/docs/database/security/core-syntax).
