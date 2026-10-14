// Adding and subtracting fractions with like denominators: a/d ± b/d = ?
// The numerators are a fact from the chosen families; the denominator is any
// allowed number from 2 up. The student types the answer as a fraction.
import { pickFact, factNumbers } from '../settings.js';
import { pick } from '../util.js';
import { ops as fractionOps, fractionProblem, freshProblem } from '../fractions.js';

export { options, answerTex, isCorrect, responseText } from '../fractions.js';

export const id = 'fractions-easy';
export const title = 'Add and Subtract Fractions—Easy';
export const description = 'Add or subtract two fractions with the same denominator.';
export const sample = '\\dfrac{2}{7} + \\dfrac{3}{7}';
export const usesOps = true;
export const ops = fractionOps.map(o => ({
  ...o, sample: o.id === 'add' ? '\\frac{2}{7} + \\frac{3}{7}' : '\\frac{5}{7} - \\frac{3}{7}',
}));
export const opsNote = 'The numerators come from the fact families; the denominators are any allowed number from 2 up.';
export const answerLabel = null; // the fraction boxes follow "a/d + b/d =" on the same line
export const answerInput = 'fraction';

function makeOne(settings) {
  const { a, b, family } = pickFact(settings);
  const d = pick(factNumbers(settings).filter(n => n > 1));
  const op = pick(settings.ops.filter(id => ops.some(o => o.id === id)));
  return fractionProblem(settings, { x: a, dx: d, y: b, dy: d, op, family });
}

export const makeProblem = (settings, previous) => freshProblem(() => makeOne(settings), previous);
