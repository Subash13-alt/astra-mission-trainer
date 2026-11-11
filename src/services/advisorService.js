/**
 * ASTRA AI – Your Mission Companion (rule-based).
 *
 * Works fully offline and needs no external AI service. It explains ideas in
 * simple English, mentions trade-offs and gives hints, but it never picks the
 * player's choice for them. It does not store or send questions anywhere.
 *
 * If a real LLM is ever added, do it behind a secure backend with child-safe
 * rules (see README) and keep this rule-based version as the offline fallback.
 */
import { ACTIONS, RESOURCE_META, STATUS_THRESHOLDS } from '../engine/missionConfig.js';
import { statusOf } from '../engine/resourceManager.js';
import { SCENARIOS } from '../data/scenarios.js';

export const ADVISOR_NAME = 'ASTRA AI';

export const QUICK_QUESTIONS = [
  'What should I check first?',
  'Why should I save electricity?',
  'What is radiation?',
  'Why does water matter?',
  'How do I get more food?',
  'What is a solar storm?',
];

const PRIVATE_WORDS = /\b(my name is|i live|my address|my school|phone number|email|password|how old am i|i am \d+)\b/i;

const pct = (v) => `${Math.round(v)}%`;

const RESOURCE_HELPERS = {
  oxygen: ['boostOxygen'],
  water: ['recycleWater'],
  food: ['greenhouse'],
  electricity: ['cleanPanels'],
  radiation: ['shield'],
  health: ['rest'],
};

const RULES = [
  {
    match: /(electric|power|energy|battery|solar panel)/i,
    answer: (s) =>
      `Great question, Commander! Electricity powers important systems like oxygen production, water recycling and communication. If you use too much for experiments, life support might not have enough power.${
        s && s.resources.electricity < 40
          ? ` Your electricity is at ${pct(s.resources.electricity)} right now, so be careful!`
          : ''
      }`,
  },
  {
    match: /(oxygen|air|breath)/i,
    answer: () =>
      'Oxygen is the gas we breathe. In space there is no air, so machines make oxygen using electricity. Keep oxygen above the red zone, and keep some power in reserve so the machines can keep working.',
  },
  {
    match: /(water|recycl|drink|thirst)/i,
    answer: () =>
      'Water is for drinking, growing plants and cleaning. Carrying water to space is very heavy, so astronauts recycle it. Recycling gives water back, but it costs electricity. That is a trade-off!',
  },
  {
    match: /(food|eat|hungry|greenhouse|plant|farm)/i,
    answer: () =>
      'Food gives the crew energy. A greenhouse can grow more, but plants need water and electricity too. Every resource is connected, so check what you have before you spend it.',
  },
  {
    match: /(solar storm|storm|flare|cme|space weather|sun)/i,
    answer: () =>
      'A solar storm is a burst of activity from the Sun. It can make radiation stronger for a while. Strong shielding and a protected shelter keep the crew safe. In this game the risk levels are simulated, but real scientists watch the Sun every day.',
  },
  {
    match: /(radiat|shield|protect)/i,
    answer: () =>
      'Radiation is invisible energy from space. Thick walls, water and soil can block some of it. “Radiation Protection” in the game shows how strong your shield is. It is a game score, not a real measurement.',
  },
  {
    match: /(health|crew|sick|tired|rest|exercise)/i,
    answer: () =>
      'Crew Health shows how the crew is doing in the game. It goes down when air, water, food or protection are very low. Rest and exercise help the crew recover. It is not a medical measurement.',
  },
  {
    match: /(earth|message|communicat|delay|radio|signal)/i,
    answer: () =>
      'Radio messages travel very fast, but space is huge! From the Moon a message takes about 1.3 seconds. From Mars it can take 3 to 22 minutes. That is why crews on Mars must be ready to decide for themselves.',
  },
  {
    match: /(moon).*(mars)|(mars).*(moon)|difference/i,
    answer: () =>
      'The Moon is close and has almost no air, with very long days and nights. Mars is farther, has a thin air and dust storms, and messages take much longer. Both are cold, dusty and need a safe habitat.',
  },
  {
    match: /(experiment|science|research|discover)/i,
    answer: () =>
      'Experiments teach us new things, but they use electricity and water. Do them when your air, water and food are safe. The game even pauses experiments when life support is in the red zone. Safety first!',
  },
  {
    match: /(score|badge|win|points|report)/i,
    answer: () =>
      'Your score rewards looking after the crew: keeping resources healthy, handling emergencies safely and protecting from radiation. Science points help, but taking risks to get more science does not pay off.',
  },
  {
    match: /(action|day|end day|turn)/i,
    answer: () =>
      'Each day you have a few actions. Every action costs something, like electricity or water. When you are ready, press “End Day” and the crew uses up resources for the day.',
  },
  {
    match: /^(hi|hello|hey|yo)\b|who are you|your name/i,
    answer: () =>
      'Hello, Commander! I am ASTRA AI, your mission companion. I can explain space science and help you think about your choices. What would you like to know?',
  },
  {
    match: /(thank|thanks|cool|great|awesome)/i,
    answer: () => 'You are welcome, Commander! You are doing great. Ask me anything about the mission!',
  },
];

