'use client';
import { MotionDiv } from '@/components/MotionDiv';
import { BELIEFS } from '@/components/Constants/text';
import { BackgroundGrid } from '@/components/BackgroundGrid';
import { Card } from '@/components/Card';
import { Scene } from '@/components/Scene/Scene';
import { GlowingCard } from '@/components/GlowingCard';

export default function AboutPage() {
  return (
    <BackgroundGrid>
      {/* Hero Section */}
      <section className="relative flex flex-col items-center justify-center overflow-hidden font-outfit">
        <div className="mt-20 h-[600px] w-full">
          <Scene scene="https://prod.spline.design/dS35wUjv7z1WWKZA/scene.splinecode" />
        </div>
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
            </MotionDiv>
          </div>
          <div className="mx-auto mt-20 max-w-3xl space-y-24">
            <MotionDiv
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="mt-20 max-w-3xl space-y-12"
            >
              <div className="space-y-6">
                <h2 className={`text-gray-gradient text-4xl font-bold`}>
                  From Games to Trading
                </h2>
                <div className="space-y-4 text-xl leading-[1.75em] text-white/60">
                  <p>
                    In 2019, Rthmn began with a simple vision: what if we could
                    transform the complexity of trading into the intuitive
                    experience of playing a video game? This wasn't just about
                    making trading more engaging, it was about fundamentally
                    rethinking how we interact with markets.
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
                  <p>
                    Our core assumption is that markets are composed of cyclical
                    patterns that repeat all the time. Our first mission was to
                    compress time itself, creating a unified view of market
                    behavior that transcends traditional time intervals.
                  </p>
                  <p>
                    This approach has led to breakthrough insights in pattern
                    recognition and market analysis, allowing us to identify
                    opportunities that might be invisible to conventional
                    trading methods.
                  </p>
                  <p>
                    Through the lens of gamification, we've uncovered patterns
                    and relationships that traditional analysis might miss. This
                    fresh perspective hasn't just made trading more accessible –
                    it's revealed deeper insights into market behavior.
                  </p>
                </div>
              </div>
            </MotionDiv>
          </div>
        </div>
      </section>
      {/* The Team Section - Text Version */}
      <section className="relative py-32 font-outfit">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
        <div className="mx-auto max-w-7xl px-8">
          <div className="mx-auto max-w-3xl">
            <div className="space-y-12">
              <div className="space-y-6">
                <h2 className="text-gray-gradient text-center font-outfit text-7xl font-bold">
                  The Team
                </h2>
                <div className="space-y-6 text-xl leading-[1.75em] text-white/60">
                  <p>
                    We are small team of two developers on a relentless journey
                    to quantify everything. Our obsession is simple: if
                    something can be measured, it can be visualized. If it can
                    be visualized, it can be understood.
                  </p>
                  <p>
                    Our story began in the financial markets - not only because
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
                <blockquote className="border-l-2 border-white/10 pl-6 font-kodemono text-xl italic text-white/40">
                  "Our goal isn't just to build another trading platform - it's
                  to create new ways of seeing and understanding the rhythms
                  that drive everything around us."
                </blockquote>
              </div>
            </div>
          </div>
        </div>
      </section>
    </BackgroundGrid>
  );
}
