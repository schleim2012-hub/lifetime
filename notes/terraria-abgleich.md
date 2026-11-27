# Lifetime ↔ Terraria – Abgleich & Arbeitsplan

Stand: 27.11.2026 · Code-Stand **v0.7 (Commit af057f0, Tag v0.7, versionCode 8)** · Quelle: https://terraria.wiki.gg/ (Desktop 1.4.6.x)
Start der nächsten Arbeitsrunde: **Donnerstag 03.12.2026, 9:00 (Europe/Berlin)** → direkt bei Abschnitt 5 / Etappe 0 einsteigen.

**Ziel von Pete:** „so nah wie möglich am Original“ (Terraria-Spielgefühl, Fortschritt, Optik), aber **eigene Figuren, eigene Story, eigene Namen**, gemischt mit den Survival-Teilen aus 7 Days to Die u. a. (Hunger/Durst/Kälte, Blutmond-Horde, Perks, Plündern) – **plus Zauberstäbe/Magie**.

**Harte Regeln (bleiben):**
- Keine Terraria-Grafiken, -Sounds oder -Texte kopieren. Keine Terraria-Namen im Spiel (Wiki-Namen stehen hier nur als Referenz). Eigene Sprites (GenerateImage → Pete-Pipeline oder prozedural).
- Spieltexte Deutsch. Schwester bleibt FSK16 wie Petes Vorlage.
- `build_data.py` und `tools/build3.js` **nie** ausführen. Nichts löschen außer eigenen Build-Artefakten. Keystore-Passwort nie ausgeben.
- Git-Identität `schleim2012-hub <schleim2012-hub@users.noreply.github.com>`, Repo `schleim2012-hub/lifetime`, Arbeitsordner `/workspace/lifetime`.
- Build nur über `android/build.sh <versionCode> <versionName>`; APK auf gh-pages als `Lifetime.apk`, per curl prüfen (200, `application/vnd.android.package-archive`, sha256), Kopie nach `/workspace/mlserve/Lifetime.apk`.
- Tests: Playwright-core + `/usr/bin/google-chrome`, Mobile-Touch-Emulation. Screenshots nach `/workspace/lifetime/shots/v08/` (gitignored).
- Alte Spielstände sauber behandeln (Hinweis/Migration, kein Absturz).

---

## 1) Funktions-Tabelle: Lifetime hat ✅ / teilweise 🟡 / fehlt ❌

Legende Spalte „Terraria“ = Referenzverhalten laut Wiki. „Lifetime v0.7“ = was im Code steckt (Datei in Klammern).

### 1.1 Spielerfortschritt
| Bereich | Terraria (Referenz) | Lifetime v0.7 | Status |
|---|---|---|---|
| Zwei Weltphasen | Pre-Hardmode → Hardmode nach Sieg über den Unterwelt-Boss; Welt bekommt V-förmige Streifen aus „böser“ und „heiliger“ Zone, neue Erze erst nach Altar-Zerstörung | Keine Weltphase; Schwierigkeit nur über Entfernung vom Wrack + Tiefe + Nacht/Blutmond (`tierAt` in ai.js, v07 erweitert) | ❌ |
| Gating über Bosse | Jeder Boss schaltet Material/Erz/NPC frei (z. B. Boss 2 → dunkles Erz, Dungeon-Boss → Dungeon offen) | Bosse droppen Einzelwaffen (Kettensäge, Flügel, Fernbedienung), schalten aber nichts frei | 🟡 |
| Leben | 100 HP Start, Lebenskristall +20 bis 400, Lebensfrucht +5 bis 500 | 100 HP, „Herz des Berges“/„Sternenherz“ je +20 (Boss-/Kometendrop) | 🟡 |
| Mana | 20 Start, Manakristall +20 bis 200 (max 400 mit Gear) | – | ❌ |
| Charakter-Stufen | keine (nur Ausrüstung) | XP, Level, Attribute & Perk-Karten im 7-Days-Stil, Hefte (skills.js) | ✅ (bewusster Mix, behalten) |
| Survival-Werte | keine | Hunger, Durst, Ausdauer, Wärme, Atem (7DTD-Mix) | ✅ (behalten) |

### 1.2 Gegner, Bosse, Events
| Bereich | Terraria | Lifetime v0.7 | Status |
|---|---|---|---|
| Gegner je Biom | Jedes Biom + Schicht hat eigene Gegnerliste (Wald: Zombie/Dämonenauge nachts, Schleime tags; Wüste: Ameisenlöwe/Geier; Schnee: Eis-Gegner; Untergrund: Riesenwurm, Skelett, Fledermaus; Unterwelt: Dämonen, Höllenfledermäuse …) | Zwei Pools (Oberfläche/Untergrund) nach Tier 0–5, Biom spielt keine Rolle (`TIER_POOLS` ai.js:84) | 🟡 |
| Tag/Nacht-Gegner | Tags harmlos (Schleime), nachts Zombies/Augen | Zombies tags+nachts, nachts +1 Tier | 🟡 |
| Fliegende Gegner | Augen, Fledermäuse, Harpyien, Geier | Zombiegeier, Geierkönigin | 🟡 |
| Würmer (Segment-Gegner) | Riesenwurm, Knochenschlange, Wurm-Boss | – | ❌ |
| Mini-Bosse | Event-Minibosse | Doppelkopf, Armige, Spinnenfrau, Brocken, Mantelmann, Säge-Sepp | ✅ |
| Bosse | 8 Pre-Hardmode + 10 Hardmode + 14 Event-Bosse; Beschwörungs-Item **oder** Umgebungs-Trigger; Status-Meldung beim Erscheinen/Tod; Boss-Leiste; eigene Musik; Teleport bei Feststecken | Fleischberg (Opfergabe), Geierkönigin (Aas-Pfeife), Mainstream-TV-Zombie (Generator-Trigger); Boss-Leiste, Boss-Musik, Banner, Teleport | 🟡 (Mechanik gut, Anzahl klein) |
| Natürliches Boss-Spawnen | z. B. „Auge“-Boss nachts 1/3, wenn Spieler ≥200 HP + ≥10 Verteidigung + 3 NPCs | nur TV-Zombie (2 Tage nach Generator) | 🟡 |
| Blutmond | Zufällig 1/9 je Nacht (ab >120 HP), Wasser/Regen rot, eigene Gegner, Schlafen gesperrt | Fest jede 7. Nacht ab 20 Uhr, Horde-Wellen (7DTD), HUD-Welle | ✅ (Mix behalten, Terraria-Elemente ergänzen) |
| Invasionen mit Fortschrittsbalken | Goblin-Armee, Piraten, Frost-Legion, Marsianer … (Balken, Spawnpunkt am Weltrand, Bereich ±187 Kacheln) | – | ❌ |
| Wetter | Regen, Gewitter, Sandsturm, Wind, Sternschnuppen | Sternschnuppen/Kometen (v04), Regentonne; kein sichtbarer Regen/Sturm | 🟡 |
| Friedliche Events | Party, Laternennacht nach Boss-Sieg | – | ❌ |

