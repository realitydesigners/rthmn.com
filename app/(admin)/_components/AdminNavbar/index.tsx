'use client';

import { useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { LuChevronRight, LuLayoutDashboard } from 'react-icons/lu';
import { LogoIcon } from '@/components/Icons/icons';
import { useAuth } from '@/providers/SupabaseProvider';
import { useWebSocket } from '@/providers/WebsocketProvider';
import { createClient } from '@/utils/supabase/client';

const ConnectionStatus = ({ isConnected }: { isConnected: boolean }) => {
    return (
        <div className='flex items-center gap-2 rounded-full border border-[#222] bg-black/50 px-3 py-1.5'>
            <div className='relative flex items-center'>
                <div className={`h-2 w-2 rounded-full ${isConnected ? 'bg-green-500' : 'bg-red-500'}`} />
                {isConnected && (
                    <>
                        <div className='absolute h-2 w-2 animate-ping rounded-full bg-green-500/40' />
                        <div className='absolute -inset-1 h-4 w-4 animate-pulse rounded-full bg-green-500/10' />
                    </>
                )}
            </div>
            <span className={`text-xs font-medium ${isConnected ? 'text-green-400' : 'text-red-400'}`}>{isConnected ? 'Connected' : 'Disconnected'}</span>
        </div>
    );
};

export function AdminNavbar() {
    const pathname = usePathname();
    const { isConnected } = useWebSocket();
    const { session, signOut } = useAuth();
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const [isSigningOut, setIsSigningOut] = useState(false);
    const dropdownRef = useRef<HTMLDivElement>(null);

    const userInitial = session?.user?.user_metadata?.full_name?.[0].toUpperCase() || session?.user?.email?.[0].toUpperCase() || '?';

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!session?.user) return;

            const supabase = createClient();
            const { data: userDetails } = await supabase.from('users').select('avatar_url').eq('id', session.user.id).single();

            if (userDetails?.avatar_url) {
                setAvatarUrl(userDetails.avatar_url);
            }
        };

        fetchUserDetails();
    }, [session]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const handleSignOut = async () => {
        setIsSigningOut(true);
        try {
            await signOut();
        } catch (error) {
            console.error('Error signing out:', error);
        } finally {
            setIsSigningOut(false);
        }
    };

    // Format the pathname for breadcrumb
    const formatPathname = (path: string) => {
        if (path === '/') return 'Home';
        return path
            .split('/')
            .filter(Boolean)
            .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1));
    };

    const pathSegments = formatPathname(pathname);

    return (
        <nav className='fixed top-0 right-0 left-0 z-[100] flex h-14 border-b border-[#121212] bg-black px-2'>
            <div className='relative flex h-full w-full items-center justify-between rounded-lg px-2'>
                <div className='relative z-[1] flex items-center gap-3'>
                    <Link href='/admin' className='group relative z-[110] flex items-center gap-2 rounded-lg p-1.5 transition-colors hover:bg-white/[0.03]'>
                        <div className='flex h-7 w-7 items-center transition-transform duration-200 group-hover:scale-105'>
                            <LogoIcon />
                        </div>
                    </Link>
                    {/* Breadcrumb */}
                    <div className='flex items-center gap-1.5 text-[#818181]'>
                        {Array.isArray(pathSegments) ? (
                            pathSegments.map((segment, index) => (
                                <div key={index} className='flex items-center gap-1.5'>
                                    <div className='flex items-center gap-1.5 rounded-md px-1.5 py-1 transition-colors hover:bg-white/[0.03]'>
                                        <LuLayoutDashboard size={14} className='text-[#666]' />
                                        <span className='font-kodemono text-[10px] font-medium tracking-widest text-gray-200/50 uppercase'>{segment}</span>
                                    </div>
                                    {index < pathSegments.length - 1 && <LuChevronRight size={14} className='text-[#444]' />}
                                </div>
                            ))
                        ) : (
                            <span className='font-mono text-[11px] font-medium tracking-wider text-gray-200/50 uppercase'>{pathSegments}</span>
                        )}
                    </div>
                </div>

                <div className='flex items-center gap-4'>
                    <ConnectionStatus isConnected={isConnected} />

                    <div className='relative' ref={dropdownRef}>
                        <button
                            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                            className='group flex h-9 w-9 items-center justify-center rounded-full bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] transition-all duration-200 hover:from-[#444444] hover:to-[#282828]'>
                            <div className='flex h-full w-full items-center justify-center rounded-full bg-gradient-to-b from-[#0A0A0A] to-[#181818] transition-all group-hover:from-[#141414] group-hover:to-[#1c1c1c]'>
                                <div className='relative flex h-7 w-7 items-center justify-center overflow-hidden rounded-full bg-black'>
                                    {avatarUrl ? (
                                        <Image src={avatarUrl} alt='Profile' className='object-cover' width={80} height={80} />
                                    ) : (
                                        <span className='text-xs font-bold'>{userInitial}</span>
                                    )}
                                </div>
                            </div>
                        </button>
                        {isDropdownOpen && (
                            <div className='animate-in fade-in slide-in-from-top-1 absolute right-0 mt-2 w-64 rounded-lg border border-[#222] bg-black/95 shadow-xl backdrop-blur-xl'>
                                <div className='py-1' role='menu' aria-orientation='vertical' aria-labelledby='options-menu'>
                                    <Link href='/account' className='flex items-center gap-2 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5' role='menuitem'>
                                        Account
                                    </Link>
                                    <button
                                        onClick={handleSignOut}
                                        disabled={isSigningOut}
                                        className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-white/5'
                                        role='menuitem'>
                                        {isSigningOut ? 'Signing out...' : 'Sign out'}
                                    </button>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </nav>
    );
}
