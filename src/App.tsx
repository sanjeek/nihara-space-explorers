import { useEffect, useRef, useState } from "react";
import Scene, { controlKey } from "./Scene";
import VoiceSettings from "./VoiceSettings";
import Puzzle from "./Puzzle";
import Playroom from "./Playroom";
import NextNumber from "./NextNumber";
import { missions, worlds, worldUnlocked, type Mission } from "./missions";
import { store, useSave } from "./state";
import { music, sound, speak, stopVoice } from "./audio";
type Route =
  | "bunny"
  | "bunny-worksheet"
  | "home"
  | "map"
  | "play"
  | "workshop"
  | "collection"
  | "lab"
  | "parent"
  | "settings";
const modeIcons: Record<string, string> = {
  flight: "🚀",
  explore: "👩‍🚀",
  count: "🔢",
  addition: "🍓",
  rescue: "👽",
  pattern: "🌈",
  sequence: "💡",
  sort: "🪨",
  workshop: "🛠️",
};
export default function App() {
  const saved = useSave(),
    p = saved.profiles.find((v) => v.id === saved.active)!;
  const [route, setRoute] = useState<Route>("home"),
    [world, setWorld] = useState(0),
    [mission, setMission] = useState<Mission>(missions[0]),
    [progress, setProgress] = useState(0),
    [won, setWon] = useState(false),
    [intro, setIntro] = useState(false),
    [gate, setGate] = useState(false),
    [gateValue, setGateValue] = useState(""),
    [parentOpen, setParentOpen] = useState(false),
    [confirm, setConfirm] = useState(false),
    [reminder, setReminder] = useState(false),
    [attempt, setAttempt] = useState(0),
    [practice, setPractice] = useState(false),
    [playLevel, setPlayLevel] = useState(0),
    [saveWarning, setSaveWarning] = useState(false);
  const sessionStart = useRef(Date.now()),
    gateQuestion = useRef([7, 8]);
  useEffect(() => {
    const timer = setInterval(() => {
      if (route === "play" && !won && !intro && !reminder && !document.hidden) {
        store.updateProfile({ playSeconds: store.profile().playSeconds + 10 });
        if (
          saved.settings.reminder &&
          Date.now() - sessionStart.current >= saved.settings.reminder * 60000
        )
          setReminder(true);
      }
      if (!store.storageAvailable) setSaveWarning(true);
    }, 10000);
    return () => clearInterval(timer);
  }, [route, won, intro, reminder, saved.settings.reminder]);
  useEffect(() => () => stopVoice(), []);
  function navigate(r: Route) {
    stopVoice();
    setRoute(r);
    window.scrollTo(0, 0);
    setWon(false);
    setIntro(false);
    sound();
  }
  function start(m: Mission, freePlay = false) {
    setPractice(freePlay);
    window.scrollTo(0, 0);
    setMission(m);
    setWorld(m.world);
    setProgress(0);
    setWon(false);
    setIntro(true);
    setAttempt((v) => v + 1);
    setRoute("play");
    speak(freePlay ? m.instructions : worlds[m.world].story);
  }
  function complete() {
    store.complete(mission.id);
    setWon(true);
    sound("win");
    speak(
      "Hooray, Captain " +
        p.name +
        "! What wonderful exploring! Three twinkly stars, just for you. I loved our little adventure together.",
    );
  }
  function askParent() {
    setGateValue("");
    setGate(true);
    gateQuestion.current = [
      6 + Math.floor(Math.random() * 4),
      6 + Math.floor(Math.random() * 4),
    ];
  }
  const [a, b] = gateQuestion.current;
  const next = missions[mission.id];
  const canNext = next && worldUnlocked(next.world, p.done);
  const total =
    mission.mode === "flight" || mission.mode === "explore"
      ? mission.target
      : 3;
  const topicCounts = [
    ...new Set(p.done.map((id) => missions[id - 1].learning)),
  ];
  return (
    <div
      className={
        "app " + (saved.settings.reducedMotion ? "reduced-motion" : "")
      }
      onPointerDown={() => {
        music();
      }}
    >
      <header className="header">
        <button className="wordmark" onClick={() => navigate("home")}>
          <span className="brand-symbol">✦</span>
          <span>
            <b>
              Nihara
            </b>
            <small>SPACE EXPLORERS</small>
          </span>
        </button>
        <nav>
          <button
            className={route === "map" ? "selected" : ""}
            onClick={() => navigate("map")}
          >
            Adventure map
          </button>
          <button
            className={route === "workshop" ? "selected" : ""}
            onClick={() => navigate("workshop")}
          >
            Rocket workshop
          </button>
          <button
            className={route === "collection" ? "selected" : ""}
            onClick={() => navigate("collection")}
          >
            My collection
          </button>
        </nav>
        <div className="header-right">
          <span className="star-bank">✦ {p.stars}</span>
          <button
            className="circle-btn"
            aria-label="Settings"
            onClick={() => navigate("settings")}
          >
            ⚙
          </button>
          <button
            className="avatar"
            aria-label="Parent area"
            onClick={askParent}
          >
            👩‍🚀
          </button>
        </div>
      </header>
      {route !== "play" && (
        <nav className="mobile-nav" aria-label="Main menu">
          {(
            [
              ["home", "⌂", "Home"],
              ["map", "🪐", "Explore"],
              ["workshop", "🚀", "Rocket"],
              ["collection", "🏅", "Collection"],
              ["lab", "🔭", "Lab"],
            ] as const
          ).map(([r, icon, label]) => (
            <button
              key={r}
              className={route === r ? "selected" : ""}
              onClick={() => navigate(r)}
            >
              <span>{icon}</span>
              {label}
            </button>
          ))}
        </nav>
      )}
      {route === "bunny" || route === "bunny-worksheet" ? (
        <NextNumber key={p.id + route} worksheet={route === "bunny-worksheet"} onExit={() => navigate("home")} />
      ) : route === "home" ? (
        <>
          <main className="home">
            <button className="bunny-entry" onClick={() => navigate("bunny")}>
              <span aria-hidden="true">🐰</span><span><strong>Baby Bunny: One Hop</strong><small>Phase 1 · Numbers 1–15 · {p.bunnyDone.length} / 70 complete</small></span><span>Let’s hop →</span>
            </button>
            <button className="bunny-entry" onClick={() => navigate("bunny-worksheet")}>
              <span aria-hidden="true">📝</span><span><strong>20 Add-One Questions</strong><small>Like a little workbook · 2 + 1 = ? · Answers below 15</small></span><span>Try now →</span>
            </button>
            <Playroom
              name={p.name}
              onPlay={(m) => start(m, true)}
              level={playLevel}
              onLevel={setPlayLevel}
            />
            <div className="hero">
              <div className="hero-copy">
                <span className="eyebrow">
                  <span className="live-dot" /> LITTLE ASTRONAUT ACADEMY
                </span>
                <h1>
                  Small astronaut.
                  <br />A <em>big</em> universe.
                </h1>
                <p>
                  Hey, Captain {p.name}! A galaxy of little wonders is waiting.
                  Hop in your rocket. Let’s see what’s out there.
                </p>
                <button
                  className="primary launch"
                  onClick={() => navigate("map")}
                >
                  Let’s explore <span>↗</span>
                </button>
                <div className="hero-note">
                  <span>✧</span> Big adventures. Little steps. Endless wonder.
                </div>
              </div>
              <div className="hero-scene">
                <Scene />
                <span className="planet-note">📍 Somewhere wonderful</span>
                <span className="orbit-note">
                  YOUR NEXT ADVENTURE
                  <br />
                  <b>Earth & Moon</b>
                </span>
              </div>
            </div>
            <section className="adventure-section">
              <div className="section-heading">
                <div>
                  <span className="eyebrow">WHERE WILL YOU GO TODAY?</span>
                  <h2>Your universe, waiting to be explored.</h2>
                </div>
                <button className="text-btn" onClick={() => navigate("map")}>
                  See all worlds ↗
                </button>
              </div>
              <div className="world-grid">
                {worlds.map((w, i) => (
                  <button
                    className={"world-card world-" + i}
                    key={w.name}
                    onClick={() => {
                      setWorld(i);
                      navigate("map");
                    }}
                  >
                    <div className="world-art">
                      <div
                        className="css-planet"
                        style={{ background: w.color }}
                      >
                        {i === 0 ? "🌍" : i === 4 ? "✦" : ""}
                      </div>
                      {i === 2 || i === 3 ? (
                        <span className="css-ring" />
                      ) : null}
                      <span className="card-spark">✧</span>
                      <span className="world-lock">
                        {worldUnlocked(i, p.done) ? "↗" : "🔒"}
                      </span>
                    </div>
                    <div className="world-description">
                      <span className="eyebrow">WORLD 0{i + 1}</span>
                      <h3>{w.name}</h3>
                      <p>{w.description}</p>
                      <span className="mission-count">
                        {
                          p.done.filter(
                            (id) => id <= 50 && missions[id - 1].world === i,
                          ).length
                        }{" "}
                        / 10 missions <span>•••</span>
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </section>
            <section className="feature-row">
              <button
                onClick={() => {
                  const m =
                    missions.find(
                      (m) =>
                        worldUnlocked(m.world, p.done) &&
                        !p.done.includes(m.id),
                    ) || missions[0];
                  start(m);
                }}
              >
                <span>🚀</span>
                <div>
                  <h3>A little mission, a big smile.</h3>
                  <p>Jump into a quick space adventure.</p>
                </div>
                <b>↗</b>
              </button>
              <button onClick={() => navigate("lab")}>
                <span>🔭</span>
                <div>
                  <h3>Curiosity looks good on you.</h3>
                  <p>Visit the Space Discovery Lab.</p>
                </div>
                <b>↗</b>
              </button>
            </section>
          </main>
          <footer>
            <span>MADE FOR LITTLE EXPLORERS, AGES 5–7</span>
            <button onClick={askParent}>Parent area ↗</button>
            <span>✦ No ads. Just adventures.</span>
          </footer>
        </>
      ) : null}
      {route === "map" && (
        <main className="page">
          <div className="page-title">
            <div>
              <span className="eyebrow">YOUR ADVENTURE ATLAS</span>
              <h1>Pick a little world.</h1>
              <p>
                Ten missions. One wonderful adventure. Complete a world to
                unlock the next.
              </p>
            </div>
            <button className="text-btn" onClick={() => navigate("home")}>
              ← Home
            </button>
          </div>
          <div className="world-tabs">
            {worlds.map((w, i) => (
              <button
                key={w.name}
                className={world === i ? "chosen" : ""}
                onClick={() => setWorld(i)}
              >
                {w.icon} {w.name} {!worldUnlocked(i, p.done) && "🔒"}
              </button>
            ))}
          </div>
          <div
            className="world-banner"
            style={{ borderColor: worlds[world].color }}
          >
            <span>{worlds[world].icon}</span>
            <div>
              <h2>{worlds[world].name}</h2>
              <p>{worlds[world].story}</p>
              <button
                className="text-btn"
                onClick={() => speak(worlds[world].story)}
              >
                🔊 Listen to the story
              </button>
            </div>
          </div>
          {worldUnlocked(world, p.done) ? (
            <div className="mission-grid">
              {missions
                .filter((m) => m.world === world)
                .map((m) => (
                  <button
                    data-mission={m.id}
                    className={
                      "mission-card " +
                      (p.done.includes(m.id) ? "complete" : "")
                    }
                    key={m.id}
                    onClick={() => start(m)}
                  >
                    <span className="mission-number">
                      {String(m.id).padStart(2, "0")}
                    </span>
                    <span className="mission-icon">{modeIcons[m.mode]}</span>
                    <h3>{m.title}</h3>
                    <p>{m.learning}</p>
                    <small>
                      {p.done.includes(m.id)
                        ? "★ ★ ★ · Play again"
                        : "☆ ☆ ☆ · Let’s go"}{" "}
                      <b>↗</b>
                    </small>
                  </button>
                ))}
            </div>
          ) : (
            <div className="empty-state">
              <span>🔐</span>
              <h2>A new world is just ahead.</h2>
              <p>
                Complete all ten missions in {worlds[world - 1].name} to unlock
                this adventure.
              </p>
              <button className="primary" onClick={() => setWorld(world - 1)}>
                Back to {worlds[world - 1].name}
              </button>
            </div>
          )}
        </main>
      )}
      {route === "play" && (
        <main className="play-page">
          <div className="play-heading">
            <button
              className="circle-btn"
              aria-label={practice ? "Back to playroom" : "Return to missions"}
              onClick={() => navigate(practice ? "home" : "map")}
            >
              ←
            </button>
            <div>
              <small>
                {practice
                  ? "PLAYTIME · PIP’S LITTLE GAMES"
                  : `MISSION ${mission.id} · ${worlds[mission.world].name}`}
              </small>
              <h2>{mission.title}</h2>
            </div>
            <button
              className="circle-btn"
              aria-label="Hear mission instructions"
              onClick={() => speak(mission.instructions)}
            >
              🔊
            </button>
            <button
              className="circle-btn"
              aria-label="Restart mission"
              onClick={() => {
                setProgress(0);
                setWon(false);
                setAttempt((v) => v + 1);
              }}
            >
              ↻
            </button>
          </div>
          <div
            className={
              "game-stage " +
              (!["flight", "explore"].includes(mission.mode)
                ? "puzzle-stage"
                : "")
            }
          >
            <Scene
              key={mission.id + "-" + attempt}
              mission={
                mission.mode === "flight" || mission.mode === "explore"
                  ? mission
                  : undefined
              }
              onProgress={setProgress}
              onComplete={complete}
              paused={intro || won || reminder}
            />
            <div className="mission-hud">
              <span>
                {mission.mode === "flight"
                  ? "◎ Rings"
                  : mission.mode === "explore"
                    ? "💎 Crystals"
                    : "✦ Challenges"}{" "}
                {Math.min(progress, total)} / {total}
              </span>
              <div className="progress-track">
                <i
                  style={{ width: Math.min(progress / total, 1) * 100 + "%" }}
                />
              </div>
            </div>
            {!["flight", "explore"].includes(mission.mode) &&
              !intro &&
              !won && (
                <Puzzle
                  key={mission.id + "-" + attempt}
                  mission={mission}
                  variation={practice ? attempt : 0}
                  onProgress={setProgress}
                  onComplete={complete}
                />
              )}
            {["flight", "explore"].includes(mission.mode) && !intro && !won && (
              <>
                <div className="play-caption">
                  {mission.mode === "flight"
                    ? "👆 Drag to steer · Fly through the golden rings"
                    : progress < mission.target
                      ? "👆 Tap the ground or use arrows · Find the crystals"
                      : "👽 All crystals found! Walk to your alien friend."}
                </div>
                <div className="direction-pad">
                  {[
                    ["ArrowLeft", "←"],
                    ["ArrowUp", "↑"],
                    ["ArrowDown", "↓"],
                    ["ArrowRight", "→"],
                  ].map(([key, label]) => (
                    <button
                      key={key}
                      aria-label={key}
                      onPointerDown={(e) => {
                        e.preventDefault();
                        e.currentTarget.setPointerCapture(e.pointerId);
                        controlKey(key, true);
                      }}
                      onPointerUp={() => controlKey(key, false)}
                      onPointerCancel={() => controlKey(key, false)}
                      onLostPointerCapture={() => controlKey(key, false)}
                    >
                      {label}
                    </button>
                  ))}
                </div>
              </>
            )}
            {intro && (
              <div className="overlay">
                <article className="modal">
                  <span className="big-emoji">{modeIcons[mission.mode]}</span>
                  <span className="eyebrow">
                    {practice
                      ? `PLAY WITH PIP · ${p.name.toUpperCase()}`
                      : `CAPTAIN ${p.name.toUpperCase()} · MISSION ${mission.id}`}
                  </span>
                  <h2>{mission.title}</h2>
                  <p>{mission.instructions}</p>
                  <p className="story-excerpt">
                    {practice
                      ? "One little activity at a time. No hurry. Pip is here to help."
                      : worlds[mission.world].story}
                  </p>
                  <button
                    className="text-btn"
                    onClick={() =>
                      speak(
                        mission.instructions +
                          " " +
                          (practice
                            ? "Take your time. I’m right here with you."
                            : worlds[mission.world].story),
                      )
                    }
                  >
                    🔊 Read aloud
                  </button>
                  <button
                    className="primary"
                    onClick={() => {
                      setIntro(false);
                      stopVoice();
                      speak(mission.instructions);
                    }}
                  >
                    Ready, Captain! 🚀
                  </button>
                </article>
              </div>
            )}
            {won && (
              <div className="overlay">
                <article className="modal celebration">
                  <span className="big-emoji">🏅</span>
                  <span className="eyebrow">
                    A LITTLE BRAVER. A LITTLE BRIGHTER.
                  </span>
                  <h2>You did it, Captain!</h2>
                  <div className="earned-stars">★ ★ ★</div>
                  <p>
                    {mission.title} complete.
                    <br />
                    Your progress is saved automatically.
                  </p>
                  {mission.id % 10 === 0 && (
                    <p className="unlock-note">
                      {mission.id < 50
                        ? "🎉 New world unlocked: " +
                          worlds[mission.world + 1].name
                        : "🌟 You’re a Junior Space Captain! All five worlds explored."}
                    </p>
                  )}
                  <button
                    className="primary"
                    onClick={() =>
                      practice
                        ? navigate("home")
                        : canNext
                          ? start(next)
                          : navigate(next ? "map" : "collection")
                    }
                  >
                    {practice
                      ? "Choose another game →"
                      : canNext
                        ? "Next adventure →"
                        : next
                          ? "Back to this world →"
                          : "See my collection →"}
                  </button>
                  <button
                    className="text-btn"
                    onClick={() =>
                      practice ? start(mission, true) : navigate("map")
                    }
                  >
                    {practice ? "Play this game again" : "Back to mission map"}
                  </button>
                </article>
              </div>
            )}
          </div>
        </main>
      )}
      {route === "workshop" && (
        <main className="page">
          <div className="page-title">
            <div>
              <span className="eyebrow">BUILT BY A LITTLE DREAMER</span>
              <h1>Your rocket. Your rules.</h1>
              <p>Decorate your spaceship with rewards earned through play.</p>
            </div>
          </div>
          <div className="workshop-layout">
            <div className="workshop-scene">
              <Scene />
            </div>
            <div className="panel">
              <h2>🎨 A splash of colour</h2>
              <div className="colour-options">
                {["#ad9af4", "#f4be76", "#79d8cc", "#f499b9"].map((c, i) => (
                  <button
                    aria-label={
                      [
                        "Purple rocket",
                        "Orange rocket",
                        "Mint rocket",
                        "Pink rocket",
                      ][i]
                    }
                    disabled={i > 0 && p.stars < i * 6}
                    key={c}
                    className={p.colour === c ? "chosen" : ""}
                    style={{ background: c }}
                    onClick={() => store.updateProfile({ colour: c })}
                  >
                    {p.stars < i * 6 ? "🔒" : p.colour === c ? "✓" : ""}
                    <small>{i > 0 ? i * 6 + " ✦" : "Free"}</small>
                  </button>
                ))}
              </div>
              <h2>🚀 Fancy fins</h2>
              <div className="fin-options">
                {["round", "pointy"].map((f) => (
                  <button
                    className={p.fin === f ? "chosen" : ""}
                    key={f}
                    disabled={f === "pointy" && p.stars < 9}
                    onClick={() =>
                      store.updateProfile({ fin: f as "round" | "pointy" })
                    }
                  >
                    {f === "round" ? "● Round" : "▲ Pointy · 9 ✦"}
                  </button>
                ))}
              </div>
              <h2>✧ A little personality</h2>
              <div className="sticker-options">
                {["⭐", "🌙", "🌸", "🚀"].map((v, i) => (
                  <button
                    key={v}
                    disabled={p.stars < i * 9}
                    className={p.sticker === v ? "chosen" : ""}
                    onClick={() => store.updateProfile({ sticker: v })}
                  >
                    {v}
                    <small>{i * 9} ✦</small>
                  </button>
                ))}
              </div>
              <h2>👩‍🚀 Astronaut suit</h2>
              <div className="colour-options">
                {["#f4be76", "#79d8cc", "#ad9af4"].map((c, i) => (
                  <button
                    key={c}
                    aria-label={["Orange suit", "Mint suit", "Purple suit"][i]}
                    style={{ background: c }}
                    className={p.suit === c ? "chosen" : ""}
                    disabled={p.stars < i * 6}
                    onClick={() => store.updateProfile({ suit: c })}
                  >
                    {p.suit === c ? "✓" : ""}
                    <small>{i * 6} ✦</small>
                  </button>
                ))}
              </div>
              <p className="subtle">
                Unlocks are permanent. Stars are never spent.
              </p>
              <div className="rocket-sticker">Your sticker: {p.sticker}</div>
            </div>
          </div>
        </main>
      )}
      {route === "collection" && (
        <main className="page">
          <span className="eyebrow">LITTLE MOMENTS. BIG ACHIEVEMENTS.</span>
          <h1>Your space collection.</h1>
          <p>
            {p.done.length} missions explored · {p.stars} stars earned
          </p>
          <div className="collection-grid">
            {worlds.map((w, i) => {
              const n = p.done.filter(
                (id) => id <= 50 && missions[id - 1].world === i,
              ).length;
              return (
                <article
                  key={w.name}
                  className={"panel badge-card " + (n === 10 ? "unlocked" : "")}
                >
                  <span>{n === 10 ? "🏅" : w.icon}</span>
                  <h2>{w.name}</h2>
                  <p>
                    {n === 10
                      ? "World explorer badge earned!"
                      : n + " / 10 missions to your badge"}
                  </p>
                  <div className="progress-track">
                    <i style={{ width: n * 10 + "%" }} />
                  </div>
                </article>
              );
            })}
          </div>
          <button className="primary" onClick={() => navigate("map")}>
            Find my next adventure ↗
          </button>
        </main>
      )}
      {route === "lab" && (
        <main className="page">
          <span className="eyebrow">QUESTIONS ARE WHERE ADVENTURES BEGIN</span>
          <h1>Space Discovery Lab.</h1>
          <p>
            Tap a discovery to hear its story. Real science and imagination,
            clearly marked.
          </p>
          <div className="collection-grid">
            {worlds.map((w, i) => (
              <button
                className="panel fact-card"
                key={w.name}
                onClick={() => speak(w.fact)}
              >
                <span>{w.icon}</span>
                <small>
                  {i === 4 ? "IMAGINATION CORNER" : "REAL SPACE SCIENCE"}
                </small>
                <h2>{w.name}</h2>
                <p>{w.fact}</p>
                <b>🔊 Listen</b>
              </button>
            ))}
          </div>
        </main>
      )}
      {route === "settings" && (
        <main className="page settings-page">
          <span className="eyebrow">MAKE YOURSELF AT HOME</span>
          <h1>Your kind of universe.</h1>
          <div className="panel">
            {(["music", "sound", "voice"] as const).map((key) => (
              <label className="setting" key={key}>
                <span>
                  {key === "music"
                    ? "🎵 Music"
                    : key === "sound"
                      ? "✧ Sound effects"
                      : "🔊 Spoken guidance"}
                </span>
                <input
                  aria-label={key + " volume"}
                  type="range"
                  min="0"
                  max="1"
                  step=".05"
                  value={saved.settings[key]}
                  onChange={(e) => {
                    store.settings({ [key]: Number(e.target.value) });
                    if (key === "voice" && Number(e.target.value) === 0)
                      stopVoice();
                  }}
                />
              </label>
            ))}
            <button
              className="secondary"
              onClick={() => {
                store.settings({ music: 0, sound: 0, voice: 0 });
                stopVoice();
              }}
            >
              Mute everything
            </button>
            <VoiceSettings />
            <label className="setting">
              <span>Gentle motion</span>
              <input
                type="checkbox"
                checked={saved.settings.reducedMotion}
                onChange={(e) =>
                  store.settings({ reducedMotion: e.target.checked })
                }
              />
            </label>
            <label className="setting">
              <span>Lightweight graphics</span>
              <input
                type="checkbox"
                checked={saved.settings.quality === "low"}
                onChange={(e) =>
                  store.settings({ quality: e.target.checked ? "low" : "high" })
                }
              />
            </label>
            <label className="setting">
              <span>Extra flying assistance</span>
              <input
                type="checkbox"
                checked={saved.settings.assistance}
                onChange={(e) =>
                  store.settings({ assistance: e.target.checked })
                }
              />
            </label>
            <p className="subtle">
              Every spoken instruction also appears on screen. All puzzles have
              unlimited retries. Voice availability depends on your browser.
            </p>
          </div>
        </main>
      )}
      {route === "parent" && parentOpen && (
        <main className="page">
          <span className="eyebrow">FOR YOUR LITTLE EXPLORER’S GROWN-UP</span>
          <h1>Mission control.</h1>
          <div className="parent-grid">
            <section className="panel">
              <h2>Local captains</h2>
              <div className="profile-options">
                {saved.profiles.map((profile) => (
                  <button
                    className={saved.active === profile.id ? "chosen" : ""}
                    onClick={() => store.switch(profile.id)}
                    key={profile.id}
                  >
                    👩‍🚀 {profile.name}
                  </button>
                ))}
              </div>
              <button
                className="secondary"
                disabled={saved.profiles.length >= 4}
                onClick={() => store.add()}
              >
                + Add local profile
              </button>
              <label className="setting">
                Captain name
                <input
                  maxLength={18}
                  aria-label="Captain name"
                  value={p.name}
                  onChange={(e) =>
                    store.updateProfile({ name: e.target.value })
                  }
                />
              </label>
              <p className="subtle">
                A nickname is enough. No accounts, emails, or personal details
                are needed.
              </p>
            </section>
            <section className="panel">
              <h2>{p.name}’s discoveries</h2>
              <div className="stats">
                <span>
                  <b>{p.done.length}/55</b>Missions
                </span>
                <span>
                  <b>{p.stars}</b>Stars
                </span>
                <span>
                  <b>{Math.floor(p.playSeconds / 60)}m</b>Playtime
                </span>
              </div>
              <p>
                {topicCounts.length
                  ? topicCounts.join(" · ")
                  : "Learning topics appear after a mission is completed."}
              </p>
              <label className="setting">
                Break reminder
                <select
                  value={saved.settings.reminder}
                  onChange={(e) => {
                    store.settings({ reminder: Number(e.target.value) });
                    sessionStart.current = Date.now();
                  }}
                >
                  {[0, 5, 10, 15].map((n) => (
                    <option key={n} value={n}>
                      {n ? n + " minutes" : "Off"}
                    </option>
                  ))}
                </select>
              </label>
              <button className="text-btn" onClick={() => navigate("settings")}>
                Sound & accessibility →
              </button>
            </section>
            <section className="panel">
              <h2>Privacy, simply.</h2>
              <p>
                Progress stays in this browser. There are no ads, purchases,
                analytics, chat, or online profiles. Clearing browser data
                removes local saves. Offline play works after the production
                game has loaded and cached once.
              </p>
              <button className="danger" onClick={() => setConfirm(true)}>
                Reset this captain’s progress
              </button>
              {confirm && (
                <div className="confirm-box">
                  <p>
                    Reset {p.name}’s missions, rewards, and customisations? This
                    cannot be undone.
                  </p>
                  <button
                    className="danger"
                    onClick={() => {
                      store.reset();
                      setConfirm(false);
                    }}
                  >
                    Yes, reset this profile
                  </button>
                  <button
                    className="secondary"
                    onClick={() => setConfirm(false)}
                  >
                    Keep my progress
                  </button>
                </div>
              )}
            </section>
          </div>
        </main>
      )}
      {gate && (
        <div className="overlay global-overlay">
          <article className="modal">
            <span className="big-emoji">🧑‍🚀</span>
            <h2>A little grown-up check.</h2>
            <p>
              Ask a grown-up to answer: {a} × {b}
            </p>
            <input
              type="number"
              aria-label="Grown-up answer"
              value={gateValue}
              onChange={(e) => setGateValue(e.target.value)}
            />
            <button
              className="primary"
              onClick={() => {
                if (Number(gateValue) === a * b) {
                  setParentOpen(true);
                  setGate(false);
                  navigate("parent");
                } else {
                  setGateValue("");
                  speak("Ask a grown-up to help.");
                }
              }}
            >
              Open mission control
            </button>
            <button className="text-btn" onClick={() => setGate(false)}>
              Back to adventure
            </button>
          </article>
        </div>
      )}
      {reminder && (
        <div className="overlay global-overlay">
          <article className="modal">
            <span className="big-emoji">🌱</span>
            <h2>Even captains need a stretch.</h2>
            <p>Your adventure will be here when you come back.</p>
            <button
              className="primary"
              onClick={() => {
                sessionStart.current = Date.now();
                setReminder(false);
              }}
            >
              I’m ready to continue
            </button>
            <button
              className="text-btn"
              onClick={() => {
                setReminder(false);
                navigate("home");
              }}
            >
              Take a break
            </button>
          </article>
        </div>
      )}
      {saveWarning && (
        <div className="save-warning" role="status">
          Progress cannot be saved in this browser. Play still works; ask a
          grown-up to enable browser storage.
        </div>
      )}
    </div>
  );
}
