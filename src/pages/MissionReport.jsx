import { useMemo } from 'react';
import { Link, Navigate, useNavigate } from 'react-router-dom';
import { Bar, BarChart, CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import { motion } from 'framer-motion';
import { RotateCcw } from 'lucide-react';
import AstronautAvatar from '../components/AstronautAvatar.jsx';
import ProgressBar from '../components/ProgressBar.jsx';
import { BADGES, buildReport } from '../engine/scoringEngine.js';
import { MISSION_LENGTH, PLANETS, RESOURCE_META } from '../engine/missionConfig.js';
import { useApp } from '../hooks/useApp.jsx';

const LINES = [
  ['Oxygen', RESOURCE_META.oxygen.color],
  ['Water', RESOURCE_META.water.color],
  ['Food', RESOURCE_META.food.color],
  ['Electricity', RESOURCE_META.electricity.color],
  ['Radiation', RESOURCE_META.radiation.color],
  ['Health', RESOURCE_META.health.color],
];

export default function MissionReport() {
  const { game, history, startMission, abandonMission } = useApp();
  const navigate = useNavigate();
  const report = useMemo(() => (game && game.status !== 'playing' ? buildReport(game) : null), [game]);

  if (!game) return <Navigate to="/" replace />;
  if (!report) return <Navigate to="/mission" replace />;

  const planet = PLANETS[game.planet];
  const earned = new Set(report.badges.map((b) => b.id));
  const barData = Object.entries(report.scoreLabels).map(([k, label]) => ({ name: label, Score: report.scores[k] }));

  const again = () => {
    const p = game.planet;
    abandonMission();
    startMission(p);
    navigate('/mission');
  };

  return (
    <div className="page">
      <motion.section
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        className={`panel text-center ${report.success ? 'border-emerald-300/50' : 'border-sky-300/40'}`}
        aria-labelledby="report-title"
      >
        <div className="flex justify-center">
          <AstronautAvatar avatar={game.profile.avatar} size={110} float mood={report.success ? 'happy' : 'ok'} />
        </div>
        <h1 id="report-title" className="mt-2 font-display text-3xl font-bold sm:text-5xl">
          {report.success ? 'MISSION ACCOMPLISHED, COMMANDER!' : 'MISSION ENDED – LET’S LEARN AND TRY AGAIN!'}
        </h1>
        <p className="mt-2 text-lg text-slate-200">
          {report.success
            ? `${game.profile.nickname} kept the crew safe on ${planet.name} for all ${MISSION_LENGTH} days. Amazing work!`
            : `${game.profile.nickname} lasted ${report.survivalDays} day${report.survivalDays === 1 ? '' : 's'} on ${planet.name}. Every astronaut learns from practice. You will do even better next time!`}
        </p>
        <p className="mt-2 font-display text-2xl font-bold text-amber-300">{report.rating}</p>
      </motion.section>

      <section className="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4" aria-label="Mission summary">
        {[
          ['📅', 'Survival days', `${report.survivalDays} / ${MISSION_LENGTH}`],
          ['❤️', 'Crew health', `${Math.round(game.resources.health)}%`],
          ['✅', 'Safe decisions', `${report.successfulDecisions} / ${report.totalDecisions}`],
          ['🔬', 'Experiments done', report.experiments],
        ].map(([e, l, v]) => (
          <div key={l} className="panel text-center !p-3">
            <div className="text-2xl" aria-hidden="true">{e}</div>
            <div className="font-display text-2xl font-bold">{v}</div>
            <div className="text-xs text-slate-300">{l}</div>
          </div>
        ))}
        <div className="panel col-span-2 text-center !p-3 lg:col-span-4">
          <div className="text-xs font-bold uppercase tracking-widest text-cyan-300">Total mission score</div>
          <div className="font-display text-5xl font-bold text-white">{report.totalScore.toLocaleString()}</div>
          <div className="mt-1 text-sm text-slate-300">Overall performance: {report.scores.overall}/100</div>
        </div>
      </section>

      {report.failure && (
        <section className="panel mt-5 border-sky-300/40" aria-labelledby="learn-h">
          <h2 id="learn-h" className="panel-title">🔎 What happened?</h2>
          <p className="text-lg font-semibold text-white">
            {report.failure.headline} (Day {report.failure.day})
          </p>
          <div className="mt-3 grid gap-4 md:grid-cols-3">
            <div>
              <h3 className="font-display font-bold text-cyan-300">Resource to watch</h3>
              <p className="text-sm text-slate-200">{report.failure.resourceLabel} went too low for the crew.</p>
            </div>
            <div>
              <h3 className="font-display font-bold text-cyan-300">What used it up</h3>
              {report.failure.drains.length ? (
                <ul className="list-disc pl-5 text-sm text-slate-200">{report.failure.drains.map((d) => <li key={d}>{d}</li>)}</ul>
              ) : (
                <p className="text-sm text-slate-200">Daily use slowly drained it, and nothing was done to refill it.</p>
              )}
            </div>
            <div>
              <h3 className="font-display font-bold text-cyan-300">Decisions that added risk</h3>
              {report.failure.riskyDecisions.length ? (
                <ul className="list-disc pl-5 text-sm text-slate-200">{report.failure.riskyDecisions.map((d) => <li key={d}>{d}</li>)}</ul>
              ) : (
                <p className="text-sm text-slate-200">No risky choices. Try refilling earlier next time.</p>
              )}
            </div>
          </div>
          <h3 className="mt-4 font-display font-bold text-amber-300">💡 How to do better</h3>
          <ul className="list-disc pl-5 text-sm text-slate-100">{report.failure.tips.map((t) => <li key={t}>{t}</li>)}</ul>
        </section>
      )}

      <section className="mt-5 grid gap-5 lg:grid-cols-2">
        <div className="panel" aria-labelledby="scores-h">
          <h2 id="scores-h" className="panel-title">📈 Your scores</h2>
          <ul className="space-y-3">
            {Object.entries(report.scoreLabels).map(([k, label]) => (
              <li key={k}>
                <div className="mb-1 flex justify-between text-sm"><span>{label}</span><b>{report.scores[k]}</b></div>
                <ProgressBar value={report.scores[k]} label={label} color="#22d3ee" />
              </li>
            ))}
          </ul>
          <div className="mt-4 h-52" role="img" aria-label="Bar chart of the five score areas">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                <XAxis dataKey="name" tick={{ fill: '#cbd5e1', fontSize: 10 }} interval={0} tickFormatter={(v) => v.split(' ')[0]} />
                <YAxis domain={[0, 100]} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0a1030', border: '1px solid #334155', borderRadius: 12 }} />
                <Bar dataKey="Score" fill="#a78bfa" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="panel" aria-labelledby="chart-h">
          <h2 id="chart-h" className="panel-title">🗓️ Resources over time</h2>
          <div className="h-72" role="img" aria-label="Line chart of all six resources during the mission">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={report.chart} margin={{ top: 5, right: 8, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.12)" />
                <XAxis dataKey="day" tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <YAxis domain={[0, 100]} tick={{ fill: '#cbd5e1', fontSize: 11 }} />
                <Tooltip contentStyle={{ background: '#0a1030', border: '1px solid #334155', borderRadius: 12 }} />
                <Legend wrapperStyle={{ fontSize: 12 }} />
                {LINES.map(([key, color]) => (
                  <Line key={key} type="monotone" dataKey={key} stroke={color} dot={false} strokeWidth={2} isAnimationActive={false} />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>
      </section>

      <section className="panel mt-5" aria-labelledby="badges-h">
        <h2 id="badges-h" className="panel-title">🏅 Badges</h2>
        <ul className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {Object.values(BADGES).map((b) => {
            const has = earned.has(b.id);
            return (
              <li key={b.id} className={`flex items-center gap-3 rounded-2xl border p-3 ${has ? 'border-amber-300/60 bg-amber-300/10' : 'border-white/10 bg-space-900/50 opacity-70'}`}>
                <span className={`text-4xl ${has ? '' : 'grayscale'}`} aria-hidden="true">{b.emoji}</span>
                <div>
                  <h3 className="font-display font-bold">{b.name}</h3>
                  <p className="text-xs text-slate-300">{has ? '✅ Earned!' : `🔒 ${b.how}`}</p>
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="mt-5 grid gap-5 md:grid-cols-2">
        <div className="panel">
          <h2 className="panel-title">💪 Your strengths</h2>
          {report.strengths.length ? (
            <ul className="list-disc space-y-1 pl-5 text-slate-100">{report.strengths.map((s) => <li key={s}>{s}</li>)}</ul>
          ) : (
            <p className="text-slate-200">Every mission teaches you something. Keep practising!</p>
          )}
        </div>
        <div className="panel">
          <h2 className="panel-title">🎯 To improve next time</h2>
          {report.improvements.length ? (
            <ul className="list-disc space-y-1 pl-5 text-slate-100">{report.improvements.map((s) => <li key={s}>{s}</li>)}</ul>
          ) : (
            <p className="text-slate-200">Wow, nothing to fix! You are ready for the Challenge level.</p>
          )}
          <p className="mt-3 text-xs text-slate-400">Scores reward keeping the crew safe. Taking risks to get extra science does not earn extra points.</p>
        </div>
      </section>

      <div className="mt-8 flex flex-wrap gap-3">
        <button type="button" className="btn btn-primary btn-lg" onClick={again}>
          <RotateCcw size={20} aria-hidden="true" /> Play again
        </button>
        <Link to="/planets" className="btn btn-ghost btn-lg">Try another planet</Link>
        <Link to="/science" className="btn btn-ghost btn-lg">Explore space science</Link>
        <Link to="/" className="btn btn-ghost btn-lg">Home</Link>
      </div>

      {history.length > 0 && (
        <section className="panel mt-8" aria-labelledby="hist-h">
          <h2 id="hist-h" className="panel-title">📚 Mission history</h2>
          <HistoryTable history={history} />
        </section>
      )}
    </div>
  );
}

export function HistoryTable({ history }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[480px] border-collapse text-left text-sm">
        <caption className="sr-only">Your past missions</caption>
        <thead>
          <tr className="border-b border-white/20 text-cyan-200">
            <th scope="col" className="p-2">Date</th>
            <th scope="col" className="p-2">Planet</th>
            <th scope="col" className="p-2">Level</th>
            <th scope="col" className="p-2">Result</th>
            <th scope="col" className="p-2">Days</th>
            <th scope="col" className="p-2">Score</th>
            <th scope="col" className="p-2">Badges</th>
          </tr>
        </thead>
        <tbody>
          {history.map((h) => (
            <tr key={h.id} className="border-b border-white/10">
              <td className="p-2">{h.endedAt ? new Date(h.endedAt).toLocaleDateString() : '-'}</td>
              <td className="p-2">{PLANETS[h.planet]?.name || h.planet}</td>
              <td className="p-2 capitalize">{h.difficulty}</td>
              <td className="p-2">{h.success ? '🏆 Completed' : '📘 Learned'}</td>
              <td className="p-2">{h.survivalDays}</td>
              <td className="p-2 font-bold">{h.totalScore}</td>
              <td className="p-2">{h.badges.map((id) => BADGES[id]?.emoji).join(' ') || '—'}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