### 1.3 Welt
| Bereich | Terraria | Lifetime v0.7 | Status |
|---|---|---|---|
| Schichten | Weltraum → Oberfläche → Untergrund → Höhlen (oben/unten, Lava unten) → Unterwelt (unterste ~150 Kacheln, Lava) | 3200×300; Oberfläche + Untergrund mit Höhlen, Pilzhöhlen, Nestern (lairs); **keine Unterwelt, keine Lava, kein Weltraum** | 🟡 |
| Oberflächen-Biome | Wald, Wüste, Schnee, Dschungel, Ozean (beide Ränder), böse Zone, heilige Zone, Pilz | Mischwald, Kiefernwald, Wüste, Verbrannte Zone, Stadt, Schneefeld, Ödland, Vororte, Seen | ✅ (eigene Biome, gut) |
| Untergrund-Biome | Eis-Höhlen, Dschungel-Höhlen, Untergrund-Wüste, Pilz-Biom, Spinnennester, Granit/Marmor | Pilzhöhlen, Nester | 🟡 |
| Strukturen | Dungeon, Tempel, schwebende Inseln, unterirdische Hütten mit Truhen, Meteoriten | Wrack, Stadt/Hochhäuser, Vororte, Camps, Waldhaus, Kannibalen-Lager, Tresore | ✅ |
| Biom-Ausbreitung | Böse/heilige Zone breiten sich aus | – | ❌ |
| Physik | Sand fällt, Wasser/Lava/Honig fließen, Obsidian aus Wasser+Lava | Sand/Kies fällt, Wasser nivelliert, Statik-Einsturz, Explosionen (v06) | ✅ (teils mehr als Original) |

### 1.4 Crafting, Erze, Ausrüstung
| Bereich | Terraria | Lifetime v0.7 | Status |
|---|---|---|---|
| Stationen | Hand → Werkbank → Ofen → Amboss → (Flaschen/Alchemie, Sägewerk, Webstuhl, Kochtopf, Tüftlerwerkstatt) → Hardmode-Amboss/-Schmiede → Spezialstationen; Stationen in Reichweite werden kombiniert | Hände, Lagerfeuer, Werkbank, Esse (Ofen+Amboss in einem), Chemiestation (data.js:238) | 🟡 |
| Erz-Tiers | Kupfer/Zinn → Eisen/Blei → Silber/Wolfram → Gold/Platin → Meteorit → Dämonit/Purpurit → Obsidian → Höllenstein → (HM) Kobalt/Palladium → Mithril/Oreichalkos → Adamantit/Titan → Geweihte Barren → Chlorophyt → Luminit | Kohle, Eisenerz, Salpeter, Titanerz; Schrott → Eisen | 🟡 (nur 2 Metall-Tiers) |
| Spitzhacken-Gating | Erz braucht Mindest-Spitzhackenkraft | Werkzeugstärke `tool.pick` 0.4–6 vorhanden, aber kaum Erz-Sperren | 🟡 |
| Rezeptketten | Erz → Barren (3–4:1) → Werkzeug/Waffe/Rüstung-Set je Tier | Erz → Barren → wenige Werkzeuge/Waffen; Rüstung meist geplündert | 🟡 |
| Rüstung | 3 Slots (Kopf/Brust/Beine), **Set-Boni**, sichtbar am Spieler | 4 Slots (Kopf/Brust/Beine/Füße) + 1 Zubehör, sichtbar, Wärme-Wert, **keine Set-Boni** (equip.js) | 🟡 |
| Accessoires | 5 Slots (+1 Experte), kombinierbar an der Tüftlerwerkstatt, Modifikatoren | 1 Zubehör-Slot (Flügel, Stirnlampe, Hasenpfote) | 🟡 |
| Modifikatoren/Umschmieden | Zufalls-Präfix (z. B. „Flink“, „Gottgleich“), Umschmieden beim Goblin | – | ❌ |
| Tränke/Buffs | viele Tränke (Heilen, Mana, Ausdauer …), Trankkrankheit | Essen/Medizin mit Sofortwerten, Kaffee/Cola Ausdauer; Buff-System klein | 🟡 |

### 1.5 Kampf & Waffenklassen
| Bereich | Terraria | Lifetime v0.7 | Status |
|---|---|---|---|
| Nahkampf | Schwungbogen, Autoswing, Rückstoß, Krit 4 % Basis ×2 | Schwungbogen, Autoswing, Rückstoß-Werte je Waffe, Krit 4 % + Perks (v04 Abschnitt 5) | ✅ |
| Fernkampf | Bögen/Pfeile, Schusswaffen/Kugeln, Munitions-Slots | Bogen, Armbrust, Pistole, Schrotflinte, Pfeile/9mm/Schrot, Fernbedienung (Akkus) | ✅ |
| Wurfwaffen | (früher eigene Klasse) | Wurfmesser, Schrottstern, Molotow, Rohrbombe | ✅ |
| Magie | Mana-Kosten, Stäbe/Zauberbücher/Magie-Waffen, Mana-Regen, Manasterne | – | ❌ |
| Beschwörer | Minions (Slots), Wächter/Sentries, Peitschen (Markierung) | – | ❌ |
| Schadensformel | ±15 % Streuung; Verteidigung zieht halben Wert ab (Classic) | ±10 % Streuung; `def*0.5` Abzug | ✅ (Streuung auf ±15 % angleichen) |
| Rückstoß | Kategorien schwach…irrsinnig; KB-Resistenz je Gegner; Bosse immun; „starker Treffer“ (>1/10 max-HP) addiert 2×KB; Krit ×1,4 KB | Fester KB je Waffe; keine KB-Resistenz-Tabelle; Spieler-KB unklar | 🟡 |
| Unverwundbarkeit (iFrames) | Spieler 0,67 s nach Treffer (0,33 s bei 1 Schaden); Spieler blinkt | `P.inv_t=0.67` (v04) | ✅ (Blinken prüfen) |
| Schadenszahlen | Orange auf Gegner, Krit größer/rot, Spieler-Schaden rot, Heilung grün | Orange, Krit rot + „!“ | ✅ |
| Lebensbalken Gegner | kleiner Balken unter Gegner bei Schaden | 3 s nach Treffer (v04) | ✅ |

