/**
 * Rabbithole overlay: (1) clerk falls over rabbithole.mp4 tunnel with freefall_loop,
 * (2) cut to coca_bg, he lands, freefall_loop stops, coca.mp3 plays.
 * Video and clerk are created INSIDE the overlay (same structure as _showRabbitholeOverlay_UNUSED).
 */
export function showRabbitholeOverlay({ canvas, layout, phaserRoot, scene }) {
  const overlay = document.getElementById('rabbithole-overlay')
  if (!overlay) {
    console.warn('[Rabbithole] Overlay element not found')
    return
  }
  overlay.innerHTML = ''
  const vw = typeof window !== 'undefined' ? window.innerWidth : 960
  const vh = typeof window !== 'undefined' ? window.innerHeight : 600
  // Fixed 16:9 content box – same aspect for video AND coca_bg, no change on transition
  overlay.style.cssText =
    'display:flex;align-items:center;justify-content:center;overflow:hidden;pointer-events:auto;background:#000;z-index:2147483646;position:fixed;inset:0'
  if (scene?.rabbitholeVideoWrapper !== undefined) {
    scene.rabbitholeVideoWrapper = overlay
  }

  // 16:9 content box – video and coca_bg both fill this, identical framing (no aspect change on transition)
  const contentBox = document.createElement('div')
  contentBox.style.cssText =
    'position:relative;flex:1;min-width:0;min-height:0;aspect-ratio:16/9;max-width:100%;max-height:100%;background:#000'
  overlay.appendChild(contentBox)

  // coca_bg – fills contentBox, same aspect as video phase
  const cocaBgDiv = document.createElement('div')
  cocaBgDiv.style.cssText =
    'position:absolute;inset:0;background:#000 url(/coca_bg.jpg) center/contain no-repeat;z-index:1;visibility:hidden'
  const cocaPreload = new Image()
  cocaPreload.onerror = () => {
    cocaBgDiv.style.background = '#000 url(/coca_bg.png) center/contain no-repeat'
  }
  cocaPreload.src = '/coca_bg.jpg'
  contentBox.appendChild(cocaBgDiv)

  // rabbithole video – fills contentBox, inner scroller for pan
  const videoWrap = document.createElement('div')
  videoWrap.style.cssText =
    'position:absolute;inset:0;overflow:hidden;z-index:2;background:#000;visibility:visible'
  const videoScroll = document.createElement('div')
  videoScroll.style.cssText =
    'position:absolute;top:0;left:0;width:100%;height:300%;overflow:hidden;will-change:transform'
  const video = document.createElement('video')
  video.src = '/rabbithole.mp4'
  video.playsInline = true
  video.muted = true
  video.loop = false
  video.preload = 'auto'
  video.style.cssText = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain'
  videoScroll.appendChild(video)
  videoWrap.appendChild(videoScroll)
  contentBox.appendChild(videoWrap)
  video.onerror = () => { video.src = '/rabbithole.mov'; video.load() }
  video.play().catch(() => {})

  // Clerk – freefall sprites during fall, clerk_right when landed
  const w = 28
  const h = Math.round((112 / 200) * w)
  const clerkWrap = document.createElement('div')
  const clerkW = Math.max(100, Math.round(vw * 0.28))
  const clerkH = Math.round(clerkW * (112 / 200))
  clerkWrap.style.cssText =
    `position:absolute;left:50%;top:0;width:${clerkW}px;height:${clerkH}px;z-index:20;pointer-events:none;transform-origin:50% 50%;will-change:transform`
  const imgStyle = 'position:absolute;inset:0;width:100%;height:100%;object-fit:contain'
  const freefallLeft = document.createElement('img')
  freefallLeft.src = '/freefall_left.png'
  freefallLeft.style.cssText = imgStyle
  const freefallRight = document.createElement('img')
  freefallRight.src = '/freefall_right.png'
  freefallRight.style.cssText = imgStyle + ';display:none'
  // clerk_right.png is 4-cell spritesheet (180×66) – show first cell only
  const clerkLanded = document.createElement('div')
  clerkLanded.style.cssText =
    'position:absolute;inset:0;display:none;background:url(/clerk_right.png) 0 0/400% 100% no-repeat'
  clerkWrap.appendChild(freefallLeft)
  clerkWrap.appendChild(freefallRight)
  clerkWrap.appendChild(clerkLanded)
  contentBox.appendChild(clerkWrap)

  // Fall duration = rabbithole.mp4 length; fallback if metadata not loaded
  const fallbackDurationMs = layout?.rabbitholeFallDuration ?? 9000
  // ContentBox dimensions (16:9) – updated by ResizeObserver so clerk is sized to frame
  let cbHeight = vh
  let cbWidth = vw
  const ro = new ResizeObserver(() => {
    const r = contentBox.getBoundingClientRect()
    cbHeight = r.height
    cbWidth = r.width
  })
  ro.observe(contentBox)
  const startY = -100
  const startMs = performance.now()
  let phase = 'video'
  let phaseStartMs = startMs
  let transitionedToCoca = false
  let tickActive = true

  let finished = false
  function finishOverlay() {
    if (finished) return
    finished = true
    ro.disconnect()
    if (safetyTimer) clearInterval(safetyTimer)
    overlay.style.display = 'none'
    overlay.innerHTML = ''
    if (canvas) canvas.style.visibility = ''
    if (phaserRoot) phaserRoot.style.visibility = ''
    if (scene) {
      scene.rabbitholeVideoWrapper = null
      scene.showCocaLanded?.()
    }
  }

  // Safety: force advance if stuck (video fails to load). Runs every 500ms.
  const forceAdvanceMs = fallbackDurationMs + 2000
  const forceFinishMs = fallbackDurationMs + 5000
  const safetyTimer = setInterval(() => {
    if (overlay.style.display === 'none') {
      clearInterval(safetyTimer)
      return
    }
    const sinceStart = performance.now() - startMs
    const sincePhase = performance.now() - phaseStartMs
    if (phase === 'video' && sinceStart > forceAdvanceMs) {
      phase = 'coca'
      phaseStartMs = performance.now()
      videoWrap.style.visibility = 'hidden'
      cocaBgDiv.style.visibility = 'visible'
      if (window.__freefallAudio) {
        try { window.__freefallAudio.pause(); window.__freefallAudio.currentTime = 0 } catch (e) {}
        window.__freefallAudio = null
      }
      try {
        const coca = window.__cocaAudio || new Audio('/coca.mp3')
        coca.volume = 0.9; coca.currentTime = 0; coca.play().catch(() => {})
      } catch (e) {}
    } else if (phase === 'coca' && sincePhase > 3500) {
      clearInterval(safetyTimer)
      finishOverlay()
    } else if (sinceStart > forceFinishMs) {
      clearInterval(safetyTimer)
      finishOverlay()
    }
  }, 500)

  function tick() {
    if (!tickActive || !overlay.isConnected) return
    const now = performance.now()
    const phaseElapsed = now - phaseStartMs
    const durationSec = (video.duration && !isNaN(video.duration)) ? video.duration : fallbackDurationMs / 1000
    const elapsedSec = phase === 'video' ? (video.currentTime || 0) : 0
    const endY = cbHeight + 80
    // Match Phaser cocaLandedClerkY; clerk uses bottom origin so feet go here
    const floorY = cbHeight * 0.94

    if (phase === 'video') {
      const p = Math.min(1, elapsedSec / durationSec)
      const y = startY + (endY - startY) * p
      const tilt = -75 * p
      clerkWrap.style.top = y + 'px'
      clerkWrap.style.transform = `translate(-50%, -50%) rotate(${tilt}deg)`
      const showL = Math.floor((elapsedSec * 1000) / 250) % 2 === 0
      freefallLeft.style.display = showL ? 'block' : 'none'
      freefallRight.style.display = showL ? 'none' : 'block'
      videoScroll.style.transform = `translateY(${-p * 66.67}%)`

      if ((p >= 1 || video.ended) && !transitionedToCoca) {
        transitionedToCoca = true
        video.pause()
        phase = 'coca'
        phaseStartMs = now
        // videoWrap is viewport-sized (100%) – no layout shock. Just swap visibility.
        videoWrap.style.visibility = 'hidden'
        cocaBgDiv.style.visibility = 'visible'
        if (window.__freefallAudio) {
          try {
            window.__freefallAudio.pause()
            window.__freefallAudio.currentTime = 0
          } catch (e) {}
          window.__freefallAudio = null
        }
        try {
          const coca = window.__cocaAudio || new Audio('/coca.mp3')
          coca.volume = 0.9
          coca.currentTime = 0
          coca.play().catch(() => {})
        } catch (e) {}
      }
    } else {
      // Coca phase: fall in (freefall sprites) then INSTANTLY switch to clerk_right at correct size when he lands
      const fallInDur = 1200
      const p = Math.min(1, phaseElapsed / fallInDur)
      const fallStartY = -80
      const landW = Math.round(cbWidth * (45 / 320))
      const landH = Math.round(landW * (66 / 45))
      const landY = floorY - landH
      const y = fallStartY + (landY - fallStartY) * p
      const tilt = -75 + 75 * p
      clerkWrap.style.width = landW + 'px'
      clerkWrap.style.height = landH + 'px'
      clerkWrap.style.top = y + 'px'
      clerkWrap.style.transform = `translate(-50%, 0) rotate(${tilt}deg)`
      if (p < 1) {
        const showL = Math.floor(phaseElapsed / 250) % 2 === 0
        freefallLeft.style.display = showL ? 'block' : 'none'
        freefallRight.style.display = showL ? 'none' : 'block'
        clerkLanded.style.display = 'none'
      } else {
        // Landed: Phaser clerk uses origin (0.5,1) = feet at Y; overlay top = floorY - landH so feet at floorY
        freefallLeft.style.display = 'none'
        freefallRight.style.display = 'none'
        clerkLanded.style.display = 'block'
        clerkWrap.style.top = landY + 'px'
        clerkWrap.style.transform = 'translate(-50%, 0) rotate(0deg)'
        const holdMs = 1500
        if (phaseElapsed - fallInDur >= holdMs) {
          tickActive = false
          finishOverlay()
          return
        }
      }
    }
    if (tickActive) requestAnimationFrame(tick)
  }
  clerkWrap.style.top = startY + 'px'
  clerkWrap.style.transform = 'translate(-50%, -50%) rotate(0deg)'
  requestAnimationFrame(tick)
}
