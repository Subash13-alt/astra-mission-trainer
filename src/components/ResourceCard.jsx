import { motion } from 'framer-motion';
import { AlertTriangle, Check, TriangleAlert } from 'lucide-react';
import Icon from './Icon.jsx';
import ProgressBar, { STATUS_COLORS } from './ProgressBar.jsx';
import { RESOURCE_META, STATUS_TEXT } from '../engine/missionConfig.js';
import { statusOf } from '../engine/resourceManager.js';

const STATUS_ICON = { good: Check, warning: TriangleAlert, critical: AlertTriangle };

/** One of the six resource cards on the dashboard. */
export default function ResourceCard({ resourceKey, value, delta = 0 }) {
  const meta = RESOURCE_META[resourceKey];
  const status = statusOf(value);
  const StatusIcon = STATUS_ICON[status];
  const color = STATUS_COLORS[status];
  const rounded = Math.round(value);

  return (
    <motion.article
      layout
      className={`rounded-2xl border bg-space-900/70 p-4 ${
        status === 'critical' ? 'animate-pulseRed border-red-400/70' : 'border-white/10'
      }`}
      aria-label={`${meta.label}: ${rounded} percent, ${STATUS_TEXT[status]}`}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span
            className="grid h-9 w-9 place-items-center rounded-xl"
            style={{ background: `${meta.color}22`, color: meta.color }}
          >
            <Icon name={meta.icon} size={20} />
          </span>
          <h3 className="text-sm font-bold uppercase tracking-wide text-slate-100">{meta.label}</h3>
        </div>
        <motion.span
          key={rounded}
          initial={{ scale: 1.25 }}
          animate={{ scale: 1 }}
          className="font-display text-2xl font-bold text-white"
        >
          {rounded}%
        </motion.span>
      </div>

      <div className="mt-3">
        <ProgressBar value={value} label={meta.label} />
      </div>

      <div className="mt-2 flex items-center justify-between text-xs">
        <span className="inline-flex items-center gap-1 font-bold" style={{ color }}>
          <StatusIcon size={14} aria-hidden="true" /> {STATUS_TEXT[status]}
        </span>
        {delta !== 0 && (
          <span className={delta > 0 ? 'text-emerald-300' : 'text-rose-300'} title="Change since yesterday">
            {delta > 0 ? '▲' : '▼'} {Math.abs(Math.round(delta * 10) / 10)}
          </span>
        )}
      </div>
      <p className="mt-2 text-xs leading-snug text-slate-300">{meta.explain}</p>
    </motion.article>
  );
}
