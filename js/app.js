// Screens and routing. URLs:
//   #/               the menu
//   #/setup/<game>   the game's settings: fact families, operations, answer format, timing
//   #/play/<game>    a timed round (the results appear on the same page)
import { GAMES, findGame } from './games.js';
import { BASE, EXTRAS, OPS, TIMES, FORMATS, loadSettings, saveSettings, isPlayable } from './settings.js';
import { el, tex, formatTime, formatRate, formatMinutes } from './util.js';

const SITE = 'Precision Teaching: Algebra';
const app = document.getElementById('app');

// Whatever the current screen needs undone (timers, listeners) before the next one.
let cleanup = null;

function show(...nodes) {
  cleanup?.();
  cleanup = null;
  app.replaceChildren(...nodes);
  scrollTo(0, 0);
}

function showError(err) {
  const onFile = location.protocol === 'file:';
  show(el('main', { class: 'screen error' },
    el('h1', {}, 'Something went wrong'),
    el('p', {}, onFile
      ? 'This page has to be opened through a web server, not straight from the file. In this folder, run "python3 -m http.server" and open http://localhost:8000.'
      : String(err.message || err)),
    el('p', {}, el('a', { class: 'btn', href: '#/' }, 'Back to menu')),
  ));
  console.error(err);
}

// "1–4, 7, 13" rather than "1, 2, 3, 4, 7, 13".
function listFamilies(families) {
  const runs = [];
  for (const n of families) {
    const last = runs.at(-1);
    if (last && n === last[1] + 1) last[1] = n;
    else runs.push([n, n]);
  }
  return runs.map(([a, b]) => (a === b ? `${a}` : b === a + 1 ? `${a}, ${b}` : `${a}–${b}`)).join(', ');
}

const isChoice = (game, settings) => Boolean(game.multipleChoice) && settings.format === 'choice';

// "1 minute · families 1–12 · + − × ÷", with only the parts that apply to this game.
function describeSettings(game, settings) {
  return [
    formatMinutes(settings.minutes),
    `families ${listFamilies(settings.families)}`,
    game.usesOps && OPS.filter(o => settings.ops.includes(o.id)).map(o => o.sign).join(' '),
    game.multipleChoice && FORMATS.find(f => f.id === settings.format).label.toLowerCase(),
  ].filter(Boolean).join(' · ');
}

// ---------- Menu ----------

function gameCard(game) {
  return el('a', { class: 'card', href: `#/setup/${game.id}` },
    el('div', { class: 'card-art' }, tex(game.sample, { class: 'card-math' })),
    el('div', { class: 'card-text' },
      el('h2', {}, game.title),
      el('p', {}, game.description),
    ),
  );
}

function showMenu() {
  document.title = SITE;
  show(el('main', { class: 'screen menu' },
    el('header', { class: 'menu-head' },
      el('div', {},
        el('h1', {}, 'Algebra Facts'),
        el('p', { class: 'lede' }, 'Pick a game. Answer as many problems as you can before time runs out.'),
      ),
    ),
    el('div', { class: 'cards' }, GAMES.map(gameCard)),
  ));
}

// ---------- Settings ----------

// A row of radio buttons styled as a segmented control.
function segmented(name, options, current, onPick) {
  return el('div', { class: `segmented cols-${options.length}` }, options.map(o => el('label', { class: 'seg' },
    el('input', { type: 'radio', name, checked: o.value === current, onchange: () => onPick(o.value) }),
    el('span', {}, o.label),
  )));
}

