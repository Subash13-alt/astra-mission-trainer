/**
 * The ASTRA game engine.
 *
 * All functions are pure: they take a mission state and return a new one.
 * There is no randomness and no clock, so the same decisions always give the
 * same result, which makes the engine easy to test.
 */
import {
  ACTIONS,
  DIFFICULTIES,
  EFFECT_LIBRARY,
  FAIL_HEALTH,
  MISSION_LENGTH,
  RESOURCE_KEYS,
  SAVE_VERSION,
  START_VALUES,
  SURVIVAL_KEYS,
  STATUS_THRESHOLDS,
  PLANETS,
} from './missionConfig.js';
import {
  applyDeltas,
  canAfford,
  checkFailure,
  dailyConsumption,
  diffResources,
  effectMultiplier,
  getEnvironment,
  healthChange,
  isBlockedByEffect,
  round2,
} from './resourceManager.js';
import {
  choiceAvailability,
  getScenario,
  getChoiceStates,
  pickScenarioId,
  recordScenarioShown,
  resolveRisk,
} from './scenarioEngine.js';

const MAX_LOG = 200;

function addLog(state, kind, text) {
  state.log.push({ day: state.day, kind, text });
  if (state.log.length > MAX_LOG) state.log.splice(0, state.log.length - MAX_LOG);
}

function recordStats(state) {
  for (const key of RESOURCE_KEYS) {
    if (state.resources[key] < state.stats.minValues[key]) {
      state.stats.minValues[key] = state.resources[key];
    }
  }
}

function addEffect(state, id) {
  const def = EFFECT_LIBRARY[id];
  if (!def) return;
  const existing = state.effects.find((e) => e.id === id);
  if (existing) existing.daysLeft = def.days; // re-starting refreshes the timer
  else state.effects.push({ id, daysLeft: def.days });
}

function queueScenario(state) {
  const id = pickScenarioId(state);
  state.pendingScenarioId = id;
  if (id) {
    recordScenarioShown(state, id);
    addLog(state, 'alert', `${getScenario(id).emoji} ${getScenario(id).title}`);
  }
}

/** Create a brand new mission. */
export function createInitialState({
  nickname = 'Commander',
  avatar = 'aurora',
  difficulty = 'normal',
  planet = 'moon',
  now = Date.now(),
} = {}) {
  const diff = DIFFICULTIES[difficulty] || DIFFICULTIES.normal;
  const resources = { ...START_VALUES, radiation: diff.startRadiation };
  const state = {
    version: SAVE_VERSION,
    id: `mission-${now}`,
    startedAt: now,
    endedAt: null,
    profile: { nickname, avatar },
    difficulty: diff.id,
    planet,
    day: 1,
    status: 'playing', // playing | success | failed
    paused: false,
    resources,
    reserves: { ...diff.reserves },
    ap: diff.actionPoints,
    effects: [],
    research: 0,
    pendingScenarioId: null,
    lastOutcome: null,
    lastDaySummary: null,
    scenarioLog: {},
    decisions: [],
    actionCounts: {},
    log: [],
    history: [{ day: 0, ...resources, research: 0 }],
    stats: { minValues: { ...resources } },
    failure: null,
    daysCompleted: 0,
  };
  addLog(state, 'event', `Mission begins on ${PLANETS[planet].name}! Welcome, ${nickname}.`);
  queueScenario(state);
  return state;
}

/** Can this action be done right now? Returns { ok, reason, gains, costs }. */
export function getActionStatus(state, actionId) {
  const action = ACTIONS[actionId];
  if (!action) return { ok: false, reason: 'Unknown action.', gains: {}, costs: {} };

  const env = getEnvironment(state.planet, state.day);
  const gains = {};
  const gainMult = effectMultiplier(state.effects, actionId, 'actionMult');
  for (const [key, value] of Object.entries(action.gains)) {
    let v = value * gainMult;
    if (action.solar) v *= env.solarMult;
    gains[key] = round2(v);
  }
  const costs = { ...action.costs };
  const base = { gains, costs };

  if (state.status !== 'playing') return { ok: false, reason: 'The mission is over.', ...base };
  if (state.paused) return { ok: false, reason: 'The game is paused.', ...base };
  if (state.pendingScenarioId) return { ok: false, reason: 'Make today’s decision first!', ...base };
  if (state.ap <= 0) return { ok: false, reason: 'No actions left today. End the day!', ...base };
  if (isBlockedByEffect(state.effects, actionId)) {
    return { ok: false, reason: 'Paused to save power for now.', ...base };
  }
  if (actionId === 'experiment') {
    const unsafe = SURVIVAL_KEYS.some((k) => state.resources[k] < STATUS_THRESHOLDS.critical);
    if (unsafe) {
      return { ok: false, reason: 'Safety first! Fix air, water or food before experiments.', ...base };
    }
  }
  const afford = canAfford(state.resources, costs);
  if (!afford.ok) {
    return { ok: false, reason: `Not enough ${afford.missing.join(' & ')} to do this safely.`, ...base };
  }
  return { ok: true, reason: '', ...base };
}

function finishFailure(state, failure) {
  state.status = 'failed';
  state.failure = { ...failure, day: state.day };
  state.daysCompleted = Math.max(0, state.day - 1);
  state.endedAt = state.endedAt ?? Date.now();
  state.pendingScenarioId = null;
  addLog(state, 'event', 'Mission ended. Time to learn and try again!');
  return state;
}

