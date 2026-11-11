import { motion } from 'framer-motion';
import { Lightbulb, Sparkles } from 'lucide-react';
import { RESERVE_META, RESOURCE_META } from '../engine/missionConfig.js';

const EMOJI = { oxygen: '🫁', water: '💧', food: '🌾', electricity: '⚡', radiation: '🛡️', health: '❤️' };

/** Short chips showing what a choice costs / gives before the player picks it. */
function CostChips({ choice }) {
  const chips = [];
  for (const [k, v] of Object.entries(choice.deltas || {})) {
    chips.push({ key: k, text: `${EMOJI[k]} ${v > 0 ? '+' : ''}${v}% ${RESOURCE_META[k].label}`, good: v > 0 });
  }
  for (const [k, n] of Object.entries(choice.reserveCost || {})) {
    chips.push({ key: `r-${k}`, text: `${RESERVE_META[k].emoji} −${n} ${RESERVE_META[k].label}`, good: false });
  }
  if (choice.apLoss) {
    chips.push({
      key: 'ap',
      text: choice.apLoss === 'all' ? '⏱️ Uses all actions today' : `⏱️ Uses ${choice.apLoss} action${choice.apLoss > 1 ? 's' : ''}`,
      good: false,
    });
  }
  if (choice.research) {
    chips.push({ key: 'sci', text: `🔬 ${choice.research > 0 ? '+' : ''}${choice.research} research`, good: choice.research > 0 });
  }
  if (choice.risk?.length) chips.push({ key: 'risk', text: '⚠️ Simulated risk', good: false });
  if (chips.length === 0) return null;
  return (
    <ul className="mt-2 flex flex-wrap gap-1.5" aria-label="Costs and effects">
      {chips.map((c) => (
        <li
          key={c.key}
          className={`rounded-full border px-2 py-0.5 text-xs font-semibold ${
            c.good ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-200' : 'border-amber-400/40 bg-amber-400/10 text-amber-100'
          }`}
        >
          {c.text}
        </li>
      ))}
    </ul>
  );
}

/** A decision: situation, explanation and three choices. */
export default function ScenarioCard({ scenario, onChoose, showHint, teacherMode, disabled }) {
  const safest = Math.max(...scenario.choices.map((c) => (c.available ? c.safety : -1)));
  return (
    <motion.section
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-3xl border border-amber-300/40 bg-gradient-to-br from-space-700/80 to-space-800/80 p-4 shadow-lg sm:p-5"
      aria-labelledby="scenario-title"
    >
      <div className="flex items-start gap-3">
        <span className="text-4xl" aria-hidden="true">{scenario.emoji}</span>
        <div>
          <p className="text-xs font-bold uppercase tracking-widest text-amber-300">
            {scenario.kind === 'emergency' ? 'Emergency alert' : 'Mission decision'}
          </p>
          <h2 id="scenario-title" className="font-display text-xl font-bold text-white sm:text-2xl">
            {scenario.title}
          </h2>
          <p className="mt-1 text-lg font-semibold text-slate-50">{scenario.situation}</p>
        </div>
      </div>

      <p className="mt-3 rounded-2xl bg-white/5 p-3 text-sm leading-relaxed text-slate-200">
        <span className="font-bold text-cyan-300">Did you know? </span>
        {scenario.explanation}
      </p>

      {scenario.realData === 'donki' && (
        <p className="mt-2 text-xs text-fuchsia-200">
          <span className="chip tag-sim mr-1">Simulated</span>
          Real solar events inspired this scenario. The danger level here is a game value, not a measured radiation dose.
        </p>
      )}

      {showHint && (
        <p className="mt-2 flex items-start gap-2 rounded-2xl bg-cyan-400/10 p-3 text-sm text-cyan-100">
          <Lightbulb size={18} className="mt-0.5 shrink-0" aria-hidden="true" /> {scenario.hint}
        </p>
      )}

      <p className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-300">What will you do, Commander?</p>
      <div className="mt-2 grid gap-3 lg:grid-cols-3">
        {scenario.choices.map((c, i) => (
          <button
            key={c.id}
            type="button"
            disabled={disabled || !c.available}
            onClick={() => onChoose(i)}
            className="group relative flex flex-col rounded-2xl border border-white/15 bg-space-900/80 p-3 text-left transition hover:border-cyan-300/70 hover:bg-space-800 disabled:cursor-not-allowed disabled:opacity-55"
          >
            {teacherMode && c.available && c.safety === safest && (
              <span className="absolute -top-2 right-2 inline-flex items-center gap-1 rounded-full bg-emerald-400 px-2 py-0.5 text-[11px] font-bold text-space-950">
                <Sparkles size={12} aria-hidden="true" /> Safest
              </span>
            )}
            <span className="flex items-center gap-2 font-display text-base font-bold text-white">
              <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-lg" aria-hidden="true">{c.icon}</span>
              <span>
                <span className="mr-1 text-cyan-300">{c.id}.</span>
                {c.label}
              </span>
            </span>
            <span className="mt-1.5 text-sm text-slate-300">{c.costText}</span>
            <CostChips choice={c} />
            {!c.available && <span className="mt-2 text-xs font-bold text-rose-300">🚫 {c.reason}</span>}
          </button>
        ))}
      </div>
    </motion.section>
  );
}
