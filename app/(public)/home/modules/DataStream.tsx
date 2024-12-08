'use client';
import { StartButton } from '@/components/Buttons/StartNowButton';
import { MotionDiv } from '@/components/MotionDiv';

interface AutoBoxModuleProps {
  visibility?: {
    isVisible: boolean;
    distance: number;
  };
}

export const DataStream: React.FC<AutoBoxModuleProps> = ({ visibility }) => {
  return (
    <MotionDiv
      initial={{ opacity: 0, y: 20 }}
      animate={{
        opacity: visibility?.isVisible ? 1 : 0,
        y: visibility?.isVisible ? 0 : 20
      }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className="fixed inset-0 flex items-center justify-center"
    >
      <div className="relative px-4">
        <div className="space-y-8 text-center">
          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.2 }}
          >
            <h2 className="font-outfit text-[2.5em] leading-[1em] font-bold text-white lg:text-[6em]">
              The First Smart
              <br></br>
              Pattern Recognition
              <br></br>
              Tool For Trading
            </h2>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.4 }}
          >
            <p className="font-outfit text-gray-400 lg:text-2xl">
              The first universal pattern recognition toolkit
              <br />
              designed for trading
            </p>
          </MotionDiv>

          <MotionDiv
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.6 }}
            className="mt-8 flex justify-center"
          >
            <StartButton href="#pricing" custom={0}>
              Start now →
            </StartButton>
          </MotionDiv>
        </div>

        <div className="pointer-events-none absolute inset-0 -z-10">
          <div className="absolute top-1/2 left-1/2 h-48 w-96 -translate-x-1/2 -translate-y-1/2 bg-blue-500/5 blur-[120px]" />
          <div className="absolute top-1/2 left-1/2 h-32 w-32 -translate-x-1/2 -translate-y-1/2 rounded-full bg-blue-400/10 blur-2xl" />
        </div>
      </div>
    </MotionDiv>
  );
};
