#!/usr/bin/env bun
import { client } from '@/utils/sanity/lib/client';
import { forexFoundationsCourse } from './templates/courses/forex-foundations-course';

export function generateKey(length = 12) {
    return Math.random()
        .toString(36)
        .substring(2, 2 + length);
}

async function generateCourse() {
    try {
        console.log('=== Starting Course Generation ===\n');

        // 1. Create the course
        const course = await client.create({
            _type: 'course',
            title: forexFoundationsCourse.title,
            slug: {
                _type: 'slug',
                current: 'forex-foundations',
            },
            description: 'Master the fundamentals of forex trading, from basic concepts to advanced strategies',
            icon: 'FaChartLine',
            difficulty: 'beginner',
            order: 1,
        });

        console.log(`✓ Created course: ${course.title} (${course._id})`);

        // 2. Create chapters and lessons
        console.log('\nCreating Chapters and Lessons');
        console.log('-------------------------');

        for (const chapter of forexFoundationsCourse.chapters) {
            console.log(`\nProcessing chapter: ${chapter.title}`);

            // Create lessons in Sanity
            console.log(`Creating ${chapter.lessons.length} lessons...`);
            const lessonDocs = await Promise.all(
                chapter.lessons.map(async (lesson) => {
                    // Create the lesson with template content if available
                    const lessonDoc = await client.create({
                        _type: 'lesson',
                        title: lesson.title,
                        slug: {
                            _type: 'slug',
                            current: lesson.title
                                .toLowerCase()
                                .replace(/[^a-z0-9]+/g, '-')
                                .replace(/^-+|-+$/g, ''),
                            _weak: true,
                        },
                        order: lesson.order,
                        ...(lesson.lesson || {}),
                        content: lesson.lesson?.content || [
                            {
                                _type: 'courseBlock',
                                _key: generateKey(),
                                layout: 'course',
                                content: [
                                    {
                                        _type: 'block',
                                        _key: generateKey(),
                                        style: 'h1',
                                        children: [{ _type: 'span', _key: generateKey(), text: lesson.title }],
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
                        ],
                    });

                    // Verify slug was created
                    const verifyLesson = await client.fetch(`*[_type == "lesson" && _id == $id][0].slug.current`, { id: lessonDoc._id });

                    if (!verifyLesson) {
                        console.log(`⚠️  Warning: Slug not created for lesson: ${lesson.title}`);
                        await client
                            .patch(lessonDoc._id)
                            .set({
                                slug: {
                                    _type: 'slug',
                                    current: lesson.title
                                        .toLowerCase()
                                        .replace(/[^a-z0-9]+/g, '-')
                                        .replace(/^-+|-+$/g, ''),
                                },
                            })
                            .commit();
                    }

                    console.log(
                        `  ✓ Created lesson: ${lesson.title} (slug: ${lesson.title
                            .toLowerCase()
                            .replace(/[^a-z0-9]+/g, '-')
                            .replace(/^-+|-+$/g, '')})`
                    );
                    return lessonDoc;
                })
            );

            // Create proper slug for chapter
            const chapterSlug = chapter.title
                .toLowerCase()
                .replace(/[^a-z0-9]+/g, '-')
                .replace(/^-+|-+$/g, '');

            // Create chapter with lesson references
            const chapterDoc = await client.create({
                _type: 'chapter',
                title: chapter.title,
                slug: {
                    _type: 'slug',
                    current: chapterSlug,
                },
                description: `Learn about ${chapter.title.toLowerCase()}`,
                order: chapter.order,
                lessons: lessonDocs.map((doc) => ({
                    _type: 'reference',
                    _key: generateKey(),
                    _ref: doc._id,
                })),
                course: { _type: 'reference', _ref: course._id },
            });

            // Verify chapter slug
            const verifyChapter = await client.fetch(`*[_type == "chapter" && _id == $id][0].slug.current`, { id: chapterDoc._id });

            if (!verifyChapter) {
                console.log(`⚠️  Warning: Slug not created for chapter: ${chapter.title}`);
                await client
                    .patch(chapterDoc._id)
                    .set({
                        slug: {
                            _type: 'slug',
                            current: chapterSlug,
                        },
                    })
                    .commit();
            }

            console.log(`✓ Created chapter: ${chapter.title} (slug: ${chapterSlug})`);

            // Update course with chapter reference
            await client
                .patch(course._id)
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

        // Final verification of course slug
        const verifyCourse = await client.fetch(`*[_type == "course" && _id == $id][0].slug.current`, { id: course._id });

        if (!verifyCourse) {
            console.log(`⚠️  Warning: Slug not created for course`);
            await client
                .patch(course._id)
                .set({
                    slug: {
                        _type: 'slug',
                        current: 'forex-foundations',
                    },
                })
                .commit();
        }

        console.log('\n=== Course Generation Completed Successfully! ===');
        console.log('Summary:');
        console.log(`- Course: ${forexFoundationsCourse.title}`);
        console.log(`- Chapters: ${forexFoundationsCourse.chapters.length}`);
        console.log(`- Total Lessons: ${forexFoundationsCourse.chapters.reduce((sum, ch) => sum + ch.lessons.length, 0)}`);
    } catch (error) {
        console.error('\n❌ Error generating course:', error);
        throw error;
    }
}

// Run the generator
generateCourse().catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
});
