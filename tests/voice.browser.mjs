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
  const page = await browser.newPage({ viewport: { width: 390, height: 844 } });
  const errors = [];
  page.on("pageerror", (e) => errors.push(e.message));
  await page.addInitScript(() => {
    if (!localStorage.getItem("nihara-space-v1"))
      localStorage.setItem(
        "nihara-space-v1",
        JSON.stringify({
          profiles: [{ name: "Nihara", done: [] }],
          settings: { music: 0, sound: 0, voice: 0.8 },
        }),
      );
    window.__said = [];
    const synth = new EventTarget();
    synth.ready = false;
    let timer;
    const voices = [
      {
        name: "Default English",
        lang: "en-US",
        voiceURI: "basic",
        localService: true,
        default: true,
      },
      {
        name: "Karen",
        lang: "en-AU",
        voiceURI: "com.apple.voice.enhanced.en-AU.Karen",
        localService: true,
        default: false,
      },
    ];
    synth.getVoices = () => (synth.ready ? voices : []);
    synth.cancel = () => clearTimeout(timer);
    synth.speak = (u) => {
      window.__said.push({
        text: u.text,
        voice: u.voice?.voiceURI,
        rate: u.rate,
        pitch: u.pitch,
      });
      timer = setTimeout(() => u.onend?.(), 25);
    };
    Object.defineProperty(window, "speechSynthesis", {
      value: synth,
      configurable: true,
    });
    window.SpeechSynthesisUtterance = class {
      constructor(text) {
        this.text = text;
      }
    };
  });
  await page.goto(process.env.GAME_URL || "http://127.0.0.1:5174");
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  await page.getByRole("button", { name: "Hear Pip’s voice" }).click();
  await page.evaluate(() => {
    speechSynthesis.ready = true;
    speechSynthesis.dispatchEvent(new Event("voiceschanged"));
  });
  await page.waitForFunction(() => window.__said.length >= 6);
  let said = await page.evaluate(() => window.__said);
  assert.equal(said[0].voice, "com.apple.voice.enhanced.en-AU.Karen");
  assert.equal(said[0].rate, 0.94);
  assert.ok(said[0].text.includes("Nihara"));
  assert.equal(said.length, 6);
  console.log(
    "Delayed voice loading, enhanced voice selection, gentle delivery and six-sentence preview passed",
  );
  await page.getByLabel("Narration style").selectOption("cheerful");
  await page.getByLabel("Storyteller voice").selectOption("basic");
  await page.getByRole("button", { name: "Hear Pip’s voice" }).click();
  await page.waitForFunction(() => window.__said.length >= 7);
  await page.getByRole("button", { name: "Stop", exact: false }).click();
  said = await page.evaluate(() => window.__said);
  const stopped = said.length;
  assert.equal(said.at(-1).voice, "basic");
  assert.equal(said.at(-1).rate, 1);
  assert.equal(said.at(-1).pitch, 1.12);
  await page.waitForTimeout(500);
  assert.equal(await page.evaluate(() => window.__said.length), stopped);
  await page.reload();
  await page.getByRole("button", { name: "Settings", exact: true }).click();
  assert.equal(
    await page.getByLabel("Narration style").inputValue(),
    "cheerful",
  );
  assert.equal(await page.getByLabel("Storyteller voice").inputValue(), "");
  await page.evaluate(() => {
    speechSynthesis.ready = true;
    speechSynthesis.dispatchEvent(new Event("voiceschanged"));
  });
  await page.waitForFunction(
    () =>
      document.querySelector('select[aria-label="Storyteller voice"]').value ===
      "basic",
  );
  await page.evaluate(() => {
    speechSynthesis.ready = false;
    speechSynthesis.dispatchEvent(new Event("voiceschanged"));
  });
  await page.getByRole("button", { name: "Hear Pip’s voice" }).click();
  await page.getByRole("button", { name: "Mute everything" }).click();
  await page.evaluate(() => {
    speechSynthesis.ready = true;
    speechSynthesis.dispatchEvent(new Event("voiceschanged"));
  });
  await page.waitForTimeout(700);
  assert.equal(await page.evaluate(() => window.__said.length), 0);
  assert.ok(
    await page.getByRole("button", { name: "Hear Pip’s voice" }).isDisabled(),
  );
  console.log(
    "Saved parent choice, cheerful style, stop, mute and deferred-speech cancellation passed",
  );
  assert.deepEqual(errors, []);
  console.log(
    "No browser exceptions. Speech is mocked; actual voice quality requires listening on the device.",
  );
} finally {
  await browser.close();
}
