import { defineField, defineType } from 'sanity';

export default defineType({
  name: 'category',
  title: 'Category',
  type: 'document',
  fields: [
    defineField({
      name: 'title',
      type: 'string',
      title: 'Title',
      description:
        'Represents the title or name of the category. This field is used to identify the category in the user interface and in URLs.',
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'slug',
      type: 'slug',
      title: 'Slug',
      description:
        "Provides a unique identifier for the category, used in URLs to access the category's content. The slug is automatically generated from the title but can be manually adjusted if needed.",
      options: {
        source: 'title'
      },
      validation: (rule) => rule.required()
    }),
    defineField({
      name: 'subcategories',
      type: 'array',
      title: 'Subcategories',
      description:
        'Contains references to subcategories belonging to this category. Subcategories allow for further organization and categorization of content within the main category.',
      of: [{ type: 'reference', to: { type: 'category' } }]
    })
  ]
});
