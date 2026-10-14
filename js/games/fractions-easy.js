// Adding and subtracting fractions with like denominators: a/d ± b/d = ?
// The numerators are a fact from the chosen families; the denominator is any
// allowed number from 2 up. The student types the answer as a fraction.
import { OPS, pickFact, factNumbers } from '../settings.js';
import { pick } from '../util.js';

export const id = 'fractions-easy';
export const title = 'Add and Subtract Fractions—Easy';
export const description = 'Add or subtract two fractions with the same denominator.';
export const sample = '\\dfrac{2}{7} + \\dfrac{3}{7}';
export const usesOps = true;
export const ops = OPS.filter(o => o.id === 'add' || o.id === 'sub').map(o => ({
  ...o, sample: o.id === 'add' ? '\\frac{2}{7} + \\frac{3}{7}' : '\\frac{5}{7} - \\frac{3}{7}',
}));
export const opsNote = 'The numerators come from the fact families; the denominators are any allowed number from 2 up.';
export const options = ['negatives', 'reduce'];
export const answerLabel = null; // the fraction boxes follow "a/d + b/d =" on the same line
export const answerInput = 'fraction';

const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));

// "-\dfrac{2}{7}", or a whole number when the denominator is 1.
function fracTex(n, d) {
  if (d === 1) return String(n);
  return `${n < 0 ? '-' : ''}\\dfrac{${Math.abs(n)}}{${d}}`;
}

// The answer over the shared denominator, then reduced if it can be: 6/8 = 3/4.
export function answerTex(p) {
  const g = gcd(p.n, p.d); // gcd(0, d) = d, so 0/d reduces to 0
  const raw = fracTex(p.n, p.d);
  return g === 1 ? raw : `${raw} = ${fracTex(p.n / g, p.d / g)}`;
}

// A whole number, with an optional minus sign. Returns null if it isn't one.
function parseWhole(text) {
  const cleaned = text.trim().replace(/[−–]/g, '-').replace(/\s+/g, '');
  return /^-?\d+$/.test(cleaned) ? Number(cleaned) : null;
}

// `response` is { num, den }, as typed. A blank denominator means a whole number.
export function isCorrect(p, { num, den }, settings) {
  const n = parseWhole(num);
  const d = den.trim() ? parseWhole(den) : 1;
  if (n == null || !d) return false;
  if (n * p.d !== p.n * d) return false;
  return !settings.reduce || gcd(n, d) === 1;
}

export const responseText = ({ num, den }) =>
  den.trim() ? `${num.trim()}/${den.trim()}` : num.trim();

function makeOne(settings) {
  const { a, b, family } = pickFact(settings);
  const d = pick(factNumbers(settings).filter(n => n > 1));
  const op = pick(settings.ops.filter(id => ops.some(o => o.id === id)));
  // Without negative answers, the larger numerator comes first.
  const [x, y] = op === 'sub' && !settings.negatives && a < b ? [b, a] : [a, b];
  const sign = op === 'add' ? '+' : '-';
  return {
    tex: `\\dfrac{${x}}{${d}} ${sign} \\dfrac{${y}}{${d}} =`,
    n: op === 'add' ? x + y : x - y, d, family, op,
  };
}

export function makeProblem(settings, previous) {
  let problem;
  // Never show the same problem twice in a row (unless nothing else is possible).
  for (let tries = 0; tries < 20; tries++) {
    problem = makeOne(settings);
    if (problem.tex !== previous?.tex) break;
  }
  return problem;
}
