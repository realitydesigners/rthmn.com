import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'course',
    title: 'Course',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'icon',
            title: 'Course Icon',
            type: 'string',
            options: {
                list: [
                    { title: 'Chart Line', value: 'FaChartLine' },
                    { title: 'Book', value: 'FaBook' },
                    { title: 'Graduation Cap', value: 'FaGraduationCap' },
                    { title: 'Tools', value: 'FaTools' },
                ],
            },
        }),
        defineField({
            name: 'modules',
            title: 'Course Modules',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'module' }] }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'prerequisites',
            title: 'Prerequisites',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'course' }] }],
        }),
        defineField({
            name: 'estimatedTime',
            title: 'Estimated Completion Time',
            type: 'string',
            description: 'e.g., "10 hours", "2 weeks"',
        }),
        defineField({
            name: 'difficulty',
            title: 'Difficulty Level',
            type: 'string',
            options: {
                list: [
                    { title: 'Beginner', value: 'beginner' },
                    { title: 'Intermediate', value: 'intermediate' },
                    { title: 'Advanced', value: 'advanced' },
                ],
            },
        }),
        defineField({
            name: 'order',
            title: 'Order',
            type: 'number',
            validation: (Rule) => Rule.required(),
        }),
    ],
    preview: {
        select: {
            title: 'title',
            difficulty: 'difficulty',
            modules: 'modules',
        },
        prepare({ title, difficulty, modules = [] }) {
            const moduleCount = modules.length;
            return {
                title: title || 'Untitled Course',
                subtitle: `${difficulty ? `${difficulty} · ` : ''}${moduleCount} module${moduleCount === 1 ? '' : 's'}`,
            };
        },
    },
});
