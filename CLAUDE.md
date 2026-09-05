# Zizo Lern-Spaß — project guide for Claude

This is a standalone learning app for **Zizo (4 years old)**. It is **audio-first**
(spoken German) and **tap-only**, because the child cannot read yet. Vanilla
HTML/CSS/JS, zero dependencies, installable PWA.

## Boundaries (important)
- **Work only inside this folder.** This is its own git repo, fully separate from
  the sibling 2nd/3rd-grade portal at `../school-2nd-year` (`lernportal-2klasse`).
  **Do not read from, edit, move, or serve files in that other project** — it must
  keep working independently. Copy any shared building blocks from the
  `kids-learning-portal` skill instead.
- If you run a local server here, use a **different port** than the other portal
  (e.g. `8001`), so both can run at once without clashing.

## How to add a new learning topic
Use the **`kids-learning-portal`** skill (global, available in every session). It
will interview for the new topic/style, write a short `PLAN.md`, then build. The
flow for one topic:
1. `mkdir topics/<id>` and copy the skill's `assets/topic-template.html` into
   `topics/<id>/index.html`; fill `TOPIC_ID/TOPIC_NAME/TOPIC_FACE/TOPIC_TITLE`.
2. Write `buildRounds()` — pick a mechanic from the skill's
   `references/activity-recipes.md` (tap-the-swatch, count+tap-numeral,
   find-same-shape, hear-word-tap-picture, tap-the-letter…). **Rule: each round
   has exactly one option with `ok:true`.**
3. Add the topic to the `ACTIVITIES` array in `index.html`.
4. Add the new page to the `PRECACHE` list in `sw.js`.
5. Verify with the skill's `references/verify.md` harness
   (`node --check shared/kid.js` + the round-validity check).

## Structure
- `index.html` — hub with the activity tiles.
- `shared/kid.js` — the engine. `Kid.pickGame({rounds})` runs every game. Speech
  language is `de-DE`; override with `window.KID_LANG` before `kid.js` if needed.
  The stars are stored under the localStorage key `zizo_lernspass_v1`.
- `shared/styles.css` — kid-sized design system.
- `topics/<id>/index.html` — one folder per activity (currently: farben, zahlen,
  formen, dinge).
- `manifest.webmanifest`, `sw.js`, `icons/` — PWA plumbing.

## Run it
```
python3 -m http.server 8001
# open http://localhost:8001  (tap once to enable sound; needs a browser voice)
```

## Conventions
- German UI, minimal on-screen text; the child **hears** every instruction and
  praise, so `say`/`intro` text must fully describe the task without reading.
- Big tap targets, no keyboard/numpad, wrong answers are gently forgiven.
- Commit only when the user asks.
