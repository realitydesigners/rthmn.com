import { defineField, defineType } from 'sanity';

export default defineType({
    name: 'changelog',
    title: 'Changelog',
    type: 'document',
    fields: [
        defineField({
            name: 'title',
            title: 'Title',
            type: 'string',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'description',
            title: 'Description',
            type: 'text',
            rows: 3,
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'version',
            title: 'Version',
            type: 'string',
        }),
        defineField({
            name: 'releaseDate',
            title: 'Release Date',
            type: 'datetime',
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'type',
            title: 'Change Type',
            type: 'string',
            options: {
                list: [
                    { title: 'Feature', value: 'feature' },
                    { title: 'Bug Fix', value: 'bugfix' },
                    { title: 'Improvement', value: 'improvement' },
                    { title: 'Breaking Change', value: 'breaking' },
                ],
            },
            validation: (Rule) => Rule.required(),
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
                    ],
                    marks: {
                        decorators: [
                            { title: 'Strong', value: 'strong' },
                            { title: 'Emphasis', value: 'em' },
                            { title: 'Code', value: 'code' },
                        ],
                    },
                    lists: [
                        { title: 'Bullet', value: 'bullet' },
                        { title: 'Number', value: 'number' },
                    ],
                },
            ],
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'status',
            title: 'Status',
            type: 'string',
            options: {
                list: [
                    { title: 'Planned', value: 'planned' },
                    { title: 'In Development', value: 'in-development' },
                    { title: 'Released', value: 'released' },
                ],
                layout: 'radio',
            },
            validation: (Rule) => Rule.required(),
        }),
        defineField({
            name: 'contributors',
            title: 'Contributors',
            type: 'array',
            of: [
                {
                    type: 'reference',
                    to: [{ type: 'team' }],
                },
            ],
        }),
    ],
    preview: {
        select: {
            title: 'title',
            version: 'version',
            status: 'status',
            date: 'releaseDate',
        },
        prepare({ title, version, status, date }) {
            return {
                title: `v${version} - ${title}`,
                subtitle: `${status} - ${new Date(date).toLocaleDateString()}`,
            };
        },
    },
});
