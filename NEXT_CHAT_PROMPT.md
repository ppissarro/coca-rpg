# CoCA RPG – Next Chat Prompt

Copy and paste this into a new chat to continue development:

---

**Context:** CoCA RPG is a Phaser 3 + React/Vite game. The flow is: office (level 1) → Wayne's room (level 2) → Executive Suite/HQ (level 3) → Supreme Court (level 4). The player is a clerk who transforms into an NCR officer, picks up the CoCA Bible, can read it (triggers rabbithole fall) or throw it at the coke boss (triggers lawsuit → Supreme Court). Debug menu can jump between levels.

**Next tasks:**

1. **Battle sequence** – Implement the Supreme Court battle mechanics. NCR officer vs coke boss, center of room. Need turn-based or real-time combat, UI for actions, win/lose states.

2. **Plug in sound** – Add/trigger audio throughout: office ambience, Wayne's room music, HQ, Supreme Court, battle sounds, UI feedback. Assets exist in `public/` (office.wav, waynes.wav, etc.). Check `src/game/config.js` ASSETS and `PhaserGame.jsx` preload/create for what's already wired.

3. **Add objects** – Place interactive or decorative objects in each level (office, Wayne's room, HQ, Supreme Court) to make scenes feel lived-in. Consider clickable props, environmental storytelling.

4. **Perfect sprite placement and behavior** – Tweak positions, scales, and animations for clerk, NCR officer, coke boss, cat, etc. Ensure sprites align with floors, face correctly, and animate smoothly. Layout values live in `src/game/config.js` `getLayout()`.

**Key files:** `src/PhaserGame.jsx` (main scene), `src/game/config.js` (layout, assets, states), `src/game/levelRegistry.js` (level descriptors, enterLevel), `public/` (images, audio).

**Level abstraction:** Levels are defined in `levelRegistry.js` (background, player setup, music, setup/cleanup). `enterLevel(scene, key, layout)` drives Wayne's room, Executive Suite, Supreme Court. To add a new level: add a descriptor in `LEVEL_DESCRIPTORS` and a `start*()` that calls `enterLevel`.

---
