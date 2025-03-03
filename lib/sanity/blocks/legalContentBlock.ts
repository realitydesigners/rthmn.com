import { defineField, defineType } from 'sanity';

export default defineType({
    type: 'object',
    name: 'legalContentBlock',
    title: 'Legal Content Block',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'Title for the content section',
        }),
        defineField({
            name: 'layout',
            title: 'Layout',
            type: 'string',
            options: {
                list: [
                    { title: 'Contained', value: 'contained' },
                    { title: 'Wide', value: 'wide' },
                    { title: 'Full Width', value: 'fullWidth' },
                ],
                layout: 'radio',
            },
            initialValue: 'contained',
        }),
        defineField({
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [
                {
                    type: 'block',
                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'H1', value: 'h1' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                        { title: 'H4', value: 'h4' },
                        { title: 'H5', value: 'h5' },
                        { title: 'H6', value: 'h6' },
                        { title: 'Quote', value: 'blockquote' },
                    ],
                    lists: [
                        { title: 'Bullet', value: 'bullet' },
                        { title: 'Numbered', value: 'number' },
                    ],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                            { title: 'Code', value: 'code' },
                            { title: 'Underline', value: 'underline' },
                            { title: 'Strike', value: 'strike-through' },
                        ],
                        annotations: [
                            {
                                name: 'link',
                                type: 'object',
                                title: 'Link',
                                fields: [
                                    {
                                        name: 'href',
                                        type: 'url',
                                        title: 'URL',
                                    },
                                    {
                                        name: 'blank',
                                        type: 'boolean',
                                        title: 'Open in new tab',
                                        initialValue: true,
                                    },
                                ],
                            },
                        ],
                    },
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            layout: 'layout',
        },
        prepare({ title, layout }) {
            return {
                title: title || 'Legal Content Block',
                subtitle: `Layout: ${layout || 'contained'}`,
            };
        },
    },
});
