import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'page',
    title: 'Pages',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'slug',
            title: 'Slug',
            type: 'slug',
            options: {
                source: 'title',
            },
            validation: (rule) => rule.required(),
        }),
        defineField({
            name: 'sections',
            title: 'Page Sections',
            type: 'array',
            of: [
                {
                    type: 'object',
                    name: 'section',
                    title: 'Section',
                    fields: [
                        {
                            name: 'sectionTitle',
                            title: 'Section Title',
                            type: 'string',
                        },
                        {
                            name: 'layout',
                            title: 'Layout',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Full Width', value: 'fullWidth' },
                                    { title: 'Contained', value: 'contained' },
                                    { title: 'Wide', value: 'wide' },
                                ],
                            },
                        },
                        {
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
                                    ],
                                },
                                {
                                    type: 'teamGrid',
                                    title: 'Team Grid',
                                },
                                {
                                    type: 'sceneBlock',
                                    title: '3D Scene',
                                },
                                {
                                    type: 'image',
                                    title: 'Image',
                                },
                            ],
                        },
                        {
                            name: 'backgroundColor',
                            title: 'Background Color',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'None', value: 'none' },
                                    { title: 'Dark', value: 'dark' },
                                    { title: 'Light', value: 'light' },
                                    { title: 'Gradient', value: 'gradient' },
                                ],
                            },
                        },
                    ],
                    preview: {
                        select: {
                            title: 'sectionTitle',
                            layout: 'layout',
                        },
                        prepare({ title, layout }) {
                            return {
                                title: title || 'Untitled Section',
                                subtitle: `Layout: ${layout || 'Default'}`,
                            };
                        },
                    },
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: 'title',
        },
    },
});
