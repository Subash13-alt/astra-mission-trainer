import { useEffect, useState } from 'react';
import { Navigate, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { Rocket } from 'lucide-react';
import MissionHeader from '../components/MissionHeader.jsx';
import ResourceCard from '../components/ResourceCard.jsx';
import ScenarioCard from '../components/ScenarioCard.jsx';
import OutcomeCard from '../components/OutcomeCard.jsx';
import ActionPanel from '../components/ActionPanel.jsx';
import AdvisorPanel from '../components/AdvisorPanel.jsx';
import MissionMap from '../components/MissionMap.jsx';
import { PauseOverlay, TeacherPanel, TutorialCoach } from '../components/Overlays.jsx';
import { AlertsPanel, CrewPanel, EnvironmentPanel, LogPanel, TimelinePanel } from '../components/DashboardPanels.jsx';
import { RESOURCE_KEYS, DIFFICULTIES } from '../engine/missionConfig.js';
import { getScenarioView } from '../engine/scenarioEngine.js';
import { useApp } from '../hooks/useApp.jsx';

const TUTORIAL_FLAG = 'astra.tutorial.seen.v1';
const seenTutorial = () => {
  try {
    return window.localStorage.getItem(TUTORIAL_FLAG) === '1';
  } catch {
    return true; // if storage is blocked, do not nag
  }
};
const markTutorialSeen = () => {
  try {
    window.localStorage.setItem(TUTORIAL_FLAG, '1');
  } catch {
    /* ignore */
  }
};

export default function MissionControl() {
  const { game, settings, saveFailed, act, choose, nextDay, dismissOutcome, pause, abandonMission, startMission, demoPlayDays } = useApp();
  const navigate = useNavigate();
  const [showTutorial, setShowTutorial] = useState(() => !seenTutorial());
  const [dayNote, setDayNote] = useState('');

  // When the mission ends, go to the report after a short pause so the player sees the last result.
  // If the last decision ended the mission, wait until the player has read its result.
  const readyForReport = Boolean(game) && game.status !== 'playing' && !game.lastOutcome;
  useEffect(() => {
    if (!readyForReport) return undefined;
    const t = setTimeout(() => navigate('/report'), 400);
    return () => clearTimeout(t);
  }, [readyForReport, navigate]);

  if (!game) return <Navigate to="/planets" replace />;

  const scenario = game.pendingScenarioId ? getScenarioView(game.pendingScenarioId, game) : null;
  const deltas = game.lastDaySummary?.changes || {};
  const closeTutorial = () => {
    markTutorialSeen();
    setShowTutorial(false);
  };

  const handleEndDay = () => {
    const done = game.day;
    const next = nextDay();
    if (next.status === 'playing') {
      setDayNote(`Day ${done} complete! 🎉 Welcome to Day ${next.day}.`);
    }
  };

  const restart = () => {
    if (!window.confirm('Restart this mission from Day 1?')) return;
    const planet = game.planet;
    abandonMission();
    startMission(planet);
  };

  const exitHome = () => {
    pause(false);
    navigate('/');
  };

  return (
    <div className="page space-y-5">
      {showTutorial && <TutorialCoach onClose={closeTutorial} />}
      {game.paused && game.status === 'playing' && (
        <PauseOverlay onResume={() => pause(false)} onRestart={restart} onExit={exitHome} />
      )}

      <MissionHeader game={game} onPause={() => pause(true)} onTutorial={() => setShowTutorial(true)} />

      {saveFailed && (
        <p className="rounded-xl border border-amber-300/50 bg-amber-300/10 p-3 text-sm text-amber-100" role="status">
          ⚠️ Your browser would not let us save progress. You can keep playing, but the mission may not be there next time.
        </p>
      )}

      {dayNote && game.status === 'playing' && (
        <p className="rounded-xl bg-emerald-400/10 px-3 py-2 text-sm font-semibold text-emerald-200" role="status" aria-live="polite">
          {dayNote}
        </p>
      )}

      {settings.teacherMode && <TeacherPanel game={game} onDemo={demoPlayDays} />}

      <div className="grid gap-5 lg:grid-cols-3">
        <div className="space-y-5 lg:col-span-2">
          <section className="panel" aria-labelledby="res-title">
            <h2 id="res-title" className="panel-title">📊 Resource Overview</h2>
            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
              {RESOURCE_KEYS.map((k) => (
                <ResourceCard key={k} resourceKey={k} value={game.resources[k]} delta={deltas[k] || 0} />
              ))}
            </div>
            <p className="mt-3 text-xs text-slate-400">
              Game values from 0 to 100. They are made up for fun and are not real NASA measurements. Radiation protection is how strong the shield is, not a measured radiation dose.
            </p>
            <ReservesRow game={game} />
          </section>

          <section aria-labelledby="decision-h">
            <h2 id="decision-h" className="sr-only">Decision Center</h2>
            <AnimatePresence mode="wait">
              {game.lastOutcome ? (
                <OutcomeCard key="outcome" outcome={game.lastOutcome} onContinue={dismissOutcome} />
              ) : scenario ? (
                <ScenarioCard
                  key={scenario.id}
                  scenario={scenario}
                  onChoose={choose}
                  showHint={DIFFICULTIES[game.difficulty].hints}
                  teacherMode={settings.teacherMode}
                  disabled={game.paused}
                />
              ) : (
                <motion.div key="calm" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="panel">
                  <h2 className="panel-title">🧭 Decision Center</h2>
                  <p className="text-slate-100">
                    <Rocket className="mr-1 inline" size={18} aria-hidden="true" />
                    No emergency today. Use your actions to look after the base, then end the day.
                  </p>
                </motion.div>
              )}
            </AnimatePresence>
          </section>

          <ActionPanel game={game} onAct={act} onEndDay={handleEndDay} />
          <TimelinePanel game={game} />
          <LogPanel game={game} />
        </div>

        <aside className="space-y-5" aria-label="Mission details">
          <AlertsPanel game={game} />
          <CrewPanel game={game} />
          <AdvisorPanel game={game} compact />
          <EnvironmentPanel game={game} />
          <MissionMap game={game} onAct={act} />
        </aside>
      </div>
    </div>
  );
}

function ReservesRow({ game }) {
  const items = [
    ['🔋', 'Batteries', game.reserves.battery],
    ['🥫', 'Food packs', game.reserves.emergencyFood],
    ['🔧', 'Spare parts', game.reserves.spareParts],
    ['🫧', 'Oxygen tanks', game.reserves.oxygenTank],
  ];
  return (
    <div className="mt-3 flex flex-wrap gap-2" aria-label="Emergency supplies">
      <span className="text-xs font-bold uppercase tracking-wide text-slate-300">Emergency supplies (single use):</span>
      {items.map(([e, label, n]) => (
        <span key={label} className="chip">
          {e} {label}: {n}
        </span>
      ))}
    </div>
  );
}
