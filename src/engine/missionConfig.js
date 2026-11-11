/**
 * ASTRA – mission configuration.
 *
 * Every number in this file is a FICTIONAL GAMEPLAY VALUE chosen for balance.
 * None of them are real NASA measurements. Change them freely to re-balance
 * the game – the whole simulation reads from here.
 */

export const MISSION_LENGTH = 30;
export const SAVE_VERSION = 1;

/** How many research points count as a "full" science score. */
export const RESEARCH_TARGET = 6;
/** The crew's simulated health at (or below) this value ends the mission. */
export const FAIL_HEALTH = 15;
/** Actions may not spend a resource below this safety reserve. */
export const MIN_RESERVE = 3;
/** When electricity hits zero, air and water machines struggle. */
export const OFFLINE_MULT = 1.5;
/** Illustrative one-way radio delay for Mars (real delay is ~3–22 min). */
export const MARS_COMM_DELAY_MIN = 12;

export const STATUS_THRESHOLDS = { warning: 50, critical: 25 };

export const RESOURCE_KEYS = ['oxygen', 'water', 'food', 'electricity', 'radiation', 'health'];
export const SURVIVAL_KEYS = ['oxygen', 'water', 'food'];

export const RESOURCE_META = {
  oxygen: {
    label: 'Oxygen',
    icon: 'Wind',
    color: '#38bdf8',
    explain: 'The gas astronauts need to breathe.',
  },
  water: {
    label: 'Water',
    icon: 'Droplets',
    color: '#22d3ee',
    explain: 'For drinking, plants and cleaning. Recycling saves it!',
  },
  food: {
    label: 'Food',
    icon: 'Wheat',
    color: '#facc15',
    explain: 'Energy for the crew. A greenhouse can grow more.',
  },
  electricity: {
    label: 'Electricity',
    icon: 'Zap',
    color: '#a78bfa',
    explain: 'Powers air machines, lights, radio and experiments.',
  },
  radiation: {
    label: 'Radiation Protection',
    icon: 'Shield',
    color: '#f472b6',
    explain: 'How well the habitat blocks space radiation. A game score, not a measured dose.',
  },
  health: {
    label: 'Crew Health',
    icon: 'HeartPulse',
    color: '#4ade80',
    explain: 'How the crew is doing in the game. Not a medical measurement.',
  },
};

export const STATUS_TEXT = {
  good: 'Healthy',
  warning: 'Needs attention',
  critical: 'Critical!',
};

/** Daily use of each resource, in % per day (normal difficulty, before modifiers). */
export const DAILY_BASE = {
  oxygen: 3.3,
  water: 2.9,
  food: 2.7,
  electricity: 2.5,
  radiation: 0.8, // how fast habitat protection wears down
};

export const START_VALUES = {
  oxygen: 100,
  water: 100,
  food: 100,
  electricity: 100,
  radiation: 70,
  health: 100,
};

export const DIFFICULTIES = {
  easy: {
    id: 'easy',
    label: 'Easy',
    ages: 'Ages 7–9',
    blurb: 'More supplies, gentler emergencies and extra hints.',
    consumptionMult: 0.9,
    riskMult: 0.6,
    actionPoints: 3,
    startRadiation: 80,
    reserves: { battery: 2, emergencyFood: 2, spareParts: 3, oxygenTank: 2 },
    hints: true,
    extraScenarios: {},
  },
  normal: {
    id: 'normal',
    label: 'Normal',
    ages: 'Ages 9–12',
    blurb: 'A balanced mission with real trade-offs.',
    consumptionMult: 1,
    riskMult: 1,
    actionPoints: 3,
    startRadiation: 70,
    reserves: { battery: 1, emergencyFood: 1, spareParts: 2, oxygenTank: 1 },
    hints: false,
    extraScenarios: {},
  },
  challenge: {
    id: 'challenge',
    label: 'Challenge',
    ages: 'Older students',
    blurb: 'Fewer supplies and extra emergencies. Plan carefully!',
    consumptionMult: 1.3,
    riskMult: 1.5,
    actionPoints: 3,
    startRadiation: 55,
    reserves: { battery: 1, emergencyFood: 1, spareParts: 1, oxygenTank: 1 },
    hints: false,
    extraScenarios: { 6: 'air-filter', 20: 'solar-storm', 29: 'tiny-leak' },
  },
};

export const RESERVE_META = {
  battery: { label: 'Emergency batteries', emoji: '🔋' },
  emergencyFood: { label: 'Emergency food packs', emoji: '🥫' },
  spareParts: { label: 'Spare parts', emoji: '🔧' },
  oxygenTank: { label: 'Spare oxygen tanks', emoji: '🫧' },
};

