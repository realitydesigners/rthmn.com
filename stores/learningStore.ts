import { create } from 'zustand';
import { persist } from 'zustand/middleware';

interface CourseProgress {
    courseId: string;
    status: 'not-started' | 'in-progress' | 'completed';
    moduleProgress: Record<string, ModuleProgress>;
    lastAccessed: Date;
}

interface ModuleProgress {
    moduleId: string;
    status: 'not-started' | 'in-progress' | 'completed';
    completedLessons: string[];
    quizScores: {
        lessonId: string;
        score: number;
        completedAt: Date;
        attempts: number;
    }[];
}

interface LearningState {
    courseProgress: Record<string, CourseProgress>;
    currentCourse: string | null;
    currentModule: string | null;
    currentLesson: string | null;
    overallProgress: number;

    // Actions
    startCourse: (courseId: string) => void;
    startModule: (courseId: string, moduleId: string) => void;
    completeLesson: (courseId: string, moduleId: string, lessonId: string) => void;
    submitQuiz: (courseId: string, moduleId: string, lessonId: string, score: number) => void;
    setCurrentCourse: (courseId: string | null) => void;
    setCurrentModule: (moduleId: string | null) => void;
    setCurrentLesson: (lessonId: string | null) => void;
    resetProgress: () => void;
    calculateOverallProgress: () => void;
}

export const useLearningStore = create<LearningState>()(
    persist(
        (set, get) => ({
            courseProgress: {},
            currentCourse: null,
            currentModule: null,
            currentLesson: null,
            overallProgress: 0,

            startCourse: (courseId: string) => {
                set((state) => ({
                    courseProgress: {
                        ...state.courseProgress,
                        [courseId]: {
                            courseId,
                            status: 'in-progress',
                            moduleProgress: {},
                            lastAccessed: new Date(),
                        },
                    },
                }));
            },

            startModule: (courseId: string, moduleId: string) => {
                set((state) => {
                    const course = state.courseProgress[courseId] || {
                        courseId,
                        status: 'in-progress',
                        moduleProgress: {},
                        lastAccessed: new Date(),
                    };

                    return {
                        courseProgress: {
                            ...state.courseProgress,
                            [courseId]: {
                                ...course,
                                moduleProgress: {
                                    ...course.moduleProgress,
                                    [moduleId]: {
                                        moduleId,
                                        status: 'in-progress',
                                        completedLessons: [],
                                        quizScores: [],
                                    },
                                },
                                lastAccessed: new Date(),
                            },
                        },
                    };
                });
            },

            completeLesson: (courseId: string, moduleId: string, lessonId: string) => {
                set((state) => {
                    const course = state.courseProgress[courseId] || {
                        courseId,
                        status: 'in-progress',
                        moduleProgress: {},
                        lastAccessed: new Date(),
                    };

                    const module = course.moduleProgress[moduleId] || {
                        moduleId,
                        status: 'in-progress',
                        completedLessons: [],
                        quizScores: [],
                    };

                    const completedLessons = [...module.completedLessons];
                    if (!completedLessons.includes(lessonId)) {
                        completedLessons.push(lessonId);
                    }

                    return {
                        courseProgress: {
                            ...state.courseProgress,
                            [courseId]: {
                                ...course,
                                moduleProgress: {
                                    ...course.moduleProgress,
                                    [moduleId]: {
                                        ...module,
                                        completedLessons,
                                    },
                                },
                                lastAccessed: new Date(),
                            },
                        },
                    };
                });
                get().calculateOverallProgress();
            },

            submitQuiz: (courseId: string, moduleId: string, lessonId: string, score: number) => {
                set((state) => {
                    const course = state.courseProgress[courseId] || {
                        courseId,
                        status: 'in-progress',
                        moduleProgress: {},
                        lastAccessed: new Date(),
                    };

                    const module = course.moduleProgress[moduleId] || {
                        moduleId,
                        status: 'in-progress',
                        completedLessons: [],
                        quizScores: [],
                    };

                    const quizScores = [...module.quizScores];
                    const existingQuizIndex = quizScores.findIndex((q) => q.lessonId === lessonId);

                    if (existingQuizIndex >= 0) {
                        quizScores[existingQuizIndex] = {
                            ...quizScores[existingQuizIndex],
                            score,
                            completedAt: new Date(),
                            attempts: quizScores[existingQuizIndex].attempts + 1,
                        };
                    } else {
                        quizScores.push({
                            lessonId,
                            score,
                            completedAt: new Date(),
                            attempts: 1,
                        });
                    }

                    return {
                        courseProgress: {
                            ...state.courseProgress,
                            [courseId]: {
                                ...course,
                                moduleProgress: {
                                    ...course.moduleProgress,
                                    [moduleId]: {
                                        ...module,
                                        quizScores,
                                    },
                                },
                                lastAccessed: new Date(),
                            },
                        },
                    };
                });
                get().calculateOverallProgress();
            },

            setCurrentCourse: (courseId: string | null) => {
                set({ currentCourse: courseId });
            },

            setCurrentModule: (moduleId: string | null) => {
                set({ currentModule: moduleId });
            },

            setCurrentLesson: (lessonId: string | null) => {
                set({ currentLesson: lessonId });
            },

            resetProgress: () => {
                set({
                    courseProgress: {},
                    currentCourse: null,
                    currentModule: null,
                    currentLesson: null,
                    overallProgress: 0,
                });
            },

            calculateOverallProgress: () => {
                const state = get();
                const courses = Object.values(state.courseProgress);
                if (courses.length === 0) {
                    set({ overallProgress: 0 });
                    return;
                }

                const totalProgress = courses.reduce((courseAcc, course) => {
                    const modules = Object.values(course.moduleProgress);
                    if (modules.length === 0) return courseAcc;

                    const courseProgress = modules.reduce((moduleAcc, module) => {
                        const isComplete = module.status === 'completed' || (module.completedLessons.length > 0 && module.quizScores.every((quiz) => quiz.score >= 70));
                        return moduleAcc + (isComplete ? 1 : module.completedLessons.length / (module.completedLessons.length + 1));
                    }, 0);

                    return courseAcc + courseProgress / modules.length;
                }, 0);

                set({ overallProgress: (totalProgress / courses.length) * 100 });
            },
        }),
        {
            name: 'rthmn-learning-progress',
        }
    )
);
