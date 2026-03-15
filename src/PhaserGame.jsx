import { useEffect, useRef } from 'react'
import Phaser from 'phaser'
import {
  GAME_WIDTH,
  GAME_HEIGHT,
  SCENE_STATE,
  BIBLE_STATE,
  ASSETS,
  getLayout,
} from './game/config'

class OfficeScene extends Phaser.Scene {
  constructor() {
    super('OfficeScene')

    this.clerk = null
    this.clerkHead = null
    this.target = null
    this.bible = null
    this.bibleZone = null
    this.bibleLabel = null
    this.statusText = null
    this.overlayText = null

    this.isSeated = true
    this.movementEnabled = false
    this.walkingToBible = false
    this.bibleAcquired = false

    this.sceneState = SCENE_STATE.INTRO_IDLE
    this.bibleState = BIBLE_STATE.IN_SHELF

    this.bibleMenuContainer = null
    this.bibleReadText = null

    this.swatUnits = []
    this.chair = null
    this.cabinet = null
    this.cabinetDrawer = null
    this.paperSprites = []

    this.glassesLeft = null
    this.glassesRight = null
    this.tie = null
    this.pocket = null
    this.idleTime = 0
    this.usingClerkSprite = false
    this.facing = 'right'
    this.audioUnlocked = false
  }

  unlockAudio() {
    if (this.audioUnlocked) return
    this.audioUnlocked = true
    if (this.sound.context && typeof this.sound.context.resume === 'function') {
      this.sound.context.resume()
    }
    if (this.officeMusic && !this.officeMusic.isPlaying) {
      this.officeMusic.play()
    }
  }

  preload() {
    this.load.image(ASSETS.OFFICE_BG, 'office_bg.png')
    this.load.image(ASSETS.OFFICE_BG_NOBIBLE, 'office_bg_nobible.png')
    this.load.image(ASSETS.OFFICE_BG_RAID, 'office_bg_raid.png')
    this.load.audio(ASSETS.OFFICE_AUDIO, 'office.wav')
    this.load.audio(ASSETS.SWIPE_AUDIO, 'swipe.wav')
    this.load.audio(ASSETS.FIND_BIBLE_AUDIO, 'findthatbible.wav')
    this.load.audio(ASSETS.SWAT_CRASH_AUDIO, 'swat_team_crash_in.wav')
    this.load.audio(ASSETS.THIS_ROOM_CLEAR_AUDIO, 'thisroomsclear.wav')
    this.load.audio(ASSETS.PICASSO_AUDIO, 'picasso.wav')
    this.load.image(ASSETS.SWAT_LEFT, 'swat_left.png')
    this.load.image(ASSETS.SWAT_RIGHT, 'swat_right.png')
    this.load.image(ASSETS.SWAT_TOP, 'swat_top.png')
    this.load.spritesheet(ASSETS.CLERK_RIGHT, 'clerk_right.png', {
      frameWidth: ASSETS.CLERK_FRAME_WIDTH,
      frameHeight: ASSETS.CLERK_FRAME_HEIGHT,
    })
    this.load.spritesheet(ASSETS.CLERK_LEFT, 'clerk_left.png', {
      frameWidth: ASSETS.CLERK_FRAME_WIDTH,
      frameHeight: ASSETS.CLERK_FRAME_HEIGHT,
    })
  }

  create() {
    const { width, height } = this.scale
    const layout = getLayout(width, height)

    this.cameras.main.setBackgroundColor(0x050608)

    this.createRoom(width, height, layout)
    this.createBible(width, height, layout)
    this.createClerk(width, height, layout)
    this.createUI(width, height, layout)
    this.createInput(width, height, layout)

    if (this.cache.audio.exists(ASSETS.OFFICE_AUDIO)) {
      this.officeMusic = this.sound.add(ASSETS.OFFICE_AUDIO, { loop: true })
      // Don't play yet on mobile—browsers block autoplay until first user tap
    }
  }

