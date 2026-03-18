import { useCallback, useState, useEffect } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { GAME_STATE } from './gameState'
import { fadeIn } from './variants'
import WaynesPlace from './levels/WaynesPlace'
import ExecutiveSuite from './levels/ExecutiveSuite'
import BibleMenuModal from './components/BibleMenuModal'
import RabbitholeFall from './components/RabbitholeFall'
import CocaLevel from './components/CocaLevel'
import DialogueBox from './components/DialogueBox'
import FinalUltimatum from './components/FinalUltimatum'
import ShatterEffect from './components/ShatterEffect'

export default function SAMIZDATEngine({ debugLaunch, onDebugLaunched }) {
  const [gameState, setGameState] = useState(GAME_STATE.WAYNES_PLACE)
  const [isBibleMenuOpen, setIsBibleMenuOpen] = useState(false)
  const [movementFrozen, setMovementFrozen] = useState(false)
  const [isTransformed, setIsTransformed] = useState(false)
  const [dialoguePhase, setDialoguePhase] = useState(0)
  const [showShatter, setShowShatter] = useState(false)

  // Debug: jump to level when debugLaunch is set
  useEffect(() => {
    if (!debugLaunch) return
    setGameState(debugLaunch.gameState ?? GAME_STATE.WAYNES_PLACE)
    if (debugLaunch.isTransformed != null) setIsTransformed(debugLaunch.isTransformed)
    if (debugLaunch.dialoguePhase != null) setDialoguePhase(debugLaunch.dialoguePhase)
    if (debugLaunch.showShatter != null) setShowShatter(debugLaunch.showShatter)
    if (debugLaunch.movementFrozen != null) setMovementFrozen(debugLaunch.movementFrozen)
    setIsBibleMenuOpen(false)
    onDebugLaunched?.()
  }, [debugLaunch, onDebugLaunched])


  const handleBibleMenuChoice = useCallback((choice) => {
    setIsBibleMenuOpen(false)
    if (choice === 'READ') {
      setGameState(GAME_STATE.FALL_SEQUENCE)
    } else if (choice === 'STUDY') {
      setIsTransformed(true)
      setMovementFrozen(false)
      // In-place transform: stay in Wayne's with ncrcamofficer sprite
    }
  }, [])

  const handleFallComplete = useCallback(() => {
    setGameState(GAME_STATE.COCA)
  }, [])

  const handleReachRightEdge = useCallback(() => {
    if (!isTransformed || movementFrozen) return
    setMovementFrozen(true)
    setGameState(GAME_STATE.TRANSITION_TO_SUITE)
  }, [isTransformed, movementFrozen])

  const handleTransitionComplete = useCallback(() => {
    setGameState(GAME_STATE.EXECUTIVE_SUITE)
    setMovementFrozen(true)
    setDialoguePhase(0)
  }, [])

  const handleDialogueAdvance = useCallback(() => {
    setDialoguePhase((p) => p + 1)
  }, [])

  const handleDialogueComplete = useCallback(() => {
    setDialoguePhase(-1)
  }, [])

  const handleFinalChoice = useCallback((choice) => {
    if (choice === 'READ_IT') {
      setGameState(GAME_STATE.FALL_SEQUENCE)
    } else if (choice === 'THROW_IT') {
      setShowShatter(true)
      setGameState(GAME_STATE.SHATTER)
    }
  }, [])

  const handleShatterComplete = useCallback(() => {
    setShowShatter(false)
    setGameState(GAME_STATE.SUPREME_COURT_COMBAT)
  }, [])

  return (
    <div className="fixed inset-0 bg-[#050608] overflow-hidden font-mono flex items-center justify-center">
      <div className="relative flex-1 min-w-0 min-h-0 aspect-[320/180] max-w-full max-h-full">
      <AnimatePresence mode="wait">
        {(gameState === GAME_STATE.WAYNES_PLACE ||
          gameState === GAME_STATE.TRANSITION_TO_SUITE) && (
          <WaynesPlace
            key="waynes"
            movementFrozen={movementFrozen}
            isTransformed={isTransformed}
            onReachRightEdge={handleReachRightEdge}
            onBibleClick={() => {
              setMovementFrozen(true)
              setIsBibleMenuOpen(true)
            }}
          />
        )}

        {gameState === GAME_STATE.TRANSITION_TO_SUITE && (
          <motion.div
            key="transition"
            className="absolute inset-0 bg-black pointer-events-none"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.2 }}
            onAnimationComplete={handleTransitionComplete}
          />
        )}

        {gameState === GAME_STATE.EXECUTIVE_SUITE && (
          <ExecutiveSuite key="suite" />
        )}

        {gameState === GAME_STATE.FALL_SEQUENCE && (
          <RabbitholeFall key="fall" onComplete={handleFallComplete} />
        )}

        {gameState === GAME_STATE.COCA && (
          <CocaLevel key="coca" />
        )}

        {gameState === GAME_STATE.SUPREME_COURT_COMBAT && (
          <motion.div
            key="combat"
            className="absolute inset-0 bg-neutral-950 flex items-center justify-center"
            variants={fadeIn}
            initial="hidden"
            animate="visible"
          >
            <p className="text-red-900 text-lg font-bold">
              SUPREME COURT COMBAT
            </p>
            <p className="text-neutral-600 text-xs mt-2">
              (Battle engine placeholder)
            </p>
          </motion.div>
        )}
      </AnimatePresence>
      </div>

      {/* Bible menu modal */}
      <AnimatePresence>
        {isBibleMenuOpen && (
          <BibleMenuModal
            onChoice={handleBibleMenuChoice}
            onClose={() => {
              setIsBibleMenuOpen(false)
              if (gameState === GAME_STATE.WAYNES_PLACE && !isTransformed) {
                setMovementFrozen(false)
              }
            }}
          />
        )}
      </AnimatePresence>

      {/* Executive Suite dialogue */}
      {gameState === GAME_STATE.EXECUTIVE_SUITE && dialoguePhase >= 0 && (
        <DialogueBox
          phase={dialoguePhase}
          onAdvance={handleDialogueAdvance}
          onComplete={handleDialogueComplete}
        />
      )}

      {/* Final ultimatum – after dialogue */}
      {gameState === GAME_STATE.EXECUTIVE_SUITE && dialoguePhase === -1 && (
        <FinalUltimatum onChoice={handleFinalChoice} />
      )}

      {/* Shatter effect overlay */}
      <AnimatePresence>
        {showShatter && (
          <ShatterEffect onComplete={handleShatterComplete} />
        )}
      </AnimatePresence>
    </div>
  )
}
