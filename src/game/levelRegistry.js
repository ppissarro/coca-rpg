/**
 * CoCA RPG – Level Registry
 *
 * Data-driven level definitions. Add a new level here instead of scattering
 * logic across OfficeScene. enterLevel() uses this to set up backgrounds,
 * player, music, and level-specific extras.
 *
 * Flow: office → Wayne's → Executive → Supreme Court (+ rabbithole/coca paths)
 */

import { SCENE_STATE, ASSETS } from './config'

/** Keys for debug jump and flow transitions */
export const LEVEL_KEYS = {
  WAYNES_ROOM: SCENE_STATE.WAYNES_ROOM,
  WAYNES_ROOM_TRANSFORMED: 'waynesRoomTransformed', // Debug: Wayne's as NCR
  EXECUTIVE_SUITE: SCENE_STATE.EXECUTIVE_SUITE,
  SUPREME_COURT: SCENE_STATE.SUPREME_COURT,
  RABBITHOLE: SCENE_STATE.RABBITHOLE,
  COCA_LANDED: SCENE_STATE.COCA_LANDED,
}

/** Levels that can be entered via enterLevel() and have walkable layout */
export const WALKABLE_LEVELS = [
  LEVEL_KEYS.WAYNES_ROOM,
  LEVEL_KEYS.WAYNES_ROOM_TRANSFORMED,
  LEVEL_KEYS.EXECUTIVE_SUITE,
  LEVEL_KEYS.SUPREME_COURT,
  LEVEL_KEYS.COCA_LANDED,
]

/**
 * Level descriptor shape:
 * - background: { asset, fallbackColor?, sceneProperty? } | null
 * - hide: string[] – scene property names to hide (setVisible(false))
 * - show: string[] – scene property names to show
 * - music: ASSETS key | null
 * - stopMusic: string[] – which music refs to stop before starting
 * - caption: string – intro caption text
 * - statusText: string – bottom status
 * - inventoryVisible: boolean
 * - playerMode: 'clerk' | 'ncr'
 * - playerPosition: (scene, layout) => { x, y }
 * - playerScale: number | ((layout) => number) | null
 * - setup: (scene, layout) => void – level-specific setup (cat, coke boss, etc.)
 * - cleanup: (scene) => void – level-specific cleanup before exit
 * - destroyOnEnter: string[] – scene props to destroy when entering (e.g. executiveCokeBoss)
 * - musicRef: string – scene property to store music (e.g. 'waynesMusic')
 * - onBeforeEnter: (scene) => void – reset level-specific state before setup
 */
export function createLevelDescriptor(overrides) {
  return {
    background: null,
    hide: [],
    show: [],
    destroyOnEnter: [],
    music: null,
    musicRef: null,
    stopMusic: [],
    onBeforeEnter: null,
    caption: '',
    statusText: 'Click on the floor to walk.',
    inventoryVisible: false,
    playerMode: 'clerk',
    playerPosition: null,
    playerScale: null,
    setup: null,
    cleanup: null,
    ...overrides,
  }
}

