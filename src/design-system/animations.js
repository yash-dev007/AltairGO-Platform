/**
 * AltairGO Shared Framer Motion Variants
 * Import these to keep animation behaviour consistent across pages.
 */

/** Fade in from below — use on page sections and cards */
export const fadeUp = {
  hidden:  { opacity: 0, y: 24 },
  visible: { opacity: 1, y: 0,  transition: { duration: 0.45, ease: [0.16, 1, 0.3, 1] } },
};

/** Stagger container — wrap a list of fadeUp children */
export const staggerContainer = {
  hidden:  {},
  visible: { transition: { staggerChildren: 0.08, delayChildren: 0.1 } },
};

/** Fade in only — for overlays, modals */
export const fadeIn = {
  hidden:  { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.25, ease: 'easeOut' } },
};

/** Slide in from right — for side panels / drawers */
export const slideInRight = {
  hidden:  { opacity: 0, x: 48 },
  visible: { opacity: 1, x: 0,  transition: { duration: 0.35, ease: [0.16, 1, 0.3, 1] } },
};

/** Scale in — for modals and popovers */
export const scaleIn = {
  hidden:  { opacity: 0, scale: 0.92 },
  visible: { opacity: 1, scale: 1,    transition: { duration: 0.3,  ease: [0.34, 1.56, 0.64, 1] } },
};

/** Card hover — apply as `whileHover` */
export const cardHover = {
  y: -4,
  boxShadow: '0 12px 32px rgb(0 0 0 / 0.10)',
  transition: { duration: 0.2, ease: 'easeOut' },
};

/** Button press — apply as `whileTap` */
export const buttonTap = { scale: 0.97 };

/** Shared viewport options for scroll-triggered animations */
export const viewportOnce = { once: true, margin: '-60px' };
