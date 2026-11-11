import { useEffect, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { ChevronLeft, ChevronRight, Play, RotateCcw, X } from 'lucide-react';

/** Pause screen. */
export function PauseOverlay({ onResume, onRestart, onExit }) {
  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center bg-space-950/85 p-4 backdrop-blur"
      role="dialog"
      aria-modal="true"
      aria-labelledby="pause-title"
    >
      <div className="panel w-full max-w-md text-center">
        <div className="text-5xl" aria-hidden="true">⏸️</div>
        <h2 id="pause-title" className="mt-2 font-display text-3xl font-bold">Mission Paused</h2>
        <p className="mt-1 text-slate-300">Your progress is saved automatically. Take a break, Commander!</p>
        <div className="mt-5 flex flex-col gap-2">
          <button type="button" className="btn btn-primary btn-lg" onClick={onResume} autoFocus>
            <Play size={20} aria-hidden="true" /> Resume Mission
          </button>
          <button type="button" className="btn btn-ghost" onClick={onExit}>Save and go to Home</button>
          <button type="button" className="btn btn-ghost" onClick={onRestart}>
            <RotateCcw size={16} aria-hidden="true" /> Restart this mission
          </button>
        </div>
      </div>
    </div>
  );
}

const TUTORIAL_STEPS = [
  { emoji: '📊', title: 'Watch your resources', text: 'The six cards show oxygen, water, food, electricity, radiation protection and crew health. Green is healthy, yellow needs attention, red is critical!' },
  { emoji: '🛠️', title: 'Use your actions', text: 'Each day you get three actions. Every action costs something, so think about trade-offs. For example, making air needs electricity.' },
  { emoji: '⚠️', title: 'Make decisions', text: 'Sometimes something happens and you must choose between three options. Read the costs, then pick the one you think is best.' },
  { emoji: '🌙', title: 'End the day', text: 'When you are done, press End Day. The crew uses oxygen, water, food and power. Survive 30 days to finish the mission!' },
];

/** Step-by-step tutorial coach. */
export function TutorialCoach({ onClose }) {
  const [step, setStep] = useState(0);
  const s = TUTORIAL_STEPS[step];
  const last = step === TUTORIAL_STEPS.length - 1;

  useEffect(() => {
    const onKey = (e) => e.key === 'Escape' && onClose();
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-space-950/80 p-4 backdrop-blur" role="dialog" aria-modal="true" aria-labelledby="tut-title">
      <div className="panel w-full max-w-md">
        <div className="flex items-start justify-between">
          <p className="text-xs font-bold uppercase tracking-widest text-cyan-300">
            Tutorial · Step {step + 1} of {TUTORIAL_STEPS.length}
          </p>
          <button type="button" onClick={onClose} className="rounded-lg p-1 text-slate-300 hover:bg-white/10" aria-label="Close tutorial">
            <X size={20} aria-hidden="true" />
          </button>
        </div>
        <div className="mt-2 text-center">
          <div className="text-6xl" aria-hidden="true">{s.emoji}</div>
          <h2 id="tut-title" className="mt-2 font-display text-2xl font-bold">{s.title}</h2>
          <p className="mt-2 text-slate-200">{s.text}</p>
        </div>
        <div className="mt-5 flex items-center justify-between gap-2">
          <button type="button" className="btn btn-ghost" onClick={() => setStep((n) => Math.max(0, n - 1))} disabled={step === 0}>
            <ChevronLeft size={18} aria-hidden="true" /> Back
          </button>
          {last ? (
            <button type="button" className="btn btn-primary" onClick={onClose} autoFocus>Let’s go! 🚀</button>
          ) : (
            <button type="button" className="btn btn-primary" onClick={() => setStep((n) => n + 1)} autoFocus>
              Next <ChevronRight size={18} aria-hidden="true" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

/** 3-2-1 launch countdown. Calls onDone when it reaches liftoff. */
export function LaunchCountdown({ onDone }) {
  const [n, setN] = useState(3);

  useEffect(() => {
    if (n < 0) {
      onDone();
      return undefined;
    }
    const t = setTimeout(() => setN((v) => v - 1), 800);
    return () => clearTimeout(t);
  }, [n, onDone]);

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-space-950/90" role="alert" aria-live="assertive">
      <AnimatePresence mode="wait">
        <motion.div
          key={n}
          initial={{ scale: 0.4, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 1.6, opacity: 0 }}
          className="text-center"
        >
          <div className="font-display text-[8rem] font-bold leading-none text-cyan-300 drop-shadow-[0_0_30px_rgba(34,211,238,0.7)]">
            {n > 0 ? n : '🚀'}
          </div>
          <p className="mt-2 font-display text-2xl font-bold text-white">{n > 0 ? 'Launching your mission…' : 'Liftoff!'}</p>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}

/** Teacher / demo mode tools. */
export function TeacherPanel({ game, onDemo }) {
  return (
    <section className="panel border-emerald-400/40" aria-labelledby="teacher-title">
      <h2 id="teacher-title" className="panel-title">🧑‍🏫 Teacher / Demo Mode</h2>
      <p className="text-sm text-slate-200">
        Show the class how a mission works. A practice crew can play for you using careful, safe choices. The safest option is marked on each decision.
      </p>
      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" className="btn btn-ghost" onClick={() => onDemo(1)} disabled={game.status !== 'playing'}>
          Play today for me
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onDemo(5)} disabled={game.status !== 'playing'}>
          Play 5 days
        </button>
        <button type="button" className="btn btn-ghost" onClick={() => onDemo(30)} disabled={game.status !== 'playing'}>
          Play to the end
        </button>
      </div>
    </section>
  );
}
