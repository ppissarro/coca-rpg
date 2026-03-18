/**
 * CoCA level – coca_bg landing scene (after rabbithole fall).
 * Shows the clerk stood on coca_bg with "CoCA" branding.
 */
import { motion } from 'framer-motion'
import { fadeIn } from '../variants'

const GAME_WIDTH = 320
const GAME_HEIGHT = 180
const CLERK_FRAME_W = 45
const CLERK_FRAME_H = 66

export default function CocaLevel() {
  return (
    <motion.div
      className="absolute inset-0 flex items-center justify-center bg-black"
      variants={fadeIn}
      initial="hidden"
      animate="visible"
    >
      <div
        className="relative overflow-hidden"
        style={{
          width: GAME_WIDTH,
          height: GAME_HEIGHT,
          maxWidth: '100%',
          maxHeight: '100%',
        }}
      >
        {/* coca_bg – same as rabbithole overlay phase 2 */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat"
          style={{
            backgroundImage: 'url(/coca_bg.jpg)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          }}
        />
        {/* Fallback if jpg fails */}
        <div
          className="absolute inset-0 bg-center bg-no-repeat -z-10"
          style={{
            backgroundImage: 'url(/coca_bg.png)',
            backgroundSize: 'contain',
            backgroundPosition: 'center',
          }}
        />
        {/* Clerk landed – bottom center, feet on floor */}
        <div
          className="absolute sprite-container"
          style={{
            left: GAME_WIDTH / 2,
            bottom: GAME_HEIGHT * 0.06,
            width: CLERK_FRAME_W,
            height: CLERK_FRAME_H,
            transform: 'translateX(-50%)',
            transformOrigin: 'center bottom',
            backgroundImage: 'url(/clerk_right.png)',
            backgroundSize: '180px 66px',
            backgroundPosition: '0 0',
            imageRendering: 'pixelated',
            imageRendering: '-moz-crisp-edges',
            imageRendering: 'crisp-edges',
          }}
        />
        {/* CoCA title */}
        <div
          className="absolute left-0 right-0 top-4 text-center font-mono font-bold tracking-[0.4em]"
          style={{ color: 'rgba(255,255,255,0.9)', fontSize: 18 }}
        >
          CoCA
        </div>
      </div>
    </motion.div>
  )
}
