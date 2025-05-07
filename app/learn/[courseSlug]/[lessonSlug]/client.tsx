"use client";

import type { BlockProps } from "@/components/PageBuilder/blocks/Blocks";
import { CourseTemplate } from "@/components/PageBuilder/templates/CourseTemplate";
import { useCourseProgressStore } from "@/stores/courseProgressStore";
import { PortableText } from "@portabletext/react";
import { motion } from "framer-motion";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import {
	FaArrowLeft,
	FaArrowRight,
	FaBookmark,
	FaCheckCircle,
	FaClock,
	FaPlay,
} from "react-icons/fa";

interface LessonClientProps {
	course: any; // Add proper type
	lesson: any; // Add proper type
	chapter: any; // Add proper type
}

const LessonHeader = ({
	lesson,
	currentLessonIndex,
	totalLessons,
}: {
	lesson: any;
	currentLessonIndex: number;
	totalLessons: number;
}) => {
	return (
		<div className="mb-12">
			<div className="flex items-center gap-6 text-sm text-neutral-400">
				<div className="flex items-center gap-2.5">
					<div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] ring-1 ring-white/[0.08] ring-inset">
						<FaClock className="h-3.5 w-3.5 text-white/70" />
					</div>
					<span>{lesson.estimatedTime || "15 min read"}</span>
				</div>
				<div className="flex items-center gap-2.5">
					<div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/[0.08] ring-1 ring-white/[0.08] ring-inset">
						<FaBookmark className="h-3.5 w-3.5 text-white/70" />
					</div>
					<span>
						Lesson {currentLessonIndex + 1} of {totalLessons}
					</span>
				</div>
			</div>
		</div>
	);
};

const LessonFooter = ({
	course,
	chapter,
	lesson,
	nextLesson,
	prevLesson,
	completed,
	onToggleComplete,
}: {
	course: any;
	chapter: any;
	lesson: any;
	nextLesson: any;
	prevLesson: any;
	completed: boolean;
	onToggleComplete: () => void;
}) => {
	const [isLoading, setIsLoading] = useState(false);
	const [showConfetti, setShowConfetti] = useState(false);

	const handleComplete = async () => {
		if (completed) {
			onToggleComplete();
			return;
		}

		setIsLoading(true);
		await new Promise((resolve) => setTimeout(resolve, 600));
		onToggleComplete();
		setShowConfetti(true);
		setIsLoading(false);
		setTimeout(() => setShowConfetti(false), 2000);
	};

	return (
		<>
			<style jsx global>{`
                @keyframes shimmer {
                    0% {
                        background-position: 200% 50%;
                    }
                    100% {
                        background-position: -100% 50%;
                    }
                }
                .grid-bg {
                    background-size: 60px 60px;
                    background-image: 
                        linear-gradient(to right, rgba(255, 255, 255, 0.05) 1px, transparent 1px),
                        linear-gradient(to bottom, rgba(255, 255, 255, 0.05) 1px, transparent 1px);
                }
            `}</style>
			<div className="relative mt-12 py-20 p-8 grid-bg">
				<div className="relative flex items-center justify-between gap-8">
					<motion.button
						type="button"
						onClick={handleComplete}
						disabled={isLoading}
						className={`group relative flex min-w-[180px] items-center justify-center gap-2.5 rounded-full bg-blue-500 px-6 py-3 text-[13px] font-medium text-white transition-all duration-300 hover:bg-[#0066CC] ${
							completed ? "bg-opacity-20 hover:bg-opacity-30" : ""
						} shadow-[0_0_20px_rgba(0,115,230,0.15)]`}
						whileTap={{ scale: 0.98 }}
					>
						{isLoading ? (
							<div className="flex items-center gap-2">
								<svg
									className="h-4 w-4 animate-spin"
									viewBox="0 0 24 24"
									role="presentation"
									aria-hidden="true"
								>
									<circle
										className="opacity-25"
										cx="12"
										cy="12"
										r="10"
										stroke="currentColor"
										strokeWidth="4"
										fill="none"
									/>
									<path
										className="opacity-75"
										fill="currentColor"
										d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
									/>
								</svg>
								<span>Marking as Complete...</span>
							</div>
						) : (
							<>
								<FaCheckCircle className="h-4 w-4" />
								{completed ? "Completed" : "Mark as Complete"}
							</>
						)}
					</motion.button>

					{nextLesson && (
						<Link
							href={`/learn/${course.slug}/${nextLesson.slug}`}
							className="group relative flex-col flex w-[400px] items-end gap-4 rounded-2xl bg-black p-4 transition-all duration-300 hover:bg-[linear-gradient(180deg,rgba(0,115,230,0.03)_0%,rgba(0,115,230,0.01)_100%)] before:absolute before:inset-0 before:rounded-2xl before:bg-[linear-gradient(120deg,transparent_0%,rgba(0,115,230,0)_10%,rgba(0,115,230,0.1)_45%,rgba(0,115,230,0.05)_55%,rgba(0,115,230,0.1)_80%,rgba(0,115,230,0)_90%,transparent_100%)] before:bg-[length:400%_100%] before:animate-[shimmer_12s_linear_infinite] shadow-[0_0_30px_rgba(0,115,230,0.1)] hover:shadow-[0_0_30px_rgba(0,115,230,0.2)] ring-1 ring-white/5"
						>
							<div className="flex items-center gap-4">
								<div className="flex h-12 w-12 items-center justify-center rounded-xl bg-[#0073E6]/20 text-[#0073E6] shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)] group-hover:bg-[#0073E6]/30 group-hover:text-[#0073E6] transition-all duration-300">
									<FaPlay className="h-4 w-4 translate-x-0.5" />
								</div>
								<div className="flex-1 min-w-0">
									<div className="flex items-center gap-3 text-[11px] font-medium uppercase tracking-wider text-[#666666] group-hover:text-[#0073E6]/70 transition-all duration-300">
										<span>Next up</span>
										<div className="flex items-center gap-1.5">
											<FaClock className="h-3 w-3" />
											<span>{nextLesson.estimatedTime || "15 min read"}</span>
										</div>
									</div>
									<h3 className="mt-1 text-xl font-medium text-white truncate group-hover:text-white/90">
										{nextLesson.title}
									</h3>
									<p className="mt-1 text-xs text-white/60">
										{course.description}
									</p>
								</div>
							</div>
							<div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#0073E6]/10 text-[#0073E6] transition-all duration-300 group-hover:translate-x-1 group-hover:bg-[#0073E6]/20 shadow-[inset_0_1px_0px_rgba(255,255,255,0.1)]">
								<FaArrowRight className="h-4 w-4" />
							</div>
						</Link>
					)}
				</div>
			</div>
		</>
	);
};

