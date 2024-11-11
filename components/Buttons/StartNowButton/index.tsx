import Link from 'next/link';
import type { FC } from 'react';

interface StartButtonProps {
  href: string;
  children?: React.ReactNode;
}

export const StartButton: FC<StartButtonProps> = ({
  href,
  children = 'Start Now'
}) => {
  return (
    <Link
      href={href}
      className="flex items-center justify-center space-x-3 rounded-md bg-gradient-to-r from-green-600 to-emerald-600 p-[2px] font-outfit text-white transition-all duration-200 hover:scale-[1.02] hover:from-green-500 hover:to-emerald-500"
    >
      <span className="flex w-full items-center justify-center rounded-md bg-gradient-to-r from-green-400 to-emerald-400 px-5 py-3 text-2xl font-bold text-black lg:text-2xl">
        {children}
      </span>
    </Link>
  );
};
