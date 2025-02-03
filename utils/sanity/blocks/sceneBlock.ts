import { EarthGlobeIcon } from '@sanity/icons';
import { defineType } from 'sanity';

export default defineType({
    name: 'sceneBlock',
    title: '3D Scene',
    type: 'object',
    icon: EarthGlobeIcon,
    fields: [
        {
            name: 'sceneUrl',
            title: 'Spline Scene URL',
            type: 'url',
            validation: (rule) => rule.required(),
        },
        {
            name: 'height',
            title: 'Scene Height',
            type: 'string',
            initialValue: 'h-[500px]',
            options: {
                list: [
                    { title: 'Small (300px)', value: 'h-[300px]' },
                    { title: 'Medium (500px)', value: 'h-[500px]' },
                    { title: 'Large (700px)', value: 'h-[700px]' },
                    { title: 'Full Screen', value: 'h-screen' },
                ],
            },
        },
    ],
    preview: {
        select: {
            sceneUrl: 'sceneUrl',
            height: 'height',
        },
        prepare({ height }) {
            return {
                title: '3D Scene',
                subtitle: `Height: ${height}`,
                media: EarthGlobeIcon,
            };
        },
    },
});
