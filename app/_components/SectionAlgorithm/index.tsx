'use client';
import { MotionDiv } from '../../../components/MotionDiv';
import {
  ALGORITHM_FEATURES,
  PHILOSOPHICAL_INSIGHTS,
  TECHNICAL_SPECS,
  PATTERN_PRINCIPLES
} from '@/app/_components/text';

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
    <h3 className={`text-outfit mb-4 text-2xl font-semibold text-white/90`}>
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
    <div className={`text-kodemono mb-2 text-3xl font-bold text-white/90`}>
      {spec.value}
    </div>
    <div className={`text-kodemono mb-1 text-sm font-medium text-white/60`}>
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

const PhilosophicalInsight = ({ insight }) => (
  <MotionDiv
    initial={{ opacity: 0, y: 20 }}
    whileInView={{ opacity: 1, y: 0 }}
    viewport={{ once: true }}
    className="relative rounded-xl border border-white/5 bg-black/30 p-8 backdrop-blur-lg"
  >
    <h3 className={`text-outfit mb-4 text-2xl font-semibold text-white/90`}>
      {insight.title}
    </h3>
    <p className="mb-6 text-sm leading-relaxed text-white/60">
      {insight.description}
    </p>
    <div className="rounded-lg bg-white/5 p-4">
      <p className={`text-kodemono text-sm italic text-white/40`}>
        "{insight.insight}"
      </p>
    </div>
  </MotionDiv>
);

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
            className={`text-kodemono mb-6 flex items-center justify-center gap-3 text-sm tracking-wider text-white/60`}
          >
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            ALGORITHMIC ARCHITECTURE
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>
          <h2
            className={`text-outfit mb-8 bg-gradient-to-b from-white via-white to-white/60 bg-clip-text text-6xl font-bold tracking-tight text-transparent`}
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
            className={`text-outfit mb-6 text-3xl font-semibold text-white/90`}
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
            className={`text-outfit mb-6 text-3xl font-semibold text-white/90`}
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
                  className={`text-outfit mb-4 text-xl font-medium text-white/80`}
                >
                  {principle.principle}
                </h4>
                <div className="space-y-3">
                  <p className="text-sm text-white/50">
                    {principle.description}
                  </p>
                  <div className="rounded-lg bg-white/5 p-4">
                    <p className={`text-kodemono text-sm italic text-white/40`}>
                      "{principle.example}"
                    </p>
                  </div>
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
};