function finishSuccess(state) {
  state.status = 'success';
  state.daysCompleted = MISSION_LENGTH;
  state.endedAt = state.endedAt ?? Date.now();
  state.pendingScenarioId = null;
  addLog(state, 'event', 'Mission accomplished!');
  return state;
}

function checkMidDayFailure(state) {
  const failure = checkFailure(state.resources, FAIL_HEALTH);
  if (failure) finishFailure(state, failure);
}

/** Do one daily action. Returns { state, ok, message }. */
export function performAction(prev, actionId) {
  const status = getActionStatus(prev, actionId);
  if (!status.ok) return { state: prev, ok: false, message: status.reason };

  const action = ACTIONS[actionId];
  const s = structuredClone(prev);
  const deltas = { ...status.gains };
  for (const [key, cost] of Object.entries(status.costs)) deltas[key] = (deltas[key] || 0) - cost;

  s.resources = applyDeltas(s.resources, deltas);
  s.ap -= 1;
  s.actionCounts[actionId] = (s.actionCounts[actionId] || 0) + 1;
  if (action.research) s.research += action.research;
  recordStats(s);
  addLog(s, 'action', `${action.label}`);
  checkMidDayFailure(s);
  return { state: s, ok: true, message: `${action.label} done!` };
}

/** Pick one of the three options for today’s scenario. */
export function chooseScenarioOption(prev, choiceIndex) {
  if (prev.status !== 'playing') return { state: prev, ok: false, message: 'The mission is over.' };
  if (prev.paused) return { state: prev, ok: false, message: 'The game is paused.' };
  if (!prev.pendingScenarioId) return { state: prev, ok: false, message: 'No decision to make right now.' };

  const scenario = getScenario(prev.pendingScenarioId);
  const choice = scenario?.choices[choiceIndex];
  if (!choice) return { state: prev, ok: false, message: 'Please pick one of the choices.' };

  const states = getChoiceStates(prev, scenario);
  if (!states[choiceIndex].available) {
    return { state: prev, ok: false, message: states[choiceIndex].reason };
  }

  const s = structuredClone(prev);
  const diff = DIFFICULTIES[s.difficulty];
  const before = { ...s.resources };

  for (const [key, n] of Object.entries(choice.reserveCost || {})) {
    s.reserves[key] = Math.max(0, (s.reserves[key] || 0) - n);
  }

  const deltas = { ...(choice.deltas || {}) };
  for (const [key, v] of Object.entries(resolveRisk(prev, choice))) {
    deltas[key] = (deltas[key] || 0) + (v < 0 ? v * diff.riskMult : v);
  }
  s.resources = applyDeltas(s.resources, deltas);

  for (const id of choice.effects || []) addEffect(s, id);
  if (choice.apLoss === 'all') s.ap = 0;
  else if (choice.apLoss) s.ap = Math.max(0, s.ap - choice.apLoss);
  if (choice.research) s.research = Math.max(0, s.research + choice.research);

  s.decisions.push({
    day: s.day,
    scenarioId: scenario.id,
    title: scenario.title,
    kind: scenario.kind,
    choiceId: choice.id,
    choiceLabel: choice.label,
    safety: choice.safety,
  });

  s.lastOutcome = {
    day: s.day,
    scenarioId: scenario.id,
    title: scenario.title,
    emoji: scenario.emoji,
    choiceLabel: choice.label,
    consequence: choice.consequence,
    lesson: choice.lesson,
    safety: choice.safety,
    changes: diffResources(before, s.resources),
    research: choice.research || 0,
    effects: (choice.effects || []).map((id) => EFFECT_LIBRARY[id]?.label).filter(Boolean),
  };
  s.pendingScenarioId = null;
  recordStats(s);
  addLog(s, 'decision', `${scenario.title}: ${choice.label}`);
  checkMidDayFailure(s);
  return { state: s, ok: true, message: 'Decision made!' };
}

/** Close the outcome card after the player has read it. */
export function clearOutcome(prev) {
  if (!prev.lastOutcome) return prev;
  return { ...prev, lastOutcome: null };
}

export function setPaused(prev, paused) {
  if (prev.status !== 'playing' || prev.paused === paused) return prev;
  return { ...prev, paused };
}

/** Finish today: use resources, update health, move to the next day. */
export function endDay(prev) {
  if (prev.status !== 'playing' || prev.paused || prev.pendingScenarioId) return prev;

  const s = structuredClone(prev);
  const diff = DIFFICULTIES[s.difficulty];
  const before = { ...s.resources };

  s.resources = applyDeltas(s.resources, dailyConsumption(s));
  s.resources = applyDeltas(s.resources, { health: healthChange(s.resources, diff.riskMult) });
  s.history.push({ day: s.day, ...s.resources, research: s.research });
  recordStats(s);
  s.lastDaySummary = { day: s.day, changes: diffResources(before, s.resources) };
  addLog(s, 'day', `Day ${s.day} finished.`);

  s.effects = s.effects
    .map((e) => ({ ...e, daysLeft: e.daysLeft - 1 }))
    .filter((e) => e.daysLeft > 0);

  const failure = checkFailure(s.resources, FAIL_HEALTH);
  if (failure) return finishFailure(s, failure);
  if (s.day >= MISSION_LENGTH) return finishSuccess(s);

  s.day += 1;
  s.ap = diff.actionPoints;
  queueScenario(s);
  return s;
}

/** Convenient summary for UI banners. */
export function getMissionSnapshot(state) {
  return {
    daysRemaining: Math.max(0, MISSION_LENGTH - state.day + (state.status === 'playing' ? 1 : 0)),
    environment: getEnvironment(state.planet, state.day),
  };
}
