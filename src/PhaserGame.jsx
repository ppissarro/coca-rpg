import { useEffect, useRef } from 'react'
import Phaser from 'phaser'

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

    this.sceneState = 'introIdle' // 'introIdle' | 'freeWalk' | 'bibleRead' | 'biblePicked' | 'biblePause' | 'raid' | 'logo'
    this.bibleState = 'inShelf' // 'inShelf' | 'inspected' | 'pickedUp'

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
  }

  preload() {
    // These load from the Vite/Vercel public folder.
    // Place your art files as:
    // public/office_bg.png, public/clerk.png, public/bible.png
    this.load.image('office_bg', 'office_bg.png')
    this.load.spritesheet('clerk', 'clerk.png', {
      frameWidth: 32,
      frameHeight: 47,
    })
    this.load.image('bibleSprite', 'bible.png')
  }

  create() {
    const { width, height } = this.scale

    // Background – dark, low-res office
    this.cameras.main.setBackgroundColor(0x050608)

    const g = this.add.graphics()

    // If an authored background image exists, use it as the room art.
    if (this.textures.exists('office_bg')) {
      this.add.image(width / 2, height / 2, 'office_bg').setOrigin(0.5, 0.5)
    }

    // Back wall – banded to feel grimy and layered
    g.fillStyle(0x141720, 1)
    g.fillRect(0, 0, width, height - 90)
    g.fillStyle(0x191b24, 1)
    g.fillRect(0, 18, width, height - 102)
    g.fillStyle(0x10131a, 1)
    g.fillRect(0, height - 120, width, 24)

    // Distant cubicle hall – minimal, soft hints only
    g.fillStyle(0x1b1f28, 1)
    const bandY = 26
    g.fillRect(0, bandY, width, 10)
    g.fillStyle(0x20242e, 1)
    g.fillRect(0, bandY + 10, width, 2)

    // A few tiny "window" slits to imply rows of cubes
    g.fillStyle(0x252938, 1)
    const windowY = bandY + 3
    const windowWidth = 14
    const windowGap = 26
    for (let x = 10; x < width - 20; x += windowWidth + windowGap) {
      g.fillRect(x, windowY, windowWidth, 3)
      g.fillStyle(0x181b24, 1)
      g.fillRect(x, windowY + 3, windowWidth, 2)
      g.fillStyle(0x252938, 1)
    }

    // Floor (2.5D trapezoid)
    g.fillStyle(0x22252a, 1)
    const floorPoints = [
      [
        { x: 10, y: height - 30 },
        { x: width - 10, y: height - 30 },
        { x: width - 50, y: height - 80 },
        { x: 50, y: height - 80 },
      ],
    ]
    g.fillPoints(floorPoints[0], true)

    // Floor scuff lines
    g.lineStyle(1, 0x1a1d22, 0.7)
    g.beginPath()
    g.moveTo(40, height - 50)
    g.lineTo(width / 2 - 20, height - 58)
    g.moveTo(width / 2 + 10, height - 45)
    g.lineTo(width - 40, height - 55)
    g.strokePath()

    // Filing cabinet on left
    g.fillStyle(0x30333c, 1)
    g.fillRect(20, height - 140, 26, 60)
    this.cabinet = this.add.rectangle(33, height - 110, 26, 40, 0x30333c).setOrigin(0.5)
    this.cabinetDrawer = this.add.rectangle(33, height - 118, 22, 14, 0x383b46).setOrigin(0.5)

    // "ARCHIVES" light above cabinet
    const archivesText = this.add.text(12, height - 152, 'ARCHIVES', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ff4040',
    })
    archivesText.setAlpha(0.6)
    this.tweens.add({
      targets: archivesText,
      alpha: { from: 0.3, to: 1 },
      duration: 700,
      yoyo: true,
      repeat: -1,
    })

    // Desk in middle – chunkier to read as a focal prop
    g.fillStyle(0x333640, 1)
    g.fillRect(width / 2 - 36, height - 118, 72, 20)

    // Chair behind desk
    this.chair = this.add.rectangle(width / 2 - 18, height - 102, 16, 14, 0x252831)

    // CRT monitor on desk
    g.fillStyle(0x20252d, 1)
    g.fillRect(width / 2 - 6, height - 126, 18, 12)
    g.fillStyle(0x0e1117, 1)
    g.fillRect(width / 2 - 4, height - 124, 14, 8)

    // Coffee mug
    g.fillStyle(0x444a55, 1)
    g.fillRect(width / 2 - 18, height - 118, 6, 8)

    // Faint CRT glow cone
    const crtGlow = this.add.rectangle(width / 2 + 2, height - 120, 34, 22, 0x5fd0ff, 0.05)
    crtGlow.setOrigin(0.5)
    this.tweens.add({
      targets: crtGlow,
      alpha: { from: 0.03, to: 0.09 },
      duration: 900,
      yoyo: true,
      repeat: -1,
    })

    // Bible shelf on right
    g.fillStyle(0x2b2e36, 1)
    g.fillRect(width - 70, height - 135, 32, 50)
    g.fillStyle(0x3a3d46, 1)
    g.fillRect(width - 72, height - 135, 36, 4)

    // CoCA Bible (small red-on-black book) – sprite if available, otherwise a rectangle
    if (this.textures.exists('bibleSprite')) {
      this.bible = this.add.image(width - 54, height - 142, 'bibleSprite')
      this.bible.setOrigin(0.5, 0.5)
      this.bibleLabel = this.add.text(this.bible.x - 16, this.bible.y - 18, '(CoCA)', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#ff3030',
      })
    } else {
      this.bible = this.add.rectangle(width - 54, height - 142, 18, 10, 0x000000)
      this.bibleLabel = this.add.text(this.bible.x - 14, this.bible.y - 8, '(CoCA)', {
        fontFamily: 'monospace',
        fontSize: '7px',
        color: '#ff3030',
      })
    }

    // Bible interaction zone
    this.bibleZone = this.add.zone(this.bible.x, this.bible.y, 40, 24)
    this.bibleZone.setOrigin(0.5)
    this.bibleZone.setInteractive({ useHandCursor: true })

    // Dorky clerk character – prefer authored sprite, fall back to rectangles if missing.
    if (this.textures.exists('clerk')) {
      this.clerk = this.add.sprite(width / 2, height - 80, 'clerk', 0)
      // Anchor at feet so he stands on the floor in your background.
      this.clerk.setOrigin(0.5, 1)
      this.usingClerkSprite = true

      if (!this.anims.exists('clerk_idle')) {
        this.anims.create({
          key: 'clerk_idle',
          frames: this.anims.generateFrameNumbers('clerk', { start: 0, end: 1 }),
          frameRate: 2,
          repeat: -1,
        })
      }
      if (!this.anims.exists('clerk_walk')) {
        this.anims.create({
          key: 'clerk_walk',
          frames: this.anims.generateFrameNumbers('clerk', { start: 2, end: 3 }),
          frameRate: 6,
          repeat: -1,
        })
      }
      this.clerk.play('clerk_idle')
    } else {
      // Wide, blocky torso to sell "fat, overly dorky" silhouette
      this.clerk = this.add.rectangle(width / 2, height - 110, 14, 24, 0xcbd5f5)
      this.clerkHead = this.add.rectangle(this.clerk.x, this.clerk.y - 18, 14, 14, 0xcbd5f5)

      // Glasses – tiny pixel squares that track with the head
      this.glassesLeft = this.add.rectangle(this.clerkHead.x - 5, this.clerkHead.y - 1, 4, 4, 0x000000)
      this.glassesRight = this.add.rectangle(this.clerkHead.x + 5, this.clerkHead.y - 1, 4, 4, 0x000000)

      // Tie and pocket – simple blocks that move with the torso
      this.tie = this.add.rectangle(this.clerk.x, this.clerk.y + 4, 2, 8, 0xaa2020)
      this.pocket = this.add.rectangle(this.clerk.x + 3, this.clerk.y - 2, 5, 4, 0x1e2230)

      this.usingClerkSprite = false
    }

    // UI text prompts
    this.statusText = this.add.text(8, height - 22, 'Click to stand up.', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#b0b6d1',
    })

    // Intro caption
    this.add.text(8, 8, 'Low-Level Legal Processing Unit 14B – Night Shift.', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#9ea3c4',
      wordWrap: { width: width - 16 },
    })

    // Click handling
    this.input.on('pointerdown', (pointer) => {
      // Once the Bible is picked up and we are in/after raid, ignore input.
      if (!this.clerk || this.sceneState === 'raid' || this.sceneState === 'logo') return

      // First click: stand up from the desk.
      if (this.sceneState === 'introIdle' && this.isSeated && !this.movementEnabled) {
        this.isSeated = false
        this.movementEnabled = true
        this.sceneState = 'freeWalk'
        if (this.statusText) {
          this.statusText.setText('Click on the floor to walk.')
        }
        return
      }

      if (!this.movementEnabled) return

      // Regular walk click – only if you click roughly on the floor area.
      if (pointer.y >= height - 90 && pointer.y <= height - 20) {
        this.target = { x: pointer.x, y: pointer.y }
        this.walkingToBible = false
      }
    })

    // Bible click – walk to it and prepare for pickup
    this.bibleZone.on('pointerdown', () => {
      if (!this.movementEnabled || this.bibleAcquired || this.sceneState !== 'freeWalk') return
      this.target = { x: this.bible.x - 8, y: this.bible.y + 10 }
      this.walkingToBible = true
    })
  }

  update(_, delta) {
    if (!this.clerk) return

    this.idleTime += delta

    if (this.target) {
      const speed = 0.12 * delta
      const dx = this.target.x - this.clerk.x
      const dy = this.target.y - this.clerk.y
      const dist = Math.hypot(dx, dy)
      if (dist < 1) {
        // Arrived at destination
        if (this.walkingToBible && !this.bibleAcquired) {
          // Snap neatly to the shelf position
          this.clerk.x = this.bible.x - 8
          this.clerk.y = this.bible.y + 10

          this.target = null
          this.walkingToBible = false
          this.showBibleMenu()
        } else {
          this.target = null
        }
      } else {
        this.clerk.x += (dx / dist) * speed
        this.clerk.y += (dy / dist) * speed
      }
    }

    // Idle breathing bob when not walking
    const bob =
      !this.target && (this.sceneState === 'introIdle' || this.sceneState === 'freeWalk')
        ? Math.sin(this.idleTime * 0.005) * 1
        : 0

    if (this.usingClerkSprite) {
      // Slight idle bob for sprite
      this.clerk.y = (this.target ? this.clerk.y : this.clerk.y) + bob * 0.05

      // Switch between idle and walk animations
      if (this.target && this.sceneState === 'freeWalk') {
        this.clerk.play('clerk_walk', true)
      } else {
        this.clerk.play('clerk_idle', true)
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
    // Allow menu whenever the Bible is still on the shelf (either fresh or inspected).
    if (this.sceneState !== 'freeWalk' || this.bibleState === 'pickedUp') return

    const { width, height } = this.scale
    this.sceneState = 'bibleRead'

    // Simple menu box near the shelf
    const menuWidth = 120
    const menuHeight = 40
    const x = width - menuWidth - 8
    const y = height - 130

    const bg = this.add.rectangle(x, y, menuWidth, menuHeight, 0x050608, 0.95).setOrigin(0, 0)
    bg.setStrokeStyle(1, 0xffffff, 0.6)

    const readText = this.add.text(x + 6, y + 6, '[Read corporate doctrine]', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#d0d5ff',
    })
    const pickText = this.add.text(x + 6, y + 18, '[Pick up]', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#ff6060',
    })

    readText.setInteractive({ useHandCursor: true })
    pickText.setInteractive({ useHandCursor: true })

    this.bibleMenuContainer = this.add.container(0, 0, [bg, readText, pickText])

    readText.on('pointerdown', () => {
      this.handleBibleRead()
    })

    pickText.on('pointerdown', () => {
      this.handleBiblePickup()
    })
  }

  handleBibleRead() {
    if (this.bibleState !== 'inShelf') return

    this.bibleState = 'inspected'
    this.sceneState = 'bibleRead'

    if (this.bibleMenuContainer) {
      this.bibleMenuContainer.destroy()
      this.bibleMenuContainer = null
    }

    const { width } = this.scale
    this.bibleReadText = this.add.text(
      width / 2,
      30,
      '“Every brand commandment,\n bound in red ink and bad faith.”',
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

    // Close on click anywhere; return to free walk.
    this.time.delayedCall(150, () => {
      this.input.once('pointerdown', () => {
        if (this.bibleReadText) {
          this.bibleReadText.destroy()
          this.bibleReadText = null
        }
        this.sceneState = 'freeWalk'
      })
    })
  }

  handleBiblePickup() {
    if (this.bibleState === 'pickedUp') return

    const { width } = this.scale

    if (this.bibleMenuContainer) {
      this.bibleMenuContainer.destroy()
      this.bibleMenuContainer = null
    }

    // Hide the Bible from the shelf
    if (this.bible) {
      this.bible.setVisible(false)
      this.bible.disableInteractive?.()
    }
    if (this.bibleLabel) {
      this.bibleLabel.setVisible(false)
    }
    if (this.bibleZone) {
      this.bibleZone.disableInteractive()
    }

    this.bibleAcquired = true
    this.bibleState = 'pickedUp'
    this.sceneState = 'biblePicked'

    // Small overlay notification
    this.overlayText = this.add.text(width / 2, 10, 'You acquired the CoCA Bible.', {
      fontFamily: 'monospace',
      fontSize: '8px',
      color: '#f4f4f4',
      backgroundColor: '#000000c0',
      padding: { x: 4, y: 2 },
    })
    this.overlayText.setOrigin(0.5, 0)

    if (this.statusText) {
      this.statusText.setText('')
    }

    // After 1 second, freeze movement then go into the (placeholder) raid state.
    this.time.delayedCall(1000, () => {
      this.movementEnabled = false
      this.target = null
      this.sceneState = 'biblePause'
      this.startRaidSequence()
    })
  }

  startRaidSequence() {
    if (this.sceneState !== 'biblePause') return
    this.sceneState = 'raid'

    const { width, height } = this.scale

    // Red lockdown door glow
    const doorGlow = this.add.rectangle(width - 20, height - 110, 20, 40, 0xff0000, 0.5)
    doorGlow.setOrigin(0.5)
    this.tweens.add({
      targets: doorGlow,
      alpha: { from: 0.2, to: 0.8 },
      duration: 200,
      yoyo: true,
      repeat: 3,
    })

    // Small "LOCKDOWN" text above door
    const lockdownText = this.add.text(width - 52, height - 150, 'LOCKDOWN', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#ff4040',
    })

    // Spawn buffoonish SWAT silhouettes
    const makeUnit = (x, y) =>
      this.add.rectangle(x, y, 14, 28, 0x1a2128).setStrokeStyle(1, 0x000000, 0.9)

    const unitDoor = makeUnit(width + 20, height - 110)
    const unitVent = makeUnit(width / 2, -20)
    const unitLeft = makeUnit(-20, height - 105)

    this.swatUnits.push(unitDoor, unitVent, unitLeft)

    const tweens = this.tweens

    // Unit from door: burst in, hit desk area
    tweens.add({
      targets: unitDoor,
      x: width - 60,
      duration: 350,
      delay: 150,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Knock the chair sideways
        if (this.chair) {
          tweens.add({
            targets: this.chair,
            angle: 40,
            x: this.chair.x + 8,
            y: this.chair.y + 6,
            duration: 200,
            ease: 'Quad.easeOut',
          })
        }
      },
    })

    // Unit from vent: drop down to behind desk
    tweens.add({
      targets: unitVent,
      y: height - 125,
      duration: 400,
      delay: 250,
      ease: 'Quad.easeIn',
    })

    // Unit from left: run to cabinet
    tweens.add({
      targets: unitLeft,
      x: 40,
      duration: 400,
      delay: 200,
      ease: 'Quad.easeOut',
      onComplete: () => {
        // Yank open cabinet drawer and spawn paper sprites
        if (this.cabinetDrawer) {
          tweens.add({
            targets: this.cabinetDrawer,
            x: this.cabinetDrawer.x - 8,
            duration: 180,
            ease: 'Quad.easeOut',
          })
        }

        for (let i = 0; i < 4; i += 1) {
          const paper = this.add.rectangle(
            this.cabinetDrawer ? this.cabinetDrawer.x : 40,
            this.cabinetDrawer ? this.cabinetDrawer.y : height - 118,
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

    // Scanner beam sweeping across room
    const scanner = this.add.rectangle(width / 2, height - 70, width - 30, 6, 0xff0000, 0.25)
    scanner.setOrigin(0.5)
    scanner.alpha = 0
    tweens.add({
      targets: scanner,
      alpha: { from: 0, to: 0.4 },
      duration: 150,
      yoyo: true,
      repeat: 5,
      delay: 400,
      onUpdate: (tween) => {
        scanner.y = height - 90 + Math.sin(tween.progress * Math.PI) * 30
      },
    })

    // Brief comms dialogue
    const commsText = this.add.text(8, height - 60, '[Comms]: Asset triggered scripture protocol.', {
      fontFamily: 'monospace',
      fontSize: '7px',
      color: '#cbd5ff',
      backgroundColor: '#000000c0',
      padding: { x: 3, y: 2 },
    })

    this.time.delayedCall(2000, () => {
      commsText.setText('Unit: Negative. No scripture detected.')
    })

    // Exit after ~4 seconds of chaos
    this.time.delayedCall(4000, () => {
      tweens.add({
        targets: [unitDoor, unitVent, unitLeft],
        x: (target) => {
          if (target === unitDoor) return width + 30
          if (target === unitVent) return width / 2
          return -30
        },
        y: (target) => {
          if (target === unitVent) return -30
          return target.y
        },
        alpha: { from: 1, to: 0 },
        duration: 400,
        ease: 'Quad.easeIn',
        onComplete: () => {
          [unitDoor, unitVent, unitLeft].forEach((u) => u.destroy())
        },
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

      // Hold on the quiet post-raid beat a bit longer before revealing the logo.
      this.time.delayedCall(1500, () => {
        this.sceneState = 'logo'

        // Dim the room with a transparent overlay, but keep the logo fully visible on top.
        const dimmer = this.add.rectangle(width / 2, height / 2, width, height, 0x000000, 0)
        dimmer.setOrigin(0.5)
        this.tweens.add({
          targets: dimmer,
          alpha: { from: 0, to: 0.7 },
          duration: 1200,
          ease: 'Quad.easeOut',
        })

        const logoText = this.add.text(width / 2, height / 2 - 8, 'CoCA', {
          fontFamily: 'monospace',
          fontSize: '20px',
          color: '#ff3030',
        }).setOrigin(0.5)

        const subText = this.add.text(width / 2, height / 2 + 10, 'Corporate Canonical Authority', {
          fontFamily: 'monospace',
          fontSize: '8px',
          color: '#f4f4f4',
        }).setOrigin(0.5, 0)

        this.tweens.add({
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
      width: 320,
      height: 180,
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
    return () => {
      game.destroy(true)
    }
  }, [])

  return <div className="phaser-root" ref={containerRef} />
}

