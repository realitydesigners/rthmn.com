import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'githubBlock',
    title: 'GitHub Block',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Found a Bug?',
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'string',
            initialValue: 'Report issues directly on our GitHub repository',
        }),
        defineField({
            name: 'buttonText',
            title: 'Button Text',
            type: 'string',
            initialValue: 'View on GitHub',
        }),
        defineField({
            name: 'githubUrl',
            title: 'GitHub URL',
            type: 'url',
            initialValue: 'https://github.com/rthmnapp/rthmn-feedback/issues',
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: title || 'GitHub Block',
            };
        },
    },
});
