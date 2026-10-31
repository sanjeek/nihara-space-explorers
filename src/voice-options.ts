export type VoiceStyle = "storytime" | "cheerful";
export type VoiceInfo = Pick<
  SpeechSynthesisVoice,
  "voiceURI" | "name" | "lang" | "localService" | "default"
>;
export function englishVoices<T extends VoiceInfo>(voices: T[]): T[] {
  return voices.filter((v) => /^en(?:[-_]|$)/i.test(v.lang));
}
export function chooseVoice<T extends VoiceInfo>(
  voices: T[],
  preferred = "",
): T | undefined {
  const english = englishVoices(voices);
  const chosen = english.find((v) => v.voiceURI === preferred);
  if (chosen) return chosen;
  const score = (v: T) => {
    let n = /premium|enhanced|natural|neural/i.test(v.name + " " + v.voiceURI)
      ? 80
      : 0;
    if (
      /samantha|karen|serena|moira|aria|jenny|sonia|libby|ava|allison/i.test(
        v.name,
      )
    )
      n += 30;
    if (/^en[-_]AU$/i.test(v.lang)) n += 20;
    else if (/^en[-_]GB$/i.test(v.lang)) n += 12;
    else if (/^en[-_]US$/i.test(v.lang)) n += 10;
    if (v.localService) n += 8;
    if (v.default) n += 4;
    return n;
  };
  return [...english].sort((a, b) => score(b) - score(a))[0];
}
export function voiceDelivery(style: VoiceStyle) {
  return style === "cheerful"
    ? { rate: 1, pitch: 1.12 }
    : { rate: 0.94, pitch: 1.05 };
}
export function storySentences(text: string) {
  return (
    text
      .trim()
      .match(/[^.!?]+[.!?]+[”’"']?|[^.!?]+$/g)
      ?.map((s) => s.trim())
      .filter(Boolean) || []
  );
}
