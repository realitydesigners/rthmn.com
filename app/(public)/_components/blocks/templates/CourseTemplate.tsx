'use client';

import React from 'react';
import { generateHeadingId } from '@/app/(public)/_components/TOC';
import AudioRefBlock from '../nested/AudioRefBlock';
import ImageRefBlock from '../nested/ImageRefBlock';
import InternalLink from '../nested/InternalLink';
import PostsRefBlock from '../nested/PostsRefBlock';
import QuoteRefBlock from '../nested/QuoteRefBlock';
import SplineRefBlock from '../nested/SplineRefBlock';
import VideoRefBlock from '../nested/VideoRefBlock';
import Callout from '../nested/Callout';
import Quiz from '../nested/Quiz';

const baseStyles = {
    text: ' w-full font-outfit text-gray-200 leading-[1.4em] tracking-wide',
    container: 'w-full max-w-4xl mx-auto',
    heading: 'font-bold scroll-mt-24',
};

const Text = ({ children, value }: { children: React.ReactNode; value?: any }) => {
    // Handle headings
    if (value?.style?.match(/^h[1-6]$/)) {
        const level = parseInt(value.style[1]);
        const text = React.Children.toArray(children)
            .map((child) => (typeof child === 'string' ? child : ''))
            .join('')
            .trim();

        const id = generateHeadingId(text);
        const fontSize = level === 1 ? 'text-3xl lg:text-4xl' : level === 2 ? 'text-2xl lg:text-3xl' : 'text-xl lg:text-2xl';

        const Tag = level <= 3 ? `h${level}` : 'h3';
        return React.createElement(
            Tag,
            {
                id,
                className: `${baseStyles.text} ${baseStyles.heading} ${fontSize} mb-4`,
            },
            children
        );
    }

    // Regular text
    return <p className={`${baseStyles.text} mb-4 text-lg`}>{children}</p>;
};

const List = ({ children, type }: { children: React.ReactNode; type: 'bullet' | 'number' }) => {
    const Tag = type === 'bullet' ? 'ul' : 'ol';
    return <Tag className={`${baseStyles.text} list-${type} mb-6 ml-4 list-inside space-y-2`}>{children}</Tag>;
};

export const CourseTemplate = {
    block: {
        h1: ({ children }) => <Text value={{ style: 'h1' }}>{children}</Text>,
        h2: ({ children }) => <Text value={{ style: 'h2' }}>{children}</Text>,
        h3: ({ children }) => <Text value={{ style: 'h3' }}>{children}</Text>,
        h4: ({ children }) => <Text value={{ style: 'h3' }}>{children}</Text>,
        h5: ({ children }) => <Text value={{ style: 'h3' }}>{children}</Text>,
        h6: ({ children }) => <Text value={{ style: 'h3' }}>{children}</Text>,
    },
    list: {
        bullet: (props) => <List type='bullet' {...props} />,
        number: (props) => <List type='number' {...props} />,
    },
    marks: {
        internalLink: ({ value, children }) => (
            <InternalLink slug={value?.slug?.current} theme='dark'>
                {children}
            </InternalLink>
        ),
    },
    types: {
        postsRef: ({ value }) => <PostsRefBlock slug={value.postsRef?.postsSlug} heading={value.postsRef?.postsHeading} image={value.postsRef?.postsImage} />,
        videoRef: ({ value }) => <VideoRefBlock videoTitle={value.videoRef?.videoTitle} videoUrl={value.videoRef?.videoUrl} className={value.videoRef?.className} />,
        spline: ({ value }) => <SplineRefBlock url={value.url} />,
        imageRef: ({ value }) => <ImageRefBlock image={value.image} className={value.className} />,
        audioRef: ({ value }) => <AudioRefBlock audioFileUrl={value.audioRefData?.audioFileUrl} audioTitle={value.audioRefData?.audioTitle} />,
        quoteRef: ({ value }) => <QuoteRefBlock quote={value.quoteRef?.quoteTitle} image={value.quoteRef?.quoteImage} className={value.quoteRef?.className} />,
        callout: ({ value }) => <Callout type={value.type} title={value.title} points={value.points} />,
        quiz: ({ value }) => <Quiz question={value.question} options={value.options} correctAnswer={value.correctAnswer} explanation={value.explanation} />,
    },
};