### 1.6 NPCs, Bauen, Fischen, Licht, UI
| Bereich | Terraria | Lifetime v0.7 | Status |
|---|---|---|---|
| Stadt-NPCs | 26 NPCs, ziehen bei Meilensteinen ein, brauchen gültige Häuser, Shops (Münzen), Zufriedenheit, Wanderhändler | 9 NPCs mit Rollen (Mechaniker, Schützin, Sanitäter, Kiosk, Funker, Sheriff, Jägerin …), Dialoge, Handel mit Kronkorken, Anwerben/Folgen | 🟡 |
| Häuser | Raum ≥60 Kacheln inkl. Rahmen, ≤750; Hintergrundwand; Lichtquelle; Tisch; Stuhl; Tür/Plattform; Wohnungsmenü | Hintergrundwand = Unterschlupf; kein Wohnungs-Check | ❌ |
| Bauen/Mobiliar | hunderte Möbel, Sets, Plattformen, Hämmern (Halbblöcke/Schrägen), Farbe, Kabel | Blöcke, Wände, Türen, Plattformen, Leiter, Möbel-Deko (v04/v06), Fallen | 🟡 |
| Fischen | Angel + Köder, Gewässer ≥75 Kacheln (300 optimal), Fänge nach Biom/Schicht, Kisten, Angler-Quests | – | ❌ |
| Licht | Kachel-Licht mit Farbe, Ausbreitung (Luft weit, Blöcke stark gedämpft), Fackeln (Reichweite ~42 Luft / 7 Block), Biomfackeln | Kachel-Licht mit Farblicht, 2 Ausbreitungs-Pässe, Blöcke dämpfen stärker (core.js:45ff), Stirnlampe, Fackeln | ✅ (feiner abstufen) |
| Inventar | 50 Slots (10 Hotbar), 4 Münz-, 4 Munitions-Slots, Müll, 3 Rüstung + Vanity + Farbe, 5 Accessoires, Crafting-Liste | 50 Slots, Hotbar 10, Ausrüstung 5 Slots, Rucksack-UI, Crafting nach Station | 🟡 (Müll, Munition, Vanity fehlen) |
| HUD | Herzen oben rechts (20 HP/Herz), Manasterne als senkrechte Spalte rechts daneben, Buff-Icons unter Hotbar, Minimap, Boss-Leiste unten, Event-Balken | Herzen oben rechts (20 HP/Herz), Survival-Balken, Minimap, Boss-Leiste, Blutmond-Countdown | 🟡 (Mana + Buff-Icons fehlen) |
| Bewegung | Laufen mit Beschleunigung, Sprung ca. 5 Kacheln, Plattformen durchspringen, Flügel/Ballons/Stiefel, Enterhaken | Laufen, Springen, Plattformen, Leitern, Flügel (Doppelsprung/Gleiten) | 🟡 (Haken, Lauf-Accessoires fehlen) |
| Reittiere | viele | – | ❌ (niedrige Prio) |

---

## 2) Gegner-Optik-Abgleich mit konkreten Mal-Vorgaben

### 2.1 Gemessen (Wiki-Spritedateien, nur ausgemessen, nichts übernommen)
| Referenz | Pixel im Spiel (B×H) | Bemerkung |
|---|---|---|
| Erdblock | 16×16 | 1 Kachel |
| Spielfigur (Guide-NPC als Maßstab) | 26×46 | ca. 2,9 Kacheln hoch |
| Zombie | 34×46 | gleiche Höhe wie Spieler, breiter (Arme vorgestreckt) |
| Blut-Zombie | 38×44 | |
| Skelett | 30×46 | |
| Dämonenauge | 36×22 | |
| Höhlenfledermaus | 26×18 | |
| Schleim | 32×22 | |
| Harpyie | 78×52 | Flügel weit |
| Clown (Blutmond-HM) | 58×98 | ~2× Spielerhöhe |
| Boss Schleimkönig | 162×144 | |
| Boss Skelett-Kopf | 80×102 | |
| Boss Hirsch-Zyklop | 138×206 | ~4,5× Spielerhöhe |
| Boss Fleischwand | 209×420 | füllt Bildschirmhöhe |
| Kurzschwert / Breitschwert | 32×32 / 36×36 | diagonal |
| Zauberstab (Funken) | 26×28 | |

**Wichtigster Befund – Pixeldichte:** Alle geprüften Terraria-Sprites (Zombie, Guide, Auge, Erde, Schwert, Blut-Zombie) bestehen zu **100 % aus 2×2-Pixelblöcken**. Ein „Kunst-Pixel“ = 2×2 Bildschirm-Pixel; eine Kachel = 8×8 Kunst-Pixel. Farben pro Sprite: 6 (Erde) bis ~36 (Guide), typisch 10–25.

**Lifetime v0.7:** T=16 wie Terraria, Spieler-Hitbox 14×40 (≈2,5 Kacheln) – Größe passt. Aber:
- Gegner/Spieler sind mit **1-px-Raster** gemalt (prozedurale Chibis in sprites.js, Pete-Pipeline mit 24–48 Farben, KI-Sprites aus v04). Dadurch wirkt alles feiner/unruhiger als Terraria und die drei Quellen sehen unterschiedlich aus.
- Laufanimation: prozedural 8 Frames (`w0..w7`), Angriff 4 Frames (`a0..a3`), Pete-Sprites nur stand/walk1/walk2/attack/grab, Minigegner nur 1 Frame.

### 2.2 Verbindliche Mal-Vorgaben ab 0.8 („Terraria-nah“)
1. **Raster:** Alles auf **2-px-Raster** (Kunstauflösung = halbe Weltauflösung, dann nearest-neighbor ×2). Gilt für Spieler, Gegner, NPCs, Items, Projektile, Möbel. Kacheln bleiben 16×16 Welt = 8×8 Kunst-Pixel.
2. **Größen (Kunst-Pixel, ×2 = Welt-Pixel):**
   - Mensch/Zombie normal: **15–19 × 22–23** (Welt 30–38 × 44–46). Spieler-Sprite ~13×23.
   - Kleine Gegner (Hund, Kriecher, Hase, Huhn): 10–18 × 7–11.
   - Flieger (Geier): 13–18 × 9–11, Flügel in 2 Posen.
   - Dicke (Fettsack, Kotzer): 19–22 × 23.
   - Minibosse: 24–40 Kunst-Pixel hoch (≈1,1–1,8× Spieler).
   - Bosse: 60–110 Kunst-Pixel hoch (Welt 120–220). TV-Zombie (jetzt 98×122 Welt, 1-px) → **49×61 Kunst-Pixel** im 2-px-Raster neu rastern.
   - Minigegner aus dem TV (Hannes, Graf Bissfest, Manni, Clownchen, Bumbum): 8–10 × 12–13 Kunst-Pixel (Welt ~24–26 hoch, wie jetzt).
3. **Farben:** normale Gegner **≤ 20 Farben**, Minibosse ≤ 28, Bosse ≤ 40. 3–4 Töne pro Material (Licht, Grund, Schatten, Tiefschatten). **Farbton beim Schattieren verschieben**: Schatten Richtung Blau/Violett, Lichter Richtung Gelb (nicht nur dunkler/heller).
4. **Umriss:** geschlossener Umriss im **dunkelsten Ton des jeweiligen Materials** (nicht reines Schwarz); innen nur dort Linien, wo sich Formen überlappen (Arm vor Körper). Keine Kanten-Glättung, keine halbtransparenten Ränder (Pipeline: Alpha hart auf 0/255).
5. **Licht im Sprite:** von oben (leicht von vorne). Das Weltlicht färbt die Sprites zusätzlich (Lifetime tut das schon).
6. **Silhouette-Test:** Jeder Gegner muss als **schwarze Fläche auf 1× Zoom** erkennbar sein. Pro Gegner **ein Erkennungsmerkmal**, das aus der Silhouette ragt: Brandmeister = Helm mit Krempe, Schmier-Bulle = Schirmmütze, Soldat = Gasmaskenrüssel, Bauarbeiter = Bauhelm + Schaufel, Clown = Haarbüschel + große Schuhe, Kreischerin = lange Haare + offener Mund, Rammbock = Schulterpanzer, Säge-Sepp = Kettensäge, Spinnen-Karl = Beine außen, Kriecher = flach. Zombies: Arme vorgestreckt (wie Original), leicht vorgebeugt.
7. **Proportionen:** Kopf ≈ 1/3 der Figurhöhe (Kopf 8–9 Kunst-Pixel bei 23 Höhe), Beine kurz, Hände 2×2. Das ist der „Terraria-Chibi“. Bosse dürfen realistischer/grotesker sein.
8. **Animationen (Frames):**
   - Spieler: Laufzyklus 12–14 Frames (Beine), Arme separat (Schwung 4 Frames), Sprung 1, Fallen 1. Rüstung in Schichten (Kopf/Körper/Beine) – Lifetime hat schon sichtbare Ausrüstung, Schichten auf 2-px-Raster bringen.
   - Einfache Gegner: **3 Lauf-Frames** + 1 Sprung reicht (Original wirkt bewusst „ruckelig-niedlich“). Flieger 2–4 Flügelframes. Schleim-Typen 2 Frames.
   - Bosse: 2 Phasen mit sichtbarem Wechsel (z. B. TV-Bildschirm zerspringt → Phase 2), je 3–6 Frames.
   - Treffer: kurzer Rückstoß + Blutpartikel/Funken; **kein** langer Weiß-/Rot-Blitz (Lifetime-Rotblitz kurz halten, ≤0,1 s).
   - Tod: Gegner zerfällt in 2–4 „Gore“-Teile (Kopf, Arm, Bein) + Partikel – passt zu den Ragdolls aus 0.6.
