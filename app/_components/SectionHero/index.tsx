'use client';
import Link from 'next/link';
import React from 'react';
import { FaArrowRight } from 'react-icons/fa';
import { BsGraphUp, BsBarChartLine } from 'react-icons/bs';
import { AiOutlineAreaChart } from 'react-icons/ai';
import { useAnimation } from 'framer-motion';
import { useInView } from 'react-intersection-observer';
import { TypeAnimation } from 'react-type-animation';
import { MotionDiv } from '../../../components/MotionDiv';

export const SectionHero: React.FC = () => {
  const controls = useAnimation();
  const [ref, inView] = useInView();

  React.useEffect(() => {
    if (inView) {
      controls.start('visible');
    }
  }, [controls, inView]);

  return (
    <div
      className={`text-oxanium relative flex h-screen w-full flex-col justify-center overflow-hidden bg-black`}
    >
      <MotionDiv
        ref={ref}
        animate={controls}
        initial="hidden"
        variants={{
          visible: { opacity: 1, y: 0 },
          hidden: { opacity: 0, y: 50 }
        }}
        transition={{ duration: 0.5 }}
        className="relative z-10 z-[99] flex w-full flex-col px-[4vw] lg:ml-[10vw] lg:w-1/2 lg:px-0"
      >
        <div className="text-left">
          <h1
            className={`text-outfit mb-2vw text-[12vw] font-bold leading-[1em] tracking-tight text-white sm:text-[9vw] lg:text-[7vw] xl:text-[6vw]`}
          >
            Trading
          </h1>
          <h1
            className={`text-outfit mb-2vw text-[10vw] font-bold leading-[1em] tracking-tight text-white sm:text-[8vw] lg:text-[6vw] xl:text-[5vw]`}
          >
            Simplified.
          </h1>
        </div>
        <div className="flex w-full flex-col pt-[2vw]">
          <TypeAnimation
            sequence={[
              'Uncover hidden patterns in market data with 3D visualization.',
              1000,
              '',
              100,
              'Predict market trends with AI-powered chart analysis.',
              1000,
              '',
              100,
              'Optimize your trading strategy with real-time chart indicators.',
              1000,
              '',
              100,
              'Master technical analysis through interactive chart simulations.',
              1000,
              '',
              100
            ]}
            wrapper="h2"
            speed={50}
            deletionSpeed={80}
            className={`text-outfit w-11/12 text-[4vw] leading-[1.4] text-gray-400 sm:text-[3vw] lg:w-2/3 lg:text-[1.75vw] xl:text-[1.25vw]`}
            repeat={Infinity}
          />
          <div className="flex w-full flex-col items-center justify-center gap-[2vw] pt-[10vw] lg:flex-row lg:justify-start lg:pt-[2vw]">
            <Link
              href="/start"
              className="group flex w-[90vw] items-center space-x-[1vw] rounded-md bg-gradient-to-r from-blue-500/50 to-purple-500/50 font-bold text-black transition-all duration-200 hover:from-[#3CFFBE] hover:to-[#98FFF5] sm:w-[66vw] lg:w-[16vw] xl:w-[12vw]"
            >
              <span className="flex w-full items-center justify-center space-x-[1vw] rounded-md bg-gradient-to-r from-blue-500/50 to-purple-500/50 py-[3vw] text-center text-[3vw] text-white transition-all duration-300 group-hover:bg-opacity-0 sm:py-[2vw] sm:text-[2vw] lg:py-[1vw] lg:text-[1.25vw] xl:text-[1vw]">
                <span className="text-white">Start now</span>
                <FaArrowRight className="transition-transform duration-300 group-hover:translate-x-1" />
              </span>
            </Link>
            <Link
              href="/start"
              className="group flex w-[90vw] items-center space-x-[1vw] rounded-md bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a] p-[0.1vw] text-gray-50 transition-all duration-200 hover:from-[#222] hover:to-[#121212] sm:w-[66vw] lg:w-[16vw] xl:w-[12vw]"
            >
              <span
                className={`text-kodemono flex w-full items-center justify-center space-x-[1vw] rounded-md bg-gradient-to-b from-[#0e0e0e] to-[#000] py-[3vw] text-[3vw] transition-all duration-300 group-hover:bg-opacity-0 sm:py-[2vw] sm:text-[2vw] lg:py-[1vw] lg:text-[1.25vw] xl:text-[1vw]`}
              >
                <span>How it works</span>
              </span>
            </Link>
          </div>
        </div>
        <div className="mt-[10vw] flex flex-col items-center space-y-[4vw] lg:mt-[8vw] lg:flex-row lg:space-x-[4vw] lg:space-y-0">
          <MotionDiv
            className="flex w-[50vw] items-center space-x-[1vw]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BsGraphUp className="h-[6vw] w-[6vw] text-[#76FFD6] lg:h-[2vw] lg:w-[2vw]" />
            <span
              className={`text-outfit text-[2.5vw] text-white lg:text-[.9vw]`}
            >
              Advanced Chart Pattern Recognition
            </span>
          </MotionDiv>
          <MotionDiv
            className="flex w-[50vw] items-center space-x-[1vw]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <AiOutlineAreaChart className="h-[6vw] w-[6vw] text-[#76FFD6] lg:h-[2vw] lg:w-[2vw]" />
            <span
              className={`text-outfit text-[2.5vw] text-white lg:text-[.9vw]`}
            >
              Real-time Market Trend Analysis
            </span>
          </MotionDiv>
          <MotionDiv
            className="flex w-[50vw] items-center space-x-[1vw]"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <BsBarChartLine className="h-[6vw] w-[6vw] text-[#76FFD6] lg:h-[2vw] lg:w-[2vw]" />
            <span
              className={`text-outfit text-[2.5vw] text-white lg:text-[.9vw]`}
            >
              Algorithmic Technical Indicators
            </span>
          </MotionDiv>
        </div>
      </MotionDiv>
    </div>
  );
};
