import { motion } from 'framer-motion';
import { RESOURCE_META } from '../engine/missionConfig.js';

const ENCOURAGE = {
  2: ['Great decision, Commander! 🌟', 'Excellent thinking! 🚀', 'Smart and safe choice! ⭐'],
  1: ['Good effort, Commander! 👍', 'That worked out okay! 🙂'],
  0: ['Every great astronaut learns from tries like this. 💪', 'Not the best result, but now you know more! 📘'],
};

/** What happened after a decision, and why it matters. */
export default function OutcomeCard({ outcome, onContinue }) {
  const pool = ENCOURAGE[outcome.safety] || ENCOURAGE[1];
  const praise = pool[outcome.day % pool.length];
  const changes = Object.entries(outcome.changes);
  return (
    <motion.section
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      className="rounded-3xl border border-emerald-300/40 bg-gradient-to-br from-emerald-900/40 to-space-800/80 p-4 sm:p-5"
      aria-live="polite"
    >
      <p className="text-xs font-bold uppercase tracking-widest text-emerald-300">Decision result</p>
      <h2 className="font-display text-xl font-bold text-white">
        <span aria-hidden="true">{outcome.emoji} </span>
        {praise}
      </h2>
      <p className="mt-1 text-sm text-slate-300">
        You chose: <strong className="text-white">{outcome.choiceLabel}</strong>
      </p>

      <p className="mt-3 text-base text-slate-100">{outcome.consequence}</p>

      {(changes.length > 0 || outcome.research !== 0 || outcome.effects.length > 0) && (
        <ul className="mt-3 flex flex-wrap gap-2" aria-label="What changed">
          {changes.map(([k, v]) => (
            <li
              key={k}
              className={`rounded-full border px-2.5 py-1 text-xs font-bold ${
                v > 0 ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-200' : 'border-rose-400/50 bg-rose-400/10 text-rose-200'
              }`}
            >
              {RESOURCE_META[k].label} {v > 0 ? '+' : ''}
              {Math.round(v * 10) / 10}%
            </li>
          ))}
          {outcome.research !== 0 && (
            <li className="rounded-full border border-violet-400/50 bg-violet-400/10 px-2.5 py-1 text-xs font-bold text-violet-200">
              Research {outcome.research > 0 ? '+' : ''}
              {outcome.research}
            </li>
          )}
          {outcome.effects.map((e) => (
            <li key={e} className="rounded-full border border-sky-400/50 bg-sky-400/10 px-2.5 py-1 text-xs font-bold text-sky-200">
              ⏳ {e}
            </li>
          ))}
        </ul>
      )}

      <p className="mt-4 rounded-2xl bg-white/5 p-3 text-sm leading-relaxed text-slate-100">
        <span className="font-bold text-amber-300">💡 Why it matters: </span>
        {outcome.lesson}
      </p>

      <button type="button" className="btn btn-primary mt-4" onClick={onContinue}>
        Got it! Continue
      </button>
    </motion.section>
  );
}
