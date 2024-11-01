'use client';
import React from 'react';
import {
  DarkTemplate,
  LightTemplate,
  VideoTemplate
} from '@/components/blocks/templates/Templates';
import {
  ContentBlockProps,
  LayoutTheme,
  TemplateTheme
} from '@/components/blocks/Blocks';
import { PortableText } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';

const templateStyles: Record<TemplateTheme, string> = {
  dark: 'w-full bg-black',
  light: 'w-full bg-gray-200'
};

const templateComponents: Record<LayoutTheme, PortableTextComponents> = {
  dark: DarkTemplate as unknown as PortableTextComponents,
  light: LightTemplate as unknown as PortableTextComponents,
  video: VideoTemplate as unknown as PortableTextComponents
};

const ContentBlock: React.FC<ContentBlockProps> = ({ block }) => {
  const { content, layout } = block;
  const theme = layout || 'dark';
  const styles = templateStyles[theme];

  return (
    <div className={`relative w-full ${styles}`}>
      <PortableText value={content} components={templateComponents[theme]} />
    </div>
  );
};

export default React.memo(ContentBlock);
