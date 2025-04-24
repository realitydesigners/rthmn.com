import { motion } from 'framer-motion';
import Link from 'next/link';
import type { FC } from 'react';

interface StartButtonProps {
    href: string;
    children?: React.ReactNode;
    custom?: number;
}

export const StartButton: FC<StartButtonProps> = ({ href, children = 'Start Now', custom = 0 }) => {
    const combinedVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: {
            opacity: 1,
            y: 0,
            boxShadow: [
                '0 0 5px rgba(255, 255, 255, 0.1)',
                '0 0 15px rgba(255, 255, 255, 0.3)',
                '0 0 5px rgba(255, 255, 255, 0.1)',
            ],
            transition: {
                opacity: { delay: custom * 0.1, duration: 0.3 },
                y: { delay: custom * 0.1, duration: 0.3 },
                boxShadow: {
                    duration: 3,
                    repeat: Number.POSITIVE_INFINITY,
                    ease: 'easeInOut',
                },
            },
        },
    };

    return (
        <motion.div
            variants={combinedVariants}
            initial='hidden'
            animate='visible'
            custom={custom}
            whileTap={{ scale: 0.97 }}
            className='inline-block rounded-full'
        >
            <Link
                href={href}
                className='group font-outfit relative flex items-center overflow-hidden rounded-full bg-linear-to-b from-[#FFFFFF] to-[#D0D0D0]/50 p-[1.5px] text-black transition-colors duration-300 hover:from-[#F0F0F0] hover:via-[#E0E0E0] hover:to-[#C0C0C0]/50'
            >
                <span className='absolute top-0 -left-full h-full w-1/2 -skew-x-12 transform bg-gradient-to-r from-transparent via-white/40 to-transparent opacity-90 transition-transform duration-500 ease-in-out group-hover:translate-x-[250%]'></span>

                <span className='relative flex w-full items-center space-x-3 rounded-full bg-linear-to-b from-[#FAFAFA] to-[#F0F0F0] px-6 py-3 text-2xl font-bold shadow-[inset_0_2px_5px_rgba(0,0,0,0.2),inset_0_-2px_2px_rgba(0,0,0,0.2)]'>
                    {children}
                </span>
            </Link>
        </motion.div>
    );
};
