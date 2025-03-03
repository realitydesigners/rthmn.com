#!/usr/bin/env bun
import { client } from '@/lib/sanity/lib/client';

async function cleanupCourses() {
    try {
        console.log('=== Starting Course Cleanup ===\n');
        console.log('-------------------------');

        // 1. First get all documents and their references
        const allDocs = await client.fetch(`{
            "courses": *[_type == "course"]{
                _id,
                title,
                "refs": *[references(^._id)]{ _id, _type, title }
            },
            "chapters": *[_type == "chapter"]{
                _id,
                title,
                "refs": *[references(^._id)]{ _id, _type, title }
            },
            "lessons": *[_type == "lesson"]{
                _id,
                title,
                "refs": *[references(^._id)]{ _id, _type, title }
            },
            "modules": *[_type == "module"]{
                _id,
                title,
                "refs": *[references(^._id)]{ _id, _type, title }
            }
        }`);

        // 2. Remove all references first
        console.log('\nRemoving references...');

        // Handle module references
        for (const module of allDocs.modules) {
            for (const ref of module.refs) {
                await client.patch(ref._id).unset(['modules', 'module']).commit();
                console.log(`✓ Removed module reference from ${ref._type}: ${ref.title || ref._id}`);
            }
        }

        // Handle lesson references
        for (const lesson of allDocs.lessons) {
            for (const ref of lesson.refs) {
                await client.patch(ref._id).unset(['lessons', 'lesson', 'relatedLessons']).commit();
                console.log(`✓ Removed lesson reference from ${ref._type}: ${ref.title || ref._id}`);
            }
        }

        // Handle chapter references
        for (const chapter of allDocs.chapters) {
            for (const ref of chapter.refs) {
                await client.patch(ref._id).unset(['chapters', 'chapter']).commit();
                console.log(`✓ Removed chapter reference from ${ref._type}: ${ref.title || ref._id}`);
            }
        }

        // 3. Now we can safely delete documents in reverse order
        console.log('\nDeleting documents...');

        // Delete lessons first
        for (const lesson of allDocs.lessons) {
            await client.delete(lesson._id);
            console.log(`✓ Deleted lesson: ${lesson.title}`);
        }

        // Delete chapters
        for (const chapter of allDocs.chapters) {
            await client.delete(chapter._id);
            console.log(`✓ Deleted chapter: ${chapter.title}`);
        }

        // Delete modules
        for (const module of allDocs.modules) {
            await client.delete(module._id);
            console.log(`✓ Deleted module: ${module.title}`);
        }

        // Delete courses
        for (const course of allDocs.courses) {
            await client.delete(course._id);
            console.log(`✓ Deleted course: ${course.title}`);
        }

        console.log('\n=== Cleanup Completed Successfully! ===');
    } catch (error) {
        console.error('\n❌ Error during cleanup:', error);
        throw error;
    }
}

// Run the cleanup
cleanupCourses().catch((error) => {
    console.error('\nFatal error:', error);
    process.exit(1);
});
