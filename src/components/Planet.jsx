import { useId } from 'react';

/** Original CSS/SVG planet illustrations. `kind`: moon | mars. */
export default function Planet({ kind = 'moon', size = 200, float = true, label }) {
  const uid = useId().replace(/:/g, '');
  const isMars = kind === 'mars';
  return (
    <svg
      viewBox="0 0 200 200"
      width={size}
      height={size}
      className={float ? 'animate-float' : ''}
      role="img"
      aria-label={label || (isMars ? 'Illustration of Mars' : 'Illustration of the Moon')}
      style={{ animationDuration: isMars ? '8s' : '6s' }}
    >
      <defs>
        <radialGradient id={`g-${uid}`} cx="35%" cy="30%" r="80%">
          {isMars ? (
            <>
              <stop offset="0" stopColor="#fdba74" />
              <stop offset="0.55" stopColor="#ea580c" />
              <stop offset="1" stopColor="#7c2d12" />
            </>
          ) : (
            <>
              <stop offset="0" stopColor="#f8fafc" />
              <stop offset="0.6" stopColor="#cbd5e1" />
              <stop offset="1" stopColor="#64748b" />
            </>
          )}
        </radialGradient>
        <clipPath id={`c-${uid}`}>
          <circle cx="100" cy="100" r="88" />
        </clipPath>
      </defs>
      <circle cx="100" cy="100" r="96" fill={isMars ? '#fb923c' : '#e2e8f0'} opacity="0.12" />
      <circle cx="100" cy="100" r="88" fill={`url(#g-${uid})`} />
      <g clipPath={`url(#c-${uid})`}>
        {isMars ? (
          <>
            <path d="M20 90 Q60 70 90 95 T170 85 L190 110 Q140 125 100 112 T20 118 Z" fill="#7c2d12" opacity="0.45" />
            <path d="M60 140 Q100 125 150 145 L160 170 H50 Z" fill="#9a3412" opacity="0.5" />
            <ellipse cx="100" cy="22" rx="30" ry="9" fill="#fff" opacity="0.85" />
            <ellipse cx="100" cy="180" rx="22" ry="6" fill="#fff" opacity="0.6" />
          </>
        ) : (
          <>
            <circle cx="65" cy="70" r="16" fill="#64748b" opacity="0.4" />
            <circle cx="130" cy="60" r="10" fill="#64748b" opacity="0.4" />
            <circle cx="120" cy="125" r="22" fill="#64748b" opacity="0.35" />
            <circle cx="62" cy="130" r="9" fill="#64748b" opacity="0.4" />
            <circle cx="150" cy="105" r="6" fill="#64748b" opacity="0.4" />
            <circle cx="95" cy="95" r="5" fill="#64748b" opacity="0.4" />
          </>
        )}
        <circle cx="140" cy="140" r="95" fill="#020617" opacity="0.28" />
      </g>
    </svg>
  );
}
