#!/usr/bin/env python3
"""Apply rabbithole fixes: walking in COCA_LANDED, lower landing Y, mp4 conversion info."""

# 1. Config: lower cocaLandedClerkY
with open('src/game/config.js', 'r') as f:
    config = f.read()
config = config.replace('cocaLandedClerkY: height * 0.88,', 'cocaLandedClerkY: height * 0.94,')
with open('src/game/config.js', 'w') as f:
    f.write(config)
print('1. Lowered cocaLandedClerkY to 0.94')

# 2. PhaserGame: allow input in COCA_LANDED (remove from early return)
with open('src/PhaserGame.jsx', 'r') as f:
    phaser = f.read()

old_input = "if (!this.clerk || this.sceneState === SCENE_STATE.RAID || this.sceneState === SCENE_STATE.LOGO || this.sceneState === SCENE_STATE.INTERMISSION || this.sceneState === SCENE_STATE.RABBITHOLE || this.sceneState === SCENE_STATE.COCA_LANDED) return"
new_input = "if (!this.clerk || this.sceneState === SCENE_STATE.RAID || this.sceneState === SCENE_STATE.LOGO || this.sceneState === SCENE_STATE.INTERMISSION || this.sceneState === SCENE_STATE.RABBITHOLE) return"
if old_input in phaser:
    phaser = phaser.replace(old_input, new_input)
    print('2. Removed COCA_LANDED from input block (allows clicks)')
else:
    print('2. Input block not found or already updated')

# 3. Allow floor clicks when in COCA_LANDED (need movementEnabled check)
old_move = "if (!this.movementEnabled && this.sceneState !== SCENE_STATE.WAYNES_ROOM) return"
new_move = "if (!this.movementEnabled && this.sceneState !== SCENE_STATE.WAYNES_ROOM && this.sceneState !== SCENE_STATE.COCA_LANDED) return"
if old_move in phaser:
    phaser = phaser.replace(old_move, new_move)
    print('3. Allowed floor clicks in COCA_LANDED')
else:
    print('3. Movement check not found or already updated')

# 4. showCocaLanded: set movementEnabled = true
old_landed = "this.sceneState = SCENE_STATE.COCA_LANDED"
# Insert movementEnabled before that
if "this.sceneState = SCENE_STATE.COCA_LANDED" in phaser and "movementEnabled = true" not in phaser.split("showCocaLanded")[1].split("this.sceneState = SCENE_STATE.COCA_LANDED")[0]:
    # Find the showCocaLanded block and add movementEnabled
    landing_block = "    if (this.clerk) {\n      this.clerk.setVisible(true)\n      this.clerk.setPosition(width / 2, layout.cocaLandedClerkY)\n      this.clerk.setAngle(0).setScale(1)\n      if (this.usingClerkSprite) this.clerk.play('clerk_idle_right', true)\n    }\n    if (this.clerkHead) this.clerkHead.setVisible(true)\n    if (this.glassesLeft) this.glassesLeft.setVisible(true)\n    if (this.glassesRight) this.glassesRight.setVisible(true)\n    if (this.tie) this.tie.setVisible(true)\n    if (this.pocket) this.pocket.setVisible(true)\n\n    this.sceneState = SCENE_STATE.COCA_LANDED"
    new_landing_block = "    this.movementEnabled = true\n    this.target = null\n    if (this.clerk) {\n      this.clerk.setVisible(true)\n      this.clerk.setPosition(width / 2, layout.cocaLandedClerkY)\n      this.clerk.setAngle(0).setScale(1)\n      if (this.usingClerkSprite) this.clerk.play('clerk_idle_right', true)\n    }\n    if (this.clerkHead) this.clerkHead.setVisible(true)\n    if (this.glassesLeft) this.glassesLeft.setVisible(true)\n    if (this.glassesRight) this.glassesRight.setVisible(true)\n    if (this.tie) this.tie.setVisible(true)\n    if (this.pocket) this.pocket.setVisible(true)\n\n    this.sceneState = SCENE_STATE.COCA_LANDED"
    if landing_block in phaser:
        phaser = phaser.replace(landing_block, new_landing_block)
        print('4. Added movementEnabled in showCocaLanded')
    else:
        # Simpler: add before sceneState
        phaser = phaser.replace("    if (this.pocket) this.pocket.setVisible(true)\n\n    this.sceneState = SCENE_STATE.COCA_LANDED", "    if (this.pocket) this.pocket.setVisible(true)\n\n    this.movementEnabled = true\n    this.target = null\n    this.sceneState = SCENE_STATE.COCA_LANDED")
        print('4. Added movementEnabled in showCocaLanded (alt)')
else:
    print('4. showCocaLanded may already have movementEnabled')

# 5. Update: don't return early for COCA_LANDED - need to run movement
old_update = "if (this.sceneState === SCENE_STATE.RABBITHOLE) return\n    if (this.sceneState === SCENE_STATE.COCA_LANDED) return"
new_update = "if (this.sceneState === SCENE_STATE.RABBITHOLE) return"
if old_update in phaser:
    phaser = phaser.replace(old_update, new_update)
    print('5. Removed COCA_LANDED early return from update (enables movement)')
else:
    print('5. Update block not found or already updated')

# 6. Need to handle floor Y for COCA_LANDED - use clerkWalkY or similar
# The floor click uses floorYMin, floorYMax, clerkWalkY. For COCA_LANDED we need same floor. Layout has clerkWalkY. We might need a cocaLandedWalkY. For now clerkWalkY from layout should work - it's the same Y. Good.

with open('src/PhaserGame.jsx', 'w') as f:
    f.write(phaser)

print('Done.')
