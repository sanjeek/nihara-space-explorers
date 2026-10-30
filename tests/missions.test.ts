import { test } from "node:test";
import assert from "node:assert/strict";
import { missions, questionFor, worldUnlocked } from "../src/missions.ts";
import { parseSave, store } from "../src/state.ts";
test("50 unique playable missions span all worlds and supported modes", () => {
  assert.equal(missions.length, 50);
  assert.equal(new Set(missions.map((m) => m.id)).size, 50);
  for (let w = 0; w < 5; w++) {
    const group = missions.filter((m) => m.world === w);
    assert.equal(group.length, 10);
    assert.equal(new Set(group.map((m) => m.mode)).size, 8);
    group.forEach((m) => {
      assert.ok(m.objective && m.instructions && m.learning);
      assert.ok(m.target > 0);
    });
  }
});
test("Every generated puzzle has a valid unique answer and counting stays age appropriate", () => {
  for (const m of missions.filter((m) =>
    ["count", "rescue", "pattern"].includes(m.mode),
  ))
    for (let r = 0; r < 3; r++) {
      const q = questionFor(m, r);
      assert.equal(q.choices.filter((c) => c === q.answer).length, 1);
      if (m.mode === "count") {
        assert.ok(Number(q.answer) >= 1 && Number(q.answer) <= 20);
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
