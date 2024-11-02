'use client';
import { outfit, kodeMono } from '@/fonts';
import {
  motion,
  useScroll,
  useTransform,
  useSpring,
  useMotionValue
} from 'framer-motion';
import {
  FaWaveSquare,
  FaBrain,
  FaChartLine,
  FaClock,
  FaCode,
  FaFingerprint,
  FaLayerGroup,
  FaNetworkWired,
  FaProjectDiagram,
  FaRegLightbulb,
  FaSyncAlt,
  FaRegChartBar
} from 'react-icons/fa';
import { useRef, useState, useEffect } from 'react';
import type { HTMLMotionProps } from 'framer-motion';
import { getAnimationSequence } from '../SectionBoxes2/sequences';
import { MotionDiv } from '../MotionDiv';
import { MotionButton } from '../MotionButtton';

const ALGORITHM_FEATURES = [
  {
    icon: FaWaveSquare,
    title: 'Universal Patterns',
    description:
      'From the spirals of galaxies to the rhythm of markets, nature reveals its secrets through self-repeating patterns. Rthmn captures this universal language.',
    details: [
      'Fractal market structure',
      'Natural wave formations',
      'Self-similar patterns'
    ]
  },
  {
    icon: FaBrain,
    title: 'The Hidden Order',
    description:
      'Beneath the apparent chaos of markets lies a perfect order. A dance of positions that reveals the true nature of price movement.',
    details: [
      'Pattern consciousness',
      'Structural harmony',
      'Natural flow states'
    ]
  },
  {
    icon: FaFingerprint,
    title: 'Market DNA',
    description:
      'Every market movement carries a signature - a unique pattern that repeats across all timeframes. Learn to read this signature.',
    details: [
      'Structural fingerprints',
      'Timeframe resonance',
      'Pattern inheritance'
    ]
  }
];

const PHILOSOPHICAL_INSIGHTS = [
  {
    title: 'The Fractal Nature of Reality',
    description:
      'Markets mirror the fundamental patterns of nature itself. The same structures that shape coastlines and galaxies shape our trading opportunities.',
    insight: 'What appears as complexity is often simplicity repeating itself.'
  },
  {
    title: 'The Map Is Not The Territory',
    description:
      'Traditional indicators attempt to map market reality, but Rthmn reveals the territory itself - the underlying structure that governs all movement.',
    insight: 'See beyond the surface to the pattern beneath.'
  },
  {
    title: 'The Flow State of Markets',
    description:
      'Markets breathe. They expand and contract in a natural rhythm. By aligning with this flow, we find clarity in chaos.',
    insight: 'Move with the pattern, not against it.'
  }
];

const PATTERN_PRINCIPLES = [
  {
    principle: 'Self-Similarity',
    description:
      'Like a Russian doll, each pattern contains smaller versions of itself. This fractal nature reveals the market`s true structure.',
    example: 'A single position movement reflects the whole.'
  },
  {
    principle: 'Natural Harmony',
    description:
      'Markets seek balance through an eternal dance of positions. Each movement is part of a larger choreography.',
    example: 'Eight positions, infinite possibilities.'
  },
  {
    principle: 'Deterministic Flow',
    description:
      'In the seeming randomness of price action lies a deterministic pattern. A natural sequence that governs all movement.',
    example: 'The pattern reveals the path.'
  }
];

interface FeatureCardProps {
  feature: {
    icon: any;
    title: string;
    description: string;
    details: string[];
  };
}

const FeatureCard: React.FC<FeatureCardProps> = ({ feature }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    transition={{ duration: 0.5 }}
    style={{
      position: 'relative',
      overflow: 'hidden',
      borderRadius: '0.75rem',
      border: '1px solid rgba(255,255,255,0.05)',
      background: 'rgba(0,0,0,0.3)',
      backdropFilter: 'blur(8px)',
      padding: '2rem'
    }}
  >
    <div className="absolute -right-20 -top-20 h-40 w-40 rounded-full bg-white/5 blur-3xl transition-all duration-500 group-hover:bg-white/10" />
    <feature.icon className="mb-6 h-8 w-8 text-white/60" />
    <h3
      className={`${outfit.className} mb-4 text-2xl font-semibold text-white/90`}
    >
      {feature.title}
    </h3>
    <p className="mb-6 text-sm leading-relaxed text-white/60">
      {feature.description}
    </p>
    <ul className="space-y-2">
      {feature.details.map((detail, index) => (
        <li key={index} className="flex items-center text-sm text-white/40">
          <div className="mr-2 h-1 w-1 rounded-full bg-white/40" />
          {detail}
        </li>
      ))}
    </ul>
  </MotionDiv>
);

