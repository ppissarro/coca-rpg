import { motion } from 'framer-motion'

export default function TransformationSequence({ onComplete }) {
  return (
    <motion.div
      className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="bg-zinc-800 rounded-sm"
        initial={{ width: 40, height: 80 }}
        animate={{
          width: 120,
          height: 140,
        }}
        transition={{
          duration: 1.2,
          ease: [0.23, 1, 0.32, 1],
        }}
        onAnimationComplete={onComplete}
      />
      <motion.p
        className="absolute bottom-1/4 font-mono text-zinc-500 text-xs uppercase tracking-widest"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        ALPHA SOVEREIGN NCR-CAM OFFICER – ONLINE
      </motion.p>
    </motion.div>
  )
}
