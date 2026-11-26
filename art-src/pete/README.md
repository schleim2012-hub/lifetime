# Petes eigene Gegner → Spiel

1. Neuen Ordner anlegen: `art-src/pete/<name>/` mit `stand.jpg`, `walk1.jpg`, `walk2.jpg` (optional `attack.jpg`).
   Figur auf hellem, einfarbigem Hintergrund, Blick nach rechts.
2. Optional `cfg.json`: `{"height":42,"colors":36,"sat":1.3,"tol":38,"holes":false,"cover":null}`
   - `tol`: Toleranz fürs Freistellen (kleiner, wenn die Figur selbst viel Weiß hat)
   - `holes`: eingeschlossene Hintergrundflächen (zwischen Beinen/Armen) entfernen
   - `cover`: Bereich (relativ zur Figurhöhe) mit Kleidung übermalen
3. `python3 art-src/pete/petesprite.py` → schreibt `www/js/artpete.js` und Vorschauen nach `art-src/pete/out/<name>_dbg.png`.
4. Werte/Name/Fähigkeiten in `www/js/v05c.js` → `PETE_MOBDEF.<name>` eintragen.
   Ohne Eintrag erscheint der Gegner automatisch als leichter Zombie (Stufen 1–2).