function showSetup(game) {
  document.title = `${game.title} · ${SITE}`;
  const settings = loadSettings();
  const start = el('a', { class: 'btn primary big', href: `#/play/${game.id}` }, 'Start');
  const warning = el('p', { class: 'setup-warning', role: 'status' });

  function changed() {
    saveSettings(settings);
    const missing = [
      !settings.families.length && 'a fact family',
      game.usesOps && !settings.ops.length && 'a kind of fact',
    ].filter(Boolean);
    warning.textContent = missing.length ? `Choose at least ${missing.join(' and ')} to start.` : '';
    start.classList.toggle('disabled', missing.length > 0);
    start.setAttribute('aria-disabled', String(missing.length > 0));
  }
  start.addEventListener('click', e => { if (!isPlayable(settings, game)) e.preventDefault(); });

  // Families: a checkbox chip per number.
  const familyBox = n => el('input', {
    type: 'checkbox', value: n, checked: settings.families.includes(n),
    onchange: () => {
      settings.families = [...BASE, ...EXTRAS].filter(m => m === n
        ? !settings.families.includes(n)
        : settings.families.includes(m));
      changed();
    },
  });
  const chip = n => el('label', { class: 'chip' }, familyBox(n), el('span', {}, String(n)));
  const baseChips = BASE.map(chip);
  const setBase = on => {
    settings.families = [...(on ? BASE : []), ...settings.families.filter(n => n > 12)];
    baseChips.forEach(c => { c.querySelector('input').checked = on; });
    changed();
  };

  const opsPanel = game.usesOps && el('fieldset', { class: 'panel' },
    el('legend', {}, 'Kinds of facts'),
    el('div', { class: 'options' }, OPS.map(op => el('label', { class: 'option' },
      el('input', {
        type: 'checkbox', checked: settings.ops.includes(op.id),
        onchange: e => {
          settings.ops = OPS.map(o => o.id).filter(id => id === op.id ? e.target.checked : settings.ops.includes(id));
          changed();
        },
      }),
      el('span', { class: 'option-label' }, op.label),
      tex(op.sample, { class: 'option-sample' }),
    ))),
    el('p', { class: 'note' }, 'Addition and subtraction come from the addition facts; multiplication and division from the multiplication facts.'),
  );

  const formatPanel = game.multipleChoice && el('fieldset', { class: 'panel' },
    el('legend', {}, 'Answer format'),
    segmented('format', FORMATS.map(f => ({ value: f.id, label: f.label })), settings.format,
      format => { settings.format = format; changed(); }),
    el('p', { class: 'note' }, 'Free response: type the answer. Multiple choice: click the right answer out of four.'),
  );

  const timingPanel = el('fieldset', { class: 'panel' },
    el('legend', {}, 'Timing'),
    segmented('minutes', TIMES.map(m => ({ value: m, label: m < 1 ? `${m * 60} s` : `${m} min` })), settings.minutes,
      minutes => { settings.minutes = minutes; changed(); }),
  );

  show(el('main', { class: 'screen setup' },
    el('header', { class: 'play-bar' },
      el('a', { class: 'btn quiet', href: '#/' }, '← Menu'),
      el('h1', {}, game.title),
      el('span'),
    ),
    el('p', { class: 'instructions' }, 'Choose what to practice. Your choices are remembered for next time.'),
    el('div', { class: 'setup-grid' },
      el('fieldset', { class: 'panel families' },
        el('legend', {}, 'Fact families'),
        el('div', { class: 'chips' }, baseChips),
        el('div', { class: 'panel-actions' },
          el('button', { type: 'button', class: 'btn small', onclick: () => setBase(true) }, 'All 1–12'),
          el('button', { type: 'button', class: 'btn small', onclick: () => setBase(false) }, 'None'),
        ),
        el('h3', { class: 'extras-title' }, 'Add-ons'),
        el('p', { class: 'note' }, 'Left unchecked, these numbers never appear in any problem.'),
        el('div', { class: 'chips extras' }, EXTRAS.map(chip)),
      ),
      el('div', { class: 'setup-side' }, opsPanel, formatPanel, timingPanel),
    ),
    el('div', { class: 'setup-start' }, start, warning),
  ));
  changed();
}

// ---------- Play ----------

// The student may type "7", "x = 7", or "x=7". Returns null if it isn't a number.
function parseAnswer(text) {
  const cleaned = text.trim().replace(/^x\s*=\s*/i, '').replace(/[−–]/g, '-').replace(/\s+/g, '');
  if (!/^-?\d+(\.\d+)?$/.test(cleaned)) return null;
  return Number(cleaned);
}

// Clicks on a fresh set of tiles sooner than this are taken as the tail of a
// double-click on the last set, not a choice.
const CHOICE_GUARD_MS = 200;

