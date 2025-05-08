"use client";
import { generateHeadingId } from "@/app/learn/_components/TOC";
import AudioRefBlock from "../nested/AudioRefBlock";
import BoxCourseVisualizer from "../nested/BoxCourseVisualizer";
import Callout from "../nested/Callout";
import ImageRefBlock from "../nested/ImageRefBlock";
import InternalLink from "../nested/InternalLink";
import PostsRefBlock from "../nested/PostsRefBlock";
import Quiz from "../nested/Quiz";
import QuoteRefBlock from "../nested/QuoteRefBlock";
import VideoRefBlock from "../nested/VideoRefBlock";

import type { PortableTextComponents } from "@portabletext/react";

export const CourseTemplate: PortableTextComponents = {
	block: {
		normal: ({ children }) => (
			<div className="mb-4 w-full flex justify-center">
				<p className="font-outfit text-xl leading-relaxed primary-text max-w-2xl w-full">
					{children}
				</p>
			</div>
		),
		h1: ({ children }) => {
			const id = generateHeadingId(children?.toString() || "");
			return (
				<div className="w-full flex justify-center">
					<h1
						id={id}
						className="font-outfit text-3xl w-full max-w-2xl leading-[1.25em] font-bold primary-text lg:text-6xl"
					>
						{children}
					</h1>
				</div>
			);
		},
		h2: ({ children }) => {
			const id = generateHeadingId(children?.toString() || "");
			return (
				<div className="w-full flex justify-center">
					<h2
						id={id}
						className="font-outfit mb-4 w-full max-w-2xl scroll-mt-24 text-2xl leading-[1.25em] font-bold primary-text"
					>
						{children}
					</h2>
				</div>
			);
		},
		h3: ({ children }) => {
			const id = generateHeadingId(children?.toString() || "");
			return (
				<div className="w-full flex justify-center">
					<h3
						id={id}
						className="font-outfit mb-3 w-full max-w-2xl scroll-mt-24 text-xl leading-[1.25em] font-bold primary-text"
					>
						{children}
					</h3>
				</div>
			);
		},
		h4: ({ children }) => {
			const id = generateHeadingId(children?.toString() || "");
			return (
				<div className="mb-6 w-full flex justify-center">
					<h4
						id={id}
						className="font-outfit mb-2 scroll-mt-24 text-lg leading-relaxed font-bold primary-text"
					>
						{children}
					</h4>
				</div>
			);
		},
		bullet: ({ children }) => (
			<div className="mb-4 w-full flex justify-center">
				<li className="font-outfit py-1 leading-relaxed primary-text marker:text-white">
					{children}
				</li>
			</div>
		),
		number: ({ children }) => (
			<div className="mb-4 w-full flex justify-center">
				<li className="font-outfit py-1 leading-relaxed primary-text marker:text-white">
					{children}
				</li>
			</div>
		),
	},
	list: {
		bullet: ({ children }) => (
			<div className="mb-4 w-full flex justify-center">
				<ul className="font-outfit w-full list-disc space-y-1 pr-4 pl-8 primary-text">
					{children}
				</ul>
			</div>
		),
		number: ({ children }) => (
			<div className="mb-4 w-full flex justify-center">
				<ol className="font-outfit w-full list-decimal space-y-1 pr-4 pl-8 primary-text">
					{children}
				</ol>
			</div>
		),
	},
	marks: {
		strong: ({ children }) => (
			<strong className="font-bold primary-text">{children}</strong>
		),
		em: ({ children }) => <em className="primary-text italic">{children}</em>,
		code: ({ children }) => (
			<code className="rounded-sm bg-neutral-800/50 px-1.5 py-0.5 font-mono text-sm text-pink-400">
				{children}
			</code>
		),
		link: ({ children, value }) => (
			<a
				href={value?.href}
				className="font-bold text-white underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				{children}
			</a>
		),
	},
	types: {
		postsRef: ({ value }) => (
			<PostsRefBlock
				slug={value.postsRef?.postsSlug}
				heading={value.postsRef?.postsHeading}
				image={value.postsRef?.postsImage}
			/>
		),
		videoRef: ({ value }) => (
			<VideoRefBlock
				videoTitle={value.videoRef?.videoTitle}
				videoUrl={value.videoRef?.videoUrl}
				className={value.videoRef?.className}
			/>
		),
		imageRef: ({ value }) => (
			<ImageRefBlock image={value.image} className={value.className} />
		),
		audioRef: ({ value }) => (
			<AudioRefBlock
				audioFileUrl={value.audioRefData?.audioFileUrl}
				audioTitle={value.audioRefData?.audioTitle}
			/>
		),
		quoteRef: ({ value }) => (
			<QuoteRefBlock
				quote={value.quoteRef?.quoteTitle}
				image={value.quoteRef?.quoteImage}
				className={value.quoteRef?.className}
			/>
		),
		callout: ({ value }) => (
			<Callout type={value.type} title={value.title} points={value.points} />
		),
		quiz: ({ value }) => (
			<Quiz
				question={value.question}
				options={value.options}
				correctAnswer={value.correctAnswer}
				explanation={value.explanation}
			/>
		),
		boxVisualizer: ({ value }) => {
			console.log("BoxVisualizer raw value:", value);
			const boxVisualizerValue = {
				title: value.title,
				description: value.description,
				mode: value.mode,
				showLabels: value.showLabels,
				sequencesData: value.sequencesData,
				baseValuesData: value.baseValuesData,
				colorScheme: value.colorScheme,
				animationSpeed: value.animationSpeed,
				pauseDuration: value.pauseDuration,
			};
			console.log("BoxVisualizer processed value:", boxVisualizerValue);
			return <BoxCourseVisualizer value={boxVisualizerValue} />;
		},
	},
};
