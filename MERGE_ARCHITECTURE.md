# CoCA RPG – Merge Architecture

## Overview
Phaser and SAMIZDAT are being merged so **Phaser owns the full flow**. You can build remaining levels in one place and bring in artwork (hq.png, executive suite long map, sprite changes).

## Current Flow (Post-Merge)
1. **Phaser**: Office → SWAT → Intermission → **Wayne's Room**
2. **Wayne's Room** (Phaser): Bible in inventory → [Study] or [Read]
   - **Study**: Blink transform → NCR officer sprite → auto-walk right → **Executive Suite**
   - **Read**: Quote → Rabbithole fall → CoCA (coca_bg)
3. **Executive Suite** (Phaser): Long map (hq.png), sprite changes as player walks through
4. **CoCA** (coca_bg): Landing after rabbithole

## Key Files
- `src/game/config.js` – SCENE_STATE, ASSETS (HQ, NCR_OFFICER)
- `src/PhaserGame.jsx` – OfficeScene: Study path, startExecutiveSuite()
- `src/samizdat/` – Kept for debug jumps (Wayne's, Fall, Executive Suite React version)

## Assets for Executive Suite
- `public/hq.png` – Long scrollable map
- `public/ncrcamofficer_right.png` – Officer sprite (177×100, single frame)

## Extension Points
- `startExecutiveSuite()` – Add long map parallax, dialogue, sprite morphing
- Sprite changes: Swap texture based on player X position as they walk through the map
