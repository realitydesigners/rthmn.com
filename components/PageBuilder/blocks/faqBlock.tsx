"use client";
import { ChangelogTemplate } from "@/components/PageBuilder/templates/ChangelogTemplate";
import { PortableText } from "@portabletext/react";
import { motion } from "framer-motion";
import { AnimatePresence } from "motion/react";
import { memo, useMemo, useState } from "react";
import {
	FaChevronDown,
	FaCommentAlt,
	FaQuestionCircle,
	FaSearch,
	FaTags,
} from "react-icons/fa";
import { useInView } from "react-intersection-observer";

export interface FAQBlockProps {
	_type?: "faqBlock";
	_key?: string;
	title?: string;
	items: FAQItem[];
}

interface FAQItem {
	_id: string;
	question: string;
	answer: any[];
	category?: string;
	isPublished: boolean;
}

const ITEMS_PER_PAGE = 5;
const LOAD_MORE_COUNT = 10;

const FAQItem = memo(
	({
		item,
		isActive,
		onClick,
		index,
	}: {
		item: FAQItem;
		isActive: boolean;
		onClick: () => void;
		index: number;
	}) => {
		const { ref, inView } = useInView({
			threshold: 0.2,
			triggerOnce: true,
		});

		return (
			<motion.div
				ref={ref}
				initial={{ opacity: 0, y: 20 }}
				animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
				transition={{ duration: 0.5, delay: index * 0.1 }}
				className="group relative"
			>
				<div
					className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
						isActive
							? "border-[#24FF66]/50 bg-black shadow-lg shadow-[#24FF66]/10"
							: "border-[#1C1E23]/60 bg-black shadow-[0_8px_32px_rgba(0,0,0,0.4)] hover:border-[#24FF66]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)]"
					}`}
				>
					{/* Top highlight */}
					<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

					<button
						type="button"
						onClick={onClick}
						className="flex w-full cursor-pointer items-center justify-between p-6"
					>
						<div className="flex items-center gap-4">
							<FaQuestionCircle
								className={`min-h-5 min-w-5 transition-all duration-300 ${isActive ? "text-[#24FF66]" : "text-white/60 group-hover:text-white/80"}`}
							/>
							<h3 className="text-left text-lg font-medium text-white group-hover:text-[#24FF66] transition-colors duration-300">
								{item.question}
							</h3>
						</div>
						<motion.div
							animate={{ rotate: isActive ? 180 : 0 }}
							transition={{ duration: 0.3 }}
							className={`transition-colors duration-300 ${isActive ? "text-[#24FF66]" : "text-white/60 group-hover:text-white/80"}`}
						>
							<FaChevronDown className="h-5 w-5" />
						</motion.div>
					</button>

					<motion.div
						initial={false}
						animate={{
							height: isActive ? "auto" : 0,
							opacity: isActive ? 1 : 0,
						}}
						transition={{ duration: 0.3 }}
						className="overflow-hidden"
					>
						<div className="border-t border-[#1C1E23]/60 px-6 py-6">
							<div className="flex gap-4">
								<div className="mt-2 flex h-5 w-5 shrink-0 items-center justify-center">
									<FaCommentAlt className="min-h-5 min-w-5 text-[#24FF66]" />
								</div>
								<div className="prose prose-invert max-w-none text-base leading-relaxed text-white/70">
									<PortableText
										value={item.answer}
										components={ChangelogTemplate}
									/>
								</div>
							</div>
							{item.category && (
								<div className="mt-4 flex items-center gap-2">
									<span className="inline-flex items-center px-3 py-1 rounded-full bg-gradient-to-r from-[#24FF66]/20 to-[#24FF66]/10 border border-[#24FF66]/30 text-xs font-semibold text-[#24FF66] uppercase tracking-wider">
										{item.category}
									</span>
								</div>
							)}
						</div>
					</motion.div>

					{/* Bottom accent line */}
					<div
						className={`absolute bottom-0 left-0 h-px bg-gradient-to-r from-[#24FF66] to-transparent transition-all duration-500 ${isActive ? "w-full" : "w-0 group-hover:w-full"}`}
					/>
				</div>
			</motion.div>
		);
	},
);

