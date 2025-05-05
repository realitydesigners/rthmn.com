"use client";

import { motion } from "framer-motion";
import Image from "next/image";
import Link from "next/link";
import { useEffect, useState } from "react";
import { FaArrowRight, FaCalendar, FaClock } from "react-icons/fa";

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

const PostCard = ({ post, index }: { post: Post; index: number }) => {
	const block = post.block[0];

	return (
		<motion.div
			initial={{ opacity: 0, y: 20 }}
			whileInView={{ opacity: 1, y: 0 }}
			viewport={{ once: true }}
			transition={{ duration: 0.5, delay: index * 0.1 }}
		>
			<motion.div
				whileHover={{ y: -5 }}
				className="group relative h-full overflow-hidden rounded-xl border border-white/10 bg-black/40 backdrop-blur-md transition-colors duration-300 hover:border-white/20 hover:bg-black/60"
			>
				{/* Subtle Glow Effect */}
				<div className="pointer-events-none absolute inset-0">
					<div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
					<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
				</div>

				{block?.imageRef && (
					<div className="relative h-64 w-full overflow-hidden">
						<Image
							src={block.imageRef.imageUrl}
							alt={block.imageRef.imageAlt || "Post image"}
							fill
							className="object-cover transition-all duration-500 group-hover:scale-110"
						/>
						<div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-60" />

						{/* Hover Overlay - More subtle */}
						<div className="absolute inset-0 bg-white/5 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
					</div>
				)}

				<div className="relative z-10 p-6">
					{/* Meta Information */}
					<div className="mb-4 flex items-center gap-4 text-xs text-neutral-400">
						<div className="flex items-center gap-2">
							<FaCalendar className="h-3 w-3 text-neutral-400" />
							<span className="font-kodemono">
								{new Date(block?.publicationDate).toLocaleDateString("en-US", {
									year: "numeric",
									month: "short",
									day: "numeric",
								})}
							</span>
						</div>
						<div className="flex items-center gap-2">
							<FaClock className="h-3 w-3 text-neutral-400" />
							<span className="font-kodemono">5 min read</span>
						</div>
					</div>

					{/* Title */}
					<Link href={`/posts/${post.slug.current}`}>
						<h3 className="font-outfit mb-3 text-2xl font-bold tracking-tight text-white transition-colors duration-300 group-hover:text-white">
							{block?.heading || "No title"}
						</h3>
					</Link>

					{/* Description */}
					<p className="font-kodemono mb-6 line-clamp-2 text-sm leading-relaxed text-neutral-400">
						{block?.subheading || "No subheading"}
					</p>

					{/* Read More Button - Updated to match NavButton style */}
					<Link href={`/posts/${post.slug.current}`}>
						<motion.div
							whileHover={{ x: 5 }}
							className="flex w-fit items-center rounded-full bg-linear-to-b from-[#333333] to-[#181818] p-[1px] text-white transition-all duration-200 hover:from-[#444444] hover:to-[#282828]"
						>
							<span className="flex w-full items-center gap-2 rounded-full bg-linear-to-b from-[#0A0A0A] to-[#181818] px-4 py-2 text-sm">
								<span>Read Article</span>
								<FaArrowRight className="h-3 w-3" />
							</span>
						</motion.div>
					</Link>
				</div>
			</motion.div>
		</motion.div>
	);
};

export function SectionBlogPosts({ initialPosts }: { initialPosts: Post[] }) {
	const [posts, setPosts] = useState<Post[]>([]);

	useEffect(() => {
		setPosts(initialPosts);
	}, [initialPosts]);

	return (
		<section className="relative z-10 min-h-screen overflow-hidden px-4 py-32">
			{/* Background Effects - More subtle */}
			<div className="pointer-events-none absolute inset-0 -z-10">
				<div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
			</div>

			<div className="mx-auto max-w-7xl">
				{/* Section Header */}
				<motion.div
					initial={{ opacity: 0, y: 20 }}
					whileInView={{ opacity: 1, y: 0 }}
					viewport={{ once: true }}
					className="mb-16 text-center"
				>
					<h2 className="text-neutral-gradient font-outfit mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
						Latest Insights
					</h2>
					<p className="font-kodemono mx-auto max-w-2xl text-base text-neutral-400 sm:text-lg">
						Explore our latest thoughts on market analysis, trading strategies,
						and technological innovations.
					</p>
				</motion.div>

				{/* Posts Grid */}
				<div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
					{posts.map((post, index) => (
						<PostCard key={post.slug.current} post={post} index={index} />
					))}
				</div>
			</div>
		</section>
	);
}
