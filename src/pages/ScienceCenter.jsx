import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ExternalLink, Search } from 'lucide-react';
import { ArtemisPanel, MarsPhotosPanel, OsdrPanel, SpaceWeatherPanel } from '../components/NasaPanels.jsx';
import { COMPARE_MOON_MARS, GLOSSARY, SCIENCE_CARDS } from '../data/scienceFacts.js';
import { CREDITS } from '../data/sampleNasaData.js';
import Planet from '../components/Planet.jsx';

/** Simple original illustrations for the learning cards. */
function ScienceArt({ kind }) {
  const common = { viewBox: '0 0 120 80', className: 'h-24 w-full rounded-2xl bg-space-900/70', role: 'img' };
  switch (kind) {
    case 'air':
      return (
        <svg {...common} aria-label="Illustration: a habitat with fresh air bubbles">
          <rect x="30" y="30" width="60" height="36" rx="14" fill="#38bdf8" opacity="0.35" stroke="#38bdf8" strokeWidth="2" />
          {[[44, 48], [58, 40], [72, 52], [62, 56]].map(([x, y], i) => <circle key={i} cx={x} cy={y} r={4 - i * 0.5} fill="#e0f2fe" opacity="0.9" />)}
          <path d="M10 20 q10 -8 20 0 t20 0" stroke="#7dd3fc" strokeWidth="2" fill="none" />
        </svg>
      );
    case 'water':
      return (
        <svg {...common} aria-label="Illustration: a water drop that is recycled in a circle">
          <path d="M60 14 C48 32 42 42 42 50 a18 18 0 0 0 36 0 C78 42 72 32 60 14 Z" fill="#22d3ee" />
          <path d="M22 40 a38 28 0 0 1 20 -24" stroke="#a5f3fc" strokeWidth="3" fill="none" markerEnd="url(#a)" />
          <path d="M98 40 a38 28 0 0 1 -20 24" stroke="#a5f3fc" strokeWidth="3" fill="none" />
        </svg>
      );
    case 'radiation':
      return (
        <svg {...common} aria-label="Illustration: the Sun sending invisible rays">
          <circle cx="24" cy="40" r="14" fill="#facc15" />
          {[0, 1, 2, 3].map((i) => <path key={i} d={`M44 ${24 + i * 10} H110`} stroke="#f472b6" strokeWidth="2" strokeDasharray="4 5" />)}
        </svg>
      );
    case 'shield':
      return (
        <svg {...common} aria-label="Illustration: a shield blocking rays from a house">
          <path d="M20 20 L50 30 M20 40 L50 40 M20 60 L50 50" stroke="#f472b6" strokeWidth="2" strokeDasharray="4 4" />
          <path d="M56 14 C70 18 78 18 84 14 V44 C84 58 72 66 70 68 C68 66 56 58 56 44 Z" fill="#a78bfa" />
          <rect x="94" y="40" width="20" height="22" rx="4" fill="#cbd5e1" />
        </svg>
      );
    case 'plant':
      return (
        <svg {...common} aria-label="Illustration: a young plant growing in a pot">
          <rect x="46" y="52" width="28" height="18" rx="4" fill="#9a3412" />
          <path d="M60 52 V30" stroke="#4ade80" strokeWidth="4" />
          <path d="M60 38 C46 38 44 26 50 22 C58 24 62 30 60 38 Z" fill="#4ade80" />
          <path d="M60 34 C74 34 78 22 70 18 C64 22 60 26 60 34 Z" fill="#86efac" />
        </svg>
      );
    case 'bolt':
      return (
        <svg {...common} aria-label="Illustration: a lightning bolt and a solar panel">
          <path d="M64 10 L44 44 H58 L52 70 L78 32 H62 Z" fill="#facc15" />
          <rect x="84" y="34" width="28" height="18" fill="#1d4ed8" stroke="#93c5fd" />
        </svg>
      );
    case 'signal':
      return (
        <svg {...common} aria-label="Illustration: a radio signal travelling between two planets">
          <circle cx="20" cy="40" r="10" fill="#38bdf8" />
          <circle cx="100" cy="40" r="10" fill="#fb923c" />
          <path d="M34 40 H86" stroke="#a78bfa" strokeWidth="3" strokeDasharray="3 6" />
          <circle cx="60" cy="40" r="4" fill="#a78bfa" />
        </svg>
      );
    default:
      return (
        <svg {...common} aria-label="Illustration: the Moon and Mars side by side">
          <circle cx="36" cy="40" r="22" fill="#cbd5e1" />
          <circle cx="86" cy="40" r="26" fill="#ea580c" />
        </svg>
      );
  }
}

const TABS = [
  { id: 'cards', label: '🔭 Learn' },
  { id: 'compare', label: '🌕 Moon vs Mars' },
  { id: 'nasa', label: '🛰️ NASA Data' },
  { id: 'glossary', label: '📖 Glossary' },
];

