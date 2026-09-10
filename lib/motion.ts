/**
 * Motion Design System & Tokens
 * Dr. Mauricio Benjamín Galindo López - Medical Brand
 * 
 * Philosophy: Movement that conveys clinical prestige, clarity, serenity,
 * and editorial elegance. Measured displacement, custom cubic-bezier curves,
 * strict layout preservation and zero residual transform jank.
 */

export const motionTokens = {
  duration: {
    instant: 0.15,
    micro: 0.25,
    fast: 0.35,
    normal: 0.70, // 700ms standard reveal
    medium: 0.80, // 800ms
    slow: 0.95,   // 950ms
    editorial: 1.05, // 1,050ms for photos & masks
    curtain: 1.10, // 1,100ms
  },
  easing: {
    // Custom luxury cubic bezier: fluid entry, soft deceleration
    premium: [0.22, 1, 0.36, 1] as const,
    // Photographic and mask reveal curve: ultra-smooth editorial unveiling
    editorial: [0.16, 1, 0.3, 1] as const,
    // Subtle microinteractions
    micro: [0.22, 1, 0.36, 1] as const,
    // Soft gentle fade
    soft: [0.25, 0.1, 0.25, 1] as const,
  },
  easingCSS: {
    premium: 'cubic-bezier(0.22, 1, 0.36, 1)',
    editorial: 'cubic-bezier(0.16, 1, 0.3, 1)',
    micro: 'cubic-bezier(0.22, 1, 0.36, 1)',
    soft: 'cubic-bezier(0.25, 0.1, 0.25, 1)',
  },
  distances: {
    micro: 4,
    small: 8,
    regular: 18,
    medium: 28,
    desktop: {
      subtle: 20,
      regular: 36,
      medium: 48,
      large: 72,
    },
    mobile: {
      subtle: 12,
      regular: 18,
      medium: 24,
      large: 28,
    },
  },
  scale: {
    subtle: 0.985,
    photoInitial: 1.025,
    curtainInitial: 1.035,
    iconHover: 1.04,
  },
  stagger: {
    tight: 0.06,  // 60ms
    standard: 0.08, // 80ms
    relaxed: 0.10,  // 100ms
    generous: 0.12, // 120ms
  },
} as const;

export type MotionTokens = typeof motionTokens;

