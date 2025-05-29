import type { PortableTextComponents } from "@portabletext/react";
import React from "react";

export const ChangelogTemplate: PortableTextComponents = {
	block: {
		normal: ({ children }) => (
			<div className="mb-4">
				<p className={`font-russo leading-relaxed primary-text`}>{children}</p>
			</div>
		),
		h1: ({ children }) => (
			<h1
				className={`font-russo mb-6 text-3xl leading-relaxed font-bold primary-text`}
			>
				{children}
			</h1>
		),
		h2: ({ children }) => (
			<h2
				className={`font-russo mb-4text-2xl leading-relaxed font-bold text-white`}
			>
				{children}
			</h2>
		),
		h3: ({ children }) => (
			<h3
				className={`font-russo mb-3 text-xl leading-relaxed font-bold text-white`}
			>
				{children}
			</h3>
		),
		h4: ({ children }) => (
			<h4
				className={`font-russo mb-2 text-lg leading-relaxed font-bold text-white`}
			>
				{children}
			</h4>
		),
	},
	list: {
		bullet: ({ children }) => (
			<ul className={`mb-6 list-disc space-y-2 pl-4 font-mono primary-text`}>
				{children}
			</ul>
		),
		number: ({ children }) => (
			<ol className={`mb-6 list-decimal space-y-2 pl-4 font-mono primary-text`}>
				{children}
			</ol>
		),
	},
	listItem: {
		bullet: ({ children }) => (
			<li className="leading-relaxed primary-text">{children}</li>
		),
		number: ({ children }) => (
			<li className="leading-relaxed primary-text">{children}</li>
		),
	},
	marks: {
		strong: ({ children }) => (
			<strong className="font-bold text-white">{children}</strong>
		),
		em: ({ children }) => <em className="primary-text italic">{children}</em>,
		code: ({ children }) => (
			<code className="rounded-sm bg-neutral-800/50 px-1.5 py-0.5 font-mono text-sm text-pink-400">
				{children}
			</code>
		),
		link: ({ children, value }) => (
			<a
				href={value?.href}
				className="font-bold text-white underline"
				target="_blank"
				rel="noopener noreferrer"
			>
				{children}
			</a>
		),
	},
};
