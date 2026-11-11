import test from 'node:test';
import assert from 'node:assert/strict';

import {
  ACTIONS,
  DIFFICULTIES,
  MISSION_LENGTH,
  PLANETS,
  RESOURCE_KEYS,
  START_VALUES,
} from '../missionConfig.js';
import {
  applyDeltas,
  canAfford,
  checkFailure,
  clamp,
  dailyConsumption,
  getEnvironment,
  healthChange,
  statusOf,
} from '../resourceManager.js';
import {
  chooseScenarioOption,
  clearOutcome,
  createInitialState,
  endDay,
  getActionStatus,
  performAction,
  setPaused,
} from '../gameEngine.js';
import { SCENARIOS } from '../../data/scenarios.js';
import { getChoiceStates, getScenarioView, pickScenarioId } from '../scenarioEngine.js';
import { buildReport } from '../scoringEngine.js';
import { playDay, playMission, STRATEGIES } from '../autopilot.js';

/** A fresh mission with no pending scenario, plus any overrides. */
function mk(overrides = {}, opts = {}) {
  const s = createInitialState({ now: 1, ...opts });
  s.pendingScenarioId = null;
  s.scenarioLog = {};
  return Object.assign(s, overrides);
}

const inBounds = (s) => RESOURCE_KEYS.every((k) => s.resources[k] >= 0 && s.resources[k] <= 100);

// ---------------------------------------------------------------- resources

test('applyDeltas never goes below 0 or above 100', () => {
  const r = applyDeltas({ oxygen: 5, water: 98 }, { oxygen: -50, water: 50 });
  assert.equal(r.oxygen, 0);
  assert.equal(r.water, 100);
  assert.equal(clamp(150), 100);
  assert.equal(clamp(-5), 0);
});

test('statusOf uses green / yellow / red zones', () => {
  assert.equal(statusOf(100), 'good');
  assert.equal(statusOf(50), 'good');
  assert.equal(statusOf(49.9), 'warning');
  assert.equal(statusOf(25), 'warning');
  assert.equal(statusOf(24.9), 'critical');
  assert.equal(statusOf(0), 'critical');
});

test('canAfford keeps a safety reserve', () => {
  assert.equal(canAfford({ electricity: 10 }, { electricity: 5 }).ok, true);
  assert.equal(canAfford({ electricity: 7 }, { electricity: 5 }).ok, false);
  assert.deepEqual(canAfford({ electricity: 7, water: 50 }, { electricity: 5, water: 3 }).missing, ['electricity']);
});

test('daily consumption is deterministic and matches the configured rates', () => {
  const s = mk({}, { planet: 'moon', difficulty: 'normal' });
  assert.deepEqual(dailyConsumption(s), {
    oxygen: -3.3,
    water: -2.9,
    food: -2.7,
    electricity: -2.5,
    radiation: -0.96,
  });
  // same input, same output
  assert.deepEqual(dailyConsumption(s), dailyConsumption(structuredClone(s)));
});

test('difficulty changes consumption', () => {
  const easy = dailyConsumption(mk({}, { difficulty: 'easy' }));
  const hard = dailyConsumption(mk({}, { difficulty: 'challenge' }));
  assert.ok(Math.abs(easy.oxygen) < Math.abs(hard.oxygen));
});

test('environment changes electricity use (lunar night, Mars dust storm)', () => {
  const day = dailyConsumption(mk({ day: 5 }, { planet: 'moon' }));
  const night = dailyConsumption(mk({ day: 13 }, { planet: 'moon' }));
  assert.ok(Math.abs(night.electricity) > Math.abs(day.electricity));
  assert.equal(getEnvironment('moon', 13).id, 'lunar-night');
  assert.equal(getEnvironment('mars', 14).id, 'dust-storm');
  assert.equal(getEnvironment('mars', 5).id, 'clear');
});

test('with no electricity, air and water use goes up (life support struggles)', () => {
  const ok = dailyConsumption(mk({}));
  const s = mk({});
  s.resources.electricity = 0;
  const offline = dailyConsumption(s);
  assert.ok(Math.abs(offline.oxygen) > Math.abs(ok.oxygen));
  assert.ok(Math.abs(offline.water) > Math.abs(ok.water));
});

test('healthChange: recovery when safe, penalties when low, scaled by difficulty', () => {
  const safe = { oxygen: 80, water: 80, food: 80, electricity: 80, radiation: 80, health: 90 };
  assert.equal(healthChange(safe), 3);
  const lowO2 = { ...safe, oxygen: 20 };
  assert.equal(healthChange(lowO2, 1), -6);
  assert.equal(healthChange(lowO2, 0.5), -3);
  assert.equal(healthChange({ ...safe, oxygen: 0 }, 1), -30);
});

