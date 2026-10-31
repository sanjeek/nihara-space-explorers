import { test } from "node:test";
import assert from "node:assert/strict";
import { missions, questionFor, worldUnlocked } from "../src/missions.ts";
import { parseSave, store } from "../src/state.ts";
test("55 unique playable missions span all worlds and supported modes", () => {
  assert.equal(missions.length, 55);
  assert.equal(new Set(missions.map((m) => m.id)).size, 55);
  for (let w = 0; w < 5; w++) {
    const group = missions.filter((m) => m.world === w);
    assert.equal(group.length, 11);
    assert.equal(new Set(group.map((m) => m.mode)).size, 9);
    group.forEach((m) => {
      assert.ok(m.objective && m.instructions && m.learning);
      assert.ok(m.target > 0);
    });
  }
});
test("Every generated puzzle has a valid unique answer and counting stays age appropriate", () => {
  for (const m of missions.filter((m) =>
    ["count", "rescue", "pattern", "addition"].includes(m.mode),
  ))
    for (let r = 0; r < 3; r++) {
      const q = questionFor(m, r);
      assert.equal(q.choices.filter((c) => c === q.answer).length, 1);
      if (m.mode === "count") {
        assert.ok(Number(q.answer) >= 1 && Number(q.answer) < 10);
        assert.equal(q.visual.split(" ").length, Number(q.answer));
      }
    }
});
test("Worlds require the preceding ten missions, never just reward count", () => {
  assert.ok(worldUnlocked(0, []));
  assert.equal(worldUnlocked(1, [1, 2]), false);
  for (let w = 1; w < 5; w++) {
    const ids = Array.from({ length: 10 }, (_, i) => (w - 1) * 10 + i + 1);
    assert.ok(worldUnlocked(w, ids));
    assert.equal(worldUnlocked(w, ids.slice(1)), false);
  }
});
test("Corrupt saves recover, duplicate missions cannot inflate rewards, settings are bounded", () => {
  assert.equal(parseSave("{broken").profiles.length, 1);
  const v = parseSave(
    JSON.stringify({
      profiles: [{ done: [1, 1, 2, 99, -3], stars: 999, playSeconds: -2 }],
      settings: { music: 5, sound: -4, voice: "bad" },
    }),
  );
  assert.deepEqual(v.profiles[0].done, [1, 2]);
  assert.equal(v.profiles[0].stars, 6);
  assert.equal(v.profiles[0].playSeconds, 0);
  assert.equal(v.settings.music, 1);
  assert.equal(v.settings.sound, 0);
  assert.equal(v.settings.voice, 0.8);
});
test("Mission completion is idempotent and local profiles keep independent rewards", () => {
  store.complete(1);
  store.complete(1);
  store.complete(999);
  assert.equal(store.profile().stars, 3);
  store.add();
  assert.equal(store.profile().stars, 0);
  store.complete(2);
  assert.deepEqual(store.profile().done, [2]);
  store.switch("captain-1");
  assert.deepEqual(store.profile().done, [1]);
});

import {
  chooseVoice,
  voiceDelivery,
  storySentences,
} from "../src/voice-options.ts";
const sampleVoice = (name: string, lang: string, uri = name) => ({
  name,
  lang,
  voiceURI: uri,
  localService: true,
  default: false,
});
test("Narration favours enhanced English voices and honours the parent choice", () => {
  const standard = sampleVoice("Default voice", "en-US");
  const enhanced = sampleVoice(
    "Karen",
    "en-AU",
    "com.apple.voice.enhanced.en-AU.Karen",
  );
  const other = sampleVoice("Premium voice", "fr-FR");
  assert.equal(
    chooseVoice([standard, enhanced, other])?.voiceURI,
    enhanced.voiceURI,
  );
  assert.equal(
    chooseVoice([standard, enhanced], standard.voiceURI)?.voiceURI,
    standard.voiceURI,
  );
  assert.equal(chooseVoice([other]), undefined);
  assert.equal(
    chooseVoice([enhanced], "voice-no-longer-installed")?.voiceURI,
    enhanced.voiceURI,
  );
});
test("Narration has gentle, restrained delivery and sentence breaks", () => {
  assert.equal(voiceDelivery("storytime").rate, 0.94);
  assert.ok(voiceDelivery("cheerful").pitch < 1.2);
  assert.deepEqual(
    storySentences("Hello, Captain! Take your time. I'm here with you."),
    ["Hello, Captain!", "Take your time.", "I'm here with you."],
  );
  const old = parseSave(
    JSON.stringify({ profiles: [{ done: [1] }], settings: {} }),
  );
  assert.equal(old.settings.voiceStyle, "storytime");
  assert.equal(old.settings.voiceURI, "");
  const custom = parseSave(
    JSON.stringify({
      profiles: [{ done: [1] }],
      settings: { voiceStyle: "cheerful", voiceURI: "enhanced-karen" },
    }),
  );
  assert.equal(custom.settings.voiceStyle, "cheerful");
  assert.equal(custom.settings.voiceURI, "enhanced-karen");
});

import { additionFor } from "../src/missions.ts";
test("Every berry addition keeps both groups positive and the total strictly below ten", () => {
  for (const m of missions.filter((m) => m.mode === "addition"))
    for (let variation = 0; variation < 100; variation++)
      for (let r = 0; r < 3; r++) {
        const a = additionFor(m, r, variation);
        assert.ok(a.left >= 1 && a.right >= 1);
        assert.equal(a.left + a.right, a.total);
        assert.ok(a.total < 10);
        assert.equal(new Set(a.choices).size, 4);
        assert.equal(a.choices.filter((v) => Number(v) === a.total).length, 1);
        assert.ok(a.choices.every((v) => Number(v) >= 1 && Number(v) < 10));
      }
});
test("Original mission IDs and saved rewards survive the addition expansion", () => {
  assert.equal(missions[5].mode, "flight");
  assert.equal(missions[49].id, 50);
  assert.equal(missions[50].mode, "addition");
  const old = parseSave(
    JSON.stringify({ profiles: [{ done: [1, 6, 16, 50], stars: 12 }] }),
  );
  assert.deepEqual(old.profiles[0].done, [1, 6, 16, 50]);
  assert.equal(old.profiles[0].stars, 12);
  const updated = parseSave(JSON.stringify({ profiles: [{ done: [51, 55] }] }));
  assert.deepEqual(updated.profiles[0].done, [51, 55]);
});
