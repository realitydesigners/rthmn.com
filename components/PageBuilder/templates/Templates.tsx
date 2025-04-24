import { generateHeadingId } from '@/app/learn/_components/TOC';
import React from 'react';
import AudioRefBlock from '../nested/AudioRefBlock';
import ImageRefBlock from '../nested/ImageRefBlock';
import InternalLink from '../nested/InternalLink';
import PostsRefBlock from '../nested/PostsRefBlock';
import QuoteRefBlock from '../nested/QuoteRefBlock';

import VideoRefBlock from '../nested/VideoRefBlock';

export type TemplateTheme = 'dark' | 'light';

const headingStyles: Record<TemplateTheme, string> = {
    dark: `font-outfit my-3 w-full text-white font-bold leading-none tracking-wide md:w-3/4 lg:w-1/2`,
    light: `font-outfit my-3 w-11/12 text-black font-bold leading-none tracking-wide md:w-3/4 lg:w-1/2`,
};

const listStyles: Record<TemplateTheme, string> = {
    dark: `font-outfit w-full text-white  leading-7 md:w-3/4 lg:w-1/2 text-xl list-decimal list-inside outfit-y-6 mb-6`,
    light: `font-outfit w-11/12 text-black leading-7 md:w-3/4 text-xl lg:w-1/2  list-decimal list-inside outfit-y-6 mb-6`,
};

const normalTextStyles: Record<TemplateTheme, string> = {
    dark: `font-outfit w-full text-white   bg-clip-text leading-[1.4em] tracking-wide text-xl md:w-3/4 lg:w-1/2 lg:text-xl`,
    light: `font-outfit text-black leading-[1.5em] tracking-wide text-xl md:w-3/4 lg:w-1/2 lg:text-xl`,
};

const NormalText: React.FC<{
    children: React.ReactNode;
    theme: TemplateTheme;
    value?: any;
}> = React.memo(({ children, theme, value }) => {
    const className = normalTextStyles[theme];

    if (value?.style?.match(/^h[1-6]$/)) {
        const level = Number.parseInt(value.style[1]);
        const textContent = React.Children.toArray(children)
            .map((child) => {
                if (typeof child === 'string') return child;
                if (typeof child === 'object' && 'props' in child) {
                    const props = child.props as { children?: string | string[] };
                    if (typeof props.children === 'string') return props.children;
                    if (Array.isArray(props.children)) return props.children.join('');
                }
                return '';
            })
            .join('')
            .trim();

        const id = generateHeadingId(textContent);
        console.log('Templates - Generated ID:', id, 'for text:', textContent);

        const renderHeading = () => {
            const commonClasses = `${headingStyles[theme]} scroll-mt-24`;

            switch (level) {
                case 1:
                    return (
                        <h1 id={id} className={commonClasses}>
                            {children}
                        </h1>
                    );
                case 2:
                    return (
                        <h2 id={id} className={commonClasses}>
                            {children}
                        </h2>
                    );
                case 3:
                    return (
                        <h3 id={id} className={commonClasses}>
                            {children}
                        </h3>
                    );
                case 4:
                    return (
                        <h4 id={id} className={commonClasses}>
                            {children}
                        </h4>
                    );
                case 5:
                    return (
                        <h5 id={id} className={commonClasses}>
                            {children}
                        </h5>
                    );
                case 6:
                    return (
                        <h6 id={id} className={commonClasses}>
                            {children}
                        </h6>
                    );
                default:
                    return <p className={className}>{children}</p>;
            }
        };

        return <div className='flex w-full justify-center p-3'>{renderHeading()}</div>;
    }

    return (
        <div className='flex w-full justify-center p-3'>
            <div className={className}>{children}</div>
        </div>
    );
});

const List: React.FC<{
    type: 'bullet' | 'number';
    children: React.ReactNode;
    theme: TemplateTheme;
}> = React.memo(({ type, children, theme }) => {
    const Tag = type === 'bullet' ? 'ul' : 'ol';
    const className = listStyles[theme];
    return (
        <div className='flex w-full justify-center p-3'>
            <Tag className={className}>{children}</Tag>
        </div>
    );
});

interface HeadingComponentProps {
    children: React.ReactNode;
    level: number;
    theme: TemplateTheme;
}

const Heading: React.FC<HeadingComponentProps> = ({ children, level, theme }) => {
    const text = React.Children.toArray(children)
        .map((child) => (typeof child === 'string' ? child : ''))
        .join('')
        .trim();

    const id = generateHeadingId(text);

    const fontSize = {
        1: 'text-3xl lg:text-5xl ',
        2: 'text-2xl lg:text-4xl',
        3: 'text-xl lg:text-3xl',
        4: 'text-lg lg:text-xl',
        5: 'text-lg lg:text-xl',
        6: 'text-lg lg:text-xl',
    }[level];

    const combinedClassName = `${headingStyles[theme]} ${fontSize}`.replace(/text-\w+/, '');

    const commonProps = {
        id,
        className: combinedClassName,
    };

    return (
        <div className='flex w-full justify-center p-3'>
            {level === 1 && <h1 {...commonProps}>{children}</h1>}
            {level === 2 && <h2 {...commonProps}>{children}</h2>}
            {level === 3 && <h3 {...commonProps}>{children}</h3>}
            {level === 4 && <h4 {...commonProps}>{children}</h4>}
            {level === 5 && <h5 {...commonProps}>{children}</h5>}
            {level === 6 && <h6 {...commonProps}>{children}</h6>}
        </div>
    );
};

