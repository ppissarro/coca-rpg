import { motion } from 'framer-motion'
import { fadeIn } from '../variants'

export default function ExecutiveSuite() {
  return (
    <motion.div
      className="absolute inset-0 overflow-hidden"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      {/* HQ map background */}
      <div
        className="absolute inset-0 bg-center bg-no-repeat bg-cover"
        style={{
          backgroundImage: 'url(/hq.png)',
          imageRendering: 'pixelated',
          imageRendering: '-moz-crisp-edges',
          imageRendering: 'crisp-edges',
        }}
      />
      {/* Floor-to-ceiling windows + gray skyline (fallback if hq fails) */}
      <div className="absolute inset-0 bg-gradient-to-b from-neutral-700 via-neutral-600 to-neutral-800 opacity-30" />
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-transparent via-transparent to-black/60" />

      {/* Window grid */}
      <div className="absolute inset-0 grid grid-cols-6 gap-px bg-neutral-900/20">
        {Array.from({ length: 24 }).map((_, i) => (
          <div
            key={i}
            className="bg-neutral-800/40 border border-neutral-600/50"
          />
        ))}
      </div>

      {/* Gray skyline silhouette */}
      <div className="absolute bottom-0 left-0 right-0 h-1/3 bg-gradient-to-t from-black via-neutral-900 to-transparent" />
      <div className="absolute bottom-0 left-0 right-0 h-48 opacity-30">
        <svg viewBox="0 0 400 100" className="w-full h-full fill-neutral-800">
          <rect x="0" y="60" width="30" height="40" />
          <rect x="40" y="40" width="25" height="60" />
          <rect x="80" y="55" width="35" height="45" />
          <rect x="130" y="30" width="40" height="70" />
          <rect x="180" y="45" width="30" height="55" />
          <rect x="220" y="50" width="50" height="50" />
          <rect x="280" y="35" width="35" height="65" />
          <rect x="325" y="55" width="40" height="45" />
          <rect x="375" y="60" width="25" height="40" />
        </svg>
      </div>

      {/* Blood-red corporate monolith in distance */}
      <motion.div
        className="absolute right-1/4 top-1/2 -translate-y-1/2 w-32 h-64"
        initial={{ opacity: 0.3 }}
        animate={{
          opacity: [0.3, 0.7, 0.3],
          filter: ['brightness(0.8)', 'brightness(1.2)', 'brightness(0.8)'],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
      >
        <div className="w-full h-full bg-red-900 shadow-[0_0_60px_rgba(127,29,29,0.8)] border-2 border-red-950" />
        <div className="absolute inset-0 bg-gradient-to-b from-red-800/50 to-transparent" />
      </motion.div>

      {/* Oppressive overlay */}
      <div className="absolute inset-0 bg-black/20 pointer-events-none" />
    </motion.div>
  )
}
