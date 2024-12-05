'use client';
import { StartButton } from '@/components/Buttons/StartNowButton';
import { MotionDiv } from '@/components/MotionDiv';
import { AnimatePresence } from 'framer-motion';
import { FaCode, FaCube, FaChartLine, FaBrain } from 'react-icons/fa';

interface AutoBoxModuleProps {
  splineRef: React.MutableRefObject<any>;
  visibility?: {
    isVisible: boolean;
    distance: number;
  };
  hideDistance: number;
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

export const BoxInfo: React.FC<AutoBoxModuleProps> = ({
  splineRef,
  visibility,
  hideDistance
}) => {
  const isVisible = visibility?.isVisible && visibility.distance < hideDistance;

  return (
    <MotionDiv
      initial={{ opacity: 0, x: -20 }}
      animate={{
        opacity: isVisible ? 1 : 0,
        x: isVisible ? 0 : -20
      }}
      transition={{ duration: 0.5 }}
      className="fixed top-1/2 left-20 w-[800px] -translate-y-1/2 space-y-8"
    >
      {/* Main Content */}
      <div className="space-y-6">
        {/* Header */}
        <div className="space-y-2">
          <h2 className="text-gray-gradient font-outfit relative z-10 text-[3em] leading-[1em] font-bold tracking-tight lg:text-[6em] lg:leading-[1em]">
            The Future of
            <br />
            Market Analysis
          </h2>
          <p className="text-dark-gray font-kodemono mb-6 w-11/12 pt-6 text-lg lg:text-xl">
            The universal pattern recognition toolkit designed for trading.
          </p>
          <div className="mt-6 flex gap-6">
            <StartButton href="#pricing" custom={0} />
          </div>
        </div>
      </div>
    </MotionDiv>
  );
};
