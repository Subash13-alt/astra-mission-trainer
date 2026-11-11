/**
 * App-wide state: the current mission, the player's profile, settings and
 * mission history. Progress is saved to LocalStorage after every change.
 */
import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import {
  chooseScenarioOption,
  clearOutcome,
  createInitialState,
  endDay,
  performAction,
  setPaused,
} from '../engine/gameEngine.js';
import { buildReport, summarizeForHistory } from '../engine/scoringEngine.js';
import { playDay, STRATEGIES } from '../engine/autopilot.js';
import {
  addHistory,
  clearGame,
  clearHistory,
  loadGame,
  loadHistory,
  loadProfile,
  loadSettings,
  saveGame,
  saveProfile,
  saveSettings,
} from '../services/storageService.js';
import { playSound, setSoundEnabled } from '../services/soundService.js';

const AppContext = createContext(null);

export function AppProvider({ children }) {
  const [game, setGameState] = useState(() => loadGame());
  const [profile, setProfileState] = useState(() => loadProfile());
  const [settings, setSettingsState] = useState(() => loadSettings());
  const [history, setHistory] = useState(() => loadHistory());
  const [saveFailed, setSaveFailed] = useState(false);

  const gameRef = useRef(game);
  const recorded = useRef(new Set());

  const setGame = useCallback((next) => {
    gameRef.current = next;
    setGameState(next);
  }, []);

  // Save progress after every change.
  useEffect(() => {
    if (!game) return;
    setSaveFailed(!saveGame(game));
  }, [game]);

  // Settings: save, apply sound and motion preferences.
  useEffect(() => {
    saveSettings(settings);
    setSoundEnabled(settings.sound);
    document.documentElement.classList.toggle('reduce-motion', settings.reducedMotion);
  }, [settings]);

  // When a mission ends, add it to the history once.
  useEffect(() => {
    if (!game || game.status === 'playing' || recorded.current.has(game.id)) return;
    recorded.current.add(game.id);
    setHistory(addHistory(summarizeForHistory(game, buildReport(game))));
    playSound(game.status === 'success' ? 'success' : 'end');
  }, [game]);

  const updateSettings = useCallback((patch) => setSettingsState((s) => ({ ...s, ...patch })), []);

  const updateProfile = useCallback((patch) => {
    setProfileState((p) => {
      const next = { ...p, ...patch };
      saveProfile(next);
      return next;
    });
  }, []);

  const startMission = useCallback(
    (planet = profile.planet) => {
      const nickname = (profile.nickname || '').trim() || 'Commander';
      const state = createInitialState({
        nickname,
        avatar: profile.avatar,
        difficulty: profile.difficulty,
        planet,
      });
      recorded.current.delete(state.id);
      setGame(state);
      playSound('success');
      return state;
    },
    [profile, setGame],
  );

  const act = useCallback(
    (actionId) => {
      const result = performAction(gameRef.current, actionId);
      if (result.ok) {
        setGame(result.state);
        playSound('action');
      } else {
        playSound('warning');
      }
      return result;
    },
    [setGame],
  );

  const choose = useCallback(
    (index) => {
      const result = chooseScenarioOption(gameRef.current, index);
      if (result.ok) {
        setGame(result.state);
        playSound(result.state.lastOutcome?.safety === 0 ? 'warning' : 'success');
      } else {
        playSound('warning');
      }
      return result;
    },
    [setGame],
  );

  const nextDay = useCallback(() => {
    const before = gameRef.current;
    const next = endDay(before);
    if (next !== before) {
      setGame(next);
      if (next.status === 'playing') playSound(next.pendingScenarioId ? 'alert' : 'day');
    }
    return next;
  }, [setGame]);

  const dismissOutcome = useCallback(() => {
    if (gameRef.current) setGame(clearOutcome(gameRef.current));
  }, [setGame]);

  const pause = useCallback(
    (value) => {
      if (gameRef.current) setGame(setPaused(gameRef.current, value));
    },
    [setGame],
  );

  const abandonMission = useCallback(() => {
    gameRef.current = null;
    setGameState(null);
    clearGame();
  }, []);

  /** Teacher / demo mode: let a practice crew play today (or several days). */
  const demoPlayDays = useCallback(
    (count = 1) => {
      let s = gameRef.current;
      for (let i = 0; i < count && s && s.status === 'playing'; i++) {
        s = playDay({ ...s, paused: false, lastOutcome: null }, STRATEGIES.careful);
      }
      if (s) setGame(s);
    },
    [setGame],
  );

  const wipeHistory = useCallback(() => {
    clearHistory();
    setHistory([]);
  }, []);

  const value = useMemo(
    () => ({
      game,
      profile,
      settings,
      history,
      saveFailed,
      updateSettings,
      updateProfile,
      startMission,
      act,
      choose,
      nextDay,
      dismissOutcome,
      pause,
      abandonMission,
      demoPlayDays,
      wipeHistory,
    }),
    [
      game,
      profile,
      settings,
      history,
      saveFailed,
      updateSettings,
      updateProfile,
      startMission,
      act,
      choose,
      nextDay,
      dismissOutcome,
      pause,
      abandonMission,
      demoPlayDays,
      wipeHistory,
    ],
  );

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
}

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside <AppProvider>');
  return ctx;
}
