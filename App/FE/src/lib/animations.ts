// Framer Motion animation presets for consistent feel across the app

export const animationPresets = {
  // Container animations
  slideUpFadeIn: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, ease: 'easeOut' },
  },

  slideDownFadeOut: {
    initial: { opacity: 1, y: 0 },
    exit: { opacity: 0, y: -20 },
    transition: { duration: 0.3 },
  },

  scaleFadeIn: {
    initial: { opacity: 0, scale: 0.95 },
    animate: { opacity: 1, scale: 1 },
    transition: { duration: 0.4, ease: 'easeOut' },
  },

  // Button animations
  buttonHoverScale: {
    whileHover: { scale: 1.05 },
    whileTap: { scale: 0.95 },
  },

  // Modal animations
  modalScaleIn: {
    initial: { opacity: 0, scale: 0.95, y: 20 },
    animate: { opacity: 1, scale: 1, y: 0 },
    exit: { opacity: 0, scale: 0.95, y: 20 },
    transition: { type: 'spring', damping: 20 },
  },

  // List item stagger
  listContainerVariants: {
    animate: {
      transition: {
        staggerChildren: 0.05,
      },
    },
  },

  listItemVariants: {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    exit: { opacity: 0, x: 20 },
    transition: { duration: 0.4 },
  },

  // Pulsing animations
  pulseGlow: {
    animate: { boxShadow: ['0 0 0px rgba(79, 70, 229, 0)', '0 0 20px rgba(79, 70, 229, 0.3)', '0 0 0px rgba(79, 70, 229, 0)'] },
    transition: { repeat: Infinity, duration: 2 },
  },

  // Loading animations
  shimmer: {
    animate: { opacity: [0.6, 1, 0.6] },
    transition: { repeat: Infinity, duration: 2 },
  },

  // Floating animations
  floatUp: {
    animate: { y: [0, -10, 0] },
    transition: { repeat: Infinity, duration: 3, ease: 'easeInOut' },
  },
}

// Haptic feedback intensities
export const hapticPatterns = {
  light: 30,
  medium: 50,
  heavy: 80,
  doubleClick: [50, 100, 50],
  success: [50, 50, 50],
  error: [100, 50, 100],
}

// Helper function for haptic feedback
export function triggerHaptic(pattern: number | number[] = hapticPatterns.medium) {
  if (typeof window !== 'undefined' && 'vibrate' in navigator) {
    navigator.vibrate(pattern)
  }
}

// Easing functions
export const easings = {
  smooth: 'cubic-bezier(0.4, 0, 0.2, 1)',
  bouncy: 'cubic-bezier(0.34, 1.56, 0.64, 1)',
  sharp: 'cubic-bezier(0.4, 0, 0.6, 1)',
}

// Duration presets (in milliseconds)
export const durations = {
  instant: 0.15,
  fast: 0.3,
  normal: 0.5,
  slow: 0.8,
}
