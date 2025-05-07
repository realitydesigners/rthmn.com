import { produce } from "immer";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface Progress {
	completed: boolean;
	completedAt?: string;
}

interface CourseProgress {
	courseId: string;
	progress: Progress;
	chapters: {
		[chapterId: string]: Progress & {
			lessons: {
				[lessonId: string]: Progress;
			};
		};
	};
}

interface CourseProgressState {
	courses: {
		[courseId: string]: CourseProgress;
	};
	// Actions
	completeLesson: (
		courseId: string,
		chapterId: string,
		lessonId: string,
	) => void;
	uncompleteLesson: (
		courseId: string,
		chapterId: string,
		lessonId: string,
	) => void;
	isLessonCompleted: (
		courseId: string,
		chapterId: string,
		lessonId: string,
	) => boolean;
	isChapterCompleted: (courseId: string, chapterId: string) => boolean;
	isCourseCompleted: (courseId: string) => boolean;
	getProgress: (courseId: string) => number;
	initializeCourse: (
		courseId: string,
		chapters: { _id: string; lessons: { _id: string }[] }[],
	) => void;
}

export const useCourseProgressStore = create<CourseProgressState>()(
	persist(
		(set, get) => ({
			courses: {},

			initializeCourse: (courseId, chapters) => {
				set((state) => {
					if (state.courses[courseId]) return state;

					const courseProgress: CourseProgress = {
						courseId,
						progress: { completed: false },
						chapters: {},
					};

					chapters.forEach((chapter) => {
						courseProgress.chapters[chapter._id] = {
							completed: false,
							lessons: {},
						};

						chapter.lessons.forEach((lesson) => {
							courseProgress.chapters[chapter._id].lessons[lesson._id] = {
								completed: false,
							};
						});
					});

					return {
						courses: {
							...state.courses,
							[courseId]: courseProgress,
						},
					};
				});
			},

			completeLesson: (courseId, chapterId, lessonId) => {
				set((state) => {
					const course = state.courses[courseId];
					if (!course) return state;

					// Create new state with completed lesson
					const newCourse = {
						...course,
						chapters: {
							...course.chapters,
							[chapterId]: {
								...course.chapters[chapterId],
								lessons: {
									...course.chapters[chapterId].lessons,
									[lessonId]: {
										completed: true,
										completedAt: new Date().toISOString(),
									},
								},
							},
						},
					};

					// Check if chapter is completed
					const allLessonsCompleted = Object.values(
						newCourse.chapters[chapterId].lessons,
					).every((lesson) => lesson.completed);

					if (allLessonsCompleted) {
						newCourse.chapters[chapterId] = {
							...newCourse.chapters[chapterId],
							completed: true,
							completedAt: new Date().toISOString(),
						};
					}

					// Check if course is completed
					const allChaptersCompleted = Object.values(newCourse.chapters).every(
						(chapter) => chapter.completed,
					);

					if (allChaptersCompleted) {
						newCourse.progress = {
							completed: true,
							completedAt: new Date().toISOString(),
						};
					}

					// Return new state object
					return {
						courses: {
							...state.courses,
							[courseId]: newCourse,
						},
					};
				});
			},

			uncompleteLesson: (courseId, chapterId, lessonId) => {
				set((state) => {
					const course = state.courses[courseId];
					if (!course) return state;

					return {
						courses: {
							...state.courses,
							[courseId]: {
								...course,
								progress: { completed: false },
								chapters: {
									...course.chapters,
									[chapterId]: {
										...course.chapters[chapterId],
										completed: false,
										lessons: {
											...course.chapters[chapterId].lessons,
											[lessonId]: {
												completed: false,
											},
										},
									},
								},
							},
						},
					};
				});
			},

			isLessonCompleted: (courseId, chapterId, lessonId) => {
				const state = get();
				return (
					state.courses[courseId]?.chapters[chapterId]?.lessons[lessonId]
						?.completed || false
				);
			},

			isChapterCompleted: (courseId, chapterId) => {
				const state = get();
				return state.courses[courseId]?.chapters[chapterId]?.completed || false;
			},

			isCourseCompleted: (courseId) => {
				const state = get();
				return state.courses[courseId]?.progress.completed || false;
			},

			getProgress: (courseId) => {
				const state = get();
				const course = state.courses[courseId];
				if (!course) return 0;

				let completedLessons = 0;
				let totalLessons = 0;

				Object.values(course.chapters).forEach((chapter) => {
					Object.values(chapter.lessons).forEach((lesson) => {
						totalLessons++;
						if (lesson.completed) completedLessons++;
					});
				});

				return totalLessons === 0 ? 0 : (completedLessons / totalLessons) * 100;
			},
		}),
		{
			name: "course-progress",
		},
	),
);
