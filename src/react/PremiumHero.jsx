import React, { useRef } from 'react';
import {
  motion,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform
} from 'framer-motion';
import { createRoot } from 'react-dom/client';

const storySteps = [
  {
    number: '01',
    label: 'The pull',
    title: 'Made by hand',
    copy: 'Each strand is stretched for a smooth, springy bite.'
  },
  {
    number: '02',
    label: 'The flavour',
    title: 'Chinese Muslim comfort',
    copy: 'Deep, familiar flavours prepared with halal ingredients.'
  },
  {
    number: '03',
    label: 'The place',
    title: 'Made around UTM',
    copy: 'A warm campus favourite served near KTF and Alumni.'
  },
  {
    number: '04',
    label: 'The moment',
    title: 'Best enjoyed hot',
    copy: 'Pulled, plated and ready for your next satisfying meal.'
  }
];

const flour = [
  [24, 30, 4], [31, 39, 3], [40, 26, 5], [57, 35, 3],
  [66, 25, 4], [73, 42, 3], [48, 18, 2], [82, 31, 4]
];

function DumplingSVG({ className, style }) {
  return (
    <svg className={className} style={style} viewBox="0 0 100 64" fill="none" xmlns="http://www.w3.org/2000/svg">
      <path
        d="M 12 44 Q 50 6 88 44 Q 78 58 50 58 Q 22 58 12 44 Z"
        fill="currentColor"
        opacity="0.18"
      />
      <path
        d="M 12 40 Q 50 2 88 40 Q 78 54 50 54 Q 22 54 12 40 Z"
        fill="#ffffff"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M 28 28 Q 33 22 38 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 44 23 Q 50 16 56 23"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
      <path
        d="M 62 28 Q 67 22 72 28"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  );
}

const dumplings = [
  { left: 10, top: 15, size: 68, rotate: -25, delay: 0, duration: 12 },
  { left: 78, top: 20, size: 84, rotate: 35, delay: 2, duration: 16 },
  { left: 45, top: 8, size: 55, rotate: 10, delay: 1, duration: 10 },
  { left: 85, top: 75, size: 76, rotate: -45, delay: 3, duration: 14 },
  { left: 5, top: 65, size: 80, rotate: 15, delay: 1.5, duration: 18 },
  { left: 32, top: 85, size: 60, rotate: 50, delay: 4, duration: 13 },
];

