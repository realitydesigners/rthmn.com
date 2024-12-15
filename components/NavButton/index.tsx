import Link from 'next/link';
import type { FC } from 'react';
import { motion } from 'framer-motion';

interface NavButtonProps {
    href: string;
    children: React.ReactNode;
    onMouseEnter?: () => void;
    onClick?: () => void;
    custom?: number;
}

const buttonVariants = {
    hidden: { opacity: 0, y: -20 },
    visible: (custom: number) => ({
        opacity: 1,
        y: 0,
        transition: { delay: custom * 0.1, duration: 0.3 },
    }),
};

export const NavButton: FC<NavButtonProps> = ({ href, children, onMouseEnter, onClick, custom = 0 }) => {
    return (
        <div className='relative flex h-20 items-center px-2 transition-colors duration-200 hover:text-gray-600' onMouseEnter={onMouseEnter}>
            <motion.div variants={buttonVariants} initial='hidden' animate='visible' custom={custom}>
                <Link
                    href={href}
                    className='flex items-center rounded-full bg-linear-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]'
                    onClick={onClick}>
                    <span className='flex w-full items-center space-x-3 rounded-full bg-linear-to-b from-[#0A0A0A] to-[#181818] px-4 py-2 text-sm'>{children}</span>
                </Link>
            </motion.div>
        </div>
    );
};
