import { useState } from 'react';
import { Link, NavLink } from 'react-router-dom';
import { Menu, Play, Rocket, Volume2, VolumeX, X } from 'lucide-react';
import { useApp } from '../hooks/useApp.jsx';

const LINKS = [
  { to: '/', label: 'Home', end: true },
  { to: '/how-to-play', label: 'How to Play' },
  { to: '/science', label: 'Space Science' },
  { to: '/about', label: 'About' },
];

export default function Navbar() {
  const { game, settings, updateSettings } = useApp();
  const [open, setOpen] = useState(false);
  const resumable = game && game.status === 'playing';

  const linkClass = ({ isActive }) =>
    `rounded-xl px-3 py-2 text-sm font-semibold transition ${
      isActive ? 'bg-white/15 text-white' : 'text-slate-200 hover:bg-white/10'
    }`;

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-space-950/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between gap-3 px-4 py-2.5 sm:px-6" aria-label="Main">
        <Link to="/" className="flex items-center gap-2 font-display text-xl font-bold text-white">
          <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-cyan-400 to-violet-500 text-space-950">
            <Rocket size={20} aria-hidden="true" />
          </span>
          ASTRA
        </Link>

        <div className="hidden items-center gap-1 md:flex">
          {LINKS.map((l) => (
            <NavLink key={l.to} to={l.to} end={l.end} className={linkClass}>
              {l.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-2">
          {resumable && (
            <Link to="/mission" className="btn btn-gold !min-h-[40px] !px-3 !py-1.5 text-sm">
              <Play size={16} aria-hidden="true" />
              <span className="hidden sm:inline">Resume Mission</span>
              <span className="sm:hidden">Resume</span>
            </Link>
          )}
          <button
            type="button"
            className="btn btn-ghost !min-h-[40px] !px-3"
            onClick={() => updateSettings({ sound: !settings.sound })}
            aria-pressed={settings.sound}
            aria-label={settings.sound ? 'Mute sound effects' : 'Turn on sound effects'}
          >
            {settings.sound ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
          </button>
          <button
            type="button"
            className="btn btn-ghost !min-h-[40px] !px-3 md:hidden"
            onClick={() => setOpen((o) => !o)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={open ? 'Close menu' : 'Open menu'}
          >
            {open ? <X size={18} aria-hidden="true" /> : <Menu size={18} aria-hidden="true" />}
          </button>
        </div>
      </nav>

      {open && (
        <div id="mobile-menu" className="border-t border-white/10 px-4 pb-3 md:hidden">
          <div className="mt-2 flex flex-col gap-1">
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} end={l.end} className={linkClass} onClick={() => setOpen(false)}>
                {l.label}
              </NavLink>
            ))}
          </div>
        </div>
      )}
    </header>
  );
}