9. **Items/Icons:** 2-px-Raster, Waffen diagonal von unten-links nach oben-rechts, Größe je Item unterschiedlich (Schwert 16–18 Kunst-Pixel, Stab 13×14, Erz 6–8). Im Schwung wird das Icon gedreht gezeigt (Lifetime macht das schon).
10. **UI-Stil:** halbtransparente blaue/dunkle Slot-Kästen mit hellerem Rand (Original) → Lifetime behält seine düstere Rost-Textur, aber Slot-Größe/-Anordnung wie Original (siehe 1.6).

### 2.3 Mal-Vorgaben je vorhandenem Lifetime-Gegner (Kurzliste)
| Gegner | Neu-Größe (Kunst-Px) | Merkmal / Farben |
|---|---|---|
| Schlurfer | 17×23 | Grünlich-graue Haut (4 Töne), blaues Hemd zerrissen, Arme vor, 3 Lauf-Frames |
| Schwester Grausam / Schocktherapie | wie Petes Vorlage | **nicht verändern ohne Pete-OK** (FSK16-Vorlage); nur falls Pete zustimmt: auf 2-px rastern |
| Brandmeister Kokel | 17×23 | Gelbe Jacke mit Reflexstreifen, roter Helm mit Krempe |
| Glüh-Kotzer | 20×23 | Leuchtgrüne Flecken (Glow-Ebene separat), dicker Bauch |
| Fettsack Bertl | 21×23 | Weißes Unterhemd, Bauch über Hose |
| Kriecher | 16×8 | flach, Arme ziehen, 3 Frames |
| Spinnen-Karl | 15×14 | 6–8 Beine aus Silhouette |
| Zombiehund | 14×10 | Rippen sichtbar, 4 Frames Galopp |
| Zombiegeier | 15×10 | 3 Flügelframes |
| Schmier-Bulle | 17×23 | Mütze, dunkelblau |
| Kreischerin | 17×23 | lange weiße Haare, Mund offen |
| Gasmasken-Gefreiter | 17×23 | Helm + Rüssel, Oliv |
| Clown Kicherich | 17×24 | rote Nase, Haarbüschel, große Schuhe |
| Rammbock | 19×23 | breite Schultern |
| Brocken / Mantelmann | 20×26 / 12×28 | Brocken massig, Mantelmann lang & dünn |
| Doppelkopf / Armige / Spinnenfrau | 14×22 / 16×24 / 18×16 | Mutanten: Haut rosa-violett verschoben |
| Fleischberg (Boss) | 40×33 | pulsierend (3 Frames Atmen) |
| Geierkönigin (Boss) | 40×22 | 4 Flügelframes, Krone |
| Mainstream-TV-Zombie (Boss) | 49×61 | CRT-Kopf, Rauschen animiert (eigene 2-Frame-Ebene), Phase 2: Bildröhre gesprungen |
| Hase / Hirsch / Huhn | 7×6 / 14×17 / 6×7 | friedlich, helle Töne |

---

## 3) Magie-System-Entwurf (Apokalypse, eigene Namen)

### 3.1 Idee & Story-Anker
Der Komet aus dem Intro hat **Kometenstaub** über die Welt verteilt. Wer ihn bündelt, kann „Funken“ wirken. Drei Strömungen: **Strahlung** (Reaktor/Fallout), **Elektro** (Strom, Generator aus 0.7), **Kometenstaub** (kosmisch). Dazu zwei Biom-Schulen: **Frost** (Schneefeld, nutzt vorhandenen Eiskristall) und **Sporen** (Pilzhöhlen, nutzt Leuchtpilz).

### 3.2 Ressource „Funkenenergie“ (FE) – Mana-Analog
- Anzeige: **cyanfarbene Kometensterne** als senkrechte Spalte rechts neben den Herzen (wie Original), 1 Stern = 20 FE. Falls auf dem Handy zu eng: Reihe direkt unter den Herzen.
- Start **20 FE**, je **Kometenkern** +20 bis **200** (max. 400 mit Ausrüstung). Kometenkern = 5 Kometenstaub an der Werkbank (Original: Manakristall aus 5 gefallenen Sternen).
- Regeneration (Original-Formel übernehmen, eigene Werte erlaubt): `Rate = (maxFE/3 + 1 + Bonus) × (2 wenn stillstehend) × (0,5 + 0,5·FE/maxFE)`; pro Sekunde = Rate/2. Nach Zaubern kurze Regenerations-Pause (~1 s skaliert mit fehlender FE).
- Zu wenig FE: Zaubern erlaubt, aber Wirkgeschwindigkeit −60 % (Original-Regel).
- **Funkenperlen** (Manastern-Analog): fallen von Gegnern, wenn FE nicht voll, +FE beim Aufsammeln.
- **Kometenstaub** fällt nachts bei **Kometenschauern** (v04-Kometen erweitern), glüht, verschwindet bei Tagesanbruch.
- Trank: **Leuchtbrause** (+50/+100 FE) → danach Debuff **„Strahlenkater“** (−Magieschaden, sinkt in 5 s ab; Original: Mana-Krankheit).
- Perk-Anbindung: Attribut **Intellekt** (gibt es in skills.js) bekommt Perks „Funkenkunde“ (+10 % Magieschaden/Stufe), „Kaltes Blut“ (−5 % FE-Kosten/Stufe), „Antennenkopf“ (+20 max FE).

### 3.3 Waffen-Unterklassen
| Typ | Original-Pendant | Lifetime-Name & Wirkung (Vorschlag) |
|---|---|---|
| Zauberstäbe | Stäbe/Zepter | „Stab“ / „Rute“ – geradeaus oder gelenkt |
| Zauberbücher | Spell Books | „Handbuch“ / „Fibel“ / „Kladde“ (apokalyptische Notizbücher) |
| Magie-Geräte | Magic Guns | „Geräte“: Geigerkanone, Teslaspule |
| Beschwörung | Minion-Stäbe | „Rufer“ (Pfeife/Fernsteuerung) – Begleiter |
| Wächter | Sentries | „Selbstschuss-Anlage“, „Tesla-Pfosten“ |
| Peitschen | Whips | „Starkstromkabel“, „Stacheldraht-Peitsche“ (markiert Ziel für Begleiter) |

