import AstronautAvatar from './AstronautAvatar.jsx';
import ProgressBar, { STATUS_COLORS } from './ProgressBar.jsx';
import { SpaceWeatherPanel, MarsPhotosPanel } from './NasaPanels.jsx';
import {
  EFFECT_LIBRARY,
  MARS_COMM_DELAY_MIN,
  MISSION_LENGTH,
  PHASES,
  RESOURCE_META,
  STATUS_TEXT,
} from '../engine/missionConfig.js';
import { getEnvironment, statusOf } from '../engine/resourceManager.js';
import { getSimulatedRisk } from '../engine/riskLevel.js';
import { SCENARIOS } from '../data/scenarios.js';

/** The crew: four astronauts whose mood follows the crew health score. */
export function CrewPanel({ game }) {
  const h = game.resources.health;
  const mood = h >= 70 ? 'happy' : h >= 40 ? 'ok' : 'tired';
  const moodText = { happy: 'Feeling great', ok: 'A bit tired', tired: 'Needs rest' }[mood];
  const crew = [
    { name: game.profile.nickname, role: 'Commander', avatar: game.profile.avatar },
    { name: 'Dr. Mira', role: 'Doctor', avatar: 'nova' },
    { name: 'Eli', role: 'Engineer', avatar: 'orion' },
    { name: 'Zara', role: 'Botanist', avatar: 'lyra' },
  ];
  return (
    <section className="panel" aria-labelledby="crew-title">
      <h2 id="crew-title" className="panel-title">👩‍🚀 Astronaut Status</h2>
      <ul className="grid grid-cols-2 gap-2">
        {crew.map((c) => (
          <li key={c.role} className="flex flex-col items-center rounded-2xl bg-space-900/60 p-2 text-center">
            <AstronautAvatar avatar={c.avatar} size={52} mood={mood} float={c.role === 'Commander'} />
            <span className="mt-1 text-sm font-bold text-white">{c.name}</span>
            <span className="text-[11px] text-slate-300">{c.role}</span>
            <span className="text-[11px] font-semibold" style={{ color: STATUS_COLORS[statusOf(h)] }}>{moodText}</span>
          </li>
        ))}
      </ul>
      <div className="mt-3">
        <div className="mb-1 flex justify-between text-xs text-slate-300">
          <span>Crew health (game score)</span>
          <span>{Math.round(h)}%</span>
        </div>
        <ProgressBar value={h} label="Crew health" />
        <p className="mt-1 text-[11px] text-slate-400">This is a simple game score, not a medical measurement.</p>
      </div>
    </section>
  );
}

/** Things that need attention right now. */
export function AlertsPanel({ game }) {
  const alerts = [];
  const risk = getSimulatedRisk(game);
  for (const key of ['oxygen', 'water', 'food', 'electricity', 'radiation', 'health']) {
    const v = game.resources[key];
    const s = statusOf(v);
    if (s !== 'good') {
      alerts.push({
        id: key,
        level: s,
        text: `${RESOURCE_META[key].label} is ${Math.round(v)}%: ${STATUS_TEXT[s].toLowerCase()}`,
      });
    }
  }
  if (risk.level !== 'low') {
    alerts.push({ id: 'risk', level: risk.level === 'high' ? 'critical' : 'warning', text: `Simulated space weather: ${risk.label}` });
  }
  if (game.pendingScenarioId) {
    const sc = SCENARIOS[game.pendingScenarioId];
    alerts.push({ id: 'pending', level: 'warning', text: `Decision needed: ${sc.title}` });
  }
  const sorted = alerts.sort((a, b) => (a.level === 'critical' ? -1 : 1) - (b.level === 'critical' ? -1 : 1));

  return (
    <section className="panel" aria-labelledby="alerts-title">
      <h2 id="alerts-title" className="panel-title">🚨 Emergency Alerts</h2>
      {sorted.length === 0 ? (
        <p className="rounded-xl bg-emerald-400/10 p-3 text-sm font-semibold text-emerald-200" role="status">
          ✅ All systems healthy. Nice work, Commander!
        </p>
      ) : (
        <ul className="space-y-2" role="status" aria-live="polite">
          {sorted.map((a) => (
            <li
              key={a.id}
              className={`rounded-xl border p-2.5 text-sm font-semibold ${
                a.level === 'critical' ? 'border-red-400/60 bg-red-400/10 text-red-100' : 'border-amber-300/50 bg-amber-300/10 text-amber-100'
              }`}
            >
              {a.level === 'critical' ? '🔴' : '🟡'} {a.text}
            </li>
          ))}
        </ul>
      )}
      {game.effects.length > 0 && (
        <div className="mt-3">
          <h3 className="text-xs font-bold uppercase tracking-wide text-slate-300">Active effects</h3>
          <ul className="mt-1 flex flex-wrap gap-1.5">
            {game.effects.map((e) => (
              <li key={e.id} className="chip" title={EFFECT_LIBRARY[e.id]?.tip}>
                {EFFECT_LIBRARY[e.id]?.emoji} {EFFECT_LIBRARY[e.id]?.label} · {e.daysLeft}d
              </li>
            ))}
          </ul>
        </div>
      )}
    </section>
  );
}

