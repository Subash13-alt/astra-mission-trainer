import { useMemo } from 'react';

/** Deterministic pseudo-random numbers so the stars do not jump around. */
function seeded(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

/** Animated twinkling stars + a tiny spacecraft drifting by. */
export default function StarField({ count = 70 }) {
  const stars = useMemo(() => {
    const rnd = seeded(42);
    return Array.from({ length: count }, (_, i) => ({
      id: i,
      left: rnd() * 100,
      top: rnd() * 100,
      size: 1 + rnd() * 2.2,
      delay: rnd() * 4,
      dur: 2.5 + rnd() * 3,
    }));
  }, [count]);

  return (
    <div className="pointer-events-none fixed inset-0 -z-10 overflow-hidden" aria-hidden="true">
      {stars.map((s) => (
        <span
          key={s.id}
          className="star"
          style={{
            left: `${s.left}%`,
            top: `${s.top}%`,
            width: s.size,
            height: s.size,
            animationDelay: `${s.delay}s`,
            animationDuration: `${s.dur}s`,
          }}
        />
      ))}
      <svg
        className="absolute left-0 top-[18%] h-8 w-16 animate-drift opacity-70"
        viewBox="0 0 64 32"
      >
        <path d="M4 16 L18 6 H44 L60 16 L44 26 H18 Z" fill="#cbd5e1" />
        <circle cx="38" cy="16" r="5" fill="#22d3ee" />
        <path d="M4 16 L-10 10 V22 Z" fill="#f97316" opacity="0.8" />
      </svg>
    </div>
  );
}
