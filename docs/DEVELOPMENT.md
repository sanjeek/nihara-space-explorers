# Development notes

The project is independent of Nihara Adventure. Do not overwrite that game's repository or its deployment.

- `src/missions.ts`: all 50 mission definitions, eight interaction types, five worlds, and progression rules.
- `src/state.ts`: external React store, bounded save parsing, idempotent awards, four local profiles, and settings.
- `src/Scene.tsx`: original procedural 3D models, rocket flight, gentle obstacle response, tap-to-walk exploration, responsive camera, keyboard/touch controls, and graphics recovery.
- `src/Puzzle.tsx`: matching, counting, patterns, memory, ordering via tap/drag, and requested rocket assembly.
- `src/App.tsx`: navigation, world story cards, mission flow, customisation, badges, science lab, grown-up gate, accessibility, and reminders.
- `src/audio.ts`: original Web Audio melody/effects and device speech guidance.
- `vite.config.ts`: React build and offline worker generation. Built asset hashes version the cache.

The read-only `window.__space` snapshot records flight/exploration positions, collectible targets, camera, progress, and completion for browser diagnosis. It offers no mutation or completion shortcut.

No secrets, external asset servers, or remote fonts are required. Do not commit a child's real personal details, browser profiles, tokens, or local test saves.
