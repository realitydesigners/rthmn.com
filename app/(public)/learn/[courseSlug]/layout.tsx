import { getCourse } from '@/utils/sanity/lib/queries';
import { CourseNav } from '../_components/CourseNavigation';
import { notFound } from 'next/navigation';
import Link from 'next/link';

interface LayoutProps {
    children: React.ReactNode;
    params: Promise<{
        courseSlug: string;
    }>;
}

export default async function CourseLayout({ children, params }: LayoutProps) {
    // Await the params before using courseSlug
    const resolvedParams = await params;
    const course = await getCourse(resolvedParams.courseSlug);

    if (!course) {
        notFound();
    }

    return (
        <div className='relative min-h-screen w-full overflow-hidden bg-black'>
            <div className='relative flex'>
                {/* Left Sidebar */}
                <div className='fixed top-0 left-0 h-screen w-72 border-r border-white/10 bg-black/50 backdrop-blur-xl'>
                    <div className='flex h-full flex-col'>
                        <CourseNav course={course} />
                    </div>
                </div>

                {/* Main content */}
                <div className='ml-80 flex-1'>
                    <div className='w-full'>{children}</div>
                </div>
            </div>
        </div>
    );
}
