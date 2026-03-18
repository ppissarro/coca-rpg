import { motion } from 'framer-motion'
import { dialogueSlide } from '../variants'

const EXECUTIVE_LINES = [
  'Your conduct has been flagged. Repeated deviation from protocol.',
  'The Corporation does not tolerate insubordination.',
  'You were entrusted with a responsibility. You have failed.',
  'Dispose of the asset. Immediately.',
]

export default function DialogueBox({ phase, onAdvance, onComplete }) {
  const line = EXECUTIVE_LINES[phase] ?? ''
  const isLast = phase >= EXECUTIVE_LINES.length - 1

  const handleClick = () => {
    if (isLast) onComplete()
    else onAdvance()
  }

  return (
    <motion.div
      className="fixed bottom-0 left-0 right-0 bg-neutral-950 border-t border-neutral-600 p-6 z-50"
      variants={dialogueSlide}
      initial="hidden"
      animate="visible"
      exit="exit"
    >
      <p className="text-neutral-400 font-mono text-sm mb-4">{line}</p>
      <button
        type="button"
        onClick={handleClick}
        className="text-neutral-500 font-mono text-xs uppercase tracking-wider hover:text-neutral-400 transition-colors cursor-pointer"
      >
        {isLast ? '[CONTINUE]' : '[...]'}
      </button>
    </motion.div>
  )
}
