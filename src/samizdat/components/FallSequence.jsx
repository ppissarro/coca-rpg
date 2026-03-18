import { useEffect } from 'react'
import { motion } from 'framer-motion'

const LEGAL_GLITCH = [
  'SECTION 7.2.1 – INSUBORDINATION PROTOCOL',
  'ARTICLE 12: TERMINATION OF CONTRACT',
  'LIABILITY WAIVER – ALL RIGHTS FORFEIT',
  'CLASSIFICATION: LEVEL 5 – PERMANENT DISSOLUTION',
]

export default function FallSequence({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onComplete?.()
    }, 6000)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <div className="fixed inset-0 bg-black z-[100] overflow-hidden">
      {/* Endless plummet silhouette */}
      <motion.div
        className="absolute left-1/2 -translate-x-1/2 w-10 h-20 bg-neutral-800"
        initial={{ y: '-20%' }}
        animate={{ y: '120%' }}
        transition={{
          duration: 4,
          repeat: Infinity,
          ease: 'linear',
        }}
      />

      {/* Glitching legal text */}
      <div className="absolute inset-0 pointer-events-none flex flex-wrap gap-4 p-8 overflow-hidden">
        {LEGAL_GLITCH.map((text, i) => (
          <motion.p
            key={i}
            className="font-mono text-xs text-red-900/80 uppercase tracking-widest select-none"
            animate={{
              x: [0, -3, 3, 0],
              opacity: [0.6, 1, 0.6],
            }}
            transition={{
              duration: 0.2 + i * 0.05,
              repeat: Infinity,
              repeatType: 'reverse',
            }}
            style={{
              position: 'absolute',
              left: `${15 + i * 20}%`,
              top: `${20 + (i % 3) * 25}%`,
            }}
          >
            {text}
          </motion.p>
        ))}
      </div>
      <div className="absolute bottom-8 left-0 right-0 text-center">
        <motion.p
          className="text-neutral-600 font-mono text-sm uppercase"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 1 }}
        >
          GAME OVER – DISSOLUTION
        </motion.p>
      </div>
    </div>
  )
}