const TechnicalSpec = ({ spec }) => (
  <div className="flex flex-col items-center">
    <div
      className={`${kodeMono.className} mb-2 text-3xl font-bold text-white/90`}
    >
      {spec.value}
    </div>
    <div
      className={`${kodeMono.className} mb-1 text-sm font-medium text-white/60`}
    >
      {spec.label}
    </div>
    <div className="text-center text-xs text-white/40">{spec.description}</div>
  </div>
);

const WaveformAnimation = () => (
  <div className="relative h-40 w-full overflow-hidden">
    <MotionDiv
      initial={{ x: '-100%' }}
      animate={{ x: '100%' }}
      transition={{
        duration: 3,
        repeat: Infinity,
        ease: 'linear'
      }}
      className="absolute top-1/2 h-[1px] w-full bg-gradient-to-r from-transparent via-white/60 to-transparent"
    />
    {/* Add more animated elements for complexity */}
  </div>
);

const WAVE_MECHANICS = [
  {
    phase: 'Initiation',
    description: 'Position 8 acts as the wave initiator, leading state changes',
    mechanics: [
      'Highest frequency oscillation',
      'Binary state transitions (1 ↔ -1)',
      'Independent state changes'
    ]
  },
  {
    phase: 'Propagation',
    description: 'Wave energy transfers through adjacent positions',
    mechanics: [
      'Decreasing frequency by position',
      'State-dependent transitions',
      'Neighbor state validation'
    ]
  },
  {
    phase: 'Completion',
    description: 'Wave cycle completes when energy dissipates',
    mechanics: [
      'Full position state reset',
      'Pattern completion verification',
      'New cycle initialization'
    ]
  }
];

const POSITION_DYNAMICS = [
  {
    position: 8,
    frequency: '1/1',
    role: 'Wave Initiator',
    constraints: 'None - Independent movement'
  },
  {
    position: 7,
    frequency: '1/2',
    role: 'Primary Follower',
    constraints: 'Depends on Position 8'
  },
  {
    position: 6,
    frequency: '1/4',
    role: 'Secondary Follower',
    constraints: 'Depends on Positions 7-8'
  }
  // ... continue with other positions
];

const WaveMechanicsCard = ({ mechanic, index }) => (
  <MotionDiv
    initial={{ opacity: 0, x: -20 }}
    whileInView={{ opacity: 1, x: 0 }}
    transition={{ delay: index * 0.1 }}
    className="relative rounded-lg border border-white/5 bg-black/30 p-6 backdrop-blur-lg"
  >
    <h4
      className={`${outfit.className} mb-3 text-xl font-semibold text-white/90`}
    >
      {mechanic.phase}
    </h4>
    <p className="mb-4 text-sm text-white/60">{mechanic.description}</p>
    <ul className="space-y-2">
      {mechanic.mechanics.map((m, i) => (
        <li key={i} className="flex items-center text-sm text-white/40">
          <div className="mr-2 h-1 w-1 rounded-full bg-white/40" />
          {m}
        </li>
      ))}
    </ul>
  </MotionDiv>
);

const PositionDynamicsTable = () => (
  <div className="overflow-hidden rounded-lg border border-white/5 bg-black/30 backdrop-blur-lg">
    <table className="w-full">
      <thead>
        <tr className="border-b border-white/5">
          <th className="p-4 text-left text-sm font-medium text-white/60">
            Position
          </th>
          <th className="p-4 text-left text-sm font-medium text-white/60">
            Frequency
          </th>
          <th className="p-4 text-left text-sm font-medium text-white/60">
            Role
          </th>
          <th className="p-4 text-left text-sm font-medium text-white/60">
            Constraints
          </th>
        </tr>
      </thead>
      <tbody>
        {POSITION_DYNAMICS.map((pos, i) => (
          <tr key={i} className="border-b border-white/5 last:border-0">
            <td className="p-4 text-sm text-white/90">{pos.position}</td>
            <td className="p-4 font-mono text-sm text-white/90">
              {pos.frequency}
            </td>
            <td className="p-4 text-sm text-white/90">{pos.role}</td>
            <td className="p-4 text-sm text-white/60">{pos.constraints}</td>
          </tr>
        ))}
      </tbody>
    </table>
  </div>
);