/** Planet-specific modifiers (fictional gameplay values). */
export const PLANETS = {
  moon: {
    id: 'moon',
    name: 'The Moon',
    missionCode: 'A',
    missionName: 'Lunar Expedition',
    consumption: { oxygen: 1, water: 1, food: 1, electricity: 1 },
    radiationWear: 1.2, // no air to help block radiation
    difficultyLabel: 'Good for beginners',
    objective: 'Maintain a lunar research base for 30 days.',
    blurb:
      'The Moon has no air to breathe. Sunlight is strong but the nights are long and cold. Stay safe inside your habitat!',
    facts: [
      'The Moon has almost no air, so astronauts need a sealed habitat and spacesuits.',
      'A day-and-night cycle on the Moon lasts about 29.5 Earth days, so the night lasts about two weeks.',
      'Moon gravity is about one-sixth of Earth’s, so things feel very light.',
      'Radio messages take only about 1.3 seconds to travel between Earth and the Moon.',
    ],
    environment: [
      { emoji: '🌡️', text: 'Extreme hot and cold swings' },
      { emoji: '🚫', text: 'No breathable air' },
      { emoji: '☢️', text: 'Radiation reaches the surface' },
      { emoji: '📦', text: 'Limited supplies' },
    ],
    colors: ['#cbd5e1', '#94a3b8'],
  },
  mars: {
    id: 'mars',
    name: 'Mars',
    missionCode: 'B',
    missionName: 'Martian Expedition',
    consumption: { oxygen: 1, water: 1, food: 1, electricity: 1.15 },
    radiationWear: 0.85, // thin air helps a little
    difficultyLabel: 'A bigger challenge',
    objective: 'Maintain a Martian research station for 30 days.',
    blurb:
      'Mars is cold and dusty, with a very thin sky. Dust storms can hide the Sun, and messages from Earth take a long time!',
    facts: [
      'The air on Mars is very thin and mostly carbon dioxide, so people cannot breathe it.',
      'Mars is very cold. The average is around −60 °C.',
      'Dust storms on Mars can be huge. Some have grown to cover the whole planet.',
      'A radio message can take about 3 to 22 minutes to travel from Mars to Earth, depending on where the planets are.',
    ],
    environment: [
      { emoji: '🥶', text: 'Very cold conditions' },
      { emoji: '🌪️', text: 'Dust storms' },
      { emoji: '☢️', text: 'Radiation exposure' },
      { emoji: '📡', text: 'Slow messages to Earth' },
    ],
    colors: ['#fb923c', '#c2410c'],
  },
};

/** Game days when the environment changes (compressed for gameplay). */
export const MOON_NIGHT = { start: 12, end: 14 };
export const MARS_STORM = { start: 13, end: 16 };
export const MARS_HAZE_DAYS = [12, 17];

/** Mission phases – what the player is learning. */
export const PHASES = [
  { from: 1, to: 5, title: 'Learn the Basics', focus: 'Get to know your resources and what each action costs.' },
  { from: 6, to: 10, title: 'Water & Food Challenges', focus: 'Keep water and food flowing for the crew.' },
  { from: 11, to: 15, title: 'Power Management', focus: 'Electricity runs everything. Spend it wisely!' },
  { from: 16, to: 20, title: 'Solar Activity & Radiation', focus: 'Space weather can make radiation stronger. Protect your crew.' },
  { from: 21, to: 25, title: 'Messages & Emergencies', focus: 'Earth is far away. The crew must be ready to decide.' },
  { from: 26, to: 30, title: 'Final Survival Challenge', focus: 'Bring it all together and finish the mission!' },
];

export function getPhase(day) {
  return PHASES.find((p) => day >= p.from && day <= p.to) || PHASES[PHASES.length - 1];
}

/** Scenario schedule: day -> scenario id. Planet schedules are merged on top. */
export const SCHEDULE = {
  common: {
    4: 'air-filter',
    8: 'crew-tired',
    10: 'science-opportunity',
    15: 'equipment-fault',
    17: 'solar-storm',
    19: 'shielding-materials',
    21: 'comm-delay',
    22: 'science-opportunity',
    23: 'tiny-leak',
    24: 'solar-storm',
    27: 'final-challenge',
  },
  moon: { 12: 'lunar-night' },
  mars: { 13: 'mars-dust-storm' },
};

