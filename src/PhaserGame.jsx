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
    this.load.video(ASSETS.RABBITHOLE_VIDEO, 'rabbithole.mp4', true)
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

    if (this.cache.audio.exists(ASSETS.OFFICE_AUDIO)) {
      this.officeMusic = this.sound.add(ASSETS.OFFICE_AUDIO, { loop: true })
      // Don't play yet on mobile—browsers block autoplay until first user tap
    }
    // Re-bind Test Rabbithole button now that scene is ready (__phaserScene is set)
    if (typeof window.initRabbitholeButton === 'function') {
      window.initRabbitholeButton()
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
    this.statusText = this.add.text(layout.statusTextX, layout.statusTextY, 'Click on the floor to walk.', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#b0b6d1',
    })
    this.introCaptionText = this.add.text(8, layout.introCaptionY, 'Low-Level Legal Processing Unit 14B – Night Shift.', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#9ea3c4',
      wordWrap: { width: width - 16 },
    })
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
      if (this.inventoryOpen) this.hideInventory()
      else this.showInventory()
    })
  }

  createInput(width, height, layout) {
    const { floorYMin, floorYMax, bibleStandX, bibleStandY, clerkWalkY, cocaFloorYMin, cocaFloorYMax, cocaWalkY } = layout

    this.input.on('pointerdown', (pointer) => {
      this.unlockAudio()

      if (this.inventoryOpen) return
      if (!this.clerk || this.sceneState === SCENE_STATE.RAID || this.sceneState === SCENE_STATE.LOGO || this.sceneState === SCENE_STATE.INTERMISSION || this.sceneState === SCENE_STATE.RABBITHOLE) return

      if (!this.movementEnabled && this.sceneState !== SCENE_STATE.WAYNES_ROOM && this.sceneState !== SCENE_STATE.COCA_LANDED) return

      const isCoca = this.sceneState === SCENE_STATE.COCA_LANDED
      const floorMin = isCoca ? cocaFloorYMin : floorYMin
      const floorMax = isCoca ? cocaFloorYMax : floorYMax
      const walkY = isCoca ? cocaWalkY : clerkWalkY
      if (pointer.y >= floorMin && pointer.y <= floorMax) {
        this.target = { x: pointer.x, y: walkY }
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

  createInventoryKey() {
    this.input.keyboard.on('keydown-I', () => {
      if (this.inventoryOpen) this.hideInventory()
      else this.showInventory()
    })
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
      console.log('[Phaser] triggerRabbithole received, state:', this.sceneState)
      if (this.sceneState !== SCENE_STATE.RABBITHOLE) {
        this.startRabbitholeSequence()
      }
    }
    window.addEventListener('triggerRabbithole', this._rabbitholeListener)
    // Test Rabbithole button lives in App.jsx (single button, id=test-rabbithole-btn)
  }

  shutdown() {
    if (this._rKeyHandler) {
      document.removeEventListener('keydown', this._rKeyHandler)
    }
    if (this._rabbitholeListener) {
      window.removeEventListener('triggerRabbithole', this._rabbitholeListener)
    }
  }

  showInventory() {
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
    if (this.bibleAcquired && this.textures.exists(ASSETS.BIBLE)) {
      const bibleImg = this.add.image(x + 28, y + 48, ASSETS.BIBLE).setOrigin(0.5, 0.5)
      bibleImg.setScale(2)
      bibleImg.setInteractive({ useHandCursor: true })
      bibleImg.on('pointerdown', () => this.showReadFromInventory())
      children.push(bibleImg)
    } else {
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

  showReadFromInventory() {
    if (this.bibleReadText) return
    this._bibleReadClosing = false
    this.unlockAudio()
    if (this.cache.audio.exists(ASSETS.EVERYBRAND_AUDIO)) {
      this.sound.play(ASSETS.EVERYBRAND_AUDIO)
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
      const timeout = this.time.delayedCall(4000, () => {
        if (this.bibleReadText) this.onBibleReadClosed(false)
      })
      this.input.once('pointerdown', () => {
        timeout.remove()
        this.onBibleReadClosed(false)
      })
    })
  }

  onBibleReadClosed(fromShelf) {
    if (this._bibleReadClosing) return
    this._bibleReadClosing = true
    if (this.bibleReadText) {
      this.bibleReadText.destroy()
      this.bibleReadText = null
    }
    if (fromShelf) {
      // Reading from shelf: go straight to rabbithole fall
      this.time.delayedCall(50, () => this.startRabbitholeSequence())
      return
    }
    // Inventory read: close inventory, then start rabbithole (fall through floor to coca)
    this.hideInventory()
    this.time.delayedCall(100, () => this.startRabbitholeSequence())
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

    if (this.sceneState === SCENE_STATE.WAYNES_ROOM) {
      if (this.waynesBg) {
        const w = this.scale.width
        const { waynesScrollFactor } = layout
        this.waynesBg.x = w / 2 - (this.clerk.x - w / 2) * waynesScrollFactor
      }
      if (this.cat) {
        const { catLeftBound, catRightBound, catSpeed } = layout
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

    const bob =
      !this.target &&
      (this.sceneState === SCENE_STATE.FREE_WALK ||
        this.sceneState === SCENE_STATE.WAYNES_ROOM ||
        this.sceneState === SCENE_STATE.COCA_LANDED)
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
    this._bibleReadClosing = false

    if (this.cache.audio.exists(ASSETS.EVERYBRAND_AUDIO)) {
      this.sound.play(ASSETS.EVERYBRAND_AUDIO)
    }

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
      const timeout = this.time.delayedCall(4000, () => {
        if (this.bibleReadText) this.onBibleReadClosed(true)
      })
      this.input.once('pointerdown', () => {
        timeout.remove()
        this.onBibleReadClosed(true)
      })
    })
  }

  startRabbitholeSequence() {
    console.log('[Rabbithole] Starting sequence, state:', this.sceneState)
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
      this.tweens.add({
        targets: this.clerk,
        y: endY,
        angle: 65,
        duration,
        ease: 'Quad.easeIn',
        onComplete: () => {
          this._beginRabbitholeOverlay()
        },
      })
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

    if (this.cache.audio.exists(ASSETS.PRAY_AUDIO)) {
      // Lower coca.mp3 while pray plays
      const cocaEl = window.__cocaAudio
      const savedCocaVol = cocaEl ? cocaEl.volume : 0.9
      if (cocaEl) cocaEl.volume = 0.2

      const praySound = this.sound.add(ASSETS.PRAY_AUDIO)
      praySound.once('complete', () => {
        if (cocaEl) cocaEl.volume = savedCocaVol
      })
      praySound.play()
    }

    // After pray sequence, fade in coca.jpeg to fill the screen
    const height = this.scale.height
    this.time.delayedCall(1500, () => {
      if (!this.textures.exists(ASSETS.COCA_INTERMISSION)) return
      if (this.inventoryBtn) this.inventoryBtn.setVisible(false)
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
        if (this.backgroundImage) this.backgroundImage.setVisible(false)
        if (this.overlayText) this.overlayText.setVisible(false)
        if (this.introCaptionText) this.introCaptionText.setVisible(false)
        // Remove SWAT artifacts (paper sprites, etc.) before fade so they don't show through
        if (this.paperSprites?.length) {
          this.paperSprites.forEach((p) => p.destroy())
          this.paperSprites = []
        }
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
      })
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
      this.startWaynesRoom()
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
              if (dimmer) dimmer.destroy()
              if (this.picassoSound) {
                tweens.add({
                  targets: this.picassoSound,
                  volume: 0,
                  duration: 1000,
                  ease: 'Quad.easeOut',
                  onComplete: () => {
                    if (this.picassoSound) this.picassoSound.stop()
                    this.startWaynesRoom()
                  },
                })
              } else {
                this.startWaynesRoom()
              }
            },
          })
        })
      },
    })
  }

  startWaynesRoom() {
    const { width, height } = this.scale
    const layout = getLayout(width, height)

    this.sceneState = SCENE_STATE.WAYNES_ROOM
    this.movementEnabled = true
    this.target = null

    if (this.backgroundImage) this.backgroundImage.setVisible(false)

    if (this.cache.audio.exists(ASSETS.WAYNES_AUDIO)) {
      this.waynesMusic = this.sound.add(ASSETS.WAYNES_AUDIO, { loop: true })
      this.waynesMusic.play()
    }

    if (this.textures.exists(ASSETS.WAYNES_BG)) {
      this.waynesBg = this.add.image(width / 2, height / 2, ASSETS.WAYNES_BG).setOrigin(0.5, 0.5)
      this.waynesBg.setDepth(-100)
    }

    if (this.textures.exists(ASSETS.CAT_LEFT)) {
      if (!this.anims.exists('cat_walk_left')) {
        this.anims.create({
          key: 'cat_walk_left',
          frames: this.anims.generateFrameNumbers(ASSETS.CAT_LEFT, {
            start: ASSETS.CAT_WALK_FRAMES[0],
            end: ASSETS.CAT_WALK_FRAMES[1],
          }),
          frameRate: 5,
          repeat: -1,
        })
      }
      if (!this.anims.exists('cat_walk_right')) {
        this.anims.create({
          key: 'cat_walk_right',
          frames: this.anims.generateFrameNumbers(ASSETS.CAT_RIGHT, {
            start: ASSETS.CAT_WALK_FRAMES[0],
            end: ASSETS.CAT_WALK_FRAMES[1],
          }),
          frameRate: 5,
          repeat: -1,
        })
      }
      this.cat = this.add
        .sprite(layout.catLeftBound, layout.catY, ASSETS.CAT_RIGHT, 0)
        .setOrigin(0.5, 1)
        .setDepth(-50)
      this.catDirection = 1
      this.cat.play('cat_walk_right', true)
    }

    this.clerk.setPosition(width / 2, layout.clerkWalkY)
    if (this.statusText) this.statusText.setVisible(true).setText('Click on the floor to walk.')
    if (this.overlayText) this.overlayText.setVisible(false)
    if (this.introCaptionText) {
      this.introCaptionText.setVisible(true).setText("Wayne's place.")
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
      render: { transparent: true },
      scene: OfficeScene,
    }

    const game = new Phaser.Game(config)
    return () => game.destroy(true)
  }, [])

  return <div className="phaser-root" ref={containerRef} />
}
