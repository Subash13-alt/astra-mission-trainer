/**
 * LocalStorage helpers. Everything stays in the player's own browser:
 * no accounts, no emails, no personal information, nothing sent anywhere.
 * Every call is wrapped so private-mode or full storage never crashes the game.
 */
import { SAVE_VERSION } from '../engine/missionConfig.js';

const KEYS = {
  profile: 'astra.profile.v1',
  game: 'astra.game.v1',
  history: 'astra.history.v1',
  settings: 'astra.settings.v1',
  cachePrefix: 'astra.cache.v1.',
};

const MAX_HISTORY = 20;

function read(key, fallback = null) {
  try {
    const raw = window.localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function write(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

function remove(key) {
  try {
    window.localStorage.removeItem(key);
  } catch {
    /* ignore */
  }
}

export const DEFAULT_PROFILE = { nickname: '', avatar: 'aurora', difficulty: 'normal', planet: 'moon' };
export const DEFAULT_SETTINGS = { sound: true, reducedMotion: false, teacherMode: false };

export const loadProfile = () => ({ ...DEFAULT_PROFILE, ...(read(KEYS.profile, {}) || {}) });
export const saveProfile = (profile) => write(KEYS.profile, profile);

export const loadSettings = () => ({ ...DEFAULT_SETTINGS, ...(read(KEYS.settings, {}) || {}) });
export const saveSettings = (settings) => write(KEYS.settings, settings);

/** A saved game is only accepted if it looks complete and is from this version. */
function looksValid(game) {
  return Boolean(
    game &&
      game.version === SAVE_VERSION &&
      typeof game.day === 'number' &&
      game.resources &&
      game.status &&
      Array.isArray(game.history) &&
      game.profile,
  );
}

export function loadGame() {
  const game = read(KEYS.game);
  return looksValid(game) ? game : null;
}
export const saveGame = (game) => write(KEYS.game, game);
export const clearGame = () => remove(KEYS.game);

export const loadHistory = () => {
  const h = read(KEYS.history, []);
  return Array.isArray(h) ? h : [];
};

export function addHistory(entry) {
  const list = loadHistory().filter((e) => e.id !== entry.id);
  list.unshift(entry);
  const trimmed = list.slice(0, MAX_HISTORY);
  write(KEYS.history, trimmed);
  return trimmed;
}

export const clearHistory = () => remove(KEYS.history);

/** Simple time-limited cache for NASA responses. */
export function readCache(name, maxAgeMs) {
  const entry = read(KEYS.cachePrefix + name);
  if (!entry || typeof entry.savedAt !== 'number') return null;
  if (Date.now() - entry.savedAt > maxAgeMs) return null;
  return entry;
}

export function writeCache(name, value) {
  return write(KEYS.cachePrefix + name, { savedAt: Date.now(), value });
}
