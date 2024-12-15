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
            name: 'description',
            title: 'Description',
            type: 'text',
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
});