function PremiumHero() {
  const sectionRef = useRef(null);
  const reduceMotion = useReducedMotion();
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start start', 'end end']
  });
  const progress = useSpring(scrollYProgress, {
    stiffness: 72,
    damping: 24,
    mass: 0.32,
    restDelta: 0.001
  });

  const introOpacity = useTransform(progress, [0, 0.12, 0.2], [1, 1, 0]);
  const introY = useTransform(progress, [0, 0.2], [0, -36]);
  const pullAmount = useTransform(progress, [0.04, 0.92], [0, 1]);
  const noodleOpacity = useTransform(progress, [0.12, 0.16], [0, 1]);
  const dumplingOpacity = useTransform(progress, [0, 0.2], [0.4, 0.9]);
  const haloScale = useTransform(progress, [0, 1], [0.84, 1.12]);
  const finalOpacity = useTransform(progress, [0.88, 0.98], [0, 1]);
  const progressWidth = useTransform(progress, [0, 1], ['0%', '100%']);
  const noodlePaths = [
    useTransform(pullAmount, (value) => noodlePath(value, 338, 318, -20)),
    useTransform(pullAmount, (value) => noodlePath(value, 346, 336, -10)),
    useTransform(pullAmount, (value) => noodlePath(value, 354, 354, 0)),
    useTransform(pullAmount, (value) => noodlePath(value, 362, 372, 10)),
    useTransform(pullAmount, (value) => noodlePath(value, 370, 390, 20))
  ];
  const upperChopstick = useTransform(pullAmount, (value) => chopstickPath(value, -20, -58));
  const lowerChopstick = useTransform(pullAmount, (value) => chopstickPath(value, 20, -21));
  const gripPath = useTransform(pullAmount, (value) => {
    const y = noodleTopY(value);
    return `M334 ${y - 4} Q354 ${y + 12} 374 ${y + 4}`;
  });

  return (
    <section ref={sectionRef} className="pull-story" aria-labelledby="pull-story-title">
      <div className="pull-story-sticky">
        <div className="pull-story-grid" aria-hidden="true" />

        {/* Floating Dumplings Background */}
        <motion.div
          className="pull-story-dumplings"
          style={reduceMotion ? {} : { opacity: dumplingOpacity }}
          aria-hidden="true"
        >
          {dumplings.map((d, index) => (
            <motion.div
              key={index}
              className="pull-story-dumpling-item"
              style={{
                left: `${d.left}%`,
                top: `${d.top}%`,
                width: d.size,
                height: d.size * 0.64,
                color: 'rgba(176, 97, 67, 0.76)',
              }}
              animate={reduceMotion ? {} : {
                x: [0, index % 2 ? 25 : -25, 0],
                y: [0, index % 3 ? -30 : 30, 0],
                rotate: [d.rotate, d.rotate + 15, d.rotate - 15, d.rotate],
              }}
              transition={{
                duration: d.duration,
                delay: d.delay,
                repeat: Infinity,
                ease: 'easeInOut',
              }}
            >
              <DumplingSVG />
            </motion.div>
          ))}
        </motion.div>

        <motion.div className="pull-story-halo" style={{ scale: haloScale }} aria-hidden="true" />

        <motion.header
          className="pull-story-intro"
          style={reduceMotion ? {} : { opacity: introOpacity, y: introY }}
        >
          <div className="pull-story-eyebrow">
            <span>Hot Meal Bar</span>
            <i />
            <span>KTF &amp; Alumni UTM</span>
          </div>
          <h1 id="pull-story-title">
            Follow<br />
            <em>the pull.</em>
          </h1>
          <p>Scroll through the story behind our hand-pulled mee tarik.</p>
          <div className="pull-scroll-cue">
            <span />
            Scroll slowly
          </div>
        </motion.header>

        <div className="pull-art" aria-hidden="true">
          <motion.svg
            className="pull-food-scene"
            viewBox="0 0 700 760"
          >
            <defs>
              <linearGradient id="noodleGold" x1="0" y1="0" x2="1" y2="0">
                <stop offset="0%" stopColor="#b96143" />
                <stop offset="30%" stopColor="#e5ad76" />
                <stop offset="56%" stopColor="#f7dfb2" />
                <stop offset="100%" stopColor="#c97c5d" />
              </linearGradient>
              <filter id="noodleSoftGlow">
                <feGaussianBlur stdDeviation="1.8" result="blur" />
                <feMerge>
                  <feMergeNode in="blur" />
                  <feMergeNode in="SourceGraphic" />
                </feMerge>
              </filter>
              <linearGradient id="bowlCeramic" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0%" stopColor="#fefcf8" />
                <stop offset="45%" stopColor="#f0e8dc" />
                <stop offset="100%" stopColor="#d8c9b8" />
              </linearGradient>
              <radialGradient id="themedBroth" cx="50%" cy="38%" r="70%">
                <stop offset="0%" stopColor="#d69a72" />
                <stop offset="58%" stopColor="#a8543d" />
                <stop offset="100%" stopColor="#673226" />
              </radialGradient>
              <filter id="themedBowlShadow" x="-30%" y="-30%" width="160%" height="180%">
                <feDropShadow dx="0" dy="25" stdDeviation="17" floodColor="#0d131f" floodOpacity=".34" />
              </filter>
            </defs>

            <motion.g
              className="pull-bowl-svg"
              transformOrigin="350px 720px"
              filter="url(#themedBowlShadow)"
            >
              <ellipse cx="350" cy="714" rx="218" ry="22" fill="#0d131f" opacity=".18" />
              <ellipse cx="350" cy="568" rx="244" ry="76" fill="#1b263b" />
              <ellipse cx="350" cy="560" rx="225" ry="61" fill="url(#themedBroth)" />
              <path
                d="M106 568 C132 683 213 724 350 724 C487 724 568 683 594 568 C542 605 465 626 350 626 C235 626 158 605 106 568Z"
                fill="url(#bowlCeramic)"
              />
              <path d="M133 585 C192 613 262 626 350 626 C438 626 508 613 567 585" fill="none" stroke="#c97c5d" strokeWidth="8" opacity=".9" />
              <path d="M232 680 C288 699 412 699 468 680" fill="none" stroke="#415a77" strokeWidth="5" strokeLinecap="round" opacity=".72" />
              <path d="M190 552 C242 510 305 588 358 544 C409 502 469 583 518 542" fill="none" stroke="#f2d29b" strokeWidth="30" strokeLinecap="round" />
              <path d="M208 570 C263 527 320 584 373 560 C425 537 464 571 494 556" fill="none" stroke="#dfad72" strokeWidth="22" strokeLinecap="round" />
              <circle cx="229" cy="535" r="13" fill="#2a9d8f" />
              <circle cx="478" cy="534" r="11" fill="#2a9d8f" />
              <circle cx="435" cy="576" r="9" fill="#c97c5d" />
              <circle cx="278" cy="574" r="8" fill="#48b3a6" />
              <path d="M315 672 Q350 690 385 672" fill="none" stroke="#c97c5d" strokeWidth="4" strokeLinecap="round" />
              <circle cx="350" cy="670" r="5" fill="#c97c5d" />
            </motion.g>

            <motion.g
              className="pull-noodle-lines"
              style={reduceMotion ? {} : { opacity: noodleOpacity }}
              filter="url(#noodleSoftGlow)"
            >
              {noodlePaths.map((path, index) => (
                <motion.path key={index} d={path} />
              ))}
            </motion.g>

            <motion.g className="pull-chopstick-svg">
              <motion.path d={upperChopstick} />
              <motion.path d={lowerChopstick} />
              <motion.path className="pull-chopstick-grip" d={gripPath} />
            </motion.g>
          </motion.svg>

          <div className="pull-steam">
            {[0, 1, 2].map((item) => (
              <motion.i
                key={item}
                animate={reduceMotion ? {} : {
                  y: [10, -48],
                  x: [0, item === 1 ? 10 : -7],
                  opacity: [0, 0.45, 0],
                  scaleX: [0.7, 1.15]
                }}
                transition={{
                  duration: 3 + item * 0.35,
                  delay: item * 0.65,
                  repeat: Infinity,
                  ease: 'easeOut'
                }}
              />
            ))}
          </div>

          <div className="pull-flour">
            {flour.map(([left, top, size], index) => (
              <motion.i
                key={index}
                style={{ left: `${left}%`, top: `${top}%`, width: size, height: size }}
                animate={reduceMotion ? {} : {
                  x: [0, index % 2 ? 13 : -11],
                  y: [0, -22, -5],
                  opacity: [0, 0.65, 0]
                }}
                transition={{
                  duration: 2.8,
                  delay: index * 0.22,
                  repeat: Infinity
                }}
              />
            ))}
          </div>
        </div>

        <div className="pull-stories">
          {storySteps.map((step, index) => (
            <PullStoryCard key={step.number} step={step} index={index} progress={progress} />
          ))}
        </div>

        <motion.div className="pull-final" style={{ opacity: finalOpacity }}>
          <span>That is the pull.</span>
          <h2>Now taste it.</h2>
          <button type="button" onClick={() => window.app.switchView('catalog')}>
            Explore the menu
            <b aria-hidden="true">↗</b>
          </button>
        </motion.div>

        <div className="pull-progress" aria-hidden="true">
          <div><motion.i style={{ width: progressWidth }} /></div>
          <span>Scroll story</span>
        </div>
      </div>
    </section>
  );
}

