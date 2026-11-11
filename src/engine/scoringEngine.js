/**
 * Mission report and scoring.
 *
 * Scoring rewards looking after the crew. Research counts, but it is capped
 * and carries a small weight, and risky choices lower the decision scores,
 * so rushing for extra science never pays off.
 */
import {
  ACTIONS,
  MISSION_LENGTH,
  RESEARCH_TARGET,
  RESOURCE_META,
  STATUS_THRESHOLDS,
} from './missionConfig.js';

export const SAFETY_POINTS = { 2: 100, 1: 65, 0: 20 };

export const BADGES = {
  oxygenGuardian: { id: 'oxygenGuardian', name: 'Oxygen Guardian', emoji: '🫁', how: 'Never let oxygen fall into the red.' },
  waterMaster: { id: 'waterMaster', name: 'Water Master', emoji: '💧', how: 'Keep water out of the red zone all mission.' },
  powerCommander: { id: 'powerCommander', name: 'Power Commander', emoji: '⚡', how: 'Keep the electricity flowing all mission.' },
  radiationDefender: { id: 'radiationDefender', name: 'Radiation Defender', emoji: '🛡️', how: 'Keep habitat protection strong.' },
  spaceScientist: { id: 'spaceScientist', name: 'Space Scientist', emoji: '🔬', how: `Finish ${RESEARCH_TARGET} research points safely.` },
  missionChampion: { id: 'missionChampion', name: 'Mission Champion', emoji: '🏆', how: 'Complete the mission with a great overall score.' },
};

const avg = (arr) => (arr.length ? arr.reduce((a, b) => a + b, 0) / arr.length : 0);
const clamp100 = (v) => Math.max(0, Math.min(100, Math.round(v)));

const FAILURE_TIPS = {
  oxygen: [
    'Run the Oxygen Generator before oxygen drops under 40%.',
    'Keep some electricity in reserve, since the generator needs power.',
  ],
  water: [
    'Recycle water regularly. It gives water back for a small amount of electricity.',
    'Remember the greenhouse also uses water.',
  ],
  food: [
    'Tend the greenhouse early, while you still have water and power to spare.',
    'Save emergency food packs for the moments you really need them.',
  ],
  health: [
    'Check the crew’s health every day and use Rest & Exercise when it dips.',
    'Keep air, water and food out of the red zone so health can recover.',
  ],
};

const FAILURE_HEADLINES = {
  oxygen: 'The oxygen ran out.',
  water: 'The water ran out.',
  food: 'The food ran out.',
  health: 'The crew’s health got too low.',
};

function explainFailure(state) {
  const f = state.failure;
  if (!f) return null;
  const resource = f.resource;
  const label = RESOURCE_META[resource].label;

  const drains = Object.entries(state.actionCounts)
    .map(([id, count]) => ({ id, count, spent: (ACTIONS[id].costs[resource] || 0) * count }))
    .filter((d) => d.spent > 0)
    .sort((a, b) => b.spent - a.spent)
    .slice(0, 2)
    .map((d) => `${ACTIONS[d.id].label} (${d.count}×) used ${d.spent}% of ${label.toLowerCase()}.`);

  const risky = state.decisions
    .filter((d) => d.safety === 0)
    .map((d) => `Day ${d.day}: “${d.choiceLabel}” in ${d.title}.`);

  return {
    headline: FAILURE_HEADLINES[resource],
    resource,
    resourceLabel: label,
    day: f.day,
    drains,
    riskyDecisions: risky,
    tips: FAILURE_TIPS[resource],
  };
}

export function evaluateBadges(state, scores) {
  if (state.status !== 'success') return [];
  const min = state.stats.minValues;
  const crit = STATUS_THRESHOLDS.critical;
  const used = (id) => state.actionCounts[id] || 0;
  const earned = [];
  // Badges need real care, so a crew that did nothing cannot earn them.
  if (min.oxygen >= crit && used('boostOxygen') >= 2) earned.push(BADGES.oxygenGuardian);
  if (min.water >= crit && used('recycleWater') >= 2) earned.push(BADGES.waterMaster);
  if (min.electricity >= 15 && used('cleanPanels') >= 2) earned.push(BADGES.powerCommander);
  if (scores.radiation >= 70 && min.radiation >= 25) earned.push(BADGES.radiationDefender);
  if (state.research >= RESEARCH_TARGET) earned.push(BADGES.spaceScientist);
  if (scores.overall >= 75) earned.push(BADGES.missionChampion);
  return earned;
}

const SCORE_LABELS = {
  resource: 'Resource management',
  emergency: 'Emergency response',
  radiation: 'Radiation protection',
  research: 'Scientific research',
  decision: 'Decision-making',
};