export const LEVEL_DESCRIPTORS = {
  [LEVEL_KEYS.WAYNES_ROOM]: createLevelDescriptor({
    background: {
      asset: ASSETS.WAYNES_BG,
      fallbackColor: 0x1a1d24,
      sceneProperty: 'waynesBg',
    },
    hide: ['backgroundImage'],
    show: ['clerk', 'clerkHead', 'glassesLeft', 'glassesRight', 'tie', 'pocket'],
    showDepths: { clerk: 5000, clerkHead: 5000, glassesLeft: 5000, glassesRight: 5000, tie: 5000, pocket: 5000 },
    music: ASSETS.WAYNES_AUDIO,
    musicRef: 'waynesMusic',
    stopMusic: ['officeMusic', 'waynesMusic', 'hq1Music', 'hq2Music'],
    caption: "Wayne's place.",
    statusText: 'Click on the floor to walk.',
    inventoryVisible: true,
    playerMode: 'clerk',
    playerPosition: (scene, layout) => {
      const w = scene.scale.width
      return { x: w / 2, y: layout.clerkWalkY }
    },
    playerScale: (layout) => layout.waynesClerkScale ?? 1.15,
    setup: (scene, layout) => {
      // Cat patrol (destroy old cat if re-entering from debug jump)
      if (scene.cat) {
        scene.cat.destroy()
        scene.cat = null
      }
      if (scene.textures.exists(ASSETS.CAT_LEFT)) {
        if (!scene.anims.exists('cat_walk_left')) {
          scene.anims.create({
            key: 'cat_walk_left',
            frames: scene.anims.generateFrameNumbers(ASSETS.CAT_LEFT, {
              start: ASSETS.CAT_WALK_FRAMES[0],
              end: ASSETS.CAT_WALK_FRAMES[1],
            }),
            frameRate: 5,
            repeat: -1,
          })
        }
        if (!scene.anims.exists('cat_walk_right')) {
          scene.anims.create({
            key: 'cat_walk_right',
            frames: scene.anims.generateFrameNumbers(ASSETS.CAT_RIGHT, {
              start: ASSETS.CAT_WALK_FRAMES[0],
              end: ASSETS.CAT_WALK_FRAMES[1],
            }),
            frameRate: 5,
            repeat: -1,
          })
        }
        scene.cat = scene.add
          .sprite(layout.catLeftBound, layout.catY, ASSETS.CAT_RIGHT, 0)
          .setOrigin(0.5, 1)
          .setDepth(5)
          .setScale(layout.waynesCatScale ?? 0.65)
        scene.catDirection = 1
        scene.cat.play('cat_walk_right', true)
      }
      if (scene.overlayText) scene.overlayText.setVisible(false)
    },
  }),

  [LEVEL_KEYS.EXECUTIVE_SUITE]: createLevelDescriptor({
    background: {
      asset: ASSETS.HQ,
      getAsset: (scene) => (scene.glassesWorn ? ASSETS.HQ2 : ASSETS.HQ),
      fallbackColor: 0x1a1d24,
      sceneProperty: 'executiveBg',
    },
    hide: ['backgroundImage', 'waynesBg', 'cat'],
    show: ['waynesNcrOfficer'],
    music: null,
    stopMusic: ['officeMusic', 'waynesMusic'],
    caption: 'CoCA HQ',
    setup: (scene, layout) => {
      // HQ soundtrack: hq1 before glasses, hq2 when glasses on
      for (const ref of ['hq1Music', 'hq2Music']) {
        const snd = scene[ref]
        if (snd?.isPlaying) snd.stop()
      }
      const asset = scene.glassesWorn ? ASSETS.HQ2_AUDIO : ASSETS.HQ1_AUDIO
      const ref = scene.glassesWorn ? 'hq2Music' : 'hq1Music'
      if (scene.cache.audio.exists(asset)) {
        scene[ref] = scene.sound.add(asset, { loop: true })
        scene[ref].play()
      }
      // Glasses on desk (left side) – small, click to pick up
      if (scene.glassesProp) {
        scene.glassesProp.destroy()
        scene.glassesProp = null
      }
      if (!scene.glassesAcquired && scene.textures.exists(ASSETS.SUNGLASSES)) {
        const { executiveGlassesDeskX, executiveGlassesDeskY } = layout
        scene.glassesProp = scene.add
          .image(executiveGlassesDeskX, executiveGlassesDeskY, ASSETS.SUNGLASSES)
          .setOrigin(0.5, 0.5)
          .setScale(0.22)
          .setDepth(8)
          .setInteractive({ useHandCursor: true })
        scene.glassesProp.on('pointerdown', () => {
          scene.unlockAudio()
          if (scene.glassesAcquired || scene.sceneState !== SCENE_STATE.EXECUTIVE_SUITE) return
          scene.handleGlassesPickup()
        })
      }
    },
    statusText: 'Click on the floor to walk.',
    inventoryVisible: true,
    playerMode: 'ncr',
    playerPosition: (scene, layout) => {
      const w = scene.scale.width
      const startX = layout.executiveStartX ?? layout.executiveClerkLeftBound ?? 10
      const startY = layout.executiveStartY ?? scene.scale.height * 0.22
      return { x: startX, y: startY }
    },
    playerScale: null, // Executive uses dynamic scale in update
    onBeforeEnter: (scene) => {
      scene.executiveGuardSequence = null
      scene.executiveGuardOfficerLockX = null
      scene.executiveGuardOfficerLockY = null
      scene.executiveGuardOfficerScale = null
      if (scene.executiveCokeBoss) {
        scene.executiveCokeBoss.destroy()
        scene.executiveCokeBoss = null
      }
      scene.executiveCokeBossOffsetX = null
      if (scene.executiveGuardDialogueContainer) {
        scene.executiveGuardDialogueContainer.destroy()
        scene.executiveGuardDialogueContainer = null
      }
    },
  }),

  [LEVEL_KEYS.SUPREME_COURT]: createLevelDescriptor({
    background: {
      asset: ASSETS.SUPREME_COURT,
      altAsset: ASSETS.SUPREME_COURT_2,
      fallbackColor: 0x1a1d24,
      sceneProperty: 'supremeCourtBg',
      flickerInterval: 500,
    },
    hide: ['executiveBg', 'glassesProp'],
    destroyOnEnter: ['executiveCokeBoss'],
    show: ['waynesNcrOfficer'],
    music: ASSETS.SUPREME_COURT_AUDIO,
    musicRef: 'supremeCourtMusic',
    stopMusic: ['officeMusic', 'waynesMusic', 'hq1Music', 'hq2Music'],
    caption: 'Supreme Court',
    statusText: 'Supreme Court – battle mechanics (placeholder)',
    inventoryVisible: false,
    playerMode: 'ncr',
    playerPosition: (scene, layout) => ({
      x: layout.supremeCourtPlayerX ?? scene.scale.width * 0.35,
      y: layout.supremeCourtPlayerY ?? scene.scale.height * 0.88,
    }),
    playerScale: (layout) => layout.supremeCourtPlayerScale ?? 1.1,
  }),
}