function noodleTopY(value) {
  return 545 - (value * 415);
}

function noodlePath(value, topX, bottomX, bend) {
  const topY = noodleTopY(value);
  const bottomY = 552;
  const distance = bottomY - topY;
  const controlOneY = topY + distance * 0.34;
  const controlTwoY = topY + distance * 0.72;
  return `M${topX} ${topY} C${topX + bend} ${controlOneY} ${bottomX - bend} ${controlTwoY} ${bottomX} ${bottomY}`;
}

function chopstickPath(value, tipOffset, handleOffset) {
  const topY = noodleTopY(value);
  const tipX = 354 + tipOffset;
  const handleX = 692;
  return `M${tipX} ${topY + (tipOffset > 0 ? 4 : -4)} L${handleX} ${topY + handleOffset}`;
}

function PullStoryCard({ step, index, progress }) {
  const center = 0.29 + index * 0.18;
  const opacity = useTransform(
    progress,
    [center - 0.105, center - 0.035, center + 0.055, center + 0.125],
    [0, 1, 1, 0]
  );
  const y = useTransform(
    progress,
    [center - 0.105, center - 0.035, center + 0.125],
    [30, 0, -24]
  );

  return (
    <motion.article className={`pull-card pull-card-${index + 1}`} style={{ opacity, y }}>
      <span className="pull-card-number">{step.number}</span>
      <div>
        <small>{step.label}</small>
        <h2>{step.title}</h2>
        <p>{step.copy}</p>
      </div>
      <i aria-hidden="true" />
    </motion.article>
  );
}

const roots = new WeakMap();

export function mountPremiumHero(container) {
  let root = roots.get(container);
  if (!root) {
    root = createRoot(container);
    roots.set(container, root);
  }
  root.render(<PremiumHero />);
  window.unmountPremiumHero = () => {
    root.unmount();
    roots.delete(container);
    delete window.unmountPremiumHero;
  };
}
