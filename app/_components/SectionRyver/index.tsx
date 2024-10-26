'use client';
import Spline from '@splinetool/react-spline';
import { russo, oxanium } from '@/fonts';
import {
  motion,
  HTMLMotionProps,
  useScroll,
  useTransform
} from 'framer-motion';
import { useRef, RefObject } from 'react';

interface CustomMotionDivProps extends HTMLMotionProps<'div'> {
  className?: string;
  ref?: RefObject<HTMLDivElement>;
  style?: {
    opacity?: any;
    scale?: any;
    y?: any;
  };
}

const CustomMotionDiv = motion.div as React.FC<CustomMotionDivProps>;

export function RyverSection() {
  const sectionRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ['start end', 'end start']
  });

  const opacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);
  const scale = useTransform(scrollYProgress, [0.2, 0.6], [0.8, 1]);
  const y = useTransform(scrollYProgress, [0.2, 0.6], [100, 0]);

  return (
    <>
      <div className="relative flex h-screen items-center justify-center">
        <Spline scene="https://prod.spline.design/B-MvWSCCJxiCK91v/scene.splinecode" />
        <div className="absolute">
          {/* Add content for right bottom and left bottom corners here */}
        </div>
      </div>

      <CustomMotionDiv
        ref={sectionRef}
        className="flex h-screen justify-center bg-black"
        style={{ opacity, scale, y }}
      >
        <div className="flex flex-col items-center pt-32 lg:pt-60">
          <CustomMotionDiv
            className="relative flex items-center justify-center"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2 }}
          >
            <div className="relative flex flex-col pl-6">
              <h1 className="heading-text -ml-6 text-sm font-bold leading-none tracking-[.1em] lg:-mb-2 lg:text-xl">
                RTHMN
              </h1>
              <h1
                className={`heading-text text-6xl font-bold leading-none tracking-wide lg:text-8xl ${russo.className}`}
              >
                RYVER
              </h1>
            </div>
            <h1 className="text-md heading-text pl-2 font-bold tracking-[.3em] lg:text-4xl">
              CHARTS
            </h1>
          </CustomMotionDiv>
          <CustomMotionDiv
            className="p-12 lg:p-6"
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
          >
            <svg
              width="100%"
              height="100%"
              viewBox="0 0 465 138"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M229.288 104.068V115.657L161 137V124.711L214.471 108.547M229.288 104.068L210.928 98.1385M229.288 104.068L214.471 108.547M192.567 92.209L210.928 98.1385M192.567 92.209L250.548 73.6169M192.567 92.209V101.428L214.471 108.547M268.587 68.0518V78.791L210.928 98.1385M268.587 68.0518L199.01 48.393M268.587 68.0518L250.548 73.6169M177.75 42.1377L250.548 30.2788M177.75 42.1377L199.01 48.393M177.75 42.1377V52.9204L250.548 73.6169M250.548 30.2788V39.3383L199.01 48.393M250.548 30.2788L230.577 25.4473M230.577 25.4473L210.606 20.6159L295 7V14.7612L230.577 25.4473Z"
                stroke="#B9CBD8"
              />
              <path d="M357 1L464 124" stroke="#545F68" />
              <path d="M314 1L399 123" stroke="#ABBECD" strokeDasharray="2 2" />
              <path d="M272 2L327 125" stroke="#ABBECD" strokeDasharray="2 2" />
              <path d="M202 1L147 123" stroke="#ABBECD" strokeDasharray="2 2" />
              <path d="M161 1L76 123" stroke="#ABBECD" strokeDasharray="2 2" />
              <path d="M109 1L1 124" stroke="#545F68" />
            </svg>
          </CustomMotionDiv>
          <div
            className={`heading-text w-3/4 pt-12 text-center text-2xl lg:w-1/2 lg:text-4xl ${oxanium.className}`}
          >
            With RYVER Charts, you don't just watch the market— you see how it
            flows.
          </div>
        </div>
      </CustomMotionDiv>
      <div className="h-screen w-full bg-gray-200/5">
        image of our trading platform will go here
      </div>
    </>
  );
}
