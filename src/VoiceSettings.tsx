import { useEffect, useState } from "react";
import { useSave, store } from "./state";
import {
  chooseVoice,
  englishVoices,
  speak,
  stopVoice,
  type VoiceStyle,
} from "./voice";
export default function VoiceSettings() {
  const { settings } = useSave();
  const [voices, setVoices] = useState<SpeechSynthesisVoice[]>([]);
  const supported =
    "speechSynthesis" in window && "SpeechSynthesisUtterance" in window;
  useEffect(() => {
    if (!supported) return;
    const update = () =>
      setVoices(englishVoices(window.speechSynthesis.getVoices()));
    update();
    window.speechSynthesis.addEventListener("voiceschanged", update);
    return () => {
      window.speechSynthesis.removeEventListener("voiceschanged", update);
      stopVoice();
    };
  }, [supported]);
  const current = chooseVoice(voices, settings.voiceURI);
  const available = voices.some((v) => v.voiceURI === settings.voiceURI);
  return (
    <section className="voice-settings" aria-label="Pip’s friendly voice">
      <h2>💛 Meet Pip, your space buddy</h2>
      <p>
        A gentle storyteller or a cheerful little adventure? Choose the voice
        she loves.
      </p>
      <label className="setting">
        <span>Narration style</span>
        <select
          aria-label="Narration style"
          value={settings.voiceStyle}
          onChange={(e) => {
            stopVoice();
            store.settings({ voiceStyle: e.target.value as VoiceStyle });
          }}
        >
          <option value="storytime">Gentle storytime</option>
          <option value="cheerful">Cheerful explorer</option>
        </select>
      </label>
      <label className="setting">
        <span>Storyteller voice</span>
        <select
          aria-label="Storyteller voice"
          value={available ? settings.voiceURI : ""}
          disabled={!supported}
          onChange={(e) => {
            stopVoice();
            store.settings({ voiceURI: e.target.value });
          }}
        >
          <option value="">Choose a friendly voice for me</option>
          {voices.map((v) => (
            <option value={v.voiceURI} key={v.voiceURI}>
              {v.name} · {v.lang}
            </option>
          ))}
        </select>
      </label>
      <div className="voice-preview">
        <button
          className="secondary"
          disabled={!supported || !settings.voice}
          onClick={() =>
            speak(
              `Hello, Captain ${store.profile().name}! I'm Pip, your little space buddy. Look at those twinkly stars! Shall we go on a lovely adventure together? Take your time. I'll be right here with you.`,
            )
          }
        >
          ▶ Hear Pip’s voice
        </button>
        <button className="text-btn" onClick={stopVoice}>
          ■ Stop
        </button>
      </div>
      <p className="subtle">
        {!supported
          ? "Read-aloud isn’t available in this browser. The written story and instructions are always here."
          : !settings.voice
            ? "Turn up Spoken guidance to hear the preview."
            : current
              ? `Ready to read with ${current.name}.`
              : "Your device’s English voice will read the story. Voices may take a moment to appear."}
      </p>
      <p className="subtle">
        For a richer voice on iPhone, a grown-up can download an enhanced
        English voice in iPhone Settings → Accessibility → Read & Speak (or
        Spoken Content) → Voices. Return here and try it. Available voices and
        their sound depend on the device.
      </p>
    </section>
  );
}
