import { defineType } from 'sanity';

export default defineType({
  name: 'teamGrid',
  title: 'Team Grid',
  type: 'object',
  fields: [
    {
      name: 'title',
      title: 'Section Title',
      type: 'string',
      description: 'Optional title above the team grid'
    },
    {
      name: 'layout',
      title: 'Layout',
      type: 'string',
      options: {
        list: [
          { title: 'Full Width', value: 'fullWidth' },
          { title: 'Contained', value: 'contained' }
        ]
      }
    }
  ],
  preview: {
    select: {
      title: 'title'
    },
    prepare({ title }) {
      return {
        title: title || 'Team Grid',
        subtitle: 'Displays team members in a grid layout',
        media: () => '👥'
      };
    }
  }
});