/** Resolve level key; waynesRoomTransformed uses WAYNES_ROOM descriptor + override */
export function getLevelDescriptor(key) {
  if (key === LEVEL_KEYS.WAYNES_ROOM_TRANSFORMED) {
    const base = LEVEL_DESCRIPTORS[LEVEL_KEYS.WAYNES_ROOM]
    return {
      ...base,
      playerMode: 'ncr',
      show: ['waynesNcrOfficer'],
      hide: ['backgroundImage', 'clerk', 'clerkHead', 'glassesLeft', 'glassesRight', 'tie', 'pocket'],
    }
  }
  return LEVEL_DESCRIPTORS[key] ?? null
}

/**
 * Enter a level using its descriptor. Handles:
 * - Hiding previous level assets
 * - Creating background
 * - Positioning/showing player (clerk or NCR)
 * - Music, status text, caption
 * - Level-specific setup() callback
 *
 * @param {Object} scene - Phaser scene (OfficeScene)
 * @param {string} key - Level key (e.g. LEVEL_KEYS.WAYNES_ROOM)
 * @param {Object} layout - getLayout(width, height) result
 * @param {Object} [options] - { createNcrIfMissing, sceneState }
 */
export function enterLevel(scene, key, layout, options = {}) {
  const desc = getLevelDescriptor(key)
  if (!desc) return

  const { width, height } = scene.scale
  const sceneState = options.sceneState ?? key
  if (options.sceneState != null) {
    scene.sceneState = options.sceneState
  } else if (key === LEVEL_KEYS.WAYNES_ROOM_TRANSFORMED) {
    scene.sceneState = SCENE_STATE.WAYNES_ROOM
  } else {
    scene.sceneState = sceneState
  }

  scene.target = null
  scene.movementEnabled = true
  scene.walkingToBible = false

  // Destroy objects from previous level
  for (const prop of desc.destroyOnEnter || []) {
    const obj = scene[prop]
    if (obj) {
      if (obj.destroy) obj.destroy()
      scene[prop] = null
    }
  }
  if (key === LEVEL_KEYS.SUPREME_COURT) {
    scene.executiveCokeBossOffsetX = null
  }

  // Level-specific reset (Executive guard state, etc.)
  if (typeof desc.onBeforeEnter === 'function') {
    desc.onBeforeEnter(scene)
  }

  // Stop music
  for (const ref of desc.stopMusic || []) {
    const snd = scene[ref]
    if (snd?.isPlaying) snd.stop()
  }

  // Hide
  for (const prop of desc.hide || []) {
    const obj = scene[prop]
    if (obj) {
      if (obj.setVisible) obj.setVisible(false)
      else if (Array.isArray(obj)) obj.forEach((o) => o?.setVisible?.(false))
    }
  }

  // Create background
  if (desc.background) {
    const bg = desc.background
    const prop = bg.sceneProperty
    if (prop && scene[prop]) {
      scene[prop].destroy()
      scene[prop] = null
    }
    if (scene.supremeCourtBgTimer) {
      scene.supremeCourtBgTimer.remove()
      scene.supremeCourtBgTimer = null
    }

    const assetKey = bg.getAsset ? bg.getAsset(scene) : bg.asset
    const hasAsset = scene.textures.exists(assetKey)
    if (hasAsset) {
      const img = scene.textures.get(assetKey).getSourceImage()
      const imgW = img?.width ?? width
      const imgH = img?.height ?? height
      const scale = Math.max(width / imgW, height / imgH)
      const dispW = Math.ceil(imgW * scale)
      const dispH = Math.ceil(imgH * scale)
      const image = scene.add
        .image(width / 2, height / 2, assetKey)
        .setOrigin(0.5, 0.5)
        .setDisplaySize(dispW, dispH)
        .setDepth(0)
      if (prop) scene[prop] = image

      if (bg.flickerInterval && bg.altAsset && scene.textures.exists(bg.altAsset)) {
        const bgKeys = [bg.asset, bg.altAsset]
        let idx = 0
        scene.supremeCourtBgDispSize = { w: dispW, h: dispH }
        scene.supremeCourtBgTimer = scene.time.addEvent({
          delay: bg.flickerInterval,
          callback: () => {
            if (!scene[prop] || scene.sceneState !== SCENE_STATE.SUPREME_COURT) return
            idx = 1 - idx
            scene[prop].setTexture(bgKeys[idx])
            scene[prop].setDisplaySize(dispW, dispH)
          },
          loop: true,
        })
      }
    } else if (bg.fallbackColor != null) {
      const rect = scene.add
        .rectangle(width / 2, height / 2, width, height, bg.fallbackColor)
        .setDepth(0)
      if (prop) scene[prop] = rect
    }
  }

  // Show (with optional depth so player renders above background)
  const showDepths = desc.showDepths || {}
  for (const prop of desc.show || []) {
    const obj = scene[prop]
    if (obj) {
      if (obj.setVisible) obj.setVisible(true)
      if (showDepths[prop] != null && obj.setDepth) obj.setDepth(showDepths[prop])
    }
  }

  // Player setup
  if (desc.playerMode === 'ncr' && options.createNcrIfMissing !== false) {
    if (!scene.waynesNcrOfficer && scene.textures.exists(ASSETS.NCR_OFFICER)) {
      const pos = desc.playerPosition?.(scene, layout) ?? { x: width / 2, y: layout.clerkWalkY }
      scene.waynesNcrOfficer = scene.add
        .sprite(pos.x, pos.y, ASSETS.NCR_OFFICER, 0)
        .setOrigin(0.5, 1)
        .setDepth(10)
    }
    if (scene.waynesNcrOfficer) {
      const pos = desc.playerPosition?.(scene, layout)
      if (pos) scene.waynesNcrOfficer.setPosition(pos.x, pos.y)
      const scale = typeof desc.playerScale === 'function' ? desc.playerScale(layout) : desc.playerScale
      if (scale != null) scene.waynesNcrOfficer.setScale(scale)
      scene.waynesNcrOfficer.setVisible(true)
      scene.ncrFacing = 'right'
    }
  } else if (desc.playerMode === 'clerk' && scene.clerk) {
    const pos = desc.playerPosition?.(scene, layout)
    if (pos) scene.clerk.setPosition(pos.x, pos.y)
    const scale = typeof desc.playerScale === 'function' ? desc.playerScale(layout) : desc.playerScale
    if (scale != null) scene.clerk.setScale(scale)
  }

  // Music
  const musicRef = desc.musicRef ?? (desc.music ? 'waynesMusic' : null)
  if (desc.music && musicRef && scene.cache.audio.exists(desc.music)) {
    scene[musicRef] = scene.sound.add(desc.music, { loop: true })
    scene[musicRef].play()
  }

  // UI
  if (scene.statusText) scene.statusText.setVisible(true).setText(desc.statusText ?? '')
  if (scene.introCaptionText) scene.introCaptionText.setVisible(true).setText(desc.caption ?? '')
  if (scene.inventoryBtn) scene.inventoryBtn.setVisible(desc.inventoryVisible ?? false)

  // Supreme Court: create coke boss (destroy existing first to avoid duplicates on re-entry)
  if (key === LEVEL_KEYS.SUPREME_COURT && scene.textures.exists(ASSETS.COKEBOSS)) {
    if (scene.supremeCourtCokeBoss) {
      scene.supremeCourtCokeBoss.destroy()
      scene.supremeCourtCokeBoss = null
    }
    const bossX = layout.supremeCourtCokeBossX ?? width * 0.65
    const bossY = layout.supremeCourtCokeBossY ?? height * 0.88
    const supScale = layout.supremeCourtCokeBossScale ?? 1.1
    scene.supremeCourtCokeBoss = scene.add
      .image(bossX, bossY, ASSETS.COKEBOSS)
      .setOrigin(0.5, 1)
      .setScale(supScale)
      .setDepth(10)
  }

  // Level-specific setup
  if (typeof desc.setup === 'function') {
    desc.setup(scene, layout)
  }
}
