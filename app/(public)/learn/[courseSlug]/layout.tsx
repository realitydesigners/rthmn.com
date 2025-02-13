import { getCourse } from '@/utils/sanity/lib/queries';
import { Background } from '@/app/(public)/_components/Background';
import { CourseNav } from './CourseNav';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface LayoutProps {
    children: React.ReactNode;
    params: {
        courseSlug: string;
    };
}

export default async function CourseLayout({ children, params }: LayoutProps) {
    const course = await getCourse(params.courseSlug);

    if (!course) {
        notFound();
    }

    return (
        <div className='relative min-h-screen w-full overflow-hidden bg-black'>
            <div className='relative flex'>
                {/* Left Sidebar */}
                <div className='fixed top-0 left-0 h-screen w-72 border-r border-white/10 bg-black/50 backdrop-blur-xl'>
                    <div className='flex h-full flex-col'>
                        <div className='p-6'>
                            <Link href='/learn' className='text-lg font-semibold text-white hover:text-emerald-400'>
                                Learning Center
                            </Link>
                        </div>

                        <div className='flex-1 overflow-y-auto px-4 pb-8'>
                            <CourseNav course={course} />
                        </div>
                    </div>
                </div>

                {/* Main content */}
                <div className='flex-1 pr-72 pl-72'>
                    <div className='min-h-screen'>{children}</div>
                </div>
            </div>
        </div>
    );
}
