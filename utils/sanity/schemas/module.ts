import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'module',
    title: 'Learning Module',
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
            name: 'course',
            title: 'Parent Course',
            type: 'reference',
            to: [{ type: 'course' }],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'icon',
            title: 'Module Icon',
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
        defineField({
            name: 'prerequisites',
            title: 'Prerequisites',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'module' }] }],
            description: 'Other modules that should be completed before this one',
        }),
        defineField({
            name: 'lessons',
            title: 'Lessons',
            type: 'array',
            of: [{ type: 'reference', to: [{ type: 'lesson' }] }],
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
            subtitle: 'difficulty',
            description: 'description',
        },
        prepare({ title, subtitle, description }) {
            return {
                title: title || 'Untitled Module',
                subtitle: subtitle ? `Difficulty: ${subtitle}` : '',
                description: description,
            };
        },
    },
});
