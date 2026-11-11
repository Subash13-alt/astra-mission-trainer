import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ChevronRight, Lock } from 'lucide-react';
import AstronautAvatar from '../components/AstronautAvatar.jsx';
import Planet from '../components/Planet.jsx';
import { AVATARS, DIFFICULTIES, PLANETS } from '../engine/missionConfig.js';
import { useApp } from '../hooks/useApp.jsx';
import { playSound } from '../services/soundService.js';

/** Keep nicknames simple and safe: letters, numbers, spaces, - and _ only. */
export const cleanNickname = (value) => value.replace(/[^\p{L}\p{N} _-]/gu, '').slice(0, 16);

export default function Profile() {
  const { profile, updateProfile } = useApp();
  const navigate = useNavigate();
  const [nickname, setNickname] = useState(profile.nickname);

  const submit = (e) => {
    e.preventDefault();
    updateProfile({ nickname: cleanNickname(nickname).trim() || 'Commander' });
    playSound('click');
    navigate('/planets');
  };

  return (
    <div className="page max-w-3xl">
      <h1 className="font-display text-4xl font-bold">Create Your Astronaut</h1>
      <p className="mt-1 text-slate-300">Choose how you want to appear in Mission Control.</p>

      <form onSubmit={submit} className="mt-6 space-y-6">
        <div className="panel">
          <label htmlFor="nick" className="font-display text-lg font-bold">1. Astronaut nickname</label>
          <input
            id="nick"
            className="input mt-2"
            value={nickname}
            maxLength={16}
            onChange={(e) => setNickname(cleanNickname(e.target.value))}
            placeholder="Commander"
            autoComplete="off"
            aria-describedby="nick-help"
          />
          <p id="nick-help" className="mt-2 flex items-start gap-1.5 text-sm text-slate-300">
            <Lock size={16} className="mt-0.5 shrink-0" aria-hidden="true" />
            Use a made-up nickname, not your real name. We never ask for emails or personal details, and everything stays on your device.
          </p>
        </div>

        <fieldset className="panel">
          <legend className="px-1 font-display text-lg font-bold">2. Choose your astronaut</legend>
          <div className="mt-2 grid grid-cols-3 gap-3 sm:grid-cols-6" role="radiogroup" aria-label="Astronaut avatar">
            {AVATARS.map((a) => (
              <label key={a.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="avatar"
                  value={a.id}
                  checked={profile.avatar === a.id}
                  onChange={() => updateProfile({ avatar: a.id })}
                  className="peer sr-only"
                />
                <span className="flex flex-col items-center rounded-2xl border-2 border-white/10 bg-space-900/60 p-2 transition peer-checked:border-cyan-300 peer-checked:bg-cyan-400/15 peer-checked:shadow-glow peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-amber-300">
                  <AstronautAvatar avatar={a.id} size={56} label={`${a.name} astronaut`} />
                  <span className="mt-1 text-sm font-bold">{a.name}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="panel">
          <legend className="px-1 font-display text-lg font-bold">3. Select difficulty</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-3">
            {Object.values(DIFFICULTIES).map((d) => (
              <label key={d.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="difficulty"
                  value={d.id}
                  checked={profile.difficulty === d.id}
                  onChange={() => updateProfile({ difficulty: d.id })}
                  className="peer sr-only"
                />
                <span className="block h-full rounded-2xl border-2 border-white/10 bg-space-900/60 p-3 transition peer-checked:border-cyan-300 peer-checked:bg-cyan-400/15 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-amber-300">
                  <span className="font-display text-lg font-bold">{d.label}</span>
                  <span className="block text-xs font-bold uppercase tracking-wide text-cyan-300">{d.ages}</span>
                  <span className="mt-1 block text-sm text-slate-300">{d.blurb}</span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <fieldset className="panel">
          <legend className="px-1 font-display text-lg font-bold">4. Preferred planet</legend>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            {Object.values(PLANETS).map((p) => (
              <label key={p.id} className="cursor-pointer">
                <input
                  type="radio"
                  name="planet"
                  value={p.id}
                  checked={profile.planet === p.id}
                  onChange={() => updateProfile({ planet: p.id })}
                  className="peer sr-only"
                />
                <span className="flex items-center gap-3 rounded-2xl border-2 border-white/10 bg-space-900/60 p-3 transition peer-checked:border-cyan-300 peer-checked:bg-cyan-400/15 peer-focus-visible:outline peer-focus-visible:outline-[3px] peer-focus-visible:outline-amber-300">
                  <Planet kind={p.id} size={64} float={false} />
                  <span>
                    <span className="block font-display text-lg font-bold">{p.name}</span>
                    <span className="text-sm text-slate-300">{p.difficultyLabel}</span>
                  </span>
                </span>
              </label>
            ))}
          </div>
        </fieldset>

        <button type="submit" className="btn btn-primary btn-lg w-full sm:w-auto">
          Choose Your Mission <ChevronRight size={22} aria-hidden="true" />
        </button>
      </form>
    </div>
  );
}
