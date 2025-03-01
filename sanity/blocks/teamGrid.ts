import { defineType } from 'sanity';

export const teamGrid = defineType({
    name: 'teamGrid',
    title: 'Team Grid',
    type: 'object',
    fields: [
        {
            name: 'title',
            title: 'Section Title',
            type: 'string',
            description: 'Optional title above the team grid',
        },
    ],
    preview: {
        select: {
            title: 'title',
        },
        prepare({ title }) {
            return {
                title: title || 'Team Grid',
                subtitle: 'Displays team members in a grid layout',
            };
        },
    },
});