test('checkFailure detects empty life support and low health', () => {
  const ok = { ...START_VALUES };
  assert.equal(checkFailure(ok, 15), null);
  assert.equal(checkFailure({ ...ok, water: 0 }, 15).resource, 'water');
  assert.equal(checkFailure({ ...ok, health: 15 }, 15).resource, 'health');
  assert.equal(checkFailure({ ...ok, electricity: 0 }, 15), null); // power alone is not instant failure
});

// ------------------------------------------------------------------ actions

test('every action has a resource cost (no free actions)', () => {
  for (const a of Object.values(ACTIONS)) {
    assert.ok(Object.keys(a.costs).length > 0, `${a.id} must cost something`);
  }
});

test('performAction applies costs and gains and uses an action point', () => {
  const s = mk({}, { difficulty: 'normal' });
  s.resources.oxygen = 50;
  const { state, ok } = performAction(s, 'boostOxygen');
  assert.equal(ok, true);
  assert.equal(state.resources.oxygen, 60);
  assert.equal(state.resources.electricity, 95);
  assert.equal(state.ap, s.ap - 1);
  assert.equal(state.actionCounts.boostOxygen, 1);
  assert.equal(s.resources.oxygen, 50, 'original state must not change');
});

test('performAction refuses when out of action points', () => {
  const s = mk({ ap: 0 });
  const r = performAction(s, 'boostOxygen');
  assert.equal(r.ok, false);
  assert.match(r.message, /No actions left/);
});

test('performAction refuses unaffordable actions and keeps resources valid', () => {
  const s = mk({});
  s.resources.electricity = 6; // needs 5 and a reserve of 3
  const r = performAction(s, 'boostOxygen');
  assert.equal(r.ok, false);
  assert.equal(r.state, s);
});

test('experiments are blocked while air, water or food is critical', () => {
  const s = mk({});
  s.resources.water = 20;
  const st = getActionStatus(s, 'experiment');
  assert.equal(st.ok, false);
  assert.match(st.reason, /Safety first/);
});

test('solar panels give less power at night and in dust', () => {
  const sunny = getActionStatus(mk({ day: 5 }, { planet: 'moon' }), 'cleanPanels').gains.electricity;
  const night = getActionStatus(mk({ day: 13 }, { planet: 'moon' }), 'cleanPanels').gains.electricity;
  assert.equal(sunny, 10);
  assert.ok(night < sunny);
});

test('actions cannot be used while a decision is waiting, or while paused', () => {
  const s = createInitialState({ now: 1 });
  s.pendingScenarioId = 'water-shortage';
  assert.match(getActionStatus(s, 'rest').reason, /decision first/);
  const p = setPaused(mk({}), true);
  assert.equal(performAction(p, 'rest').ok, false);
  assert.equal(endDay(p), p);
});

// --------------------------------------------------------------- scenarios

test('there are at least 10 scenarios, each with three complete choices', () => {
  const list = Object.values(SCENARIOS);
  assert.ok(list.length >= 10);
  for (const sc of list) {
    assert.equal(sc.choices.length, 3, sc.id);
    assert.ok(sc.situation && sc.explanation && sc.hint, sc.id);
    for (const c of sc.choices) {
      assert.ok(c.label && c.costText && c.consequence && c.lesson, `${sc.id}/${c.id}`);
      assert.ok([0, 1, 2].includes(c.safety), `${sc.id}/${c.id} safety`);
    }
  }
});

test('the five required scenarios exist', () => {
  for (const id of ['solar-storm', 'water-shortage', 'power-failure', 'food-shortage', 'comm-delay']) {
    assert.ok(SCENARIOS[id], id);
  }
});

test('scenarios appear at the planned mission stages', () => {
  const at = (day, planet = 'moon', difficulty = 'normal') =>
    pickScenarioId({ ...mk({ day }, { planet, difficulty }), day });
  assert.equal(at(4), 'air-filter');
  assert.equal(at(17), 'solar-storm');
  assert.equal(at(21), 'comm-delay');
  assert.equal(at(27), 'final-challenge');
  assert.equal(at(12, 'moon'), 'lunar-night');
  assert.equal(at(13, 'mars'), 'mars-dust-storm');
  assert.equal(at(12, 'mars'), null);
  assert.equal(at(1), null);
});

test('a low resource triggers its emergency scenario, with a cooldown', () => {
  const s = mk({ day: 5 });
  s.resources.water = 46;
  const next = endDay(s); // water drops below 45 on the way into day 6
  assert.equal(next.day, 6);
  assert.equal(next.pendingScenarioId, 'water-shortage');

  const resolved = chooseScenarioOption(next, 0).state;
  resolved.resources.water = 30;
  const day7 = endDay(resolved);
  assert.notEqual(day7.pendingScenarioId, 'water-shortage', 'cooldown must stop an immediate repeat');
});

