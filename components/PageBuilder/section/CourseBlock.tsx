'use client';

import React from 'react';
import { PortableText } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';
import { DarkTemplate, LightTemplate, VideoTemplate } from '@/components/PageBuilder/templates/Templates';
import { CourseTemplate } from '@/components/PageBuilder/templates/CourseTemplate';

const templateStyles = {
    dark: 'w-full bg-black',
    light: 'w-full bg-neutral-200',
};

const templateComponents = {
    dark: DarkTemplate as PortableTextComponents,
    light: LightTemplate as PortableTextComponents,
    video: VideoTemplate as PortableTextComponents,
    course: CourseTemplate as PortableTextComponents,
};

const CourseBlock = ({ block }) => {
    const { content, layout } = block;
    const theme = layout || 'dark';
    const styles = templateStyles[theme];

    return (
        <div className={`relative w-full ${styles}`}>
            <PortableText value={content} components={templateComponents[theme]} />
        </div>
    );
};

export default CourseBlock;
