import { useState } from 'react';
import { STATUS_COLORS } from './ProgressBar.jsx';
import { getActionStatus } from '../engine/gameEngine.js';
import { PLANETS, ACTIONS } from '../engine/missionConfig.js';
import { statusOf } from '../engine/resourceManager.js';

const ZONES = [
  { id: 'habitat', name: 'Habitat', emoji: '🏠', x: 170, y: 105, w: 70, h: 46, res: 'oxygen', action: 'boostOxygen', info: 'Where the crew lives and sleeps. It is sealed so air stays inside.' },
  { id: 'greenhouse', name: 'Greenhouse', emoji: '🌱', x: 55, y: 120, w: 62, h: 40, res: 'food', action: 'greenhouse', info: 'Plants grow here. They need water, light and electricity.' },
  { id: 'solar', name: 'Solar Panels', emoji: '☀️', x: 270, y: 35, w: 82, h: 34, res: 'electricity', action: 'cleanPanels', info: 'Panels turn sunlight into electricity. Dust makes them work less well.' },
  { id: 'water', name: 'Water Recycler', emoji: '💧', x: 60, y: 200, w: 70, h: 36, res: 'water', action: 'recycleWater', info: 'Cleans used water so it can be used again.' },
  { id: 'shelter', name: 'Storm Shelter', emoji: '🛡️', x: 290, y: 190, w: 70, h: 40, res: 'radiation', action: 'shield', info: 'Extra-thick walls give the crew a safe place during solar storms.' },
  { id: 'lab', name: 'Science Lab', emoji: '🔬', x: 290, y: 115, w: 62, h: 38, res: 'electricity', action: 'experiment', info: 'Experiments teach us new things, but need power and water.' },
  { id: 'comms', name: 'Radio Tower', emoji: '📡', x: 70, y: 35, w: 50, h: 40, res: null, action: null, info: 'Sends messages to Earth. Messages take time to travel across space.' },
];

/** Interactive mission map. Click a building to learn about it and use its action. */
export default function MissionMap({ game, onAct }) {
  const [selected, setSelected] = useState('habitat');
  const planet = PLANETS[game.planet];
  const zone = ZONES.find((z) => z.id === selected);
  const st = zone.action ? getActionStatus(game, zone.action) : null;

  return (
    <section className="panel" aria-labelledby="map-title">
      <h2 id="map-title" className="panel-title">🗺️ Mission Map</h2>
      <svg viewBox="0 0 420 270" className="w-full rounded-2xl" role="group" aria-label={`Map of the ${planet.name} base. Choose a building.`}>
        <defs>
          <linearGradient id="terrain" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0" stopColor={game.planet === 'mars' ? '#b45309' : '#64748b'} />
            <stop offset="1" stopColor={game.planet === 'mars' ? '#7c2d12' : '#334155'} />
          </linearGradient>
        </defs>
        <rect width="420" height="270" fill="url(#terrain)" rx="18" />
        <ellipse cx="210" cy="140" rx="190" ry="105" fill="#000" opacity="0.12" />
        <path d="M120 140 H170 M240 128 H290 M205 105 V70 H270 M205 151 V200 H130 M240 140 L290 205" stroke="#e2e8f0" strokeOpacity="0.35" strokeWidth="4" strokeDasharray="6 6" fill="none" />
        {ZONES.map((z) => {
          const color = z.res ? STATUS_COLORS[statusOf(game.resources[z.res])] : '#a78bfa';
          const active = z.id === selected;
          return (
            <g
              key={z.id}
              role="button"
              tabIndex={0}
              aria-label={`${z.name}${z.res ? `, status ${statusOf(game.resources[z.res])}` : ''}`}
              aria-pressed={active}
              onClick={() => setSelected(z.id)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  setSelected(z.id);
                }
              }}
              style={{ cursor: 'pointer' }}
            >
              <rect x={z.x} y={z.y} width={z.w} height={z.h} rx="10" fill="#0f172a" stroke={color} strokeWidth={active ? 4 : 2} opacity={active ? 1 : 0.92} />
              <text x={z.x + z.w / 2} y={z.y + z.h / 2 + 2} textAnchor="middle" fontSize="20">{z.emoji}</text>
              <text x={z.x + z.w / 2} y={z.y + z.h - 5} textAnchor="middle" fontSize="8.5" fill="#e2e8f0" fontWeight="700">{z.name}</text>
              <circle cx={z.x + z.w - 4} cy={z.y + 4} r="4.5" fill={color} />
            </g>
          );
        })}
      </svg>

      <div className="mt-3 rounded-2xl bg-space-900/60 p-3">
        <h3 className="font-display text-base font-bold text-white">
          {zone.emoji} {zone.name}
        </h3>
        <p className="mt-1 text-sm text-slate-200">{zone.info}</p>
        {zone.id === 'comms' && (
          <p className="mt-1 text-xs text-cyan-200">
            {game.planet === 'mars'
              ? 'On Mars, a one-way message can take about 3 to 22 minutes in real life.'
              : 'A message from the Moon takes about 1.3 seconds to reach Earth.'}
          </p>
        )}
        {zone.action && (
          <button
            type="button"
            className="btn btn-ghost mt-2 !min-h-[40px] text-sm"
            disabled={!st.ok}
            onClick={() => onAct(zone.action)}
          >
            {ACTIONS[zone.action].label}
          </button>
        )}
        {zone.action && !st.ok && <p className="mt-1 text-xs text-rose-300">{st.reason}</p>}
      </div>
    </section>
  );
}
