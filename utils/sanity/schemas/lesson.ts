import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'lesson',
    title: 'Lesson',
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
            name: 'chapter',
            title: 'Parent Chapter',
            type: 'reference',
            to: [{ type: 'chapter' }],
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
        }),
        defineField({
            name: 'estimatedTime',
            title: 'Estimated Time',
            type: 'string',
            description: 'e.g., "15 minutes", "30 minutes"',
        }),
        defineField({
            name: 'learningObjectives',
            title: 'Learning Objectives',
            type: 'array',
            of: [{ type: 'string' }],
            description: 'What will students learn in this lesson?',
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [
                { type: 'headingBlock' },
                { type: 'headingSplineBlock' },
                { type: 'contentBlock' },
                { type: 'courseBlock' },
                { type: 'teamBlock' },
                {
                    type: 'object',
                    name: 'codeExample',
                    title: 'Code Example',
                    fields: [
                        {
                            name: 'title',
                            type: 'string',
                            title: 'Title',
                        },
                        {
                            name: 'code',
                            type: 'text',
                            title: 'Code',
                        },
                        {
                            name: 'language',
                            type: 'string',
                            title: 'Language',
                            options: {
                                list: ['javascript', 'python', 'json'],
                            },
                        },
                    ],
                },
                {
                    type: 'object',
                    name: 'interactiveExample',
                    title: 'Interactive Example',
                    fields: [
                        {
                            name: 'title',
                            type: 'string',
                            title: 'Title',
                        },
                        {
                            name: 'description',
                            type: 'text',
                            title: 'Description',
                        },
                        {
                            name: 'embedCode',
                            type: 'text',
                            title: 'Embed Code',
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: 'resources',
            title: 'Additional Resources',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'resource',
                    fields: [
                        {
                            name: 'title',
                            type: 'string',
                            title: 'Title',
                        },
                        {
                            name: 'url',
                            type: 'url',
                            title: 'URL',
                        },
                        {
                            name: 'type',
                            type: 'string',
                            title: 'Type',
                            options: {
                                list: [
                                    { title: 'Article', value: 'article' },
                                    { title: 'Video', value: 'video' },
                                    { title: 'Documentation', value: 'documentation' },
                                ],
                            },
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: 'quiz',
            title: 'Knowledge Check',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'question',
                    fields: [
                        {
                            name: 'question',
                            type: 'string',
                            title: 'Question',
                        },
                        {
                            name: 'options',
                            type: 'array',
                            of: [{ type: 'string' }],
                            title: 'Options',
                        },
                        {
                            name: 'correctAnswer',
                            type: 'number',
                            title: 'Correct Answer Index',
                        },
                        {
                            name: 'explanation',
                            type: 'text',
                            title: 'Explanation',
                        },
                    ],
                },
            ],
        }),
        defineField({
            name: 'relatedLessons',
            title: 'Related Lessons',
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
            description: 'description',
        },
        prepare({ title, description }) {
            return {
                title: title || 'Untitled Lesson',
                subtitle: description,
            };
        },
    },
});
