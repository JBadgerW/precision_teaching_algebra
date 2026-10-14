// The games on the menu, in menu order. A game module exports:
//   id, title, description   menu tile and URLs (#/setup/<id>, #/play/<id>)
//   sample                   a TeX equation shown on the menu tile
//   makeProblem(settings, previous) → { tex, answer, family, op, choices? }
//   answerLabel              TeX before the answer box ('x ='), or null to put the
//                            box on the same line as the problem
//   answerTex(problem)       the answer as shown in marks and results
// and optionally:
//   usesOps                  true if the "kinds of facts" setting applies
//   ops, opsNote             the kinds of facts offered (default: all of OPS) and
//                            the note under them on the settings page
//   options                  ids of on/off settings to show (TOGGLES in settings.js)
//   multipleChoice           true if the game offers multiple choice (problems
//                            then carry `choices` when settings.format is 'choice')
//   load()                   async; fetches any data before a round
//   answerInput              'fraction' for a numerator box over a denominator box;
//                            the response is then { num, den }
//   isCorrect(problem, response, settings)  instead of comparing to problem.answer
//   responseText(response)   a wrong response as shown in marks and results
import * as singleStep from './games/single-step.js';
import * as multiplication from './games/multiplication.js';
import * as fractionsEasy from './games/fractions-easy.js';

export const GAMES = [singleStep, multiplication, fractionsEasy];

export const findGame = id => GAMES.find(g => g.id === id);
