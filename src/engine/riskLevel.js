/**
 * SIMULATED space-weather risk for gameplay. This is a game value, NOT a
 * NASA measurement and NOT a radiation dose. It only depends on the game's
 * own schedule, so it is predictable and testable.
 */
import { DIFFICULTIES, SCHEDULE } from './missionConfig.js';

const STORM_IDS = ['solar-storm', 'final-challenge'];

function stormDays(state) {
  const days = new Set();
  const add = (map) =>
    Object.entries(map || {}).forEach(([d, id]) => STORM_IDS.includes(id) && days.add(Number(d)));
  add(SCHEDULE.common);
  add(DIFFICULTIES[state.difficulty]?.extraScenarios);
  return [...days];
}

/** { level: 'low' | 'elevated' | 'high', label, note } */
export function getSimulatedRisk(state) {
  const days = stormDays(state);
  if (STORM_IDS.includes(state.pendingScenarioId) || days.includes(state.day)) {
    return { level: 'high', label: 'High', note: 'A simulated solar storm is happening today.' };
  }
  if (days.some((d) => d - state.day === 1 || d - state.day === 2)) {
    return { level: 'elevated', label: 'Elevated', note: 'Simulated space weather is getting stronger. Check your shielding.' };
  }
  return { level: 'low', label: 'Low', note: 'Simulated space weather is calm.' };
}