### 3.4 Startliste (Pre-Hardmode, Werte grob nach Original-Kurve 8–35 Schaden)
| Name | Schule | Schaden | FE | Wirkung | Herkunft |
|---|---|---|---|---|---|
| Funkenstab | Elektro | 12 | 4 | Kurzer Funke, kann „Brennt“ auslösen | Werkbank: Holz 10, Kabelbund 2, Autobatterie 1 |
| Sporenzepter | Sporen | 10 | 5 | Leicht zielsuchende Spore, Gift | Leuchtpilz 15, Holz 5 (Werkbank) |
| Frostspule | Frost | 15 | 5 | Eis-Splitter, verlangsamt | Eiskristall 8, Kabelbund 2 |
| Strahlrohr | Strahlung | 17 | 7 | Grüner Strahl durchdringt 2 Gegner, „Verstrahlt“ (DoT) | Strahlenlabor: Eisen 8, Uranstaub 6 |
| Rohrbruch-Fibel (Buch) | Wasser | 19 | 8 | Prallender Wasserball (springt 5×) | Fund in Bunker-Truhe |
| Kometenrute | Kometenstaub | 24 | 10 | Kometensplitter fallen schräg vom Himmel auf Zielpunkt | Kometenstaub 20, Kometit-Barren 8 |
| Tesla-Kladde (Buch) | Elektro | 22 | 12 | Kettenblitz springt auf 3 Ziele | Drop Kometenseher-Shop / Boss |
| Rattenflöte (Rufer) | Beschwörung | 8 | 10 | 1 Ratten-Begleiter (Slot 1) | Kanalisation-Truhe |
| Drohnen-Fernsteuerung (Rufer) | Beschwörung | 14 | 10 | Mini-Drohne schießt | Generator-Werkbank |
| Starkstromkabel (Peitsche) | Beschwörung | 14 | – | Markiert Ziel (+Begleiterschaden) | Kabelbund 10, Akku 2 |
| Fernbedienung des Grauens | Elektro | 34 | 6 FE **oder** Akku | TV-Strahl (gibt es schon); Vorschlag: zusätzlich FE nutzbar | TV-Zombie |

Hardmode-Ausblick: „Kernschmelze-Stab“ (Strahlung, Flächen-DoT), „Sternfall-Buch“ (Kometenregen), „Blitzableiter“ (Elektro, Gewitter verstärkt), „Krähenschwarm-Rufer“, „Satelliten-Rufer“.

### 3.5 Magie-Ausrüstung
- **Rüstungssets mit Set-Bonus:**
  - *Bastelhaube + Funkenkittel + Kabelhose* (früh): +40 max FE, Set: −10 % FE-Kosten.
  - *Strahlenschutzanzug* (Gasmaske + Overall + Gummistiefel): Set: Immun gegen „Verstrahlt“, Strahlung-Zauber +15 %.
  - *Kometenkutte* (Kapuze + Kutte + Sandalen): +60 max FE, Set: Funkenperlen ziehen sich aus 2× Reichweite an.
- **Accessoires:** „Kupferspulen-Armband“ (+20 max FE), „Funkenring“ (schnellere Regeneration), „Aluhut“ (−8 % FE-Kosten, −50 % Schaden durch TV-Strahlen – Gag zum Boss), „Leuchtbrause-Gürtel“ (trinkt Leuchtbrause automatisch, −8 % Kosten), „Sternenumhang“ (bei Treffer fallen Funkenperlen).
- **Stationen:** „**Strahlenlabor**“ (Magie-Crafting, **braucht laufenden Generator** in 10 Kacheln – Synergie mit 0.7) und „**Tüftelwerkstatt**“ (Accessoires kombinieren, z. B. Kupferspulen-Armband + Funkenring = „Spulenring“).
- Neue Rohstoffe: **Kometenstaub** (Nacht-Schauer), **Kometit** (Erz in Einschlagkratern, Meteorit-Analog), **Uranstaub** (tief, schwach leuchtend grün, Strahlungs-Schaden bei Berührung ohne Anzug).

---

## 4) Homage-Bosse, Events, NPCs (eigene Namen, keine Terraria-Namen)

### 4.1 Boss-Kette (Vorschlag, Original-Rolle in Klammern nur intern)
**Akt 1 – vor der „Zweiten Welle“ (Pre-Hardmode)**
| # | Lifetime-Boss | Rolle (intern) | Beschwörung / Auftauchen | Belohnung / Freischaltung |
|---|---|---|---|---|
| 1 | **Klärschlamm-König** – riesiger Abwasser-Glibber mit Krone aus Kronkorken, spaltet kleine Schlammklumpen ab | Schleim-König | „Kronkorken-Krone“ (Kronkorken 30 + Schlamm 20) oder nach 150 Klumpen beim „Schlammregen“ | Rufer „Schlammbaby“, Haken-Teile |
| 2 | **Das Wachauge** – Riesen-Überwachungskamera mit echtem Auge; Phase 2: Linse platzt, Maul mit Kabelzähnen | Auge-Boss | „Verdächtige Linse“ nachts; spontan 1/3 pro Nacht, wenn ≥200 HP, ≥10 Verteidigung, ≥3 NPCs | **Kometit-Erz** + Linsen-Accessoire; passt zum „Big Brother“-Thema |
| 3 | **Der Kanalwurm** – Wurm aus Rohren/Schutt | Wurm-Boss | 3 „Pulsierende Geschwüre“ in der Verseuchten Zone zerstören | Dunkelerz „Faulmetall“ |
| 4 | **Geierkönigin** (gibt es) | Bienen-/Harpyie-Rolle | Aas-Pfeife | Flügel, Armbrust (wie jetzt) |
| 5 | **Fleischberg** (gibt es) | Mini-Endgegner früh | Faulige Opfergabe | Kettensäge, Herz des Berges |
| 6 | **Der Eisgeweih** – Zombie-Hirsch mit Geweih aus Eiszapfen | Hirsch-Zyklop | Schneefeld, Mitternacht im Schneesturm oder „Gefrorenes Geweih“ | Frost-Zauber, Sturm-Fibel |
| 7 | **Der Knochenwärter** – verfluchter Hausmeister eines Militärbunkers, schwebender Schädel mit Schraubstock-Händen | Dungeon-Boss | Mit NPC „Hausmeister Horst“ nachts am Bunkertor sprechen | Öffnet den **Bunker** (Dungeon-Analog) |
| 8 | **Mainstream-TV-Zombie** (gibt es) | Elektro-Boss / Story-Antagonist | Generator + 2 Tage | Fernbedienung, Bildröhre |
| 9 | **Der Glutschlund** – Wand aus Schrott, Kabeln und Fleisch, die durch die Unterwelt rollt | Fleischwand | „Kometenkern-Puppe“ in Magma werfen (Glutkern-Schicht) | **Löst die „Zweite Welle“ aus** (Hardmode) |

