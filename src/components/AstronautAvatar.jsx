import { AVATARS } from '../engine/missionConfig.js';

/** Friendly astronaut drawn in SVG. `mood`: happy | ok | tired. */
export default function AstronautAvatar({ avatar = 'aurora', size = 96, mood = 'happy', float = false, label }) {
  const a = AVATARS.find((x) => x.id === avatar) || AVATARS[0];
  const mouth =
    mood === 'tired' ? 'M42 52 Q50 48 58 52' : mood === 'ok' ? 'M43 51 H57' : 'M42 49 Q50 57 58 49';
  return (
    <svg
      viewBox="0 0 100 110"
      width={size}
      height={size * 1.1}
      className={float ? 'animate-float' : ''}
      role="img"
      aria-label={label || `${a.name} the astronaut`}
    >
      {/* backpack */}
      <rect x="22" y="58" width="56" height="34" rx="10" fill="#94a3b8" />
      {/* body */}
      <rect x="28" y="60" width="44" height="38" rx="14" fill={a.suit} />
      <rect x="40" y="70" width="20" height="10" rx="3" fill="#0f172a" opacity="0.55" />
      <circle cx="45" cy="75" r="2" fill={a.accent} />
      <circle cx="55" cy="75" r="2" fill="#f87171" />
      {/* arms and legs */}
      <rect x="14" y="62" width="16" height="12" rx="6" fill={a.suit} />
      <rect x="70" y="62" width="16" height="12" rx="6" fill={a.suit} />
      <rect x="32" y="94" width="14" height="12" rx="5" fill="#e2e8f0" />
      <rect x="54" y="94" width="14" height="12" rx="5" fill="#e2e8f0" />
      {/* helmet */}
      <circle cx="50" cy="36" r="29" fill="#f1f5f9" />
      <circle cx="50" cy="36" r="23" fill="#0f172a" />
      <ellipse cx="50" cy="36" rx="20" ry="18" fill="#1e3a8a" />
      <ellipse cx="42" cy="28" rx="7" ry="4" fill="#fff" opacity="0.35" />
      {/* face */}
      <circle cx="43" cy="38" r="2.6" fill="#fff" />
      <circle cx="57" cy="38" r="2.6" fill="#fff" />
      <path d={mouth} stroke="#fff" strokeWidth="2.4" fill="none" strokeLinecap="round" transform="translate(0 0)" />
      {/* helmet ring */}
      <circle cx="50" cy="36" r="29" fill="none" stroke={a.accent} strokeWidth="3" />
    </svg>
  );
}
