import { defineField, defineType } from 'sanity';
import teamType from '../schemas/team';

export const teamBlock = defineType({
    type: 'object',
    name: 'teamBlock',
    title: 'Team Block',
    fields: [
        defineField({
            name: 'team',
            title: 'Team',
            type: 'reference',
            to: [{ type: teamType.name }],
        }),
    ],
    preview: {
        select: {
            title: 'team.name',
            subtitle: 'team.role',
            media: 'team.image',
        },
    },
});
