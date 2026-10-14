// Single-step equations. Each problem is built from one basic fact:
// addition and subtraction from a + b = c, multiplication and division from a × b = c.
import { pickFact } from '../settings.js';
import { pick } from '../util.js';

export const id = 'single-step';
export const title = 'Single-Step Equations';
export const description = 'Solve for x in one step: add, subtract, multiply or divide.';
export const sample = 'x + 5 = 12';
export const usesOps = true;
export const opsNote = 'Addition and subtraction come from the addition facts; multiplication and division from the multiplication facts.';
export const answerLabel = 'x =';
export const answerTex = p => `x = ${p.answer}`;

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

function makeOne(settings) {
  const { a, b, family } = pickFact(settings);
  const op = pick(settings.ops);
  const c = op === 'add' || op === 'sub' ? a + b : a * b;
  const [tex, answer] = pick(FORMS[op])(a, b, c);
  return { tex, answer, family, op };
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
