'use client';
import Link from 'next/link';
import type { FC } from 'react';
import Image from 'next/image';
import { usePathname } from 'next/navigation';
import { useState, useRef, useEffect } from 'react';
import styles from './styles.module.css';
import { AnimatePresence } from 'motion/react';
import { User } from '@supabase/supabase-js';
import { useAuth } from '@/providers/SupabaseProvider';
import { motion } from 'framer-motion';
import { LogoIcon, MenuIcon } from '@/components/Icons/icons';
import { allLinks, LinkItem } from './allLinks';
import { createClient } from '@/utils/supabase/client';

interface NavbarSignedOutProps {
    user: User | null;
}

const Links = () => {
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    const [activeDropdown, setActiveDropdown] = useState<string | null>(null);

    const handleMouseEnter = (dropdown: string) => {
        setActiveDropdown(dropdown);
    };

    const handleMouseLeave = () => {
        setActiveDropdown(null);
    };

    const handleLinkClick = () => {
        setActiveDropdown(null);
    };

    return (
        <div className='group relative' onMouseLeave={handleMouseLeave}>
            <div className='font-outfit flex'>
                <NavButton href='/pricing' onMouseEnter={() => handleMouseEnter('pricing')} onClick={handleLinkClick} custom={0}>
                    Pricing
                </NavButton>
                <NavButton href='/' onMouseEnter={() => handleMouseEnter('company')} onClick={handleLinkClick} custom={1}>
                    Company
                </NavButton>
                <NavButton href='/' onMouseEnter={() => handleMouseEnter('resources')} onClick={handleLinkClick} custom={3}>
                    Resources
                </NavButton>
            </div>
            <DesktopMenuContent activeDropdown={activeDropdown} onMouseEnter={() => {}} onMouseLeave={handleMouseLeave} onLinkClick={handleLinkClick} />
        </div>
    );
};

const DropdownLink: React.FC<LinkItem & { className?: string }> = ({ title, desc, href, className }) => {
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <Link href={href} className={`${styles.dropdownLink} ${className || ''}`}>
            <div className={styles.dropdownLinkContent}>
                <div className={styles.dropdownLinkTitle}>{title}</div>
                <div className={styles.dropdownLinkDesc}>{desc}</div>
            </div>
        </Link>
    );
};

