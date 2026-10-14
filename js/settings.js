// The settings every game shares: fact families, operations, answer options, and round length.
// They are saved in the browser, so they carry over between rounds, between
// games, and between visits.
import { store, pick } from './util.js';

const KEY = 'pt-algebra:settings';

// The basic facts run from 1 to 12. 13, 14 and 15 are add-ons: unless one is
// checked, no problem uses that number anywhere.
export const BASE = Array.from({ length: 12 }, (_, i) => i + 1);
export const EXTRAS = [13, 14, 15];

export const OPS = [
  { id: 'add', label: 'Addition', sign: '+', sample: 'x + 5 = 12' },
  { id: 'sub', label: 'Subtraction', sign: '−', sample: 'x - 5 = 7' },
  { id: 'mul', label: 'Multiplication', sign: '×', sample: '5x = 35' },
  { id: 'div', label: 'Division', sign: '÷', sample: '\\dfrac{x}{5} = 7' },
];

export const TIMES = [0.5, 1, 2, 3, 5]; // minutes

// How students answer, in games that offer a choice.
export const FORMATS = [
  { id: 'type', label: 'Free response' },
  { id: 'choice', label: 'Multiple choice' },
];

// On/off options that only some games show (game.options lists their ids).
export const TOGGLES = [
  { id: 'negatives', label: 'Allow negative answers', short: 'negative answers', sample: '\\frac{3}{7} - \\frac{5}{7} = -\\frac{2}{7}' },
  { id: 'reduce', label: 'Require reduction', short: 'reduced answers', sample: '\\frac{6}{8} \\to \\frac{3}{4}' },
];

const DEFAULTS = { families: BASE, ops: OPS.map(o => o.id), minutes: 1, format: 'type', negatives: false, reduce: false };

export function loadSettings() {
  const saved = store.getJSON(KEY, {});
  const families = Array.isArray(saved.families)
    ? [...BASE, ...EXTRAS].filter(n => saved.families.includes(n))
    : DEFAULTS.families;
  const ops = Array.isArray(saved.ops)
    ? OPS.map(o => o.id).filter(id => saved.ops.includes(id))
    : DEFAULTS.ops;
  const minutes = TIMES.includes(saved.minutes) ? saved.minutes : DEFAULTS.minutes;
  const format = FORMATS.some(f => f.id === saved.format) ? saved.format : DEFAULTS.format;
  const toggles = Object.fromEntries(TOGGLES.map(t =>
    [t.id, typeof saved[t.id] === 'boolean' ? saved[t.id] : DEFAULTS[t.id]]));
  return { families, ops, minutes, format, ...toggles };
}

export function saveSettings(settings) {
  store.setJSON(KEY, settings);
}

// Every number a fact may use: 1–12, plus any add-on that is checked.
export const factNumbers = settings =>
  [...BASE, ...EXTRAS.filter(n => settings.families.includes(n))];

// The kinds of facts a game offers: all of them, unless the game lists its own.
export const gameOps = game => game.ops ?? OPS;

// What still has to be chosen before a round can start, as in "Choose at least
// a fact family". Kinds of facts only matter to games that use them (game.usesOps);
// a game may add its own need (game.needs).
export const missingChoices = (settings, game) => [
  !settings.families.length && 'a fact family',
  game.usesOps && !gameOps(game).some(o => settings.ops.includes(o.id)) && 'a kind of fact',
  settings.families.length > 0 && game.needs?.(settings),
].filter(Boolean);

export const isPlayable = (settings, game) => missingChoices(settings, game).length === 0;

// A fact from one of the chosen families: the family number and a partner from
// the allowed numbers, in either order.
export function pickFact(settings) {
  const family = pick(settings.families);
  const partner = pick(factNumbers(settings));
  const [a, b] = Math.random() < 0.5 ? [family, partner] : [partner, family];
  return { a, b, family };
}
