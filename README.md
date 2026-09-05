# Zizo Lern-Spaß 🌟

Eine kleine Lern-App für **Zizo (4 Jahre)** – zum **Anhören und Antippen**.
Das Kind muss noch nicht lesen können: Jede Aufgabe und jedes Lob wird auf
**Deutsch vorgelesen** (Web Speech API), gespielt wird nur mit großen Tipp-Flächen.

## Bereiche
- 🎨 **Farben** – Farbe hören, passenden Kreis antippen
- 🔢 **Zahlen** – Dinge zählen (1–10) und die richtige Zahl antippen
- ⭐ **Formen** – die *gleiche* Form finden (Farbe/Größe egal)
- 🐶 **Dinge** – Wort hören, passendes Bild (Tier/Ding) antippen

Jede Runde belohnt mit Sternen ★ und Konfetti. Falsche Antworten sind
folgenlos – es wird freundlich „nochmal“ gesagt.

## Aufbau
```
index.html            Start-Bildschirm mit 4 großen Kacheln
shared/styles.css     gemeinsames, kindgerechtes Design
shared/kid.js         Spiel-Maschine (Sound, Sprache, Konfetti, Sterne, pickGame)
topics/<bereich>/index.html   je ein Bereich (definiert nur seine Runden)
manifest.webmanifest + sw.js  installierbar & offline (PWA)
icons/                App-Icons (Stern)
```
Ein neuer Bereich = ein Ordner unter `topics/` mit ein paar Zeilen, die
`Kid.pickGame({...})` aufrufen. Der ganze Rest kommt aus `shared/kid.js`.

## Lokal testen
```
python3 -m http.server 8000
# dann http://localhost:8000 im Browser öffnen
```
Sprachausgabe braucht einen Browser mit deutscher Stimme (Safari/Chrome auf
Mac/iPhone/Android haben das). Ton startet nach der ersten Berührung.

## Später online stellen
Wie beim Geschwister-Portal per **GitHub Pages** möglich (statische Dateien,
kein Server nötig).
