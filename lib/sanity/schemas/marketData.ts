import { defineField, defineType } from "sanity";

export default defineType({
	name: "marketData",
	title: "Market Data",
	type: "document",
	fields: [
		defineField({
			name: "pair",
			title: "Trading Pair",
			type: "string",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "lastUpdated",
			title: "Last Updated",
			type: "datetime",
			validation: (Rule) => Rule.required(),
		}),
		defineField({
			name: "candleData",
			title: "Candle Data",
			type: "text",
			description: "JSON string of candle data",
		}),
	],
});
