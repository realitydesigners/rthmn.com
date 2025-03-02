interface TourButtonProps {
    onClick?: () => void;
    children?: React.ReactNode;
}

export function TourButton({ onClick, children = 'Continue' }: TourButtonProps) {
    return (
        <button
            onClick={onClick}
            className='group relative flex items-center justify-center overflow-hidden rounded-xl border border-[#3FFFA2]/20 bg-gradient-to-b from-[#3FFFA2]/10 via-[#3FFFA2]/5 to-transparent px-6 py-2.5 text-sm font-medium text-[#3FFFA2] shadow-[0_0_15px_rgba(63,255,162,0.15)] transition-all duration-300 hover:border-[#3FFFA2]/30 hover:text-[#3FFFA2] hover:shadow-[0_0_25px_rgba(63,255,162,0.25)] active:scale-[0.98]'>
            {/* Glow overlay */}
            <div className='absolute inset-0 rounded-xl bg-[#3FFFA2]/[0.03] opacity-0 transition-opacity duration-300 group-hover:opacity-100' />
            {/* Top highlight */}
            <div className='absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#3FFFA2]/20 to-transparent' />
            {/* Bottom highlight */}
            <div className='absolute inset-x-0 bottom-0 h-px bg-gradient-to-r from-transparent via-[#3FFFA2]/10 to-transparent' />
            <span className='font-outfit relative'>{children}</span>
        </button>
    );
}
