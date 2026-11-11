/**
 * Practice crews ("autopilots"). They play with simple, fixed rules.
 *
 * They are used by the automated tests (to check the game is balanced and
 * can be won, or lost) and by Teacher / Demo mode to show a sample day.
 */
import { RESEARCH_TARGET, MISSION_LENGTH } from './missionConfig.js';
import { getScenario, getChoiceStates } from './scenarioEngine.js';
import { chooseScenarioOption, endDay, getActionStatus, performAction } from './gameEngine.js';

/** Pick the safest available choice (ties go to the earlier choice). */
export function safestChoiceIndex(state) {
  const sc = getScenario(state.pendingScenarioId);
  const avail = getChoiceStates(state, sc);
  let best = -1;
  sc.choices.forEach((c, i) => {
    if (!avail[i].available) return;
    if (best === -1 || c.safety > sc.choices[best].safety) best = i;
  });
  return best;
}

/** The last available choice – in this game that is the "carry on" option. */
export function lastChoiceIndex(state) {
  const sc = getScenario(state.pendingScenarioId);
  const avail = getChoiceStates(state, sc);
  for (let i = sc.choices.length - 1; i >= 0; i--) if (avail[i].available) return i;
  return 0;
}

/** Careful crew: fixes the lowest resource first, then does science. */
export function carefulNextAction(state) {
  const r = state.resources;
  const wants = [];
  if (r.radiation < 40) wants.push('shield');
  const needs = [
    ['oxygen', 'boostOxygen'],
    ['water', 'recycleWater'],
    ['food', 'greenhouse'],
    ['electricity', 'cleanPanels'],
  ]
    .filter(([k]) => r[k] < 55)
    .sort((a, b) => r[a[0]] - r[b[0]]);
  needs.forEach(([, a]) => wants.push(a));
  if (r.health < 85) wants.push('rest');
  if (r.oxygen >= 60 && r.water >= 60 && r.food >= 60 && r.electricity >= 35 && state.research < RESEARCH_TARGET + 2) {
    wants.push('experiment');
  }
  return wants.find((id) => getActionStatus(state, id).ok) || null;
}

export const STRATEGIES = {
  careful: {
    choose: safestChoiceIndex,
    nextAction: carefulNextAction,
  },
  passive: {
    choose: lastChoiceIndex,
    nextAction: () => null,
  },
  rusher: {
    // Does nothing but science, and always takes the risky option.
    choose: lastChoiceIndex,
    nextAction: (state) => (getActionStatus(state, 'experiment').ok ? 'experiment' : null),
  },
};

/** Play one full day with a strategy. */
export function playDay(state, strategy) {
  let s = state;
  if (s.pendingScenarioId) s = chooseScenarioOption(s, strategy.choose(s)).state;
  for (let i = 0; i < 10 && s.status === 'playing'; i++) {
    const id = strategy.nextAction(s);
    if (!id) break;
    const result = performAction(s, id);
    if (!result.ok) break;
    s = result.state;
  }
  return s.status === 'playing' ? endDay(s) : s;
}

/** Play a whole mission with a strategy. */
export function playMission(state, strategy) {
  let s = state;
  for (let i = 0; i < MISSION_LENGTH + 2 && s.status === 'playing'; i++) s = playDay(s, strategy);
  return s;
}
