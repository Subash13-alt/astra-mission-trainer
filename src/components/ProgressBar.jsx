import { statusOf } from '../engine/resourceManager.js';

export const STATUS_COLORS = { good: '#4ade80', warning: '#facc15', critical: '#f87171' };

/** Accessible progress bar. Colour follows the green / yellow / red zones. */
export default function ProgressBar({ value, label, height = 'h-3', color }) {
  const v = Math.max(0, Math.min(100, value));
  const fill = color || STATUS_COLORS[statusOf(v)];
  return (
    <div
      role="progressbar"
      aria-label={label}
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(v)}
      className={`w-full overflow-hidden rounded-full bg-white/10 ${height}`}
    >
      <div
        className="h-full rounded-full transition-all duration-700 ease-out"
        style={{ width: `${v}%`, background: fill, boxShadow: `0 0 10px ${fill}88` }}
      />
    </div>
  );
}
