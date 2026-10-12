// The settings every game shares: fact families, operations, and round length.
// They are saved in the browser, so they carry over between rounds, between
// games, and between visits.
import { store } from './util.js';

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

const DEFAULTS = { families: BASE, ops: OPS.map(o => o.id), minutes: 1 };

export function loadSettings() {
  const saved = store.getJSON(KEY, {});
  const families = Array.isArray(saved.families)
    ? [...BASE, ...EXTRAS].filter(n => saved.families.includes(n))
    : DEFAULTS.families;
  const ops = Array.isArray(saved.ops)
    ? OPS.map(o => o.id).filter(id => saved.ops.includes(id))
    : DEFAULTS.ops;
  const minutes = TIMES.includes(saved.minutes) ? saved.minutes : DEFAULTS.minutes;
  return { families, ops, minutes };
}

export function saveSettings(settings) {
  store.setJSON(KEY, settings);
}

// Every number a fact may use: 1–12, plus any add-on that is checked.
export const factNumbers = settings =>
  [...BASE, ...EXTRAS.filter(n => settings.families.includes(n))];

export const isPlayable = settings => settings.families.length > 0 && settings.ops.length > 0;
