// Multiplication facts: a × b = ?, answered by typing or by picking one of four
// tiles. The wrong tiles come from data/multiplication_distractors.json.
import { pickFact } from '../settings.js';
import { fetchJSON, shuffle } from '../util.js';

export const id = 'multiplication';
export const title = 'Multiplication Facts';
export const description = 'Type the product, or pick it from four choices.';
export const sample = '7 \\times 8';
export const multipleChoice = true;
export const answerLabel = null; // the answer box follows "a × b =" on the same line
export const answerTex = p => String(p.answer);

// "a×b" (a ≤ b) → [distractors], loaded once before the first round.
let distractors = null;

export async function load() {
  if (distractors) return;
  const data = await fetchJSON('data/multiplication_distractors.json');
  distractors = new Map(data.facts.map(f => [`${f.a}×${f.b}`, f.distractors]));
}

export function makeProblem(settings, previous) {
  let problem;
  // Never show the same problem twice in a row (unless nothing else is possible).
  for (let tries = 0; tries < 20; tries++) {
    const { a, b, family } = pickFact(settings);
    problem = { tex: `${a} \\times ${b} =`, answer: a * b, family, op: 'mul', a, b };
    if (problem.tex !== previous?.tex) break;
  }
  if (settings.format === 'choice') {
    const [a, b] = [problem.a, problem.b].sort((x, y) => x - y);
    const wrong = distractors?.get(`${a}×${b}`);
    if (!wrong) throw new Error(`No distractors for ${a} × ${b} in data/multiplication_distractors.json`);
    problem.choices = shuffle([problem.answer, ...wrong]);
  }
  return problem;
}
