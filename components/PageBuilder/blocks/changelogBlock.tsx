"use client";

import { BackgroundGrid } from "@/components/Backgrounds/BackgroundGrid";
import { ChangelogTemplate } from "@/components/PageBuilder/templates/ChangelogTemplate";
import { getChangeLog } from "@/lib/sanity/lib/queries";
import type { ChangelogEntry } from "@/types/types";
import { PortableText } from "@portabletext/react";
import { useQuery } from "@tanstack/react-query";
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
			return "bg-blue-500/10 text-blue-400 border-blue-500/20";
		case "bugfix":
			return "bg-amber-500/10 text-amber-400 border-amber-500/20";
		case "improvement":
			return "bg-blue-500/10 text-blue-400 border-blue-500/20";
		case "breaking":
			return "bg-red-500/10 text-red-400 border-red-500/20";
		default:
			return "bg-neutral-500/10 primary-text border-neutral-500/20";
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
		<BackgroundGrid>
			{/* Hero Section */}
			<section className="relative overflow-hidden py-32">
				<div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
				<div className="mx-auto max-w-7xl px-8">
					{/* Header */}
					<div className="flex flex-col items-center text-center">
						<motion.div
							initial={{ opacity: 0, y: 20 }}
							animate={{ opacity: 1, y: 0 }}
							transition={{ duration: 0.5 }}
							className="mb-8"
						>
							<h1 className="text-neutral-gradient font-outfit text-6xl font-bold tracking-tight text-transparent lg:text-7xl">
								{title}
							</h1>
							<p className="font-kodemono mt-6 text-lg primary-text">
								{subtitle}
							</p>
						</motion.div>
					</div>

					{/* Changelog Entries */}
					<div className="mx-auto mt-12 max-w-4xl">
						<div className="relative space-y-8">
							<div className="absolute top-0 left-0 h-full w-[1px] bg-[#32353C] lg:left-[29px]" />

							{entries.map((entry: ChangelogEntry, index: number) => (
								<motion.div
									key={entry._id}
									initial={{ opacity: 0, y: 20 }}
									whileInView={{ opacity: 1, y: 0 }}
									transition={{ duration: 0.5, delay: index * 0.1 }}
									className="group relative ml-4 rounded-xl border border-[#1C1E23] bg-black/90 p-8 backdrop-blur-md transition-all duration-200 hover:bg-black/95 lg:ml-16"
								>
									{/* Card gradient effects */}
									<div className="pointer-events-none absolute inset-0 rounded-xl">
										<div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]" />
										<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
									</div>

									{/* Timeline dot and connector */}
									<div className="absolute -left-[40px] flex h-full w-12 flex-col items-center lg:-left-[60px]">
										<div className="relative top-0 z-10 flex h-4 w-4 items-center justify-center">
											<div className="absolute h-4 w-4 rounded-full border border-[#1C1E23]  bg-black" />
										</div>
										<div className="absolute top-[8px] left-1/2 h-[1px] w-[16px] bg-[#32353C] lg:w-[36px]" />
									</div>

									<div className="space-y-6">
										{/* Header */}
										<div className="flex flex-col items-start justify-between gap-2">
											<div
												className={`rounded-md border px-3 py-1 text-xs ${getTypeColor(entry.type)}`}
											>
												{entry.type}
											</div>
											<div>
												<h2 className="font-outfit text-4xl font-bold text-white/90">
													{entry.title}
												</h2>
												<div className="mt-2 flex items-center gap-4">
													<span className="font-kodemono text-sm primary-text">
														v{entry.version}
													</span>
													<span className="font-kodemono text-sm primary-text">
														{new Date(entry.releaseDate).toLocaleDateString()}
													</span>
												</div>
											</div>
										</div>

										{/* Description */}
										<p className="font-kodemono text-lg primary-text">
											{entry.description}
										</p>

										{/* Contributors */}
										{entry.contributors && entry.contributors.length > 0 && (
											<div className="mt-6 flex items-center gap-2">
												<span className="font-kodemono text-sm primary-text/50">
													Contributors:
												</span>
												<div className="flex -space-x-2">
													{entry.contributors.map((contributor) => (
														<div
															key={contributor._id}
															className="relative h-8 w-8 rounded-full border-2 border-black"
														>
															<img
																src={contributor.image.asset.url}
																alt={contributor.name}
																className="h-full w-full rounded-full object-cover"
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

										{/* Read More Button */}
										<button
											onClick={() => toggleEntry(entry._id)}
											className="group relative ml-auto flex items-center overflow-hidden rounded-lg border border-[#1C1E23] bg-white/[0.02] px-6 py-2 transition-all duration-200 hover:bg-[#1C1E23]"
										>
											<div className="pointer-events-none absolute inset-0">
												<div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_30%)]" />
												<div className="absolute inset-x-0 top-0 h-px bg-linear-to-r from-transparent via-white/30 to-transparent" />
											</div>
											<span className="font-kodemono text-sm primary-text">
												{expandedEntries.has(entry._id)
													? "Show Less"
													: "Read More"}
											</span>
										</button>
									</div>
								</motion.div>
							))}
						</div>
					</div>
				</div>
			</section>
		</BackgroundGrid>
	);
}
