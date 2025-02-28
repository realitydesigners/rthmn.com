import { CourseStructure } from './base-course';
import { WhatIsForexTradingLesson } from '../lessons/what-is-forex-trading';
import { registerLessons } from '../utils/lesson-discovery';

// Define the initial set of lessons for each chapter
// In the future, these could be auto-discovered using the discoverLessons function
const introToTradingLessons = registerLessons([
    WhatIsForexTradingLesson,
    // Other lessons would be imported and added here
]);

export const forexFoundationsCourse: CourseStructure = {
    metadata: {
        title: 'Forex Foundations',
        description: 'Master the core principles of forex trading through a comprehensive journey from basic concepts to practical trading psychology',
        difficulty: 'beginner',
        icon: 'FaChartLine',
        order: 1,
    },
    chapters: [
        {
            metadata: {
                title: 'Introduction to Trading',
                description: 'Learn the fundamentals of forex markets and trading psychology',
                order: 1,
            },
            lessons: introToTradingLessons,
        },
        {
            metadata: {
                title: 'Market Mechanics',
                description: 'Understand how forex markets function and price action basics',
                order: 2,
            },
            lessons: [],
        },
        {
            metadata: {
                title: 'Essential Trading Concepts',
                description: 'Master risk management and position sizing fundamentals',
                order: 3,
            },
            lessons: [],
        },
        {
            metadata: {
                title: 'Pattern Recognition',
                description: 'Learn to identify and trade high-probability patterns',
                order: 4,
            },
            lessons: [],
        },
        {
            metadata: {
                title: 'Trading Psychology Mastery',
                description: 'Develop mental resilience and trading discipline',
                order: 5,
            },
            lessons: [],
        },
        {
            metadata: {
                title: 'Practical Trading Framework',
                description: 'Build a complete trading system and management strategy',
                order: 6,
            },
            lessons: [],
        },
        {
            metadata: {
                title: 'Market Analysis',
                description: 'Master technical and contextual market analysis',
                order: 7,
            },
            lessons: [],
        },
        {
            metadata: {
                title: 'Advanced Trading Concepts',
                description: 'Explore institutional trading methods and advanced techniques',
                order: 8,
            },
            lessons: [],
        },
        {
            metadata: {
                title: 'Market Psychology Deep Dive',
                description: 'Understand mass psychology and institutional behavior',
                order: 9,
            },
            lessons: [],
        },
        {
            metadata: {
                title: 'Professional Trading',
                description: 'Build and manage a professional trading business',
                order: 10,
            },
            lessons: [],
        },
    ],
};
