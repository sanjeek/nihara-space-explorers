import { store } from "./state";

import { chooseVoice, voiceDelivery, storySentences } from "./voice-options";
export { chooseVoice, englishVoices } from "./voice-options";
export type { VoiceStyle } from "./voice-options";
let generation = 0;
let timer: ReturnType<typeof setTimeout> | undefined;
let voiceListener: (() => void) | undefined;
let talking = false;
export function isNarrating() {
  return talking;
}
function supported() {
  return (
    typeof window !== "undefined" &&
    "speechSynthesis" in window &&
    "SpeechSynthesisUtterance" in window
  );
}
export function stopVoice() {
  generation++;
  clearTimeout(timer);
  if (supported()) {
    if (voiceListener)
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        voiceListener,
      );
    window.speechSynthesis.cancel();
  }
  voiceListener = undefined;
  talking = false;
}
export function speak(text: string) {
  stopVoice();
  if (!supported() || !store.get().settings.voice || !text.trim()) return;
  const token = generation,
    sentences = storySentences(text);
  let index = 0;
  talking = true;
  function next() {
    if (token !== generation) return;
    const settings = store.get().settings;
    if (index >= sentences.length || !settings.voice || document.hidden) {
      talking = false;
      return;
    }
    const utterance = new SpeechSynthesisUtterance(sentences[index++]);
    const voice = chooseVoice(
      window.speechSynthesis.getVoices(),
      settings.voiceURI,
    );
    if (voice) utterance.voice = voice;
    utterance.lang = voice?.lang || "en-AU";
    const delivery = voiceDelivery(settings.voiceStyle);
    utterance.rate = delivery.rate;
    utterance.pitch = delivery.pitch;
    utterance.volume = settings.voice;
    utterance.onend = () => {
      if (token === generation) timer = setTimeout(next, 180);
    };
    utterance.onerror = () => {
      if (token === generation) talking = false;
    };
    window.speechSynthesis.speak(utterance);
  }
  if (window.speechSynthesis.getVoices().length) {
    next();
    return;
  }
  // iOS may provide its installed voices shortly after the first interaction.
  let started = false;
  const begin = () => {
    if (started || token !== generation) return;
    started = true;
    clearTimeout(timer);
    if (voiceListener)
      window.speechSynthesis.removeEventListener(
        "voiceschanged",
        voiceListener,
      );
    voiceListener = undefined;
    next();
  };
  voiceListener = begin;
  window.speechSynthesis.addEventListener("voiceschanged", begin);
  timer = setTimeout(begin, 600);
}
