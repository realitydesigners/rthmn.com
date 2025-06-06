import type { PortableTextComponents } from "@portabletext/react";
import React from "react";

export const ChangelogTemplate: PortableTextComponents = {
	block: {
		normal: ({ children }) => (
			<div className="mb-4">
				<p className="font-kodemono leading-relaxed text-white/70">{children}</p>
			</div>
		),
		h1: ({ children }) => (
			<h1 className="font-russo mb-6 text-3xl leading-relaxed font-bold text-white">
				{children}
			</h1>
		),
		h2: ({ children }) => (
			<h2 className="font-russo mb-4 text-2xl leading-relaxed font-bold text-white">
				{children}
			</h2>
		),
		h3: ({ children }) => (
			<h3 className="font-russo mb-3 text-xl leading-relaxed font-bold text-white">
				{children}
			</h3>
		),
		h4: ({ children }) => (
			<h4 className="font-russo mb-2 text-lg leading-relaxed font-bold text-white">
				{children}
			</h4>
		),
	},
	list: {
		bullet: ({ children }) => (
			<ul className="mb-6 list-disc space-y-2 pl-4 font-kodemono text-white/70">
				{children}
			</ul>
		),
		number: ({ children }) => (
			<ol className="mb-6 list-decimal space-y-2 pl-4 font-kodemono text-white/70">
				{children}
			</ol>
		),
	},
	listItem: {
		bullet: ({ children }) => (
			<li className="leading-relaxed text-white/70">{children}</li>
		),
		number: ({ children }) => (
			<li className="leading-relaxed text-white/70">{children}</li>
		),
	},
	marks: {
		strong: ({ children }) => (
			<strong className="font-bold text-[#24FF66]">{children}</strong>
		),
		em: ({ children }) => <em className="text-white/60 italic">{children}</em>,
		code: ({ children }) => (
			<code className="rounded-sm bg-[#1C1E23] px-1.5 py-0.5 font-mono text-sm text-[#24FF66] border border-[#24FF66]/30">
				{children}
			</code>
		),
		link: ({ children, value }) => (
			<a
				href={value?.href}
				className="font-bold text-[#24FF66] hover:text-[#1ECC52] underline transition-colors duration-300"
				target="_blank"
				rel="noopener noreferrer"
			>
				{children}
			</a>
		),
	},
};
