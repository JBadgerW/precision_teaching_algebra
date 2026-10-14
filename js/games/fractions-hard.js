// Adding and subtracting fractions with unlike denominators: a/p ± b/q = ?
// Every number in the problem comes from the chosen families: the numerators are
// any of them, and the denominators are two different ones from 2 up.
// The student types the answer as a fraction.
import { pick, shuffle } from '../util.js';
import { ops as fractionOps, fractionProblem, freshProblem } from '../fractions.js';

export { options, answerTex, isCorrect, responseText } from '../fractions.js';

export const id = 'fractions-hard';
export const title = 'Add and Subtract Fractions—Hard';
export const description = 'Add or subtract two fractions with different denominators.';
export const sample = '\\dfrac{2}{3} + \\dfrac{3}{4}';
export const usesOps = true;
export const ops = fractionOps.map(o => ({
  ...o, sample: o.id === 'add' ? '\\frac{2}{3} + \\frac{3}{4}' : '\\frac{5}{6} - \\frac{1}{4}',
}));
export const opsNote = 'Every number comes from the chosen fact families. The denominators are two different families from 2 up.';
export const answerLabel = null; // the fraction boxes follow "a/p + b/q =" on the same line
export const answerInput = 'fraction';

const denominators = settings => settings.families.filter(n => n > 1);

export const needs = settings =>
  denominators(settings).length < 2 ? 'two fact families from 2 up' : null;

function makeOne(settings) {
  const [x, y] = [pick(settings.families), pick(settings.families)];
  const [dx, dy] = shuffle(denominators(settings));
  const op = pick(settings.ops.filter(id => ops.some(o => o.id === id)));
  return fractionProblem(settings, { x, dx, y, dy, op, family: x });
}

export const makeProblem = (settings, previous) => freshProblem(() => makeOne(settings), previous);
