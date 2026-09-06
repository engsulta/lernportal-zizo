# PLAN — 7 new topics for Zizo Lern-Spaß

**Child:** Zizo, 4 years old · **Language:** German (`de-DE`) · **Tier:** pre-reader
(audio-first, tap-only). **Style:** unchanged — reuse existing `shared/kid.js`,
`shared/styles.css`, theme `#89d4ff`. No new CSS or engine changes needed; every
tile style (`.glyph`, `.numeral`, `.bigglyph`) already exists.

Each topic is a new `topics/<id>/index.html` built from the existing `dinge`
page as the template. Every round has **exactly one `ok:true`**.

## New topics

| # | id           | Tile | Name            | Mechanic (spoken → tap) |
|---|--------------|------|-----------------|--------------------------|
| 1 | `buchstaben` | 🔤   | Buchstaben      | "Tippe auf das **A**" → tap the big letter (`.numeral`). Prompt shows neutral 🔤. Random 3 of A–Z per round. |
| 2 | `tiere`      | 🐄   | Tierstimmen     | "Welches Tier macht **Muh**?" → tap the animal (emoji). Animal-sound pairs. |
| 3 | `fahrzeuge`  | 🚗   | Fahrzeuge       | "Wo ist das **Feuerwehrauto**?" → tap the vehicle (emoji). |
| 4 | `gegenteile` | ⚖️   | Gegenteile      | "Tippe auf das **große** Tier" / "etwas **Kaltes**" → tap the matching side. Opposite pairs (groß/klein, heiß/kalt, schnell/langsam, Tag/Nacht, nass/trocken). |
| 5 | `gefuehle`   | 😊   | Gefühle         | "Welches Gesicht ist **fröhlich**?" → tap the face (emoji). Happy/sad/angry/scared/tired/surprised. |
| 6 | `essen`      | 🍓   | Obst & Gemüse   | "Wo ist die **Karotte**?" → tap the food (emoji). Fruit & vegetables. |
| 7 | `koerper`    | 👃   | Körperteile     | "Tippe auf die **Nase**" → tap the body part (emoji): Nase, Ohr, Auge, Mund, Hand, Fuß, Zahn, Zunge. |

All are 3 tiles per row (`cols:3`), 8 rounds each, 2 plausible distractors per
round, gentle-forgive wrong taps (engine default). No emoji in the spoken `say`
text (the child hears it).

## Files to change

1. **Create** `topics/<id>/index.html` × 7 (copy of `dinge`, swap face/title/
   content + `buildRounds()`).
2. **Edit** `index.html` — add 7 entries to the `ACTIVITIES` array (→ 11 tiles).
3. **Edit** `sw.js` — add the 7 new pages to `PRECACHE`.

## Verify

- `node --check shared/kid.js` (unchanged, sanity) + extract each new page's
  `<script>` and `node --check` it.
- Round-validity: assert every round has exactly one `ok:true` and that all
  `build`/`prompt` callbacks run without throwing.

## Not doing (unless you ask)

- Committing / pushing to GitHub Pages (I'll offer after you've tried it).
- New icons, new colors, or engine changes.
