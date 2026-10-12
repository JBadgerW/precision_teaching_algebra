// The games on the menu, in menu order. A game module exports:
//   id, title, description   menu tile and URLs (#/setup/<id>, #/play/<id>)
//   sample                   a TeX equation shown on the menu tile
//   makeProblem(settings, previous) → { tex, answer, family, op, choices? }
//   answerLabel              TeX before the answer box ('x ='), or null to put the
//                            box on the same line as the problem
//   answerTex(problem)       the answer as shown in marks and results
// and optionally:
//   usesOps                  true if the "kinds of facts" setting applies
//   multipleChoice           true if the game offers multiple choice (problems
//                            then carry `choices` when settings.format is 'choice')
//   load()                   async; fetches any data before a round
import * as singleStep from './games/single-step.js';
import * as multiplication from './games/multiplication.js';

export const GAMES = [singleStep, multiplication];

export const findGame = id => GAMES.find(g => g.id === id);
