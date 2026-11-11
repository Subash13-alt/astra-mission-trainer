/**
 * Scenario selection and choice validation.
 * Scenarios are chosen with fixed rules (a schedule plus "resource is low"
 * triggers), so a mission always behaves the same way for the same decisions.
 */
import { SCENARIOS } from '../data/scenarios.js';
import {
  SCHEDULE,
  REACTIVE,
  DIFFICULTIES,
  MARS_COMM_DELAY_MIN,
  RESERVE_META,
  RESOURCE_META,
} from './missionConfig.js';

export function getScenario(id) {
  return SCENARIOS[id] || null;
}

function scheduledId(state) {
  const day = state.day;
  const diff = DIFFICULTIES[state.difficulty];
  const id = SCHEDULE[state.planet]?.[day] || SCHEDULE.common[day] || diff.extraScenarios?.[day] || null;
  if (!id) return null;
  const sc = SCENARIOS[id];
  return sc && sc.planets.includes(state.planet) ? id : null;
}

function reactiveId(state) {
  const log = state.scenarioLog || {};
  const eligible = REACTIVE.filter((r) => {
    if (state.day < r.minDay) return false;
    if (!(state.resources[r.key] < r.below)) return false;
    const entry = log[r.id];
    if (!entry) return true;
    if (entry.count >= r.max) return false;
    return state.day - entry.lastDay >= r.cooldown;
  });
  if (eligible.length === 0) return null;
  // The most urgent (lowest compared with its trigger level) goes first.
  eligible.sort((a, b) => state.resources[a.key] / a.below - state.resources[b.key] / b.below);
  return eligible[0].id;
}

/** Which scenario (if any) starts today? */
export function pickScenarioId(state) {
  return scheduledId(state) || reactiveId(state);
}

function matches(when, resources) {
  if (!when) return true;
  return Object.entries(when).every(([key, cond]) => {
    const v = resources[key];
    if (cond.lt !== undefined && !(v < cond.lt)) return false;
    if (cond.gte !== undefined && !(v >= cond.gte)) return false;
    return true;
  });
}

/** Unscaled risk deltas for a choice, based on the current resources. */
export function resolveRisk(state, choice) {
  for (const entry of choice.risk || []) {
    if (matches(entry.when, state.resources)) return entry.deltas || {};
  }
  return {};
}

/** Can the player pick this choice right now? */
export function choiceAvailability(state, choice) {
  for (const [key, n] of Object.entries(choice.reserveCost || {})) {
    if ((state.reserves?.[key] ?? 0) < n) {
      return { available: false, reason: `No ${RESERVE_META[key].label.toLowerCase()} left` };
    }
  }
  for (const [key, d] of Object.entries(choice.deltas || {})) {
    if (d < 0 && state.resources[key] + d < 0) {
      return { available: false, reason: `Not enough ${RESOURCE_META[key].label.toLowerCase()}` };
    }
  }
  return { available: true, reason: '' };
}

/** Availability for all three choices. The crew is never left without a move. */
export function getChoiceStates(state, scenario) {
  const states = scenario.choices.map((c) => choiceAvailability(state, c));
  if (states.every((s) => !s.available)) {
    // Safety net: allow the choice with the fewest requirements.
    let best = scenario.choices.length - 1;
    states[best] = { available: true, reason: '' };
  }
  return states;
}

function fillText(text, planet) {
  return text.replaceAll('{delay}', String(MARS_COMM_DELAY_MIN));
}

/** A ready-to-display version of a scenario for the current planet and state. */
export function getScenarioView(id, state) {
  const sc = SCENARIOS[id];
  if (!sc) return null;
  const pick = (v) => (typeof v === 'string' ? v : v[state.planet] || v.moon || '');
  const states = getChoiceStates(state, sc);
  return {
    id: sc.id,
    title: sc.title,
    emoji: sc.emoji,
    kind: sc.kind,
    realData: sc.realData || null,
    situation: fillText(pick(sc.situation), state.planet),
    explanation: fillText(pick(sc.explanation), state.planet),
    hint: sc.hint,
    choices: sc.choices.map((c, i) => ({ ...c, ...states[i] })),
  };
}

/** Remember that a scenario was shown (used for cooldowns). */
export function recordScenarioShown(state, id) {
  const entry = state.scenarioLog[id] || { count: 0, lastDay: -99 };
  state.scenarioLog[id] = { count: entry.count + 1, lastDay: state.day };
}
