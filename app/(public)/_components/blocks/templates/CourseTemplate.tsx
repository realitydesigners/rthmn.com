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

import type { PortableTextComponents } from '@portabletext/react';

export const CourseTemplate: PortableTextComponents = {
    block: {
        normal: ({ children }) => (
            <div className='mb-4'>
                <p className={`font-outfit leading-relaxed text-gray-400`}>{children}</p>
            </div>
        ),
        h1: ({ children }) => <h1 className={`font-outfit mb-6 text-3xl leading-relaxed font-bold text-gray-400`}>{children}</h1>,
        h2: ({ children }) => <h2 className={`font-outfit mb-4 text-2xl leading-relaxed font-bold text-white`}>{children}</h2>,
        h3: ({ children }) => <h3 className={`font-outfit mb-3 text-xl leading-relaxed font-bold text-white`}>{children}</h3>,
        h4: ({ children }) => <h4 className={`font-outfit mb-2 text-lg leading-relaxed font-bold text-white`}>{children}</h4>,
        bullet: ({ children }) => <li className='font-outfit leading-relaxed text-gray-400'>{children}</li>,
        number: ({ children }) => <li className='font-outfit leading-relaxed text-gray-400'>{children}</li>,
    },
    list: {
        bullet: ({ children }) => (
            <div className='flex w-full justify-center p-3'>
                <ul className='font-outfit w-full list-disc space-y-2 pl-4 text-white/70 md:w-3/4 lg:w-1/2'>{children}</ul>
            </div>
        ),
        number: ({ children }) => (
            <div className='flex w-full justify-center p-3'>
                <ol className='font-outfit w-full list-decimal space-y-2 pl-4 text-white/70 md:w-3/4 lg:w-1/2'>{children}</ol>
            </div>
        ),
    },
    marks: {
        strong: ({ children }) => <strong className='font-bold text-white'>{children}</strong>,
        em: ({ children }) => <em className='text-gray-300 italic'>{children}</em>,
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
    },
};
