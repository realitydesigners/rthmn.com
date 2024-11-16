'use client';
import { MotionDiv } from '@/components/MotionDiv';
import { BELIEFS } from '@/components/Constants/text';
import { BackgroundGrid } from '@/components/BackgroundGrid';

export default function AboutPage() {
  return (
    <BackgroundGrid>
      {/* Hero Section */}
      <section className="relative overflow-hidden pt-40 font-outfit">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
        <div className="mx-auto max-w-7xl px-8">
          <div className="flex flex-col items-center text-center">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mb-8"
            >
              <h1 className="text-gray-gradient max-w-4xl text-6xl font-bold tracking-tight text-transparent lg:text-7xl">
                We're Building A New Lens for Trading
              </h1>
              <p className="mt-6 font-mono text-lg text-white/60">
                Transforming complex market data into intuitive visual
                experiences
              </p>
            </MotionDiv>
          </div>

          {/* Story Content */}
          <div className="mx-auto mt-20 max-w-4xl space-y-24">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="space-y-12"
            >
              <div className="space-y-6">
                <h2 className={`text-gray-gradient text-3xl font-bold`}>
                  From Games to Trading
                </h2>
                <div className="space-y-4 text-lg text-white/60">
                  <p>
                    In 2019, Rthmn began with a simple yet ambitious vision:
                    what if we could transform the complexity of trading into
                    the intuitive experience of playing a video game? This
                    wasn't just about making trading more engaging – it was
                    about fundamentally rethinking how we interact with markets.
                  </p>
                  <p>
                    Over the years, we've developed dozens of unique indicators
                    and visualizations that break free from traditional trading
                    interfaces. Our charts and graphs might not look like
                    typical trading tools, and that's exactly the point. By
                    removing the intimidating edge often associated with
                    trading, we've discovered new ways to understand market
                    movements.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className={`text-gray-gradient text-3xl font-bold`}>
                  A New Perspective
                </h2>
                <div className="space-y-4 text-lg text-white/60">
                  <p>
                    Through the lens of gamification, we've uncovered patterns
                    and relationships that traditional analysis might miss. This
                    fresh perspective hasn't just made trading more accessible –
                    it's revealed deeper insights into market behavior.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                <h2 className={`text-gray-gradient text-3xl font-bold`}>
                  The Cyclical Nature of Markets
                </h2>
                <div className="space-y-4 text-lg text-white/60">
                  <p>
                    Our core assumption is simple yet profound: markets are
                    composed of cyclical patterns that repeat recursively across
                    different time scales. Our first mission was to compress
                    time itself, creating a unified view of market behavior that
                    transcends traditional time intervals.
                  </p>
                  <p>
                    This approach has led to breakthrough insights in pattern
                    recognition and market analysis, allowing us to identify
                    opportunities that might be invisible to conventional
                    trading methods.
                  </p>
                </div>
              </div>
            </MotionDiv>

            {/* Visual Separator */}
          </div>
        </div>
      </section>

      {/* Stats Section - New Addition */}
      <section className="relative py-20">
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid gap-8 lg:grid-cols-3">
            {[
              {
                number: '2019',
                label: 'Founded',
                description: 'Started our journey in market visualization'
              },
              {
                number: '100+',
                label: 'Iterations',
                description: 'Continuous refinement of our algorithms'
              },
              {
                number: '8',
                label: 'Market States',
                description: 'Distinct positions we track and analyze'
              }
            ].map((stat, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8"
              >
                <div className="text-4xl font-bold text-white">
                  {stat.number}
                </div>
                <div className="mt-2 text-xl text-white/80">{stat.label}</div>
                <div className="mt-2 font-mono text-sm text-white/60">
                  {stat.description}
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* The Team Section - Text Version */}
      <section className="relative py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
        <div className="mx-auto max-w-7xl px-8">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-gray-gradient text-center text-4xl font-bold">
                  Two People, One Vision
                </h2>
                <div className="space-y-6 font-mono text-lg leading-relaxed text-white/60">
                  <p>
                    We are Raymond and Mitch, two developers on a relentless
                    journey to quantify everything. Our obsession is simple: if
                    something can be measured, it can be visualized. If it can
                    be visualized, it can be understood.
                  </p>
                  <p>
                    Our story began in the financial markets - not just because
                    of the opportunities they present, but because they offer
                    the perfect laboratory for developing and testing new ways
                    to visualize and understand complex systems in real-time.
                  </p>
                  <p>
                    From late-night coding sessions to breakthrough discoveries,
                    we've been pushing the boundaries of what's possible in data
                    visualization and pattern recognition. Every chart, every
                    graph, every piece of data is an opportunity to innovate and
                    reveal hidden patterns that can unlock new opportunities.
                  </p>
                </div>
              </div>

              <div className="mx-auto max-w-2xl">
                <blockquote className="border-l-2 border-white/20 pl-6 font-mono text-xl italic text-white/40">
                  "Our goal isn't just to build another trading platform - it's
                  to create new ways of seeing and understanding the rhythms
                  that drive everything around us."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* What We Believe Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
        <div className="mx-auto max-w-7xl px-8">
          <div className="grid gap-8 md:grid-cols-2">
            {BELIEFS.map((belief, index) => (
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
                        'radial-gradient(circle at 0% 0%, #ffffff15 0%, transparent 50%)',
                        'radial-gradient(circle at 100% 100%, #ffffff15 0%, transparent 50%)',
                        'radial-gradient(circle at 0% 100%, #ffffff15 0%, transparent 50%)',
                        'radial-gradient(circle at 100% 0%, #ffffff15 0%, transparent 50%)',
                        'radial-gradient(circle at 0% 0%, #ffffff15 0%, transparent 50%)'
                      ]
                    }}
                    transition={{
                      duration: 10,
                      repeat: Infinity,
                      ease: 'linear'
                    }}
                  />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  <div className="mb-4 flex items-center gap-4">
                    <div className="rounded-xl bg-white/5 p-3 backdrop-blur-sm">
                      <belief.icon className="h-6 w-6 text-white transition-colors group-hover:text-white" />
                    </div>
                    <h3 className="text-2xl font-semibold text-white/90">
                      {belief.title}
                    </h3>
                  </div>
                  <p className="font-mono text-lg text-white/60">
                    {belief.description}
                  </p>
                </div>

                {/* Enhanced Hover Effect */}
                <div className="absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                  <div className="h-full w-full bg-gradient-to-br from-white/[0.02] to-transparent" />
                </div>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>

      {/* Our Approach Section */}
      <section className="relative py-32">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
        <div className="mx-auto max-w-7xl px-8">
          <div className="mx-auto max-w-3xl text-center">
            <div
              className={`mb-6 flex items-center justify-center gap-3 font-mono text-sm tracking-wider text-white/60`}
            >
              <div className="text-gray-gradient h-[1px] w-12 to-transparent" />
            </div>
            <h2
              className={`text-gray-gradient mb-8 bg-clip-text text-4xl font-bold tracking-tight text-transparent lg:text-5xl`}
            >
              Beyond Traditional Analysis
            </h2>
            <p className="text-lg text-white/60">
              We're not just building another trading platform - we're creating
              new ways to understand and interact with complex systems.
            </p>
          </div>

          <div className="mt-20 grid gap-8 lg:grid-cols-3">
            {[
              {
                title: 'Data Visualization',
                description:
                  'Creating intuitive visual representations of complex market patterns.'
              },
              {
                title: 'Performance Metrics',
                description:
                  'Developing new ways to measure and optimize trading strategies.'
              },
              {
                title: 'Pattern Recognition',
                description:
                  'Using advanced algorithms to identify market opportunities.'
              }
            ].map((item, index) => (
              <MotionDiv
                key={index}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                className="relative overflow-hidden rounded-lg border border-white/10 bg-white/[0.02] p-8"
              >
                <h3 className={`mb-4 text-xl font-bold text-white/90`}>
                  {item.title}
                </h3>
                <p className="text-white/60">{item.description}</p>
              </MotionDiv>
            ))}
          </div>
        </div>
      </section>
    </BackgroundGrid>
  );
}
