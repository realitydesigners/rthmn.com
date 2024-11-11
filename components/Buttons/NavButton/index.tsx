import Link from 'next/link';
import type { FC } from 'react';

interface NavButtonProps {
  href: string;
  children: React.ReactNode;
  onMouseEnter?: () => void;
}

export const NavButton: FC<NavButtonProps> = ({
  href,
  children,
  onMouseEnter
}) => {
  return (
    <div
      className="relative flex h-20 items-center px-2 transition-colors duration-200 hover:text-gray-600"
      onMouseEnter={onMouseEnter}
    >
      <Link
        href={href}
        className="flex items-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]"
      >
        <span className="flex w-full items-center space-x-3 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-4 py-2 text-sm">
          {children}
        </span>
      </Link>
    </div>
  );
};