const STRENGTH_TEXT = {
  resource: 'You kept air, water, food and power at healthy levels.',
  emergency: 'You handled emergencies calmly and picked safe answers.',
  radiation: 'You kept the habitat well protected from space radiation.',
  research: 'You found time for science without risking the crew.',
  decision: 'Your choices put the crew first, day after day.',
};

const IMPROVE_TEXT = {
  resource: 'Try to top up resources before they hit the yellow zone.',
  emergency: 'When an emergency appears, look for the choice that protects the crew first.',
  radiation: 'Strengthen shielding before solar storms, not after.',
  research: 'Once your resources are safe, use spare actions for experiments.',
  decision: 'Think about the cost of every choice. Ask: is it safe for the crew?',
};

/** Build the full end-of-mission report. */
export function buildReport(state) {
  const days = state.history.filter((h) => h.day > 0);
  const lifeAvg = days.map((h) => avg([h.oxygen, h.water, h.food, h.electricity]));
  const criticalDays = days.reduce(
    (n, h) =>
      n + ['oxygen', 'water', 'food', 'electricity'].filter((k) => h[k] < STATUS_THRESHOLDS.critical).length,
    0,
  );
  const redRadiationDays = days.filter((h) => h.radiation < STATUS_THRESHOLDS.critical).length;
  const safeDays = days.filter(
    (h) => ['oxygen', 'water', 'food', 'electricity'].every((k) => h[k] >= STATUS_THRESHOLDS.critical),
  ).length;

  const safetyScores = state.decisions.map((d) => SAFETY_POINTS[d.safety]);
  const emergencyScores = state.decisions.filter((d) => d.kind === 'emergency').map((d) => SAFETY_POINTS[d.safety]);

  const scores = {
    resource: clamp100(avg(lifeAvg) - criticalDays * 4),
    emergency: clamp100(emergencyScores.length ? avg(emergencyScores) : safetyScores.length ? avg(safetyScores) : 60),
    radiation: clamp100(avg(days.map((h) => h.radiation)) - redRadiationDays * 3),
    research: clamp100((state.research / RESEARCH_TARGET) * 100),
    decision: clamp100(
      0.5 * (safetyScores.length ? avg(safetyScores) : 60) + 0.5 * (days.length ? (safeDays / days.length) * 100 : 0),
    ),
  };

  let overall =
    scores.resource * 0.25 +
    scores.emergency * 0.2 +
    scores.radiation * 0.2 +
    scores.research * 0.1 +
    scores.decision * 0.25;

  const success = state.status === 'success';
  const survivalDays = state.daysCompleted;
  if (!success) overall *= 0.4 + 0.6 * (survivalDays / MISSION_LENGTH);
  scores.overall = clamp100(overall);

  const finalHealth = Math.round(state.resources.health);
  const totalScore = Math.round(
    survivalDays * 20 + scores.overall * 8 + finalHealth * 2 + (success ? 400 : 0),
  );

  let rating;
  if (!success) rating = 'Keep Training, Cadet!';
  else if (scores.overall >= 85) rating = 'Outstanding Commander!';
  else if (scores.overall >= 70) rating = 'Great Commander!';
  else rating = 'Mission Complete, Well Done!';

  const ranked = Object.keys(SCORE_LABELS).sort((a, b) => scores[b] - scores[a]);
  const strengths = ranked.slice(0, 2).filter((k) => scores[k] >= 60).map((k) => STRENGTH_TEXT[k]);
  const improvements = ranked
    .slice(-2)
    .reverse()
    .filter((k) => scores[k] < 90)
    .map((k) => IMPROVE_TEXT[k]);

  const successfulDecisions = state.decisions.filter((d) => d.safety >= 1).length;

  return {
    success,
    survivalDays,
    scores,
    scoreLabels: SCORE_LABELS,
    totalScore,
    rating,
    badges: evaluateBadges(state, scores),
    strengths,
    improvements,
    successfulDecisions,
    totalDecisions: state.decisions.length,
    experiments: state.research,
    finalResources: { ...state.resources },
    failure: explainFailure(state),
    chart: state.history.map((h) => ({
      day: h.day,
      Oxygen: Math.round(h.oxygen),
      Water: Math.round(h.water),
      Food: Math.round(h.food),
      Electricity: Math.round(h.electricity),
      Radiation: Math.round(h.radiation),
      Health: Math.round(h.health),
    })),
  };
}

/** Small record saved to mission history. */
export function summarizeForHistory(state, report) {
  return {
    id: state.id,
    endedAt: state.endedAt,
    planet: state.planet,
    difficulty: state.difficulty,
    nickname: state.profile.nickname,
    success: report.success,
    survivalDays: report.survivalDays,
    totalScore: report.totalScore,
    overall: report.scores.overall,
    badges: report.badges.map((b) => b.id),
  };
}
