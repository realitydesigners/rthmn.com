import { PortableText as SanityPortableText } from '@portabletext/react';
import { AboutTemplate } from '../blocks/templates/AboutTemplate';

export function PortableText({ value }: { value: any }) {
  return <SanityPortableText value={value} components={AboutTemplate} />;
}