**Akt 2 – „Zweite Welle“ (Hardmode)**: Welt bekommt zwei Diagonal-Streifen: **Verstrahlte Zone** (grün-schwarz) und **Prismazone** (Kometenkristalle, schillernd, trügerisch niedlich) – eigene Gegner, eigene Erze nach Zerstörung von „Kometen-Altären“ (Hammer-Item „Abrissbirne“).
| Lifetime-Boss | Rolle (intern) | Idee |
|---|---|---|
| **Prisma-Glibberin** | Schleim-Königin | Kristallschleim, Prismazone |
| **Die Überwachungs-Zwillinge** | Mech-Zwillinge | zwei Kamera-Drohnen, Laser + Flammenwerfer |
| **Der Geisterzug** | Mech-Wurm | entgleister Güterzug als Wurm, Waggons schießen |
| **Der Abrissbagger** | Mech-Schädel | Bagger mit 4 Armen (Schaufel, Säge, Presslufthammer, Kanone) |
| **Die Wucherblume** | Pflanzen-Boss | Riesenmutantenblume im Wucherwald (neues Untergrund-Biom) |
| **Der Bunkerkoloss** | Golem | Beton-Roboter im Kommandobunker |
| **Der Mutantenhecht** | Fisch-Boss | beim Angeln mit „Leuchtwurm“ am Meer/See |
| **Die Polarlicht-Herrin** | Licht-Kaiserin | nach Wucherblume, Prismazone, nachts |
| **Der Kometenprediger** | Kultist | Sekte, die den Kometen anbetet; vor dem Bunker |
| **Die vier Sendemasten** (Strahlen-, Elektro-, Kometen-, Rauschmast) | Mondsäulen | Sender des TV-Netzes – jeder spuckt eigene Gegner |
| **„Primetime“ – Mainstream-TV-Zombie, Finale Form** **oder** **Das Ding im Kometen** | Mondherr | Story-Finale. *Entscheidung Pete*: Soll der TV-Zombie der Endgegner bleiben (dann Finale Form als letzter Boss), oder das Kometenwesen? Default bis zur Entscheidung: TV-Zombie bleibt Akt-1-Boss, Finale offen. |

### 4.2 Events
| Lifetime-Event | Rolle (intern) | Kern |
|---|---|---|
| **Blutmond** (gibt es) | Blutmond + 7DTD-Horde | behalten: Horde jede 7. Nacht; **neu**: Wasser/Regen rot, Schlafen gesperrt, neue Blutmond-Gegner „Das Brautpaar vom Standesamt“ (Braut + Bräutigam-Zombie), „Tropfauge“ (fliegendes tropfendes Auge), Drop „Blutige Träne“ (startet Blutmond manuell) |
| **Plünderer-Konvoi** | Goblin-Armee | Sumpfbrüder + Banditen fahren vom Weltrand ein, Fortschrittsbalken, Anführer „Zündschnur-Zacharias“; Sieg schaltet NPC „Bastler Benno“ frei |
| **Schlammregen** | Schleim-Regen | Schlammklumpen fallen vom Himmel; nach 150 Klumpen erscheint Klärschlamm-König |
| **Kometenschauer** | Sternenfall | Kometenstaub fällt nachts (Magie-Ressource) |
| **Spätfilm-Nacht** | Sonnenfinsternis | Himmel flimmert wie Testbild, es laufen die Film-Homagen herum: Hackebeil-Hannes, Graf Bissfest, Mumien-Manni, Clownchen Grinsekatz, Affenkönig Bumbum (gibt es schon als Minis → hier in voller Größe) |
| **Schrottpiraten** | Piraten | Floß-Bande auf den Seen, Kapitän „Rostbart“ |
| **Vogelscheuchen-Nacht** | Kürbismond | Erntedank-Welle mit Vogelscheuchen-Boss „Strohkopf“ |
| **Tannen-Terror** | Frostmond | Weihnachtswelle (Lichterketten-Zombies, „Nussknacker-Panzer“) |
| **Die Firma** | Marsianer | Konzern-Drohnen-Invasion, UFO = „Werbezeppelin“ |
| **Gewitter / Sandsturm / Schneesturm** | Wetter | Gewitter lädt Elektro-Zauber (+20 %), Sandsturm in Wüste, Schneesturm im Schneefeld |
| **Lichterfest** | Laternennacht | Nacht nach erstem Boss-Sieg: Laternen steigen, +Glück |

### 4.3 NPCs (bestehende behalten, Lücken füllen)
Vorhanden: Kalle (Mechaniker), Gerda, Dr. Ingo Brems (Sanitäter ≈ Krankenschwester-Rolle), Mecki (Schläger), Tante Uschi (Kiosk ≈ Händler), Willi (Einzelgänger), Funker Fritz, Sheriff Rudi, Armbrust-Doris (≈ Waffenhändlerin).
| Neuer NPC | Rolle (intern) | Einzug-Bedingung | Shop/Dienst |
|---|---|---|---|
| **Pfadfinder-Paul** | Guide | ab Spielstart beim Wrack | zeigt Rezepte zu einem Item, Tipps |
| **Kometenseher Merlinski** | Zauberer | nach erstem Kometenstaub-Fund | Magie: Funkenstab, Leuchtbrause, Kometenkern-Rezept, Kristallkugel-Buff „Klarsicht“ |
| **Bastler Benno** | Goblin-Tüftler | nach Plünderer-Konvoi | **Aufmotzen** (Zufalls-Präfix/Umschmieden), Tüftelwerkstatt |
| **Sprengmeister Sigi** | Sprengmeister | sobald Rohrbombe im Inventar | Sprengstoff |
| **Kräuterhexe Hilde** | Dryade | nach erstem Boss | Samen, zeigt % Verseuchung |
| **Angel-Achim** | Angler | am See schlafend finden | tägliche Angel-Quests |
| **Hausmeister Horst** | Alter Mann / Kleidungshändler | Bunkertor | Fluch → Knochenwärter; danach Kleidung |
| **Fliegender Händler Ömer** | Wanderhändler | zufällig tagsüber, mit Bollerwagen | wechselnde Ware |
| **DJ Dörte** | Partygirl | ≥14 NPCs | Party-Event |
| **Friseurin Frieda** | Stylistin | im Spinnennest gefesselt finden | Frisuren |
**Wohnungsregeln (Original übernehmen):** Raum ≥ 60 Kacheln inkl. Rahmen, ≤ 750; komplette Hintergrundwand; Lichtquelle; Tisch (oder Werkbank); Stuhl; Tür oder Plattform als Eingang; ein NPC pro Raum. Dazu Menü „Zimmer prüfen“ + NPC zuweisen. 7DTD-Mix: NPCs verteidigen die Basis beim Blutmond (Lifetime-Anwerben bleibt).

---

## 5) Priorisierter Arbeitsplan ab Donnerstag 03.12.2026, 9:00

Grundsatz: **eine Etappe = ein Commit**, jede Etappe einzeln testbar; nach Etappe 4 (spätestens Tagesende) Build **0.8 / versionCode 9** und Deploy. Etappen 5+ sind Folgeblöcke (Folgetage), Reihenfolge so beibehalten. Keine Rückfragen nötig – Entscheidungen mit „Default“ markiert.

