'use client';
import type React from 'react';
import { useState } from 'react';
import { FaQuestionCircle } from 'react-icons/fa';
import { FAQ } from '@/components/Constants/text';

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

        <div className="mb-4 border-b border-white/5 pb-2">
          <h2 className="text-2xl font-bold text-white/90">
            Frequently Asked Questions
          </h2>
        </div>

        <ul className="w-full space-y-3">
          {FAQ.map(({ question, answer }) => (
            <li key={question}>
              <div
                className={`w-full cursor-pointer rounded-lg border transition-all duration-300 ${
                  activeService === question
                    ? 'border-[#22c55e]/50 bg-[#22c55e]/10'
                    : 'border-white/5 bg-black/40 hover:border-white/10 hover:bg-black/60'
                }`}
              >
                <div
                  className="flex w-full items-center p-4"
                  onClick={() => handleFAQClick(question)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' || e.key === ' ') {
                      handleFAQClick(question);
                    }
                  }}
                  role="button"
                  tabIndex={0}
                >
                  <FaQuestionCircle className="mr-3 h-5 w-5 text-[#22c55e]" />
                  <div className="text-sm font-medium text-white/90">
                    {question}
                  </div>
                </div>

                {activeService === question && (
                  <div className="border-t border-white/5 px-4 py-3">
                    <p className="text-sm text-white/70">{answer}</p>
                  </div>
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
};
