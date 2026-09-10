import React, {
  useId,
  type CSSProperties,
} from 'react';
import styles from './MbglLogo.module.css';

export interface MbglLogoProps {
  /** Tamaño CSS: 104, "104px", "100%", etc. */
  size?: number | string;
  /** Duración de la transición en milisegundos (conservado por compatibilidad). */
  duration?: number;
  /** Clase adicional proporcionada por el contenedor o header. */
  className?: string;
  /** ID opcional del contenedor. */
  id?: string;
  /** Conservado por compatibilidad; inactivo para mantener estabilidad. */
  autoLoop?: boolean;
  /**
   * true cuando el componente se encuentra dentro de un enlace.
   * En este modo el logo no crea un segundo control interactivo.
   */
  embeddedInLink?: boolean;
}

export const MbglLogo: React.FC<MbglLogoProps> = ({
  size,
  className = '',
  id,
}) => {
  const generatedId = useId().replace(/:/g, '');

  const gradientId = `mbgl-gradient-${generatedId}`;
  const shadowId = `mbgl-shadow-${generatedId}`;

  const style: CSSProperties = size
    ? {
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
      }
    : {};

  return (
    <span
      id={id}
      className={[
        styles.container,
        'mbgl-logo-container',
        className,
      ]
        .filter(Boolean)
        .join(' ')}
      style={style}
    >
      <svg
        viewBox="0 0 1000 1000"
        width="100%"
        height="100%"
        preserveAspectRatio="xMidYMid meet"
        aria-hidden="true"
        focusable="false"
      >
        <defs>
          <linearGradient
            id={gradientId}
            x1="0%"
            y1="0%"
            x2="100%"
            y2="100%"
          >
            <stop offset="0%" stopColor="#E2A944" />
            <stop offset="50%" stopColor="#C68A27" />
            <stop offset="100%" stopColor="#A86C14" />
          </linearGradient>

          <filter
            id={shadowId}
            x="-10%"
            y="-10%"
            width="120%"
            height="120%"
          >
            <feDropShadow
              dx="0"
              dy="2"
              stdDeviation="3"
              floodColor="#C68A27"
              floodOpacity="0.25"
            />
          </filter>
        </defs>

        <g className="mbgl-rings-group">
          <circle
            cx="500"
            cy="500"
            r="445"
            fill="none"
            stroke="#C68A27"
            strokeWidth="11"
            strokeLinecap="round"
            className={`${styles.ringGold} mbgl-ring-gold`}
            transform="rotate(-90 500 500)"
          />

          <circle
            cx="500"
            cy="500"
            r="400"
            fill="none"
            stroke="#061A40"
            strokeWidth="18"
            strokeLinecap="round"
            className={`${styles.ringNavy} mbgl-ring-navy`}
            transform="rotate(-90 500 500)"
          />

          <circle
            cx="76"
            cy="500"
            r="18"
            fill="#C68A27"
            className={`${styles.dot} ${styles.dotLeft} mbgl-dot mbgl-dot-left`}
          />

          <circle
            cx="924"
            cy="500"
            r="18"
            fill="#C68A27"
            className={`${styles.dot} ${styles.dotRight} mbgl-dot mbgl-dot-right`}
          />
        </g>

        <g
          className="mbgl-letters-group"
          fill="#061A40"
          textAnchor="middle"
        >
          <g className={`${styles.letter} ${styles.letterM} mbgl-letter mbgl-letter-m`}>
            <text
              x="320"
              y="492"
              fontSize="275"
              className={`${styles.fontSerif} mbgl-font-serif`}
            >
              M
            </text>
          </g>

          <g className={`${styles.letter} ${styles.letterG} mbgl-letter mbgl-letter-g`}>
            <text
              x="325"
              y="760"
              fontSize="275"
              className={`${styles.fontSerif} mbgl-font-serif`}
            >
              G
            </text>
          </g>

          <g className={`${styles.letter} ${styles.letterB} mbgl-letter mbgl-letter-b`}>
            <text
              x="655"
              y="492"
              fontSize="275"
              className={`${styles.fontSerif} mbgl-font-serif`}
            >
              B
            </text>
          </g>

          <g className={`${styles.letter} ${styles.letterL} mbgl-letter mbgl-letter-l`}>
            <text
              x="640"
              y="760"
              fontSize="275"
              className={`${styles.fontSerif} mbgl-font-serif`}
            >
              L
            </text>
          </g>
        </g>

        <g
          filter={`url(#${shadowId})`}
          style={{ pointerEvents: 'none' }}
        >
          <circle
            cx="500"
            cy="216"
            r="26"
            fill={`url(#${gradientId})`}
          />

          <rect
            x="494"
            y="238"
            width="12"
            height="535"
            rx="6"
            fill={`url(#${gradientId})`}
          />

          <path
            fill={`url(#${gradientId})`}
            d="
              M 456 324
              C 442 314, 436 332, 448 340
              C 464 350, 482 336, 500 344
              C 524 354, 552 358, 552 380
              C 552 400, 528 410, 500 414
              C 474 418, 448 430, 448 452
              C 448 474, 474 482, 500 486
              C 526 490, 550 500, 550 524
              C 550 546, 526 556, 500 560
              C 474 566, 456 578, 456 602
              C 456 624, 480 632, 500 636
              C 524 640, 540 650, 540 670
              C 540 690, 520 698, 500 702
              C 482 706, 472 720, 472 734
              C 472 750, 492 760, 500 768
              C 501 769, 500 760, 496 752
              C 490 740, 484 730, 492 720
              C 502 710, 526 702, 526 678
              C 526 658, 510 650, 494 644
              C 476 638, 444 626, 444 598
              C 444 572, 468 558, 492 552
              C 514 546, 534 536, 534 518
              C 534 500, 514 490, 492 484
              C 468 478, 436 466, 436 438
              C 436 414, 460 400, 484 394
              C 516 388, 538 378, 538 364
              C 538 348, 516 334, 494 330
              C 476 326, 464 330, 456 324
              Z
            "
          />

          <ellipse
            cx="458"
            cy="326"
            rx="9"
            ry="6"
            transform="rotate(-15 458 326)"
            fill={`url(#${gradientId})`}
          />

          <circle
            cx="460"
            cy="324"
            r="1.5"
            fill="#061A40"
          />
        </g>
      </svg>
    </span>
  );
};
