import { defineField, defineType } from 'sanity';

export default defineType({
    type: 'object',
    name: 'changelogBlock',
    title: 'Changelog Block',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            initialValue: 'Changelog',
        }),
        defineField({
            name: 'subtitle',
            title: 'Subtitle',
            type: 'string',
            initialValue: 'Track our journey as we build the future of data visualization for trading and investing.',
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
    ],
    preview: {
        select: {
            title: 'title',
            layout: 'layout',
        },
        prepare({ title, layout }) {
            return {
                title: title || 'Changelog Block',
                subtitle: `Layout: ${layout || 'contained'}`,
            };
        },
    },
});
