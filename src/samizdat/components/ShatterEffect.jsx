import { useEffect } from 'react'
import { motion } from 'framer-motion'

export default function ShatterEffect({ onComplete }) {
  useEffect(() => {
    const t = setTimeout(() => {
      onComplete?.()
    }, 2200)
    return () => clearTimeout(t)
  }, [onComplete])

  return (
    <>
      <motion.div
        className="fixed inset-0 bg-red-950 z-[100]"
        initial={{ opacity: 0 }}
        animate={{ opacity: [0, 1, 0.9] }}
        transition={{ duration: 0.2 }}
      />
      <motion.div
        className="fixed inset-0 flex items-center justify-center z-[101]"
        initial={{ opacity: 0 }}
        animate={{
          opacity: [0, 1, 1],
          scale: [0.8, 1.2, 1.1],
        }}
        transition={{ duration: 0.4 }}
      >
        <div className="font-mono text-2xl text-red-400 uppercase tracking-[0.3em] alarm-flash">
          LAW SUIT
        </div>
      </motion.div>
      <style>{`
        @keyframes alarm-blink {
          0%, 100% { opacity: 1; }
          50% { opacity: 0.3; }
        }
        .alarm-flash {
          animation: alarm-blink 0.5s ease-in-out infinite;
        }
      `}</style>
    </>
  )
}
