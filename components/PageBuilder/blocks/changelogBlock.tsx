"use client";

import { ChangelogTemplate } from "@/components/PageBuilder/templates/ChangelogTemplate";
import type { ChangelogEntry } from "@/types/types";
import { PortableText } from "@portabletext/react";
import { motion } from "framer-motion";
import { useState } from "react";

export interface ChangelogBlockProps {
	_type: "changelogBlock";
	_key: string;
	title?: string;
	subtitle?: string;
	entries: ChangelogEntry[];
}

function getTypeColor(type: string) {
	switch (type) {
		case "feature":
			return "bg-[#24FF66]/10 text-[#24FF66] border-[#24FF66]/20";
		case "bugfix":
			return "bg-amber-500/10 text-amber-400 border-amber-500/20";
		case "improvement":
			return "bg-[#24FF66]/10 text-[#24FF66] border-[#24FF66]/20";
		case "breaking":
			return "bg-red-500/10 text-red-400 border-red-500/20";
		default:
			return "bg-white/5 text-white/60 border-white/10";
	}
}

export function ChangelogBlock({
	title = "Changelog",
	subtitle = "Track our journey as we build the future of data visualization for trading and investing.",
	entries = [],
}: ChangelogBlockProps) {
	// Track which entries are expanded
	const [expandedEntries, setExpandedEntries] = useState<Set<string>>(
		new Set(),
	);

	const toggleEntry = (id: string) => {
		setExpandedEntries((prev) => {
			const newSet = new Set(prev);
			if (newSet.has(id)) {
				newSet.delete(id);
			} else {
				newSet.add(id);
			}
			return newSet;
		});
	};

	return (
		<section className="relative overflow-hidden bg-black py-32">
			<div className="mx-auto max-w-7xl px-8">
				{/* Header */}
				<div className="flex flex-col items-center text-center">
					<div className="mb-8">
						<h1 className="font-russo text-6xl font-bold tracking-tight text-white lg:text-7xl uppercase">
							{title}
						</h1>
						<p className="font-kodemono mt-6 text-lg text-white/60">
							{subtitle}
						</p>
					</div>
				</div>

				{/* Changelog Entries */}
				<div className="mx-auto mt-12 max-w-4xl">
					<div className="relative space-y-8">
						<div className="absolute top-0 left-0 h-full w-[1px] bg-[#1C1E23] lg:left-[29px]" />

						{entries.map((entry: ChangelogEntry, index: number) => (
							<div
								key={entry._id}
								onClick={() => toggleEntry(entry._id)}
								className="group relative ml-4 rounded-xl border border-[#1C1E23]/60 bg-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-8 transition-all duration-300 hover:border-[#24FF66]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] lg:ml-16 cursor-pointer"
							>
								{/* Top highlight */}
								<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

								{/* Timeline dot and connector */}
								<div className="absolute -left-[40px] flex h-full w-12 flex-col items-center lg:-left-[60px]">
									<div className="relative top-0 z-10 flex h-4 w-4 items-center justify-center">
										<div className="absolute h-4 w-4 rounded-full border border-[#24FF66]/50 bg-black">
											<div className="absolute inset-1 rounded-full bg-[#24FF66]"></div>
										</div>
									</div>
									<div className="absolute top-[8px] left-1/2 h-[1px] w-[16px] bg-[#1C1E23] lg:w-[36px]" />
								</div>

								<div className="space-y-6">
									{/* Header */}
									<div className="flex flex-col items-start justify-between gap-2">
										<div
											className={`rounded-md border px-3 py-1 text-xs font-semibold uppercase tracking-wider ${getTypeColor(entry.type)}`}
										>
											{entry.type}
										</div>
										<div>
											<h2 className="font-russo text-4xl font-bold text-white">
												{entry.title}
											</h2>
											<div className="mt-2 flex items-center gap-4">
												<span className="font-kodemono text-sm text-[#24FF66]">
													v{entry.version}
												</span>
												<span className="font-kodemono text-sm text-white/60">
													{new Date(entry.releaseDate).toLocaleDateString()}
												</span>
											</div>
										</div>
									</div>

									{/* Description */}
									<p className="font-kodemono text-lg text-white/70">
										{entry.description}
									</p>

									{/* Contributors */}
									{entry.contributors && entry.contributors.length > 0 && (
										<div className="mt-6 flex items-center gap-2">
											<span className="font-kodemono text-sm text-white/50">
												Contributors:
											</span>
											<div className="flex -space-x-2">
												{entry.contributors.map((contributor) => (
													<div
														key={contributor._id}
														className="relative h-8 w-8 rounded-full border-2 border-[#24FF66]/30"
													>
														<img
															src={contributor.image.asset.url}
															alt={contributor.name}
															className="h-full w-full bg-black rounded-full object-cover"
														/>
													</div>
												))}
											</div>
										</div>
									)}

									{/* Expandable Content */}
									<motion.div
										initial={false}
										animate={{
											height: expandedEntries.has(entry._id) ? "auto" : 0,
										}}
										className="overflow-hidden"
									>
										<div className="prose prose-invert max-w-none pt-6">
											<PortableText
												value={entry.content}
												components={ChangelogTemplate}
											/>
										</div>
									</motion.div>

									{/* Expand Indicator */}
									<div className="flex items-center gap-2">
										<span className="font-kodemono text-sm text-white/70 group-hover:text-[#24FF66] transition-colors duration-300">
											{expandedEntries.has(entry._id)
												? "Click to show less"
												: "Click to read more"}
										</span>
										<motion.div
											animate={{ rotate: expandedEntries.has(entry._id) ? 180 : 0 }}
											transition={{ duration: 0.3 }}
											className="text-white/70 group-hover:text-[#24FF66] transition-colors duration-300"
										>
											<svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
												<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
											</svg>
										</motion.div>
									</div>
								</div>
							</div>
						))}
					</div>
				</div>
			</div>
		</section>
	);
}