export function NavbarSignedOut({ user }: NavbarSignedOutProps) {
    const pathname = usePathname();
    const [isNavOpen, setIsNavOpen] = useState(false);
    const [isDropdownOpen, setIsDropdownOpen] = useState(false);
    const [avatarUrl, setAvatarUrl] = useState<string | null>(null);
    const dropdownRef = useRef<HTMLDivElement>(null);
    const { session, signOut } = useAuth();
    const isproduction = process.env.NODE_ENV === 'production';

    useEffect(() => {
        const fetchUserDetails = async () => {
            if (!user) return;

            const supabase = createClient();
            const { data: userDetails } = await supabase.from('users').select('avatar_url').eq('id', user.id).single();

            if (userDetails?.avatar_url) {
                setAvatarUrl(userDetails.avatar_url);
            }
        };

        fetchUserDetails();
    }, [user]);

    useEffect(() => {
        const handleClickOutside = (event: MouseEvent) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
                setIsDropdownOpen(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    useEffect(() => {
        if (isNavOpen) {
            document.body.classList.add('no-scroll');
        } else {
            document.body.classList.remove('no-scroll');
        }
        return () => {
            document.body.classList.remove('no-scroll');
        };
    }, [isNavOpen]);

    // Don't render navbar for user routes
    if (
        pathname?.startsWith('/dashboard') ||
        pathname?.startsWith('/test') ||
        pathname?.startsWith('/admin') ||
        pathname?.startsWith('/pair') ||
        pathname?.startsWith('/account') ||
        pathname?.startsWith('/studio') ||
        pathname?.startsWith('/signals')
    ) {
        return null;
    }

    const handleBackdropClick = () => {
        setIsNavOpen(false);
    };

    const toggleNav = () => {
        setIsNavOpen(!isNavOpen);
    };

    const navVariants = {
        hidden: { opacity: 0, y: -50 },
        visible: {
            opacity: 1,
            y: 0,
            transition: { duration: 0.5, ease: 'easeOut' },
        },
    };

    const linkVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: (custom: number) => ({
            opacity: 1,
            y: 0,
            transition: { delay: custom * 0.1, duration: 0.3 },
        }),
    };

    const handleSignOut = async () => {
        await signOut();
    };

    const userInitial = user?.user_metadata?.full_name?.[0].toUpperCase() || user?.email?.[0].toUpperCase() || '?';

    return (
        <>
            {isNavOpen && !isproduction && (
                <div
                    className='fixed inset-0 z-1000 bg-black/75 backdrop-blur-sm lg:hidden'
                    onClick={handleBackdropClick}
                    onKeyDown={(e) => e.key === 'Escape' && handleBackdropClick()}
                    role='button'
                    tabIndex={0}
                />
            )}

            <motion.div
                className={`fixed top-0 right-0 left-0 z-50 z-1001 h-16 bg-linear-to-b from-black via-black/50 to-transparent font-mono lg:h-20`}
                initial='hidden'
                animate='visible'
                variants={navVariants}>
                <div className='mx-auto h-full w-full lg:w-11/12'>
                    <div className='flex h-full items-center justify-between'>
                        <Link href='/' className='z-50 flex items-center gap-2 pl-4 xl:pl-0'>
                            <div className='flex h-8 w-8 items-center'>
                                <LogoIcon />
                            </div>
                            <div className={`font-russo text-xl lg:text-2xl`}>RTHMN</div>
                        </Link>

                        <div className='flex items-center space-x-4'>
                            {!isproduction && (
                                <nav className='hidden space-x-4 lg:flex'>
                                    <Links />
                                </nav>
                            )}
                        </div>
                        <div className='flex items-center space-x-4 pr-2'>
                            <motion.div className='mr-2 flex' variants={linkVariants} custom={3}>
                                {user ? (
                                    <div className='flex items-center gap-3'>
                                        <Link
                                            href='/dashboard'
                                            className='font-outfit flex items-center justify-center space-x-3 rounded-md bg-linear-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#444444] hover:to-[#282828]'>
                                            <span className='flex w-full items-center justify-center rounded-md bg-linear-to-b from-[#0A0A0A] to-[#181818] px-6 py-3 text-sm font-medium'>
                                                Dashboard
                                            </span>
                                        </Link>
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
                                                        <Link
                                                            href='/account'
                                                            className='flex items-center gap-2 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5'
                                                            role='menuitem'>
                                                            Account
                                                        </Link>
                                                        <button
                                                            onClick={handleSignOut}
                                                            className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-white/5'
                                                            role='menuitem'>
                                                            Sign out
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ) : (
                                    <Link
                                        href='/signin'
                                        className='font-outfit flex items-center justify-center space-x-3 rounded-md bg-linear-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#444444] hover:to-[#282828]'>
                                        <span className='flex w-full items-center justify-center rounded-md bg-linear-to-b from-[#0A0A0A] to-[#181818] px-4 py-2 text-sm font-medium'>
                                            Beta Access
                                        </span>
                                    </Link>
                                )}
                            </motion.div>
                        </div>

                        {/* {!isproduction && (
              <button
                onClick={toggleNav}
                className="menu-icon-button z-50 flex h-14 w-14 items-center justify-center lg:hidden"
                aria-label="Toggle navigation"
              >
                <MenuIcon isOpen={isNavOpen} />
              </button>
            )} */}
                    </div>
                </div>
            </motion.div>

            {/* Mobile Navigation Menu - Only in production */}
            {!isproduction && (
                <AnimatePresence>
                    {isNavOpen && (
                        <motion.div
                            className={`bg-opacity-95 fixed inset-0 z-1000 bg-black pt-16 font-mono backdrop-blur-sm lg:hidden`}
                            initial={{ opacity: 0, y: -100 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -100 }}
                            transition={{ duration: 0.3 }}>
                            <div className='flex h-full flex-col overflow-y-auto px-6'>
                                <MobileMenuContent />
                                <div className='mt-8'>
                                    {user ? (
                                        <div className='flex items-center gap-3'>
                                            <Link
                                                href='/dashboard'
                                                className='font-outfit flex w-full items-center justify-center space-x-3 rounded-md bg-linear-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#444444] hover:to-[#282828]'>
                                                <span className='flex w-full items-center justify-center rounded-md bg-linear-to-b from-[#0A0A0A] to-[#181818] px-4 py-3 text-sm font-medium'>
                                                    Dashbaord
                                                </span>
                                            </Link>
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
                                                            <Link
                                                                href='/account'
                                                                className='flex items-center gap-2 px-4 py-2 text-sm text-gray-300 transition-colors hover:bg-white/5'
                                                                role='menuitem'>
                                                                Account
                                                            </Link>
                                                            <button
                                                                onClick={handleSignOut}
                                                                className='flex w-full items-center gap-2 px-4 py-2 text-left text-sm text-gray-300 transition-colors hover:bg-white/5'
                                                                role='menuitem'>
                                                                Sign out
                                                            </button>
                                                        </div>
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    ) : (
                                        <Link
                                            href='/signin'
                                            className='font-outfit flex w-full items-center justify-center space-x-3 rounded-md bg-linear-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:scale-[1.02] hover:from-[#444444] hover:to-[#282828]'>
                                            <span className='flex w-full items-center justify-center rounded-md bg-linear-to-b from-[#0A0A0A] to-[#181818] px-6 py-3 text-sm font-medium'>
                                                Beta Access
                                            </span>
                                        </Link>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>
            )}
        </>
    );
}

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

interface MenuModalProps {
    activeDropdown: string | null;
    onMouseEnter: () => void;
    onMouseLeave: () => void;
    onLinkClick: () => void;
}

export const DesktopMenuContent = ({ activeDropdown, onMouseEnter, onMouseLeave, onLinkClick }: MenuModalProps) => {
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        if (activeDropdown) {
            setIsVisible(true);
        } else {
            const timer = setTimeout(() => setIsVisible(false), 300);
            return () => clearTimeout(timer);
        }
    }, [activeDropdown]);

    const dropdownVariants = {
        hidden: { opacity: 0, y: -20 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
        exit: { opacity: 0, y: -20, transition: { duration: 0.2 } },
    };

    const contentVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: { staggerChildren: 0.1, delayChildren: 0.2 },
        },
    };

    const itemVariants = {
        hidden: { opacity: 0, y: 10 },
        visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
    };

    const renderDropdownContent = () => {
        const group = allLinks.find((g) => g.title.toLowerCase() === activeDropdown);
        if (!group) return null;

        switch (activeDropdown) {
            case 'pricing':
                return (
                    <div className={`${styles.dropdownContent} font-outfit w-[750px]`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onLinkClick}>
                        <motion.div className='flex w-1/2 flex-col gap-2' variants={contentVariants} initial='hidden' animate='visible'>
                            {group.links.map((item, index) => (
                                <motion.div key={item.title} variants={itemVariants}>
                                    <DropdownLink {...item} />
                                </motion.div>
                            ))}
                        </motion.div>
                        <div className='flex w-1/2 flex-row gap-2'>
                            <div className='h-full w-1/2 bg-[#181818]' />
                            <div className='h-full w-1/2 bg-[#181818]' />
                        </div>
                    </div>
                );
            case 'company':
                return (
                    <div className={`${styles.dropdownContent} font-outfit w-[600px]`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onLinkClick}>
                        <div className='w-1/3 bg-[#181818]' />
                        <motion.div className='flex w-2/3 flex-col gap-2' variants={contentVariants} initial='hidden' animate='visible'>
                            {group.links.map((item, index) => (
                                <motion.div key={item.title} variants={itemVariants}>
                                    <DropdownLink {...item} />
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                );

            case 'resources':
                return (
                    <div className={`${styles.dropdownContent} font-outfit w-[700px]`} onMouseEnter={onMouseEnter} onMouseLeave={onMouseLeave} onClick={onLinkClick}>
                        <motion.div className='flex w-1/2 flex-col gap-2' variants={contentVariants} initial='hidden' animate='visible'>
                            {group.links.map((item, index) => (
                                <motion.div key={item.title} variants={itemVariants}>
                                    <DropdownLink {...item} />
                                </motion.div>
                            ))}
                        </motion.div>
                        <div className='flex w-1/2 flex-col gap-2'>
                            <div className='h-full w-full bg-[#181818]' />
                            <div className='h-full w-full bg-[#181818]' />
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

    return (
        <AnimatePresence>
            {isVisible && (
                <motion.div
                    className={`fixed right-0 left-0 z-50 flex justify-center ${activeDropdown ? styles.active : styles.inactive}`}
                    onMouseEnter={onMouseEnter}
                    onMouseLeave={onMouseLeave}
                    variants={dropdownVariants}
                    initial='hidden'
                    animate='visible'
                    exit='exit'>
                    {renderDropdownContent()}
                </motion.div>
            )}
        </AnimatePresence>
    );
};

export const MobileMenuContent = () => {
    if (process.env.NODE_ENV === 'production') {
        return null;
    }

    return (
        <div className='font-outfit relative z-100 grid grid-cols-2 gap-8 pt-8'>
            {allLinks.map((item) => (
                <div key={item.title} className='flex flex-col'>
                    <h2 className={`mb-2 text-lg text-[#555]`}>{item.title}</h2>
                    {item.links.map((link) => (
                        <Link key={link.title} href='/' className={`heading-text py-2 font-mono text-xl font-bold`}>
                            {link.title}
                        </Link>
                    ))}
                </div>
            ))}
        </div>
    );
};
