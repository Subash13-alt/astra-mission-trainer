import { useCallback, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import AstronautAvatar from '../components/AstronautAvatar.jsx';
import Icon from '../components/Icon.jsx';
import Planet from '../components/Planet.jsx';
import { LaunchCountdown } from '../components/Overlays.jsx';
import { BRIEFING_TERMS, GLOSSARY, SURVIVAL_RULES } from '../data/scienceFacts.js';
import { DIFFICULTIES, MISSION_LENGTH, PLANETS, RESOURCE_META, START_VALUES } from '../engine/missionConfig.js';
import { useApp } from '../hooks/useApp.jsx';

const TUTORIAL = [
  { e: '📊', t: 'Read the resource cards', d: 'Six cards show how you are doing. Green is healthy. Yellow needs attention. Red is critical.' },
  { e: '🛠️', t: 'Spend your daily actions', d: 'You get three actions a day. Each one costs something, like electricity or water. Choose wisely!' },
  { e: '⚠️', t: 'Handle surprises', d: 'Emergencies appear with three choices. Look at each cost, then decide.' },
  { e: '🌙', t: 'End the day', d: 'Ending the day uses up resources. Survive all 30 days to complete the mission!' },
];

export default function MissionBriefing() {
  const { profile, game, startMission, abandonMission } = useApp();
  const navigate = useNavigate();
  const [launching, setLaunching] = useState(false);
  const [step, setStep] = useState(0);
  const planet = PLANETS[profile.planet] || PLANETS.moon;
  const diff = DIFFICULTIES[profile.difficulty] || DIFFICULTIES.normal;
  const name = profile.nickname || 'Commander';

  const crew = [
    { name, role: 'Commander', avatar: profile.avatar },
    { name: 'Dr. Mira', role: 'Doctor', avatar: 'nova' },
    { name: 'Eli', role: 'Engineer', avatar: 'orion' },
    { name: 'Zara', role: 'Botanist', avatar: 'lyra' },
  ];

  const launch = useCallback(() => {
    startMission(planet.id);
    navigate('/mission');
  }, [navigate, planet.id, startMission]);

  const begin = () => {
    if (game && game.status === 'playing' && !window.confirm('Starting a new mission will replace your unfinished one. Continue?')) return;
    if (game && game.status === 'playing') abandonMission();
    setLaunching(true);
  };

  return (
    <div className="page">
      {launching && <LaunchCountdown onDone={launch} />}
      <Link to="/planets" className="inline-flex items-center gap-1 text-sm font-semibold text-cyan-300 underline">
        <ChevronLeft size={16} aria-hidden="true" /> Back to planets
      </Link>
      <div className="mt-3 flex flex-wrap items-center gap-4">
        <Planet kind={planet.id} size={110} />
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Mission briefing</p>
          <h1 className="font-display text-4xl font-bold">{planet.missionName}</h1>
          <p className="text-slate-300">Difficulty: <b className="text-white">{diff.label}</b> ({diff.ages})</p>
        </div>
      </div>

      <div className="mt-6 grid gap-5 lg:grid-cols-2">
        <section className="panel" aria-labelledby="b1">
          <h2 id="b1" className="panel-title">🎯 1. Mission objective</h2>
          <p className="text-slate-100">{planet.objective} Keep your crew safe, and make smart choices when things go wrong.</p>
        </section>

        <section className="panel" aria-labelledby="b5">
          <h2 id="b5" className="panel-title">⏱️ 5. Mission duration</h2>
          <p className="text-slate-100">
            <b className="text-white">{MISSION_LENGTH} days.</b> Each day you use actions, handle events and end the day.
          </p>
        </section>

        <section className="panel" aria-labelledby="b2">
          <h2 id="b2" className="panel-title">👩‍🚀 2. Your crew</h2>
          <ul className="grid grid-cols-4 gap-2">
            {crew.map((c) => (
              <li key={c.role} className="flex flex-col items-center rounded-2xl bg-space-900/60 p-2 text-center">
                <AstronautAvatar avatar={c.avatar} size={52} />
                <span className="mt-1 text-xs font-bold">{c.name}</span>
                <span className="text-[11px] text-slate-300">{c.role}</span>
              </li>
            ))}
          </ul>
        </section>

        <section className="panel" aria-labelledby="b4">
          <h2 id="b4" className="panel-title">🌡️ 4. Environmental challenges</h2>
          <ul className="grid grid-cols-2 gap-2">
            {planet.environment.map((e) => (
              <li key={e.text} className="flex items-center gap-2 rounded-xl bg-space-900/60 p-2 text-sm">
                <span aria-hidden="true">{e.emoji}</span> {e.text}
              </li>
            ))}
          </ul>
        </section>

        <section className="panel lg:col-span-2" aria-labelledby="b3">
          <h2 id="b3" className="panel-title">📦 3. Available resources</h2>
          <ul className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
            {Object.entries(RESOURCE_META).map(([k, r]) => (
              <li key={k} className="flex items-start gap-2 rounded-xl bg-space-900/60 p-2.5">
                <span className="mt-0.5 grid h-8 w-8 shrink-0 place-items-center rounded-lg" style={{ background: `${r.color}22`, color: r.color }}>
                  <Icon name={r.icon} size={18} />
                </span>
                <div className="text-sm">
                  <b>{r.label}</b> <span className="text-slate-400">starts at {k === 'radiation' ? diff.startRadiation : START_VALUES[k]}%</span>
                  <p className="text-xs text-slate-300">{r.explain}</p>
                </div>
              </li>
            ))}
          </ul>
          <p className="mt-2 text-xs text-slate-400">These starting numbers are made up for the game. They are not NASA measurements.</p>
        </section>

        <section className="panel" aria-labelledby="b6">
          <h2 id="b6" className="panel-title">📘 6. Important survival rules</h2>
          <ul className="space-y-2">
            {SURVIVAL_RULES.map((r) => (
              <li key={r.text} className="flex gap-2 text-sm text-slate-100"><span aria-hidden="true">{r.emoji}</span> {r.text}</li>
            ))}
          </ul>
        </section>

        <section className="panel" aria-labelledby="terms">
          <h2 id="terms" className="panel-title">🔤 Words to know</h2>
          <dl className="space-y-2">
            {BRIEFING_TERMS.map((t) => (
              <div key={t} className="rounded-xl bg-space-900/60 p-2.5">
                <dt className="font-display font-bold text-cyan-300">{t}</dt>
                <dd className="text-sm text-slate-100">{GLOSSARY.find((g) => g.term === t)?.meaning}</dd>
              </div>
            ))}
          </dl>
        </section>

        <section className="panel lg:col-span-2" aria-labelledby="tut">
          <h2 id="tut" className="panel-title">🎓 Quick tutorial</h2>
          <div className="flex flex-col items-center gap-2 rounded-2xl bg-space-900/60 p-4 text-center sm:flex-row sm:text-left">
            <div className="text-6xl" aria-hidden="true">{TUTORIAL[step].e}</div>
            <div className="flex-1" aria-live="polite">
              <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">Step {step + 1} of {TUTORIAL.length}</p>
              <h3 className="font-display text-xl font-bold">{TUTORIAL[step].t}</h3>
              <p className="text-slate-200">{TUTORIAL[step].d}</p>
            </div>
            <div className="flex gap-2">
              <button type="button" className="btn btn-ghost !min-h-[40px]" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0} aria-label="Previous tutorial step">
                <ChevronLeft size={18} aria-hidden="true" />
              </button>
              <button type="button" className="btn btn-ghost !min-h-[40px]" onClick={() => setStep((s) => Math.min(TUTORIAL.length - 1, s + 1))} disabled={step === TUTORIAL.length - 1} aria-label="Next tutorial step">
                <ChevronRight size={18} aria-hidden="true" />
              </button>
            </div>
          </div>
        </section>
      </div>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary btn-lg" onClick={begin}>
          🚀 Launch Mission
        </button>
        <Link to="/planets" className="btn btn-ghost btn-lg">Choose a different planet</Link>
      </div>
    </div>
  );
}