export default function LessonClient({
	course,
	lesson,
	chapter,
}: LessonClientProps) {
	const store = useCourseProgressStore();

	// Subscribe to completion status changes
	const completed = store.isLessonCompleted(
		course._id,
		chapter._id,
		lesson._id,
	);

	useEffect(() => {
		if (!store.courses[course._id]) {
			store.initializeCourse(course._id, course.chapters);
		}
	}, [course, store.courses, store.initializeCourse]);

	const handleToggleComplete = useCallback(() => {
		if (completed) {
			store.uncompleteLesson(course._id, chapter._id, lesson._id);
		} else {
			store.completeLesson(course._id, chapter._id, lesson._id);
		}
	}, [course._id, chapter._id, lesson._id, completed, store]);

	// Find current lesson index and next/prev lessons
	const currentLessonIndex = chapter.lessons.findIndex(
		(l: any) => l._id === lesson._id,
	);
	const nextLesson = chapter.lessons[currentLessonIndex + 1];
	const prevLesson = chapter.lessons[currentLessonIndex - 1];

	return (
		<div className="w-full px-4 pt-20 pb-6">
			<LessonHeader
				lesson={lesson}
				currentLessonIndex={currentLessonIndex}
				totalLessons={chapter.lessons.length}
			/>

			{lesson.courseContent?.content && (
				<PortableText
					value={lesson.courseContent?.content}
					components={CourseTemplate}
				/>
			)}

			<LessonFooter
				course={course}
				chapter={chapter}
				lesson={lesson}
				nextLesson={nextLesson}
				prevLesson={prevLesson}
				completed={completed}
				onToggleComplete={handleToggleComplete}
			/>
		</div>
	);
}
