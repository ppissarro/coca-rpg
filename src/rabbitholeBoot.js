/**
 * Loads first – exposes __showRabbitholeStandalone for standalone overlay (e.g. before Phaser/create).
 */
import { showRabbitholeOverlay } from './rabbitholeOverlay'
import { getLayout } from './game/config'

window.__showRabbitholeStandalone = () => {
  const canvas = document.querySelector('canvas')
  const phaserRoot = canvas?.closest('.phaser-root')
  const w = typeof window !== 'undefined' ? window.innerWidth : 960
  const h = typeof window !== 'undefined' ? window.innerHeight : 540
  const layout = getLayout(w, h)
  const scene = {
    rabbitholeVideoWrapper: null,
    showCocaLanded: () => window.__phaserScene?.showCocaLanded?.()
  }
  showRabbitholeOverlay({ canvas, layout, phaserRoot, scene })
}
