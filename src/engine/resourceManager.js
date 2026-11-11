/**
 * Resource maths. Pure functions only – no randomness, no clock –
 * so every calculation is deterministic and unit-testable.
 */
import {
  DAILY_BASE,
  DIFFICULTIES,
  PLANETS,
  EFFECT_LIBRARY,
  STATUS_THRESHOLDS,
  MIN_RESERVE,
  OFFLINE_MULT,
  MOON_NIGHT,
  MARS_STORM,
  MARS_HAZE_DAYS,
  RESOURCE_KEYS,
} from './missionConfig.js';

export const clamp = (v, lo = 0, hi = 100) => Math.min(hi, Math.max(lo, v));
export const round2 = (v) => Math.round(v * 100) / 100;

/** 'good' (green) | 'warning' (yellow) | 'critical' (red). */
export function statusOf(value) {
  if (value < STATUS_THRESHOLDS.critical) return 'critical';
  if (value < STATUS_THRESHOLDS.warning) return 'warning';
  return 'good';
}

/** Add deltas to resources. Result is always kept between 0 and 100. */
export function applyDeltas(resources, deltas = {}) {
  const out = { ...resources };
  for (const [key, value] of Object.entries(deltas)) {
    if (key in out) out[key] = round2(clamp(out[key] + value));
  }
  return out;
}

/** Difference between two resource snapshots (only keys that changed). */
export function diffResources(before, after) {
  const out = {};
  for (const key of RESOURCE_KEYS) {
    const d = round2(after[key] - before[key]);
    if (d !== 0) out[key] = d;
  }
  return out;
}

/**
 * Can the crew pay these costs and still keep a small safety reserve?
 * Returns { ok, missing: [keys] }.
 */
export function canAfford(resources, costs = {}, reserve = MIN_RESERVE) {
  const missing = [];
  for (const [key, cost] of Object.entries(costs)) {
    if (resources[key] - cost < reserve) missing.push(key);
  }
  return { ok: missing.length === 0, missing };
}

/** Multiply together every active effect's multiplier for a key. */
export function effectMultiplier(effects = [], key, field = 'consumptionMult') {
  let m = 1;
  for (const e of effects) {
    const def = EFFECT_LIBRARY[e.id];
    const v = def?.[field]?.[key];
    if (v) m *= v;
  }
  return m;
}

export function isBlockedByEffect(effects = [], actionId) {
  return effects.some((e) => EFFECT_LIBRARY[e.id]?.blocks?.includes(actionId));
}

/** What is happening outside today? (Values are illustrative.) */
export function getEnvironment(planet, day) {
  if (planet === 'moon') {
    if (day >= MOON_NIGHT.start && day <= MOON_NIGHT.end) {
      return {
        id: 'lunar-night',
        label: 'Lunar night',
        emoji: '🌑',
        sunlight: 'No sunlight',
        temperatureC: -150,
        solarMult: 0.2,
        electricityMult: 1.7,
        note: 'Night! Solar panels cannot make power, so the batteries and savings matter.',
      };
    }
    return {
      id: 'lunar-day',
      label: 'Lunar daytime',
      emoji: '🌕',
      sunlight: 'Bright sunlight',
      temperatureC: 100,
      solarMult: 1,
      electricityMult: 1,
      note: 'Sunny! Solar panels work well, but the surface is very hot.',
    };
  }
  if (day >= MARS_STORM.start && day <= MARS_STORM.end) {
    return {
      id: 'dust-storm',
      label: 'Dust storm',
      emoji: '🌪️',
      sunlight: 'Sun hidden by dust',
      temperatureC: -75,
      solarMult: 0.35,
      electricityMult: 1.5,
      note: 'Dust hides the Sun. Solar panels make much less power.',
    };
  }
  if (MARS_HAZE_DAYS.includes(day)) {
    return {
      id: 'hazy',
      label: 'Hazy sky',
      emoji: '🌫️',
      sunlight: 'Dim, dusty light',
      temperatureC: -65,
      solarMult: 0.7,
      electricityMult: 1.15,
      note: 'The sky is dusty. Solar panels make a bit less power.',
    };
  }
  return {
    id: 'clear',
    label: 'Clear and cold',
    emoji: '🪐',
    sunlight: 'Pale sunlight',
    temperatureC: -60,
    solarMult: 1,
    electricityMult: 1,
    note: 'A calm, cold day on Mars.',
  };
}

/**
 * Daily consumption (negative numbers) for the state's planet, difficulty,
 * environment and active effects.
 */
export function dailyConsumption(state) {
  const diff = DIFFICULTIES[state.difficulty];
  const planet = PLANETS[state.planet];
  const env = getEnvironment(state.planet, state.day);
  const offline = state.resources.electricity <= 0;
  const out = {};

  for (const key of ['oxygen', 'water', 'food']) {
    let v =
      DAILY_BASE[key] *
      diff.consumptionMult *
      planet.consumption[key] *
      effectMultiplier(state.effects, key);
    if (offline && key !== 'food') v *= OFFLINE_MULT; // life support struggles with no power
    out[key] = -round2(v);
  }

  out.electricity = -round2(
    DAILY_BASE.electricity *
      diff.consumptionMult *
      planet.consumption.electricity *
      env.electricityMult *
      effectMultiplier(state.effects, 'electricity'),
  );

  out.radiation = -round2(DAILY_BASE.radiation * planet.radiationWear * diff.riskMult);
  return out;
}

function penaltyFor(value, steps) {
  for (const [limit, penalty] of steps) if (value < limit) return penalty;
  return 0;
}

/**
 * Daily change in simulated crew health. Not a medical model – just a
 * simple, explainable game rule.
 */
export function healthChange(resources, riskMult = 1) {
  let penalty = 0;
  penalty += penaltyFor(resources.oxygen, [[0.01, 30], [10, 12], [25, 6]]);
  penalty += penaltyFor(resources.water, [[0.01, 20], [10, 8], [25, 4]]);
  penalty += penaltyFor(resources.food, [[0.01, 15], [10, 6], [25, 3]]);
  penalty += penaltyFor(resources.radiation, [[15, 6], [30, 3]]);
  penalty += penaltyFor(resources.electricity, [[10, 2]]);

  if (penalty > 0) return -round2(penalty * riskMult);

  const comfy =
    resources.oxygen >= 40 &&
    resources.water >= 40 &&
    resources.food >= 40 &&
    resources.radiation >= 40;
  return comfy ? 3 : 0;
}

/** Which survival resource (or health) has ended the mission, if any? */
export function checkFailure(resources, failHealth) {
  if (resources.oxygen <= 0) return { resource: 'oxygen' };
  if (resources.water <= 0) return { resource: 'water' };
  if (resources.food <= 0) return { resource: 'food' };
  if (resources.health <= failHealth) return { resource: 'health' };
  return null;
}
