/**
 * Framer Motion variants – corporate brutalist aesthetic
 */

export const fadeInOut = {
  hidden: { opacity: 0 },
  visible: { opacity: 1 },
  exit: { opacity: 0 },
}

export const fadeIn = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.4 },
  },
}

export const staggerChildren = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
}

export const modalOverlay = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.2 },
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.15 },
  },
}

export const modalPanel = {
  hidden: { opacity: 0, scale: 0.95 },
  visible: {
    opacity: 1,
    scale: 1,
    transition: { duration: 0.25, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    opacity: 0,
    scale: 0.95,
    transition: { duration: 0.15 },
  },
}

export const fallPlummet = {
  initial: { y: '-100%' },
  animate: {
    y: '100vh',
    transition: {
      duration: 8,
      repeat: Infinity,
      ease: 'linear',
    },
  },
}

export const silhouetteExpand = {
  initial: { scale: 1, width: '40px', height: '80px' },
  expanded: {
    scale: 1,
    width: '120px',
    height: '140px',
    transition: {
      duration: 1.2,
      ease: [0.23, 1, 0.32, 1],
    },
  },
}

export const screenFlash = {
  initial: { opacity: 0 },
  flash: {
    opacity: [0, 1, 0.8],
    transition: { duration: 0.3 },
  },
  exit: { opacity: 0 },
}

export const glitchText = {
  animate: {
    x: [0, -2, 2, 0],
    opacity: [1, 0.7, 1],
    transition: {
      duration: 0.15,
      repeat: Infinity,
      repeatType: 'reverse',
    },
  },
}

export const dialogueSlide = {
  hidden: { y: '100%', opacity: 0 },
  visible: {
    y: 0,
    opacity: 1,
    transition: { duration: 0.3, ease: [0.23, 1, 0.32, 1] },
  },
  exit: {
    y: '100%',
    opacity: 0,
    transition: { duration: 0.2 },
  },
}
