import { useEffect, useRef, useState } from "react";
import { nextNumberExercises } from "./next-number";
import { store, useSave } from "./state";
import { sound, speak, stopVoice } from "./audio";

export default function NextNumber({ onExit, worksheet = false }: { onExit: () => void; worksheet?: boolean }) {
  const save = useSave();
  const profile = save.profiles.find((p) => p.id === save.active)!;
  const [index, setIndex] = useState(() => Math.max(worksheet ? 50 : 0, nextNumberExercises.findIndex((q) => (!worksheet || q.id > 50) && !profile.bunnyDone.includes(q.id))));
  const [landed, setLanded] = useState(false);
  const [demo, setDemo] = useState(false);
  const [correct, setCorrect] = useState(false);
  const [message, setMessage] = useState("Start at the number shown, then take one hop.");
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const q = nextNumberExercises[index];
  const total = nextNumberExercises.length;
  useEffect(() => () => { clearTimeout(timer.current); stopVoice(); }, []);
  function chooseExercise(i: number) {
    clearTimeout(timer.current);
    stopVoice();
    setIndex(i); setLanded(false); setDemo(false); setCorrect(false);
    setMessage("Start at the number shown, then take one hop.");
  }
  function demonstrate() {
    clearTimeout(timer.current);
    setDemo(true); setLanded(false);
    const words = `Baby Bunny starts at ${q.start}. Start at ${q.start}, not at one. Take one hop forward. Land on ${q.answer}. ${q.answer} comes next. Now you try!`;
    setMessage(words); speak(words);
    timer.current = setTimeout(() => { setLanded(true); setDemo(false); }, 1800);
  }
  function answer(n: number) {
    if (demo || correct) return;
    if (n !== q.answer) {
      setLanded(false);
      const words = `Let’s try again. Start at ${q.start}. Take just one hop forward. Which number comes next?`;
      setMessage(words); speak(words); return;
    }
    setLanded(true); setCorrect(true); store.completeBunny(q.id); sound("star");
    const words = `You did it! Start at ${q.start}, one hop to ${q.answer}!`;
    setMessage(words); speak(words);
  }
  const left = Math.max(1, Math.min(q.start - 1, q.id > 50 ? 10 : 11));
  const bar = Array.from({ length: 5 }, (_, i) => left + i);
  return <main className={`bunny-page ${save.settings.reducedMotion ? "bunny-reduced-motion" : ""}`}>
    <div className="bunny-heading"><button onClick={onExit}>← Back to games</button><span>PHASE 1 · ONE HOP</span></div>
    <h1>Baby Bunny’s next number</h1>
    <p>Start at the number shown, then take <strong>one hop</strong>.</p>
    <div className="bunny-progress"><label htmlFor="bunny-progress">{profile.bunnyDone.length} of {total} exercises complete</label><progress id="bunny-progress" value={profile.bunnyDone.length} max={total} /></div>
    <section className="bunny-lesson" aria-label={`Exercise ${q.id}`}>
      <span className="eyebrow">EXERCISE {q.id} / {total}</span>
      <h2>Start at <span className="bunny-start">{q.start}</span>. What comes next?</h2>
      {q.id > 50 && <div className="bunny-equation" aria-label={`${q.start} plus 1 equals ${correct ? q.answer : "what"}`}>{q.start} + 1 = <strong>{correct ? q.answer : "?"}</strong><small>Extra question {q.id - 50} / {total - 50} · Add one</small></div>}
      <p className="bunny-rule">Start here → one hop forward → next number</p>
      <div className="bunny-number-bar" aria-label="Nearby number bar">
        {bar.map((n) => <div key={n} className={`bunny-stop ${n === q.start ? "start" : ""} ${landed && n === q.answer ? "landed" : ""}`}>
          {n === q.start && <>
            <svg className="bunny-hop-arrow" viewBox="0 0 200 100" preserveAspectRatio="none" role="img" aria-label={`One hop forward from ${q.start} to ${q.answer}`}>
              <path d="M 50 85 Q 100 5 150 85" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" />
              <path d="M 133 77 L 150 85 L 151 66" fill="none" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="bunny-hop-label">+1 · one hop</span>
            <span className={`baby-bunny visible ${landed ? "bunny-jumped" : ""}`} aria-hidden="true">🐰</span>
          </>}
          <button aria-label={`Number ${n}`} disabled={demo || correct} onClick={() => answer(n)}>{n}</button>
          <small>{n === q.start ? "Start" : landed && n === q.answer ? "One hop!" : "\u00a0"}</small>
        </div>)}
      </div>
      <p className="bunny-hop-explanation">Start at <strong>{q.start}</strong> → follow the arrow → hop once to <strong>{q.answer}</strong>.<br />Adding 1 means moving to the very next number.</p>
      <button className="primary" onClick={demonstrate} disabled={demo}>🔊 Show me one hop</button>
      <button className="bunny-listen" onClick={() => speak(message)}>🔊 Hear again</button>
      <p className="bunny-feedback" role="status">{message}</p>
      {!correct && <p>Tap the number Bunny lands on. Take your time!</p>}
      {correct && <div className="bunny-success"><strong>🌼 A lovely little hop!</strong><button className="primary" onClick={() => chooseExercise((index + 1) % total)}>{profile.bunnyDone.length === total ? "All done! Play again" : "Next exercise →"}</button></div>}
    </section>
    {!store.storageAvailable && <p role="alert">Progress cannot be saved on this device right now. You can still play.</p>}
    <details className="bunny-exercises"><summary>Choose or replay an exercise · {profile.bunnyDone.length} / {total}</summary><div>{nextNumberExercises.map((exercise, i) => <button key={exercise.id} aria-label={`Exercise ${exercise.id}${profile.bunnyDone.includes(exercise.id) ? ", complete" : ""}`} aria-current={i === index ? "step" : undefined} onClick={() => chooseExercise(i)}>{profile.bunnyDone.includes(exercise.id) ? "🌼 " : ""}{exercise.id}</button>)}</div></details>
  </main>;
}
