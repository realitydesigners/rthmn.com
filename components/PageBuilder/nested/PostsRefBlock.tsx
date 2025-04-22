'use client';

import React from 'react';
import Link from 'next/link';

interface PostsCardLightProps {
    slug: string;
    heading: string;
    image: string;
}

const PostsCardLight: React.FC<PostsCardLightProps> = ({ slug, heading, image }) => {
    return (
        <div className='flex w-full items-center justify-center px-4 py-4'>
            <div className='bg-linear-to-r group flex h-auto w-full flex-row rounded-lg from-blue-200/10 to-blue-200/5 p-3 shadow-lg transition-shadow duration-300 hover:shadow-xl md:w-1/3 lg:w-1/3'>
                <img src={image} alt={heading} className='h-[80px] max-w-[80px] rounded-[.5em] object-cover' />
                <div className='relative flex w-3/4 flex-col pl-4'>
                    <p className='bg-linear-to-r mb-2 from-blue-100/50 to-blue-100/50 bg-clip-text pt-2 text-xs uppercase leading-none tracking-wide text-transparent'>
                        Related Post
                    </p>

                    <Link
                        className='bg-linear-to-r duration-3 from-blue-100/100 to-blue-100/90 bg-clip-text text-2xl font-bold leading-[1.2em] text-transparent transition-colors group-hover:text-neutral-100 group-hover:underline'
                        href={`/posts/${slug}`}>
                        {heading}
                    </Link>
                </div>
            </div>
        </div>
    );
};

const PostsRefBlock: React.FC<PostsCardLightProps> = ({ slug, heading, image }) => {
    return <PostsCardLight slug={slug} heading={heading} image={image} />;
};

export default PostsRefBlock;
