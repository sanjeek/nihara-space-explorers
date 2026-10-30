# Nihara Space Explorers

**Little Astronaut Academy** is a separate, original 3D browser game for young explorers. It contains 50 playable mission definitions across Earth & Moon, Mars, Jupiter’s orbital stations, Saturn, and an imaginary Magical Galaxy. Ten missions per world use eight reusable gameplay modes, with increasing targets and puzzle difficulty.

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

`npm test` runs five checks covering mission coverage, generated puzzle answers, unlocking, corrupted saves, duplicate rewards, and independent local profiles. Browser gameplay and offline verification are documented in `QA.md`.

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
