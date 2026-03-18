/**
 * CoCA RPG – single source of truth for game dimensions, states, assets, and layout.
 * Change numbers here; the scene reads from this.
 */

export const GAME_WIDTH = 320
export const GAME_HEIGHT = 180

/** Scene flow: introIdle → freeWalk → [bibleRead / biblePicked] → biblePause → raid → logo → intermission → waynesRoom */
export const SCENE_STATE = {
  INTRO_IDLE: 'introIdle',
  FREE_WALK: 'freeWalk',
  BIBLE_READ: 'bibleRead',
  BIBLE_PICKED: 'biblePicked',
  BIBLE_PAUSE: 'biblePause',
  RAID: 'raid',
  LOGO: 'logo',
  INTERMISSION: 'intermission',
  WAYNES_ROOM: 'waynesRoom',
  EXECUTIVE_SUITE: 'executiveSuite',
  RABBITHOLE: 'rabbithole',
  COCA_LANDED: 'cocaLanded',
  LAWSUIT: 'lawsuit',
  SUPREME_COURT: 'supremeCourt',
}

/** Bible object: inShelf → inspected (optional) → pickedUp */
export const BIBLE_STATE = {
  IN_SHELF: 'inShelf',
  INSPECTED: 'inspected',
  PICKED_UP: 'pickedUp',
}

/** Asset keys and sprite dimensions. Files live in public/. */
export const ASSETS = {
  OFFICE_BG: 'office_bg',
  OFFICE_BG_NOBIBLE: 'office_bg_nobible',
  OFFICE_BG_RAID: 'office_bg_raid',
  OFFICE_AUDIO: 'office',
  SWIPE_AUDIO: 'swipe',
  FIND_BIBLE_AUDIO: 'findthatbible',
  SWAT_CRASH_AUDIO: 'swat_team_crash_in',
  THIS_ROOM_CLEAR_AUDIO: 'thisroomsclear',
  PICASSO_AUDIO: 'picasso',
  EVERYBRAND_AUDIO: 'everybrand',
  SWAT_LEFT: 'swat_left',
  SWAT_RIGHT: 'swat_right',
  SWAT_TOP: 'swat_top',
  CLERK_RIGHT: 'clerk_right',
  CLERK_LEFT: 'clerk_left',
  COCA_INTERMISSION: 'coca_intermission',
  WAYNES_BG: 'waynes_bg',
  WAYNES_AUDIO: 'waynes',
  CAT_LEFT: 'cat_left',
  CAT_RIGHT: 'cat_right',
  BIBLE: 'bibleSprite',
  FREEFALL_LEFT: 'freefall_left',
  FREEFALL_RIGHT: 'freefall_right',
  FREEFALL_LOOP_AUDIO: 'freefall_loop',
  COCA_LAND_AUDIO: 'coca_land',
  COCA_BG: 'coca_bg',
  PRAY: 'pray',
  PRAY_AUDIO: 'pray_audio',
  RABBITHOLE_VIDEO: 'rabbithole',
  SHRUG: 'shrug',
  HQ: 'hq',
  HQ2: 'hq2',
  SUNGLASSES: 'sunglasses',
  HQ1_AUDIO: 'hq1',
  HQ2_AUDIO: 'hq2',
  SUPREME_COURT: 'supremecourt',
  SUPREME_COURT_AUDIO: 'supremecourt_audio',
  LAWSUIT_AUDIO: 'lawsuit',
  TRANSFORM_AUDIO: 'transform',
  SUPREME_COURT_2: 'supremecourt2',
  COKEBOSS: 'cokeboss',
  NCR_OFFICER: 'ncrcamofficer_right',
  NCR_OFFICER_LEFT: 'ncrcamofficer_left',
  NCR_OFFICER_SINGLE: 'ncr_officer_single', // Runtime cropped texture (frame 0 only)
  // NCR officer: 4 cells in 177×100 image = 44×100 per frame
  NCR_FRAME_WIDTH: 44,
  NCR_FRAME_HEIGHT: 100,
  NCR_IDLE_FRAME: 0,
  NCR_WALK_FRAMES: [0, 3],
  // Clerk: 180×66 sheet split into 4 quarters (45×66 per frame)
  CLERK_FRAME_WIDTH: 45,
  CLERK_FRAME_HEIGHT: 66,
  CLERK_IDLE_FRAME: 0,
  CLERK_WALK_FRAMES: [0, 3],
  // Shrug: 118×66, 4 cells in a row (29×66 per frame)
  SHRUG_FRAME_WIDTH: 29,
  SHRUG_FRAME_HEIGHT: 66,
  // Cat: 180×101, 4 cells (45×101 per frame)
  CAT_FRAME_WIDTH: 45,
  CAT_FRAME_HEIGHT: 100,
  CAT_WALK_FRAMES: [0, 3],
}

