import { defineField, defineType } from "sanity";

export default defineType({
	name: "hero",
	title: "Hero",
	type: "object",
	fields: [
		defineField({
			name: "content",
			title: "Content Block",
			type: "contentBlock",
		}),
	],
	preview: {
		select: {
			title: "title",
		},
		prepare({ title }) {
			return {
				title: title || "Hero",
				subtitle: "Hero block",
			};
		},
	},
});
