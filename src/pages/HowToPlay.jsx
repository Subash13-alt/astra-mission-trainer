import { Link } from 'react-router-dom';
import { SURVIVAL_RULES } from '../data/scienceFacts.js';
import { DIFFICULTIES, PHASES, RESOURCE_META } from '../engine/missionConfig.js';
import Icon from '../components/Icon.jsx';

const STEPS = [
  { e: '👤', t: 'Create your astronaut', d: 'Pick a nickname, an avatar and a difficulty. No sign-up needed.' },
  { e: '🪐', t: 'Choose the Moon or Mars', d: 'Each place has its own challenges, like lunar nights or dust storms.' },
  { e: '🛠️', t: 'Use 3 actions each day', d: 'Make air, recycle water, grow food, clean solar panels, add shielding, run experiments or rest.' },
  { e: '⚠️', t: 'Make decisions', d: 'When something happens, choose one of three options. Check the costs first!' },
  { e: '🌙', t: 'End the day', d: 'The crew uses oxygen, water, food and power. Watch the green, yellow and red zones.' },
  { e: '🏆', t: 'Survive 30 days', d: 'Finish the mission to earn your report and badges. Safe crews score best!' },
];

export default function HowToPlay() {
  return (
    <div className="page">
      <h1 className="font-display text-4xl font-bold">How to Play</h1>
      <p className="mt-2 max-w-2xl text-lg text-slate-200">You are the commander of a research outpost. Keep your crew safe for 30 days!</p>

      <ol className="mt-6 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {STEPS.map((s, i) => (
          <li key={s.t} className="panel">
            <div className="flex items-center gap-2">
              <span className="grid h-8 w-8 place-items-center rounded-full bg-cyan-400 font-display font-bold text-space-950">{i + 1}</span>
              <span className="text-3xl" aria-hidden="true">{s.e}</span>
            </div>
            <h2 className="mt-2 font-display text-lg font-bold">{s.t}</h2>
            <p className="mt-1 text-sm text-slate-300">{s.d}</p>
          </li>
        ))}
      </ol>

      <section className="mt-10" aria-labelledby="res-h">
        <h2 id="res-h" className="font-display text-2xl font-bold">The six things to watch</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(RESOURCE_META).map((r) => (
            <li key={r.label} className="panel flex items-start gap-3">
              <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl" style={{ background: `${r.color}22`, color: r.color }}>
                <Icon name={r.icon} size={22} />
              </span>
              <div>
                <h3 className="font-display font-bold">{r.label}</h3>
                <p className="text-sm text-slate-300">{r.explain}</p>
              </div>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-sm text-slate-300">
          🟢 Green = healthy (50%+) &nbsp; 🟡 Yellow = needs attention (25–49%) &nbsp; 🔴 Red = critical (under 25%)
        </p>
      </section>

      <section className="mt-10 grid gap-6 lg:grid-cols-2">
        <div className="panel">
          <h2 className="panel-title">📘 Survival rules</h2>
          <ul className="space-y-2">
            {SURVIVAL_RULES.map((r) => (
              <li key={r.text} className="flex gap-2 text-slate-100"><span aria-hidden="true">{r.emoji}</span> {r.text}</li>
            ))}
          </ul>
        </div>
        <div className="panel">
          <h2 className="panel-title">🗓️ Your 30-day journey</h2>
          <ul className="space-y-1.5 text-sm text-slate-200">
            {PHASES.map((p) => (
              <li key={p.from}><b className="text-cyan-300">Days {p.from}–{p.to}:</b> {p.title}. {p.focus}</li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mt-10" aria-labelledby="diff-h">
        <h2 id="diff-h" className="font-display text-2xl font-bold">Three difficulty levels</h2>
        <ul className="mt-3 grid gap-3 sm:grid-cols-3">
          {Object.values(DIFFICULTIES).map((d) => (
            <li key={d.id} className="panel">
              <h3 className="font-display text-lg font-bold">{d.label}</h3>
              <p className="text-xs font-bold uppercase tracking-wide text-cyan-300">{d.ages}</p>
              <p className="mt-1 text-sm text-slate-300">{d.blurb}</p>
            </li>
          ))}
        </ul>
      </section>

      <div className="mt-10 flex flex-wrap gap-3">
        <Link to="/profile" className="btn btn-primary btn-lg">🚀 Start Your Mission</Link>
        <Link to="/science" className="btn btn-ghost btn-lg">🔭 Explore Space Science</Link>
      </div>
    </div>
  );
}
