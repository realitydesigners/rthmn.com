'use client';

import { StartButton } from '@/components/Sections/StartNowButton';
import { motion } from 'framer-motion';

export const SectionCTA = () => {
    // Combined background styles
    const backgroundStyle = {
        backgroundImage: `
            radial-gradient(ellipse at center, rgba(17, 24, 39, 0.3) 0%, transparent 70%),
            linear-gradient(to right, rgba(255, 255, 255, 0.03) 1px, transparent 1px),
            linear-gradient(to bottom, rgba(255, 255, 255, 0.03) 1px, transparent 1px)
        `,
        backgroundSize: '100% 100%, 40px 40px, 40px 40px', // Adjust grid size
    };

    return (
        <section
            className='relative overflow-hidden bg-black py-24 sm:py-32' // Increased padding
            style={backgroundStyle} // Apply combined background
        >
            {/* Content Wrapper - No extra container needed */}
            <div className='relative z-10 mx-auto max-w-3xl px-4 text-center sm:px-6 lg:px-8'>
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.7, delay: 0.1 }}
                    viewport={{ once: true }}
                >
                    {/* Larger, glowing heading */}
                    <h2
                        className='font-outfit text-neutral-gradient mb-6 text-5xl font-extrabold tracking-tight sm:text-6xl lg:text-7xl'
                        style={{ textShadow: '0 0 15px rgba(209, 213, 219, 0.3)' }} // Subtle glow matching gradient
                    >
                        Ready to Elevate Your Trading?
                    </h2>
                    <p className='font-outfit mx-auto mt-6 max-w-xl text-lg text-neutral-400'>
                        Join RTHMN today and start identifying high-probability patterns with confidence. Gain your
                        edge.
                    </p>
                    {/* Button with potential glow wrapper */}
                    <div
                        className='mt-12 flex justify-center drop-shadow-[0_0_8px_rgba(209,213,219,0.2)] filter transition-all duration-300 hover:drop-shadow-[0_0_12px_rgba(209,213,219,0.3)]' // Glow effect on wrapper
                    >
                        <StartButton href='/pricing' variant='shimmer'>
                            Get Started
                        </StartButton>
                    </div>
                </motion.div>
            </div>
        </section>
    );
};