/** Today's conditions, real NASA space weather and (on Mars) rover photos. */
export function EnvironmentPanel({ game }) {
  const env = getEnvironment(game.planet, game.day);
  const risk = getSimulatedRisk(game);
  const delay = game.planet === 'mars' ? `about ${MARS_COMM_DELAY_MIN} min (illustrative)` : 'about 1.3 seconds';
  return (
    <section className="panel" aria-labelledby="env-title">
      <h2 id="env-title" className="panel-title">🌡️ Environmental Monitoring</h2>
      <p className="mb-2 rounded-xl bg-white/5 p-2.5 text-sm text-slate-100">
        <span className="mr-1 text-xl" aria-hidden="true">{env.emoji}</span>
        <strong>{env.label}.</strong> {env.note}
      </p>
      <dl className="grid grid-cols-2 gap-2 text-sm">
        <div className="rounded-xl bg-space-900/60 p-2"><dt className="text-xs text-slate-400">Outside temperature</dt><dd className="font-bold">{env.temperatureC}°C</dd></div>
        <div className="rounded-xl bg-space-900/60 p-2"><dt className="text-xs text-slate-400">Sunlight</dt><dd className="font-bold">{env.sunlight}</dd></div>
        <div className="rounded-xl bg-space-900/60 p-2"><dt className="text-xs text-slate-400">Message to Earth</dt><dd className="font-bold">{delay}</dd></div>
        <div className="rounded-xl bg-space-900/60 p-2"><dt className="text-xs text-slate-400">Sim. space weather</dt><dd className="font-bold">{risk.label}</dd></div>
      </dl>
      <p className="mt-1 text-[11px] text-slate-400">
        Environment values are simplified for the game. Real conditions change with the season and place.
      </p>
      <div className="mt-4 border-t border-white/10 pt-3">
        <SpaceWeatherPanel risk={risk} />
      </div>
      {game.planet === 'mars' && (
        <div className="mt-4 border-t border-white/10 pt-3">
          <MarsPhotosPanel />
        </div>
      )}
    </section>
  );
}

/** 30-day timeline with learning phases and the decisions made so far. */
export function TimelinePanel({ game }) {
  const byDay = {};
  for (const d of game.decisions) byDay[d.day] = d;
  return (
    <section className="panel" aria-labelledby="timeline-title">
      <h2 id="timeline-title" className="panel-title">🗓️ Mission Timeline</h2>
      <ol className="grid grid-cols-5 gap-1.5 sm:grid-cols-10">
        {Array.from({ length: MISSION_LENGTH }, (_, i) => {
          const day = i + 1;
          const done = day < game.day || (game.status === 'success' && day === MISSION_LENGTH);
          const current = day === game.day && game.status === 'playing';
          const decision = byDay[day];
          return (
            <li
              key={day}
              className={`flex h-12 flex-col items-center justify-center rounded-lg border text-xs font-bold ${
                current
                  ? 'border-cyan-300 bg-cyan-400/20 text-white shadow-glow'
                  : done
                    ? 'border-emerald-400/40 bg-emerald-400/10 text-emerald-100'
                    : 'border-white/10 bg-space-900/50 text-slate-400'
              }`}
              aria-current={current ? 'step' : undefined}
              aria-label={`Day ${day}${current ? ', today' : done ? ', done' : ''}${decision ? `, ${decision.title}` : ''}`}
              title={decision ? decision.title : `Day ${day}`}
            >
              <span>{day}</span>
              <span aria-hidden="true">{decision ? SCENARIOS[decision.scenarioId]?.emoji : done ? '✓' : ''}</span>
            </li>
          );
        })}
      </ol>
      <ul className="mt-3 space-y-1 text-xs text-slate-300">
        {PHASES.map((p) => {
          const active = game.day >= p.from && game.day <= p.to;
          return (
            <li key={p.from} className={active ? 'font-bold text-cyan-200' : ''}>
              Days {p.from}–{p.to}: {p.title}
              {active && <span className="font-normal text-slate-300"> · {p.focus}</span>}
            </li>
          );
        })}
      </ul>
    </section>
  );
}

/** Recent activity log. */
export function LogPanel({ game }) {
  const recent = [...game.log].reverse().slice(0, 8);
  return (
    <section className="panel" aria-labelledby="log-title">
      <h2 id="log-title" className="panel-title">📜 Recent Activity</h2>
      <ul className="space-y-1 text-sm text-slate-200">
        {recent.map((l, i) => (
          <li key={`${l.day}-${i}`} className="flex gap-2">
            <span className="shrink-0 font-bold text-cyan-300">Day {l.day}</span>
            <span>{l.text}</span>
          </li>
        ))}
      </ul>
    </section>
  );
}