test('solar storm choice A: costs electricity, adds protection', () => {
  const s = mk({ day: 17 });
  s.pendingScenarioId = 'solar-storm';
  const { state, ok } = chooseScenarioOption(s, 0);
  assert.equal(ok, true);
  assert.equal(state.resources.electricity, 90);
  assert.equal(state.resources.radiation, 88);
  assert.equal(state.pendingScenarioId, null);
  assert.equal(state.decisions.length, 1);
  assert.equal(state.lastOutcome.safety, 2);
  assert.ok(state.lastOutcome.lesson.length > 10);
  assert.equal(clearOutcome(state).lastOutcome, null);
});

test('solar storm choice B: shelter uses the rest of the day’s actions', () => {
  const s = mk({ day: 17 });
  s.research = 3;
  s.pendingScenarioId = 'solar-storm';
  const { state } = chooseScenarioOption(s, 1);
  assert.equal(state.ap, 0);
  assert.equal(state.research, 2);
});

test('solar storm choice C is riskier when protection is low', () => {
  const strong = mk({ day: 17 });
  strong.pendingScenarioId = 'solar-storm';
  const weak = structuredClone(strong);
  weak.resources.radiation = 30;
  const a = chooseScenarioOption(strong, 2).state;
  const b = chooseScenarioOption(weak, 2).state;
  assert.equal(a.resources.health, 94); // -6 on normal
  assert.equal(b.resources.health, 86); // -14 on normal
  assert.ok(b.resources.radiation < weak.resources.radiation);
});

test('difficulty scales risk: Easy is gentler than Challenge', () => {
  const easy = mk({ day: 17 }, { difficulty: 'easy' });
  easy.pendingScenarioId = 'solar-storm';
  const hard = mk({ day: 17 }, { difficulty: 'challenge' });
  hard.pendingScenarioId = 'solar-storm';
  const e = chooseScenarioOption(easy, 2).state.resources.health;
  const h = chooseScenarioOption(hard, 2).state.resources.health;
  assert.ok(e > h);
});

test('choices that need a reserve are unavailable when it is used up', () => {
  const s = mk({ day: 10 });
  s.pendingScenarioId = 'power-failure';
  s.reserves.battery = 0;
  const r = chooseScenarioOption(s, 0);
  assert.equal(r.ok, false);
  assert.match(r.message, /No emergency batteries/);

  s.reserves.battery = 1;
  const used = chooseScenarioOption(s, 0).state;
  assert.equal(used.reserves.battery, 0);
  assert.equal(used.resources.electricity, 100); // 100 + 20 is capped
});

test('the crew always has at least one available choice', () => {
  const s = mk({ day: 10 });
  s.resources = { oxygen: 1, water: 1, food: 1, electricity: 0, radiation: 0, health: 50 };
  s.reserves = { battery: 0, emergencyFood: 0, spareParts: 0, oxygenTank: 0 };
  for (const sc of Object.values(SCENARIOS)) {
    const states = getChoiceStates(s, sc);
    assert.ok(states.some((x) => x.available), sc.id);
  }
});

test('Mars communication text uses the configured delay', () => {
  const view = getScenarioView('comm-delay', mk({}, { planet: 'mars' }));
  assert.match(view.explanation, /12 minutes/);
  const moon = getScenarioView('comm-delay', mk({}, { planet: 'moon' }));
  assert.match(moon.explanation, /1\.3 seconds/);
});

test('a decision must be made before the day can end', () => {
  const s = createInitialState({ now: 1 });
  s.pendingScenarioId = 'water-shortage';
  assert.equal(endDay(s), s);
});

// ---------------------------------------------------------- progression

test('ending a day updates resources, moves to the next day and resets actions', () => {
  const s = mk({});
  const next = endDay(s);
  assert.equal(next.day, 2);
  assert.equal(next.ap, DIFFICULTIES.normal.actionPoints);
  assert.equal(next.resources.oxygen, 96.7);
  assert.equal(next.history.length, 2);
  assert.ok(next.lastDaySummary.changes.oxygen < 0);
});

test('timed effects reduce use and then expire', () => {
  const s = mk({});
  s.effects = [{ id: 'powerSaver', daysLeft: 1 }];
  const withSaver = endDay(s);
  assert.equal(withSaver.resources.electricity, 98.5); // 2.5 x 0.6 = 1.5 used
  assert.equal(withSaver.effects.length, 0);
});

test('mission ends in failure when oxygen reaches zero', () => {
  const s = mk({});
  s.resources.oxygen = 2;
  const end = endDay(s);
  assert.equal(end.status, 'failed');
  assert.equal(end.failure.resource, 'oxygen');
  assert.equal(end.pendingScenarioId, null);
  assert.equal(endDay(end), end, 'a finished mission cannot continue');
});

