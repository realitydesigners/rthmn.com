'use client';

import { useEffect, useState } from 'react';
import { BlockProps } from '@/components/blocks/Blocks';
import { PortableTextBlock } from '@portabletext/types';

interface TOCItem {
  id: string;
  text: string;
  level: number;
}

interface ContentBlock extends BlockProps {
  content: PortableTextBlock[];
}

export function TableOfContents({ blocks }: { blocks: BlockProps[] }) {
  const [headings, setHeadings] = useState<TOCItem[]>([]);

  useEffect(() => {
    const extractHeadings = () => {
      const items: TOCItem[] = [];

      blocks?.forEach((block) => {
        if (block._type === 'contentBlock') {
          const contentBlock = block as ContentBlock;

          contentBlock.content?.forEach((content: PortableTextBlock) => {
            if (
              content.style?.startsWith('h') &&
              Array.isArray(content.children) &&
              content.children[0]?.text
            ) {
              const level = parseInt(content.style[1]);
              const text = content.children[0].text;
              const id = text.toLowerCase().replace(/\s+/g, '-');

              items.push({
                id,
                text,
                level
              });
            }
          });
        }
      });

      setHeadings(items);
    };

    extractHeadings();
  }, [blocks]);

  if (headings.length === 0) return null;

  return (
    <nav className="sticky top-24 ml-8 hidden w-64 self-start lg:block">
      <h4 className="text-muted-foreground mb-4 text-sm font-semibold">
        On this page
      </h4>
      <ul className="space-y-3 text-sm">
        {headings.map((heading) => (
          <li
            key={heading.id}
            style={{ paddingLeft: `${(heading.level - 1) * 16}px` }}
          >
            <a
              href={`#${heading.id}`}
              className="text-muted-foreground hover:text-primary inline-block transition-colors"
            >
              {heading.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
