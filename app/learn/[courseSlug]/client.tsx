"use client";

import { Background } from "@/components/Backgrounds/Background";
import Link from "next/link";
import { useState } from "react";
import {
	FaArrowLeft,
	FaBook,
	FaChartLine,
	FaChevronDown,
	FaGraduationCap,
	FaLightbulb,
	FaPlay,
	FaRocket,
	FaTools,
} from "react-icons/fa";

const CourseIcon = ({ icon }: { icon: string }) => {
	const icons = {
		FaChartLine,
		FaBook,
		FaGraduationCap,
		FaTools,
		FaRocket,
	};
	const IconComponent = icons[icon as keyof typeof icons] || FaBook;
	return <IconComponent className="h-8 w-8 text-blue-400" />;
};

interface Lesson {
	_id: string;
	title: string;
	description: string;
	slug: string;
}

interface Chapter {
	_id: string;
	title: string;
	description: string;
	slug: string;
	lessons: Lesson[];
}

interface Course {
	_id: string;
	title: string;
	description: string;
	slug: string;
	icon: string;
	chapters: Chapter[];
	difficulty: string;
	estimatedTime: string;
}

export default function CourseClient({ course }: { course: Course }) {
	return (
		<div className="relative min-h-screen w-full overflow-hidden bg-black">
			<Background />

			<div className="relative">
				{/* Hero Section */}
				<div className="mx-auto mt-32 max-w-5xl px-6 sm:px-8 lg:px-12">
					<div className="mb-16 flex items-start gap-6">
						<div className="rounded-2xl bg-blue-400/10 p-4">
							<CourseIcon icon={course.icon} />
						</div>
						<div className="flex-1 space-y-4">
							<h1 className="font-outfit bg-gradient-to-br from-white via-white to-neutral-300 bg-clip-text text-4xl font-bold tracking-tight text-transparent sm:text-5xl">
								{course.title}
							</h1>
							<p className="max-w-2xl text-lg text-neutral-400">
								{course.description}
							</p>
							<div className="flex flex-wrap items-center gap-6">
								<div className="flex items-center gap-2">
									<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-400/10 text-sm text-blue-400">
										{course.chapters.length}
									</div>
									<span className="text-sm text-neutral-400">Chapters</span>
								</div>
								{course.difficulty && (
									<div className="flex items-center gap-2">
										<FaLightbulb className="h-5 w-5 text-blue-400" />
										<span className="text-sm text-neutral-400 capitalize">
											{course.difficulty}
										</span>
									</div>
								)}
								{course.estimatedTime && (
									<div className="flex items-center gap-2">
										<span className="text-sm text-neutral-400">
											{course.estimatedTime}
										</span>
									</div>
								)}
							</div>
						</div>
					</div>

					{/* Course Modules */}
					<div className="space-y-8">
						<h2 className="font-outfit text-2xl font-semibold text-white">
							Course Content
						</h2>
						<div className="space-y-4">
							{course.chapters?.map((chapter, chapterIndex) => (
								<div
									key={chapter._id}
									className="overflow-hidden rounded-xl border border-white/10 bg-white/5 transition-all duration-300 hover:border-blue-500/20 hover:bg-blue-500/5"
								>
									<div className="p-6">
										<div className="flex items-center gap-4">
											<div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-400/10 text-lg font-semibold text-blue-400">
												{chapterIndex + 1}
											</div>
											<div className="flex-1">
												<h3 className="text-lg font-medium text-white">
													{chapter.title}
												</h3>
												{chapter.description && (
													<p className="mt-1 text-sm text-neutral-400">
														{chapter.description}
													</p>
												)}
											</div>
											<div className="flex items-center gap-2 text-sm text-neutral-400">
												<div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-400/10 text-xs text-blue-400">
													{chapter.lessons.length}
												</div>
												<span>Lessons</span>
											</div>
										</div>
									</div>

									<div className="border-t border-white/5">
										{chapter.lessons.map((lesson, lessonIndex) => (
											<Link
												key={lesson._id}
												href={`/learn/${course.slug}/${lesson.slug}`}
												className="flex items-center gap-4 border-b border-white/5 p-4 last:border-b-0 hover:bg-blue-500/5"
											>
												<div className="flex h-6 w-6 items-center justify-center rounded-full bg-blue-400/10 text-sm text-blue-400">
													{lessonIndex + 1}
												</div>
												<div className="flex-1">
													<h4 className="text-white">{lesson.title}</h4>
													{lesson.description && (
														<p className="mt-1 text-sm text-neutral-400">
															{lesson.description}
														</p>
													)}
												</div>
												<FaPlay className="h-4 w-4 text-blue-400" />
											</Link>
										))}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</div>
		</div>
	);
}