test('mission ends when crew health falls to the failure threshold', () => {
  const s = mk({});
  s.resources.health = 17;
  s.resources.oxygen = 5; // oxygen penalty is -12
  const end = endDay(s);
  assert.equal(end.status, 'failed');
  assert.equal(end.failure.resource, 'health');
});

test('mission succeeds after day 30', () => {
  const s = mk({ day: MISSION_LENGTH });
  const end = endDay(s);
  assert.equal(end.status, 'success');
  assert.equal(end.daysCompleted, MISSION_LENGTH);
});

test('a risky choice can end the mission mid-day', () => {
  const s = mk({ day: 17 });
  s.pendingScenarioId = 'solar-storm';
  s.resources.radiation = 10;
  s.resources.health = 20;
  const { state } = chooseScenarioOption(s, 2);
  assert.equal(state.status, 'failed');
});

// ------------------------------------------------------ whole-mission runs

for (const planet of Object.keys(PLANETS)) {
  for (const difficulty of Object.keys(DIFFICULTIES)) {
    test(`careful crew completes ${planet} / ${difficulty}, and values stay in bounds`, () => {
      let s = createInitialState({ planet, difficulty, now: 1 });
      for (let i = 0; i < MISSION_LENGTH && s.status === 'playing'; i++) {
        s = playDay(s, STRATEGIES.careful);
        assert.ok(inBounds(s), `day ${s.day} out of bounds`);
      }
      assert.equal(s.status, 'success');
      assert.equal(s.daysCompleted, MISSION_LENGTH);
      assert.ok(s.decisions.length >= 10, 'many scenarios were played');
    });
  }
}

test('a crew that does nothing fails on Normal and Challenge (no free ride)', () => {
  for (const planet of Object.keys(PLANETS)) {
    for (const difficulty of ['normal', 'challenge']) {
      const s = playMission(createInitialState({ planet, difficulty, now: 1 }), STRATEGIES.passive);
      assert.equal(s.status, 'failed', `${planet}/${difficulty}`);
      assert.ok(s.failure.resource);
    }
  }
});

test('rushing for science and ignoring safety fails the mission', () => {
  const s = playMission(createInitialState({ now: 1 }), STRATEGIES.rusher);
  assert.equal(s.status, 'failed');
});

test('missions are deterministic: same decisions, same result', () => {
  const a = playMission(createInitialState({ now: 1 }), STRATEGIES.careful);
  const b = playMission(createInitialState({ now: 1 }), STRATEGIES.careful);
  assert.deepEqual(a.history, b.history);
  assert.deepEqual(a.resources, b.resources);
  assert.deepEqual(a.decisions, b.decisions);
});

test('a saved mission can be restored and continued identically', () => {
  let s = createInitialState({ now: 1, planet: 'mars' });
  for (let i = 0; i < 12; i++) s = playDay(s, STRATEGIES.careful);
  const restored = JSON.parse(JSON.stringify(s)); // what LocalStorage does
  assert.deepEqual(restored, s);
  const a = playMission(s, STRATEGIES.careful);
  const b = playMission(restored, STRATEGIES.careful);
  assert.deepEqual(a.history, b.history);
  assert.equal(a.status, b.status);
});

// ----------------------------------------------------------------- scoring

test('report for a successful mission is complete and within range', () => {
  const s = playMission(createInitialState({ now: 1 }), STRATEGIES.careful);
  const r = buildReport(s);
  assert.equal(r.success, true);
  assert.equal(r.survivalDays, 30);
  for (const k of ['resource', 'emergency', 'radiation', 'research', 'decision', 'overall']) {
    assert.ok(r.scores[k] >= 0 && r.scores[k] <= 100, k);
  }
  assert.ok(r.badges.length >= 4);
  assert.equal(r.chart.length, 31);
  assert.equal(r.failure, null);
});

test('report for a failed mission explains what went wrong', () => {
  const s = playMission(createInitialState({ now: 1 }), STRATEGIES.passive);
  const r = buildReport(s);
  assert.equal(r.success, false);
  assert.ok(r.failure.headline);
  assert.ok(r.failure.tips.length > 0);
  assert.equal(r.badges.length, 0);
});

test('risky research does not beat careful play', () => {
  const careful = buildReport(playMission(createInitialState({ now: 1 }), STRATEGIES.careful));
  const rusher = buildReport(playMission(createInitialState({ now: 1 }), STRATEGIES.rusher));
  assert.ok(careful.totalScore > rusher.totalScore);
  assert.ok(rusher.scores.research >= careful.scores.research - 1); // rusher did lots of science…
  assert.ok(rusher.scores.overall < careful.scores.overall); // …but that did not pay off
});

test('doing nothing earns no badges even if the mission is survived', () => {
  const s = playMission(createInitialState({ now: 1, difficulty: 'easy' }), STRATEGIES.passive);
  assert.equal(buildReport(s).badges.length, 0);
});