async function showPlay(game) {
  const settings = loadSettings();
  if (!isPlayable(settings, game)) { location.replace(`#/setup/${game.id}`); return; }
  await game.load?.();
  document.title = `${game.title} · ${SITE}`;

  const choice = isChoice(game, settings);
  const total = settings.minutes * 60000;
  const log = { correct: [], incorrect: [], skipped: [] };
  let problem = null;
  let shownAt = 0;
  let state = 'ready'; // → 'running' → 'done'
  let endsAt = 0;
  let ticker = 0;

  const clock = el('span', { class: 'clock', role: 'timer', 'aria-label': 'Time left' }, formatTime(total));
  const tally = el('span', { class: 'tally' });
  const feedback = el('div', { class: 'feedback', 'aria-live': 'polite' });
  const equation = el('div', { class: 'equation' });
  const help = el('p', { class: 'instructions' });

  // Free response: an answer box. Multiple choice: four tiles and a Skip button.
  const input = el('input', {
    class: 'answer', type: 'text', inputmode: 'numeric', autocomplete: 'off',
    autocapitalize: 'off', spellcheck: 'false', enterkeyhint: 'next', 'aria-label': 'Your answer',
  });
  const tiles = el('div', { class: 'choices', role: 'group', 'aria-label': 'Choices' });
  const answerArea = choice
    ? el('div', { class: 'choice-area' }, tiles,
        el('button', { type: 'button', class: 'btn skip', onclick: () => answer(null) }, 'Skip'))
    : el('div', { class: 'answer-row' }, game.answerLabel && tex(game.answerLabel), input);
  const problemBox = el('div', { class: `problem${!choice && !game.answerLabel ? ' inline' : ''}` }, equation, answerArea);

  function updateTally() {
    tally.replaceChildren(
      el('span', { class: 'tally-right' }, `✓ ${log.correct.length}`),
      el('span', { class: 'tally-wrong' }, `✗ ${log.incorrect.length}`),
    );
  }

  function setReady() {
    equation.replaceChildren(el('div', { class: 'ready' },
      el('p', { class: 'ready-title' }, 'Ready?'),
      el('p', {}, describeSettings(game, settings)),
      el('button', { type: 'button', class: 'btn primary big', onclick: begin }, 'Start'),
    ));
    help.textContent = 'Press Enter or Start when you’re ready.';
    answerArea.hidden = true;
  }

  function nextProblem() {
    problem = game.makeProblem(settings, problem);
    // "7 × 8 = ?" when the answer isn't typed on the same line.
    const shown = choice && !game.answerLabel ? `${problem.tex} \\; ?` : problem.tex;
    equation.replaceChildren(tex(shown, { class: 'equation-math' }));
    if (choice) {
      tiles.replaceChildren(...problem.choices.map(value => el('button', {
        type: 'button', class: 'choice',
        onclick: () => { if (performance.now() - shownAt >= CHOICE_GUARD_MS) answer(value); },
      }, tex(String(value)))));
    }
    shownAt = performance.now();
  }

  function begin() {
    state = 'running';
    answerArea.hidden = false;
    help.textContent = choice
      ? 'Click the right answer, or Skip.'
      : 'Type the answer and press Enter. Press Enter on an empty box to skip.';
    endsAt = performance.now() + total;
    ticker = setInterval(tick, 100);
    nextProblem();
    if (!choice) input.focus();
    else document.activeElement?.blur();
  }

  function tick() {
    const left = endsAt - performance.now();
    clock.textContent = formatTime(left);
    clock.classList.toggle('low', left <= 10000);
    if (left <= 0) finish();
  }

  function mark(kind, body) {
    // A fresh element each time, so the pop animation replays.
    // A skip gets a plain gray circle: no symbol, so it doesn't read as an error.
    const symbol = { correct: '✓', incorrect: '✗', skipped: '' }[kind];
    feedback.replaceChildren(el('div', { class: `mark mark-${kind}` },
      el('span', { class: 'mark-symbol', 'aria-hidden': 'true' }, symbol),
      el('div', { class: 'mark-body' }, body),
    ));
  }

  // `response` is the number given (a typed string or a chosen tile), or null for a skip.
  function answer(response) {
    if (state !== 'running') return;
    const shown = tex(problem.tex);
    const right = tex(game.answerTex(problem), { class: 'mark-answer' });
    if (response == null) {
      log.skipped.push({ ...problem });
      // Show the whole fact with its answer, so the student can learn it.
      mark('skipped', [el('span', { class: 'sr-only' }, 'Skipped: '), shown, right, el('span', { class: 'mark-note' }, 'skipped')]);
    } else if ((choice ? response : parseAnswer(response)) === problem.answer) {
      log.correct.push({ ...problem });
      mark('correct', [el('span', { class: 'sr-only' }, 'Correct: '), shown, right]);
    } else {
      log.incorrect.push({ ...problem, response: String(response).trim() });
      mark('incorrect', [
        el('span', { class: 'sr-only' }, 'Incorrect: '), shown, right,
        el('span', { class: 'mark-note' }, choice ? 'you chose ' : 'you typed ', el('s', {}, String(response).trim())),
      ]);
    }
    updateTally();
    nextProblem();
  }

  function onKey(e) {
    if (e.key !== 'Enter' || e.repeat) return;
    if (state === 'ready') { e.preventDefault(); begin(); }
    else if (state === 'running' && e.target === input) {
      e.preventDefault();
      const raw = input.value;
      input.value = '';
      answer(raw.trim() ? raw : null);
    }
  }

  function finish() {
    if (state === 'done') return;
    state = 'done';
    clearInterval(ticker);
    showResults(game, settings, log);
  }

  updateTally();
  setReady();
  show(el('main', { class: 'screen play' },
    el('header', { class: 'play-bar' },
      el('a', { class: 'btn quiet', href: `#/setup/${game.id}` }, '← Settings'),
      el('h1', {}, game.title),
      el('div', { class: 'stats' }, tally, clock),
    ),
    help,
    // In free response, clicking anywhere on the stage puts the cursor back in the answer box.
    el('section', { class: 'stage', onclick: e => { if (state === 'running' && !choice && e.target !== input) input.focus(); } },
      problemBox,
      feedback,
    ),
  ));
  // After show(), which runs the previous screen's cleanup.
  document.addEventListener('keydown', onKey);
  cleanup = () => { clearInterval(ticker); document.removeEventListener('keydown', onKey); };
}

