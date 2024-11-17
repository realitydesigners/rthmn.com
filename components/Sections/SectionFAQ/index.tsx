'use client';
import type React from 'react';
import { useState } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { FAQ } from '@/components/Constants/text';
import { MotionDiv } from '@/components/MotionDiv';

export const SectionFAQ: React.FC = () => {
  const [activeService, setActiveService] = useState<string | null>(null);

  const handleFAQClick = (label: string) => {
    setActiveService(activeService !== label ? label : null);
  };

  return (
    <section className="relative z-[100] px-8 px-[5vw] py-12 xl:px-[15vw] 2xl:px-[15vw]">
      <div className="relative rounded-xl border border-white/10 bg-black/90 p-6 backdrop-blur-md">
        {/* Effects */}
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/50 to-transparent" />
        </div>

        <div className="mb-8 text-center">
          <h2 className="bg-gradient-to-r from-white via-white/90 to-white/80 bg-clip-text py-8 font-outfit text-5xl font-bold text-transparent">
            Frequently Asked Questions
          </h2>
          <p className="mx-auto max-w-2xl text-lg text-white/60">
            Everything you need to know about rthmn. Can't find the answer
            you're looking for? Feel free to contact our support team.
          </p>
        </div>

        <ul className="mx-auto max-w-4xl space-y-4">
          {FAQ.map(({ question, answer }) => (
            <MotionDiv
              key={question}
              initial={false}
              animate={{
                backgroundColor:
                  activeService === question
                    ? 'rgba(52, 211, 153, 0.1)'
                    : 'rgba(0, 0, 0, 0.4)'
              }}
              whileHover={{ scale: 1.005 }}
              whileTap={{ scale: 0.995 }}
              className={`w-full overflow-hidden rounded-lg border transition-all duration-300 ${
                activeService === question
                  ? 'border-emerald-400/50'
                  : 'border-white/5 hover:border-white/10'
              }`}
            >
              <div
                className="flex w-full cursor-pointer items-center justify-between p-5"
                onClick={() => handleFAQClick(question)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleFAQClick(question);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                <div className="flex items-center gap-4">
                  <div
                    className={`flex h-10 w-10 items-center justify-center rounded-full border transition-colors duration-300 ${
                      activeService === question
                        ? 'border-emerald-400 bg-emerald-400/10'
                        : 'border-white/10 bg-white/5'
                    }`}
                  >
                    <span className="text-base font-bold text-emerald-400">
                      Q
                    </span>
                  </div>
                  <h3 className="text-lg font-medium text-white/90">
                    {question}
                  </h3>
                </div>
                <FaChevronDown
                  className={`h-5 w-5 text-emerald-400 transition-transform duration-300 ${
                    activeService === question ? 'rotate-180' : ''
                  }`}
                />
              </div>

              <MotionDiv
                initial={false}
                animate={{
                  height: activeService === question ? 'auto' : 0,
                  opacity: activeService === question ? 1 : 0
                }}
                transition={{
                  duration: 0.3,
                  ease: 'easeInOut'
                }}
                className="overflow-hidden"
              >
                <div className="border-t border-white/5 px-5 py-5">
                  <div className="flex gap-4">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5 font-outfit">
                      <span className="text-base font-bold text-white/70">
                        A
                      </span>
                    </div>
                    <p className="text-base leading-relaxed text-white/70 [text-wrap:pretty]">
                      {answer}
                    </p>
                  </div>
                </div>
              </MotionDiv>
            </MotionDiv>
          ))}
        </ul>
      </div>
    </section>
  );
};
