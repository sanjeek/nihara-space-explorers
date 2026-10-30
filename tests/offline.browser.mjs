import { chromium } from "playwright";
(async () => {
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
  const c = await b.newContext({ viewport: { width: 390, height: 844 } }),
    p = await c.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => {
    if (!localStorage.getItem("nihara-space-v1"))
      localStorage.setItem(
        "nihara-space-v1",
        JSON.stringify({
          profiles: [{ name: "Captain", done: [] }],
          settings: { quality: "low", voice: 0, music: 0, sound: 0 },
        }),
      );
  });
  await p.goto(process.env.PREVIEW_URL || "http://127.0.0.1:4174");
  await p.evaluate(() => navigator.serviceWorker.ready);
  await p.waitForFunction(() => navigator.serviceWorker.controller);
  await p.getByRole("button", { name: "Parent area", exact: true }).click();
  const text = await p.locator(".global-overlay p").textContent();
  const [, a, d] = text.match(/(\d+) × (\d+)/);
  await p.getByLabel("Grown-up answer").fill(String(Number(a) * Number(d)));
  await p.getByRole("button", { name: "Open mission control" }).click();
  await p.getByLabel("Break reminder").selectOption("5");
  await p
    .locator(".mobile-nav")
    .getByRole("button", { name: "Home", exact: false })
    .click();
  await p.getByRole("button", { name: "Let’s explore" }).click();
  await p.locator(".mission-card").first().click();
  await p.getByRole("button", { name: "Ready, Captain!" }).click();
  await p.evaluate(() => {
    const original = Date.now;
    Date.now = () => original() + 300001;
  });
  await p
    .getByRole("heading", { name: "Even captains need a stretch." })
    .waitFor({ timeout: 15000 });
  await p.getByRole("button", { name: "I’m ready to continue" }).click();
  console.log("Break reminder appeared and resumed game");
  await p
    .getByRole("button", { name: "Return to missions", exact: true })
    .click();
  await p
    .locator(".mobile-nav")
    .getByRole("button", { name: "Home", exact: false })
    .click();
  await c.setOffline(true);
  await p.reload();
  await p.getByRole("button", { name: "Let’s explore" }).click();
  await p.locator(".mission-card").nth(2).click();
  await p.getByRole("button", { name: "Ready, Captain!" }).click();
  for (let r = 0; r < 3; r++) {
    const count = (await p.locator(".question-visual").textContent())
      .trim()
      .split(" ").length;
    await p
      .locator(".puzzle-answers")
      .getByRole("button", { name: String(count), exact: true })
      .click();
  }
  await p.getByRole("heading", { name: "You did it, Captain!" }).waitFor();
  const data = await p.evaluate(() =>
    JSON.parse(localStorage.getItem("nihara-space-v1")),
  );
  if (data.profiles[0].stars !== 3 || !data.profiles[0].done.includes(3))
    throw Error("Offline save failed");
  console.log(
    "OFFLINE page reload, mission play, completion and saved reward passed. Errors:",
    errors,
  );
  await b.close();
  if (errors.length) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
