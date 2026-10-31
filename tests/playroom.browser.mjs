import { chromium } from "playwright";
import assert from "node:assert/strict";
const browser = await chromium.launch({
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
try {
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } }),
    errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    if (!localStorage.getItem("nihara-space-v1"))
      localStorage.setItem(
        "nihara-space-v1",
        JSON.stringify({
          profiles: [{ name: "Nihara", done: [] }],
          settings: { music: 0, sound: 0, voice: 0, quality: "low" },
        }),
      );
  });
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:5174");
  assert.equal(await page.locator(".playroom-game").count(), 9);
  await page.screenshot({ path: "/tmp/nihara-playroom.png" });
  await page.getByRole("button", { name: "Feed Momo", exact: false }).click();
  await page.getByRole("button", { name: "Ready, Captain!" }).click();
  for (let round = 0; round < 3; round++) {
    await page.waitForFunction(
      (round) =>
        document
          .querySelector(".puzzle-card .eyebrow")
          ?.textContent.includes(round + 1 + " / 3"),
      round,
    );
    const parts = await page.locator(".berry-bowl b").allTextContents(),
      total = parts.map(Number).reduce((a, b) => a + b, 0);
    assert.ok(total < 10);
    assert.ok(
      await page.locator(".addition-answers button").first().isDisabled(),
    );
    if (round === 0) {
      await page
        .getByRole("button", { name: "Move berry 1", exact: true })
        .dragTo(page.getByLabel("Momo’s picnic tray"));
      await page.waitForFunction(
        () => document.querySelectorAll(".tray-berry").length === 1,
      );
    }
    while (await page.locator(".berry:not(:disabled)").count())
      await page.locator(".berry:not(:disabled)").first().click();
    if (round === 0) {
      const wrong = page
        .locator(".addition-answers button")
        .filter({ hasText: new RegExp("^(?!" + total + "$)[1-9]$") })
        .first();
      await wrong.click();
      assert.ok(
        (await page.locator(".feedback").textContent()).includes("no hurry"),
      );
    }
    assert.equal(await page.locator(".tray-berry").count(), total);
    if (round === 0) await page.screenshot({ path: "/tmp/nihara-momo.png" });
    await page
      .locator(".addition-answers")
      .getByRole("button", { name: String(total), exact: true })
      .click();
  }
  await page.getByRole("heading", { name: "You did it, Captain!" }).waitFor();
  let save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("nihara-space-v1")),
  );
  assert.deepEqual(save.profiles[0].done, [51]);
  assert.equal(save.profiles[0].stars, 3);
  await page.getByRole("button", { name: "Choose another game" }).click();
  await page
    .getByRole("button", { name: "Ready for a challenge", exact: false })
    .click();
  await page.getByRole("button", { name: "Feed Momo", exact: false }).click();
  await page.getByRole("button", { name: "Ready, Captain!" }).click();
  for (let round = 0; round < 3; round++) {
    await page.waitForFunction(
      (round) =>
        document
          .querySelector(".puzzle-card .eyebrow")
          ?.textContent.includes(round + 1 + " / 3"),
      round,
    );
    const values = await page.locator(".berry-bowl b").allTextContents(),
      total = values.map(Number).reduce((a, b) => a + b, 0);
    assert.ok(total < 10);
    await page.getByRole("button", { name: "Count with Pip" }).click();
    await page
      .locator(".addition-answers")
      .getByRole("button", { name: String(total), exact: true })
      .click();
  }
  await page.getByRole("heading", { name: "You did it, Captain!" }).waitFor();
  save = await page.evaluate(() =>
    JSON.parse(localStorage.getItem("nihara-space-v1")),
  );
  assert.deepEqual(save.profiles[0].done, [51, 55]);
  assert.equal(save.profiles[0].stars, 6);
  await page.getByRole("button", { name: "Choose another game" }).click();
  for (let i = 0; i < 9; i++) {
    await page.locator(".playroom-game").nth(i).click();
    await page.getByRole("button", { name: "Ready, Captain!" }).click();
    await page
      .getByRole("button", { name: "Back to playroom", exact: true })
      .click();
    await page.locator(".playroom-game").first().waitFor();
  }
  console.log("All nine activity cards start and return to the playroom.");
  console.log(
    "Phone playroom, berry dragging/tapping, gentle retry, 3-round completion, helper, difficulty and saved bonus rewards passed.",
  );
  assert.deepEqual(errors, []);
} finally {
  await browser.close();
}
