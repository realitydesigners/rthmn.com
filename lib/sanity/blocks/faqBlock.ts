import { defineField, defineType } from "sanity";

export default defineType({
	name: "faqBlock",
	title: "FAQ Section",
	type: "object",
	fields: [
		defineField({
			name: "title",
			title: "Title",
			type: "string",
			description: "Title for the FAQ section",
			initialValue: "Frequently Asked Questions",
		}),
	],
	preview: {
		select: {
			title: "title",
		},
		prepare({ title }) {
			return {
				title: title || "FAQ Section",
			};
		},
	},
});
