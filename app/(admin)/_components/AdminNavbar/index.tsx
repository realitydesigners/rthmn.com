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
import { ConnectionBadge } from '@/components/Badges/ConnectionBadge';

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
                {/* Left section */}
                <div className='flex items-center'>
                    <Link href='/admin' className='group relative z-[110] flex items-center gap-2 rounded-lg p-1.5'>
                        <div className='flex h-7 w-7 items-center'>
                            <LogoIcon />
                        </div>
                        <span className='font-russo tracking ml-2 text-[16px] text-white'>RTHMN</span>
                    </Link>

                    <p className='font-kodemono pl-1 text-[8px] font-bold text-zinc-400'>LAB</p>
                </div>

                {/* Center section - Navigation Links */}
                <div className='absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2'>
                    <div className='font-kodemono flex items-center gap-2'>
                        <Link
                            href='/admin'
                            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                                pathname === '/admin' ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:text-zinc-200'
                            }`}>
                            Monitor
                        </Link>
                        <Link
                            href='/admin/tests'
                            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                                pathname === '/admin/tests' ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:text-zinc-200'
                            }`}>
                            Tests
                        </Link>
                        <Link
                            href='/admin/settings'
                            className={`rounded-md px-3 py-1.5 text-xs transition-colors ${
                                pathname === '/admin/settings' ? 'bg-green-500/10 text-green-400' : 'text-zinc-400 hover:text-zinc-200'
                            }`}>
                            Settings
                        </Link>
                    </div>
                </div>

                {/* Right section */}
                <div className='flex items-center gap-4'>
                    <ConnectionBadge isConnected={isConnected} />
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
                    </div>
                </div>
            </div>
        </nav>
    );
}
