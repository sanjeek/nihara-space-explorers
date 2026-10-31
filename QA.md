# Validation and release notes

## Automated checks

`npm test` runs nine tests covering 55 unique mission definitions, every generated counting/matching/pattern answer, all world unlock conditions, malformed-save recovery, volume bounds, duplicate-reward prevention, and independent local profiles.

`npm run build` runs strict TypeScript checking and creates the production bundle and offline worker.

`npm run test:browser` exercises all 55 mission definitions with real browser controls: drag steering through rings, projected ground taps to walk to each crystal and the alien, and actual answer/sequence/sort/workshop interactions. Each mission runs with an independent valid save fixture that unlocks the relevant world. Each completion must award the missing mission and exactly three stars, bringing the fixture to 55 completed missions and 165 stars. This checks each mission individually; it is not a child playtest or a timing/performance benchmark.

To run browser checks:

```sh
npm ci
npx playwright install chromium
npm run dev -- --port 5174
# In a second terminal:
npm run test:browser
```

Set `CHROMIUM_PATH` to use an existing system Chromium. Set `GAME_URL` to a development server on a different port. The browser runner uses the development server's local Three.js module to project tap locations; use the development server, not production preview, for this suite.

The initial browser runs found and corrected two issues: finishing/pausing could reset the 3D position snapshot, and narrow-screen cameras could hide edge crystals. Flight startup height and once-per-pass miss accounting were also corrected. Walking tests track individual crystals so incidental pickups do not create false failures.

## Additional checks

- Count mission: completion, reward persistence, reload, and completed card restored.
- Parent area: multiplication gate, independent profiles, nickname editing, and current-profile reset confirmation.
- Workshop: earned colour/fin/sticker/suit options update and persist.
- Settings: voice/music/effects volumes, mute, reduced decorative motion, quality, and assistance.
- Production: service worker caches the app, offline reload works, and a counting mission can be completed and saved offline.
- Navigation: desktop and phone access to map, workshop, collection, lab, settings, and parent area.

`npm run test:release` runs the production mobile-settings/parent/customisation/offline suite and the break-reminder/offline-save check. Start `npm run preview -- --port 4174` first. `PREVIEW_URL` can select another production preview origin. The suite uses fresh, isolated browser contexts and local test profiles.

For a focused development check, use `MISSION_IDS=1,2,32,50 npm run test:browser`. The default runs every mission; the runner rejects an empty mission selection.

Results in the cloud machine: all 50 missions were individually completed across browser runs with valid rewards and zero page exceptions. Production offline reload, disconnected mission completion, reward saving, break reminders, workshop changes, mobile navigation, adult gate, and profile reset isolation passed. The offline check found and fixed a static-cache Vary-header mismatch before release.

## Device and scope limits

The browser checks use Chromium with software WebGL on a Linux cloud machine, including a 390 × 844 phone viewport. They do not verify Safari, actual iPad/Android hardware, installed voices, touch comfort for five-year-olds, or a frame-rate target. Those require real-device checks and supervised child playtesting. Browser narration can be unavailable; visible instructions remain available. The parent multiplication gate prevents casual accidental navigation, not determined access.

No public hosting deployment is implied by these checks. Verify the exact GitHub repository and commit selected by the hosting project before declaring the site live.

## Friendly narration checks

With the development server running, `npm run test:voice` verifies asynchronous voice loading, enhanced-English selection, personalised sentence-by-sentence preview, gentle/cheerful delivery, the saved parent-selected voice, stop, mute, and cancellation of deferred speech. This browser test mocks speech synthesis to inspect delivery and cancellation reliably. It does not validate the audible quality of an iPhone voice; listen on the target device using Settings → Hear Pip’s voice.

## Playroom and maths update

All five new addition missions completed in Chromium. Representative counting, memory, sorting, and rocket assembly checks passed after adding intermediate celebrations. `npm run test:playroom` checks berry dragging/tapping, a wrong answer with unlimited retry, three-round completion, the Count with Pip helper, direct access to a harder activity without world unlocks, and saved rewards for missions 51 and 55. Unit tests exercise 1,500 generated addition questions, verifying positive addends, unique answer choices, and totals strictly below ten. Old mission IDs and saved rewards remain intact. These checks verify functioning interactions, not whether a particular child will enjoy them; supervised playtesting remains necessary.