/** Layout positions as functions of (width, height). Use in create() so one place controls all positions. */
export function getLayout(width, height) {
  return {
    // Floor: 22% up from bottom → walk line; clerk slightly lower
    floorY: height * 0.78,
    floorYMin: height * 0.78 - 20,
    floorYMax: height * 0.78 + 20,

    // Clerk start / walk line (locked to floor, lower)
    clerkStartX: width / 2,
    clerkStartY: height * 0.88,
    clerkWalkY: height * 0.88,
    clerkFallbackY: height * 0.88,
    clerkLeftBound: 25,
    clerkRightBound: width - 25,

    // Bible: invisible button midway down, 28% in from right
    bibleX: width * (1 - 0.28),
    bibleY: height * 0.5,
    bibleStandX: width * (1 - 0.28),
    bibleStandY: height * 0.88,

    // Bible menu (box sized so "[Read corporate doctrine]" fits)
    bibleMenuX: width - 148 - 8,
    bibleMenuY: height - 130,
    bibleMenuW: 148,
    bibleMenuH: 44,

    // UI
    statusTextX: 8,
    statusTextY: height - 22,
    inventoryBtnX: width - 76,
    inventoryBtnY: 8,
    inventoryBtnW: 68,
    inventoryBtnH: 20,
    introCaptionY: 8,
    overlayTextY: 10,
    readTextY: 30,

    // Raid / door
    doorGlowX: width - 20,
    doorGlowY: height - 110,
    lockdownTextX: width - 52,
    lockdownTextY: height - 150,
    unitDoorEndX: width - 60,
    unitDoorY: height - 50,
    unitVentEndY: height - 125,
    unitLeftEndX: 40,
    unitLeftY: height - 50,
    chairKnockDx: 8,
    chairKnockDy: 6,
    drawerOpenDx: -8,
    commsTextY: height - 60,
    logoSubtextY: height / 2 + 10,

    // Props (for SWAT sequence)
    chairX: width / 2 - 18,
    chairY: height - 102,
    cabinetDrawerX: 33,
    cabinetDrawerY: height - 118,
    paperOriginY: height - 118,
    scannerY: height - 70,
    scannerSweepMin: height - 90,
    scannerSweepRange: 30,

    // Wayne's room: background scrolls as clerk walks
    waynesScrollFactor: 0.5,
    waynesClerkLeftBound: 10,
    waynesClerkRightBound: width - 10,
    catLeftBound: 30,
    catRightBound: 120,
    catY: height * 0.88,
    catSpeed: 0.04,
    waynesClerkScale: 1.15,
    waynesCatScale: 0.65,

    // Executive Suite (HQ): start near top (small), walk down hallway (get bigger), pick glasses, walk to boss
    executiveStartY: height * 0.22, // Near top – small, grows as you walk down
    executiveWalkY: height * 0.88,
    executiveFloorYMin: height * 0.5,
    executiveFloorYMax: height + 10,
    executiveClerkLeftBound: 10,
    executiveClerkRightBound: width - 5, // Allow walking across full HQ
    executiveStartX: width * 0.12, // Slightly right of left edge on level 3
    executiveScaleLockX: width * 0.5, // Lock officer scale when walking right past 50%
    executiveGuardX: width * 0.78, // Guard triggers here – dialogue + camera pan; allows walking further right first
    executiveScrollFactor: 0.5,
    executiveMinScale: 0.35,
    executiveMaxScale: 1.1,
    executiveCokeBossX: width * 0.85,
    executiveCokeBossY: height * 0.45, // Floating, fixed position on right
    executiveGlassesDeskX: width * 0.55, // Glasses on desk
    executiveGlassesDeskY: height * 0.48, // Slightly up – fixed on desk (moves with bg)

    // Supreme Court (level 4): center facing off, battle – larger scale so characters pop off bg
    supremeCourtPlayerX: width * 0.35,
    supremeCourtPlayerY: height * 0.88,
    supremeCourtPlayerScale: 1.1,
    supremeCourtCokeBossX: width * 0.65,
    supremeCourtCokeBossY: height * 0.88,
    supremeCourtCokeBossScale: 1.1,

    // Stage 1: clerk slowly sinks through floor of current room (ms)
    fallThroughFloorDuration: 2500,
    // Stage 2: freefall through rabbithole.mp4 (ms) – slower pan
    rabbitholeFallDuration: 9000,
    rabbitholeFallStartY: -80,
    rabbitholeFallEndY: height + 60,
    // Landed on coca_bg (higher value = lower on screen)
    cocaLandedClerkY: height * 0.94,
    cocaWalkY: height * 0.94,
    cocaFloorYMin: height * 0.85,
    cocaFloorYMax: height + 10,
    // Pray: invisible zone at center of coca_bg
    prayZoneX: width / 2,
    prayZoneY: height / 2,
    prayZoneW: 100,
    prayZoneH: 80,
    prayMenuW: 80,
    prayMenuH: 24,
  }
}

