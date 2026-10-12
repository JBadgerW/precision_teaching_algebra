// Single-step equations. Each problem is built from one basic fact:
// addition and subtraction from a + b = c, multiplication and division from a × b = c.
import { factNumbers } from '../settings.js';
import { pick } from '../util.js';

export const id = 'single-step';
export const title = 'Single-Step Equations';
export const description = 'Solve for x in one step: add, subtract, multiply or divide.';
export const sample = 'x + 5 = 12';

// Each form turns the fact (a, b, c) into an equation and its answer.
const FORMS = {
  add: [
    (a, b, c) => [`x + ${a} = ${c}`, b],
    (a, b, c) => [`${a} + x = ${c}`, b],
  ],
  sub: [
    (a, b, c) => [`x - ${a} = ${b}`, c],
    (a, b, c) => [`${c} - x = ${a}`, b],
  ],
  mul: [
    (a, b, c) => [`${a === 1 ? '1 \\cdot ' : a}x = ${c}`, b],
  ],
  div: [
    (a, b, c) => [`\\dfrac{x}{${a}} = ${b}`, c],
    (a, b, c) => [`\\dfrac{${c}}{x} = ${a}`, b],
  ],
};

// A problem's family is the chosen family number; its partner can be any
// allowed number, and either one may come first.
function makeOne(settings, numbers) {
  const family = pick(settings.families);
  const partner = pick(numbers);
  const [a, b] = Math.random() < 0.5 ? [family, partner] : [partner, family];
  const op = pick(settings.ops);
  const c = op === 'add' || op === 'sub' ? a + b : a * b;
  const [tex, answer] = pick(FORMS[op])(a, b, c);
  return { tex, answer, family, op };
}

export function makeProblem(settings, previous) {
  const numbers = factNumbers(settings);
  let problem;
  // Never show the same problem twice in a row (unless nothing else is possible).
  for (let tries = 0; tries < 20; tries++) {
    problem = makeOne(settings, numbers);
    if (problem.tex !== previous?.tex) break;
  }
  return problem;
}
