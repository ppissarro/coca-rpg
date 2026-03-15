import { useEffect, useState } from 'react'
import './App.css'

function App() {
  // phases: intro = walk + pick up, search = swat enters, logo = fade to logo
  const [phase, setPhase] = useState('intro')
  const [target, setTarget] = useState({ x: 120, y: 360 }) // starting position
  const [hasCocaBible, setHasCocaBible] = useState(false)
  const [showCocaBibleDialogue, setShowCocaBibleDialogue] = useState(false)
  const [showSwat, setShowSwat] = useState(false)
  const [fadeToLogo, setFadeToLogo] = useState(false)

  // On mount, automatically walk the clerk toward the Bible.
  useEffect(() => {
    if (phase !== 'intro') return
    // fixed coordinates roughly where the desk/Bible are
    const bibleTarget = { x: 140, y: 260 }
    const timer = setTimeout(() => {
      setTarget(bibleTarget)
      // simulate auto-pickup after walking
      setTimeout(() => {
        if (!hasCocaBible) {
          handleCocaBiblePicked()
        }
      }, 800)
    }, 600)
    return () => clearTimeout(timer)
  }, [phase, hasCocaBible])

  const handleCocaBiblePicked = () => {
    setHasCocaBible(true)
    setShowCocaBibleDialogue(true)
    // After a beat, trigger SWAT search
    setTimeout(() => {
      setShowCocaBibleDialogue(false)
      setShowSwat(true)
      setPhase('search')
      // After they "search", fade to logo
      setTimeout(() => {
        setFadeToLogo(true)
        setTimeout(() => {
          setPhase('logo')
        }, 1200)
      }, 1600)
    }, 1400)
  }

  // No click movement for this opening cinematic
  const handleFloorClick = () => {}

  if (phase === 'logo') {
    return (
      <div className="logo-screen">
        <div className="logo-mark">CoCA</div>
      </div>
    )
  }

  return (
    <div className={`app-root ${fadeToLogo ? 'fade-out' : ''}`}>
      {/* Environment */}
      <div className="lobby-outer">
        <div className="lobby-inner" onClick={handleFloorClick}>
          {/* Brutalist walls */}
          <div className="lobby-walls">
            <div className="lobby-wall-panel panel-light" />
            <div className="lobby-wall-panel panel-mid" />
            <div className="lobby-wall-panel panel-dark" />
          </div>

          {/* Pillar blocks for 2.5D depth */}
          <div className="pillar pillar-left" />
          <div className="pillar pillar-right" />

          {/* CoCA Bible on a desk in a clerk's office */}
          {!hasCocaBible && (
            <button
              type="button"
              onClick={handleCocaBiblePicked}
              className="object-button object-bible"
            >
              {/* Desk */}
              <div className="desk">
                {/* CoCA Bible */}
                <div className="bible">
                  <span className="bible-logo">
                    CoCA
                  </span>
                </div>
              </div>
              <span className="object-label">
                CoCA Bible
              </span>
            </button>
          )}

          {/* Floor (click target) */}
          <div className="floor-grid">
            {Array.from({ length: 18 }).map((_, i) => (
              <div key={i} className="floor-tile" />
            ))}
          </div>

          {/* Player (flat sprite in 2.5D space) */}
          <div
            className="player"
            style={{
              transform: `translate(${target.x - 20}px, ${target.y - 40}px)`,
            }}
          >
            <div className="player-head" />
          </div>

          {/* Dialogue box for the soda can */}
          {/* Dialogue box for the CoCA Bible */}
          {showCocaBibleDialogue && (
            <div className="dialogue-box">
              <div className="dialogue-header">
                <span className="dialogue-tag">
                  Discovery
                </span>
                <button
                  type="button"
                  onClick={() => setShowCocaBibleDialogue(false)}
                  className="dialogue-dismiss"
                >
                  Dismiss
                </button>
              </div>
              <p>
                The internal scripture of the Syrup Syndicate. Every brand commandment, bound in black with a red CoCA sigil.
              </p>
            </div>
          )}

          {/* SWAT / military silhouettes bursting in and searching */}
          {showSwat && (
            <div className="swat-layer">
              <div className="swat-unit swat-left" />
              <div className="swat-unit swat-center" />
              <div className="swat-unit swat-right" />
            </div>
          )}
        </div>
      </div>

      {/* No UI bar during the opening cinematic */}
    </div>
  )
}

export default App
