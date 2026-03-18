import { useState, useCallback, useRef, useEffect } from 'react'
import { motion } from 'framer-motion'
import { fadeIn } from '../variants'

// Fixed 320×180 game space – match Phaser exactly, scale to fit
const GAME_WIDTH = 320
const GAME_HEIGHT = 180
const CLERK_FRAME_WIDTH = 45
const CLERK_FRAME_HEIGHT = 66
const CLERK_SHEET_WIDTH = 180
const CLERK_WALK_END = 135
// ncrcamofficer_right.png is 177×100 single frame (no spritesheet)
const NCR_FRAME_WIDTH = 177
const NCR_FRAME_HEIGHT = 100
const WAYNES_SCROLL_FACTOR = 0.65
const CLERK_LEFT_BOUND = 10
const CLERK_RIGHT_BOUND = 310
const WALK_Y = Math.round(GAME_HEIGHT * 0.88)
const CAT_LEFT_BOUND = 30
const CAT_RIGHT_BOUND = 120
const CAT_Y = GAME_HEIGHT - 2
const CAT_FRAME_W = 45
const CAT_FRAME_H = 100
const CAT_SHEET_W = 180
const CAT_WALK_END = 135
// Phaser catSpeed 0.04 * delta(ms) ≈ 0.64 px/frame → ~38 px/sec
const CAT_SPEED = 38
const WALK_SPEED = 120

