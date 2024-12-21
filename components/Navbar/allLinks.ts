export interface LinkItem {
    title: string;
    desc: string;
    href: string;
}

interface LinkGroup {
    title: string;
    links: LinkItem[];
}

export const allLinks: LinkGroup[] = [
    {
        title: 'Pricing',
        links: [
            {
                title: 'Plans',
                desc: 'View our pricing plans and features',
                href: '/pricing',
            },
            {
                title: 'Enterprise',
                desc: 'Custom solutions for large organizations',
                href: '/enterprise',
            },
        ],
    },
    {
        title: 'Company',
        links: [
            {
                title: 'About',
                desc: 'Learn about our mission and team',
                href: '/about',
            },
            {
                title: 'Contact',
                desc: 'Get in touch with us',
                href: '/contact',
            },
        ],
    },
    {
        title: 'Resources',
        links: [
            {
                title: 'Documentation',
                desc: 'Learn how to use our platform',
                href: '/docs',
            },
            {
                title: 'Blog',
                desc: 'Latest news and updates',
                href: '/blog',
            },
            {
                title: 'Support',
                desc: 'Get help from our team',
                href: '/support',
            },
        ],
    },
];
