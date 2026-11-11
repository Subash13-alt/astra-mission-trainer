/**
 * Educational content for "Explore Space Science".
 * Written in simple English for ages 7–12. Real facts are kept general and
 * link to NASA for details; nothing here is a made-up research result.
 */

export const SCIENCE_CARDS = [
  {
    id: 'breathing',
    title: 'How do astronauts breathe in space?',
    emoji: '🫁',
    art: 'air',
    explanation:
      'Space has no air to breathe. So astronauts make their own! On the International Space Station, machines split water into oxygen and hydrogen using electricity. Other machines clean the carbon dioxide that we breathe out.',
    fact: 'The air inside a space station is a lot like the air at home, but every breath is carefully managed.',
    scenarioId: 'oxygen-low',
    related: 'Try it: the “Fresh Air Alert” in your mission.',
  },
  {
    id: 'water',
    title: 'How does water recycling work?',
    emoji: '💧',
    art: 'water',
    explanation:
      'Water is too heavy to carry in huge amounts. So astronauts clean and reuse it! Machines collect moisture from the air and used water, filter it, and make it safe to drink again.',
    fact: 'NASA has reported that the International Space Station can now recover and reuse most of its water.',
    scenarioId: 'water-shortage',
    related: 'Try it: the “Water Shortage” in your mission.',
  },
  {
    id: 'radiation',
    title: 'What is space radiation?',
    emoji: '☢️',
    art: 'radiation',
    explanation:
      'Radiation is invisible energy and tiny fast particles. It comes from the Sun and from far away in space. On Earth, our air and magnetic field block a lot of it. In space, and on the Moon, there is less protection.',
    fact: 'You cannot see or feel space radiation. Scientists use special instruments to measure it.',
    scenarioId: 'solar-storm',
    related: 'Try it: the “Solar Storm Warning” in your mission.',
  },
  {
    id: 'shielding',
    title: 'Why do astronauts need radiation shielding?',
    emoji: '🛡️',
    art: 'shield',
    explanation:
      'Shielding is a layer that blocks some radiation, like a roof blocks rain. Thick walls, water and even piles of soil can help. During strong storms, crews can wait in a shelter with extra protection.',
    fact: 'Some ideas for future bases use Moon or Mars soil to cover habitats, so less has to be carried from Earth.',
    scenarioId: 'shielding-materials',
    related: 'Try it: “Shielding Materials” in your mission.',
  },
  {
    id: 'food',
    title: 'How does food production work in space?',
    emoji: '🌱',
    art: 'plant',
    explanation:
      'Plants need light, water and nutrients. Astronauts have grown plants in special growing systems on the space station. Fresh plants can add variety to meals and might help on long trips.',
    fact: 'Astronauts on the International Space Station have grown lettuce, radishes and even chile peppers.',
    scenarioId: 'food-shortage',
    related: 'Try it: the “Food Shortage” in your mission.',
  },
  {
    id: 'electricity',
    title: 'Why is electricity important?',
    emoji: '⚡',
    art: 'bolt',
    explanation:
      'Electricity runs the air machines, water recyclers, lights, heaters, radio and experiments. On the Moon and Mars, big solar panels turn sunlight into power. When the Sun is hidden, batteries and careful saving help.',
    fact: 'The International Space Station gets its power from huge solar panels.',
    scenarioId: 'power-failure',
    related: 'Try it: the “Low Power Alert” in your mission.',
  },
  {
    id: 'communication',
    title: 'Why does communication with Mars take time?',
    emoji: '📡',
    art: 'signal',
    explanation:
      'Radio messages travel at the speed of light. That is super fast, but space is super big! A message from the Moon takes about 1.3 seconds. From Mars it can take about 3 to 22 minutes, depending on where the planets are.',
    fact: 'A question and answer with Mars can take up to about 44 minutes. Crews must be ready to decide on their own.',
    scenarioId: 'comm-delay',
    related: 'Try it: “Message to Earth” in your mission.',
  },
  {
    id: 'moon-vs-mars',
    title: 'How are the Moon and Mars different?',
    emoji: '🌕',
    art: 'planets',
    explanation:
      'The Moon is close, has no air and has very long days and nights. Mars is farther away, has a thin air made mostly of carbon dioxide, and has dust storms. Both are cold, dusty and need sealed habitats.',
    fact: 'Gravity on the Moon is about one-sixth of Earth’s. On Mars it is about 38% of Earth’s.',
    scenarioId: 'lunar-night',
    related: 'Try both: “The Long Lunar Night” and “Martian Dust Storm”.',
  },
];

export const COMPARE_MOON_MARS = [
  { label: 'Distance from Earth', moon: 'About 384,000 km', mars: 'About 55 million km at the closest' },
  { label: 'Air', moon: 'Almost none', mars: 'Very thin, mostly carbon dioxide' },
  { label: 'Gravity', moon: 'About 1/6 of Earth', mars: 'About 38% of Earth' },
  { label: 'Length of a day', moon: 'About 29.5 Earth days (day + night)', mars: 'About 24 hours 37 minutes' },
  { label: 'Message to Earth', moon: 'About 1.3 seconds', mars: 'About 3 to 22 minutes' },
];

export const GLOSSARY = [
  { term: 'Oxygen', meaning: 'The gas astronauts need to breathe.' },
  { term: 'Radiation', meaning: 'Invisible energy from space that can harm the human body.' },
  { term: 'Solar Storm', meaning: 'A burst of activity from the Sun that can affect space weather.' },
  { term: 'Power', meaning: 'Electricity needed to operate equipment.' },
  { term: 'Habitat', meaning: 'A protected place where astronauts live.' },
  { term: 'Shielding', meaning: 'A layer of material that blocks some radiation.' },
  { term: 'Recycling', meaning: 'Cleaning something so it can be used again, like water.' },
  { term: 'Greenhouse', meaning: 'A special room for growing plants.' },
  { term: 'Atmosphere', meaning: 'The layer of gases around a planet or moon.' },
  { term: 'Solar flare', meaning: 'A sudden flash of light and energy from the Sun.' },
  { term: 'Coronal mass ejection (CME)', meaning: 'A huge cloud of gas and magnetic energy thrown out by the Sun.' },
  { term: 'Geomagnetic storm', meaning: 'A disturbance of Earth’s magnetic bubble, often caused by the Sun.' },
  { term: 'Space weather', meaning: 'Changing conditions in space, caused mainly by the Sun.' },
  { term: 'Sol', meaning: 'One day on Mars (about 24 hours 37 minutes).' },
  { term: 'Gravity', meaning: 'The pull that keeps things on the ground.' },
  { term: 'Communication delay', meaning: 'The time a radio message needs to travel across space.' },
];

export const BRIEFING_TERMS = ['Oxygen', 'Radiation', 'Solar Storm', 'Power', 'Habitat'];

export const SURVIVAL_RULES = [
  { emoji: '🟢', text: 'Keep resources in the green zone. Fix yellow ones before they turn red.' },
  { emoji: '⚖️', text: 'Every action costs something. Think about trade-offs!' },
  { emoji: '🛡️', text: 'Crew safety comes first. Science can wait.' },
  { emoji: '🔌', text: 'Electricity powers almost everything. Keep some in reserve.' },
  { emoji: '🧰', text: 'Emergency supplies can be used only once. Save them for emergencies.' },
];
