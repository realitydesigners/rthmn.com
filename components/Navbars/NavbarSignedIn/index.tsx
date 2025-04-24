'use client';

import { LogoIcon } from '@/components/Icons/icons';
import { useWebSocket } from '@/providers/WebsocketProvider';
import type { User } from '@supabase/supabase-js';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuChevronRight, LuHelpCircle, LuLayoutDashboard, LuOrbit } from 'react-icons/lu';
import { ConnectionBadge } from '../../Badges/ConnectionBadge';
import { GridControl } from '../../Panels/BoxDataPanel/GridControl';

interface NavbarSignedInProps {
    user: User | null;
}

export const NavbarSignedIn: React.FC<NavbarSignedInProps> = ({ user }) => {
    const pathname = usePathname();
    const { isConnected } = useWebSocket();

    // Get icon for path segment
    const getSegmentIcon = (segment: string) => {
        switch (segment.toLowerCase()) {
            case 'dashboard':
                return <LuLayoutDashboard size={14} />;
            case 'test':
                return <LuOrbit size={14} />;
            default:
                return null;
        }
    };

    const formatPathname = (path: string) => {
        if (path === '/') return 'Home';
        return path
            .split('/')
            .filter(Boolean)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));
    };

    const pathSegments = formatPathname(pathname);

    return (
        <nav className='fixed top-0 right-0 left-0 z-[100] h-16 border-b border-[#121212] bg-[#0a0a0a] p-1 lg:flex lg:h-14'>
            <div className='group relative z-[110] h-full w-full'>
                <div className='relative flex h-full w-full items-center justify-between rounded-lg px-2'>
                    {/* Left section */}
                    <div className='relative z-[1] flex items-center gap-3'>
                        <div className='flex items-center'>
                            <Link
                                href='/dashboard'
                                className='group relative z-[110] flex items-center gap-2 rounded-lg p-1.5'
                            >
                                <div className='flex h-7 w-7 items-center'>
                                    <LogoIcon />
                                </div>
                                <span className='font-russo tracking ml-2 text-[16px] text-white'>RTHMN</span>
                            </Link>
                        </div>
                        {/* Breadcrumb */}
                        <div className='flex hidden items-center text-[#818181] lg:flex'>
                            {Array.isArray(pathSegments) ? (
                                pathSegments.map((segment, index) => (
                                    <div key={index} className='flex items-center gap-1.5'>
                                        <div className='flex items-center gap-1.5 rounded-md px-1.5 py-1'>
                                            {getSegmentIcon(segment) && (
                                                <span className='text-[#666]'>{getSegmentIcon(segment)}</span>
                                            )}
                                            <span className='font-kodemono text-[10px] font-bold font-medium tracking-widest text-neutral-200/50 uppercase'>
                                                {segment}
                                            </span>
                                        </div>
                                        {index < pathSegments.length - 1 && (
                                            <LuChevronRight size={14} className='text-[#444]' />
                                        )}
                                    </div>
                                ))
                            ) : (
                                <span className='font-mono text-[11px] font-medium tracking-wider text-neutral-200/50 uppercase'>
                                    {pathSegments}
                                </span>
                            )}
                        </div>
                    </div>

                    {/* Center section - GridControl */}
                    <div className='absolute top-1/2 left-1/2 hidden -translate-x-1/2 -translate-y-1/2 lg:block'>
                        <GridControl />
                    </div>

                    {/* Right section - Connection Status */}
                    <div className='relative z-[110] flex items-center gap-2'>
                        <Link href='/support' className='flex h-4 w-4 items-center justify-center'>
                            <LuHelpCircle className='h-4 w-4 text-[#818181] group-hover:text-white' />
                        </Link>
                        <ConnectionBadge isConnected={isConnected} />
                    </div>
                </div>
            </div>
        </nav>
    );
};