// ---------- Results ----------

function showResults(game, settings, log) {
  const perMinute = n => formatRate(n / settings.minutes);
  const stat = (value, label, kind) => el('div', { class: `stat stat-${kind}` },
    el('span', { class: 'stat-value' }, value),
    el('span', { class: 'stat-label' }, label));

  const list = (title, kind, items, describe) => el('section', { class: `result-list list-${kind}` },
    el('h2', {}, `${title} `, el('span', { class: 'count' }, String(items.length))),
    items.length
      ? el('ol', {}, items.map(p => el('li', {}, tex(p.tex), el('span', { class: 'detail' }, describe(p)))))
      : el('p', { class: 'note' }, 'None'),
  );
  const verb = isChoice(game, settings) ? 'you chose ' : 'you typed ';

  const heading = el('h1', { tabindex: '-1' }, 'Time!');
  show(el('main', { class: 'screen results' },
    el('header', { class: 'results-head' },
      heading,
      el('p', { class: 'lede' }, `${game.title} · ${describeSettings(game, settings)}`),
    ),
    el('div', { class: 'win-stats' },
      stat(perMinute(log.correct.length), 'correct per minute', 'correct'),
      stat(perMinute(log.incorrect.length), 'incorrect per minute', 'incorrect'),
      stat(String(log.skipped.length), 'skipped', 'skipped'),
    ),
    el('div', { class: 'win-actions' },
      el('button', { type: 'button', class: 'btn primary', onclick: route }, 'Play again'),
      el('a', { class: 'btn', href: `#/setup/${game.id}` }, 'Change settings'),
      el('a', { class: 'btn', href: '#/' }, 'Menu'),
    ),
    el('div', { class: 'result-lists' },
      list('Correct', 'correct', log.correct, p => tex(game.answerTex(p))),
      list('Incorrect', 'incorrect', log.incorrect, p => [
        tex(game.answerTex(p)), el('span', { class: 'mark-note' }, verb, el('s', {}, p.response)),
      ]),
      list('Skipped', 'skipped', log.skipped, p => [
        tex(game.answerTex(p)), el('span', { class: 'mark-note' }, `${p.family}s family`),
      ]),
    ),
  ));
  // Focus the heading, not a button, so a late Enter press doesn't start a new round.
  heading.focus();
}

// ---------- Routing ----------

async function route() {
  const [, screen, id] = location.hash.match(/^#\/(setup|play)\/(.+)$/) ?? [];
  try {
    const game = screen && findGame(decodeURIComponent(id));
    if (screen && !game) throw new Error(`There is no game called "${decodeURIComponent(id)}".`);
    if (screen === 'setup') showSetup(game);
    else if (screen === 'play') await showPlay(game);
    else showMenu();
  } catch (err) {
    showError(err);
  }
}

addEventListener('hashchange', route);
// KaTeX loads with `defer`, so it is ready before this module runs.
route();
