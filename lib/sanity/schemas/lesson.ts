import { defineField, defineType } from "sanity";

export default defineType({
	name: "lesson",
	title: "Lesson",
	type: "document",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "slug",
			title: "Slug",
			type: "slug",
			options: {
				source: "title",
			},
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "description",
			title: "Description",
			type: "text",
		}),
		defineField({
			name: "courseContent",
			title: "Portable Content",
			type: "courseBlock",
		}),
		defineField({
			name: "estimatedTime",
			title: "Estimated Time",
			type: "string",
			description: 'e.g., "15 minutes", "30 minutes"',
		}),
	],
	preview: {
		select: {
			title: "title",
			description: "description",
		},
		prepare({ title, description }) {
			return {
				title: title || "Untitled Lesson",
				subtitle: description,
			};
		},
	},
});
