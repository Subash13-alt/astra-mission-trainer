import { GraduationCap, Pause, Volume2, VolumeX } from 'lucide-react';
import { MISSION_LENGTH, PLANETS, getPhase } from '../engine/missionConfig.js';
import { getEnvironment, statusOf } from '../engine/resourceManager.js';
import { STATUS_COLORS } from './ProgressBar.jsx';
import { useApp } from '../hooks/useApp.jsx';

const STATUS_LABEL = { playing: 'Mission in progress', success: 'Mission accomplished', failed: 'Mission ended' };

/** "ASTRA MISSION CONTROL" top bar with day counter, countdown ring and status. */
export default function MissionHeader({ game, onPause, onTutorial }) {
  const { settings, updateSettings } = useApp();
  const planet = PLANETS[game.planet];
  const env = getEnvironment(game.planet, game.day);
  const phase = getPhase(game.day);
  const remaining = game.status === 'playing' ? MISSION_LENGTH - game.day + 1 : 0;
  const progress = Math.min(1, (game.day - 1) / MISSION_LENGTH);
  const healthStatus = statusOf(game.resources.health);
  const R = 26;
  const C = 2 * Math.PI * R;

  return (
    <header className="panel !p-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.25em] text-cyan-300">Mission {planet.missionCode}</p>
          <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">ASTRA MISSION CONTROL</h1>
          <p className="mt-0.5 text-sm text-slate-300">
            {planet.name} · Commander {game.profile.nickname}
          </p>
        </div>

        <div className="flex items-center gap-3" aria-label={`Mission countdown: ${remaining} days to go`}>
          <svg width="64" height="64" viewBox="0 0 64 64" role="img" aria-label={`Day ${game.day} of ${MISSION_LENGTH}`}>
            <circle cx="32" cy="32" r={R} stroke="rgba(255,255,255,0.15)" strokeWidth="6" fill="none" />
            <circle
              cx="32"
              cy="32"
              r={R}
              stroke="#22d3ee"
              strokeWidth="6"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={C}
              strokeDashoffset={C * (1 - progress)}
              transform="rotate(-90 32 32)"
              style={{ transition: 'stroke-dashoffset 0.8s ease' }}
            />
            <text x="32" y="37" textAnchor="middle" fontSize="15" fontWeight="700" fill="#fff">
              {Math.min(game.day, MISSION_LENGTH)}
            </text>
          </svg>
          <div>
            <p className="font-display text-lg font-bold leading-tight">
              Day {Math.min(game.day, MISSION_LENGTH)} <span className="text-slate-400">of {MISSION_LENGTH}</span>
            </p>
            <p className="text-sm text-cyan-200">T-minus {remaining} day{remaining === 1 ? '' : 's'}</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <button type="button" className="btn btn-ghost !min-h-[40px] !px-3" onClick={onTutorial} aria-label="Show tutorial">
            <GraduationCap size={18} aria-hidden="true" />
            <span className="hidden sm:inline">Tutorial</span>
          </button>
          <button
            type="button"
            className="btn btn-ghost !min-h-[40px] !px-3"
            onClick={() => updateSettings({ sound: !settings.sound })}
            aria-pressed={settings.sound}
            aria-label={settings.sound ? 'Mute sound effects' : 'Turn on sound effects'}
          >
            {settings.sound ? <Volume2 size={18} aria-hidden="true" /> : <VolumeX size={18} aria-hidden="true" />}
          </button>
          <button type="button" className="btn btn-ghost !min-h-[40px]" onClick={onPause} disabled={game.status !== 'playing'}>
            <Pause size={18} aria-hidden="true" /> Pause
          </button>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap gap-2 text-sm">
        <span className="chip" style={{ borderColor: game.status === 'failed' ? '#f87171' : '#22d3ee66' }}>
          🚦 {STATUS_LABEL[game.status]}
        </span>
        <span className="chip" style={{ color: STATUS_COLORS[healthStatus] }}>
          ❤️ Crew health {Math.round(game.resources.health)}%
        </span>
        <span className="chip">
          {env.emoji} {env.label} · {env.temperatureC}°C
        </span>
        <span className="chip">📘 {phase.title}</span>
        <span className="chip">🧪 Research {game.research}</span>
      </div>
    </header>
  );
}
