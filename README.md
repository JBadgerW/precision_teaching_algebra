# Precision Teaching: Algebra

Timed algebra fact practice for Precision Teaching. Students pick a game from the menu, choose
what to practice on the settings page, then answer as many problems as they can before time runs
out. At the end they see **correct per minute**, **incorrect per minute**, and lists of the problems
they got right, got wrong, and skipped.

It's a static site: plain HTML, CSS and JavaScript, with no build step and no server code.
KaTeX is served from `vendor/katex/`, so the page needs nothing from other websites.

## Run it locally

The page uses JavaScript modules, so it must be served over HTTP.
Opening `index.html` straight from disk won't work.

```sh
python3 -m http.server 8000
# then open http://localhost:8000
```

## Hosting

- **GitHub Pages:** push the repo, then go to **Settings → Pages → Deploy from a branch → `main` / root**.
  The site appears at `https://jbadgerw.github.io/precision_teaching_algebra/`.
- **Your own network:** copy the folder to any web server (nginx, Apache, IIS),
  or run `python3 -m http.server 8000` on a machine students can reach.

You can link students straight to a game's settings: `…/#/setup/single-step`, or straight into a
round with the saved settings: `…/#/play/single-step`. The games are `single-step` and `multiplication`.

## How it plays

- **Settings** (shared by every game, and remembered by the browser between rounds, games and visits):
  - **Fact families** 1–12. A problem from the 7s family is built from a fact with 7 in it
    (7 + 5, 9 × 7, …); the other number can be anything from 1 to 12.
  - **Add-ons** 13, 14 and 15, off by default. Unless one is checked, that number never appears in
    any problem as either number of the fact. When checked, it is its own family and may also be the
    other number in any family's facts.
  - **Kinds of facts:** addition, subtraction, multiplication, division (Single-Step Equations only).
  - **Answer format:** free response or multiple choice (Multiplication Facts only).
  - **Timing:** 30 seconds, or 1, 2, 3 or 5 minutes.
- **The round** waits on a "Ready?" screen until the student presses Enter, so the clock doesn't
  start while they move to the keyboard.
- **Answering:** type the value of x (`7` or `x = 7`) and press Enter. A right answer gets a big green
  ✓; a wrong one gets a big red ✗ with the correct answer. The mark stays on screen under the next
  problem, which appears at once.
- **Multiple choice:** four tiles in a 2 × 2 grid, the right answer and three distractors in random
  order, with a **Skip** button underneath. A click within 0.2 s of new tiles appearing is ignored,
  so a double-click can't answer the next problem too.
- **Skipping:** Enter on an empty box (or **Skip** in multiple choice) skips the problem. The results list each skipped problem and
  its family.
- **Rates:** correct ÷ minutes and incorrect ÷ minutes, over the full round length.
- **Leaving early** (← Settings) throws the round away; there are no results for a partial round.

## Single-Step Equations

Addition and subtraction come from the addition facts 1 + 1 to 12 + 12; multiplication and division
from the multiplication facts 1 × 1 to 12 × 12. From a fact a ∘ b = c:

| Kind | Forms |
|---|---|
| Addition | x + a = c, a + x = c |
| Subtraction | x − a = b, c − x = a |
| Multiplication | ax = c |
| Division | x/a = b, c/x = a |

Answers are always whole numbers from 1 up. The same problem never comes twice in a row.

## Multiplication Facts

Each problem is a × b = ?, from the multiplication facts. In free response the answer box sits on the
same line as the fact. In multiple choice the wrong tiles come from
`data/multiplication_distractors.json` (see below).

## Adding a game

Write `js/games/<id>.js` and add it to the list in `js/games.js`; the comment at the top of
`games.js` lists what a game exports (title, problem maker, how the answer is shown, and whether
it uses kinds of facts or offers multiple choice). The settings page, timer, marking and results
work for every game. `pickFact(settings)` in `js/settings.js` picks a fact from the chosen families.

## Multiple-choice data

`data/multiplication_distractors.json` holds every multiplication fact from 1 × 1 to 15 × 15 with its
answer and three likely wrong answers, used by multiple-choice games:

```json
{"a": 3, "b": 4, "answer": 12, "distractors": [9, 15, 16]}
```

Each fact appears once with `a ≤ b`; for 4 × 3, look up 3 × 4. The file is generated from
`multiplication_distractors.txt` (tab-separated, as exported from a spreadsheet). After editing the
text file, rebuild it with `python3 tools/distractors_to_json.py`, which also checks every answer and
refuses to write if a distractor matches the answer or a fact is listed twice.

## Files

```
index.html               page shell
css/style.css            all styling (light and dark themes, matching Order the Tiles)
js/app.js                menu, settings page, round, results, routing
js/settings.js           the shared settings and how they are saved
js/games.js              the list of games on the menu
js/games/single-step.js  problem maker for Single-Step Equations
js/games/multiplication.js  problem maker for Multiplication Facts
js/util.js               shared helpers (elements, KaTeX, storage, formatting)
vendor/katex/            KaTeX 0.16.11 (MIT license)
data/                    multiplication_distractors.json (for multiple choice)
tools/                   distractors_to_json.py
```