FAQItem.displayName = "FAQItem";

const SearchInput = memo(
	({
		value,
		onChange,
	}: {
		value: string;
		onChange: (value: string) => void;
	}) => (
		<div className="group relative mb-8">
			<div className="relative overflow-hidden rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] transition-all duration-300 focus-within:border-[#24FF66]/50 focus-within:shadow-[0_12px_40px_rgba(0,0,0,0.6)]">
				{/* Background glow */}
				<div className="pointer-events-none absolute inset-px rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-500 group-focus-within:opacity-100" />

				{/* Top highlight */}
				<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

				{/* Hover glow effect */}
				<div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-[#24FF66]/5 to-transparent opacity-0 group-focus-within:opacity-100 transition-opacity duration-500" />

				<div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4 z-10">
					<FaSearch className="h-5 w-5 text-white/60 transition-colors duration-300 group-focus-within:text-[#24FF66]" />
				</div>
				<input
					type="text"
					value={value}
					onChange={(e) => onChange(e.target.value)}
					placeholder="Search questions..."
					className="relative z-10 w-full bg-transparent py-4 pr-4 pl-12 text-white placeholder-white/40 focus:outline-none"
				/>
			</div>
		</div>
	),
);

SearchInput.displayName = "SearchInput";

const CategoryFilter = memo(
	({
		categories,
		selected,
		onSelect,
	}: {
		categories: string[];
		selected: string;
		onSelect: (category: string) => void;
	}) => (
		<div className="mb-8 flex flex-wrap gap-2">
			<button
				type="button"
				onClick={() => onSelect("all")}
				className={`group relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300 overflow-hidden ${
					selected === "all"
						? "border-[#24FF66]/50 bg-gradient-to-r from-[#24FF66]/20 to-[#24FF66]/10 text-[#24FF66] shadow-lg shadow-[#24FF66]/10"
						: "border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm text-white/60 hover:border-[#24FF66]/30 hover:text-white/80"
				}`}
			>
				{selected !== "all" && (
					<>
						{/* Background glow */}
						<div className="pointer-events-none absolute inset-px rounded-full bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

						{/* Top highlight */}
						<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

						{/* Hover glow effect */}
						<div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-[#24FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
					</>
				)}
				<FaTags className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
				<span className="relative z-10">All</span>
			</button>
			{categories.map((category) => (
				<button
					type="button"
					key={category}
					onClick={() => onSelect(category)}
					className={`group relative flex items-center gap-2 rounded-full border px-4 py-2 text-sm capitalize transition-all duration-300 overflow-hidden ${
						selected === category
							? "border-[#24FF66]/50 bg-gradient-to-r from-[#24FF66]/20 to-[#24FF66]/10 text-[#24FF66] shadow-lg shadow-[#24FF66]/10"
							: "border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm text-white/60 hover:border-[#24FF66]/30 hover:text-white/80"
					}`}
				>
					{selected !== "all" && (
						<>
							{/* Background glow */}
							<div className="pointer-events-none absolute inset-px rounded-full bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

							{/* Top highlight */}
							<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

							{/* Hover glow effect */}
							<div className="pointer-events-none absolute inset-0 rounded-full bg-gradient-to-b from-[#24FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
						</>
					)}
					<FaTags className="relative z-10 h-4 w-4 transition-transform duration-300 group-hover:rotate-12" />
					<span className="relative z-10">{category}</span>
				</button>
			))}
		</div>
	),
);

CategoryFilter.displayName = "CategoryFilter";

const LoadMoreButton = memo(({ onClick }: { onClick: () => void }) => (
	<button
		type="button"
		onClick={onClick}
		className="group relative mt-8 flex w-full items-center justify-center rounded-xl border border-[#1C1E23]/60 bg-gradient-to-b from-[#0A0B0D]/95 via-[#070809]/90 to-[#050506]/85 backdrop-blur-sm shadow-[0_8px_32px_rgba(0,0,0,0.4)] p-4 text-white transition-all duration-300 hover:border-[#24FF66]/30 hover:shadow-[0_12px_40px_rgba(0,0,0,0.6)] overflow-hidden"
	>
		{/* Background glow */}
		<div className="pointer-events-none absolute inset-px rounded-xl bg-gradient-to-b from-white/[0.02] via-transparent to-black/10 opacity-0 transition-opacity duration-500 group-hover:opacity-100" />

		{/* Top highlight */}
		<div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />

		{/* Hover glow effect */}
		<div className="pointer-events-none absolute inset-0 rounded-xl bg-gradient-to-b from-[#24FF66]/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

		<span className="relative z-10 font-kodemono text-sm group-hover:text-[#24FF66] transition-colors duration-300">
			Show More
		</span>
	</button>
));

LoadMoreButton.displayName = "LoadMoreButton";

export function FAQBlock({
	title = "Frequently Asked Questions",
	items = [],
}: FAQBlockProps) {
	const [activeId, setActiveId] = useState<string | null>(null);
	const [searchQuery, setSearchQuery] = useState("");
	const [selectedCategory, setSelectedCategory] = useState("all");
	const [displayCount, setDisplayCount] = useState(ITEMS_PER_PAGE);
	const [currentPage, setCurrentPage] = useState(1);

	const { ref, inView } = useInView({
		threshold: 0.1,
		triggerOnce: true,
	});

	const categories = useMemo(
		() =>
			Array.from(new Set(items.map((item) => item.category).filter(Boolean))),
		[items],
	);

	const filteredItems = useMemo(() => {
		return items.filter((item) => {
			const matchesSearch = item.question
				.toLowerCase()
				.includes(searchQuery.toLowerCase());
			const matchesCategory =
				selectedCategory === "all" || item.category === selectedCategory;
			return matchesSearch && matchesCategory;
		});
	}, [items, searchQuery, selectedCategory]);

	const paginatedItems = useMemo(() => {
		return filteredItems.slice(0, displayCount);
	}, [filteredItems, displayCount]);

	const handleLoadMore = () => {
		setDisplayCount((prev) => prev + LOAD_MORE_COUNT);
		setCurrentPage((prev) => prev + 1);
	};

	return (
		<section className="relative flex items-center justify-center overflow-hidden  py-32">
			<div className="px-4 sm:px-6 lg:w-3/4 2xl:w-1/2">
				<motion.div
					ref={ref}
					initial={{ opacity: 0, y: 20 }}
					animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
					transition={{ duration: 0.8 }}
					className="mb-16 text-center"
				>
					<h2 className="font-russo mb-6 text-4xl font-bold tracking-tight text-white sm:text-5xl lg:text-6xl uppercase">
						{title}
					</h2>
					<p className="font-kodemono mx-auto max-w-2xl text-base text-white/60 sm:text-lg">
						Everything you need to know about rthmn. Can't find the answer
						you're looking for? Contact us at{" "}
						<button
							type="button"
							className="text-[#24FF66] hover:text-[#1ECC52] transition-colors duration-300"
						>
							hello@rthmn.com
						</button>
					</p>
				</motion.div>
				<div className="mx-auto max-w-4xl">
					<SearchInput value={searchQuery} onChange={setSearchQuery} />
					{categories.length > 0 && (
						<CategoryFilter
							categories={categories}
							selected={selectedCategory}
							onSelect={setSelectedCategory}
						/>
					)}
					<AnimatePresence mode="wait">
						{filteredItems.length > 0 ? (
							<>
								<div className="space-y-4">
									{paginatedItems.map((item, index) => (
										<FAQItem
											key={item._id}
											item={item}
											isActive={activeId === item._id}
											onClick={() =>
												setActiveId(activeId === item._id ? null : item._id)
											}
											index={index}
										/>
									))}
								</div>
								{displayCount < filteredItems.length && (
									<motion.div
										initial={{ opacity: 0, y: 20 }}
										animate={{ opacity: 1, y: 0 }}
										transition={{ duration: 0.3 }}
									>
										<LoadMoreButton onClick={handleLoadMore} />
									</motion.div>
								)}
							</>
						) : (
							<motion.div
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								exit={{ opacity: 0 }}
								className="text-center text-white/60"
							>
								No questions found matching your criteria
							</motion.div>
						)}
					</AnimatePresence>
				</div>
			</div>
		</section>
	);
}
