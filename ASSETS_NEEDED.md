# Assets for CoCA RPG

Place these files in the `public/` folder for the full experience.

## Rabbithole sequence (inventory → read Bible → fall → land)

- **rabbithole.mov** (or **rabbithole.mp4**) – Video that plays while the clerk falls
- **freefall_left.png** – Clerk sprite in freefall (alternates with right)
- **freefall_right.png** – Clerk sprite in freefall (alternates with left)
- **coca_bg.jpg** – Background for the landing scene after the rabbithole (320×179)

## Ending (after Pray on coca_bg)

- **ending.MOV** or **ending.mp4** – Video shown after the pray sequence (full-screen, DOS-style pixelated). Chrome does not support .MOV; convert with: `ffmpeg -i ending.MOV ending.mp4`

**If CSS/canvas pixelation doesn't look right in your browser**, pre-process the video for guaranteed blocky pixels:

```bash
# Scale to 80×50 with nearest-neighbor (no smoothing) – MS-DOS style
ffmpeg -i ending.MOV -vf "scale=80:50:flags=neighbor" -c:a copy ending.mp4
```

Then replace `ending.MOV` with the new `ending.mp4` in `public/`. The game will display it full-screen and the low resolution will naturally look pixelated.

*Note: `.mov` has limited support in Chrome/Firefox. For reliable playback, convert to MP4: `ffmpeg -i rabbithole.mov rabbithole.mp4` — the game will try .mp4 on error.*
