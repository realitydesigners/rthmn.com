#!/usr/bin/env bun
import { client } from '@/sanity/lib/client';
import { forexFoundationsCourse } from './templates/courses/forex-foundations-course';
import { CourseStructure, generateCourseSlug } from './templates/courses/base-course';
import { BaseLesson } from './templates/lessons/base-lesson';

/**
 * Generate a random key for Sanity document IDs
 */
export function generateKey(length = 12) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}

/**
 * CourseGenerator handles creating courses, chapters, and lessons in Sanity
 */
class CourseGenerator {
    constructor(private courseStructure: CourseStructure) {}

    /**
     * Generate the entire course structure in Sanity
     */
    async generate() {
        try {
            console.log('=== Starting Course Generation ===\n');
            console.log(`Course: ${this.courseStructure.metadata.title}`);

            // 1. Create the course
            const course = await this.createCourse();

            // 2. Create chapters and lessons
            await this.createChaptersAndLessons(course._id);

            // 3. Final verification
            await this.verifySlugGeneration(course._id);

            this.logSummary();
        } catch (error) {
            console.error('\n❌ Error generating course:', error);
            throw error;
        }
    }

    /**
     * Create the course document in Sanity
     */
    private async createCourse() {
        const { metadata } = this.courseStructure;
        const slug = metadata.slug || generateCourseSlug(metadata.title);

        const course = await client.create({
            _type: 'course',
            title: metadata.title,
            slug: {
                _type: 'slug',
                current: slug,
            },
            description: metadata.description,
            icon: metadata.icon || 'FaBook',
            difficulty: metadata.difficulty || 'beginner',
            order: metadata.order || 1,
        });

        console.log(`✓ Created course: ${course.title} (${course._id})`);
        return course;
    }

    /**
     * Create chapters and lessons for the course
     */
    private async createChaptersAndLessons(courseId: string) {
        console.log('\nCreating Chapters and Lessons');
        console.log('-------------------------');

        for (const chapter of this.courseStructure.chapters) {
            console.log(`\nProcessing chapter: ${chapter.metadata.title}`);

            // Create lessons in Sanity
            const lessonCount = chapter.lessons.length;
            console.log(`Creating ${lessonCount} lessons...`);

            const lessonDocs = await Promise.all(
                chapter.lessons.map(async (LessonClass) => {
                    const lesson = new LessonClass();
                    const metadata = lesson.getMetadata();
                    const content = lesson.getContent();

                    // Create the lesson
                    const lessonDoc = await client.create({
                        _type: 'lesson',
                        title: metadata.title,
                        description: metadata.description,
                        estimatedTime: metadata.estimatedTime,
                        slug: {
                            _type: 'slug',
                            current: metadata.slug,
                        },
                        order: metadata.order,
                        content: content || this.generatePlaceholderContent(metadata.title),
                    });

                    // Verify slug was created
                    await this.verifyLessonSlug(lessonDoc._id, metadata);

                    console.log(`  ✓ Created lesson: ${metadata.title}`);
                    return lessonDoc;
                })
            );

            // Create chapter with lesson references
            const chapterSlug = generateCourseSlug(chapter.metadata.title);

            const chapterDoc = await client.create({
                _type: 'chapter',
                title: chapter.metadata.title,
                slug: {
                    _type: 'slug',
                    current: chapterSlug,
                },
                description: chapter.metadata.description,
                order: chapter.metadata.order,
                lessons: lessonDocs.map((doc) => ({
                    _type: 'reference',
                    _key: generateKey(),
                    _ref: doc._id,
                })),
                course: { _type: 'reference', _ref: courseId },
            });

            // Verify chapter slug
            await this.verifyChapterSlug(chapterDoc._id, chapterSlug);

            console.log(`✓ Created chapter: ${chapter.metadata.title}`);

            // Update course with chapter reference
            await client
                .patch(courseId)
                .setIfMissing({ chapters: [] })
                .append('chapters', [
                    {
                        _type: 'reference',
                        _key: generateKey(),
                        _ref: chapterDoc._id,
                    },
                ])
                .commit();
        }
    }

    /**
     * Generate placeholder content for lessons that don't have content
     */
    private generatePlaceholderContent(title: string) {
        return [
            {
                _type: 'courseBlock',
                _key: generateKey(),
                layout: 'course',
                content: [
                    {
                        _type: 'block',
                        _key: generateKey(),
                        style: 'h1',
                        children: [{ _type: 'span', _key: generateKey(), text: title }],
                    },
                    {
                        _type: 'callout',
                        _key: generateKey(),
                        title: 'Key Learning Points',
                        type: 'learning',
                        points: ['Point 1', 'Point 2', 'Point 3'],
                    },
                ],
            },
        ];
    }

    /**
     * Verify and fix lesson slug if needed
     */
    private async verifyLessonSlug(lessonId: string, metadata: any) {
        const verifyLesson = await client.fetch(`*[_type == "lesson" && _id == $id][0].slug.current`, { id: lessonId });

        if (!verifyLesson) {
            console.log(`⚠️  Warning: Slug not created for lesson: ${metadata.title}`);
            await client
                .patch(lessonId)
                .set({
                    slug: {
                        _type: 'slug',
                        current: metadata.slug,
                    },
                })
                .commit();
        }
    }

    /**
     * Verify and fix chapter slug if needed
     */
    private async verifyChapterSlug(chapterId: string, slug: string) {
        const verifyChapter = await client.fetch(`*[_type == "chapter" && _id == $id][0].slug.current`, { id: chapterId });

        if (!verifyChapter) {
            console.log(`⚠️  Warning: Slug not created for chapter`);
            await client
                .patch(chapterId)
                .set({
                    slug: {
                        _type: 'slug',
                        current: slug,
                    },
                })
                .commit();
        }
    }

    /**
     * Verify and fix course slug if needed
     */
    private async verifySlugGeneration(courseId: string) {
        const verifyCourse = await client.fetch(`*[_type == "course" && _id == $id][0].slug.current`, { id: courseId });

        if (!verifyCourse) {
            const slug = generateCourseSlug(this.courseStructure.metadata.title);
            console.log(`⚠️  Warning: Slug not created for course`);
            await client
                .patch(courseId)
                .set({
                    slug: {
                        _type: 'slug',
                        current: slug,
                    },
                })
                .commit();
        }
    }

    /**
     * Log summary of the course generation
     */
    private logSummary() {
        console.log('\n=== Course Generation Completed Successfully! ===');
        console.log('Summary:');
        console.log(`- Course: ${this.courseStructure.metadata.title}`);
        console.log(`- Chapters: ${this.courseStructure.chapters.length}`);
        console.log(`- Total Lessons: ${this.courseStructure.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)}`);
    }
}

/**
 * Generate multiple courses in parallel
 */
async function generateCourses(courses: CourseStructure[]) {
    try {
        const generators = courses.map((course) => new CourseGenerator(course));

        // Run in sequence to avoid Sanity API rate limits
        for (const generator of generators) {
            await generator.generate();
        }

        console.log('\n✅ All courses generated successfully!');
    } catch (error) {
        console.error('\nFatal error during course generation:', error);
        process.exit(1);
    }
}

// Run the generator for a single course
async function generateCourse() {
    try {
        const generator = new CourseGenerator(forexFoundationsCourse);
        await generator.generate();
    } catch (error) {
        console.error('\nFatal error:', error);
        process.exit(1);
    }
}

// Run the generator
generateCourse().catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
});
