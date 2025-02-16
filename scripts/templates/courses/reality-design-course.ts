/**
 * Reality Design Course Definition
 *
 * This file defines the structure and content of the Reality Design course.
 * It works with our PortableText generation system to create structured content
 * that gets processed by the generateCourse.ts script.
 *
 * Architecture Overview:
 * - Each lesson is built using PortableTextBuilder
 * - Lessons contain structured blocks (H1, Text, Callout, etc.)
 * - The course structure is used to generate Sanity.io documents
 * - Content relationships are maintained through references
 */

import { WhatIsRealityDesign } from '../lessons/what-is-reality-design';

export const realityDesignCourse = {
    title: 'Reality Design & Consciousness',
    description: 'Master the art of reality design and discover practical reality designing principles',
    chapters: [
        {
            title: 'Foundations of Reality',
            order: 1,
            lessons: [
                /**
                 * Lesson Structure:
                 * - title: Display name of the lesson
                 * - order: Sequence in the chapter
                 * - lesson: Reference to the PortableText content builder
                 *
                 * When generateCourse.ts runs:
                 * 1. Creates Sanity documents for each lesson
                 * 2. Generates proper slugs and references
                 * 3. Builds relationship structure between course, chapters, and lessons
                 */
                { title: 'What is Reality Design?', order: 1, lesson: WhatIsRealityDesign },
                // { title: 'The Nature of Consciousness', order: 2 },
                // { title: 'Quantum Reality & Observer Effect', order: 3 },
                // { title: 'The Holographic Universe', order: 4 },
                // { title: 'Time, Space, and Consciousness', order: 5 },
                // { title: 'The Role of Perception', order: 6 },
                // { title: 'Reality as Information', order: 7 },
                // { title: 'The Mystery of Being', order: 8 },
            ],
        },
    ],
};
