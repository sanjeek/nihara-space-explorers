import { useEffect, useRef, useState } from "react";
import { questionFor, symbols, type Mission } from "./missions";
import { sound, speak } from "./audio";
export default function Puzzle({
  mission: m,
  onProgress,
  onComplete,
}: {
  mission: Mission;
  onProgress: (n: number) => void;
  onComplete: () => void;
}) {
  const [round, setRound] = useState(0),
    [message, setMessage] = useState(""),
    [mistakes, setMistakes] = useState(0);
  const [selected, setSelected] = useState<number[]>([]),
    [flashing, setFlashing] = useState(-1),
    [watching, setWatching] = useState(false),
    [input, setInput] = useState<number[]>([]),
    [replay, setReplay] = useState(0);
  const [color, setColor] = useState(""),
    [fin, setFin] = useState("");
  const drag = useRef<number | null>(null);
  const finished = useRef(false);
  const size = 3 + Math.min(m.world, 3);
  const sequence = Array.from(
    { length: 3 + Math.floor(m.world / 2) },
    (_, i) => (i * i + i + m.world + round) % 4,
  );
  useEffect(() => {
    if (m.mode !== "sequence") return;
    setWatching(true);
    setInput([]);
    setFlashing(-1);
    let step = 0,
      timer: ReturnType<typeof setTimeout>;
    function flash() {
      setFlashing(-1);
      if (step >= sequence.length) {
        setWatching(false);
        return;
      }
      setFlashing(sequence[step++]);
      timer = setTimeout(() => {
        setFlashing(-1);
        timer = setTimeout(flash, 220);
      }, 600);
    }
    timer = setTimeout(flash, 500);
    return () => clearTimeout(timer);
  }, [round, replay, m.id]);
  function advance() {
    if (finished.current) return;
    sound("star");
    setMessage("Wonderful work, Captain!");
    if (round === 2) {
      finished.current = true;
      onProgress(3);
      onComplete();
      return;
    }
    onProgress(round + 1);
    setRound((v) => v + 1);
    setSelected([]);
    setColor("");
    setFin("");
    setMistakes(0);
  }
  function wrong() {
    sound("bump");
    setMistakes((v) => v + 1);
    setMessage("You’re learning! Take another look. Try again.");
  }
  function choose(index: number) {
    if (m.mode === "sequence") {
      if (index !== sequence[input.length]) {
        wrong();
        setReplay((v) => v + 1);
        return;
      }
      const next = [...input, index];
      setInput(next);
      sound("tap");
      if (next.length === sequence.length) advance();
    }
  }
  const q = questionFor(m, round);
  const colours = ["#ad9af4", "#f4be76", "#79d8cc"];
  const colourNames = ["Purple", "Orange", "Mint"];
  const neededColor = (m.world + round) % 3,
    neededFin = round % 2 ? "pointy" : "round";
  return (
    <section className="puzzle-card">
      <span className="eyebrow">LITTLE THINKERS · {round + 1} / 3</span>
      <h2>
        {m.mode === "sequence"
          ? "Listen, look, remember"
          : m.mode === "sort"
            ? "Smallest to biggest"
            : m.mode === "workshop"
              ? "Build the captain’s rocket"
              : q.prompt}
      </h2>
      {m.mode === "sequence" ? (
        <>
          <p>
            {watching
              ? "Watch the lights…"
              : "Your turn! Tap the lights in the same order."}
          </p>
          <div className="puzzle-answers">
            {symbols.map((v, i) => (
              <button
                key={v}
                aria-label={["Star", "Moon", "Sun", "Crystal"][i]}
                disabled={watching}
                className={flashing === i ? "lit" : ""}
                onClick={() => choose(i)}
              >
                {v}
              </button>
            ))}
          </div>
          <button className="text-btn" onClick={() => setReplay((v) => v + 1)}>
            ↻ Watch again
          </button>
          <p>
            {input.length} / {sequence.length}
          </p>
        </>
      ) : m.mode === "sort" ? (
        <>
          <p>Tap or drag the rocks, starting with the smallest.</p>
          <div className="sort-rocks">
            {Array.from({ length: size }, (_, i) => ((i + 2) % size) + 1).map(
              (n) => (
                <button
                  key={n}
                  data-size={n}
                  draggable={!selected.includes(n)}
                  disabled={selected.includes(n)}
                  aria-label={"Rock size " + n}
                  onDragStart={() => (drag.current = n)}
                  onClick={() => {
                    if (n === selected.length + 1) {
                      const next = [...selected, n];
                      setSelected(next);
                      sound("star");
                      if (next.length === size) advance();
                    } else wrong();
                  }}
                >
                  <span style={{ fontSize: 18 + n * 6 }}>🪨</span>
                  <small>{n}</small>
                </button>
              ),
            )}
          </div>
          <div
            className="drop-zone"
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const n = drag.current;
              drag.current = null;
              if (n === selected.length + 1) {
                const next = [...selected, n];
                setSelected(next);
                if (next.length === size) advance();
                else sound("star");
              } else wrong();
            }}
          >
            👇 {selected.map(() => "🪨").join(" ")}
            <span> Drop the next rock here</span>
          </div>
        </>
      ) : m.mode === "workshop" ? (
        <>
          <p>
            Choose <b>{colourNames[neededColor]}</b> and <b>{neededFin}</b>{" "}
            fins.
          </p>
          <div className="build-request">
            <span style={{ background: colours[neededColor] }}>🎨</span>
            <span>{neededFin === "round" ? "●" : "▲"}</span>
          </div>
          <div className="colour-options">
            {colours.map((c, i) => (
              <button
                key={c}
                aria-label={colourNames[i]}
                className={color === c ? "chosen" : ""}
                style={{ background: c }}
                onClick={() => setColor(c)}
              >
                {color === c ? "✓" : ""}
              </button>
            ))}
          </div>
          <div className="fin-options">
            {["round", "pointy"].map((f) => (
              <button
                key={f}
                className={fin === f ? "chosen" : ""}
                onClick={() => setFin(f)}
              >
                {f === "round" ? "●" : "▲"} {f}
              </button>
            ))}
          </div>
          <button
            className="primary"
            onClick={() => {
              if (color === colours[neededColor] && fin === neededFin)
                advance();
              else wrong();
            }}
          >
            🚀 Ready for launch
          </button>
        </>
      ) : (
        <>
          <div
            className={
              "question-visual " + (m.mode === "count" ? "count-items" : "")
            }
          >
            {q.visual}
          </div>
          <div className="puzzle-answers">
            {q.choices.map((v, i) => (
              <button
                key={i}
                className={mistakes >= 3 && v === q.answer ? "hint-answer" : ""}
                onClick={() => {
                  if (v === q.answer) advance();
                  else wrong();
                }}
              >
                {v}
              </button>
            ))}
          </div>
        </>
      )}
      <p className="feedback" aria-live="polite">
        {message}
      </p>
      <button className="text-btn" onClick={() => speak(m.instructions)}>
        🔊 Hear instructions
      </button>
    </section>
  );
}
