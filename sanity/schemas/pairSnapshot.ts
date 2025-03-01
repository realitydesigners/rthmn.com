export default {
    name: 'pairSnapshot',
    title: 'Pair Snapshot',
    type: 'document',
    fields: [
        {
            name: 'pair',
            title: 'Trading Pair',
            type: 'string',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'candleData',
            title: 'Candle Data',
            type: 'text',
            validation: (Rule: any) => Rule.required(),
        },
        {
            name: 'lastUpdated',
            title: 'Last Updated',
            type: 'datetime',
            validation: (Rule: any) => Rule.required(),
        },
    ],
    preview: {
        select: {
            title: 'pair',
            subtitle: 'lastUpdated',
        },
        prepare({ title, subtitle }: { title: string; subtitle: string }) {
            return {
                title: `${title} Snapshot`,
                subtitle: new Date(subtitle).toLocaleString(),
            };
        },
    },
};
