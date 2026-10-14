// Multiplying and dividing fractions: a/p × b/q = ? and a/p ÷ b/q = ?
// Every number in the problem comes from the chosen families: the numerators are
// any of them, and the denominators any from 2 up. The student types the answer
// as a fraction.
import { OPS } from '../settings.js';
import { pick } from '../util.js';
import { fractionProblem, freshProblem } from '../fractions.js';

export { answerTex, isCorrect, responseText } from '../fractions.js';

export const id = 'fractions-muldiv';
export const title = 'Multiply and Divide Fractions';
export const description = 'Multiply or divide two fractions.';
export const sample = '\\dfrac{2}{3} \\times \\dfrac{3}{4}';
export const usesOps = true;
export const ops = OPS.filter(o => o.id === 'mul' || o.id === 'div').map(o => ({
  ...o, sample: o.id === 'mul' ? '\\frac{2}{3} \\times \\frac{3}{4}' : '\\frac{2}{3} \\div \\frac{3}{4}',
}));
export const opsNote = 'Every number comes from the chosen fact families. The denominators are families from 2 up.';
// Products and quotients of positive fractions are never negative.
export const options = ['reduce'];
export const answerLabel = null; // the fraction boxes follow "a/p × b/q =" on the same line
export const answerInput = 'fraction';

const denominators = settings => settings.families.filter(n => n > 1);

export const needs = settings =>
  denominators(settings).length < 1 ? 'one fact family from 2 up' : null;

function makeOne(settings) {
  const [x, y] = [pick(settings.families), pick(settings.families)];
  const [dx, dy] = [pick(denominators(settings)), pick(denominators(settings))];
  const op = pick(settings.ops.filter(id => ops.some(o => o.id === id)));
  return fractionProblem(settings, { x, dx, y, dy, op, family: x });
}

export const makeProblem = (settings, previous) => freshProblem(() => makeOne(settings), previous);
