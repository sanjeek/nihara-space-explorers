import { useState } from "react";
import { additionFor, type Mission } from "./missions";
import { sound, speak } from "./audio";
export default function AdditionGame({
  mission,
  round,
  variation,
  onCorrect,
  onWrong,
  mistakes,
}: {
  mission: Mission;
  round: number;
  variation: number;
  onCorrect: () => void;
  onWrong: () => void;
  mistakes: number;
}) {
  const sum = additionFor(mission, round, variation);
  const [moved, setMoved] = useState<number[]>([]);
  function add(id: number) {
    if (!moved.includes(id)) {
      setMoved((v) => (v.includes(id) ? v : [...v, id]));
      sound("tap");
    }
  }
  const berries = (start: number, count: number) =>
    Array.from({ length: count }, (_, i) => {
      const id = start + i;
      return (
        <button
          className="berry"
          key={id}
          aria-label={`Move berry ${id + 1}`}
          disabled={moved.includes(id)}
          draggable={!moved.includes(id)}
          onDragStart={(e) => e.dataTransfer.setData("text/plain", String(id))}
          onClick={() => add(id)}
        >
          🍓
        </button>
      );
    });
  return (
    <div className="addition-game">
      <div className="momo-friend" aria-hidden="true">
        <svg className="momo-face" viewBox="0 0 100 90">
          <path
            d="M25 28L18 10M75 28L82 10"
            stroke="#91d9be"
            strokeWidth="6"
            strokeLinecap="round"
          />
          <circle cx="18" cy="10" r="7" fill="#f4c78f" />
          <circle cx="82" cy="10" r="7" fill="#f4c78f" />
          <ellipse cx="50" cy="54" rx="43" ry="33" fill="#91d9be" />
          <ellipse cx="33" cy="46" rx="9" ry="12" fill="#34304c" />
          <ellipse cx="67" cy="46" rx="9" ry="12" fill="#34304c" />
          <circle cx="36" cy="42" r="3" fill="white" />
          <circle cx="70" cy="42" r="3" fill="white" />
          <path
            d="M38 65Q50 78 62 65"
            fill="none"
            stroke="#34304c"
            strokeWidth="4"
            strokeLinecap="round"
          />
          <ellipse cx="20" cy="61" rx="7" ry="4" fill="#e9acae" />
          <ellipse cx="80" cy="61" rx="7" ry="4" fill="#e9acae" />
        </svg>
        <span>I brought two bowls!</span>
      </div>
      <p>Tap or drag the berries into Momo’s picnic tray.</p>
      <div className="berry-bowls">
        <div className="berry-bowl">
          <div>{berries(0, sum.left)}</div>
          <b>{sum.left}</b>
        </div>
        <span className="addition-plus">+</span>
        <div className="berry-bowl">
          <div>{berries(sum.left, sum.right)}</div>
          <b>{sum.right}</b>
        </div>
      </div>
      <div
        className="picnic-tray"
        aria-label="Momo’s picnic tray"
        onDragOver={(e) => e.preventDefault()}
        onDrop={(e) => {
          e.preventDefault();
          const value = e.dataTransfer.getData("text/plain");
          if (!/^\d+$/.test(value)) return;
          const id = Number(value);
          if (id >= 0 && id < sum.total) add(id);
        }}
      >
        {moved.length ? (
          moved.map((id) => (
            <span key={id} className="tray-berry">
              🍓
            </span>
          ))
        ) : (
          <span>👇 Put the berries here</span>
        )}
      </div>
      <div
        className="addition-equation"
        aria-label={`${sum.left} plus ${sum.right}`}
      >
        {sum.left} <span>+</span> {sum.right} <span>=</span> ?
      </div>
      <p className="berry-counter" aria-live="polite">
        {moved.length === sum.total
          ? "All together! How many berries for Momo?"
          : `${moved.length} berries in the tray. Keep going!`}
      </p>
      <div className="puzzle-answers addition-answers">
        {sum.choices.map((value) => (
          <button
            disabled={moved.length !== sum.total}
            className={
              mistakes >= 2 && Number(value) === sum.total ? "hint-answer" : ""
            }
            key={value}
            onClick={() => {
              if (Number(value) === sum.total) {
                speak(
                  `Yum, yum! ${sum.left} and ${sum.right} make ${sum.total}. Thank you for helping Momo!`,
                );
                onCorrect();
              } else onWrong();
            }}
          >
            {value}
          </button>
        ))}
      </div>
      <button
        className="text-btn"
        onClick={() => {
          setMoved(Array.from({ length: sum.total }, (_, i) => i));
          speak(
            `Let's count the berries together. ${Array.from({ length: sum.total }, (_, i) => i + 1).join(". ")}. ${sum.left} plus ${sum.right} makes ${sum.total}. Now tap ${sum.total}.`,
          );
        }}
      >
        💛 Count with Pip
      </button>
    </div>
  );
}
