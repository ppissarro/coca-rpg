import { motion, AnimatePresence } from 'framer-motion'
import { modalOverlay, modalPanel } from '../variants'

export default function BibleMenuModal({ onChoice, onClose }) {
  return (
    <AnimatePresence>
      <>
        <motion.div
          className="fixed inset-0 bg-black/90 z-50 flex items-center justify-center"
          variants={modalOverlay}
          initial="hidden"
          animate="visible"
          exit="exit"
          onClick={onClose}
        >
          <motion.div
            className="p-6 font-mono pixelated-ui"
            variants={modalPanel}
            initial="hidden"
            animate="visible"
            exit="exit"
            onClick={(e) => e.stopPropagation()}
            style={{
              width: 'min(360px, 92vw)',
              minHeight: 180,
              backgroundColor: 'rgba(10, 22, 40, 0.98)',
              border: '2px solid rgba(61, 90, 128, 0.9)',
            }}
          >
            <p className="text-[#8ecae6] mb-6" style={{ fontSize: 18, wordWrap: 'break-word' }}>
              CoCA Bible
            </p>
            <button
              type="button"
              className="w-full py-4 text-left cursor-pointer hover:bg-black/30 transition-colors border border-transparent hover:border-[rgba(61,90,128,0.5)]"
              style={{ color: '#d0d5ff', fontSize: 16 }}
              onClick={() => onChoice('STUDY')}
            >
              [Study]
            </button>
            <button
              type="button"
              className="w-full py-4 mt-3 text-left cursor-pointer hover:bg-black/30 transition-colors border border-transparent hover:border-[rgba(255,96,96,0.5)]"
              style={{ color: '#ff6060', fontSize: 16 }}
              onClick={() => onChoice('READ')}
            >
              [Read]
            </button>
          </motion.div>
        </motion.div>
      </>
    </AnimatePresence>
  )
}