/** Build a hint from the current game state without choosing for the player. */
export function getHint(state) {
  if (!state) {
    return 'Start a mission and I will help you think through your choices!';
  }
  if (state.status === 'success') return 'Mission accomplished! Check your report to see what you did well.';
  if (state.status === 'failed') return 'This mission is over, but every try teaches us something. Check the report and try again!';
  if (state.paused) return 'The game is paused. Take your time, Commander!';

  if (state.pendingScenarioId) {
    const sc = SCENARIOS[state.pendingScenarioId];
    return `Read all three choices and look at what each one costs. Which cost can you afford today? ${sc?.hint || ''}`.trim();
  }

  const entries = Object.entries(state.resources);
  const critical = entries.filter(([k, v]) => k !== 'health' && statusOf(v) === 'critical').sort((a, b) => a[1] - b[1]);
  const lowHealth = state.resources.health < 60;
  const helpers = (key) =>
    RESOURCE_HELPERS[key]
      .map((id) => ACTIONS[id].label)
      .join(' or ');

  if (critical.length > 0) {
    const [key, value] = critical[0];
    return `${RESOURCE_META[key].label} is in the red zone (${pct(value)}). Actions that can help: ${helpers(key)}. Check what each one costs first!`;
  }
  const warning = entries
    .filter(([k, v]) => k !== 'health' && statusOf(v) === 'warning')
    .sort((a, b) => a[1] - b[1]);
  if (warning.length > 0) {
    const [key, value] = warning[0];
    return `${RESOURCE_META[key].label} is getting low (${pct(value)}). Fixing it early is easier. You could use: ${helpers(key)}.`;
  }
  if (lowHealth) return `Crew Health is ${pct(state.resources.health)}. “${ACTIONS.rest.label}” can help the crew recover.`;
  if (state.ap <= 0) return 'You have used all your actions today. Press “End Day” when you are ready.';
  return `Everything looks healthy! You could do a science experiment or strengthen the shielding. Remember to keep electricity above ${STATUS_THRESHOLDS.warning - 10}%.`;
}

/** Answer a question from the player. Always returns a friendly string. */
export function askAdvisor(question, state) {
  const q = String(question || '').trim();
  if (!q) return 'Ask me anything about the mission, Commander!';

  if (PRIVATE_WORDS.test(q)) {
    return 'Remember, Commander: never share personal information like your real name, address, school or age here. Let’s keep talking about space!';
  }

  if (/(what should i|check first|hint|help|stuck|what now|what do i do)/i.test(q)) {
    return getHint(state);
  }

  const rule = RULES.find((r) => r.match.test(q));
  if (rule) return rule.answer(state);

  return 'Hmm, I am not sure about that one, Commander! Try asking about oxygen, water, food, electricity, radiation or solar storms. Or tap “What should I check first?”.';
}