const InteractiveWaveform = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const y1 = useTransform(scrollYProgress, [0, 1], [0, 200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -200]);

  return (
    <div ref={containerRef} className="relative h-[400px] overflow-hidden">
      <MotionDiv
        style={{ y: y1 }}
        className="absolute left-0 top-0 h-full w-full"
      >
        {/* Add wave animation elements */}
      </MotionDiv>
      <MotionDiv
        style={{ y: y2 }}
        className="absolute left-0 top-0 h-full w-full"
      >
        {/* Add counter wave animation elements */}
      </MotionDiv>
    </div>
  );
};

// Add new Pattern Mechanics section
const PATTERN_MECHANICS = [
  {
    title: 'Wave Propagation',
    phases: [
      {
        name: 'Initiation',
        description: 'Position 8 initiates movement',
        sequence: '[1,1,1,1,1,1,1,-1]'
      },
      {
        name: 'Cascade',
        description: 'Adjacent positions follow',
        sequence: '[1,1,1,1,1,1,-1,-1]'
      },
      {
        name: 'Peak Formation',
        description: 'Wave reaches maximum depth',
        sequence: '[1,1,1,1,-1,-1,-1,-1]'
      }
    ]
  },
  {
    title: 'Position Dynamics',
    phases: [
      {
        name: 'State Transition',
        description: 'Positions change based on neighbors',
        sequence: '[1→-1, -1→1]'
      },
      {
        name: 'Energy Transfer',
        description: 'Movement energy propagates through system',
        sequence: 'E(n) = E(n+1) * 0.5'
      }
    ]
  }
];

// Add Interactive Pattern Simulator
const PatternSimulator = () => {
  const [activePattern, setActivePattern] = useState(0);
  const progress = useMotionValue(0);
  const opacity = useTransform(progress, [0, 1], [0.4, 1]);

  return (
    <div className="rounded-xl border border-white/5 bg-black/30 p-8 backdrop-blur-lg">
      <h3
        className={`${outfit.className} mb-6 text-2xl font-semibold text-white/90`}
      >
        Pattern Simulator
      </h3>
      <div className="relative h-[300px]">
        <MotionDiv style={{ opacity }} className="grid grid-cols-8 gap-2">
          {Array(8)
            .fill(0)
            .map((_, i) => (
              <MotionDiv
                key={i}
                className="relative h-full w-full"
                animate={{
                  y: activePattern % 2 === 0 ? 0 : i > 5 ? 100 : 0
                }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
              >
                <div className="absolute inset-0 rounded-lg border border-white/10 bg-white/5" />
              </MotionDiv>
            ))}
        </MotionDiv>
      </div>
    </div>
  );
};

// Add Pattern Analysis Section
const PatternAnalysis = () => {
  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="space-y-6">
        <h3
          className={`${outfit.className} text-2xl font-semibold text-white/90`}
        >
          Pattern Analysis
        </h3>
        <div className="space-y-4">
          {PATTERN_MECHANICS.map((section, i) => (
            <MotionDiv
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.2 }}
              className="rounded-lg border border-white/5 bg-black/30 p-6"
            >
              <h4
                className={`${outfit.className} mb-4 text-xl font-medium text-white/80`}
              >
                {section.title}
              </h4>
              <div className="space-y-3">
                {section.phases.map((phase, j) => (
                  <div key={j} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium text-white/70">
                        {phase.name}
                      </span>
                      <code className="rounded bg-white/5 px-2 py-1 text-xs text-white/60">
                        {phase.sequence}
                      </code>
                    </div>
                    <p className="text-sm text-white/50">{phase.description}</p>
                  </div>
                ))}
              </div>
            </MotionDiv>
          ))}
        </div>
      </div>
      <PatternSimulator />
    </div>
  );
};