  /**
   * Room: either a single background image (if available) or full procedural fallback.
   */
  createRoom(width, height, layout) {
    if (this.textures.exists(ASSETS.OFFICE_BG)) {
      this.backgroundImage = this.add
        .image(width / 2, height / 2, ASSETS.OFFICE_BG)
        .setOrigin(0.5, 0.5)
      return
    }

    const g = this.add.graphics()

    g.fillStyle(0x141720, 1)
    g.fillRect(0, 0, width, height - 90)
    g.fillStyle(0x191b24, 1)
    g.fillRect(0, 18, width, height - 102)
    g.fillStyle(0x10131a, 1)
    g.fillRect(0, height - 120, width, 24)

    g.fillStyle(0x1b1f28, 1)
    g.fillRect(0, 26, width, 10)
    g.fillStyle(0x20242e, 1)
    g.fillRect(0, 36, width, 2)
    g.fillStyle(0x252938, 1)
    for (let x = 10; x < width - 20; x += 40) {
      g.fillRect(x, 29, 14, 3)
      g.fillStyle(0x181b24, 1)
      g.fillRect(x, 32, 14, 2)
      g.fillStyle(0x252938, 1)
    }

    g.fillStyle(0x22252a, 1)
    g.fillPoints(
      [
        { x: 10, y: height - 30 },
        { x: width - 10, y: height - 30 },
        { x: width - 50, y: height - 80 },
        { x: 50, y: height - 80 },
      ],
      true,
    )
    g.lineStyle(1, 0x1a1d22, 0.7)
    g.beginPath()
    g.moveTo(40, height - 50)
    g.lineTo(width / 2 - 20, height - 58)
    g.moveTo(width / 2 + 10, height - 45)
    g.lineTo(width - 40, height - 55)
    g.strokePath()

    g.fillStyle(0x30333c, 1)
    g.fillRect(20, height - 140, 26, 60)
    this.cabinet = this.add.rectangle(33, height - 110, 26, 40, 0x30333c).setOrigin(0.5)
    this.cabinetDrawer = this.add.rectangle(layout.cabinetDrawerX, layout.cabinetDrawerY, 22, 14, 0x383b46).setOrigin(0.5)

    const archivesText = this.add.text(12, height - 152, 'ARCHIVES', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ff4040',
    })
    archivesText.setAlpha(0.6)
    this.tweens.add({ targets: archivesText, alpha: { from: 0.3, to: 1 }, duration: 700, yoyo: true, repeat: -1 })

    g.fillStyle(0x333640, 1)
    g.fillRect(width / 2 - 36, height - 118, 72, 20)
    this.chair = this.add.rectangle(layout.chairX, layout.chairY, 16, 14, 0x252831)

    g.fillStyle(0x20252d, 1)
    g.fillRect(width / 2 - 6, height - 126, 18, 12)
    g.fillStyle(0x0e1117, 1)
    g.fillRect(width / 2 - 4, height - 124, 14, 8)
    g.fillStyle(0x444a55, 1)
    g.fillRect(width / 2 - 18, height - 118, 6, 8)
    const crtGlow = this.add.rectangle(width / 2 + 2, height - 120, 34, 22, 0x5fd0ff, 0.05).setOrigin(0.5)
    this.tweens.add({ targets: crtGlow, alpha: { from: 0.03, to: 0.09 }, duration: 900, yoyo: true, repeat: -1 })

