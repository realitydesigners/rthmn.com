import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'chapter',
    title: 'Chapter',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
            },
            validation: (Rule: any) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'order',
            title: 'Order',
            type: 'number',
        }),
        defineField({
            name: 'lessons',
            title: 'Lessons',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'lesson' }] }],
            validation: (Rule: any) => Rule.unique(),
        }),
        defineField({
            name: 'course',
            title: 'Course',
            type: 'reference',
            to: [{ type: 'course' }],
        }),
        defineField({
            name: 'icon',
            title: 'Chapter Icon',
            type: 'string',
            options: {
                list: [
                    { title: 'Getting Started', value: 'FaRocket' },
                    { title: 'Market Fundamentals', value: 'FaChartLine' },
                    { title: 'Trading Basics', value: 'FaBook' },
                    { title: 'Advanced Trading', value: 'FaGraduationCap' },
                    { title: 'Risk Management', value: 'FaShieldAlt' },
                    { title: 'Platform Features', value: 'FaTools' },
                ],
            },
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
            name: 'estimatedTime',
            title: 'Estimated Completion Time',
            type: 'string',
            description: 'e.g., "2 hours", "45 minutes"',
        }),
    ],
    orderings: [
        {
            title: 'Order',
            name: 'order',
            by: [{ field: 'order', direction: 'asc' }],
        },
    ],
    preview: {
        select: {
            title: 'title',
            subtitle: 'description',
        },
    },
});