const TECHNICAL_SPECS = [
  {
    label: 'Pattern Recognition',
    value: '50ms',
    description: 'From signal to insight'
  },
  {
    label: 'Position Analysis',
    value: '8D',
    description: 'Dimensional tracking'
  },
  {
    label: 'Market Coverage',
    value: '24/7',
    description: 'Continuous monitoring'
  }
];

// Add Wave Mechanics Visualization
const WaveMechanicsViz = () => {
  const containerRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ['start end', 'end start']
  });

  const waveProgress = useSpring(scrollYProgress, {
    stiffness: 100,
    damping: 30,
    restDelta: 0.001
  });

  // Use the animation sequence
  const animationSequence = getAnimationSequence();
  const [currentStep, setCurrentStep] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentStep((prev) => (prev + 1) % animationSequence.length);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div ref={containerRef} className="relative h-[400px] overflow-hidden">
      {animationSequence[currentStep].positions.map((pos) => (
        <MotionDiv
          key={pos.boxNumber}
          style={{
            position: 'absolute',
            width: '40px',
            height: '40px',
            y: pos.position * 50,
            backgroundColor: pos.isUp
              ? 'rgba(255,255,255,0.15)'
              : 'rgba(0,0,0,0.4)',
            borderRadius: '8px',
            border: '1px solid rgba(255,255,255,0.1)'
          }}
          animate={{
            y: pos.position * 50
          }}
          transition={{
            type: 'spring',
            stiffness: 300,
            damping: 30
          }}
        >
          <div className="flex h-full items-center justify-center text-white/60">
            {pos.boxNumber}
          </div>
        </MotionDiv>
      ))}
    </div>
  );
};

