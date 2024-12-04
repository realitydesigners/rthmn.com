'use client';
import { StartButton } from '@/components/Buttons/StartNowButton';
import { MotionDiv } from '@/components/MotionDiv';
import { FaCode, FaCube, FaChartLine, FaBrain } from 'react-icons/fa';

interface AutoBoxModuleProps {
  splineRef: React.MutableRefObject<any>;
}

const FEATURES = [
  {
    icon: FaCube,
    title: 'Market Geometry',
    description: 'Learn to see the market as a geometric object'
  },
  {
    icon: FaCode,
    title: 'Trading States',
    description:
      'Prices move up and down, but the market is always in one state or another'
  },
  {
    icon: FaChartLine,
    title: 'Pattern Recognition',
    description:
      'Visualize complex market patterns through geometric relationships'
  },
  {
    icon: FaBrain,
    title: 'Algorithmic Analysis',
    description: 'Advanced mathematics driving pattern detection'
  }
];

export const BoxInfo: React.FC<AutoBoxModuleProps> = ({ splineRef }) => {
  return (
    <div className="fixed top-1/2 left-20 w-[800px] -translate-y-1/2 space-y-8">
      {/* Main Content */}
      <MotionDiv
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        transition={{ duration: 0.8 }}
        className="space-y-6"
      >
        {/* Header */}
        <div className="space-y-2">
          <h2
            className={`text-gray-gradient font-outfit relative z-10 text-[3em] leading-[1em] font-bold tracking-tight lg:text-[6em] lg:leading-[1em]`}
          >
            The Future of
            <br />
            Market Analysis
          </h2>
          <p
            className={`text-dark-gray font-kodemono mb-6 w-11/12 pt-6 text-lg lg:text-xl`}
          >
            The universal pattern recognition toolkit designed for trading.
          </p>
          <div className="mt-6 flex gap-6">
            <StartButton href="#pricing" custom={0} />
          </div>
        </div>

        {/* Features Grid */}
        {/* <div className="grid grid-cols-2 gap-4">
          {FEATURES.map((feature, index) => (
            <MotionDiv
              key={index}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: index * 0.1 }}
              className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-4 backdrop-blur-sm transition-all duration-300 hover:border-white/20 hover:bg-black/60"
            >
              <div className="pointer-events-none absolute inset-0">
                <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
              </div>

              <div className="relative z-10 space-y-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-gray-200/10">
                  <feature.icon className="h-5 w-5 text-gray-200" />
                </div>
                <div>
                  <h3 className="font-outfit mb-1 text-lg font-semibold text-white">
                    {feature.title}
                  </h3>
                  <p className="font-kodemono text-sm leading-relaxed text-white/60">
                    {feature.description}
                  </p>
                </div>
              </div>
            </MotionDiv>
          ))}
        </div> */}
      </MotionDiv>
    </div>
  );
};