### Etappe 0 – Einstieg (≈15 min)
- `cd /workspace/lifetime && git pull` ; prüfen: HEAD enthält af057f0 + Commit dieser Notiz.
- Diese Datei lesen, `www/js/v07.js`, `ai.js` (`tierAt`, `TIER_POOLS`), `sprites.js` (`paintHumanoid`, `frameFor`), `equip.js`, `art-src/pete/petesprite.py` überfliegen.
- Basistest: `timeout 500 node tv7.js all` → **Abnahme:** `errs []`, fps ≥ 55.
- Neue Datei für die Runde: `www/js/v08.js` (Override-Muster `const _x=x; x=function(){…}`), in `index.html` nach `v07.js` einbinden; Testskript `tv8.js` (Kopie von tv7.js als Basis), Screenshots `shots/v08/`.

### Etappe 1 – Kampfgefühl wie Original (≈1 h)  *(klein, sofort spürbar)*
- Schadensstreuung ±15 % (statt ±10 %).
- Rückstoß nach Original-Logik: `kb *= (1-kbRes)`; Treffer > 1/10 max-HP = „starker Treffer“ (2×KB addiert); Krit ×1,4 KB; Bosse + Würmer KB-immun; `kbRes` in MOBS ergänzen (Zombie 0,5 / Dicke 0,7 / Hund 0 / Minibosse 0,8 / Bosse 1).
- Spieler: bei Treffer Rückstoß weg vom Treffpunkt (hoch + seitlich), Blinken während iFrames (0,67 s; 0,33 s bei 1 Schaden).
- Schadenszahlen: Spieler-Schaden rot, Heilung grün.
- **Abnahme:** Test schlägt Schlurfer 20× → Schadenswerte liegen im Band 0,85–1,15× Grundschaden; Boss bewegt sich durch Treffer nicht (Δx < 2 px); Spieler blinkt (Screenshot `combat_iframes.png`), rote Zahl bei Spielerschaden sichtbar; tv7-Regression `errs []`.

### Etappe 2 – Magie-Kern (≈2,5 h)  *(Petes Wunsch Nr. 1)*
- FE-Ressource (20 Start, Sterne-HUD neben/unter den Herzen, Regen-Formel aus 3.2, −60 % Tempo bei FE-Mangel), Speichern/Laden (alte Saves: FE=20).
- Items: Kometenstaub, Kometenkern (+20 max, bis 200), Funkenperle (Drop), Leuchtbrause + Debuff „Strahlenkater“.
- Kometenschauer: nachts Kometenstaub-Fallobjekte (an v04-Kometen anhängen).
- 4 Zauber: Funkenstab, Sporenzepter, Frostspule, Kometenrute (+ Projektil-Grafiken 2-px-Raster, eigenes Leuchten im Lichtsystem, Sounds per WebAudio wie bisher).
- Station Strahlenlabor (nur aktiv, wenn Generator in ≤10 Kacheln läuft) – Default: Funkenstab/Sporenzepter/Frostspule an Werkbank, Kometenrute + Strahlrohr am Strahlenlabor.
- Intellekt-Perks „Funkenkunde“, „Kaltes Blut“, „Antennenkopf“.
- **Abnahme:** neues Spiel → FE 20 sichtbar; Funkenstab zaubern senkt FE um 4, Regeneration stillstehend ≈ doppelt so schnell wie laufend (Test misst); bei 0 FE langsamer; Kometenkern hebt Max auf 40; Kometenschauer-Screenshot nachts mit Staub; jeder der 4 Zauber trifft und tötet einen Schlurfer im Test; Strahlenlabor-Rezepte nur bei laufendem Generator; alter 0.7-Save lädt ohne Fehler (FE=20). Screenshots `magic_*.png`.

### Etappe 3 – Optik-Fundament 2-px-Raster (≈2 h)
- `petesprite.py`: Option `"grain":2` (auf halbe Höhe verkleinern, Palette ≤ cfg-colors, Alpha hart, dann nearest ×2) + Umriss im dunkelsten Materialton. **Nur Ausgabe neu erzeugen**, keine Quellbilder löschen.
- TV-Zombie + 5 Minis mit grain 2 neu rastern (Boss ≤40 Farben, Minis ≤20). **Schwester & Hippie unverändert lassen** (Default, bis Pete OK gibt).
- Prozedurale Figuren (`paintHumanoid`/`paintCreature`): in halber Auflösung malen, ×2 skalieren; Laufzyklus für Gegner auf 3 Frames + Sprung, Spieler behält mehr Frames.
- **Abnahme:** Prüfskript (2×2-Block-Anteil, wie in dieser Analyse) meldet ≥ 0,95 für TV-Zombie, Minis, Schlurfer, Hund, Spieler; Farbanzahl je Sprite innerhalb der Grenzen aus 2.2; Hitboxen unverändert (MOBS w/h gleich); Vergleichs-Screenshot `look_before_after.png`; fps ≥ 55.

### Etappe 4 – Accessoires & Set-Boni + Build 0.8 (≈1,5 h + Deploy)
- Zubehör-Slots 1 → 3 (Default; später 5 nach „Zweiter Welle“). Set-Boni-System + 2 Sets (Bastel-/Funken-Set, Strahlenschutzanzug), 4 Magie-Accessoires (Kupferspulen-Armband, Funkenring, Aluhut, Sternenumhang).
- Buff-Icon-Zeile unter der Hotbar (Strahlenkater, Set-Bonus, Wärme usw.).
- Version: `tver` → „Version 0.8 · Funkenzeit“ (Default-Untertitel).
- Build/Deploy exakt wie 0.7: `cd android && ./build.sh 9 0.8`, apksigner verify, aapt2 badging (versionCode 9 / 0.8), push master, Tag v0.8, gh-pages neu mit `Lifetime.apk`, Kopie nach mlserve, curl-Schleife bis sha passt.
- **Abnahme:** 3 Zubehör-Slots in der UI (Mobile-Touch bedienbar), Set-Bonus erscheint beim Tragen aller Teile als Buff-Icon + Tooltip; Aluhut halbiert TV-Strahl-Schaden im Boss-Test; tv7 + tv8 `errs []`; Download-URL liefert 200 + richtigen Content-Type + gleiche sha.

### Etappe 5 – Biom-Gegner + Tag/Nacht (Folgeblock, ≈2 h)
- `TIER_POOLS` → Pools je Biom × Tag/Nacht × Schicht (Wüste: Mumien-artige Sandzombies/Geier; Schnee: Frostschlurfer/Wolf; Verbrannt: Glüh-Kotzer/Brandmeister; Stadt: Bulle/Soldat/Kreischerin; Ödland: Mutanten). Tagsüber schwächere Gegner, nachts Zombies (Original-Rhythmus).
- 3 neue Grundgegner im 2-px-Stil: Tropfauge (Flieger nachts), Höhlenratte (Untergrund), Schlammklumpen (Schleim-Analog, tags).
- **Abnahme:** Spawn-Statistik-Test (1000 Spawns je Biom) zeigt biomeigene Mehrheiten (>60 % biomtypisch); Screenshot pro Biom.

