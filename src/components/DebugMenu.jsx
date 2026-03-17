import { useState } from 'react'

const PHASER_LEVELS = [
  { key: 'waynesRoom', label: "Wayne's Place (clerk)" },
  { key: 'waynesRoomTransformed', label: "Wayne's Place (transformed)" },
  { key: 'executiveSuite', label: 'Executive Suite' },
  { key: 'supremeCourt', label: 'Supreme Court (level 4)' },
  { key: 'rabbithole', label: 'Fall Sequence' },
  { key: 'cocaLanded', label: 'CoCA (coca_bg)' },
]

export default function DebugMenu({ onDebugJump }) {
  const [open, setOpen] = useState(false)

  const handleLevel = (level) => {
    onDebugJump?.(level.key)
    setOpen(false)
  }

  return (
    <div
      className="fixed left-0 top-0 z-[9999] font-mono text-xs"
      style={{ fontSmooth: 'never', WebkitFontSmoothing: 'none' }}
    >
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="px-2 py-1 bg-black/80 text-amber-400 border border-amber-600/50 hover:bg-black rounded-br"
      >
        DEBUG
      </button>
      {open && (
        <div className="absolute left-0 top-8 mt-0.5 w-56 bg-black/95 text-neutral-300 border border-amber-600/40 rounded-br rounded-tr shadow-lg overflow-hidden">
          <div className="p-2 border-b border-amber-600/30 text-amber-400 text-[10px] uppercase tracking-wider">
            Jump to level (Phaser)
          </div>
          <div className="p-2 space-y-1 max-h-[70vh] overflow-y-auto">
            {PHASER_LEVELS.map((level) => (
              <button
                key={level.key}
                type="button"
                onClick={() => handleLevel(level)}
                className="block w-full px-2 py-1.5 text-left hover:bg-white/10 rounded"
              >
                {level.label}
              </button>
            ))}
          </div>
          <div className="p-1.5 border-t border-amber-600/20 text-[9px] text-neutral-600">
            Debug only – remove for prod
          </div>
        </div>
      )}
    </div>
  )
}
