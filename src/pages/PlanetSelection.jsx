import { Link, useNavigate } from 'react-router-dom';
import Planet from '../components/Planet.jsx';
import { PLANETS, DIFFICULTIES } from '../engine/missionConfig.js';
import { useApp } from '../hooks/useApp.jsx';

export default function PlanetSelection() {
  const { game, profile, updateProfile, abandonMission } = useApp();
  const navigate = useNavigate();
  const unfinished = game && game.status === 'playing';

  const choose = (planet) => {
    updateProfile({ planet });
    navigate('/briefing');
  };

  return (
    <div className="page">
      <h1 className="font-display text-4xl font-bold">Choose Your Mission</h1>
      <p className="mt-1 text-slate-300">
        Playing as <b className="text-white">{profile.nickname || 'Commander'}</b> on{' '}
        <b className="text-white">{DIFFICULTIES[profile.difficulty].label}</b>.{' '}
        <Link to="/profile" className="font-semibold text-cyan-300 underline">Change</Link>
      </p>

      {unfinished && (
        <div className="panel mt-4 flex flex-wrap items-center justify-between gap-3 border-amber-300/50">
          <p className="font-semibold">
            You have an unfinished mission on {PLANETS[game.planet].name} (Day {game.day}).
          </p>
          <div className="flex gap-2">
            <Link to="/mission" className="btn btn-gold !min-h-[40px]">Resume it</Link>
            <button
              type="button"
              className="btn btn-ghost !min-h-[40px]"
              onClick={() => window.confirm('Delete your unfinished mission and start fresh?') && abandonMission()}
            >
              Discard it
            </button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        {Object.values(PLANETS).map((p) => (
          <article key={p.id} className="panel flex flex-col" aria-labelledby={`p-${p.id}`}>
            <div className="flex items-center gap-4">
              <Planet kind={p.id} size={120} />
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Mission {p.missionCode}</p>
                <h2 id={`p-${p.id}`} className="font-display text-2xl font-bold">
                  {p.id === 'moon' ? 'Lunar Expedition' : 'Martian Expedition'}
                </h2>
                <span className="chip mt-1">{p.difficultyLabel}</span>
              </div>
            </div>
            <p className="mt-4 text-slate-100">{p.blurb}</p>
            <p className="mt-2 rounded-xl bg-cyan-400/10 p-2.5 text-sm font-semibold text-cyan-100">🎯 Objective: {p.objective}</p>

            <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-300">Environment</h3>
            <ul className="mt-1 grid grid-cols-2 gap-2">
              {p.environment.map((e) => (
                <li key={e.text} className="flex items-center gap-2 rounded-xl bg-space-900/60 p-2 text-sm">
                  <span aria-hidden="true">{e.emoji}</span> {e.text}
                </li>
              ))}
            </ul>

            <h3 className="mt-4 text-sm font-bold uppercase tracking-wide text-slate-300">Fun facts</h3>
            <ul className="mt-1 list-disc space-y-1 pl-5 text-sm text-slate-200">
              {p.facts.map((f) => <li key={f}>{f}</li>)}
            </ul>

            <div className="mt-auto pt-5">
              <button type="button" className="btn btn-primary btn-lg w-full" onClick={() => choose(p.id)}>
                Start Mission: {p.name} 🚀
              </button>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