### Etappe 6 – Schichten & Erze (Folgeblock, ≈3 h)
- Weltgenerierung neu nur für **neue** Spiele: Schichten Oberfläche / Untergrund / Höhlen / **Glutkern** (unterste ~25 Reihen, Magma = neue Flüssigkeit mit Schaden, Obsidian bei Wasser+Magma). H bleibt 300 (Default) – sonst EXS/EXLEN prüfen.
- Erz-Tiers: Kupfer → Eisen (gibt es) → Silber → Kometit (Krater, Boss 2) → Faulmetall (Boss 3) → Glutstein (Glutkern) ; Titan wird Hardmode-Erz (Default; bestehende Titan-Items behalten Werte).
- Spitzhacken-Gating (Mindestkraft je Erz), Werkzeug-/Rüstungs-Set je Tier mit Set-Bonus.
- **Abnahme:** neue Welt enthält alle Erze in richtiger Tiefe (Generator-Statistik), Glutkern erreichbar, Magma schadet, Obsidian entsteht; alter Save lädt (keine neuen Schichten, Hinweis).

### Etappe 7 – Bosse Akt 1 (Folgeblock, je Boss ≈2 h)
Reihenfolge: **Das Wachauge** → **Klärschlamm-König** (+ Schlammregen) → Knochenwärter + Bunker → Kanalwurm → Eisgeweih → Glutschlund. Je Boss: GenerateImage max. 2–3 Versuche → Pete-Pipeline grain 2, Status-Meldung bei Spawn/Tod, Boss-Leiste, Musik, Teleport bei Feststecken, Drops/Freischaltung laut 4.1.
- **Abnahme je Boss:** Beschwörung funktioniert, Boss erscheint im Bild (nicht hinter Minimap), Angriffsmuster ≥ 3, Phase-2-Wechsel sichtbar, Sieg setzt Flag + Drops, Screenshots `boss_<name>_*.png`, fps ≥ 50.

### Etappe 8 – NPC-Wohnen & Shops (Folgeblock, ≈2,5 h)
- Zimmer-Check nach Original-Regeln (4.3), Einzug neuer NPCs nach Bedingungen, Wohnungsmenü, Shops mit Kronkorken; neue NPCs Pfadfinder-Paul, Kometenseher Merlinski, Bastler Benno (Aufmotzen/Präfixe), Fliegender Händler.
- **Abnahme:** gebautes Test-Haus (9×7) wird als gültig erkannt, zu kleines/ohne Licht als ungültig mit Grund; NPC zieht ein; Shop kauf/verkauf funktioniert; Präfix wird angezeigt und ändert Werte.

### Etappe 9 – Events (Folgeblock, ≈3 h)
- Blutmond-Erweiterung (rotes Wasser, Brautpaar, Tropfauge, Blutige Träne), Plünderer-Konvoi mit Fortschrittsbalken, Spätfilm-Nacht mit Film-Homagen, Gewitter/Sandsturm/Schneesturm, Lichterfest.
- **Abnahme:** jedes Event per Debug-Trigger im Test startbar, Balken zählt, Ende-Meldung, Screenshots.

### Etappe 10 – Fischen (Folgeblock, ≈2 h)
- Angel (Holz + Faser + Draht), Köder (Würmer beim Graben, Insekten), Gewässer ≥ 75 Wasserkacheln (Seen aus 0.7 reichen), Fänge nach Biom/Tiefe/Tageszeit, Treibgut-Kisten, Mutantenfische, Angel-Achim-Quests.
- **Abnahme:** Angeln am See liefert in 20 Würfen ≥ 3 verschiedene Fänge; zu kleiner Tümpel → Meldung „Gewässer zu klein“.

### Etappe 11 – „Zweite Welle“ (Hardmode) (größter Block, eigene Woche)
- Glutschlund-Sieg → V-Streifen (Verstrahlte Zone / Prismazone), Kometen-Altäre + Abrissbirne → HM-Erze, HM-Gegnerpools, Mech-Bosse, Zubehör-Slots 5.
- **Abnahme:** Streifen erscheinen, Erze nach Altar-Zerstörung, neue Gegner nur in HM.

### Offene Entscheidungen für Pete (blockieren nicht – Defaults stehen dabei)
1. Endgegner: TV-Zombie „Primetime“ als Finale oder Kometenwesen? (Default: offen, TV-Zombie bleibt Akt-1-Boss.)
2. Schwester/Hippie auf 2-px-Raster umstellen? (Default: nein, Vorlage unverändert.)
3. Blutmond: weiter fest jede 7. Nacht (7DTD) oder zusätzlich zufällig (Terraria)? (Default: fest + seltener Zufalls-Blutmond ohne Horde.)
4. Fernbedienung des Grauens zusätzlich mit Funkenenergie nutzbar? (Default: ja, Akku bleibt möglich.)

### Bekannte Risiken
- Handy-Leistung bei mehr Licht-/Partikel-Effekten (Zauber) → Partikel-Budget, Test auf Mobile-Emulation mit CPU-Drosselung (Playwright `Emulation.setCPUThrottlingRate` 4×).
- Save-Kompatibilität bei neuen Schichten/Erzen → nur neue Welten bekommen sie; alte Saves bekommen Hinweis wie in 0.7.
- 2-px-Umstellung kann Petes Figuren verfremden → nur mit grain-Option, Original-Ausgabe bleibt reproduzierbar.

## Petes Entscheidungen (2026-11-27, t1625u) – haben Vorrang vor allen Standardannahmen oben
- TV-Zombie = erster großer Boss (nicht Endboss).
- Gegner-Look: der Stil von Hippie und Schwester (Petes eigene Sprites) ist DER Look aller Gegner – damit hebt sich Lifetime von Terraria ab. NICHT auf Terraria-2px-Raster umstellen; neue Gegner an Hippie/Schwester angleichen.
- Abheben auch durch lustige Verschwörungstheorien, was passiert sein könnte (Story, Notizen, NPC-Sprüche, Lore-Funde).
- Blutmond fest alle 7 Tage (nicht zufällig). Tag etwas länger als Nacht. Während eines Bosskampfs bleibt es Nacht, wird nicht hell bis der Kampf vorbei ist.
- TV-Zombie-Fernbedienung: verschießt Strahlen wie Radiowellen. Beim Sieg: Fernbedienung als Waffe + elektrische Komponente für den baubaren Generator. TV-Kopf mitnehmbar, aufstellbar; mit Strom einschaltbar, lockt dann Zombies in der Nähe an (Köder-Mechanik).
- BUG: Bei Tieren startet die Kampfmusik – nervt. Kampfmusik nur bei feindlichen Gegnern/Bossen.
- Alles aus der Fehlt-Liste muss rein: Lava/Unterwelt, Fische/Angeln, Invasionen, NPC-Häuser, Set-Boni, Accessoires, Präfixe, Beschwörer, zweite Weltphase usw.
- 2–3 neue Hintergrund-Songs für verschiedene Biome.
- Himmel-Bereich (Sky-Ebene) mit leicht grünlichen Wolken (Atomwolken-Stimmung).
- Erster richtiger Boss: Homage an den Toxic-Avenger-Splatterfilm der 80er, Arbeitstitel „The Toxic Avendture“ (eigener Name im Spiel, kein Original-Name). Pete besorgt ein Pixel-Vorlagenbild per Image-to-Prompt – auf sein Bild warten, nicht vorher selbst entwerfen.
- Weitere Bosse: thematisch passend als Anlehnung an andere Survival-Games und Filme – mit Pete gemeinsam festlegen, nicht eigenmächtig finalisieren.
