import { chromium } from "playwright";
(async () => {
  const { missions, questionFor } = await import("../src/missions.ts");
  const b = await chromium.launch({
    ...(process.env.CHROMIUM_PATH
      ? { executablePath: process.env.CHROMIUM_PATH }
      : {}),
    args: [
      "--no-sandbox",
      "--use-gl=angle",
      "--use-angle=swiftshader",
      "--enable-webgl",
    ],
  });
  const p = await b.newPage({ viewport: { width: 390, height: 844 } });
  let errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => {
    const id = Number(new URL(location.href).searchParams.get("testMission"));
    localStorage.setItem(
      "nihara-space-v1",
      JSON.stringify({
        profiles: [
          {
            name: "QA Captain",
            done: Array.from({ length: 50 }, (_, i) => i + 1).filter(
              (v) => v !== id,
            ),
            stars: 147,
          },
        ],
        settings: {
          quality: "low",
          voice: 0,
          music: 0,
          sound: 0,
          reducedMotion: true,
        },
      }),
    );
  });
  const requested = (process.env.MISSION_IDS || "")
    .split(",")
    .filter(Boolean)
    .map(Number);
  const selected = requested.length
    ? missions.filter((m) => requested.includes(m.id))
    : missions;
  if (!selected.length) throw Error("No valid missions selected");
  for (const m of selected) {
    console.log("START", m.id, m.mode);
    await p.goto(
      (process.env.GAME_URL || "http://127.0.0.1:5174") +
        "/?testMission=" +
        m.id,
    );
    await p.getByRole("button", { name: "Let’s explore" }).click();
    await p.locator(".world-tabs button").nth(m.world).click();
    await p
      .locator(".mission-card")
      .nth((m.id - 1) % 10)
      .click();
    await p.getByRole("button", { name: "Ready, Captain!" }).click();
    if (m.mode === "flight") {
      await p.waitForFunction(() => window.__space?.mode === "flight");
      const canvas = p.locator("canvas");
      let previous = -1,
        index = 0;
      const deadline = Date.now() + 180000;
      const rect = await canvas.boundingBox();
      await p.mouse.move(rect.x + rect.width / 2, rect.y + rect.height / 2);
      await p.mouse.down();
      while (Date.now() < deadline) {
        const state = await p.evaluate(() => window.__space);
        if (state.completed) break;
        if (state.collected !== previous || state.targets[index][2] > 6.5) {
          previous = state.collected;
          index = state.targets
            .map((v, i) => ({ v, i }))
            .filter((o) => o.v[2] < 4.5)
            .sort((a, b) => b.v[2] - a.v[2])[0].i;
        }
        const t = state.targets[index];
        await p.mouse.move(
          rect.x + rect.width * (0.5 + t[0] / 12),
          rect.y + rect.height * (0.5 - (t[1] - 3) / 6),
        );
        await p.waitForTimeout(120);
      }
      await p.mouse.up();
      await p.waitForFunction(
        () => window.__space?.completed,
        {},
        { timeout: 5000 },
      );
    } else if (m.mode === "explore") {
      await p.waitForFunction(
        () => window.__space?.mode === "explore" && window.__space?.view,
      );
      for (let i = 0; i < m.target + 1; i++) {
        const state = await p.evaluate(() => window.__space);
        const v = i < m.target ? state.targets[i] : [0, 0, -6];
        const point = await p.evaluate(async (v) => {
          const T = await import("/node_modules/.vite/deps/three.js");
          const c = document.querySelector("canvas"),
            r = c.getBoundingClientRect();
          const view = window.__space.view;
          const camera = new T.PerspectiveCamera(
            view.fov,
            r.width / r.height,
            0.1,
            100,
          );
          camera.position.set(...view.position);
          camera.lookAt(0, 0, 0);
          camera.updateMatrixWorld();
          const vector = new T.Vector3(v[0], 0, v[2]).project(camera);
          return {
            x: r.x + ((vector.x + 1) / 2) * r.width,
            y: r.y + ((1 - vector.y) / 2) * r.height,
          };
        }, v);
        await p.mouse.click(point.x, point.y);
        if (i < m.target)
          await p.waitForFunction(
            (n) => window.__space.collectedIndices.includes(n),
            i,
            { timeout: 60000 },
          );
        else
          await p.waitForFunction(
            () => window.__space.completed,
            {},
            { timeout: 60000 },
          );
      }
    } else {
      for (let round = 0; round < 3; round++) {
        if (m.mode === "sequence") {
          await p.waitForFunction(() => {
            const b = document.querySelector(".puzzle-answers button");
            return b && !b.disabled;
          });
          for (let i = 0; i < 3 + Math.floor(m.world / 2); i++) {
            const index = (i * i + i + m.world + round) % 4;
            await p.locator(".puzzle-answers button").nth(index).click();
          }
        } else if (m.mode === "sort") {
          for (let n = 1; n <= 3 + Math.min(m.world, 3); n++)
            await p
              .getByRole("button", { name: "Rock size " + n, exact: true })
              .click();
        } else if (m.mode === "workshop") {
          await p
            .getByRole("button", {
              name: ["Purple", "Orange", "Mint"][(m.world + round) % 3],
              exact: true,
            })
            .click();
          await p
            .locator(".fin-options button")
            .nth(round % 2 ? 1 : 0)
            .click();
          await p.getByRole("button", { name: "Ready for launch" }).click();
        } else {
          const q = questionFor(m, round);
          await p
            .locator(".puzzle-answers")
            .getByRole("button", { name: q.answer, exact: true })
            .click();
        }
      }
    }
    await p
      .getByRole("heading", { name: "You did it, Captain!" })
      .waitFor({ timeout: 15000 });
    const save = await p.evaluate(() =>
      JSON.parse(localStorage.getItem("nihara-space-v1")),
    );
    if (save.profiles[0].done.length !== 50 || save.profiles[0].stars !== 150)
      throw Error("Reward incorrect mission " + m.id);
    console.log("PASS", m.id, m.mode, m.title);
  }
  console.log(selected.length + " MISSIONS COMPLETED; browser errors:", errors);
  await b.close();
  if (errors.length) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