// State Transition Visualization
const StateTransitionViz = () => {
  const [activeState, setActiveState] = useState(0);
  const states = [
    { positions: [1, 1, 1, 1, 1, 1, 1, 1], label: 'Initial State' },
    { positions: [1, 1, 1, 1, 1, 1, 1, -1], label: 'P8 Transition' },
    { positions: [1, 1, 1, 1, 1, 1, -1, -1], label: 'P7 Follows' },
    { positions: [1, 1, 1, 1, 1, -1, -1, -1], label: 'Cascade' }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveState((prev) => (prev + 1) % states.length);
    }, 2000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="grid grid-cols-2 gap-8">
      <div className="rounded-xl border border-white/5 bg-black/30 p-8">
        <div className="relative h-[400px]">
          {states[activeState].positions.map((pos, i) => (
            <MotionDiv
              key={i}
              className={`absolute h-8 w-8 rounded-lg border border-white/10 ${
                pos === 1 ? 'bg-white/20' : 'bg-white/5'
              }`}
              style={{
                left: `${(i % 4) * 40}px`,
                top: `${Math.floor(i / 4) * 40}px`
              }}
              animate={{
                scale: pos === 1 ? 1 : 0.8,
                opacity: pos === 1 ? 1 : 0.5
              }}
              transition={{ duration: 0.3 }}
            >
              <div className="flex h-full items-center justify-center text-xs text-white/60">
                {i + 1}
              </div>
            </MotionDiv>
          ))}
        </div>
        <div className="mt-4 text-center text-sm text-white/60">
          {states[activeState].label}
        </div>
      </div>
      <div className="space-y-6">
        <h4
          className={`${outfit.className} text-xl font-semibold text-white/90`}
        >
          State Transition Rules
        </h4>
        <div className="space-y-4">
          {[
            {
              rule: 'Adjacent Dependency',
              description:
                'A position can only change state when its adjacent positions are aligned.'
            },
            {
              rule: 'Propagation Direction',
              description:
                'State changes flow from higher to lower positions, never skipping positions.'
            },
            {
              rule: 'Energy Conservation',
              description:
                'Total system energy remains constant, redistributed through position changes.'
            }
          ].map((rule, i) => (
            <div
              key={i}
              className="rounded-lg border border-white/5 bg-black/20 p-4"
            >
              <div className="mb-2 font-medium text-white/80">{rule.rule}</div>
              <div className="text-sm text-white/60">{rule.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const PhilosophicalInsight = ({ insight }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative rounded-xl border border-white/5 bg-black/30 p-8 backdrop-blur-lg"
  >
    <h3
      className={`${outfit.className} mb-4 text-2xl font-semibold text-white/90`}
    >
      {insight.title}
    </h3>
    <p className="mb-6 text-sm leading-relaxed text-white/60">
      {insight.description}
    </p>
    <div className="rounded-lg bg-white/5 p-4">
      <p className={`${kodeMono.className} text-sm italic text-white/40`}>
        "{insight.insight}"
      </p>
    </div>
  </MotionDiv>
);

// Parallax Wave Background
const ParallaxWaveBackground = () => {
  const { scrollYProgress } = useScroll();
  const y1 = useTransform(scrollYProgress, [0, 1], [0, -200]);
  const y2 = useTransform(scrollYProgress, [0, 1], [0, -100]);
  const y3 = useTransform(scrollYProgress, [0, 1], [0, -50]);

  return (
    <div className="absolute inset-0 overflow-hidden">
      {[y1, y2, y3].map((y, i) => (
        <MotionDiv
          key={i}
          style={{ y }}
          className="absolute inset-0 opacity-[0.02]"
        >
          <div
            className="h-full w-full bg-[url('/wave-pattern.svg')] bg-repeat"
            style={{
              backgroundSize: `${(i + 1) * 100}px`,
              opacity: 0.1 - i * 0.02
            }}
          />
        </MotionDiv>
      ))}
    </div>
  );
};

// Interactive Pattern Explorer
const PatternExplorer = () => {
  const [activePhase, setActivePhase] = useState(0);
  const phases = [
    {
      title: 'Initiation',
      description: 'The moment before pattern emergence',
      visual: 'wave-start.svg'
    },
    {
      title: 'Formation',
      description: 'Pattern takes shape through position alignment',
      visual: 'wave-middle.svg'
    },
    {
      title: 'Completion',
      description: 'Full pattern manifestation',
      visual: 'wave-end.svg'
    }
  ];

  return (
    <div className="relative rounded-xl border border-white/5 bg-black/30 p-8">
      <div className="grid grid-cols-[1fr_2fr] gap-8">
        <div className="space-y-6">
          {phases.map((phase, i) => (
            <MotionButton
              key={i}
              className={`w-full rounded-lg border border-white/5 p-4 text-left transition-all ${
                activePhase === i ? 'bg-white/10' : 'bg-black/20'
              }`}
              onClick={() => setActivePhase(i)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
            >
              <h4
                className={`${outfit.className} mb-2 text-lg font-medium text-white/90`}
              >
                {phase.title}
              </h4>
              <p className="text-sm text-white/60">{phase.description}</p>
            </MotionButton>
          ))}
        </div>
        <div className="relative rounded-lg border border-white/5 bg-black/20 p-6">
          <MotionDiv
            key={activePhase}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            className="relative h-full"
          >
            {/* Add visualization here */}
          </MotionDiv>
        </div>
      </div>
    </div>
  );
};

// Pattern Insights Carousel
const PatternInsightsCarousel = () => {
  const [activeInsight, setActiveInsight] = useState(0);
  const insights = [
    {
      title: 'The Fractal Nature',
      description: 'Markets are self-similar across all timeframes...',
      icon: FaLayerGroup
    },
    {
      title: 'Wave Propagation',
      description: 'Energy flows through positions like ripples in water...',
      icon: FaWaveSquare
    },
    {
      title: 'Pattern Recognition',
      description: 'The ability to see order in chaos is fundamental...',
      icon: FaBrain
    }
  ];

  return (
    <div className="relative overflow-hidden rounded-xl border border-white/5 bg-black/30 p-12">
      <div className="absolute inset-0 bg-gradient-to-b from-transparent via-white/[0.02] to-transparent" />
      <MotionDiv
        className="relative flex gap-8"
        animate={{ x: -activeInsight * 100 + '%' }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        {insights.map((insight, i) => (
          <div key={i} className="min-w-full space-y-6 px-4">
            <div className="flex items-center gap-4">
              <insight.icon className="h-8 w-8 text-white/60" />
              <h3
                className={`${outfit.className} text-2xl font-semibold text-white/90`}
              >
                {insight.title}
              </h3>
            </div>
            <p className="text-lg leading-relaxed text-white/60">
              {insight.description}
            </p>
          </div>
        ))}
      </MotionDiv>
      <div className="mt-8 flex justify-center gap-2">
        {insights.map((_, i) => (
          <button
            key={i}
            className={`h-2 w-2 rounded-full transition-all ${
              activeInsight === i ? 'w-4 bg-white/60' : 'bg-white/20'
            }`}
            onClick={() => setActiveInsight(i)}
          />
        ))}
      </div>
    </div>
  );
};

export const SectionAlgorithm = () => {
  return (
    <section className="relative overflow-hidden bg-black py-32">
      {/* Background Elements */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
      <div className="absolute inset-0 -z-10 bg-[url('/grid.svg')] bg-center opacity-20" />

      <div className="mx-auto max-w-7xl px-8">
        {/* Header Section */}
        <div className="mb-24 text-center">
          <div
            className={`${kodeMono.className} mb-6 flex items-center justify-center gap-3 text-sm tracking-wider text-white/60`}
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            ALGORITHMIC ARCHITECTURE
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <h2
            className={`${outfit.className} mb-8 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-6xl font-bold tracking-tight text-transparent`}
          >
            Position-Based
            <br />
            Pattern Recognition
          </h2>
          <p className="mx-auto max-w-2xl text-lg leading-relaxed text-white/60">
            Rthmn's proprietary algorithm analyzes market structure through the
            lens of position-based mathematics, identifying patterns that emerge
            from the complex interaction of 8 distinct market positions.
          </p>
        </div>

        {/* Waveform Animation */}
        <WaveformAnimation />

        {/* Technical Specs */}
        <div className="mb-24 grid grid-cols-3 gap-8 rounded-xl border border-white/5 bg-black/30 p-12 backdrop-blur-lg">
          {TECHNICAL_SPECS.map((spec, index) => (
            <TechnicalSpec key={index} spec={spec} />
          ))}
        </div>

        {/* Features Grid */}
        <div className="grid grid-cols-3 gap-8">
          {ALGORITHM_FEATURES.map((feature, index) => (
            <FeatureCard key={index} feature={feature} />
          ))}
        </div>

        {/* Philosophical Insights */}
        <div className="mt-24 rounded-xl border border-white/5 bg-black/30 p-12 backdrop-blur-lg">
          <h3
            className={`${outfit.className} mb-6 text-3xl font-semibold text-white/90`}
          >
            Philosophical Insights
          </h3>
          <div className="grid grid-cols-3 gap-12">
            {PHILOSOPHICAL_INSIGHTS.map((insight, i) => (
              <PhilosophicalInsight key={i} insight={insight} />
            ))}
          </div>
        </div>

        {/* Pattern Principles */}
        <div className="mt-24 rounded-xl border border-white/5 bg-black/30 p-12 backdrop-blur-lg">
          <h3
            className={`${outfit.className} mb-6 text-3xl font-semibold text-white/90`}
          >
            Pattern Principles
          </h3>
          <div className="grid grid-cols-3 gap-12">
            {PATTERN_PRINCIPLES.map((principle, i) => (
              <MotionDiv
                key={i}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.2 }}
                className="rounded-lg border border-white/5 bg-black/30 p-6"
              >
                <h4
                  className={`${outfit.className} mb-4 text-xl font-medium text-white/80`}
                >
                  {principle.principle}
                </h4>
                <div className="space-y-3">
                  <p className="text-sm text-white/50">
                    {principle.description}
                  </p>
                  <div className="rounded-lg bg-white/5 p-4">
                    <p
                      className={`${kodeMono.className} text-sm italic text-white/40`}
                    >
                      "{principle.example}"
                    </p>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>

        {/* Add new Pattern Analysis section */}
        <div className="my-24">
          <PatternAnalysis />
        </div>

        {/* Wave Mechanics Visualization */}
        <div className="my-24">
          <h3
            className={`${outfit.className} mb-8 text-3xl font-semibold text-white/90`}
          >
            Wave Mechanics
          </h3>
          <WaveMechanicsViz />
        </div>

        {/* State Transitions */}
        <div className="my-24">
          <h3
            className={`${outfit.className} mb-8 text-3xl font-semibold text-white/90`}
          >
            Position State Transitions
          </h3>
          <StateTransitionViz />
        </div>
      </div>
    </section>
  );
};
