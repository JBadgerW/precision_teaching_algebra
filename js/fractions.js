// What the fraction games share: the kinds of facts and options they offer,
// how answers are shown, and how a typed fraction is checked.
import { OPS } from './settings.js';

export const ops = OPS.filter(o => o.id === 'add' || o.id === 'sub');
export const options = ['negatives', 'reduce'];

export const gcd = (a, b) => (b ? gcd(b, a % b) : Math.abs(a));
export const lcm = (a, b) => (a * b) / gcd(a, b);

// "-\dfrac{2}{7}", or a whole number when the denominator is 1.
function fracTex(n, d) {
  if (d === 1) return String(n);
  return `${n < 0 ? '-' : ''}\\dfrac{${Math.abs(n)}}{${d}}`;
}

// The answer over the common denominator, then reduced if it can be: 6/8 = 3/4.
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

const SIGNS = { add: '+', sub: '-', mul: '\\times', div: '\\div' };

// x/dx ∘ y/dy as a problem, with its answer n/d before reducing: over the least
// common denominator for + and −, the plain product for × and ÷ (6/12, not 1/2).
// Without negative answers, a subtraction puts the larger fraction first.
export function fractionProblem(settings, { x, dx, y, dy, op, family }) {
  if (op === 'sub' && !settings.negatives && x * dy < y * dx) [x, dx, y, dy] = [y, dy, x, dx];
  let n, d;
  if (op === 'mul') [n, d] = [x * y, dx * dy];
  else if (op === 'div') [n, d] = [x * dy, dx * y];
  else {
    d = lcm(dx, dy);
    const [nx, ny] = [x * (d / dx), y * (d / dy)];
    n = op === 'add' ? nx + ny : nx - ny;
  }
  return { tex: `\\dfrac{${x}}{${dx}} ${SIGNS[op]} \\dfrac{${y}}{${dy}} =`, n, d, family, op };
}

// Never show the same problem twice in a row (unless nothing else is possible).
export function freshProblem(makeOne, previous) {
  let problem;
  for (let tries = 0; tries < 20; tries++) {
    problem = makeOne();
    if (problem.tex !== previous?.tex) break;
  }
  return problem;
}
