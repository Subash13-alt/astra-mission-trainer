import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { BookOpen, Play, Rocket, Telescope } from 'lucide-react';
import Planet from '../components/Planet.jsx';
import AstronautAvatar from '../components/AstronautAvatar.jsx';
import { useApp } from '../hooks/useApp.jsx';
import { MISSION_LENGTH } from '../engine/missionConfig.js';

export default function Home() {
  const { game, profile } = useApp();
  const resumable = game && game.status === 'playing';

  return (
    <div className="page">
      <section className="relative grid items-center gap-8 pt-4 lg:grid-cols-2 lg:pt-10">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
          <p className="mb-2 inline-block rounded-full border border-cyan-300/40 bg-cyan-300/10 px-3 py-1 text-xs font-bold uppercase tracking-[0.2em] text-cyan-200">
            Junior Astronaut Mission Trainer
          </p>
          <h1 className="font-display text-4xl font-bold leading-tight text-white sm:text-6xl">
            Welcome to{' '}
            <span className="bg-gradient-to-r from-cyan-300 via-violet-300 to-pink-300 bg-clip-text text-transparent">ASTRA!</span>
          </h1>
          <p className="mt-2 font-display text-xl font-semibold text-cyan-200 sm:text-2xl">Your Space Mission Starts Here.</p>
          <p className="mt-4 max-w-xl text-lg leading-relaxed text-slate-200">
            Imagine living on another planet. Can you manage oxygen, water, food, and power to keep your astronauts safe?
            Become a mission commander and find out!
          </p>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
            {resumable && (
              <Link to="/mission" className="btn btn-gold btn-lg">
                <Play size={22} aria-hidden="true" /> RESUME MISSION (Day {game.day})
              </Link>
            )}
            <Link to="/profile" className="btn btn-primary btn-lg">
              <Rocket size={22} aria-hidden="true" /> START YOUR MISSION
            </Link>
            <Link to="/how-to-play" className="btn btn-ghost btn-lg">
              <BookOpen size={22} aria-hidden="true" /> HOW TO PLAY
            </Link>
            <Link to="/science" className="btn btn-ghost btn-lg">
              <Telescope size={22} aria-hidden="true" /> EXPLORE SPACE SCIENCE
            </Link>
          </div>
          <p className="mt-4 text-sm text-slate-300">
            <Link to="/about" className="font-semibold text-cyan-300 underline">About ASTRA</Link> · Free to play · No sign-up · {MISSION_LENGTH}-day missions
          </p>
          <p className="mt-6 font-display text-lg font-semibold italic text-violet-200">
            “Every Decision Matters. Every Resource Counts.”
          </p>
        </motion.div>

        <div className="relative mx-auto h-[360px] w-full max-w-md sm:h-[440px]" aria-hidden="false">
          <div className="absolute left-0 top-2">
            <Planet kind="moon" size={190} label="Animated illustration of the Moon" />
          </div>
          <div className="absolute bottom-0 right-0">
            <Planet kind="mars" size={230} label="Animated illustration of Mars" />
          </div>
          <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
            <AstronautAvatar avatar={profile.avatar} size={150} float label="Friendly astronaut waving hello" />
          </div>
        </div>
      </section>

      <section className="mt-14 grid gap-4 sm:grid-cols-3" aria-label="What you will do">
        {[
          { e: '⚖️', t: 'Make smart trade-offs', d: 'Every action costs something. Extra shielding uses electricity. Growing food needs water.' },
          { e: '🚨', t: 'Handle emergencies', d: 'Solar storms, dust storms, leaks and more. Pick the best of three choices.' },
          { e: '🛰️', t: 'Learn with real NASA data', d: 'See real space weather and Mars rover photos, clearly marked apart from game values.' },
        ].map((c) => (
          <div key={c.t} className="panel">
            <div className="text-4xl" aria-hidden="true">{c.e}</div>
            <h2 className="mt-2 font-display text-lg font-bold">{c.t}</h2>
            <p className="mt-1 text-sm text-slate-300">{c.d}</p>
          </div>
        ))}
      </section>
    </div>
  );
}
