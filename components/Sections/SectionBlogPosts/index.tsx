'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { MotionDiv } from '../../MotionDiv';
import { FaArrowRight } from 'react-icons/fa';

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

const PostItem: React.FC<{ post: Post; index: number }> = ({ post, index }) => {
  const block = post.block[0];

  return (
    <MotionDiv
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className="group relative overflow-hidden rounded-xl bg-linear-to-b from-white/5 to-transparent p-[1px]"
    >
      <div className="relative h-full rounded-xl border border-white/10 bg-black/90 backdrop-blur-md">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/50 to-transparent" />
        </div>

        {block?.imageRef && (
          <div className="relative h-48 w-full overflow-hidden rounded-t-xl">
            <Image
              src={block.imageRef.imageUrl}
              alt={block.imageRef.imageAlt || 'Post image'}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-110"
            />
            <div className="absolute inset-0 bg-linear-to-t from-black/60 to-transparent" />
          </div>
        )}

        <div className="flex flex-col space-y-3 p-5">
          <FormattedDate
            date={block?.publicationDate}
            className="font-kodemono text-xs font-medium text-[#22c55e]"
          />

          <Link href={`/posts/${post.slug.current}`}>
            <h2 className="font-outfit text-xl font-bold text-white/90 transition-colors duration-200 group-hover:text-[#22c55e]">
              {block?.heading || 'No title'}
            </h2>
          </Link>

          <p className="line-clamp-2 font-kodemono text-sm text-white/70">
            {block?.subheading || 'No subheading'}
          </p>

          <Link
            href={`/posts/${post.slug.current}`}
            className="inline-flex items-center space-x-2 text-sm font-medium text-[#22c55e] transition-all duration-200 hover:text-[#22c55e]/80"
          >
            <span>Read More</span>
            <FaArrowRight className="h-3 w-3 transition-transform duration-200 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </MotionDiv>
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
    <section className="relative z-100 px-8 px-[5vw] py-12 xl:px-[15vw] 2xl:px-[15vw]">
      <div className="mb-6 border-b border-white/5 pb-2">
        <h2 className="text-2xl font-bold text-white/90">Latest Posts</h2>
      </div>

      <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        {posts.map((post, index) => (
          <PostItem key={post.slug.current} post={post} index={index} />
        ))}
      </div>
    </section>
  );
}
