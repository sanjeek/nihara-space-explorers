# Nihara Space Explorers

**Little Astronaut Academy** is a separate, original 3D browser game for young explorers. It contains 55 playable mission definitions across Earth & Moon, Mars, Jupiter’s orbital stations, Saturn, and an imaginary Magical Galaxy. Each world has ten original adventures and a new hands-on addition picnic. The home playroom makes nine game types immediately available without unlocking a world.

## Run locally

Requires Node.js 22.18+ (Node.js 24 recommended) and npm.

```sh
npm ci
npm run dev -- --port 5174
```

```sh
npm test
npm run build
npm run preview -- --port 4174
# With the preview server running in another terminal:
npm run test:release
```

`npm test` runs nine checks covering mission coverage, generated puzzle answers, unlocking, corrupted saves, duplicate rewards, and independent local profiles. Browser gameplay and offline verification are documented in `QA.md`.

## Playroom

The home screen now starts with nine large activity cards: Feed Momo, treasure counting, shape rescue, patterns, memory lights, sorting, rocket building, flying, and moonwalking. Every card is immediately playable. Choose Little steps, Growing explorer, or Ready for a challenge. Completing a free-play activity returns to the choice of games; no forced sequence is required.

**Feed Momo** has two bowls of berries. Tap or drag berries into the picnic tray, then choose their combined total. Both addends are positive and every sum is strictly below 10. The Count with Pip helper demonstrates the total. All counting questions are also limited to 1–9, with smaller sets at the gentle setting. There are three rounds, gentle retries, and a short celebration between answers. Original missions 1–50 and their rewards remain intact; addition missions 51–55 save separately.

With the development server running, `npm run test:playroom` validates the phone playroom, actual berry dragging/tapping, retries, counting help, difficulty choices, and saved addition rewards.

## Play

- **Rocket pilot:** forward motion is automatic. Drag anywhere on the 3D view or use WASD/arrows/on-screen buttons. Fly through the golden rings. Missing a ring allows another pass; asteroids gently slow the rocket. After repeated misses, optional assistance widens collection range.
- **Planet explorer:** tap a spot on the ground to walk there, or hold direction controls. Collect the crystals, then walk to the friendly alien inside the glowing ring.
- **Alien rescue:** match the alien’s symbol, using shape as well as colour.
- **Counting and patterns:** choose the matching answer. After repeated wrong answers, a visual hint appears. Retries are unlimited.
- **Robot signals:** watch the lights and repeat the sequence; Watch again replays it.
- **Sorting:** tap rocks from smallest to biggest, or drag each next rock into the drop area.
- **Rocket assembly:** follow the colour and fin requests in three short rounds.

Complete a mission to earn three stars, awarded only once. Complete all ten in a world to unlock the next. Replays never deduct rewards. The separate workshop offers permanent colour, fin, sticker, and suit unlocks; earned stars are never spent. The collection records completed-world badges.

## Stories, audio, accessibility

Each world has a story and clearly labelled science facts. Magical Galaxy content is explicitly imaginative. Voice guidance uses device/browser speech synthesis and has visible text; voices may be unavailable on some devices. Original lightweight background melodies and interaction sounds use the Web Audio API, starting after interaction. Music, effects, and voice have separate volume controls and a mute-all button.

Pip’s voice settings offer **Gentle storytime** and **Cheerful explorer** delivery, a saved English voice picker, and a personalised preview. Automatic selection favours enhanced/natural English voices when available, including voices provided asynchronously by iOS. Narration uses short sentences with small pauses and lowers background music while speaking. Stop, mute, screen navigation, and hiding the app cancel pending speech. On iPhone, installing an enhanced English voice in Accessibility → Read & Speak / Spoken Content → Voices can improve the sound. This is device speech synthesis, not recorded voice acting; quality depends on the installed voices.

Settings include reduced decorative motion, lightweight rendering, and flight assistance. Mission motion required for gameplay remains active. Controls have keyboard, mouse, and touch alternatives. No third-party art or remote fonts are loaded.

## Local data and parent area

Up to four local profiles save completed missions, rewards, rocket/suit choices, selected profile, approximate active playtime, and settings in browser storage. Invalid saves recover to a fresh profile. Storage failures show a warning and keep the game playable without persistence.

The parent area has a casual multiplication gate, profile management, learning topics, optional 5/10/15-minute break reminders, and a two-step reset for the current profile. This gate discourages accidental entry; it is not a security boundary. Nicknames are enough. No account, analytics, ads, purchases, online profiles, or chat are included.

## Offline play

Production builds generate a versioned service worker and cache the game shell and all built assets. After a successful first online load and cache installation, core missions and saves work offline. Wait for the initial download before disconnecting. Device voices can still depend on the operating system. Development mode does not install the worker.

## Deployment

Import **sanjeek/nihara-space-explorers** into Vercel as an existing Git repository (avoid cloning a second repository). Framework: **Vite**. Build: `npm run build`. Output: `dist`. No secrets or environment variables are needed. `vercel.json` supplies these settings.

GitHub source upload and Vercel deployment are separate actions. A successful build is not proof of a public deployment. Keep the Vercel project linked to this repository so future pushes deploy the same source.

## Practical limits

This is a playable web release built from lightweight, procedural models and shared mission systems. It is not a native iOS/Android app or a commercial-art production. Automated Chromium checks do not replace playtesting with children or testing on real iPads and Android tablets. No 60 FPS guarantee is made; use lightweight graphics on slower devices. Narration quality depends on installed voices. Clearing browser data removes local progress.
