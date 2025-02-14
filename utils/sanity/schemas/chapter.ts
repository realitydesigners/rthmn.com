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
