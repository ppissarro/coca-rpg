import { useEffect, useRef } from 'react'
import { showRabbitholeOverlay } from '../../rabbitholeOverlay'
import { getLayout } from '../../game/config'

/**
 * Triggers the Vercel rabbithole fall sequence (video + freefall sprites).
 * Uses the same rabbithole overlay as Phaser.
 * onComplete = game over callback when the sequence ends.
 */
export default function RabbitholeFall({ onComplete }) {
  const startedRef = useRef(false)

  useEffect(() => {
    if (startedRef.current) return
    startedRef.current = true

    // Start freefall audio (same as Phaser)
    if (!window.__freefallAudio) {
      try {
        const a = new Audio('/freefall_loop.wav')
        a.loop = true
        a.volume = 0.8
        a.play().catch(() => {})
        window.__freefallAudio = a
      } catch (e) {}
    } else if (window.__freefallAudio.paused) {
      window.__freefallAudio.currentTime = 0
      window.__freefallAudio.play().catch(() => {})
    }

    const layout = getLayout(
      typeof window !== 'undefined' ? window.innerWidth : 320,
      typeof window !== 'undefined' ? window.innerHeight : 180
    )

    // Scene object: when overlay finishes, call onComplete (game over)
    const scene = {
      rabbitholeVideoWrapper: null,
      showCocaLanded: onComplete,
    }

    showRabbitholeOverlay({
      canvas: null,
      layout,
      phaserRoot: document.getElementById('root'),
      scene,
    })
  }, [onComplete])

  return null
}
