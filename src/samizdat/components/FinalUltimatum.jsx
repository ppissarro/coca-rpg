import { motion } from 'framer-motion'
import { modalPanel } from '../variants'

export default function FinalUltimatum({ onChoice }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="w-[min(400px,90vw)] border border-red-900/80 bg-neutral-950 p-8"
        variants={modalPanel}
        initial="hidden"
        animate="visible"
        exit="exit"
      >
        <p className="text-red-400/90 font-mono text-sm uppercase tracking-wider mb-6">
          Disposal protocol. Choose one.
        </p>
        <div className="flex flex-col gap-3">
          <button
            type="button"
            onClick={() => onChoice('READ_IT')}
            className="w-full py-4 border border-red-800 bg-red-950/50 text-red-300 font-mono text-sm uppercase tracking-wider hover:bg-red-900/30 transition-colors cursor-pointer"
          >
            [READ IT]
          </button>
          <button
            type="button"
            onClick={() => onChoice('THROW_IT')}
            className="w-full py-4 border border-neutral-600 bg-neutral-900/50 text-neutral-300 font-mono text-sm uppercase tracking-wider hover:bg-neutral-800 hover:border-amber-700 hover:text-amber-200 transition-colors cursor-pointer"
          >
            [THROW IT]
          </button>
        </div>
      </motion.div>
    </motion.div>
  )
}
