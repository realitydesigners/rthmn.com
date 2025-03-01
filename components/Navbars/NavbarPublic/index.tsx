import Link from 'next/link';

export const NavbarPublic = () => {
    return (
        <nav className='fixed top-0 z-50 w-full border-b border-gray-800 bg-black/50 backdrop-blur-xl'>
            <div className='mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8'>
                {/* Logo */}
                <div className='flex items-center'>
                    <Link href='/' className='flex items-center'>
                        <span className='font-outfit text-xl font-bold tracking-wider text-white'>RTHMN</span>
                    </Link>
                </div>

                {/* Navigation Links */}
                <div className='hidden gap-4 md:flex'>
                    <Link href='/pricing' className='text-sm text-gray-300 hover:text-white'>
                        Pricing
                    </Link>
                    <Link href='/about' className='text-sm text-gray-300 hover:text-white'>
                        About
                    </Link>
                </div>
            </div>
        </nav>
    );
};
