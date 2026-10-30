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
  const context = await b.newContext({ viewport: { width: 390, height: 844 } }),
    p = await context.newPage();
  const errors = [];
  p.on("pageerror", (e) => errors.push(e.message));
  await p.addInitScript(() => {
    if (!localStorage.getItem("nihara-space-v1"))
      localStorage.setItem(
        "nihara-space-v1",
        JSON.stringify({
          profiles: [
            {
              name: "Nihara",
              done: [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
              stars: 30,
            },
          ],
          settings: { voice: 0, music: 0, sound: 0, quality: "low" },
        }),
      );
  });
  await p.goto(process.env.PREVIEW_URL || "http://127.0.0.1:4174");
  await p.evaluate(async () => {
    await navigator.serviceWorker.ready;
  });
  await p.waitForFunction(() => navigator.serviceWorker.controller);
  console.log("Production offline worker ready");
  await p
    .locator(".mobile-nav")
    .getByRole("button", { name: "Rocket", exact: false })
    .click();
  await p.getByRole("button", { name: "Orange rocket", exact: true }).click();
  await p.getByRole("button", { name: "Pointy", exact: false }).click();
  await p.locator(".sticker-options button").nth(1).click();
  await p.getByRole("button", { name: "Mint suit", exact: true }).click();
  let data = await p.evaluate(() =>
    JSON.parse(localStorage.getItem("nihara-space-v1")),
  );
  if (
    data.profiles[0].colour !== "#f4be76" ||
    data.profiles[0].sticker !== "🌙" ||
    data.profiles[0].fin !== "pointy" ||
    data.profiles[0].suit !== "#79d8cc"
  )
    throw Error("Customisation not saved");
  console.log("Rocket and suit customisations saved");
  await p
    .locator(".mobile-nav")
    .getByRole("button", { name: "Collection", exact: false })
    .click();
  if ((await p.locator(".badge-card.unlocked").count()) !== 1)
    throw Error("Badge not earned");
  await p
    .locator(".mobile-nav")
    .getByRole("button", { name: "Lab", exact: false })
    .click();
  if ((await p.locator(".fact-card").count()) !== 5) throw Error("Lab missing");
  await p.getByRole("button", { name: "Settings", exact: true }).click();
  await p.getByRole("button", { name: "Mute everything" }).click();
  await p.getByLabel("Gentle motion").check();
  await p.getByLabel("Extra flying assistance").uncheck();
  data = await p.evaluate(() =>
    JSON.parse(localStorage.getItem("nihara-space-v1")),
  );
  if (
    data.settings.music ||
    data.settings.sound ||
    data.settings.voice ||
    !data.settings.reducedMotion ||
    data.settings.assistance
  )
    throw Error("Settings not saved");
  console.log("Phone menus, badges, facts and accessibility passed");
  await p.getByRole("button", { name: "Parent area", exact: true }).click();
  const text = await p.locator(".global-overlay p").textContent();
  const [, a, c] = text.match(/(\d+) × (\d+)/);
  await p.getByLabel("Grown-up answer").fill(String(Number(a) * Number(c)));
  await p.getByRole("button", { name: "Open mission control" }).click();
  await p.getByRole("button", { name: "Add local profile" }).click();
  await p.getByLabel("Captain name").fill("Nova");
  await p
    .locator(".profile-options")
    .getByRole("button", { name: "Nihara", exact: false })
    .click();
  await p
    .getByRole("button", { name: "Reset this captain’s progress" })
    .click();
  await p.getByRole("button", { name: "Keep my progress" }).click();
  data = await p.evaluate(() =>
    JSON.parse(localStorage.getItem("nihara-space-v1")),
  );
  if (data.profiles[0].done.length !== 10)
    throw Error("Cancel reset lost progress");
  await p
    .getByRole("button", { name: "Reset this captain’s progress" })
    .click();
  await p.getByRole("button", { name: "Yes, reset this profile" }).click();
  data = await p.evaluate(() =>
    JSON.parse(localStorage.getItem("nihara-space-v1")),
  );
  if (data.profiles[0].done.length || data.profiles[1].name !== "Nova")
    throw Error("Profile reset isolation failed");
  console.log(
    "Parent gate, multiple profiles, cancel and isolated reset passed",
  );
  await p
    .locator(".mobile-nav")
    .getByRole("button", { name: "Home", exact: false })
    .click();
  await context.setOffline(true);
  await p.reload();
  await p.getByRole("button", { name: "Let’s explore" }).waitFor();
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
  data = await p.evaluate(() =>
    JSON.parse(localStorage.getItem("nihara-space-v1")),
  );
  if (data.profiles[0].stars !== 3) throw Error("Offline award not saved");
  console.log("OFFLINE reload, mission completion, and save passed");
  console.log("ERRORS", errors);
  await b.close();
  if (errors.length) process.exitCode = 1;
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
