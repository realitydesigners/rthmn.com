import { BaseLesson } from '../lessons/base-lesson';

export interface CourseMetadata {
    title: string;
    description: string;
    difficulty: 'beginner' | 'intermediate' | 'advanced';
    icon: string;
    order: number;
    slug?: string;
}

export interface ChapterMetadata {
    title: string;
    description: string;
    order: number;
}

export interface CourseStructure {
    metadata: CourseMetadata;
    chapters: {
        metadata: ChapterMetadata;
        lessons: Array<{ new (): BaseLesson }>;
    }[];
}

export function generateCourseSlug(title: string): string {
    return title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-+|-+$/g, '');
}
