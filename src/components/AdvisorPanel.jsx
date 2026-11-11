import { useRef, useState } from 'react';
import { Lightbulb, Send } from 'lucide-react';
import { ADVISOR_NAME, QUICK_QUESTIONS, askAdvisor, getHint } from '../services/advisorService.js';
import AstronautAvatar from './AstronautAvatar.jsx';

/** ASTRA AI – Your Mission Companion. Works offline, answers in simple English. */
export default function AdvisorPanel({ game, compact = false }) {
  const [messages, setMessages] = useState([
    { from: 'ai', text: 'Hi Commander! I am ASTRA AI, your mission companion. Ask me about space, or tap a question below.' },
  ]);
  const [text, setText] = useState('');
  const listRef = useRef(null);

  const push = (question, answer) => {
    setMessages((m) => [...m, { from: 'me', text: question }, { from: 'ai', text: answer }].slice(-24));
    requestAnimationFrame(() => {
      if (listRef.current) listRef.current.scrollTop = listRef.current.scrollHeight;
    });
  };

  const ask = (q) => {
    const question = q.trim();
    if (!question) return;
    push(question, askAdvisor(question, game));
    setText('');
  };

  return (
    <section className="panel" aria-labelledby="advisor-title">
      <h2 id="advisor-title" className="panel-title">
        <AstronautAvatar avatar="sol" size={30} label="ASTRA AI" />
        {ADVISOR_NAME} <span className="text-sm font-normal text-slate-300">Your Mission Companion</span>
      </h2>

      <div
        ref={listRef}
        className={`thin-scroll space-y-2 overflow-y-auto rounded-2xl bg-space-900/60 p-3 ${compact ? 'max-h-44' : 'max-h-64'}`}
        role="log"
        aria-live="polite"
        aria-label="Conversation with ASTRA AI"
      >
        {messages.map((m, i) => (
          <p
            key={i}
            className={`max-w-[92%] rounded-2xl px-3 py-2 text-sm leading-snug ${
              m.from === 'ai' ? 'bg-cyan-400/15 text-slate-50' : 'ml-auto bg-violet-500/30 text-white'
            }`}
          >
            <span className="sr-only">{m.from === 'ai' ? 'ASTRA AI says: ' : 'You say: '}</span>
            {m.text}
          </p>
        ))}
      </div>

      <div className="mt-2 flex flex-wrap gap-1.5">
        {game && (
          <button
            type="button"
            className="chip border-amber-300/50 bg-amber-300/15 text-amber-100 hover:bg-amber-300/25"
            onClick={() => push('Give me a hint', getHint(game))}
          >
            <Lightbulb size={12} aria-hidden="true" /> Give me a hint
          </button>
        )}
        {QUICK_QUESTIONS.map((q) => (
          <button key={q} type="button" className="chip hover:bg-white/20" onClick={() => ask(q)}>
            {q}
          </button>
        ))}
      </div>

      <form
        className="mt-2 flex gap-2"
        onSubmit={(e) => {
          e.preventDefault();
          ask(text);
        }}
      >
        <label htmlFor="advisor-input" className="sr-only">Ask ASTRA AI a question</label>
        <input
          id="advisor-input"
          className="input !py-2"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Ask about oxygen, power, radiation…"
          maxLength={120}
          autoComplete="off"
        />
        <button type="submit" className="btn btn-primary !px-4" aria-label="Send question">
          <Send size={18} aria-hidden="true" />
        </button>
      </form>
      <p className="mt-1 text-[11px] text-slate-400">
        ASTRA AI runs on your device. Please never type personal information.
      </p>
    </section>
  );
}
