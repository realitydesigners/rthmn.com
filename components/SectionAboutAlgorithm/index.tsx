'use client';
import { MotionDiv } from '@/components/MotionDiv';
import { FaWaveSquare, FaCube, FaFingerprint, FaAtom } from 'react-icons/fa';
import {
  ALGORITHM_CONCEPTS,
  NATURE_EXAMPLE,
  PRACTICAL_APPLICATIONS,
  POSITION_STATES
} from '@/app/constants/text';

export function SectionAboutAlgorithm() {
  return (
    <section className="relative w-full px-2 py-32 lg:px-[10vw]">
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#22c55e]/[0.03] via-transparent to-transparent blur-xl" />
      </div>
      <div className="mx-auto max-w-7xl px-8">
        <div className="relative flex flex-col items-center text-center">
          <div className="text-kodemono mb-6 flex items-center gap-3 text-sm tracking-wider text-white/60 lg:text-sm">
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
            NEXT GENERATION INDICATORS
            <div className="h-[1px] w-12 bg-gradient-to-r from-transparent via-white/20 to-transparent"></div>
          </div>
          <h2
            className={`text-outfit text-gray-gradient relative z-10 text-[3em] font-bold leading-tight tracking-tight lg:text-[6em]`}
          >
            See What Others
            <br />
            Can't See
          </h2>
          <p className={`text-kodemono text-dark-gray w-11/12 pt-6 text-xl`}>
            Detect market reversals before they happen.
          </p>
        </div>

        {/* Core Features */}
        <div className="my-20">
          <div className="mb-16 grid gap-8 lg:grid-cols-3">
            {ALGORITHM_CONCEPTS.map((concept, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm transition-all duration-300 hover:bg-white/[0.05]"
              >
                {/* Flowing Radial Effect */}
                <div className="absolute inset-0">
                  <MotionDiv
                    className="absolute inset-0"
                    animate={{
                      background: [
                        'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 100% 100%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 0% 100%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 100% 0%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)'
                      ]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </div>

                {/* Enhanced Dynamic Background */}
                <div className="absolute inset-0 opacity-10">
                  <MotionDiv
                    className="absolute inset-0 opacity-10"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                      opacity: [0.5, 0.8]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage:
                        'radial-gradient(circle at center, #22c55e33, transparent)',
                      filter: 'blur(40px)'
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-4 flex items-center gap-2">
                    <div className="rounded-xl bg-white/5 p-3 backdrop-blur-sm">
                      <concept.icon className="h-6 w-6 text-white transition-colors group-hover:text-white" />
                    </div>
                    <h3 className="text-outfit text-2xl font-semibold text-white/90">
                      {concept.title}
                    </h3>
                  </div>
                  <p className="text-kodemono text-white/60">
                    {concept.description}
                  </p>
                </div>

                {/* Enhanced Hover Effect with green */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-br from-[#22c55e]/[0.02] to-transparent" />
                </div>
              </MotionDiv>
            ))}
          </div>
          <div className="relative my-20 flex flex-col justify-center px-4 lg:px-[10vw]">
            <h3 className="text-outfit mb-8 text-3xl font-semibold text-white/90">
              {NATURE_EXAMPLE.title}
            </h3>
            <div className="mx-auto max-w-4xl space-y-8">
              {NATURE_EXAMPLE.paragraphs.map((paragraph, index) => (
                <p
                  key={index}
                  className="text-kodemono text-lg leading-relaxed text-white/60"
                >
                  {paragraph}
                </p>
              ))}
            </div>
          </div>

          {/* Real World Applications */}
          <div className="grid gap-8 lg:grid-cols-3">
            {PRACTICAL_APPLICATIONS.examples.map((example, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="group relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8 backdrop-blur-sm"
              >
                {/* Flowing Radial Effect */}
                <div className="absolute inset-0">
                  <MotionDiv
                    className="absolute inset-0"
                    animate={{
                      background: [
                        'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 100% 100%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 0% 100%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 100% 0%, #22c55e15 0%, transparent 50%)',
                        'radial-gradient(circle at 0% 0%, #22c55e15 0%, transparent 50%)'
                      ]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </div>

                {/* Enhanced Dynamic Background */}
                <div className="absolute inset-0 opacity-10">
                  <MotionDiv
                    className="absolute inset-0 opacity-10"
                    animate={{
                      backgroundPosition: ['0% 0%', '100% 100%'],
                      opacity: [0.5, 0.8]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      repeatType: 'reverse'
                    }}
                    style={{
                      position: 'absolute',
                      inset: 0,
                      backgroundImage:
                        'radial-gradient(circle at center, #22c55e33, transparent)',
                      filter: 'blur(40px)'
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <h3 className="text-outfit mb-4 text-2xl font-semibold text-white/90">
                    {example.scenario}
                  </h3>
                  <p className="text-kodemono mb-4 text-white/60">
                    {example.description}
                  </p>
                  <div className="mt-4 rounded-lg bg-white/5 p-4">
                    <p className="text-kodemono text-sm text-[#22c55e]">
                      {example.application}
                    </p>
                  </div>
                </div>

                {/* Added hover effect for nature example */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-br from-[#22c55e]/[0.02] to-transparent" />
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
