import fs from 'fs';
import path from 'path';
import { BaseLesson } from '../lessons/base-lesson';

/**
 * Dynamically discover and import lessons from a directory
 * @param chapterSlug - The chapter slug to find lessons for
 * @returns Array of lesson classes ordered by their defined order
 */
export async function discoverLessons(chapterSlug: string): Promise<Array<{ new (): BaseLesson }>> {
    const lessonDir = path.join(process.cwd(), 'scripts', 'templates', 'lessons', chapterSlug);

    // Check if directory exists
    if (!fs.existsSync(lessonDir)) {
        console.warn(`No lessons directory found for chapter: ${chapterSlug}`);
        return [];
    }

    const lessonFiles = fs.readdirSync(lessonDir).filter((file) => file.endsWith('.ts') && !file.startsWith('index'));

    // Import all lesson files and collect their exports
    const lessons: Array<{ new (): BaseLesson }> = [];

    for (const file of lessonFiles) {
        try {
            const module = await import(path.join(lessonDir, file));

            // Find the first export that is a BaseLesson class
            const LessonClass = Object.values(module).find((exp) => typeof exp === 'function' && exp.prototype instanceof BaseLesson) as { new (): BaseLesson } | undefined;

            if (LessonClass) {
                lessons.push(LessonClass);
            }
        } catch (error) {
            console.error(`Error importing lesson from ${file}:`, error);
        }
    }

    // Sort lessons by their defined order
    return lessons.sort((a, b) => {
        const aInstance = new a();
        const bInstance = new b();
        return aInstance.getMetadata().order - bInstance.getMetadata().order;
    });
}

/**
 * Helper to manually register lessons for a chapter when automatic discovery isn't used
 * @param lessons - Array of lesson classes
 * @returns The same array, sorted by order
 */
export function registerLessons(lessons: Array<{ new (): BaseLesson }>): Array<{ new (): BaseLesson }> {
    return lessons.sort((a, b) => {
        const aInstance = new a();
        const bInstance = new b();
        return aInstance.getMetadata().order - bInstance.getMetadata().order;
    });
}
