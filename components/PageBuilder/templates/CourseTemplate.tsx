'use client';

import React from 'react';
import { generateHeadingId } from '@/app/(public)/learn/_components/TOC';
import AudioRefBlock from '../nested/AudioRefBlock';
import ImageRefBlock from '../nested/ImageRefBlock';
import InternalLink from '../nested/InternalLink';
import PostsRefBlock from '../nested/PostsRefBlock';
import QuoteRefBlock from '../nested/QuoteRefBlock';
import SplineRefBlock from '../nested/SplineRefBlock';
import VideoRefBlock from '../nested/VideoRefBlock';
import Callout from '../nested/Callout';
import Quiz from '../nested/Quiz';
import BoxCourseVisualizer from '../nested/BoxCourseVisualizer';

import type { PortableTextComponents } from '@portabletext/react';

export const CourseTemplate: PortableTextComponents = {
    block: {
        normal: ({ children }) => (
            <div className='mb-4'>
                <p className={`font-outfit text-xl leading-relaxed text-gray-400`}>{children}</p>
            </div>
        ),
        h1: ({ children }) => {
            const id = generateHeadingId(children?.toString() || '');
            return (
                <h1 id={id} className={`font-outfit mb-6 text-3xl leading-[1.25em] font-bold text-gray-300 lg:text-6xl`}>
                    {children}
                </h1>
            );
        },
        h2: ({ children }) => {
            const id = generateHeadingId(children?.toString() || '');
            return (
                <h2 id={id} className={`font-outfit mb-4 scroll-mt-24 text-2xl leading-[1.25em] font-bold text-gray-300`}>
                    {children}
                </h2>
            );
        },
        h3: ({ children }) => {
            const id = generateHeadingId(children?.toString() || '');
            return (
                <h3 id={id} className={`font-outfit mb-3 scroll-mt-24 text-xl leading-[1.25em] font-bold text-gray-300`}>
                    {children}
                </h3>
            );
        },
        h4: ({ children }) => {
            const id = generateHeadingId(children?.toString() || '');
            return (
                <h4 id={id} className={`font-outfit mb-2 scroll-mt-24 text-lg leading-relaxed font-bold text-gray-300`}>
                    {children}
                </h4>
            );
        },
        bullet: ({ children }) => <li className='font-outfit py-1 leading-relaxed text-gray-400 marker:text-white'>{children}</li>,
        number: ({ children }) => <li className='font-outfit py-1 leading-relaxed text-gray-400 marker:text-white'>{children}</li>,
    },
    list: {
        bullet: ({ children }) => (
            <div className='my-4 w-full'>
                <ul className='font-outfit w-full list-disc space-y-1 pr-4 pl-8 text-gray-400'>{children}</ul>
            </div>
        ),
        number: ({ children }) => (
            <div className='my-4 w-full'>
                <ol className='font-outfit w-full list-decimal space-y-1 pr-4 pl-8 text-gray-400'>{children}</ol>
            </div>
        ),
    },
    marks: {
        strong: ({ children }) => <strong className='font-bold text-gray-400'>{children}</strong>,
        em: ({ children }) => <em className='text-gray-400 italic'>{children}</em>,
        code: ({ children }) => <code className='rounded-sm bg-gray-800/50 px-1.5 py-0.5 font-mono text-sm text-pink-400'>{children}</code>,
        link: ({ children, value }) => (
            <a href={value?.href} className='font-bold text-white underline' target='_blank' rel='noopener noreferrer'>
                {children}
            </a>
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
        boxVisualizer: ({ value }) => {
            console.log('BoxVisualizer raw value:', value);
            const boxVisualizerValue = {
                title: value.title,
                description: value.description,
                mode: value.mode,
                showLabels: value.showLabels,
                sequencesData: value.sequencesData,
                baseValuesData: value.baseValuesData,
                colorScheme: value.colorScheme,
                animationSpeed: value.animationSpeed,
                pauseDuration: value.pauseDuration,
            };
            console.log('BoxVisualizer processed value:', boxVisualizerValue);
            return <BoxCourseVisualizer value={boxVisualizerValue} />;
        },
    },
};
