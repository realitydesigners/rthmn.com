import Link from 'next/link';
import type { FC } from 'react';
import { MotionDiv } from '@/components/MotionDiv';

interface StartButtonProps {
  href: string;
  children?: React.ReactNode;
  custom?: number;
}

const buttonVariants = {
  hidden: { opacity: 0, y: -20 },
  visible: (custom: number) => ({
    opacity: 1,
    y: 0,
    transition: { delay: custom * 0.1, duration: 0.3 }
  })
};

export const StartButton: FC<StartButtonProps> = ({
  href,
  children = 'Start Now',
  custom = 0
}) => {
  return (
    <MotionDiv
      variants={buttonVariants}
      initial="hidden"
      animate="visible"
      custom={custom}
    >
      <Link
        href={href}
        className="flex items-center rounded-full bg-gradient-to-b from-[#FFFFFF] to-[#D0D0D0]/50 p-[1.5px] font-outfit text-black transition-all duration-200 hover:from-[#F0F0F0] hover:via-[#E0E0E0] hover:to-[#C0C0C0]/50"
      >
        <span className="flex w-full items-center space-x-3 rounded-full bg-gradient-to-b from-[#FAFAFA] to-[#F0F0F0] px-6 py-3 text-2xl font-bold shadow-[inset_0_2px_5px_rgba(0,0,0,0.2),inset_0_-2px_2px_rgba(0,0,0,0.2)]">
          {children}
        </span>
      </Link>
    </MotionDiv>
  );
};
