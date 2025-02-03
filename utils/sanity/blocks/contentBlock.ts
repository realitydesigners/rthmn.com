import { ImageIcon, LinkIcon, PlayIcon, UserIcon } from '@sanity/icons';
import { defineField, defineType } from 'sanity';

type ThemeOption = 'light' | 'dark';
type ImageClassOption = 'image-standard' | 'image-standard-dark' | 'image-inset';
type VideoClassOption = 'light' | 'dark' | 'transparent';
type QuoteClassOption = 'card-1' | 'card-2';
type AudioClassOption = 'class-1' | 'class-2';
type ImageOption = 'img-dark' | 'img-light';

const themeTitles: Record<ThemeOption, string> = {
    light: 'Internal Link | Light',
    dark: 'Internal Link | Dark',
};

const imageClassTitles: Record<ImageClassOption, string> = {
    'image-standard': 'Image | Team Name Below',
    'image-standard-dark': 'Image | Team Name Below Dark',
    'image-inset': 'Image | Team Inset',
};

const videoClassTitles: Record<VideoClassOption, string> = {
    light: 'Video | Light',
    dark: 'Video | Dark',
    transparent: 'Video | Transparent',
};

const quoteClassTitles: Record<QuoteClassOption, string> = {
    'card-1': 'Card 1',
    'card-2': 'Card 2',
};

const audioClassTitles: Record<AudioClassOption, string> = {
    'class-1': 'Audio | Style 1',
    'class-2': 'Audio | Style 2',
};

const imageOptionTitles: Record<ImageOption, string> = {
    'img-dark': 'img-dark',
    'img-light': 'img-light',
};

