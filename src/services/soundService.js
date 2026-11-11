/**
 * Tiny sound effects made with the Web Audio API – no audio files needed.
 * Sounds only start after the player clicks something (browser rule), are
 * quiet, and can be muted in the top bar.
 */

let enabled = true;
let ctx = null;

export function setSoundEnabled(value) {
  enabled = Boolean(value);
}

function getContext() {
  if (ctx) return ctx;
  const AC = typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext);
  if (!AC) return null;
  try {
    ctx = new AC();
  } catch {
    ctx = null;
  }
  return ctx;
}

function tone(c, { freq, start = 0, dur = 0.12, type = 'sine', gain = 0.06 }) {
  const osc = c.createOscillator();
  const g = c.createGain();
  osc.type = type;
  osc.frequency.value = freq;
  const t0 = c.currentTime + start;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.02);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(c.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.05);
}

const SOUNDS = {
  click: [{ freq: 520, dur: 0.07 }],
  action: [{ freq: 440, dur: 0.08 }, { freq: 660, start: 0.08, dur: 0.1 }],
  success: [{ freq: 523, dur: 0.12 }, { freq: 659, start: 0.12, dur: 0.12 }, { freq: 784, start: 0.24, dur: 0.2 }],
  warning: [{ freq: 330, dur: 0.15, type: 'triangle' }, { freq: 330, start: 0.22, dur: 0.15, type: 'triangle' }],
  alert: [{ freq: 600, dur: 0.12, type: 'square', gain: 0.03 }, { freq: 450, start: 0.14, dur: 0.14, type: 'square', gain: 0.03 }],
  day: [{ freq: 392, dur: 0.12 }, { freq: 523, start: 0.12, dur: 0.18 }],
  end: [{ freq: 392, dur: 0.2 }, { freq: 330, start: 0.2, dur: 0.2 }, { freq: 262, start: 0.4, dur: 0.3 }],
};

export function playSound(name) {
  if (!enabled) return;
  const c = getContext();
  if (!c) return;
  try {
    if (c.state === 'suspended') c.resume();
    (SOUNDS[name] || SOUNDS.click).forEach((t) => tone(c, t));
  } catch {
    /* sound is optional – ignore any audio errors */
  }
}