export default function WaynesPlace({
  movementFrozen,
  isTransformed,
  onReachRightEdge,
  onBibleClick,
}) {
  const [playerX, setPlayerX] = useState(GAME_WIDTH / 2)
  const [targetX, setTargetX] = useState(null)
  const [isMoving, setIsMoving] = useState(false)
  const [facingRight, setFacingRight] = useState(true)
  const [scale, setScale] = useState(1)
  const [showBlink, setShowBlink] = useState(false)
  const [showNcrSprite, setShowNcrSprite] = useState(false)
  const [catX, setCatX] = useState(CAT_LEFT_BOUND)
  const [catDirection, setCatDirection] = useState(1)
  const containerRef = useRef(null)
  const gameRef = useRef(null)
  const rafRef = useRef(null)
  const catRafRef = useRef(null)
  const lastTimeRef = useRef(0)
  const prevTransformedRef = useRef(false)
  const catDirectionRef = useRef(1)
  catDirectionRef.current = catDirection

  // Cat walks between bounds (like Phaser)
  useEffect(() => {
    let last = performance.now()
    const tick = (now) => {
      const dt = Math.min((now - last) / 1000, 1 / 30)
      last = now
      const dir = catDirectionRef.current
      setCatX((x) => {
        let next = x + CAT_SPEED * dt * dir
        if (next <= CAT_LEFT_BOUND) {
          catDirectionRef.current = 1
          setCatDirection(1)
          return CAT_LEFT_BOUND
        }
        if (next >= CAT_RIGHT_BOUND) {
          catDirectionRef.current = -1
          setCatDirection(-1)
          return CAT_RIGHT_BOUND
        }
        return next
      })
      catRafRef.current = requestAnimationFrame(tick)
    }
    catRafRef.current = requestAnimationFrame(tick)
    return () => {
      if (catRafRef.current) cancelAnimationFrame(catRafRef.current)
    }
  }, [])

  // When transformed: blink -> reveal ncrcamofficer -> auto-walk right
  useEffect(() => {
    if (isTransformed && !prevTransformedRef.current) {
      prevTransformedRef.current = true
      setShowBlink(true)
      const t1 = setTimeout(() => {
        setShowBlink(false)
        setShowNcrSprite(true)
        setTargetX(CLERK_RIGHT_BOUND - 5)
        setFacingRight(true)
      }, 220)
      return () => clearTimeout(t1)
    }
  }, [isTransformed])

  // Scale game canvas to fit container (match Phaser FIT mode)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const update = () => {
      const { width, height } = el.getBoundingClientRect()
      const s = Math.min(width / GAME_WIDTH, height / GAME_HEIGHT)
      setScale(s)
    }
    update()
    const ro = new ResizeObserver(update)
    ro.observe(el)
    return () => ro.disconnect()
  }, [])

  const handleScreenClick = useCallback(
    (e) => {
      if (movementFrozen) return
      const el = gameRef.current
      if (!el) return
      const rect = el.getBoundingClientRect()
      const clickX = ((e.clientX - rect.left) / rect.width) * GAME_WIDTH
      const clickY = ((e.clientY - rect.top) / rect.height) * GAME_HEIGHT

      // Click lower 60% of screen to walk (forgiving – Phaser uses narrow band)
      if (clickY >= GAME_HEIGHT * 0.4) {
        const clampedX = Math.max(CLERK_LEFT_BOUND, Math.min(CLERK_RIGHT_BOUND, clickX))
        setTargetX(clampedX)
        setFacingRight(clickX > playerX)
      }

      if (isTransformed && clickX > GAME_WIDTH * 0.9) {
        onReachRightEdge()
      }
    },
    [movementFrozen, isTransformed, playerX, onReachRightEdge]
  )

  useEffect(() => {
    if (targetX === null) {
      setIsMoving(false)
      return
    }

    const animate = (now) => {
      const dt = lastTimeRef.current ? (now - lastTimeRef.current) / 1000 : 0
      lastTimeRef.current = now

      setPlayerX((prev) => {
        const diff = targetX - prev
        const distance = Math.abs(diff)
        const step = Math.min(WALK_SPEED * dt, distance) * (diff >= 0 ? 1 : -1)
        const next = Math.max(CLERK_LEFT_BOUND, Math.min(CLERK_RIGHT_BOUND, prev + step))

        if (distance < 2) {
          setTargetX(null)
          setIsMoving(false)
          // If transformed and arrived at right edge, trigger transition
          if (isTransformed && next >= CLERK_RIGHT_BOUND - 10) {
            setTimeout(() => onReachRightEdge(), 100)
          }
          return targetX
        }
        setIsMoving(true)
        return next
      })

      rafRef.current = requestAnimationFrame(animate)
    }

    rafRef.current = requestAnimationFrame(animate)
    return () => {
      if (rafRef.current) cancelAnimationFrame(rafRef.current)
    }
  }, [targetX, isTransformed, onReachRightEdge])

  const bgOffsetX = (GAME_WIDTH / 2 - playerX) * WAYNES_SCROLL_FACTOR

  return (
    <motion.div
      ref={containerRef}
      className="absolute inset-0 flex items-center justify-center overflow-hidden cursor-pointer"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
      onClick={handleScreenClick}
    >
      {/* Fixed 320×180 game canvas – scaled to fit (matches Phaser) */}
      <div
        ref={gameRef}
        className="relative flex-shrink-0 overflow-hidden"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          transform: `scale(${scale})`,
          transformOrigin: 'center center',
        }}
      >
        {/* Blink overlay when transforming */}
        {showBlink && (
          <div
            className="absolute inset-0 z-40 pointer-events-none"
            style={{ backgroundColor: '#fff' }}
          />
        )}

        {/* Background – same as Phaser: scale to cover */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/waynes_bg.png)',
            backgroundSize: 'cover',
            backgroundPosition: `${50 + (bgOffsetX / GAME_WIDTH) * 85}% 50%`,
          }}
        />

        {/* Cat – pixel coords, walks between bounds, feet on floor (catY = height-2) */}
        <div
          className="absolute sprite-container overflow-hidden"
          style={{
            left: catX - CAT_FRAME_W / 2,
            bottom: 2,
            width: CAT_FRAME_W,
            height: CAT_FRAME_H,
            backgroundImage: catDirection === 1 ? 'url(/cat_right.png)' : 'url(/cat_left.png)',
            backgroundSize: `${CAT_SHEET_W}px ${CAT_FRAME_H}px`,
            animation: 'cat-walk 0.8s steps(4) infinite',
          }}
        />

        {/* Player – pixel coords */}
        <motion.div
          className="absolute sprite-container"
          style={{
            left: playerX,
            bottom: GAME_HEIGHT - WALK_Y,
            transform: 'translateX(-50%)',
            transformOrigin: 'center bottom',
            scaleX: facingRight ? 1 : -1,
          }}
        >
          {(isTransformed && showNcrSprite) ? (
            <div
              className="overflow-hidden"
              style={{
                width: NCR_FRAME_WIDTH,
                height: NCR_FRAME_HEIGHT,
                backgroundImage: 'url(/ncrcamofficer_right.png)',
                backgroundSize: `${NCR_FRAME_WIDTH}px ${NCR_FRAME_HEIGHT}px`,
                backgroundPosition: '0 0',
              }}
            />
          ) : (
            <div
              className="overflow-hidden"
              style={{
                width: CLERK_FRAME_WIDTH,
                height: CLERK_FRAME_HEIGHT,
                backgroundImage: 'url(/clerk_right.png)',
                backgroundSize: `${CLERK_SHEET_WIDTH}px ${CLERK_FRAME_HEIGHT}px`,
                backgroundPosition: isMoving ? undefined : '0 0',
                animation: isMoving ? 'clerk-walk 0.4s steps(4) infinite' : 'none',
              }}
            />
          )}
        </motion.div>

        {isTransformed && (
          <div
            className="absolute top-0 bottom-0 right-0 w-8 border-l-2 border-red-900/30 bg-red-950/10"
            aria-hidden
          />
        )}

        {onBibleClick && (
          <div
            className="absolute z-50 font-mono pixelated-ui inventory-panel"
            style={{
              top: 8,
              right: 8,
              width: 76,
              backgroundColor: 'rgba(10, 22, 40, 0.95)',
              border: '2px solid rgba(61, 90, 128, 0.9)',
            }}
          >
            <div
              className="px-2 py-1 border-b-2"
              style={{
                borderColor: 'rgba(61, 90, 128, 0.6)',
                color: '#8ecae6',
                fontSize: 10,
              }}
            >
              Inventory
            </div>
            <button
              type="button"
              onClick={(e) => {
                e.stopPropagation()
                onBibleClick()
              }}
              className="w-full flex items-center gap-2 px-2 py-2 text-left cursor-pointer hover:bg-black/30"
              style={{ color: '#d0d5ff', fontSize: 9 }}
            >
              <img
                src="/bible.png"
                alt=""
                width={24}
                height={32}
                className="flex-shrink-0"
                style={{
                  width: 24,
                  height: 32,
                  objectFit: 'none',
                  imageRendering: 'pixelated',
                  imageRendering: '-moz-crisp-edges',
                  imageRendering: 'crisp-edges',
                }}
              />
              <span>CoCA Bible</span>
            </button>
          </div>
        )}

        <style>{`
          @keyframes clerk-walk {
            0% { background-position: 0 0; }
            100% { background-position: -${CLERK_WALK_END}px 0; }
          }
          @keyframes cat-walk {
            0% { background-position: 0 0; }
            100% { background-position: -135px 0; }
          }
          .sprite-container {
            image-rendering: pixelated;
            image-rendering: -moz-crisp-edges;
            image-rendering: crisp-edges;
          }
        `}</style>
      </div>
    </motion.div>
  )
}