    g.fillStyle(0x2b2e36, 1)
    g.fillRect(width - 70, height - 135, 32, 50)
    g.fillStyle(0x3a3d46, 1)
    g.fillRect(width - 72, height - 135, 36, 4)
  }

  createBible(width, height, layout) {
    const { bibleX, bibleY } = layout

    // Invisible interaction zone exactly over the Bible art in the background.
    this.bibleZone = this.add
      .zone(bibleX, bibleY, 40, 24)
      .setOrigin(0.5)
      .setInteractive({ useHandCursor: true })
  }

  createClerk(width, height, layout) {
    const { clerkStartX, clerkStartY, clerkFallbackY } = layout

    if (this.textures.exists(ASSETS.CLERK_RIGHT)) {
      this.clerk = this.add
        .sprite(clerkStartX, clerkStartY, ASSETS.CLERK_RIGHT, ASSETS.CLERK_IDLE_FRAME)
        .setOrigin(0.5, 1)
      this.usingClerkSprite = true

      // Idle = hold standing frame; walk = cycle frame 0 & 1 (stand + stride)
      if (!this.anims.exists('clerk_idle_right')) {
        this.anims.create({
          key: 'clerk_idle_right',
          frames: this.anims.generateFrameNumbers(ASSETS.CLERK_RIGHT, {
            start: ASSETS.CLERK_IDLE_FRAME,
            end: ASSETS.CLERK_IDLE_FRAME,
          }),
          frameRate: 2,
          repeat: -1,
        })
      }
      if (!this.anims.exists('clerk_walk_right')) {
        this.anims.create({
          key: 'clerk_walk_right',
          frames: this.anims.generateFrameNumbers(ASSETS.CLERK_RIGHT, {
            start: ASSETS.CLERK_WALK_FRAMES[0],
            end: ASSETS.CLERK_WALK_FRAMES[1],
          }),
          frameRate: 6,
          repeat: -1,
        })
      }
      if (this.textures.exists(ASSETS.CLERK_LEFT)) {
        if (!this.anims.exists('clerk_idle_left')) {
          this.anims.create({
            key: 'clerk_idle_left',
            frames: this.anims.generateFrameNumbers(ASSETS.CLERK_LEFT, {
              start: ASSETS.CLERK_IDLE_FRAME,
              end: ASSETS.CLERK_IDLE_FRAME,
            }),
            frameRate: 2,
            repeat: -1,
          })
        }
        if (!this.anims.exists('clerk_walk_left')) {
          this.anims.create({
            key: 'clerk_walk_left',
            frames: this.anims.generateFrameNumbers(ASSETS.CLERK_LEFT, {
              start: ASSETS.CLERK_WALK_FRAMES[0],
              end: ASSETS.CLERK_WALK_FRAMES[1],
            }),
            frameRate: 6,
            repeat: -1,
          })
        }
      }

      this.clerk.play('clerk_idle_right')
    } else {
      this.clerk = this.add.rectangle(clerkStartX, clerkFallbackY, 14, 24, 0xcbd5f5)
      this.clerkHead = this.add.rectangle(this.clerk.x, this.clerk.y - 18, 14, 14, 0xcbd5f5)
      this.glassesLeft = this.add.rectangle(this.clerkHead.x - 5, this.clerkHead.y - 1, 4, 4, 0x000000)
      this.glassesRight = this.add.rectangle(this.clerkHead.x + 5, this.clerkHead.y - 1, 4, 4, 0x000000)
      this.tie = this.add.rectangle(this.clerk.x, this.clerk.y + 4, 2, 8, 0xaa2020)
      this.pocket = this.add.rectangle(this.clerk.x + 3, this.clerk.y - 2, 5, 4, 0x1e2230)
      this.usingClerkSprite = false
    }
  }

  createUI(width, height, layout) {
    this.statusText = this.add.text(layout.statusTextX, layout.statusTextY, 'Click to stand up.', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#b0b6d1',
    })
    this.add.text(8, layout.introCaptionY, 'Low-Level Legal Processing Unit 14B – Night Shift.', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#9ea3c4',
      wordWrap: { width: width - 16 },
    })
  }

  createInput(width, height, layout) {
    const { floorYMin, floorYMax, bibleStandX, bibleStandY, clerkWalkY } = layout

    this.input.on('pointerdown', (pointer) => {
      this.unlockAudio()

      if (!this.clerk || this.sceneState === SCENE_STATE.RAID || this.sceneState === SCENE_STATE.LOGO) return

      if (this.sceneState === SCENE_STATE.INTRO_IDLE && this.isSeated && !this.movementEnabled) {
        this.isSeated = false
        this.movementEnabled = true
        this.sceneState = SCENE_STATE.FREE_WALK
        if (this.statusText) this.statusText.setText('Click on the floor to walk.')
        return
      }

      if (!this.movementEnabled) return
      if (pointer.y >= floorYMin && pointer.y <= floorYMax) {
        // Lock movement to the floor line so the clerk only moves horizontally.
        this.target = { x: pointer.x, y: clerkWalkY }
        this.walkingToBible = false
      }
    })

    this.bibleZone.on('pointerdown', () => {
      this.unlockAudio()
      if (!this.movementEnabled || this.bibleAcquired || this.sceneState !== SCENE_STATE.FREE_WALK) return
      this.target = { x: bibleStandX, y: bibleStandY }
      this.walkingToBible = true
    })
  }

  update(_, delta) {
    if (!this.clerk) return

    this.idleTime += delta
    const layout = getLayout(this.scale.width, this.scale.height)
    const { bibleStandX, bibleStandY } = layout

    if (this.target) {
      const speed = 0.12 * delta
      const dx = this.target.x - this.clerk.x
      const dy = this.target.y - this.clerk.y
      const dist = Math.hypot(dx, dy)
      if (dist < 1) {
        if (this.walkingToBible && !this.bibleAcquired) {
          this.clerk.x = bibleStandX
          this.clerk.y = bibleStandY
          this.target = null
          this.walkingToBible = false
          this.showBibleMenu()
        } else {
          this.target = null
        }
      } else {
        this.clerk.x += (dx / dist) * speed
        this.clerk.y += (dy / dist) * speed
        if (this.usingClerkSprite) {
          if (dx < 0) {
            this.facing = 'left'
            this.clerk.play('clerk_walk_left', true)
          } else if (dx > 0) {
            this.facing = 'right'
            this.clerk.play('clerk_walk_right', true)
          }
        }
      }
    }

    const bob =
      !this.target && (this.sceneState === SCENE_STATE.INTRO_IDLE || this.sceneState === SCENE_STATE.FREE_WALK)
        ? Math.sin(this.idleTime * 0.005) * 1
        : 0

    if (this.usingClerkSprite) {
      this.clerk.y += bob * 0.05
      if (!this.target) {
        this.clerk.play(this.facing === 'left' ? 'clerk_idle_left' : 'clerk_idle_right', true)
      }
    } else {
      this.clerkHead.x = this.clerk.x
      this.clerkHead.y = this.clerk.y - 18 + bob
      if (this.glassesLeft && this.glassesRight) {
        this.glassesLeft.x = this.clerkHead.x - 5
        this.glassesLeft.y = this.clerkHead.y - 1
        this.glassesRight.x = this.clerkHead.x + 5
        this.glassesRight.y = this.clerkHead.y - 1
      }
      if (this.tie && this.pocket) {
        this.tie.x = this.clerk.x
        this.tie.y = this.clerk.y + 4
        this.pocket.x = this.clerk.x + 3
        this.pocket.y = this.clerk.y - 2
      }
    }
  }

  showBibleMenu() {
    if (this.sceneState !== SCENE_STATE.FREE_WALK || this.bibleState === BIBLE_STATE.PICKED_UP) return

    const { width, height } = this.scale
    const layout = getLayout(width, height)
    this.sceneState = SCENE_STATE.BIBLE_READ

    const { bibleMenuX, bibleMenuY, bibleMenuW, bibleMenuH } = layout
    const bg = this.add.rectangle(bibleMenuX, bibleMenuY, bibleMenuW, bibleMenuH, 0x050608, 0.95).setOrigin(0, 0)
    bg.setStrokeStyle(1, 0xffffff, 0.6)
    const readText = this.add.text(bibleMenuX + 6, bibleMenuY + 6, '[Read corporate doctrine]', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#d0d5ff',
      wordWrap: { width: bibleMenuW - 12 },
    })
    const pickText = this.add.text(bibleMenuX + 6, bibleMenuY + 22, '[Pick up]', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ff6060',
    })
    readText.setInteractive({ useHandCursor: true })
    pickText.setInteractive({ useHandCursor: true })
    this.bibleMenuContainer = this.add.container(0, 0, [bg, readText, pickText])
    readText.on('pointerdown', () => this.handleBibleRead())
    pickText.on('pointerdown', () => this.handleBiblePickup())
  }

  handleBibleRead() {
    if (this.bibleState !== BIBLE_STATE.IN_SHELF) return

    this.bibleState = BIBLE_STATE.INSPECTED
    this.sceneState = SCENE_STATE.BIBLE_READ

    if (this.bibleMenuContainer) {
      this.bibleMenuContainer.destroy()
      this.bibleMenuContainer = null
    }

    const { width } = this.scale
    const layout = getLayout(width, this.scale.height)
    this.bibleReadText = this.add.text(
      width / 2,
      layout.readTextY,
      '"Every brand commandment,\n bound in red ink and bad faith."',
      {
        fontFamily: 'monospace',
        fontSize: '8px',
        color: '#f4f4f4',
        backgroundColor: '#000000d0',
        padding: { x: 4, y: 3 },
        align: 'center',
      },
    )
    this.bibleReadText.setOrigin(0.5, 0)

    this.time.delayedCall(150, () => {
      this.input.once('pointerdown', () => {
        if (this.bibleReadText) {
          this.bibleReadText.destroy()
          this.bibleReadText = null
        }
        this.sceneState = SCENE_STATE.FREE_WALK
      })
    })
  }

  handleBiblePickup() {
    if (this.bibleState === BIBLE_STATE.PICKED_UP) return

    const { width } = this.scale
    const layout = getLayout(width, this.scale.height)

    if (this.bibleMenuContainer) {
      this.bibleMenuContainer.destroy()
      this.bibleMenuContainer = null
    }

    if (this.bibleZone) this.bibleZone.disableInteractive()

    this.bibleAcquired = true
    this.bibleState = BIBLE_STATE.PICKED_UP
    this.sceneState = SCENE_STATE.BIBLE_PICKED

    // Bible disappears the moment they click Pick up
    if (this.backgroundImage && this.textures.exists(ASSETS.OFFICE_BG_NOBIBLE)) {
      this.backgroundImage.setTexture(ASSETS.OFFICE_BG_NOBIBLE)
    }

    if (this.cache.audio.exists(ASSETS.SWIPE_AUDIO)) {
      this.sound.play(ASSETS.SWIPE_AUDIO)
    }
    this.time.delayedCall(500, () => {
      if (this.cache.audio.exists(ASSETS.FIND_BIBLE_AUDIO)) {
        this.sound.play(ASSETS.FIND_BIBLE_AUDIO)
      }
    })

    this.overlayText = this.add.text(width / 2, layout.overlayTextY, 'You acquired the CoCA Bible.', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#f4f4f4',
      backgroundColor: '#000000c0',
      padding: { x: 4, y: 2 },
    })
    this.overlayText.setOrigin(0.5, 0)
    if (this.statusText) this.statusText.setText('')

    this.time.delayedCall(1000, () => {
      this.movementEnabled = false
      this.target = null
      this.sceneState = SCENE_STATE.BIBLE_PAUSE

      // Extra beat before SWAT breaks in
      this.time.delayedCall(2000, () => {
        this.startRaidSequence()
      })
    })
  }

  startRaidSequence() {
    if (this.sceneState !== SCENE_STATE.BIBLE_PAUSE) return
    this.sceneState = SCENE_STATE.RAID

    // Play SWAT crash-in sound as they enter.
    if (this.cache.audio.exists(ASSETS.SWAT_CRASH_AUDIO)) {
      this.sound.play(ASSETS.SWAT_CRASH_AUDIO)
    }

    const { width, height } = this.scale
    const layout = getLayout(width, height)
    const tweens = this.tweens

    // Swap to raid aftermath background as the military enters.
    if (this.backgroundImage && this.textures.exists(ASSETS.OFFICE_BG_RAID)) {
      this.backgroundImage.setTexture(ASSETS.OFFICE_BG_RAID)
    }

    const doorGlow = this.add.rectangle(layout.doorGlowX, layout.doorGlowY, 20, 40, 0xff0000, 0.5).setOrigin(0.5)
    tweens.add({ targets: doorGlow, alpha: { from: 0.2, to: 0.8 }, duration: 200, yoyo: true, repeat: 3 })

    const lockdownText = this.add.text(layout.lockdownTextX, layout.lockdownTextY, 'LOCKDOWN', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ff4040',
    })

    const makeUnit = (x, y, textureKey) => {
      if (this.textures.exists(textureKey)) {
        return this.add.image(x, y, textureKey).setOrigin(0.5, 0.5)
      }
      return this.add.rectangle(x, y, 14, 28, 0x1a2128).setStrokeStyle(1, 0x000000, 0.9)
    }
    const unitDoor = makeUnit(width + 20, layout.unitDoorY, ASSETS.SWAT_RIGHT)
    const unitVent = makeUnit(width / 2, -20, ASSETS.SWAT_TOP)
    const unitLeft = makeUnit(-20, layout.unitLeftY, ASSETS.SWAT_LEFT)
    this.swatUnits.push(unitDoor, unitVent, unitLeft)

    tweens.add({
      targets: unitDoor,
      x: layout.unitDoorEndX,
      duration: 350,
      delay: 150,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this.chair) {
          tweens.add({
            targets: this.chair,
            angle: 40,
            x: this.chair.x + layout.chairKnockDx,
            y: this.chair.y + layout.chairKnockDy,
            duration: 200,
            ease: 'Quad.easeOut',
          })
        }
      },
    })

    tweens.add({
      targets: unitVent,
      y: layout.unitVentEndY,
      duration: 400,
      delay: 250,
      ease: 'Quad.easeIn',
    })

    tweens.add({
      targets: unitLeft,
      x: layout.unitLeftEndX,
      duration: 400,
      delay: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        if (this.cabinetDrawer) {
          tweens.add({
            targets: this.cabinetDrawer,
            x: this.cabinetDrawer.x + layout.drawerOpenDx,
            duration: 180,
            ease: 'Quad.easeOut',
          })
        }
        for (let i = 0; i < 4; i += 1) {
          const paper = this.add.rectangle(
            this.cabinetDrawer ? this.cabinetDrawer.x : 40,
            layout.paperOriginY,
            6,
            4,
            0xe5e5e5,
          )
          this.paperSprites.push(paper)
          tweens.add({
            targets: paper,
            x: paper.x + Phaser.Math.Between(10, 40),
            y: paper.y + Phaser.Math.Between(6, 18),
            angle: Phaser.Math.Between(-25, 25),
            alpha: { from: 1, to: 0.7 },
            duration: 450,
            ease: 'Quad.easeOut',
          })
        }
      },
    })

    const scanner = this.add.rectangle(width / 2, layout.scannerY, width - 30, 6, 0xff0000, 0.25).setOrigin(0.5)
    scanner.alpha = 0
    tweens.add({
      targets: scanner,
      alpha: { from: 0, to: 0.4 },
      duration: 150,
      yoyo: true,
      repeat: 5,
      delay: 400,
      onUpdate: (tween) => {
        scanner.y = layout.scannerSweepMin + Math.sin(tween.progress * Math.PI) * layout.scannerSweepRange
      },
    })

    const commsText = this.add.text(8, layout.commsTextY, '[Comms]: Asset triggered scripture protocol.', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#cbd5ff',
      backgroundColor: '#000000c0',
      padding: { x: 3, y: 2 },
    })
    this.time.delayedCall(2000, () => commsText.setText('Unit: Negative. No scripture detected.'))

    this.time.delayedCall(4000, () => {
      if (this.cache.audio.exists(ASSETS.THIS_ROOM_CLEAR_AUDIO)) {
        this.sound.play(ASSETS.THIS_ROOM_CLEAR_AUDIO)
      }
      tweens.add({
        targets: [unitDoor, unitVent, unitLeft],
        x: (target) => (target === unitDoor ? width + 30 : target === unitVent ? width / 2 : -30),
        y: (target) => (target === unitVent ? -30 : target.y),
        alpha: { from: 1, to: 0 },
        duration: 400,
        ease: 'Quad.easeIn',
        onComplete: () => [unitDoor, unitVent, unitLeft].forEach((u) => u.destroy()),
      })

      tweens.add({
        targets: [doorGlow, scanner, lockdownText],
        alpha: { from: 1, to: 0 },
        duration: 300,
        ease: 'Quad.easeOut',
        onComplete: () => {
          doorGlow.destroy()
          scanner.destroy()
          lockdownText.destroy()
        },
      })

      commsText.destroy()

      this.time.delayedCall(1500, () => {
        this.sceneState = SCENE_STATE.LOGO
        const dimmer = this.add.rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 0).setOrigin(0.5)
        tweens.add({ targets: dimmer, alpha: { from: 0, to: 1 }, duration: 1200, ease: 'Quad.easeOut' })

        if (this.officeMusic) {
          tweens.add({
            targets: this.officeMusic,
            volume: { from: 1, to: 0 },
            duration: 1200,
            ease: 'Quad.easeOut',
            onComplete: () => {
              if (this.officeMusic) this.officeMusic.stop()
            },
          })
        }
        if (this.cache.audio.exists(ASSETS.PICASSO_AUDIO)) {
          this.sound.play(ASSETS.PICASSO_AUDIO)
        }

        const logoText = this.add.text(width / 2, height / 2 - 8, 'CoCA', {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#ff3030',
        }).setOrigin(0.5)
        const subText = this.add.text(width / 2, layout.logoSubtextY, 'Corporate Canonical Authority', {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#f4f4f4',
        }).setOrigin(0.5, 0)

        tweens.add({
          targets: [logoText, subText],
          scaleX: { from: 0.8, to: 1 },
          scaleY: { from: 0.8, to: 1 },
          duration: 1200,
          ease: 'Quad.easeOut',
        })
      })
    })
  }
}

export default function PhaserGame() {
  const containerRef = useRef(null)

  useEffect(() => {
    const config = {
      type: Phaser.AUTO,
      width: GAME_WIDTH,
      height: GAME_HEIGHT,
      parent: containerRef.current,
      backgroundColor: '#050608',
      pixelArt: true,
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      scene: OfficeScene,
    }

    const game = new Phaser.Game(config)
    return () => game.destroy(true)
  }, [])

  return <div className="phaser-root" ref={containerRef} />
}
