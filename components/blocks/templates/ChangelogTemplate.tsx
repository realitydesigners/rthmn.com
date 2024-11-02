import React from 'react';
import { outfit } from '@/fonts';
import type { PortableTextComponents } from '@portabletext/react';

export const ChangelogTemplate: PortableTextComponents = {
  block: {
    normal: ({ children }) => (
      <div className="mb-4">
        <p className={`text-outfit text-base leading-relaxed text-gray-300`}>
          {children}
        </p>
      </div>
    ),
    h1: ({ children }) => (
      <h1
        className={`text-outfit mb-6 text-3xl font-bold leading-relaxed text-white`}
      >
        {children}
      </h1>
    ),
    h2: ({ children }) => (
      <h2
        className={`text-outfit mb-4 text-2xl font-bold leading-relaxed text-white`}
      >
        {children}
      </h2>
    ),
    h3: ({ children }) => (
      <h3
        className={`text-outfit mb-3 text-xl font-bold leading-relaxed text-white`}
      >
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4
        className={`text-outfit mb-2 text-lg font-bold leading-relaxed text-white`}
      >
        {children}
      </h4>
    )
  },
  list: {
    bullet: ({ children }) => (
      <ul className={`text-outfit mb-6 list-disc space-y-2 pl-4 text-gray-300`}>
        {children}
      </ul>
    ),
    number: ({ children }) => (
      <ol
        className={`text-outfit mb-6 list-decimal space-y-2 pl-4 text-gray-300`}
      >
        {children}
      </ol>
    )
  },
  listItem: {
    bullet: ({ children }) => (
      <li className="leading-relaxed text-gray-300">{children}</li>
    ),
    number: ({ children }) => (
      <li className="leading-relaxed text-gray-300">{children}</li>
    )
  },
  marks: {
    strong: ({ children }) => (
      <strong className="font-bold text-white">{children}</strong>
    ),
    em: ({ children }) => <em className="italic text-gray-300">{children}</em>,
    code: ({ children }) => (
      <code className="rounded bg-gray-800/50 px-1.5 py-0.5 font-mono text-sm text-pink-400">
        {children}
      </code>
    ),
    link: ({ children, value }) => (
      <a
        href={value?.href}
        className="text-blue-400 hover:text-blue-300 hover:underline"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    )
  }
};
