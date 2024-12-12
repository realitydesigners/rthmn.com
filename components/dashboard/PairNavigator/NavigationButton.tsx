import { NavigationButtonProps } from './types';

export const NavigationButton = ({
  icon: Icon,
  isActive,
  onClick,
  label
}: NavigationButtonProps) => {
  return (
    <button onClick={onClick} className="group relative flex items-center">
      <div
        className={`group flex h-10 w-full items-center justify-center rounded-full bg-gradient-to-b p-[1px] transition-all duration-200 ${
          isActive
            ? 'from-[#444444] to-[#282828]'
            : 'from-[#333333] to-[#181818] hover:from-[#444444] hover:to-[#282828]'
        }`}
      >
        <div
          className={`font-outfit flex h-full w-full items-center justify-center gap-2 rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-4 py-2 font-medium ${
            isActive ? 'text-gray-200' : 'text-[#818181]'
          }`}
        >
          <Icon size={14} />
          {label}
        </div>
      </div>
    </button>
  );
};