/** Scenarios that appear when a resource runs low. */
export const REACTIVE = [
  { id: 'oxygen-low', key: 'oxygen', below: 40, minDay: 3, cooldown: 4, max: 3 },
  { id: 'water-shortage', key: 'water', below: 45, minDay: 5, cooldown: 5, max: 3 },
  { id: 'food-shortage', key: 'food', below: 45, minDay: 5, cooldown: 5, max: 3 },
  { id: 'power-failure', key: 'electricity', below: 40, minDay: 6, cooldown: 5, max: 3 },
];

/** Timed effects that scenario choices can start. */
export const EFFECT_LIBRARY = {
  powerSaver: { label: 'Power-saver mode', emoji: '🔋', days: 3, consumptionMult: { electricity: 0.6 }, tip: 'Using much less electricity.' },
  waterSaver: { label: 'Water-saving rules', emoji: '💧', days: 4, consumptionMult: { water: 0.7 }, tip: 'Using less water each day.' },
  foodSaver: { label: 'Smaller meals', emoji: '🍽️', days: 4, consumptionMult: { food: 0.75 }, tip: 'Using less food each day.' },
  calmCrew: { label: 'Calm & slow work', emoji: '🧘', days: 3, consumptionMult: { oxygen: 0.8 }, tip: 'Breathing less air while resting.' },
  dimLights: { label: 'Dimmed lights', emoji: '🕯️', days: 3, consumptionMult: { electricity: 0.85 }, tip: 'Saving a little electricity.' },
  farmingSlow: { label: 'Slower farming', emoji: '🌱', days: 4, actionMult: { greenhouse: 0.6 }, tip: 'The greenhouse grows less food.' },
  dustyFilter: { label: 'Dusty air filter', emoji: '🌫️', days: 4, consumptionMult: { oxygen: 1.15 }, tip: 'Air machines work harder.' },
  plantsStalled: { label: 'Plants growing slowly', emoji: '🥀', days: 4, consumptionMult: { food: 1.2 }, tip: 'Food is used up faster.' },
  smallLeak: { label: 'Tiny air leak', emoji: '💨', days: 5, consumptionMult: { oxygen: 1.25 }, tip: 'Air slowly escapes.' },
  experimentsPaused: { label: 'Experiments paused', emoji: '⏸️', days: 4, blocks: ['experiment'], tip: 'No experiments for now.' },
};

/** Things the crew can do each day. Every action costs something. */
export const ACTIONS = {
  boostOxygen: {
    id: 'boostOxygen',
    label: 'Run Oxygen Generator',
    icon: 'Wind',
    desc: 'Make fresh air for the crew.',
    costs: { electricity: 5 },
    gains: { oxygen: 10 },
  },
  recycleWater: {
    id: 'recycleWater',
    label: 'Recycle Water',
    icon: 'Droplets',
    desc: 'Clean used water so it can be drunk again.',
    costs: { electricity: 4 },
    gains: { water: 10 },
  },
  greenhouse: {
    id: 'greenhouse',
    label: 'Tend the Greenhouse',
    icon: 'Sprout',
    desc: 'Plants grow more food, but need water and light.',
    costs: { water: 3, electricity: 3 },
    gains: { food: 9 },
  },
  cleanPanels: {
    id: 'cleanPanels',
    label: 'Clean Solar Panels',
    icon: 'Sun',
    desc: 'Clean panels make more electricity. It takes a spacewalk!',
    costs: { oxygen: 1, food: 1 },
    gains: { electricity: 10 },
    solar: true,
  },
  shield: {
    id: 'shield',
    label: 'Strengthen Shielding',
    icon: 'Shield',
    desc: 'Add protection against space radiation.',
    costs: { electricity: 4 },
    gains: { radiation: 8 },
  },
  experiment: {
    id: 'experiment',
    label: 'Science Experiment',
    icon: 'FlaskConical',
    desc: 'Learn something new! Needs power and water.',
    costs: { electricity: 5, water: 2 },
    gains: {},
    research: 1,
  },
  rest: {
    id: 'rest',
    label: 'Crew Rest & Exercise',
    icon: 'HeartPulse',
    desc: 'Rest and exercise keep astronauts strong.',
    costs: { food: 2, water: 1 },
    gains: { health: 6 },
  },
};

export const AVATARS = [
  { id: 'aurora', name: 'Aurora', suit: '#38bdf8', accent: '#a78bfa' },
  { id: 'nova', name: 'Nova', suit: '#f472b6', accent: '#facc15' },
  { id: 'orion', name: 'Orion', suit: '#4ade80', accent: '#22d3ee' },
  { id: 'comet', name: 'Comet', suit: '#fb923c', accent: '#f472b6' },
  { id: 'lyra', name: 'Lyra', suit: '#a78bfa', accent: '#38bdf8' },
  { id: 'sol', name: 'Sol', suit: '#facc15', accent: '#fb923c' },
];
