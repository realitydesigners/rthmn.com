import { defineField, defineType } from 'sanity';
import { GROUP } from '../utils/constant';

export const faqBlock = defineType({
    name: 'faqBlock',
    title: 'FAQ Section',
    type: 'object',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            description: 'Title for the FAQ section',
            initialValue: 'Frequently Asked Questions',
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
                title: title || 'FAQ Section',
                subtitle: `Layout: ${layout || 'contained'}`,
            };
        },
    },
});