const DarkTemplate = {
    block: {
        normal: ({ children, value }: any) => (
            <NormalText theme='dark' value={value}>
                {children}
            </NormalText>
        ),
        h1: ({ children }) => (
            <Heading level={1} theme='dark'>
                {children}
            </Heading>
        ),
        h2: ({ children }) => (
            <Heading level={2} theme='dark'>
                {children}
            </Heading>
        ),
        h3: ({ children }) => (
            <Heading level={3} theme='dark'>
                {children}
            </Heading>
        ),
        h4: ({ children }) => (
            <Heading level={4} theme='dark'>
                {children}
            </Heading>
        ),
        h5: ({ children }) => (
            <Heading level={5} theme='dark'>
                {children}
            </Heading>
        ),
        h6: ({ children }) => (
            <Heading level={6} theme='dark'>
                {children}
            </Heading>
        ),
    },
    list: {
        bullet: (props) => <List type='bullet' {...props} theme='dark' />,
        number: (props) => <List type='number' {...props} theme='dark' />,
    },
    marks: {
        internalLink: ({ value, children }) => {
            const { slug = {}, theme } = value;
            return (
                <InternalLink slug={slug?.current} theme={theme}>
                    {children}
                </InternalLink>
            );
        },
    },
    types: {
        postsRef: ({ value }) => {
            const { postsHeading, postsSlug, postsImage } = value.postsRef;
            return <PostsRefBlock slug={postsSlug} heading={postsHeading} image={postsImage} />;
        },
        videoRef: ({ value }) => {
            const { videoTitle, videoUrl, className } = value.videoRef;
            return <VideoRefBlock videoTitle={videoTitle} videoUrl={videoUrl} className={className} />;
        },

        imageRef: ({ value }) => {
            const { image, className } = value;
            return <ImageRefBlock image={image} className={className} />;
        },
        audioRef: ({ value }) => {
            const { audioTitle, audioFileUrl } = value.audioRefData || {};

            return <AudioRefBlock audioFileUrl={audioFileUrl} audioTitle={audioTitle} />;
        },
        quoteRef: ({ value }) => {
            const { quoteTitle, quoteImage, className } = value.quoteRef || {};

            return <QuoteRefBlock quote={quoteTitle} image={quoteImage} className={className} />;
        },
    },
};

const LightTemplate = {
    block: {
        normal: (props) => <NormalText {...props} theme='light' />,
        h1: ({ children }) => (
            <Heading level={1} theme='light'>
                {children}
            </Heading>
        ),
        h2: ({ children }) => (
            <Heading level={2} theme='light'>
                {children}
            </Heading>
        ),
        h3: ({ children }) => (
            <Heading level={3} theme='light'>
                {children}
            </Heading>
        ),
        h4: ({ children }) => (
            <Heading level={4} theme='light'>
                {children}
            </Heading>
        ),
        h5: ({ children }) => (
            <Heading level={5} theme='light'>
                {children}
            </Heading>
        ),
        h6: ({ children }) => (
            <Heading level={6} theme='light'>
                {children}
            </Heading>
        ),
    },
    list: {
        bullet: (props) => <List type='bullet' {...props} theme='light' />,
        number: (props) => <List type='number' {...props} theme='light' />,
    },
    marks: {
        internalLink: ({ value, children }) => {
            const { slug = {}, theme } = value;
            return (
                <InternalLink slug={slug?.current} theme={theme}>
                    {children}
                </InternalLink>
            );
        },
    },
    types: {
        postsRef: ({ value }) => {
            const { postsHeading, postsSlug, postsImage } = value.postsRef;
            return <PostsRefBlock slug={postsSlug} heading={postsHeading} image={postsImage} />;
        },
        videoRef: ({ value }) => {
            const { videoTitle, videoUrl, className } = value.videoRef;

            return <VideoRefBlock videoTitle={videoTitle} videoUrl={videoUrl} className={className} />;
        },

        imageRef: ({ value }) => {
            const { image, className } = value;
            return <ImageRefBlock image={image} className={className} />;
        },
        audioRef: ({ value }) => {
            return <AudioRefBlock {...(value.audioRefData || {})} />;
        },
        quoteRef: ({ value }) => {
            const { quoteTitle, quoteImage, className } = value.quoteRef || {};

            return <QuoteRefBlock quote={quoteTitle} image={quoteImage} className={className} />;
        },
    },
};
const VideoTemplate = {
    block: {
        normal: (props) => <NormalText {...props} theme='light' />,
        h1: (props) => <NormalText {...props} theme='light' />,
        h2: (props) => <NormalText {...props} theme='light' />,
        h3: (props) => <NormalText {...props} theme='light' />,
    },
    list: {
        bullet: (props) => <List type='bullet' {...props} theme='light' />,
        number: (props) => <List type='number' {...props} theme='light' />,
    },
};

export { DarkTemplate, LightTemplate, VideoTemplate };
