#!/usr/bin/env bun
import { client } from '@/lib/sanity/lib/client';
import { groq } from 'next-sanity';
import fs from 'fs';
import path from 'path';

async function exportCourseData() {
    // Single query to get complete course structure
    const coursesQuery = groq`
        *[_type == "course"] {
            _id,
            title,
            description,
            "slug": slug.current,
            icon,
            difficulty,
            estimatedTime,
            order,
            "chapters": chapters[]-> {
                _id,
                title,
                description,
                "slug": slug.current,
                order,
                icon,
                difficulty,
                estimatedTime,
                "lessons": lessons[]-> {
                    _id,
                    title,
                    description,
                    "slug": slug.current,
                    estimatedTime,
                    content,
                    learningObjectives,
                    order,
                    "relatedLessons": relatedLessons[]-> {
                        _id,
                        title,
                        description,
                        "slug": slug.current
                    }
                } | order(order asc)
            } | order(order asc)
        } | order(order asc)
    `;

    // Fetch course data
    const courses = await client.fetch(coursesQuery);

    // Create directories if they don't exist
    const dataDir = path.join(process.cwd(), 'app', '(public)', 'learn', '_data');
    const dirs = ['courses', 'chapters', 'lessons'];
    dirs.forEach((dir) => {
        const dirPath = path.join(dataDir, dir);
        if (!fs.existsSync(dirPath)) {
            fs.mkdirSync(dirPath, { recursive: true });
        }
    });

    // Save individual files with proper references
    courses.forEach((course) => {
        // Save course
        fs.writeFileSync(path.join(dataDir, 'courses', `${course.slug}.json`), JSON.stringify(course, null, 2));

        // Save chapters
        course.chapters?.forEach((chapter) => {
            const chapterData = {
                ...chapter,
                courseId: course._id,
                courseName: course.title,
                courseSlug: course.slug,
            };
            fs.writeFileSync(path.join(dataDir, 'chapters', `${chapter.slug}.json`), JSON.stringify(chapterData, null, 2));

            // Save lessons
            chapter.lessons?.forEach((lesson) => {
                const lessonData = {
                    ...lesson,
                    chapterId: chapter._id,
                    chapterName: chapter.title,
                    chapterSlug: chapter.slug,
                    courseId: course._id,
                    courseName: course.title,
                    courseSlug: course.slug,
                };
                fs.writeFileSync(path.join(dataDir, 'lessons', `${lesson.slug}.json`), JSON.stringify(lessonData, null, 2));
            });
        });
    });

    console.log('Course data exported successfully!');
    console.log(`Total Courses: ${courses.length}`);
    console.log(`Total Chapters: ${courses.reduce((acc, course) => acc + course.chapters.length, 0)}`);
    console.log(`Total Lessons: ${courses.reduce((acc, course) => acc + course.chapters.reduce((chAcc, ch) => chAcc + ch.lessons.length, 0), 0)}`);
}

// Run the export
exportCourseData().catch(console.error);
