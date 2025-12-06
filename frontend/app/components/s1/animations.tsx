import { Transition } from 'framer-motion';

// Fade-in with slight rotateX used for main paper card
export const fadeInRotateX = {
  initial: { opacity: 0, rotateX: 5 },
  animate: { opacity: 1, rotateX: 0 },
  transition: { duration: 1, ease: 'easeOut' } as Transition,
};

// Restore loader path transition
// Faster loader path transition for snappier progress feedback
export const restoreLoaderPathTransition: Transition = { duration: 0.35, ease: 'linear' };

// Backdrop animation for redacted block (looping subtle opacity)
export const redactedBackdropAnim = {
  initial: { opacity: 0.5 },
  animate: { opacity: [0.4, 0.7, 0.4] },
  transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' } as Transition,
};

// Dust particle transition generator (keeps randomness in component)
export const dustParticleTransition = (delay = 0) => ({
  duration: Math.random() * 20 + 10,
  repeat: Infinity,
  ease: 'linear',
  delay,
});

export default {};
