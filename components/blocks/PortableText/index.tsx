import { PortableText as SanityPortableText } from '@portabletext/react';
import type { PortableTextComponents } from '@portabletext/react';
import { AboutTemplate } from '@/components/blocks/templates/AboutTemplate';
import { ChangelogTemplate } from '@/components/blocks/templates/ChangelogTemplate';

interface PortableTextProps {
  value: any;
  template?: 'about' | 'changelog' | 'default';
  components?: Partial<PortableTextComponents>;
}

export function PortableText({
  value,
  template = 'default',
  components
}: PortableTextProps) {
  const getTemplate = () => {
    switch (template) {
      case 'about':
        return AboutTemplate;
      case 'changelog':
        return ChangelogTemplate;
      default:
        return components || {};
    }
  };

  return <SanityPortableText value={value} components={getTemplate()} />;
}