export default function ScienceCenter() {
  const [tab, setTab] = useState('cards');
  const [open, setOpen] = useState(null);
  const [query, setQuery] = useState('');

  const terms = useMemo(
    () => GLOSSARY.filter((g) => `${g.term} ${g.meaning}`.toLowerCase().includes(query.toLowerCase())).sort((a, b) => a.term.localeCompare(b.term)),
    [query],
  );

  return (
    <div className="page">
      <h1 className="font-display text-4xl font-bold">Explore Space Science</h1>
      <p className="mt-1 max-w-2xl text-slate-300">Tap a card to learn how astronauts stay alive on the Moon and Mars.</p>

      <div className="mt-5 flex flex-wrap gap-2" role="tablist" aria-label="Science sections">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            id={`tab-${t.id}`}
            aria-selected={tab === t.id}
            aria-controls={`panel-${t.id}`}
            type="button"
            onClick={() => setTab(t.id)}
            className={`btn !min-h-[44px] ${tab === t.id ? 'btn-primary' : 'btn-ghost'}`}
          >
            {t.label}
          </button>
        ))}
      </div>

      <div className="mt-5" role="tabpanel" id={`panel-${tab}`} aria-labelledby={`tab-${tab}`}>
        {tab === 'cards' && (
          <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {SCIENCE_CARDS.map((c) => {
              const isOpen = open === c.id;
              return (
                <li key={c.id} className="panel flex flex-col !p-4">
                  <ScienceArt kind={c.art} />
                  <h2 className="mt-3 font-display text-base font-bold leading-snug">
                    <span aria-hidden="true">{c.emoji} </span>
                    {c.title}
                  </h2>
                  <button
                    type="button"
                    className="btn btn-ghost mt-2 !min-h-[40px] text-sm"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? null : c.id)}
                  >
                    {isOpen ? 'Hide' : 'Tell me more'}
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                        <p className="mt-3 text-sm leading-relaxed text-slate-100">{c.explanation}</p>
                        <p className="mt-2 rounded-xl bg-cyan-400/10 p-2 text-sm text-cyan-100"><b>Fun fact:</b> {c.fact}</p>
                        <p className="mt-2 text-sm text-amber-100">🎮 {c.related}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        )}

        {tab === 'compare' && (
          <div className="panel">
            <div className="flex flex-wrap items-center justify-center gap-6">
              <Planet kind="moon" size={120} />
              <span className="font-display text-2xl font-bold text-slate-300">vs</span>
              <Planet kind="mars" size={140} />
            </div>
            <div className="mt-5 overflow-x-auto">
              <table className="w-full min-w-[480px] border-collapse text-left text-sm">
                <caption className="sr-only">Comparing the Moon and Mars</caption>
                <thead>
                  <tr className="border-b border-white/20 text-cyan-200">
                    <th scope="col" className="p-2">What</th>
                    <th scope="col" className="p-2">🌕 The Moon</th>
                    <th scope="col" className="p-2">🔴 Mars</th>
                  </tr>
                </thead>
                <tbody>
                  {COMPARE_MOON_MARS.map((r) => (
                    <tr key={r.label} className="border-b border-white/10">
                      <th scope="row" className="p-2 font-bold">{r.label}</th>
                      <td className="p-2 text-slate-200">{r.moon}</td>
                      <td className="p-2 text-slate-200">{r.mars}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <p className="mt-3 text-xs text-slate-400">Rounded, simplified facts for learning. Ask a teacher or check NASA for more detail.</p>
          </div>
        )}

        {tab === 'nasa' && (
          <div className="space-y-5">
            <div className="panel">
              <h2 className="panel-title">What is real and what is pretend?</h2>
              <ul className="grid gap-3 text-sm sm:grid-cols-3">
                <li className="rounded-2xl bg-emerald-400/10 p-3"><span className="chip tag-live mb-1">Real NASA observation</span><br />Space weather events, Mars rover photos and research datasets shown with their source and date.</li>
                <li className="rounded-2xl bg-fuchsia-400/10 p-3"><span className="chip tag-sim mb-1">Simulated game value</span><br />Resource percentages, daily use, crew health and the “risk level” are made up for gameplay.</li>
                <li className="rounded-2xl bg-sky-400/10 p-3"><span className="chip tag-cache mb-1">Educational approximation</span><br />Rounded facts like the radio delay to Mars. Real delay changes with the planets’ positions.</li>
              </ul>
            </div>
            <div className="grid gap-5 lg:grid-cols-2">
              <div className="panel"><SpaceWeatherPanel limit={5} showSimulated={false} /></div>
              <div className="panel"><MarsPhotosPanel /></div>
              <div className="panel"><OsdrPanel /></div>
              <div className="panel"><ArtemisPanel /></div>
            </div>
            <div className="panel">
              <h2 className="panel-title">NASA data credits</h2>
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
            </div>
          </div>
        )}

        {tab === 'glossary' && (
          <div className="panel">
            <label htmlFor="gloss-q" className="sr-only">Search the glossary</label>
            <div className="relative">
              <Search size={18} className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
              <input id="gloss-q" className="input !pl-10" placeholder="Search words…" value={query} onChange={(e) => setQuery(e.target.value)} />
            </div>
            <dl className="mt-4 grid gap-2 sm:grid-cols-2">
              {terms.map((g) => (
                <div key={g.term} className="rounded-xl bg-space-900/60 p-3">
                  <dt className="font-display font-bold text-cyan-300">{g.term}</dt>
                  <dd className="text-sm text-slate-100">{g.meaning}</dd>
                </div>
              ))}
            </dl>
            {terms.length === 0 && <p className="mt-3 text-slate-300">No words found. Try another search!</p>}
          </div>
        )}
      </div>

      <div className="mt-8">
        <Link to="/profile" className="btn btn-primary btn-lg">🚀 Try it in a mission</Link>
      </div>
    </div>
  );
}
