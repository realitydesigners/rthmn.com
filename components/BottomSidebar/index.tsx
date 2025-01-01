'use client';
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { LuLayoutDashboard, LuOrbit } from 'react-icons/lu';

export const BottomSidebar = () => {
    const [isDesktop, setIsDesktop] = useState(false);
    const isProduction = process.env.NODE_ENV === 'production';

    // Handle screen size changes
    useEffect(() => {
        const checkDesktop = () => {
            setIsDesktop(window.innerWidth >= 1024); // lg breakpoint
        };

        // Initial check
        checkDesktop();

        // Add resize listener
        window.addEventListener('resize', checkDesktop);

        return () => window.removeEventListener('resize', checkDesktop);
    }, []);

    // Only render on desktop
    if (!isDesktop) return null;

    return (
        <div className='fixed bottom-4 left-1/2 z-[100] flex -translate-x-1/2 transform items-center gap-2 rounded-full border border-[#222] bg-black/90 px-2 py-2 backdrop-blur-md'>
            <Link href='/dashboard' className='group relative flex items-center justify-center'>
                <div className='relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 group-hover:scale-105 group-hover:from-[#444444] group-hover:to-[#282828]'>
                    <div className='flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]'>
                        <LuLayoutDashboard size={18} className='text-[#818181] transition-colors group-hover:text-white' />
                    </div>
                </div>
                <span className='font-kodemono pointer-events-none absolute -top-7 rounded-md bg-black/90 px-2 py-1 text-[9px] font-medium tracking-widest whitespace-nowrap text-[#666] uppercase opacity-0 transition-all group-hover:opacity-100'>
                    Dashboard
                </span>
            </Link>

            {!isProduction && (
                <>
                    <Link href='/test' className='group relative flex items-center justify-center'>
                        <div className='relative flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 group-hover:scale-105 group-hover:from-[#444444] group-hover:to-[#282828]'>
                            <div className='flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818]'>
                                <LuOrbit size={18} className='text-[#818181] transition-colors group-hover:text-white' />
                            </div>
                        </div>
                        <span className='font-kodemono pointer-events-none absolute -top-7 rounded-md bg-black/90 px-2 py-1 text-[9px] font-medium tracking-widest whitespace-nowrap text-[#666] uppercase opacity-0 transition-all group-hover:opacity-100'>
                            Universe
                        </span>
                    </Link>
                </>
            )}
        </div>
    );
};
