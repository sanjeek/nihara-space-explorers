import type { CSSProperties } from "react";
import { missions, type Mission, type Mode } from "./missions";
import { speak } from "./audio";
const games: {
  mode: Mode;
  icon: string;
  name: string;
  detail: string;
  color: string;
}[] = [
  {
    mode: "addition",
    icon: "🍓",
    name: "Feed Momo",
    detail: "Add two little bowls · totals below 10",
    color: "#f5adc0",
  },
  {
    mode: "count",
    icon: "💎",
    name: "Treasure count",
    detail: "Find and count up to 9 treasures",
    color: "#88d9dd",
  },
  {
    mode: "rescue",
    icon: "👽",
    name: "Help a friend",
    detail: "Match the shapes. Bring a friend home.",
    color: "#a6dcb8",
  },
  {
    mode: "pattern",
    icon: "🌈",
    name: "Rainbow trails",
    detail: "What comes next? Find the pattern.",
    color: "#d8b1f2",
  },
  {
    mode: "sequence",
    icon: "💡",
    name: "Pip’s light song",
    detail: "Watch, remember, and tap the lights.",
    color: "#efcf84",
  },
  {
    mode: "sort",
    icon: "🪨",
    name: "Little to big",
    detail: "Put the space pebbles in order.",
    color: "#bdc8e3",
  },
  {
    mode: "workshop",
    icon: "🛠️",
    name: "Rocket maker",
    detail: "Colours, shapes, and a rocket to build.",
    color: "#f1bf94",
  },
  {
    mode: "flight",
    icon: "🚀",
    name: "Ready, steady, fly!",
    detail: "Steer your rocket through starry rings.",
    color: "#a9b6ef",
  },
  {
    mode: "explore",
    icon: "👩‍🚀",
    name: "A little moonwalk",
    detail: "Walk, find treasures, and meet an alien.",
    color: "#b8d5a2",
  },
];
export default function Playroom({
  name,
  onPlay,
  level,
  onLevel,
}: {
  name: string;
  onPlay: (m: Mission) => void;
  level: number;
  onLevel: (value: number) => void;
}) {
  return (
    <section className="playroom" aria-label="Choose a game">
      <div className="playroom-welcome">
        <div className="pip-friend" aria-hidden="true">
          <span>● ●</span>
          <b>ᴗ</b>
        </div>
        <div>
          <span className="eyebrow">A LITTLE PLAY. A LITTLE DISCOVERY.</span>
          <h1>{name}, let’s play!</h1>
          <p>Pick anything you love. I’m right here with you.</p>
        </div>
        <button
          className="circle-btn"
          aria-label="Hear Pip’s welcome"
          onClick={() =>
            speak(
              `Hello, ${name}! It's Pip! Pick any game you like. We can feed Momo some berries, make a rainbow, or take our rocket for a little spin. Take your time, and have fun!`,
            )
          }
        >
          🔊
        </button>
      </div>
      <div className="play-levels" aria-label="Choose activity difficulty">
        {[
          "🌱 Little steps",
          "🌼 Growing explorer",
          "🌟 Ready for a challenge",
        ].map((label, i) => (
          <button
            key={label}
            aria-pressed={level === i}
            className={level === i ? "chosen" : ""}
            onClick={() => onLevel(i)}
          >
            {label}
          </button>
        ))}
      </div>
      <div className="playroom-games">
        {games.map((game) => (
          <button
            key={game.mode}
            className="playroom-game"
            style={{ "--game-color": game.color } as CSSProperties}
            onClick={() =>
              onPlay(
                missions.find(
                  (m) => m.mode === game.mode && m.world === [0, 2, 4][level],
                )!,
              )
            }
          >
            <span className="playroom-icon">{game.icon}</span>
            <h2>{game.name}</h2>
            <p>{game.detail}</p>
            <span className="play-now">Let’s play →</span>
          </button>
        ))}
      </div>
      <p className="playroom-note">
        💛 No lives to lose. No rushing. Try, giggle, and try again.
      </p>
    </section>
  );
}
