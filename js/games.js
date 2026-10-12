// The games on the menu, in menu order. A game module exports:
//   id, title, description   menu tile and URLs (#/setup/<id>, #/play/<id>)
//   sample                   a TeX equation shown on the menu tile
//   makeProblem(settings, previous) → { tex, answer, family, op }
import * as singleStep from './games/single-step.js';

export const GAMES = [singleStep];

export const findGame = id => GAMES.find(g => g.id === id);