export default defineType({
    type: 'object',
    name: 'contentBlock',
    title: 'Content',
    fields: [
        defineField({
            name: 'layout',
            title: 'Layout',
            type: 'string',
            options: {
                list: [
                    { title: 'Dark', value: 'dark' },
                    { title: 'Light', value: 'light' },
                    { title: 'Transparent', value: 'transparent' },
                ],
            },
        }),
        {
            name: 'content',
            title: 'Content',
            type: 'array',
            of: [
                {
                    type: 'block',
                    lists: [
                        { title: 'Bullet', value: 'bullet' },
                        { title: 'Numbered', value: 'number' },
                    ],

                    styles: [
                        { title: 'Normal', value: 'normal' },
                        { title: 'Quote', value: 'blockquote' },
                        { title: 'H1', value: 'h1' },
                        { title: 'H2', value: 'h2' },
                        { title: 'H3', value: 'h3' },
                        { title: 'H4', value: 'h4' },
                        { title: 'H5', value: 'h5' },
                        { title: 'H6', value: 'h6' },
                    ],
                    marks: {
                        annotations: [
                            defineField({
                                type: 'object',
                                name: 'internalLink',
                                title: 'Internal link',
                                icon: UserIcon,
                                fields: [
                                    {
                                        name: 'reference',
                                        type: 'reference',
                                        title: 'Reference',
                                        to: [{ type: 'posts' }],
                                    },
                                    {
                                        name: 'theme',
                                        type: 'string',
                                        title: 'Theme',
                                        options: {
                                            list: [
                                                { title: 'Internal Link | Light', value: 'light' },
                                                { title: 'Internal Link | Dark', value: 'dark' },
                                            ],
                                        },
                                    },
                                ],
                                preview: {
                                    select: {
                                        title: 'reference.title',
                                        media: 'reference.mainImage',
                                        theme: 'theme',
                                    },
                                    prepare(selection: { theme?: ThemeOption; title?: string; media?: any }) {
                                        const { title, media, theme } = selection;
                                        const themeTitle = theme ? themeTitles[theme] : 'No theme selected';

                                        return {
                                            title: title || 'Untitled',
                                            subtitle: themeTitle,
                                            media: media,
                                        };
                                    },
                                },
                            }),
                        ],
                    },
                },
                defineField({
                    type: 'object',
                    name: 'postsRef',
                    title: 'Post',
                    preview: {
                        select: {
                            title: 'posts.block.0.heading',
                            excerpt: 'posts.block.0.subheading',
                            publicationDate: 'posts.block.0.publicationDate',
                            media: 'posts.block.0.image',
                        },
                        prepare(selection: { title?: string; excerpt?: string; publicationDate?: string; media?: any }) {
                            const { title, excerpt, publicationDate, media } = selection;
                            const formattedDate = publicationDate ? new Date(publicationDate).toLocaleDateString() : 'No date';

                            const subtitle = `${excerpt ? excerpt : 'No excerpt'} | ${formattedDate}`;
                            return {
                                title: title || 'Untitled',
                                subtitle: subtitle,
                                media: media,
                            };
                        },
                    },
                    fields: [
                        defineField({
                            type: 'reference',
                            name: 'posts',
                            title: 'Referenced Post',
                            to: [{ type: 'posts' }],
                        }),
                    ],
                }),
                defineField({
                    type: 'object',
                    name: 'imageRef',
                    title: 'Image',
                    fields: [
                        defineField({
                            type: 'reference',
                            icon: ImageIcon,
                            name: 'image',
                            title: 'Image Item',
                            to: [{ type: 'img' }],
                        }),
                        {
                            name: 'className',
                            title: 'CSS Class',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Image | Team Name Below', value: 'image-standard' },
                                    {
                                        title: 'Image | Team Name Below Dark',
                                        value: 'image-standard-dark',
                                    },
                                    { title: 'Image | Team Inset', value: 'image-inset' },
                                ],
                            },
                        },
                    ],
                    preview: {
                        select: {
                            imageUrl: 'image.image',
                            title: 'image.title',
                            className: 'className',
                        },
                        prepare(selection: { title?: string; imageUrl?: string; className?: ImageClassOption }) {
                            const { title, imageUrl, className } = selection;
                            const classNameTitle = className ? imageClassTitles[className] : 'No class selected';

                            return {
                                title: title || 'Untitled',
                                subtitle: classNameTitle,
                                media: imageUrl,
                            };
                        },
                    },
                }),
                defineField({
                    type: 'object',
                    name: 'videoRef',
                    title: 'Video',
                    preview: {
                        select: {
                            imageUrl: 'video.image',
                            title: 'video.title',
                            className: 'className',
                        },
                        prepare(selection: { title?: string; imageUrl?: string; className?: VideoClassOption }) {
                            const { title, imageUrl, className } = selection;
                            const classNameTitle = className ? videoClassTitles[className] : 'No class selected';

                            return {
                                title: title || 'Untitled',
                                subtitle: classNameTitle,
                                media: imageUrl,
                            };
                        },
                    },
                    fields: [
                        defineField({
                            type: 'reference',
                            icon: ImageIcon,
                            name: 'video',
                            title: 'Video Item',
                            to: [{ type: 'video' }],
                        }),
                        {
                            name: 'className',
                            title: 'CSS Class',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Video | Light ', value: 'light' },
                                    { title: 'Video | Dark', value: 'dark' },
                                    { title: 'Video | Transparent', value: 'transparent' },
                                ],
                            },
                        },
                    ],
                }),
                // Remove or comment out the quoteRef object
                // defineField({
                //   type: 'object',
                //   name: 'quoteRef',
                //   title: 'Quote',
                //   icon: BookIcon,
                //   fields: [
                //     defineField({
                //       type: 'reference',
                //       icon: ImageIcon,
                //       name: 'quote',
                //       title: 'Quote Item',
                //       to: [{ type: 'quote' }]
                //     }),
                //     {
                //       name: 'className',
                //       title: 'CSS Class',
                //       type: 'string',
                //       options: {
                //         list: [
                //           { title: 'Card 1', value: 'card-1' },
                //           { title: 'Card 2', value: 'card-2' }
                //         ]
                //       }
                //     }
                //   ],
                //   preview: {
                //     select: {
                //       title: 'quote.quote',
                //       imageUrl: 'quote.mediaRef.image.image',
                //       className: 'className'
                //     },
                //     prepare(selection: {
                //       title?: string;
                //       imageUrl?: string;
                //       className?: QuoteClassOption;
                //     }) {
                //       const { title, imageUrl, className } = selection;
                //       const classNameTitle = className
                //         ? quoteClassTitles[className]
                //         : 'No class selected';

                //       return {
                //         title: title || 'Untitled',
                //         subtitle: classNameTitle,
                //         media: imageUrl
                //       };
                //     }
                //   }
                // }),
                defineField({
                    type: 'object',
                    icon: PlayIcon,
                    name: 'audioRef',
                    title: 'Audio',
                    preview: {
                        select: {
                            title: 'audio.title',
                            className: 'className',
                        },
                        prepare(selection: { title?: string; className?: AudioClassOption }) {
                            const { title, className } = selection;
                            const classNameTitle = className ? audioClassTitles[className] : 'No class selected';

                            return {
                                title: title || 'Untitled',
                                subtitle: classNameTitle,
                            };
                        },
                    },
                    fields: [
                        defineField({
                            type: 'reference',
                            name: 'audio',
                            title: 'Audio File',
                            to: [{ type: 'audio' }],
                        }),
                        {
                            name: 'className',
                            title: 'CSS Class',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Audio | Style 1', value: 'class-1' },
                                    { title: 'Audio | Style 2', value: 'class-2' },
                                ],
                            },
                        },
                    ],
                }),
                defineField({
                    type: 'image',
                    icon: ImageIcon,
                    name: 'image',
                    title: 'Image',
                    options: {
                        hotspot: true,
                    },

                    fields: [
                        defineField({
                            name: 'alt',
                            type: 'string',
                            title: 'Alt text',
                            description: 'Alternative text for screenreaders. Falls back on caption if not set',
                        }),
                        {
                            name: 'className',
                            title: 'CSS Class',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'img-dark', value: 'img-dark' },
                                    { title: 'img-light', value: 'img-light' },
                                ],
                            },
                        },
                    ],
                    preview: {
                        select: {
                            media: 'asset',
                            title: 'alt',
                            className: 'className',
                        },
                        prepare(selection: { title?: string; media?: any; className?: ImageOption }) {
                            const { title, media, className } = selection;
                            const classNameTitle = className ? imageOptionTitles[className] : 'No class selected';

                            return {
                                title: title || 'Untitled',
                                subtitle: classNameTitle,
                                media,
                            };
                        },
                    },
                }),
                defineField({
                    type: 'object',
                    icon: LinkIcon,
                    name: 'iframe',
                    title: 'iFrame',
                    fields: [
                        defineField({
                            type: 'url',
                            name: 'url',
                            title: 'URL',
                            validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
                        }),
                        defineField({
                            type: 'string',
                            name: 'width',
                            title: 'Width',
                        }),
                        defineField({
                            type: 'string',
                            name: 'height',
                            title: 'Height',
                        }),
                    ],
                }),
                defineField({
                    type: 'object',
                    icon: LinkIcon,
                    name: 'spline',
                    title: 'Spline',
                    fields: [
                        defineField({
                            type: 'url',
                            name: 'url',
                            title: 'URL',
                            validation: (rule) => rule.uri({ scheme: ['http', 'https'] }),
                        }),
                    ],
                }),
            ],
        },
    ],

    preview: {
        select: {
            contentArray: 'content',
            layout: 'layout',
            media: 'block.0.image',
        },
        prepare(selection: { contentArray?: any[]; layout?: string; media?: any }) {
            const { contentArray, layout, media } = selection;

            const firstContentType = contentArray && contentArray.length > 0 ? contentArray[0]._type : 'Unknown';
            let firstWords = '';
            if (firstContentType === 'block') {
                const blockText = contentArray[0].children?.map((child: { text: string }) => child.text).join(' ');
                firstWords = blockText ? `${blockText.split(' ').slice(0, 10).join(' ')}...` : 'No text content...';
            }

            const contentSummary = contentArray?.reduce((acc: Record<string, number>, curr: { _type: string }) => {
                const type = curr._type;
                if (acc[type]) {
                    acc[type] += 1;
                } else {
                    acc[type] = 1;
                }
                return acc;
            }, {});

            const contentDiversity = Object.entries(contentSummary || {})
                .map(([type, count]) => `${count} ${type}`)
                .join(', ');

            return {
                title: firstWords || firstContentType,
                subtitle: `${Object.keys(contentArray || {}).length} items | ${contentDiversity} | Layout: ${layout}`,
                media: media,
            };
        },
    },
});
