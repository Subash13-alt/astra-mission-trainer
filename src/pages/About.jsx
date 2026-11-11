import { Link } from 'react-router-dom';
import { ExternalLink } from 'lucide-react';
import { CREDITS } from '../data/sampleNasaData.js';
import { GLOSSARY } from '../data/scienceFacts.js';
import { HistoryTable } from './MissionReport.jsx';
import { useApp } from '../hooks/useApp.jsx';

export default function About() {
  const { settings, updateSettings, history, wipeHistory, game, abandonMission } = useApp();

  return (
    <div className="page max-w-4xl">
      <h1 className="font-display text-4xl font-bold">About ASTRA</h1>
      <p className="mt-2 text-lg text-slate-200">
        ASTRA – Junior Astronaut Mission Trainer is a free learning game for ages 7–12. Players run a research outpost on
        the Moon or Mars for 30 days, and learn that surviving in space takes planning, teamwork and careful use of resources.
      </p>
      <p className="mt-2 font-display font-semibold italic text-violet-200">“Every Decision Matters. Every Resource Counts.”</p>

      <section className="panel mt-6" aria-labelledby="real-h">
        <h2 id="real-h" className="panel-title">What is real and what is simulated?</h2>
        <ul className="space-y-2 text-sm text-slate-100">
          <li><span className="chip tag-live mr-2">Real</span>Space weather events (NASA DONKI), Mars rover photos, and links to NASA research data. Shown with source and date.</li>
          <li><span className="chip tag-sim mr-2">Simulated</span>All resource percentages, daily use rates, crew health, shield strength and “risk levels” are made up for gameplay balance. They are <b>not</b> NASA measurements and not medical advice.</li>
          <li><span className="chip tag-cache mr-2">Approximation</span>Simple facts such as radio delay and gravity are rounded for learning. Real values change.</li>
        </ul>
        <p className="mt-3 text-sm text-slate-300">
          Observations of the Sun cannot be turned into the radiation dose inside a habitat without a scientific model, so ASTRA does not do that.
          Research datasets are not live health monitoring of astronauts.
        </p>
      </section>

      <section className="panel mt-5" aria-labelledby="priv-h">
        <h2 id="priv-h" className="panel-title">🔒 Privacy</h2>
        <p className="text-sm text-slate-100">
          No sign-up, no emails and no personal information. Your nickname, progress and settings stay in your own browser
          (LocalStorage). ASTRA AI works on your device and does not send questions anywhere.
        </p>
      </section>

      <section className="panel mt-5" aria-labelledby="set-h">
        <h2 id="set-h" className="panel-title">⚙️ Settings and teacher tools</h2>
        <div className="space-y-3">
          <Toggle label="Sound effects" desc="Beeps and chimes during play." checked={settings.sound} onChange={(v) => updateSettings({ sound: v })} />
          <Toggle label="Reduce motion" desc="Turn off animations. (Your device’s reduce-motion setting is respected too.)" checked={settings.reducedMotion} onChange={(v) => updateSettings({ reducedMotion: v })} />
          <Toggle label="Teacher / demo mode" desc="Shows the safest choice on each decision and lets a practice crew play days for you. Great for demonstrations." checked={settings.teacherMode} onChange={(v) => updateSettings({ teacherMode: v })} />
        </div>
        <div className="mt-4 flex flex-wrap gap-2">
          {game && (
            <button
              type="button"
              className="btn btn-ghost"
              onClick={() => window.confirm('Delete your saved mission?') && abandonMission()}
            >
              Delete saved mission
            </button>
          )}
          {history.length > 0 && (
            <button type="button" className="btn btn-ghost" onClick={() => window.confirm('Clear your mission history?') && wipeHistory()}>
              Clear mission history
            </button>
          )}
        </div>
      </section>

      {history.length > 0 && (
        <section className="panel mt-5" aria-labelledby="h-h">
          <h2 id="h-h" className="panel-title">📚 Mission history</h2>
          <HistoryTable history={history} />
        </section>
      )}

      <section className="panel mt-5" aria-labelledby="cred-h">
        <h2 id="cred-h" className="panel-title">🛰️ NASA data credits</h2>
        <ul className="space-y-2 text-sm">
          {CREDITS.map((c) => (
            <li key={c.name}>
              <a href={c.url} target="_blank" rel="noreferrer noopener" className="inline-flex items-center gap-1 font-semibold text-cyan-300 underline">
                {c.name} <ExternalLink size={12} aria-hidden="true" />
              </a>
              <span className="text-slate-300"> — {c.use}</span>
            </li>
          ))}
        </ul>
        <p className="mt-3 text-xs text-slate-400">ASTRA is an independent educational project. It is not made, endorsed or run by NASA.</p>
      </section>

      <section className="panel mt-5" aria-labelledby="gl-h">
        <h2 id="gl-h" className="panel-title">📖 Science glossary</h2>
        <dl className="grid gap-2 sm:grid-cols-2">
          {GLOSSARY.map((g) => (
            <div key={g.term} className="rounded-xl bg-space-900/60 p-3">
              <dt className="font-display font-bold text-cyan-300">{g.term}</dt>
              <dd className="text-sm text-slate-100">{g.meaning}</dd>
            </div>
          ))}
        </dl>
      </section>

      <div className="mt-8"><Link to="/profile" className="btn btn-primary btn-lg">🚀 Start Your Mission</Link></div>
    </div>
  );
}

function Toggle({ label, desc, checked, onChange }) {
  return (
    <label className="flex cursor-pointer items-start gap-3 rounded-2xl bg-space-900/60 p-3">
      <input type="checkbox" className="mt-1 h-5 w-5 accent-cyan-400" checked={checked} onChange={(e) => onChange(e.target.checked)} />
      <span>
        <span className="block font-display font-bold">{label}</span>
        <span className="text-sm text-slate-300">{desc}</span>
      </span>
    </label>
  );
}
