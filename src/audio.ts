import { store } from "./state";
import { isNarrating, stopVoice } from "./voice";
export { speak, stopVoice } from "./voice";
let ctx: AudioContext | undefined;
let musicTimer: ReturnType<typeof setInterval> | undefined;
let note = 0;
function context() {
  try {
    ctx ??= new AudioContext();
    if (ctx.state === "suspended") void ctx.resume().catch(() => {});
    return ctx;
  } catch {
    return undefined;
  }
}
function tone(
  hz: number,
  duration: number,
  volume: number,
  type: OscillatorType = "sine",
) {
  const c = context();
  if (!c || volume === 0) return;
  const o = c.createOscillator(),
    g = c.createGain();
  o.type = type;
  o.frequency.value = hz;
  g.gain.setValueAtTime(0, c.currentTime);
  g.gain.linearRampToValueAtTime(volume * 0.16, c.currentTime + 0.02);
  g.gain.exponentialRampToValueAtTime(0.001, c.currentTime + duration);
  o.connect(g);
  g.connect(c.destination);
  o.start();
  o.stop(c.currentTime + duration + 0.05);
}
export function sound(kind: "star" | "bump" | "win" | "tap" = "tap") {
  const v = store.get().settings.sound;
  if (kind === "win") {
    [523, 659, 784, 1046].forEach((f, i) =>
      setTimeout(() => tone(f, 0.3, v), i * 120),
    );
  } else tone(kind === "star" ? 880 : kind === "bump" ? 160 : 440, 0.2, v);
}
export function music() {
  if (musicTimer) return;
  context();
  musicTimer = setInterval(() => {
    if (document.hidden) return;
    const melody = [261, 329, 392, 329, 293, 349, 440, 392];
    tone(
      melody[note++ % melody.length],
      0.65,
      store.get().settings.music * (isNarrating() ? 0.25 : 1),
    );
  }, 700);
}
document.addEventListener("visibilitychange", () => {
  if (document.hidden) {
    stopVoice();
    void ctx?.suspend();
  } else if (ctx?.state === "suspended") void ctx.resume().catch(() => {});
});
