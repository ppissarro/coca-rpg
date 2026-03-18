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
import { enterLevel, LEVEL_KEYS } from './game/levelRegistry'
import { showRabbitholeOverlay } from './rabbitholeOverlay'

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

    this.isSeated = false
    this.movementEnabled = true
    this.walkingToBible = false
    this.bibleAcquired = false
    this.glassesAcquired = false
    this.glassesWorn = false
    this.glassesZone = null
    this.walkingToGlasses = false

    this.sceneState = SCENE_STATE.FREE_WALK
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
    this.waynesBg = null
    this.waynesMusic = null
    this.cat = null
    this.catDirection = 1
    this.waynesTransformed = false
    this.waynesNcrOfficer = null
    this.ncrFacing = 'right'

    this.inventoryOpen = false
    this.inventoryContainer = null

    this.bibleReadCount = 0
    this.rabbitholeVideoWrapper = null
    this.rabbitholeVideo = null
    this.rabbitholeDomVideo = null
    this.rabbitholeWobbleEvent = null
    this.freefallClerk = null
    this.cocaBgImage = null
    this.inventoryBtn = null
    this.prayZone = null
    this.prayZoneDomEl = null
    this.prayMenuContainer = null
    this.praySprite = null

    this.executiveCokeBoss = null
    this.executiveCokeBossOffsetX = null // X offset from executiveBg (coke boss fixed in room)
    this.executiveGuardSequence = null // null | 'active' (dialogue + pan)
    this.executiveGuardDialogueContainer = null
    this.executiveGuardDialogueIndex = 0
  }

  unlockAudio() {
    if (this.audioUnlocked) return
    this.audioUnlocked = true
    if (this.sound.context && typeof this.sound.context.resume === 'function') {
      this.sound.context.resume()
    }
    this.tryPlayOfficeMusic()
  }

  tryPlayOfficeMusic() {
    if (this.sceneState === SCENE_STATE.FREE_WALK && this.officeMusic && !this.officeMusic.isPlaying) {
      try { this.officeMusic.play() } catch (_) {}
    }
  }

  init() {
    // Register Test Rabbithole handlers early (before preload) so button finds them sooner
    window.__phaserScene = this
    window.__triggerRabbithole = () => {
      if (window.__rabbitholeRequested) window.__rabbitholeRequested = false
      if (this.sceneState !== SCENE_STATE.RABBITHOLE || window.__forceRabbithole) {
        this.startRabbitholeSequence()
      }
    }
    window.__runRabbitholeDirect = () => {
      this.sceneState = SCENE_STATE.RABBITHOLE
      this.startRabbitholeSequence()
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
    this.load.audio(ASSETS.EVERYBRAND_AUDIO, 'everybrand.mp3')
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
    this.load.image(ASSETS.COCA_INTERMISSION, 'coca.jpeg')
    this.load.image(ASSETS.WAYNES_BG, 'waynes_bg.png')
    this.load.image(ASSETS.SUNGLASSES, 'sunglasses.png')
    this.load.audio(ASSETS.WAYNES_AUDIO, 'waynes.wav')
    this.load.spritesheet(ASSETS.CAT_LEFT, 'cat_left.png', {
      frameWidth: ASSETS.CAT_FRAME_WIDTH,
      frameHeight: ASSETS.CAT_FRAME_HEIGHT,
    })
    this.load.spritesheet(ASSETS.CAT_RIGHT, 'cat_right.png', {
      frameWidth: ASSETS.CAT_FRAME_WIDTH,
      frameHeight: ASSETS.CAT_FRAME_HEIGHT,
    })
    this.load.image(ASSETS.BIBLE, 'bible.png')
    this.load.image(ASSETS.FREEFALL_LEFT, 'freefall_left.png')
    this.load.image(ASSETS.FREEFALL_RIGHT, 'freefall_right.png')
    this.load.audio(ASSETS.FREEFALL_LOOP_AUDIO, 'freefall_loop.wav')
    this.load.audio(ASSETS.COCA_LAND_AUDIO, 'coca.mp3')
    this.load.image(ASSETS.COCA_BG, 'coca_bg.jpg')
    this.load.image(ASSETS.PRAY, 'pray.png')
    this.load.audio(ASSETS.PRAY_AUDIO, 'pray.mp3')
    this.load.spritesheet(ASSETS.SHRUG, 'shrug.png', {
      frameWidth: ASSETS.SHRUG_FRAME_WIDTH,
      frameHeight: ASSETS.SHRUG_FRAME_HEIGHT,
    })
    this.load.video(ASSETS.RABBITHOLE_VIDEO, 'rabbithole.mp4', true)
    this.load.image(ASSETS.HQ, 'hq.png')
    this.load.image(ASSETS.HQ2, 'hq2.png')
    this.load.audio(ASSETS.HQ1_AUDIO, 'hq1.wav')
    this.load.audio(ASSETS.HQ2_AUDIO, 'hq2.wav')
    this.load.audio(ASSETS.SUPREME_COURT_AUDIO, 'supremecourt.wav')
    this.load.audio(ASSETS.LAWSUIT_AUDIO, 'lawsuit.wav')
    this.load.audio(ASSETS.TRANSFORM_AUDIO, 'transform.wav')
    this.load.image(ASSETS.SUPREME_COURT, 'supremecourt.png')
    this.load.image(ASSETS.SUPREME_COURT_2, 'supremecourt2.png')
    this.load.image(ASSETS.COKEBOSS, 'cokeboss.png')
    this.load.spritesheet(ASSETS.NCR_OFFICER, 'ncrcamofficer_right.png', {
      frameWidth: ASSETS.NCR_FRAME_WIDTH,
      frameHeight: ASSETS.NCR_FRAME_HEIGHT,
    })
    this.load.spritesheet(ASSETS.NCR_OFFICER_LEFT, 'ncrcamofficer_left.png', {
      frameWidth: ASSETS.NCR_FRAME_WIDTH,
      frameHeight: ASSETS.NCR_FRAME_HEIGHT,
    })
  }

  create() {
    const { width, height } = this.scale
    const layout = getLayout(width, height)

    // Register for Test Rabbithole button – fires from any state
    window.__phaserScene = this
    window.__triggerRabbithole = () => {
      if (window.__rabbitholeRequested) window.__rabbitholeRequested = false
      if (this.sceneState !== SCENE_STATE.RABBITHOLE || window.__forceRabbithole) {
        this.startRabbitholeSequence()
      }
    }
    // Direct fallback – same full sequence (sink → overlay). No early return so user can retry if stuck.
    window.__runRabbitholeDirect = () => {
      this.sceneState = SCENE_STATE.RABBITHOLE
      this.startRabbitholeSequence()
    }

    this.cameras.main.setBackgroundColor(0x050608)

    this.createRoom(width, height, layout)
    this.createBible(width, height, layout)
    this.createClerk(width, height, layout)
    this.createUI(width, height, layout)
    this.createInput(width, height, layout)
    this.createInventoryKey()
    this.createShrugAnim()
    this.createNcrAnim()

    if (this.cache.audio.exists(ASSETS.OFFICE_AUDIO)) {
      this.officeMusic = this.sound.add(ASSETS.OFFICE_AUDIO, { loop: true })
      const startOnFirstInteraction = () => {
        this.unlockAudio()
        if (this._startOverlay) {
          this._startOverlay.destroy()
          this._startOverlay = null
        }
      }
      const overlayRect = this.add
        .rectangle(width / 2, height / 2, width + 20, height + 20, 0x000000, 0.4)
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
      const startText = this.add.text(width / 2, height / 2, 'Click to start', {
        fontFamily: 'monospace',
        fontSize: '10px',
        color: '#d0d5ff',
      }).setOrigin(0.5)
      this._startOverlay = this.add.container(0, 0, [overlayRect, startText]).setDepth(10000)
      overlayRect.on('pointerdown', startOnFirstInteraction)
      startText.setInteractive({ useHandCursor: true })
      startText.on('pointerdown', startOnFirstInteraction)
      this.input.once('pointerdown', startOnFirstInteraction)
      document.addEventListener('click', startOnFirstInteraction, { once: true })
      document.addEventListener('keydown', startOnFirstInteraction, { once: true })
      document.addEventListener('touchstart', startOnFirstInteraction, { once: true })
    }
    // Re-bind Test Rabbithole button now that scene is ready (__phaserScene is set)
    if (typeof window.initRabbitholeButton === 'function') {
      window.initRabbitholeButton()
    }
  }

  createNcrAnim() {
    if (!this.textures.exists(ASSETS.NCR_OFFICER) || this.anims.exists('ncr_walk')) return
    this.anims.create({
      key: 'ncr_idle',
      frames: this.anims.generateFrameNumbers(ASSETS.NCR_OFFICER, {
        start: ASSETS.NCR_IDLE_FRAME,
        end: ASSETS.NCR_IDLE_FRAME,
      }),
      frameRate: 2,
      repeat: -1,
    })
    this.anims.create({
      key: 'ncr_walk',
      frames: this.anims.generateFrameNumbers(ASSETS.NCR_OFFICER, {
        start: ASSETS.NCR_WALK_FRAMES[0],
        end: ASSETS.NCR_WALK_FRAMES[1],
      }),
      frameRate: 8,
      repeat: -1,
    })
    if (this.textures.exists(ASSETS.NCR_OFFICER_LEFT)) {
      this.anims.create({
        key: 'ncr_idle_left',
        frames: this.anims.generateFrameNumbers(ASSETS.NCR_OFFICER_LEFT, {
          start: ASSETS.NCR_IDLE_FRAME,
          end: ASSETS.NCR_IDLE_FRAME,
        }),
        frameRate: 2,
        repeat: -1,
      })
      this.anims.create({
        key: 'ncr_walk_left',
        frames: this.anims.generateFrameNumbers(ASSETS.NCR_OFFICER_LEFT, {
          start: ASSETS.NCR_WALK_FRAMES[0],
          end: ASSETS.NCR_WALK_FRAMES[1],
        }),
        frameRate: 8,
        repeat: -1,
      })
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

  handleGlassesPickup() {
    if (this.glassesAcquired) return
    this.glassesAcquired = true
    if (this.glassesProp) {
      this.glassesProp.destroy()
      this.glassesProp = null
    }
    const { width } = this.scale
    const layout = getLayout(width, this.scale.height)
    if (this.overlayText) this.overlayText.destroy()
    this.overlayText = this.add.text(width / 2, layout.overlayTextY, 'You picked up sunglasses.', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#f4f4f4',
      backgroundColor: '#000000c0',
      padding: { x: 4, y: 2 },
    })
    this.overlayText.setOrigin(0.5, 0)
    this.time.delayedCall(2000, () => {
      if (this.overlayText) this.overlayText.destroy()
      this.overlayText = null
    })
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
    }

    if (!this.textures.exists(ASSETS.CLERK_RIGHT)) {
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
    this.statusText = this.add.text(layout.statusTextX, layout.statusTextY, 'Click on the floor to walk.', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#b0b6d1',
    }).setDepth(100)
    this.introCaptionText = this.add.text(8, layout.introCaptionY, 'Low-Level Legal Processing Unit 14B – Night Shift.', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#9ea3c4',
      wordWrap: { width: width - 16 },
    }).setDepth(100)
    const { inventoryBtnX, inventoryBtnY, inventoryBtnW, inventoryBtnH } = layout
    const invBg = this.add
      .rectangle(0, 0, inventoryBtnW, inventoryBtnH, 0x0a1628, 0.95)
      .setOrigin(0, 0)
    invBg.setStrokeStyle(1, 0x3d5a80, 0.9)
    const invLabel = this.add.text(6, 4, 'Inventory', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#8ecae6',
    })
    this.inventoryBtn = this.add.container(inventoryBtnX, inventoryBtnY, [invBg, invLabel])
    this.inventoryBtn
      .setInteractive(
        new Phaser.Geom.Rectangle(0, 0, inventoryBtnW, inventoryBtnH),
        Phaser.Geom.Rectangle.Contains,
      )
      .setDepth(5000)
    this.inventoryBtn.on('pointerdown', () => {
      this.unlockAudio()
      if (this.sceneState !== SCENE_STATE.WAYNES_ROOM && this.sceneState !== SCENE_STATE.EXECUTIVE_SUITE && !this.executiveGuardSequence) return
      if (this.inventoryOpen) this.hideInventory()
      else this.showInventory()
    })
    this.inventoryBtn.setVisible(false) // Shown in Wayne's room and during executive guard sequence
  }

  createInput(width, height, layout) {
    const { floorYMin, floorYMax, bibleStandX, bibleStandY, clerkWalkY, cocaFloorYMin, cocaFloorYMax, cocaWalkY } = layout

    this.input.on('pointerdown', (pointer) => {
      this.unlockAudio()

      if (this.inventoryOpen) return
      if (!this.clerk || this.sceneState === SCENE_STATE.RAID || this.sceneState === SCENE_STATE.LOGO || this.sceneState === SCENE_STATE.INTERMISSION || this.sceneState === SCENE_STATE.RABBITHOLE || this.sceneState === SCENE_STATE.LAWSUIT || this.sceneState === SCENE_STATE.SUPREME_COURT) return

      if (!this.movementEnabled && this.sceneState !== SCENE_STATE.WAYNES_ROOM && this.sceneState !== SCENE_STATE.COCA_LANDED && this.sceneState !== SCENE_STATE.EXECUTIVE_SUITE) return
      if (this.executiveGuardSequence) return

      const isCoca = this.sceneState === SCENE_STATE.COCA_LANDED
      const isWaynes = this.sceneState === SCENE_STATE.WAYNES_ROOM
      const isExecutive = this.sceneState === SCENE_STATE.EXECUTIVE_SUITE
      const floorMin = isExecutive ? layout.executiveFloorYMin : (isCoca ? cocaFloorYMin : floorYMin)
      const floorMax = isExecutive ? layout.executiveFloorYMax : (isCoca ? cocaFloorYMax : floorYMax)
      const walkY = isExecutive ? layout.executiveWalkY : (isCoca ? cocaWalkY : clerkWalkY)
      if (pointer.y >= floorMin && pointer.y <= floorMax) {
        if (isExecutive && this.executiveGuardSequence) return
        let targetX = pointer.x
        if (this.sceneState === SCENE_STATE.FREE_WALK && layout.clerkLeftBound != null && layout.clerkRightBound != null) {
          targetX = Phaser.Math.Clamp(pointer.x, layout.clerkLeftBound, layout.clerkRightBound)
        } else if (isWaynes && layout.waynesClerkLeftBound != null && layout.waynesClerkRightBound != null) {
          targetX = Phaser.Math.Clamp(pointer.x, layout.waynesClerkLeftBound, layout.waynesClerkRightBound)
        } else if (isExecutive && layout.executiveClerkLeftBound != null && layout.executiveClerkRightBound != null) {
          targetX = Phaser.Math.Clamp(pointer.x, layout.executiveClerkLeftBound, layout.executiveClerkRightBound)
        }
        this.target = { x: targetX, y: walkY }
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

  createShrugAnim() {
    if (!this.textures.exists(ASSETS.SHRUG) || this.anims.exists('shrug')) return
    this.anims.create({
      key: 'shrug',
      frames: this.anims.generateFrameNumbers(ASSETS.SHRUG, { start: 0, end: 3 }),
      frameRate: 2, // 1 frame per 0.5 seconds
      repeat: 0,
    })
  }

  createInventoryKey() {
    this.input.keyboard.on('keydown-I', () => {
      if (this.sceneState !== SCENE_STATE.WAYNES_ROOM) return
      if (this.inventoryOpen) this.hideInventory()
      else this.showInventory()
    })
    // Left/right movement (arrow keys and A/D)
    const MOVE_STEP = 36
    const moveLeftRight = (dir) => {
      if (this.inventoryOpen || !this.clerk) return
      if (this.sceneState === SCENE_STATE.RAID || this.sceneState === SCENE_STATE.LOGO || this.sceneState === SCENE_STATE.INTERMISSION || this.sceneState === SCENE_STATE.RABBITHOLE || this.sceneState === SCENE_STATE.LAWSUIT || this.sceneState === SCENE_STATE.SUPREME_COURT) return
      if (!this.movementEnabled && this.sceneState !== SCENE_STATE.WAYNES_ROOM && this.sceneState !== SCENE_STATE.COCA_LANDED && this.sceneState !== SCENE_STATE.EXECUTIVE_SUITE) return
      if (this.executiveGuardSequence) return

      const layout = getLayout(this.scale.width, this.scale.height)
      const player = (this.sceneState === SCENE_STATE.EXECUTIVE_SUITE && this.waynesNcrOfficer)
        ? this.waynesNcrOfficer
        : (this.sceneState === SCENE_STATE.WAYNES_ROOM && this.waynesTransformed && this.waynesNcrOfficer)
          ? this.waynesNcrOfficer
          : this.clerk
      const { clerkWalkY, executiveWalkY, cocaWalkY } = layout
      let leftBound, rightBound, walkY
      if (this.sceneState === SCENE_STATE.FREE_WALK) {
        leftBound = layout.clerkLeftBound
        rightBound = layout.clerkRightBound
        walkY = clerkWalkY
      } else if (this.sceneState === SCENE_STATE.WAYNES_ROOM) {
        leftBound = layout.waynesClerkLeftBound
        rightBound = layout.waynesClerkRightBound
        walkY = clerkWalkY
      } else if (this.sceneState === SCENE_STATE.EXECUTIVE_SUITE) {
        leftBound = layout.executiveClerkLeftBound
        rightBound = layout.executiveClerkRightBound
        walkY = executiveWalkY
      } else if (this.sceneState === SCENE_STATE.COCA_LANDED) {
        leftBound = layout.clerkLeftBound
        rightBound = layout.clerkRightBound
        walkY = cocaWalkY
      } else return

      this.unlockAudio()
      this.walkingToBible = false
      let targetX = player.x + dir * MOVE_STEP
      targetX = Phaser.Math.Clamp(targetX, leftBound, rightBound)
      this.target = { x: targetX, y: walkY }
    }
    const leftKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.LEFT)
    const rightKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.RIGHT)
    const aKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.A)
    const dKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.D)
    leftKey.on('down', () => moveLeftRight(-1))
    rightKey.on('down', () => moveLeftRight(1))
    aKey.on('down', () => moveLeftRight(-1))
    dKey.on('down', () => moveLeftRight(1))
    // Document listener so arrow keys work without canvas focus
    this._moveKeyHandler = (e) => {
      if (e.key === 'ArrowLeft' || e.key === 'a' || e.key === 'A') {
        e.preventDefault()
        moveLeftRight(-1)
      } else if (e.key === 'ArrowRight' || e.key === 'd' || e.key === 'D') {
        e.preventDefault()
        moveLeftRight(1)
      }
    }
    document.addEventListener('keydown', this._moveKeyHandler)
    // Debug: R triggers rabbithole – use document listener so it works without canvas focus
    this._rKeyHandler = (e) => {
      if ((e.key !== 'r' && e.key !== 'R') || this.sceneState === SCENE_STATE.RABBITHOLE) return
      const ok =
        this.sceneState === SCENE_STATE.FREE_WALK ||
        this.sceneState === SCENE_STATE.WAYNES_ROOM ||
        this.sceneState === SCENE_STATE.COCA_LANDED
      if (ok) this.startRabbitholeSequence()
    }
    document.addEventListener('keydown', this._rKeyHandler)
    // React App button fires 'triggerRabbithole' event – listen here
    this._rabbitholeListener = () => {
      if (this.sceneState !== SCENE_STATE.RABBITHOLE) {
        this.startRabbitholeSequence()
      }
    }
    window.addEventListener('triggerRabbithole', this._rabbitholeListener)
    // Test Rabbithole button lives in App.jsx (single button, id=test-rabbithole-btn)
  }

  shutdown() {
    if (this._moveKeyHandler) {
      document.removeEventListener('keydown', this._moveKeyHandler)
    }
    if (this._rKeyHandler) {
      document.removeEventListener('keydown', this._rKeyHandler)
    }
    if (this._rabbitholeListener) {
      window.removeEventListener('triggerRabbithole', this._rabbitholeListener)
    }
    if (this._bibleDismissDoc) {
      document.removeEventListener('click', this._bibleDismissDoc)
      document.removeEventListener('touchend', this._bibleDismissDoc)
      this._bibleDismissDoc = null
    }
  }

  showInventory() {
    if (this.sceneState !== SCENE_STATE.WAYNES_ROOM && this.sceneState !== SCENE_STATE.EXECUTIVE_SUITE && !this.executiveGuardSequence) return
    if (this.inventoryContainer) return
    this.inventoryOpen = true
    const { width, height } = this.scale
    const panelW = 140
    const panelH = 80
    const x = (width - panelW) / 2
    const y = (height - panelH) / 2
    const backdrop = this.add
      .rectangle(width / 2, height / 2, width + 20, height + 20, 0x000000, 0.3)
      .setOrigin(0.5, 0.5)
      .setInteractive({ useHandCursor: false })
    backdrop.on('pointerdown', () => this.hideInventory())
    const bg = this.add.rectangle(x, y, panelW, panelH, 0x0a1628, 0.98).setOrigin(0, 0)
    bg.setStrokeStyle(1, 0x3d5a80, 0.9)
    bg.setInteractive() // Consume clicks so backdrop doesn't close when clicking panel
    const title = this.add.text(x + 8, y + 6, 'Inventory', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#8ecae6',
    })
    const children = [backdrop, bg, title]
    if (this.glassesAcquired) {
      const glassesBg = this.add.rectangle(x + 100, y + 48, 24, 16, 0x2a2a3a).setOrigin(0.5, 0.5)
      const glassesLabel = this.add.text(x + 100, y + 48, '👓', { fontSize: '12px' }).setOrigin(0.5, 0.5)
      const glassesText = this.add.text(x + 100, y + 62, this.glassesWorn ? '[Remove]' : '[Wear]', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: this.glassesWorn ? '#8a8a9a' : '#8ecae6',
      }).setOrigin(0.5, 0)
      const glassesClick = () => {
        this.glassesWorn = !this.glassesWorn
        glassesText.setText(this.glassesWorn ? '[Remove]' : '[Wear]')
        glassesText.setColor(this.glassesWorn ? '#8a8a9a' : '#8ecae6')
        if (this.glassesWorn && this.sceneState === SCENE_STATE.EXECUTIVE_SUITE) this.applyGlassesEffect()
      }
      glassesBg.setInteractive({ useHandCursor: true })
      glassesLabel.setInteractive({ useHandCursor: true })
      glassesBg.on('pointerdown', glassesClick)
      glassesLabel.on('pointerdown', glassesClick)
      children.push(glassesBg, glassesLabel, glassesText)
    }
    if (this.bibleAcquired && this.textures.exists(ASSETS.BIBLE)) {
      const bibleImg = this.add.image(x + 28, y + 48, ASSETS.BIBLE).setOrigin(0.5, 0.5)
      bibleImg.setScale(1.2)
      bibleImg.setInteractive({ useHandCursor: true })
      bibleImg.on('pointerdown', () => {
        if (this.executiveGuardSequence) {
          this.showExecutiveBibleChoiceMenu()
        } else {
          this.showBibleChoiceMenu()
        }
      })
      const tooltipLabel = this.executiveGuardSequence ? 'Read or throw the book' : 'CoCA Bible'
      const tooltip = this.add.text(0, 0, tooltipLabel, {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#d0d5ff',
        backgroundColor: '#0a1628',
        padding: { x: 4, y: 2 },
      }).setOrigin(0, 1).setDepth(7000).setVisible(false)
      const onMove = (pointer) => {
        tooltip.setPosition(pointer.x + 8, pointer.y - 8)
      }
      bibleImg.on('pointerover', () => {
        tooltip.setVisible(true)
        this.input.on('pointermove', onMove)
      })
      bibleImg.on('pointerout', () => {
        tooltip.setVisible(false)
        this.input.off('pointermove', onMove)
      })
      children.push(bibleImg, tooltip)
    }
    if (!this.bibleAcquired && !this.glassesAcquired) {
      const emptyText = this.add.text(x + 8, y + 32, '(empty)', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#6b7a8a',
      })
      children.push(emptyText)
    }
    this.inventoryContainer = this.add.container(0, 0, children)
    this.inventoryContainer.setDepth(6000)
  }

  hideInventory() {
    if (this.inventoryContainer) {
      this.inventoryContainer.destroy()
      this.inventoryContainer = null
    }
    this.inventoryOpen = false
  }

  showBibleChoiceMenu() {
    if (this.bibleChoiceContainer) return
    this.unlockAudio()
    this.hideInventory()
    const { width, height } = this.scale
    const layout = getLayout(width, height)
    const panelW = 148
    const panelH = 70
    const x = (width - panelW) / 2
    const y = (height - panelH) / 2
    const backdrop = this.add.rectangle(width / 2, height / 2, width + 20, height + 20, 0x000000, 0.7).setOrigin(0.5).setInteractive()
    const bg = this.add.rectangle(x, y, panelW, panelH, 0x0a1628, 0.98).setOrigin(0, 0).setStrokeStyle(2, 0x3d5a80, 0.9)
    const title = this.add.text(x + 12, y + 8, 'CoCA Bible', { fontFamily: 'monospace', fontSize: '10px', color: '#8ecae6' })
    const studyBtn = this.add.text(x + 12, y + 28, '[Study]', { fontFamily: 'monospace', fontSize: '10px', color: '#d0d5ff' }).setInteractive({ useHandCursor: true })
    const readBtn = this.add.text(x + 12, y + 46, '[Read]', { fontFamily: 'monospace', fontSize: '10px', color: '#ff6060' }).setInteractive({ useHandCursor: true })

    const close = () => {
      if (this.bibleChoiceContainer) {
        this.bibleChoiceContainer.destroy()
        this.bibleChoiceContainer = null
      }
      this.showInventory()
    }

    studyBtn.on('pointerdown', () => {
      if (this.bibleChoiceContainer) {
        this.bibleChoiceContainer.destroy()
        this.bibleChoiceContainer = null
      }
      this.handleBibleStudy()
    })
    readBtn.on('pointerdown', () => {
      if (this.bibleChoiceContainer) {
        this.bibleChoiceContainer.destroy()
        this.bibleChoiceContainer = null
      }
      this.showBibleQuoteAndFall()
    })
    backdrop.on('pointerdown', close)

    this.bibleChoiceContainer = this.add.container(0, 0, [backdrop, bg, title, studyBtn, readBtn])
    this.bibleChoiceContainer.setDepth(7000)
  }

  showExecutiveBibleChoiceMenu() {
    if (this.bibleChoiceContainer) return
    this.unlockAudio()
    this.hideInventory()
    const { width, height } = this.scale
    const panelW = 148
    const panelH = 70
    const x = (width - panelW) / 2
    const y = (height - panelH) / 2
    const backdrop = this.add.rectangle(width / 2, height / 2, width + 20, height + 20, 0x000000, 0.7).setOrigin(0.5).setInteractive()
    const bg = this.add.rectangle(x, y, panelW, panelH, 0x0a1628, 0.98).setOrigin(0, 0).setStrokeStyle(2, 0x3d5a80, 0.9)
    const title = this.add.text(x + 12, y + 8, 'CoCA Bible', { fontFamily: 'monospace', fontSize: '10px', color: '#8ecae6' })
    const readBtn = this.add.text(x + 12, y + 28, '[Read]', { fontFamily: 'monospace', fontSize: '10px', color: '#ff6060' }).setInteractive({ useHandCursor: true })
    const throwBtn = this.add.text(x + 12, y + 46, '[Throw the book]', { fontFamily: 'monospace', fontSize: '10px', color: '#d0d5ff' }).setInteractive({ useHandCursor: true })

    const close = () => {
      if (this.bibleChoiceContainer) {
        this.bibleChoiceContainer.destroy()
        this.bibleChoiceContainer = null
      }
      this.showInventory()
    }

    readBtn.on('pointerdown', () => {
      if (this.bibleChoiceContainer) {
        this.bibleChoiceContainer.destroy()
        this.bibleChoiceContainer = null
      }
      this.triggerFallFromExecutiveBible()
    })
    throwBtn.on('pointerdown', () => {
      if (this.bibleChoiceContainer) {
        this.bibleChoiceContainer.destroy()
        this.bibleChoiceContainer = null
      }
      this.triggerBibleThrow()
    })
    backdrop.on('pointerdown', close)

    this.bibleChoiceContainer = this.add.container(0, 0, [backdrop, bg, title, readBtn, throwBtn])
    this.bibleChoiceContainer.setDepth(7000)
  }

  triggerFallFromExecutiveBible() {
    if (!this.executiveGuardSequence) return
    this.executiveGuardSequence = null
    this.movementEnabled = true
    if (this.executiveGuardDialogueContainer) {
      this.executiveGuardDialogueContainer.destroy()
      this.executiveGuardDialogueContainer = null
    }
    if (this.inventoryBtn) this.inventoryBtn.setVisible(false)
    this.showBibleQuoteAndFall()
  }

  handleBibleStudy() {
    if (this.waynesTransformed || this.sceneState !== SCENE_STATE.WAYNES_ROOM) return
    this.waynesTransformed = true
    this.unlockAudio()
    this.hideInventory()
    if (this.waynesMusic?.isPlaying) this.waynesMusic.stop()
    if (this.cache.audio.exists(ASSETS.TRANSFORM_AUDIO)) {
      this.time.delayedCall(1500, () => this.sound.play(ASSETS.TRANSFORM_AUDIO))
    }
    const layout = getLayout(this.scale.width, this.scale.height)
    const posX = this.clerk?.x ?? this.scale.width / 2
    const posY = this.clerk?.y ?? layout.clerkWalkY
    if (this.waynesNcrOfficer) {
      this.waynesNcrOfficer.destroy()
      this.waynesNcrOfficer = null
    }

    const setClerkAlpha = (a) => {
      if (this.clerk) this.clerk.setAlpha(a)
      if (this.clerkHead) this.clerkHead.setAlpha(a)
      if (this.glassesLeft) this.glassesLeft.setAlpha(a)
      if (this.glassesRight) this.glassesRight.setAlpha(a)
      if (this.tie) this.tie.setAlpha(a)
      if (this.pocket) this.pocket.setAlpha(a)
    }

    // Phase 1: Clerk blinks in and out (several seconds)
    const blinkOutDur = 350
    const blinkInDur = 350
    const blinkCount = 5
    let blinkStep = 0
    const doBlink = () => {
      if (blinkStep >= blinkCount) {
        // Phase 2: White flash
        const flash = this.add
          .rectangle(this.scale.width / 2, this.scale.height / 2, this.scale.width + 40, this.scale.height + 40, 0xffffff, 1)
          .setOrigin(0.5)
          .setDepth(99999)
        // Phase 3: Pause, then Phase 4: Reveal NCR and walk out
        const flashHold = 800
        const pauseBeforeWalk = 1000
        this.time.delayedCall(flashHold + pauseBeforeWalk, () => {
          flash.destroy()
          setClerkAlpha(0)
          if (this.clerk) this.clerk.setVisible(false)
          if (this.clerkHead) this.clerkHead.setVisible(false)
          if (this.glassesLeft) this.glassesLeft.setVisible(false)
          if (this.glassesRight) this.glassesRight.setVisible(false)
          if (this.tie) this.tie.setVisible(false)
          if (this.pocket) this.pocket.setVisible(false)
          if (this.textures.exists(ASSETS.NCR_OFFICER)) {
            this.waynesNcrOfficer = this.add
              .sprite(posX, posY, ASSETS.NCR_OFFICER, 0)
              .setOrigin(0.5, 1)
              .setDepth(10)
            this.ncrFacing = 'right'
          }
          this.target = { x: layout.waynesClerkRightBound - 5, y: layout.clerkWalkY }
        })
        return
      }
      setClerkAlpha(0)
      this.time.delayedCall(blinkOutDur, () => {
        setClerkAlpha(1)
        blinkStep += 1
        this.time.delayedCall(blinkInDur, doBlink)
      })
    }
    doBlink()
  }

  showBibleQuoteAndFall() {
    if (this.bibleReadText) return
    this._bibleReadClosing = false
    this.unlockAudio()
    const everybrandSound = this.cache.audio.exists(ASSETS.EVERYBRAND_AUDIO)
      ? this.sound.add(ASSETS.EVERYBRAND_AUDIO)
      : null
    if (everybrandSound) everybrandSound.play()
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
      const close = () => {
        if (!this.bibleReadText) return
        timeout?.remove()
        if (everybrandSound?.isPlaying) everybrandSound.stop()
        if (this._bibleDismissDoc) {
          document.removeEventListener('click', this._bibleDismissDoc)
          document.removeEventListener('touchend', this._bibleDismissDoc)
          this._bibleDismissDoc = null
        }
        this.onBibleReadClosed(false)
      }
      const timeout = this.time.delayedCall(25000, close)
      if (everybrandSound) {
        everybrandSound.once('complete', close)
      } else {
        this.time.delayedCall(5000, close)
      }
    })
  }

  onBibleReadClosed(fromShelf) {
    if (this._bibleReadClosing) return
    this._bibleReadClosing = true
    if (this.bibleReadText) {
      this.bibleReadText.destroy()
      this.bibleReadText = null
    }
    const doStart = () => this.startRabbitholeSequence()
    if (fromShelf) {
      this.time.delayedCall(50, doStart)
      setTimeout(doStart, 150) // Backup in case Phaser delayedCall misfires
      return
    }
    this.hideInventory()
    this.time.delayedCall(100, doStart)
    setTimeout(doStart, 200) // Backup
  }

  update(_, delta) {
    // Button sets window.__rabbitholeRequested – check every frame (no timing/event issues)
    if (window.__rabbitholeRequested && (this.sceneState !== SCENE_STATE.RABBITHOLE || window.__forceRabbithole)) {
      window.__rabbitholeRequested = false
      this.startRabbitholeSequence()
    }

    if (!this.clerk) return

    if (this.sceneState === SCENE_STATE.RABBITHOLE) return

    this.idleTime += delta
    if (this.audioUnlocked && this.sceneState === SCENE_STATE.FREE_WALK && this.officeMusic && !this.officeMusic.isPlaying) {
      this.tryPlayOfficeMusic()
    }
    const layout = getLayout(this.scale.width, this.scale.height)
    const { bibleStandX, bibleStandY } = layout

    if (this.target) {
      const player = (this.sceneState === SCENE_STATE.EXECUTIVE_SUITE && this.waynesNcrOfficer)
        ? this.waynesNcrOfficer
        : (this.sceneState === SCENE_STATE.WAYNES_ROOM && this.waynesTransformed && this.waynesNcrOfficer)
          ? this.waynesNcrOfficer
          : this.clerk
      const speed = 0.12 * delta
      let dx = this.target.x - player.x
      const dy = this.target.y - player.y
      const dist = Math.hypot(dx, dy)
      // Wayne's → Executive: transition as soon as we reach/near target or cross the right threshold
      const waynesExitThreshold = layout.waynesClerkRightBound != null ? layout.waynesClerkRightBound - 15 : null
      const shouldExitWaynes = this.waynesTransformed && waynesExitThreshold != null && player.x >= waynesExitThreshold
      if (dist < 8 || (shouldExitWaynes && dx >= 0)) {
        if (this.walkingToBible && !this.bibleAcquired) {
          this.clerk.x = bibleStandX
          this.clerk.y = bibleStandY
          this.target = null
          this.walkingToBible = false
          this.showBibleMenu()
        } else if (shouldExitWaynes) {
          this.target = null
          this.startExecutiveSuite()
        } else if (dist < 1) {
          this.target = null
        }
      }
      if (!shouldExitWaynes || this.sceneState === SCENE_STATE.WAYNES_ROOM) {
        // Keep moving until we've arrived (dist < 1) or crossed Wayne's exit threshold
        if (dist >= 1 && !shouldExitWaynes) {
          player.x += (dx / dist) * speed
          player.y += (dy / dist) * speed
        }
        if (this.sceneState === SCENE_STATE.FREE_WALK && layout.clerkLeftBound != null && layout.clerkRightBound != null) {
          player.x = Phaser.Math.Clamp(player.x, layout.clerkLeftBound, layout.clerkRightBound)
        }
        if (this.sceneState === SCENE_STATE.WAYNES_ROOM && layout.waynesClerkLeftBound != null && layout.waynesClerkRightBound != null) {
          player.x = Phaser.Math.Clamp(player.x, layout.waynesClerkLeftBound, layout.waynesClerkRightBound)
          if (this.waynesTransformed && waynesExitThreshold != null && player.x >= waynesExitThreshold) {
            this.target = null
            this.startExecutiveSuite()
          }
        }
        if (this.sceneState === SCENE_STATE.EXECUTIVE_SUITE && layout.executiveClerkLeftBound != null && layout.executiveClerkRightBound != null) {
          player.x = Phaser.Math.Clamp(player.x, layout.executiveClerkLeftBound, layout.executiveClerkRightBound)
          const guardX = layout.executiveGuardX ?? this.scale.width * 0.78
          if (!this.executiveGuardSequence && this.glassesWorn && player.x >= guardX - 25 && dx > 0) {
            this.target = null
            player.x = guardX - 22
            this.startExecutiveGuardSequence()
          }
        }
        if (this.usingClerkSprite && !this.waynesTransformed) {
          if (dx < 0) {
            this.facing = 'left'
            this.clerk.play('clerk_walk_left', true)
          } else if (dx > 0) {
            this.facing = 'right'
            this.clerk.play('clerk_walk_right', true)
          }
        }
        if ((this.sceneState === SCENE_STATE.EXECUTIVE_SUITE || (this.sceneState === SCENE_STATE.WAYNES_ROOM && this.waynesTransformed)) && this.waynesNcrOfficer) {
          // Set texture only when direction changes; always play walk when moving
          if (dx < 0) {
            if (this.ncrFacing !== 'left') {
              this.ncrFacing = 'left'
              if (this.textures.exists(ASSETS.NCR_OFFICER_LEFT)) {
                this.waynesNcrOfficer.setTexture(ASSETS.NCR_OFFICER_LEFT, 0)
              }
            }
            if (this.anims.exists('ncr_walk_left')) {
              this.waynesNcrOfficer.play('ncr_walk_left', true)
            } else if (this.anims.exists('ncr_walk')) {
              this.waynesNcrOfficer.play('ncr_walk', true)
            }
          } else {
            if (this.ncrFacing !== 'right') {
              this.ncrFacing = 'right'
              this.waynesNcrOfficer.setTexture(ASSETS.NCR_OFFICER, 0)
            }
            this.waynesNcrOfficer.play('ncr_walk', true)
          }
        }
      }
    }

    if (this.sceneState === SCENE_STATE.WAYNES_ROOM) {
      const { waynesClerkLeftBound, waynesClerkRightBound, catLeftBound, catRightBound, catSpeed, clerkWalkY } = layout
      const waynesPlayer = (this.waynesTransformed && this.waynesNcrOfficer) ? this.waynesNcrOfficer : this.clerk
      if (waynesClerkLeftBound != null && waynesClerkRightBound != null) {
        waynesPlayer.x = Phaser.Math.Clamp(waynesPlayer.x, waynesClerkLeftBound, waynesClerkRightBound)
      }
      if (this.waynesTransformed && this.waynesNcrOfficer && !this.target) {
        const waynesBounce = Math.sin(this.idleTime * 0.004) * 0.15
        this.waynesNcrOfficer.y = clerkWalkY - waynesBounce
      }
      if (this.waynesBg) {
        const w = this.scale.width
        const { waynesScrollFactor } = layout
        this.waynesBg.x = w / 2 - (waynesPlayer.x - w / 2) * waynesScrollFactor
      }
      if (this.cat && catLeftBound != null && catRightBound != null) {
        this.cat.x += catSpeed * delta * this.catDirection
        if (this.cat.x <= catLeftBound) {
          this.cat.x = catLeftBound
          this.catDirection = 1
          this.cat.setTexture(ASSETS.CAT_RIGHT, 0)
          this.cat.play('cat_walk_right', true)
        } else if (this.cat.x >= catRightBound) {
          this.cat.x = catRightBound
          this.catDirection = -1
          this.cat.setTexture(ASSETS.CAT_LEFT, 0)
          this.cat.play('cat_walk_left', true)
        }
      }
    }
    if (this.sceneState === SCENE_STATE.EXECUTIVE_SUITE && this.executiveBg && this.waynesNcrOfficer) {
      const { executiveClerkLeftBound, executiveClerkRightBound, executiveScrollFactor, executiveMinScale, executiveMaxScale, executiveStartY, executiveWalkY } = layout
      const w = this.scale.width
      const h = this.scale.height
      if (this.executiveGuardSequence) {
        const guardBounce = Math.sin(this.idleTime * 0.0035) * 0.15
        if (this.executiveGuardOfficerLockX != null) {
          this.waynesNcrOfficer.x = this.executiveGuardOfficerLockX
          this.waynesNcrOfficer.y = (this.executiveGuardOfficerLockY ?? executiveWalkY) - guardBounce
        }
        if (this.executiveGuardOfficerScale != null) {
          this.waynesNcrOfficer.setScale(this.executiveGuardOfficerScale)
        }
        if (this.executiveCokeBoss != null && this.executiveCokeBossOffsetX != null) {
          this.executiveCokeBoss.x = this.executiveBg.x + this.executiveCokeBossOffsetX
          this.executiveCokeBoss.y = (layout.executiveCokeBossY ?? h * 0.45) - guardBounce
        }
      } else {
        if (executiveClerkLeftBound != null && executiveClerkRightBound != null) {
          this.waynesNcrOfficer.x = Phaser.Math.Clamp(this.waynesNcrOfficer.x, executiveClerkLeftBound, executiveClerkRightBound)
        }
        this.executiveBg.x = w / 2 - (this.waynesNcrOfficer.x - w / 2) * executiveScrollFactor
        // Scale from top-left: small at top-left, grow as he moves down and right
        const minS = executiveMinScale ?? 0.35
        const maxS = executiveMaxScale ?? 1.1
        const left = executiveClerkLeftBound ?? 10
        const right = executiveClerkRightBound ?? w - 10
        const topY = executiveStartY ?? h * 0.22
        const bottomY = executiveWalkY ?? h * 0.88
        const lockX = layout.executiveScaleLockX ?? w * 0.5
        const tXRaw = (this.waynesNcrOfficer.x - left) / (right - left)
        const tXCap = Math.min(tXRaw, (lockX - left) / (right - left))
        const tX = Phaser.Math.Clamp(tXCap, 0, 1)
        const tY = Phaser.Math.Clamp((this.waynesNcrOfficer.y - topY) / (bottomY - topY), 0, 1)
        const t = (tX + tY) / 2
        this.waynesNcrOfficer.setScale(Phaser.Math.Linear(minS, maxS, t))
        if (!this.target) {
          const execBounce = Math.sin(this.idleTime * 0.004) * 0.15
          this.waynesNcrOfficer.y = executiveWalkY - execBounce
        }
      }
    }
    if (this.sceneState === SCENE_STATE.SUPREME_COURT) {
      const supBounce = Math.sin(this.idleTime * 0.0035) * 0.15
      const supBounceBoss = Math.sin(this.idleTime * 0.0032 + 0.5) * 0.15
      if (this.waynesNcrOfficer) {
        const baseY = layout.supremeCourtPlayerY ?? this.scale.height * 0.88
        this.waynesNcrOfficer.y = baseY - supBounce
      }
      if (this.supremeCourtCokeBoss) {
        const bossY = layout.supremeCourtCokeBossY ?? this.scale.height * 0.88
        this.supremeCourtCokeBoss.y = bossY - supBounceBoss
      }
    }

    const bounce = Math.sin(this.idleTime * 0.004) * 0.15
    const bob =
      !this.target &&
      (this.sceneState === SCENE_STATE.FREE_WALK ||
        this.sceneState === SCENE_STATE.WAYNES_ROOM ||
        this.sceneState === SCENE_STATE.COCA_LANDED)
        ? bounce
        : 0

    if (this.usingClerkSprite) {
      this.clerk.y -= bob * 0.2
      if (!this.target) {
        this.clerk.play(this.facing === 'left' ? 'clerk_idle_left' : 'clerk_idle_right', true)
      }
    } else {
      this.clerkHead.x = this.clerk.x
      this.clerkHead.y = this.clerk.y - 18 - bob * 0.2
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
    if (this.waynesNcrOfficer && !this.target) {
      if (this.ncrFacing === 'left' && this.textures.exists(ASSETS.NCR_OFFICER_LEFT) && this.anims.exists('ncr_idle_left')) {
        this.waynesNcrOfficer.setTexture(ASSETS.NCR_OFFICER_LEFT, 0)
        this.waynesNcrOfficer.play('ncr_idle_left', true)
      } else if (this.anims.exists('ncr_idle')) {
        this.waynesNcrOfficer.setTexture(ASSETS.NCR_OFFICER, 0)
        this.waynesNcrOfficer.play('ncr_idle', true)
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
    this._bibleReadClosing = false

    const everybrandSound = this.cache.audio.exists(ASSETS.EVERYBRAND_AUDIO)
      ? this.sound.add(ASSETS.EVERYBRAND_AUDIO)
      : null
    if (everybrandSound) everybrandSound.play()

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
      const close = () => {
        if (!this.bibleReadText) return
        timeout?.remove()
        if (everybrandSound?.isPlaying) everybrandSound.stop()
        if (this._bibleDismissDoc) {
          document.removeEventListener('click', this._bibleDismissDoc)
          document.removeEventListener('touchend', this._bibleDismissDoc)
          this._bibleDismissDoc = null
        }
        this.onBibleReadClosed(true)
      }
      const timeout = this.time.delayedCall(25000, close) // Safety fallback if audio complete never fires
      if (everybrandSound) {
        everybrandSound.once('complete', close)
      } else {
        this.time.delayedCall(5000, close)
      }
      // Fall starts only after everybrand.mp3 ends – no tap to skip
    })
  }

  startRabbitholeSequence() {
    if (this.sceneState === SCENE_STATE.RABBITHOLE && !window.__forceRabbithole) return
    const forceRetry = !!window.__forceRabbithole
    if (window.__forceRabbithole) window.__forceRabbithole = false

    // When retrying from stuck state, reset clerk and DOM overlay
    if (forceRetry && this.sceneState === SCENE_STATE.RABBITHOLE) {
      this.tweens.killAll()
      const layout = getLayout(this.scale.width, this.scale.height)
      if (this.clerk) {
        this.clerk.setVisible(true)
        this.clerk.x = layout.clerkStartX
        this.clerk.y = layout.clerkStartY
        this.clerk.angle = 0
        if (this.clerkHead) {
          this.clerkHead.setVisible(true)
          this.clerkHead.x = layout.clerkStartX
          this.clerkHead.y = layout.clerkStartY - 18
        }
        ;[this.glassesLeft, this.glassesRight, this.tie, this.pocket].forEach((s) => s && s.setVisible(true))
      }
      if (this.backgroundImage) this.backgroundImage.setVisible(true)
      const vidWrap = document.getElementById('rabbithole-video-wrap')
      const ov = document.getElementById('rabbithole-overlay')
      if (vidWrap) vidWrap.style.display = 'none'
      if (ov) { ov.style.display = 'none'; ov.innerHTML = '' }
      const canvas = this.game.canvas
      const phaserRoot = canvas?.closest?.('.phaser-root')
      if (canvas) canvas.style.visibility = ''
      if (phaserRoot) phaserRoot.style.visibility = ''
    }

    this.sceneState = SCENE_STATE.RABBITHOLE
    this.movementEnabled = false
    this.target = null
    this.hideInventory()
    this.hideBibleMenu()

    const { width, height } = this.scale
    const layout = getLayout(width, height)

    // Stop all scene music when rabbithole starts (background-specific)
    if (this.officeMusic?.isPlaying) this.officeMusic.stop()
    if (this.waynesMusic?.isPlaying) this.waynesMusic.stop()
    if (this.picassoSound?.isPlaying) this.picassoSound.stop()
    this.unlockAudio()

    // Keep video hidden until sink completes – overlay shows it when _beginRabbitholeOverlay runs
    const vid = document.getElementById('rabbithole-video-el')
    if (vid) vid.play().catch(() => {}) // Preload in background for user gesture

    // Start freefall loop (HTML5 – must run in same frame as user gesture for autoplay)
    if (!window.__freefallAudio) {
      try {
        const a = new Audio('/freefall_loop.wav')
        a.loop = true
        a.volume = 0.8
        a.play().catch(() => {})
        window.__freefallAudio = a
      } catch (e) {}
    } else if (window.__freefallAudio.paused) {
      window.__freefallAudio.currentTime = 0
      window.__freefallAudio.play().catch(() => {})
    }
    // Pre-create coca.mp3 during user gesture so it can play when coca_bg appears
    try {
      window.__cocaAudio = new Audio('/coca.mp3')
      window.__cocaAudio.volume = 0.9
    } catch (e) {}

    // Stage 1: Clerk slowly sinks through the floor (room stays visible), tilts as he falls
    if (this.clerk) {
      const startY = this.clerk.y
      const endY = height + 80
      const duration = layout.fallThroughFloorDuration ?? 2500
      let overlayStarted = false
      const startOverlay = () => {
        if (overlayStarted) return
        overlayStarted = true
        this._beginRabbitholeOverlay()
      }
      this.tweens.add({
        targets: this.clerk,
        y: endY,
        angle: 65,
        duration,
        ease: 'Quad.easeIn',
        onComplete: startOverlay,
      })
      setTimeout(startOverlay, duration + 300) // Backup if tween onComplete doesn't fire
      // Sink clerk head/accessories with him
      if (this.clerkHead) {
        this.tweens.add({ targets: this.clerkHead, y: this.clerkHead.y + (endY - startY), duration, ease: 'Quad.easeIn' })
      }
      if (this.glassesLeft) this.tweens.add({ targets: this.glassesLeft, y: this.glassesLeft.y + (endY - startY), duration, ease: 'Quad.easeIn' })
      if (this.glassesRight) this.tweens.add({ targets: this.glassesRight, y: this.glassesRight.y + (endY - startY), duration, ease: 'Quad.easeIn' })
      if (this.tie) this.tweens.add({ targets: this.tie, y: this.tie.y + (endY - startY), duration, ease: 'Quad.easeIn' })
      if (this.pocket) this.tweens.add({ targets: this.pocket, y: this.pocket.y + (endY - startY), duration, ease: 'Quad.easeIn' })
    } else {
      // No clerk (edge case) – go straight to overlay
      this._beginRabbitholeOverlay()
    }
  }

  _beginRabbitholeOverlay() {
    const { width, height } = this.scale
    const layout = getLayout(width, height)
    const canvas = this.game.canvas
    const phaserRoot = canvas?.closest?.('.phaser-root')

    // Hide room and canvas – DOM overlay shows video full-screen
    if (this.backgroundImage) this.backgroundImage.setVisible(false)
    if (this.waynesBg) this.waynesBg.setVisible(false)
    if (this.cat) this.cat.setVisible(false)
    if (this.clerk) this.clerk.setVisible(false)
    if (this.clerkHead) this.clerkHead.setVisible(false)
    if (this.glassesLeft) this.glassesLeft.setVisible(false)
    if (this.glassesRight) this.glassesRight.setVisible(false)
    if (this.tie) this.tie.setVisible(false)
    if (this.pocket) this.pocket.setVisible(false)
    if (this.statusText) this.statusText.setVisible(false)
    if (this.overlayText) this.overlayText.setVisible(false)
    if (this.introCaptionText) this.introCaptionText.setVisible(false)
    if (this.bibleZone) this.bibleZone.setVisible(false)
    if (canvas) canvas.style.visibility = 'hidden'
    if (phaserRoot) phaserRoot.style.visibility = 'hidden'

    this.rabbitholeVideoWrapper = document.getElementById('rabbithole-overlay')
    showRabbitholeOverlay({ canvas, layout, phaserRoot, scene: this })
  }

  hideBibleMenu() {
    if (this.bibleMenuContainer) {
      this.bibleMenuContainer.destroy()
      this.bibleMenuContainer = null
    }
    if (this.bibleReadText) {
      this.bibleReadText.destroy()
      this.bibleReadText = null
    }
  }

  _runRabbitholeInPhaser(layout) {
    if (this.sceneState !== SCENE_STATE.RABBITHOLE) return
    const { width, height } = this.scale

    // DOM video (more reliable than Phaser video) – inserted behind canvas
    const phaserRoot = this.game.canvas?.parentElement
    let domVideoEl = null
    if (phaserRoot) {
      const vidWrap = document.createElement('div')
      vidWrap.style.cssText =
        'position:absolute;inset:0;z-index:0;background:#000;overflow:hidden'
      const vid = document.createElement('video')
      vid.src = '/rabbithole.mp4'
      vid.playsInline = true
      vid.muted = true
      vid.loop = true
      vid.style.cssText =
        'position:absolute;inset:0;width:100%;height:100%;object-fit:cover'
      vid.onerror = () => {
        vid.src = '/rabbithole.mov'
        vid.load()
      }
      vidWrap.appendChild(vid)
      phaserRoot.insertBefore(vidWrap, this.game.canvas)
      this.game.canvas.style.position = 'relative'
      this.game.canvas.style.zIndex = '1'
      vid.play().catch(() => {})
      domVideoEl = { wrap: vidWrap, video: vid }
      this.rabbitholeDomVideo = domVideoEl
    }

    // Transparent camera so DOM video shows through; clerk + coca_bg on canvas
    this.cameras.main.setBackgroundColor(0x000000, 0)

    // coca_bg – hidden until phase 2
    let cocaBg = null
    if (this.textures.exists(ASSETS.COCA_BG)) {
      cocaBg = this.add.image(width / 2, height / 2, ASSETS.COCA_BG)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(width, height)
        .setDepth(1)
        .setVisible(false)
    }

    // Freefall clerk – BIG (90% of width), tilt + oscillation
    const clerkW = Math.max(width * 0.9, 200)
    const clerkH = Math.round((112 / 200) * clerkW)
    const clerk = this.add.image(width / 2, layout.rabbitholeFallStartY ?? -80, ASSETS.FREEFALL_LEFT)
      .setOrigin(0.5, 0.5)
      .setDisplaySize(clerkW, clerkH)
      .setDepth(10)
    this.freefallClerk = clerk

    // Oscillation timer – swap left/right every 250ms
    let oscillateCount = 0
    const oscillateEv = this.time.addEvent({
      delay: 250,
      callback: () => {
        if (!clerk.active) return
        oscillateCount++
        clerk.setTexture(oscillateCount % 2 === 0 ? ASSETS.FREEFALL_LEFT : ASSETS.FREEFALL_RIGHT)
      },
      loop: true,
    })

    const duration = layout.rabbitholeFallDuration ?? 3500
    const endY = layout.rabbitholeFallEndY ?? height + 60

    // Tween: fall down, tilt -75deg
    this.tweens.add({
      targets: clerk,
      y: endY,
      angle: -75,
      duration,
      ease: 'Quad.easeIn',
      onComplete: () => {
        oscillateEv.destroy()
        // Transition to coca_bg – hide DOM video
        if (domVideoEl?.wrap) {
          domVideoEl.wrap.style.display = 'none'
          domVideoEl.video?.pause()
        }
        if (cocaBg) cocaBg.setVisible(true)
        // Stop freefall, play coca
        if (window.__freefallAudio) {
          try {
            window.__freefallAudio.pause()
            window.__freefallAudio.currentTime = 0
            window.__freefallAudio = null
          } catch (e) {}
        }
        try {
          const a = window.__cocaAudio || new Audio('/coca.mp3')
          a.volume = 0.9
          a.currentTime = 0
          a.play().catch(() => {})
        } catch (e) {}
        if (this.cache.audio.exists(ASSETS.COCA_LAND_AUDIO)) {
          this.sound.play(ASSETS.COCA_LAND_AUDIO)
        }
        // Land tween – settle on coca, straighten
        const landY = layout.cocaLandedClerkY ?? height * 0.94
        this.tweens.add({
          targets: clerk,
          y: landY,
          angle: 0,
          duration: 800,
          ease: 'Quad.easeOut',
          onComplete: () => {
            if (clerk.active) clerk.destroy()
            this.freefallClerk = null
            this.showCocaLanded()
          },
        })
      },
    })
  }

  _showRabbitholeOverlay_UNUSED(canvas, layout, phaserRoot) {
    if (this.sceneState !== SCENE_STATE.RABBITHOLE) return

    const overlay = document.getElementById('rabbithole-overlay')
    if (!overlay) return
    overlay.innerHTML = ''
    overlay.style.display = 'block'
    this.rabbitholeVideoWrapper = overlay

    // coca_bg – hidden until phase 2, shown when he arrives
    const cocaBgImg = document.createElement('img')
    cocaBgImg.src = '/coca_bg.jpg'
    cocaBgImg.onerror = () => { cocaBgImg.src = '/coca_bg.png'; cocaBgImg.onerror = null }
    cocaBgImg.alt = ''
    cocaBgImg.style.cssText =
      'position:absolute;inset:0;width:100%;height:100%;object-fit:cover;z-index:1;display:none'
    overlay.appendChild(cocaBgImg)

    // rabbithole video
    const videoWrap = document.createElement('div')
    videoWrap.style.cssText =
      'position:absolute;inset:0;width:100%;height:300%;overflow:hidden;z-index:2'
    const video = document.createElement('video')
    video.src = '/rabbithole.mp4'
    video.playsInline = true
    video.muted = true
    video.loop = true
    video.preload = 'auto'
    video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:cover'
    videoWrap.appendChild(video)
    overlay.appendChild(videoWrap)
    video.onerror = () => {
      video.src = '/rabbithole.mov'
      video.load()
    }
    video.play().catch(() => {})
    overlay.addEventListener('click', () => video.play().catch(() => {}))

    // Clerk – BIG (90vw), tilts via rotate(), oscillates via two imgs + visibility
    const clerkWrap = document.createElement('div')
    const w = 90
    const h = Math.round((112 / 200) * w)
    clerkWrap.style.cssText =
      `position:absolute;left:50%;top:0;width:${w}vw;height:${h}vw;min-width:500px;min-height:280px;z-index:20;pointer-events:none;transform-origin:50% 50%;will-change:transform`
    const imgStyle = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain'
    const clerkLeft = document.createElement('img')
    clerkLeft.src = '/freefall_left.png'
    clerkLeft.alt = ''
    clerkLeft.style.cssText = imgStyle
    const clerkRight = document.createElement('img')
    clerkRight.src = '/freefall_right.png'
    clerkRight.alt = ''
    clerkRight.style.cssText = imgStyle + ';display:none'
    clerkWrap.appendChild(clerkLeft)
    clerkWrap.appendChild(clerkRight)
    overlay.appendChild(clerkWrap)

    const duration = layout.rabbitholeFallDuration ?? 4000
    const startY = -100
    const endY = (typeof window !== 'undefined' ? window.innerHeight : 600) + 80
    const floorY = (typeof window !== 'undefined' ? window.innerHeight : 600) * 0.9
    const scene = this
    const startMs = performance.now()
    let phase = 'video'
    let phaseStartMs = startMs

    function tick() {
      if (!overlay.isConnected) return
      const now = performance.now()
      const elapsed = now - startMs
      const phaseElapsed = now - phaseStartMs

      if (phase === 'video') {
        const p = Math.min(1, elapsed / duration)
        const y = startY + (endY - startY) * p
        const tilt = -75 * p
        clerkWrap.style.top = y + 'px'
        clerkWrap.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`
        const showL = Math.floor(elapsed / 250) % 2 === 0
        clerkLeft.style.display = showL ? 'block' : 'none'
        clerkRight.style.display = showL ? 'none' : 'block'
        videoWrap.style.transform = `translateY(${-p * 66.67}%)`

        if (p >= 1) {
          phase = 'coca'
          phaseStartMs = now
          videoWrap.style.display = 'none'
          cocaBgImg.style.display = 'block'

          if (window.__freefallAudio) {
            try {
              window.__freefallAudio.pause()
              window.__freefallAudio.currentTime = 0
            } catch (e) {}
            window.__freefallAudio = null
          }
          try {
            const coca = window.__cocaAudio || new Audio('/coca.mp3')
            coca.volume = 0.9
            coca.currentTime = 0
            coca.play().catch(() => {})
          } catch (e) {}
          if (scene.sound && scene.cache.audio.exists(ASSETS.COCA_LAND_AUDIO)) {
            scene.sound.play(ASSETS.COCA_LAND_AUDIO)
          }
        }
      } else {
        const landDur = 2800
        const p = Math.min(1, phaseElapsed / landDur)
        const y = -80 + (floorY + 80) * p
        const tilt = -75 + 75 * p
        clerkWrap.style.top = y + 'px'
        clerkWrap.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`
        const showL2 = Math.floor(phaseElapsed / 250) % 2 === 0
        clerkLeft.style.display = showL2 ? 'block' : 'none'
        clerkRight.style.display = showL2 ? 'none' : 'block'

        if (p >= 1) {
          if (window.__freefallAudio) {
            try {
              window.__freefallAudio.pause()
              window.__freefallAudio.currentTime = 0
            } catch (e) {}
            window.__freefallAudio = null
          }
          overlay.style.display = 'none'
          overlay.innerHTML = ''
          if (canvas) canvas.style.visibility = ''
          if (phaserRoot) phaserRoot.style.visibility = ''
          scene.rabbitholeVideoWrapper = null
          scene.showCocaLanded()
          return
        }
      }
      requestAnimationFrame(tick)
    }
    clerkWrap.style.top = startY + 'px'
    clerkWrap.style.transform = 'translate(-50%, -50%) rotate(0deg)'
    requestAnimationFrame(tick)
  }

  showCocaLanded() {
    const vidWrap = document.getElementById('rabbithole-video-wrap')
    if (vidWrap) vidWrap.style.display = 'none'
    if (window.__freefallAudio) {
      window.__freefallAudio.pause()
      window.__freefallAudio.currentTime = 0
      window.__freefallAudio = null
    }
    if (this.freefallLoopSound && this.freefallLoopSound.isPlaying) {
      this.freefallLoopSound.stop()
    }
    this.freefallLoopSound = null
    if (this.rabbitholeVideoWrapper) {
      this.rabbitholeVideoWrapper.style.display = 'none'
      this.rabbitholeVideoWrapper.innerHTML = ''
    }
    this.rabbitholeVideoWrapper = null
    this.rabbitholeVideo = null
    const htmlVid = document.getElementById('rabbithole-video-el')
    if (htmlVid) {
      htmlVid.pause()
      htmlVid.style.display = 'none'
    }
    if (window.__rabbitholeVideo) {
      try {
        window.__rabbitholeVideo.pause()
        window.__rabbitholeVideo.remove()
      } catch (e) {}
      window.__rabbitholeVideo = null
    }
    if (this.rabbitholeDomVideo?.wrap) {
      this.rabbitholeDomVideo.video?.pause()
      this.rabbitholeDomVideo.wrap.remove()
    }
    this.rabbitholeDomVideo = null
    window.__rabbitholeVideo = null
    const canvas = this.game.canvas
    if (canvas) {
      canvas.style.backgroundColor = ''
      canvas.style.visibility = ''
    }
    this.cameras.main.setBackgroundColor(0x050608, 1)

    const { width, height } = this.scale
    const layout = getLayout(width, height)

    if (this.freefallClerk) {
      this.freefallClerk.destroy()
      this.freefallClerk = null
    }
    if (this.praySprite) {
      this.praySprite.destroy()
      this.praySprite = null
    }
    if (this.prayMenuContainer) {
      this.prayMenuContainer.destroy()
      this.prayMenuContainer = null
    }
    this.removePrayZoneDom()

    if (this.textures.exists(ASSETS.COCA_BG)) {
      this.cocaBgImage = this.add
        .image(width / 2, height / 2, ASSETS.COCA_BG)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(width, height)
        .setDepth(-200)
        .setVisible(true)
    } else {
      this.cameras.main.setBackgroundColor(0x0a0a12, 1)
    }

    this.movementEnabled = true
    this.target = null
    this.movementEnabled = true
    this.target = null
    if (this.clerk) {
      this.clerk.setVisible(true)
      this.clerk.setPosition(width / 2, layout.cocaLandedClerkY)
      this.clerk.setAngle(0).setScale(1)
      if (this.usingClerkSprite) this.clerk.play('clerk_idle_right', true)
    }
    if (this.clerkHead) this.clerkHead.setVisible(true)
    if (this.glassesLeft) this.glassesLeft.setVisible(true)
    if (this.glassesRight) this.glassesRight.setVisible(true)
    if (this.tie) this.tie.setVisible(true)
    if (this.pocket) this.pocket.setVisible(true)

    this.sceneState = SCENE_STATE.COCA_LANDED
    this.movementEnabled = true
    this.target = null
    if (this.inventoryBtn) this.inventoryBtn.setVisible(false)
    if (this.statusText) this.statusText.setVisible(true).setText('Click on the floor to walk.')

    // Invisible pray button at center of coca_bg (DOM overlay for reliable clicks)
    this.createPrayZoneDom()
  }

  removePrayZoneDom() {
    if (this.prayZoneDomEl && this.prayZoneDomEl.parentNode) {
      this.prayZoneDomEl.remove()
      this.prayZoneDomEl = null
    }
  }

  createPrayZoneDom() {
    this.removePrayZoneDom()
    const phaserRoot = this.game.canvas?.closest?.('.phaser-root')
    if (!phaserRoot) return
    const btn = document.createElement('div')
    btn.setAttribute('aria-label', 'Pray')
    btn.style.cssText =
      'position:absolute;left:50%;top:50%;transform:translate(-50%,-50%);width:120px;height:100px;cursor:pointer;z-index:100;pointer-events:auto'
    btn.addEventListener('click', (e) => {
      e.preventDefault()
      e.stopPropagation()
      this.showPrayMenu()
    })
    phaserRoot.style.position = 'relative'
    phaserRoot.appendChild(btn)
    this.prayZoneDomEl = btn
  }

  showPrayMenu() {
    if (this.prayMenuContainer || this.praySprite) return

    if (this.prayZoneDomEl) this.prayZoneDomEl.style.pointerEvents = 'none'
    const { width, height } = this.scale
    const layout = getLayout(width, height)
    const { prayZoneX, prayZoneY, prayZoneW, prayZoneH, prayMenuW, prayMenuH } = layout

    const menuX = prayZoneX - prayMenuW / 2
    const menuY = prayZoneY - prayZoneH / 2 - prayMenuH - 8

    const bg = this.add.rectangle(menuX, menuY, prayMenuW, prayMenuH, 0x050608, 0.95).setOrigin(0, 0)
    bg.setStrokeStyle(1, 0xffffff, 0.6)
    const prayText = this.add.text(menuX + 8, menuY + 4, '[Pray]', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#d0d5ff',
    })
    prayText.setInteractive({ useHandCursor: true })
    prayText.on('pointerdown', () => this.handlePray())

    this.prayMenuContainer = this.add.container(0, 0, [bg, prayText])
    this.prayMenuContainer.setDepth(3000)
  }

  handlePray() {
    if (this.prayMenuContainer) {
      this.prayMenuContainer.destroy()
      this.prayMenuContainer = null
    }
    this.removePrayZoneDom()

    if (this.clerk) this.clerk.setVisible(false)
    if (this.clerkHead) this.clerkHead.setVisible(false)
    if (this.glassesLeft) this.glassesLeft.setVisible(false)
    if (this.glassesRight) this.glassesRight.setVisible(false)
    if (this.tie) this.tie.setVisible(false)
    if (this.pocket) this.pocket.setVisible(false)

    const { width } = this.scale
    const layout = getLayout(width, this.scale.height)

    if (this.textures.exists(ASSETS.PRAY)) {
      this.praySprite = this.add
        .image(width / 2, layout.cocaLandedClerkY, ASSETS.PRAY)
        .setOrigin(0.5, 1)
        .setDepth(10)
    }

    const height = this.scale.height

    const showEndingVideo = () => {
      if (this.inventoryBtn) this.inventoryBtn.setVisible(false)
      const cocaEl = window.__cocaAudio
      if (cocaEl) {
        cocaEl.currentTime = 0
        cocaEl.volume = 0.9
        cocaEl.play().catch(() => {})
      }
      let fallbackShown = false
      const showCocaFallback = () => {
        if (fallbackShown) return
        fallbackShown = true
        if (this.textures.exists(ASSETS.COCA_INTERMISSION)) {
          const cocaOverlay = this.add
            .image(width / 2, height / 2, ASSETS.COCA_INTERMISSION)
            .setOrigin(0.5, 0.5)
            .setDisplaySize(width, height)
            .setDepth(500)
            .setAlpha(0)
          this.tweens.add({
            targets: cocaOverlay,
            alpha: 1,
            duration: 1800,
            ease: 'Quad.easeInOut',
          })
        }
      }
      // Canvas pipeline: video → low-res canvas → scaled display (image-rendering works when canvas is sized via CSS)
      const overlay = document.createElement('div')
      overlay.id = 'ending-overlay'
      overlay.style.cssText =
        'position:fixed;inset:0;z-index:2147483647;background:#000;display:flex;align-items:center;justify-content:center;overflow:hidden'
      const PIXEL_W = 288
      const PIXEL_H = 162
      const scale = Math.max(
        window.innerWidth / PIXEL_W,
        window.innerHeight / PIXEL_H,
      )
      const displayW = Math.ceil(PIXEL_W * scale)
      const displayH = Math.ceil(PIXEL_H * scale)
      const pixelWrap = document.createElement('div')
      pixelWrap.style.cssText =
        `width:${displayW}px;height:${displayH}px;overflow:hidden;display:flex;align-items:center;justify-content:center`
      const canvas = document.createElement('canvas')
      canvas.width = PIXEL_W
      canvas.height = PIXEL_H
      canvas.style.cssText =
        `width:${displayW}px;height:${displayH}px;display:block;image-rendering:-webkit-optimize-contrast;image-rendering:pixelated;image-rendering:-moz-crisp-edges;image-rendering:crisp-edges`
      const ctx = canvas.getContext('2d', { alpha: false })
      const vid = document.createElement('video')
      vid.playsInline = true
      vid.muted = true
      vid.loop = true
      vid.style.cssText = 'position:absolute;width:0;height:0;opacity:0;pointer-events:none'
      let rafId = null
      const finishEnding = () => {
        if (!overlay.isConnected) return
        overlay.style.opacity = '0'
        overlay.style.transition = 'opacity 1.5s ease'
        setTimeout(() => {
          overlay.remove()
          window.location.reload()
        }, 1600)
      }
      if (cocaEl) {
        cocaEl.addEventListener('ended', finishEnding, { once: true })
      } else {
        setTimeout(finishEnding, 180000) // 3 min fallback if no coca
      }
      const drawFrame = () => {
        if (!overlay.isConnected) {
          if (rafId) cancelAnimationFrame(rafId)
          return
        }
        if (vid.readyState >= 2) {
          ctx.fillStyle = '#000'
          ctx.fillRect(0, 0, PIXEL_W, PIXEL_H)
          ctx.imageSmoothingEnabled = false
          const vw = vid.videoWidth
          const vh = vid.videoHeight
          if (!vw || !vh) return
          const cAspect = PIXEL_W / PIXEL_H
          const vAspect = vw / vh
          let sx, sy, sw, sh
          if (vAspect > cAspect) {
            sh = vh
            sw = vh * cAspect
            sx = (vw - sw) / 2
            sy = 0
          } else {
            sw = vw
            sh = vw / cAspect
            sx = 0
            sy = (vh - sh) / 2
          }
          ctx.drawImage(vid, sx, sy, sw, sh, 0, 0, PIXEL_W, PIXEL_H)
        }
        rafId = requestAnimationFrame(drawFrame)
      }
      vid.onerror = () => {
        if (vid.src.endsWith('.mov') || vid.src.endsWith('.MOV')) {
          vid.src = '/ending.mp4'
          vid.load()
          vid.play().catch(() => {
            vid.remove()
            canvas.remove()
            pixelWrap.remove()
            overlay.remove()
            showCocaFallback()
          })
        } else {
          vid.remove()
          canvas.remove()
          pixelWrap.remove()
          overlay.remove()
          showCocaFallback()
        }
      }
      vid.onended = () => {
        // drawFrame will detect ended and clean up
      }
      pixelWrap.appendChild(canvas)
      overlay.appendChild(pixelWrap)
      overlay.appendChild(vid)
      document.body.appendChild(overlay)
      // When coca.mp3 ends, fade out and reload the game
      if (cocaEl) {
        cocaEl.addEventListener('ended', finishEnding, { once: true })
      } else {
        // Fallback: no coca audio – reload after ~4 min (typical coca length)
        setTimeout(finishEnding, 240000)
      }
      vid.src = '/ending.MOV'
      vid.load()
      vid.play().then(() => {
        drawFrame()
      }).catch(() => {
        vid.src = '/ending.mp4'
        vid.load()
        vid.play().then(() => drawFrame()).catch(() => vid.onerror())
      })
      overlay.style.opacity = '0'
      overlay.style.transition = 'opacity 1.5s ease'
      setTimeout(() => { overlay.style.opacity = '1' }, 50)
    }

    if (this.cache.audio.exists(ASSETS.PRAY_AUDIO)) {
      const cocaEl = window.__cocaAudio
      const savedCocaVol = cocaEl ? cocaEl.volume : 0.9
      if (cocaEl) cocaEl.volume = 0.2

      const praySound = this.sound.add(ASSETS.PRAY_AUDIO)
      praySound.once('complete', () => {
        if (cocaEl) cocaEl.volume = savedCocaVol
        showEndingVideo()
      })
      praySound.play()
    } else {
      this.time.delayedCall(2000, showEndingVideo)
    }
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
      // Pause before SWAT leave, then they exit, then pause before shrug
      this.time.delayedCall(1200, () => {
        tweens.add({
          targets: [unitDoor, unitVent, unitLeft],
          x: (target) => (target === unitDoor ? width + 30 : target === unitVent ? width / 2 : -30),
          y: (target) => (target === unitVent ? -30 : target.y),
          alpha: { from: 1, to: 0 },
          duration: 400,
          ease: 'Quad.easeIn',
          onComplete: () => {
            [unitDoor, unitVent, unitLeft].forEach((u) => u.destroy())
            // Pause after SWAT leave, then fade UI and start shrug
            this.time.delayedCall(400, () => {
              tweens.add({
                targets: [doorGlow, scanner, lockdownText],
                alpha: { from: 1, to: 0 },
                duration: 300,
                ease: 'Quad.easeOut',
                onComplete: () => {
          doorGlow.destroy()
          scanner.destroy()
          lockdownText.destroy()

          const doLogoTransition = () => {
            this.sceneState = SCENE_STATE.LOGO
        if (this.backgroundImage) this.backgroundImage.setVisible(false)
        if (this.overlayText) this.overlayText.setVisible(false)
        if (this.introCaptionText) this.introCaptionText.setVisible(false)
        if (this.paperSprites?.length) {
          this.paperSprites.forEach((p) => p.destroy())
          this.paperSprites = []
        }
        const dimmer = this.add
          .rectangle(width / 2, height / 2, width * 2, height * 2, 0x000000, 0)
          .setOrigin(0.5)
          .setDepth(4000)
        this._raidDimmer = dimmer
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
          this.picassoSound = this.sound.add(ASSETS.PICASSO_AUDIO)
          this.picassoSound.play()
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

        this.time.delayedCall(3500, () => this.playIntermissionThenWaynesRoom(dimmer, logoText, subText))
          }

          if (this.textures.exists(ASSETS.SHRUG) && this.clerk) {
            const clerkX = this.clerk.x
            const clerkY = this.clerk.y
            this.clerk.setVisible(false)
            if (this.clerkHead) this.clerkHead.setVisible(false)
            if (this.glassesLeft) this.glassesLeft.setVisible(false)
            if (this.glassesRight) this.glassesRight.setVisible(false)
            if (this.tie) this.tie.setVisible(false)
            if (this.pocket) this.pocket.setVisible(false)
            // Uniform scale: preserve shrug aspect (29:66), match clerk width → height scales proportionally
            const scale = ASSETS.CLERK_FRAME_WIDTH / ASSETS.SHRUG_FRAME_WIDTH
            const dispW = ASSETS.CLERK_FRAME_WIDTH
            const dispH = Math.round(ASSETS.SHRUG_FRAME_HEIGHT * scale)
            const shrug = this.add
              .sprite(clerkX, clerkY, ASSETS.SHRUG, 0)
              .setOrigin(0.5, 1)
              .setDisplaySize(dispW, dispH)
              .setDepth(100)
            shrug.play('shrug')
            shrug.once('animationcomplete', () => {
              this.time.delayedCall(2000, () => {
                this.tweens.add({
                  targets: shrug,
                  alpha: 0,
                  duration: 400,
                  ease: 'Quad.easeOut',
                  onComplete: () => {
                    shrug.destroy()
                    this.time.delayedCall(600, doLogoTransition)
                  },
                })
              })
            })
          } else {
            this.time.delayedCall(1500, doLogoTransition)
          }
        },
      })
      })
      }})
      })

      commsText.destroy()
    })
  }

  playIntermissionThenWaynesRoom(dimmer, logoText, subText) {
    const { width, height } = this.scale
    const layout = getLayout(width, height)
    const tweens = this.tweens

    this.sceneState = SCENE_STATE.INTERMISSION
    if (logoText) logoText.setVisible(false)
    if (subText) subText.setVisible(false)

    if (!this.textures.exists(ASSETS.COCA_INTERMISSION)) {
      if (dimmer) {
        dimmer.destroy()
        this._raidDimmer = null
      }
      this._maybeTransitionToWaynes()
      return
    }

    const coca = this.add.image(width / 2, height / 2, ASSETS.COCA_INTERMISSION).setOrigin(0.5).setScale(0).setAlpha(0)

    tweens.add({
      targets: coca,
      scale: 1,
      alpha: 1,
      angle: { from: -360, to: 0 },
      duration: 1100,
      ease: 'Quad.easeOut',
      onComplete: () => {
        this.time.delayedCall(1500, () => {
          tweens.add({
            targets: coca,
            scale: 0,
            alpha: 0.3,
            angle: 360,
            duration: 1100,
            ease: 'Quad.easeIn',
            onComplete: () => {
              coca.destroy()
              if (dimmer) {
                dimmer.destroy()
                this._raidDimmer = null
              }
              if (this.picassoSound) {
                tweens.add({
                  targets: this.picassoSound,
                  volume: 0,
                  duration: 1000,
                  ease: 'Quad.easeOut',
                  onComplete: () => {
                    if (this.picassoSound) this.picassoSound.stop()
                    this._maybeTransitionToWaynes()
                  },
                })
              } else {
                this._maybeTransitionToWaynes()
              }
            },
          })
        })
      },
    })
  }

  _maybeTransitionToWaynes() {
    // Stay in Phaser – run Wayne's room with Study/Read path (merged flow)
    this.startWaynesRoom()
  }

  /**
   * Debug: jump to a specific level/state. Used by DebugMenu to bypass normal flow.
   */
  jumpToState(key) {
    if (!key) return
    const { width, height } = this.scale
    const layout = getLayout(width, height)

    // Cleanup from any previous state before entering new level
    if (this.executiveBg) {
      this.executiveBg.destroy()
      this.executiveBg = null
    }
    if (this.supremeCourtBgTimer) {
      this.supremeCourtBgTimer.remove()
      this.supremeCourtBgTimer = null
    }
    if (this.supremeCourtBg) {
      this.supremeCourtBg.destroy()
      this.supremeCourtBg = null
    }
    if (this.supremeCourtCokeBoss) {
      this.supremeCourtCokeBoss.destroy()
      this.supremeCourtCokeBoss = null
    }
    if (this.waynesNcrOfficer) {
      this.waynesNcrOfficer.destroy()
      this.waynesNcrOfficer = null
    }
    this.waynesTransformed = false

    if (key === LEVEL_KEYS.WAYNES_ROOM) {
      this.bibleAcquired = true
      if (this.waynesBg) this.waynesBg.destroy()
      this.waynesBg = null
      if (this.cat) this.cat.destroy()
      this.cat = null
      if (this.waynesMusic?.isPlaying) this.waynesMusic.stop()
      this.startWaynesRoom()
    } else if (key === LEVEL_KEYS.WAYNES_ROOM_TRANSFORMED) {
      this.bibleAcquired = true
      if (this.waynesBg) this.waynesBg.destroy()
      this.waynesBg = null
      if (this.cat) this.cat.destroy()
      this.cat = null
      if (this.waynesMusic?.isPlaying) this.waynesMusic.stop()
      enterLevel(this, LEVEL_KEYS.WAYNES_ROOM_TRANSFORMED, layout)
      this.target = { x: layout.waynesClerkRightBound - 5, y: layout.clerkWalkY }
    } else if (key === LEVEL_KEYS.EXECUTIVE_SUITE) {
      this.startExecutiveSuite()
    } else if (key === LEVEL_KEYS.SUPREME_COURT) {
      this.bibleAcquired = true
      enterLevel(this, LEVEL_KEYS.SUPREME_COURT, layout)
      if (this.waynesNcrOfficer) this.waynesNcrOfficer.setTexture(ASSETS.NCR_OFFICER, 0)
    } else if (key === LEVEL_KEYS.RABBITHOLE) {
      this.startRabbitholeSequence()
    } else if (key === LEVEL_KEYS.COCA_LANDED) {
      if (this.backgroundImage) this.backgroundImage.setVisible(false)
      if (this.waynesBg) this.waynesBg.setVisible(false)
      if (this.cat) this.cat.setVisible(false)
      if (this.executiveBg) this.executiveBg.setVisible(false)
      if (this.waynesMusic?.isPlaying) this.waynesMusic.stop()
      this.showCocaLanded()
    }
  }

  startExecutiveSuite() {
    const { width, height } = this.scale
    const layout = getLayout(width, height)
    enterLevel(this, LEVEL_KEYS.EXECUTIVE_SUITE, layout)
  }

  startExecutiveGuardSequence() {
    if (this.executiveGuardSequence) return
    this.executiveGuardSequence = 'active'
    this.movementEnabled = false
    this.target = null

    const { width, height } = this.scale
    const layout = getLayout(width, height)

    // Lock NCR officer at fixed screen position (stays still as bg pans)
    const guardX = layout.executiveGuardX ?? width * 0.66
    const lockX = guardX - 25
    const lockY = layout.executiveWalkY ?? height * 0.88
    if (this.waynesNcrOfficer) {
      this.waynesNcrOfficer.setPosition(lockX, lockY)
      this.executiveGuardOfficerLockX = lockX
      this.executiveGuardOfficerLockY = lockY
      this.executiveGuardOfficerScale = this.waynesNcrOfficer.scaleX ?? this.waynesNcrOfficer.scale
    }

    // Camera pan right slowly to reveal last third of room (coke boss on right)
    const w = this.scale.width
    const currentBgX = this.executiveBg.x
    const panAmount = w / 3
    const targetBgX = currentBgX - panAmount
    this.executivePanTargetX = targetBgX
    this.tweens.add({
      targets: this.executiveBg,
      x: targetBgX,
      duration: 4000,
      ease: 'Power2.InOut',
    })

    // Coke boss only visible when wearing glasses (HQ shifts to hq2.png)
    const cokeBossScreenX = layout.executiveCokeBossX ?? w * 0.85
    this.executiveCokeBossOffsetX = cokeBossScreenX - targetBgX
    const cokeBossY = layout.executiveCokeBossY ?? height * 0.45
    if (this.glassesWorn && !this.executiveCokeBoss && this.textures.exists(ASSETS.COKEBOSS)) {
      this.executiveCokeBoss = this.add
        .image(this.executiveBg.x + this.executiveCokeBossOffsetX, cokeBossY, ASSETS.COKEBOSS)
        .setOrigin(0.5, 0.5)
        .setDepth(9)
    }
    if (!this.glassesWorn && this.executiveBg && this.textures.exists(ASSETS.HQ2)) {
      this.executiveBg.setTexture(ASSETS.HQ)
      this.executiveBg.refresh()
    }

    // Endless lorem ipsum dialogue (cycle on click, never ends)
    const loremLines = [
      'Lorem ipsum dolor sit amet, consectetur adipiscing elit.',
      'Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
      'Ut enim ad minim veniam, quis nostrud exercitation ullamco.',
      'Duis aute irure dolor in reprehenderit in voluptate velit.',
      'Excepteur sint occaecat cupidatat non proident, sunt in culpa.',
      'Qui officia deserunt mollit anim id est laborum.',
    ]
    this.executiveGuardDialogueIndex = 0
    const boxW = Math.min(200, w - 24)
    const boxH = 52
    const boxX = (w - boxW) / 2
    const boxY = height - boxH - 20
    const bg = this.add.rectangle(boxX, boxY, boxW, boxH, 0x050608, 0.95).setOrigin(0, 0)
    bg.setStrokeStyle(1, 0xffffff, 0.6)
    const text = this.add.text(boxX + 8, boxY + 8, loremLines[0], {
      fontFamily: 'monospace',
      fontSize: '9px',
      color: '#d0d5ff',
      wordWrap: { width: boxW - 16 },
    })
    const advance = () => {
      this.executiveGuardDialogueIndex = (this.executiveGuardDialogueIndex + 1) % loremLines.length
      text.setText(loremLines[this.executiveGuardDialogueIndex])
    }
    bg.setInteractive({ useHandCursor: true })
    bg.on('pointerdown', advance)
    this.executiveGuardDialogueContainer = this.add.container(0, 0, [bg, text])
    this.executiveGuardDialogueContainer.setDepth(6000) // Below inventory so dialogue doesn't block it
    if (this.statusText) {
      this.statusText.setVisible(true).setText('Open Inventory (top-right) and use the Bible.')
      this.statusText.setDepth(8500)
    }
    if (this.inventoryBtn) {
      this.inventoryBtn.setVisible(true)
      this.inventoryBtn.setDepth(8500) // Above dialogue so always clickable
    }
  }

  applyGlassesEffect() {
    if (!this.executiveBg || !this.glassesWorn || !this.textures.exists(ASSETS.HQ2)) return
    // Switch to HQ2 soundtrack when putting on glasses
    if (this.hq1Music?.isPlaying) this.hq1Music.stop()
    if (this.cache.audio.exists(ASSETS.HQ2_AUDIO)) {
      this.hq2Music = this.sound.add(ASSETS.HQ2_AUDIO, { loop: true })
      this.hq2Music.play()
    }
    const layout = getLayout(this.scale.width, this.scale.height)
    const w = this.scale.width
    const height = this.scale.height
    this.executiveBg.setTexture(ASSETS.HQ2)
    const img = this.textures.get(ASSETS.HQ2).getSourceImage()
    const scale = Math.max(w / (img?.width ?? w), height / (img?.height ?? height))
    const dispW = Math.ceil((img?.width ?? w) * scale)
    const dispH = Math.ceil((img?.height ?? height) * scale)
    this.executiveBg.setDisplaySize(dispW, dispH)
  }

  triggerBibleThrow() {
    if (!this.executiveGuardSequence || !this.waynesNcrOfficer) return
    if (!this.textures.exists(ASSETS.BIBLE)) {
      this.triggerLawsuitWarning()
      return
    }
    this.hideInventory()
    // 1. Dialogue disappears immediately
    if (this.executiveGuardDialogueContainer) {
      this.executiveGuardDialogueContainer.destroy()
      this.executiveGuardDialogueContainer = null
    }
    if (this.inventoryBtn) this.inventoryBtn.setVisible(false)

    // No coke boss (no glasses) – go straight to lawsuit
    if (!this.executiveCokeBoss) {
      this.triggerLawsuitWarning()
      return
    }

    const fromX = this.waynesNcrOfficer.x
    const fromY = this.waynesNcrOfficer.y - 20
    const toX = this.executiveCokeBoss.x
    const toY = this.executiveCokeBoss.y
    const flyingBible = this.add.image(fromX, fromY, ASSETS.BIBLE).setOrigin(0.5, 0.5).setScale(1.5).setDepth(15)
    this.tweens.add({
      targets: flyingBible,
      x: toX,
      y: toY,
      duration: 600,
      ease: 'Power2.Out',
      onComplete: () => {
        flyingBible.destroy()
        // 2. Coke boss blinks on hit
        this.tweens.add({
          targets: this.executiveCokeBoss,
          alpha: 0,
          duration: 100,
          yoyo: true,
          onComplete: () => {
            // 3. Lawsuit warning, then next room
            this.triggerLawsuitWarning()
          },
        })
      },
    })
  }

  triggerLawsuitWarning() {
    if (!this.executiveGuardSequence) return
    if (this.cache.audio.exists(ASSETS.LAWSUIT_AUDIO)) {
      this.sound.play(ASSETS.LAWSUIT_AUDIO)
    }
    this.executiveGuardSequence = null
    this.executiveGuardOfficerLockX = null
    this.executiveGuardOfficerLockY = null
    this.executiveGuardOfficerScale = null
    this.movementEnabled = false
    if (this.executiveGuardDialogueContainer) {
      this.executiveGuardDialogueContainer.destroy()
      this.executiveGuardDialogueContainer = null
    }
    if (this.inventoryBtn) this.inventoryBtn.setVisible(false)

    const { width, height } = this.scale
    const warning = this.add.text(width / 2, height / 2, 'LAWSUIT!', {
      fontFamily: 'monospace',
      fontSize: '28px',
      color: '#ff6b6b',
    }).setOrigin(0.5, 0.5).setDepth(9500)
    this.tweens.add({
      targets: warning,
      alpha: 0,
      duration: 400,
      delay: 800,
      onComplete: () => {
        warning.destroy()
        this.startSupremeCourt()
      },
    })
  }

  startSupremeCourt() {
    const { width, height } = this.scale
    const layout = getLayout(width, height)
    enterLevel(this, LEVEL_KEYS.SUPREME_COURT, layout)
    if (this.waynesNcrOfficer) {
      this.waynesNcrOfficer.setTexture(ASSETS.NCR_OFFICER, 0)
    }
  }

  startWaynesRoom() {
    const { width, height } = this.scale
    const layout = getLayout(width, height)

    if (this._raidDimmer) {
      this._raidDimmer.destroy()
      this._raidDimmer = null
    }

    enterLevel(this, LEVEL_KEYS.WAYNES_ROOM, layout)
    if (this.overlayText) this.overlayText.setVisible(false)
    // Ensure clerk is visible and in front when in clerk mode (not transformed)
    if (!this.waynesTransformed && this.clerk) {
      this.clerk.setVisible(true).setDepth(5000).setAlpha(1)
      if (this.clerkHead) this.clerkHead.setVisible(true).setDepth(5000).setAlpha(1)
      if (this.glassesLeft) this.glassesLeft.setVisible(true).setDepth(5000).setAlpha(1)
      if (this.glassesRight) this.glassesRight.setVisible(true).setDepth(5000).setAlpha(1)
      if (this.tie) this.tie.setVisible(true).setDepth(5000).setAlpha(1)
      if (this.pocket) this.pocket.setVisible(true).setDepth(5000).setAlpha(1)
    }
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
      render: { transparent: true },
      scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
      },
      audio: {
        disableWebAudio: false,
      },
      scene: OfficeScene,
    }

    const game = new Phaser.Game(config)
    return () => game.destroy(true)
  }, [])

  return <div className="phaser-root" ref={containerRef} />
}
