import { useState } from 'react';
import { Moon } from 'lucide-react';
import Icon from './Icon.jsx';
import { ACTIONS, RESOURCE_META } from '../engine/missionConfig.js';
import { getActionStatus } from '../engine/gameEngine.js';

const SHORT = { oxygen: 'Oxygen', water: 'Water', food: 'Food', electricity: 'Power', radiation: 'Shield', health: 'Health' };

function Pills({ map, sign }) {
  const entries = Object.entries(map);
  if (entries.length === 0) return null;
  return (
    <>
      {entries.map(([k, v]) => (
        <span
          key={k}
          className={`rounded-full px-1.5 py-0.5 text-[11px] font-bold ${
            sign > 0 ? 'bg-emerald-400/15 text-emerald-200' : 'bg-amber-400/15 text-amber-100'
          }`}
          title={RESOURCE_META[k].label}
        >
          {sign > 0 ? '+' : '−'}
          {Math.round(v * 10) / 10} {SHORT[k]}
        </span>
      ))}
    </>
  );
}

/** Daily actions + End Day button. Every action shows what it costs. */
export default function ActionPanel({ game, onAct, onEndDay }) {
  const [message, setMessage] = useState('');
  const blocked = game.status !== 'playing' || game.paused || Boolean(game.pendingScenarioId);

  const handle = (id) => {
    const r = onAct(id);
    setMessage(r.ok ? `✅ ${r.message}` : `⚠️ ${r.message}`);
  };

  return (
    <section className="panel" aria-labelledby="activity-title">
      <div className="flex flex-wrap items-center justify-between gap-2">
        <h2 id="activity-title" className="panel-title !mb-0">
          🛠️ Mission Activity
        </h2>
        <div className="flex items-center gap-2" aria-label={`${game.ap} actions left today`}>
          <span className="text-sm font-semibold text-slate-300">Actions today</span>
          <span className="flex gap-1" aria-hidden="true">
            {Array.from({ length: Math.max(game.ap, 3) }, (_, i) => (
              <span
                key={i}
                className={`h-3.5 w-3.5 rounded-full border ${
                  i < game.ap ? 'border-cyan-300 bg-cyan-300 shadow-glow' : 'border-white/25 bg-transparent'
                }`}
              />
            ))}
          </span>
          <span className="text-sm font-bold text-white">{game.ap}</span>
        </div>
      </div>

      {game.pendingScenarioId && (
        <p className="mt-2 rounded-xl bg-amber-400/10 p-2 text-sm font-semibold text-amber-100">
          ⚠️ Make today’s decision first, then you can use your actions.
        </p>
      )}

      <ul className="mt-3 grid gap-2.5 sm:grid-cols-2">
        {Object.values(ACTIONS).map((a) => {
          const st = getActionStatus(game, a.id);
          return (
            <li key={a.id}>
              <button
                type="button"
                onClick={() => handle(a.id)}
                disabled={blocked || game.ap <= 0 || !st.ok}
                className="flex h-full w-full flex-col rounded-2xl border border-white/10 bg-space-900/70 p-3 text-left transition hover:border-cyan-300/60 hover:bg-space-800 disabled:cursor-not-allowed disabled:opacity-50"
                aria-describedby={`why-${a.id}`}
              >
                <span className="flex items-center gap-2 font-display text-sm font-bold text-white">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-white/10 text-cyan-200">
                    <Icon name={a.icon} size={18} />
                  </span>
                  {a.label}
                </span>
                <span className="mt-1 text-xs text-slate-300">{a.desc}</span>
                <span className="mt-2 flex flex-wrap gap-1">
                  <Pills map={st.costs} sign={-1} />
                  <Pills map={st.gains} sign={1} />
                  {a.research && <span className="rounded-full bg-violet-400/15 px-1.5 py-0.5 text-[11px] font-bold text-violet-200">+1 Research</span>}
                </span>
                <span id={`why-${a.id}`} className={`mt-1 text-[11px] font-semibold text-rose-300 ${st.ok ? 'sr-only' : ''}`}>
                  {st.ok ? 'Ready' : st.reason}
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      <p className="mt-3 min-h-[1.5rem] text-sm text-slate-200" aria-live="polite">
        {message}
      </p>

      <button
        type="button"
        className="btn btn-gold btn-lg mt-2 w-full sm:w-auto"
        onClick={onEndDay}
        disabled={blocked}
      >
        <Moon size={20} aria-hidden="true" /> End Day {game.day}
      </button>
      <p className="mt-1 text-xs text-slate-400">
        Ending the day uses up oxygen, water, food and power for the whole crew.
      </p>
    </section>
  );
}
