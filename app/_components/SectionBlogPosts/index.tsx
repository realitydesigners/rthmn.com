'use client';

import { useState, useEffect } from 'react';
import { oxanium, russo, outfit, kodeMono } from '@/fonts';
import Image from 'next/image';
import Link from 'next/link';
import { motion, HTMLMotionProps } from 'framer-motion';

export interface Post {
  slug: { current: string };
  block: {
    heading?: string;
    subheading?: string;
    publicationDate?: string;
    imageRef?: {
      imageUrl: string;
      imageAlt: string;
    };
  }[];
}

interface PostListProps {
  initialPosts: Post[];
}

const FormattedDate: React.FC<{ date?: string; className?: string }> = ({
  date,
  className
}) => {
  const formattedDate = date
    ? new Date(date).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'short',
        day: 'numeric'
      })
    : 'Date not available';

  return <span className={className}>{formattedDate}</span>;
};

interface CustomMotionDivProps extends HTMLMotionProps<'div'> {
  className?: string; // Add this line
}

const CustomMotionDiv: React.FC<CustomMotionDivProps> = motion.div;

const PostItem: React.FC<{ post: Post; index: number }> = ({ post, index }) => {
  const block = post.block[0];

  const motionProps: CustomMotionDivProps = {
    className:
      'group flex h-full flex-col overflow-hidden rounded-lg border border-[#181818] shadow-lg transition-all duration-300 hover:scale-105',
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay: index * 0.1 }
  };

  return (
    <CustomMotionDiv {...motionProps}>
      {block?.imageRef && (
        <div className="relative h-48 w-full overflow-hidden">
          <Image
            src={block.imageRef.imageUrl}
            alt={block.imageRef.imageAlt || 'Post image'}
            width={500}
            height={500}
            className="transition-transform duration-300 group-hover:scale-110"
          />
        </div>
      )}
      <div className="flex flex-grow flex-col p-4">
        <FormattedDate
          date={block?.publicationDate}
          className={`${kodeMono.className} mb-2 text-xs font-semibold text-gray-500`}
        />
        <Link href={`/posts/${post.slug.current}`}>
          <h2
            className={`${outfit.className} mb-3 text-2xl font-bold text-white transition-colors duration-200 hover:text-[#76FFD6]`}
          >
            {block?.heading || 'No title'}
          </h2>
        </Link>
        <p
          className={`${kodeMono.className} mb-4 line-clamp-3 flex-grow text-sm text-gray-400`}
        >
          {block?.subheading || 'No subheading'}
        </p>
        <Link
          href={`/posts/${post.slug.current}`}
          className={` ${kodeMono.className} self-start rounded-full bg-gradient-to-b from-[#333333] to-[#181818] px-4 py-2 pb-3 text-sm font-semibold text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]`}
        >
          Read More
        </Link>
      </div>
    </CustomMotionDiv>
  );
};

export function SectionBlogPosts({ initialPosts }: PostListProps) {
  const [posts, setPosts] = useState<Post[]>([]);

  useEffect(() => {
    const uniquePosts = initialPosts.filter(
      (post, index, self) =>
        index === self.findIndex((t) => t.slug.current === post.slug.current)
    );
    setPosts(uniquePosts);
  }, [initialPosts]);

  return (
    <div
      className={`mt-16 flex w-full flex-col px-4 py-8 sm:px-6 sm:py-24 lg:px-32 ${kodeMono.className}`}
    >
      <h2
        className={`mb-12 text-center text-4xl font-bold text-white lg:text-left ${outfit.className}`}
      >
        Latest Posts
      </h2>
      <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostItem key={post.slug.current} post={post} index={index} />
        ))}
      </div>
    </div>
  );
}
