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
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [
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
