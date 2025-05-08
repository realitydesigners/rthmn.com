import Link from "next/link";
import { FaArrowRight, FaGithub } from "react-icons/fa";

export interface GitHubBlockProps {
	_type: "githubBlock";
	_key: string;
	title?: string;
	description?: string;
	buttonText?: string;
	githubUrl?: string;
}

export function GitHubBlock({
	title = "Found a Bug?",
	description = "Report issues directly on our GitHub repository",
	buttonText = "View on GitHub",
	githubUrl = "https://github.com/rthmnapp/rthmn-feedback/issues",
}: GitHubBlockProps) {
	return (
		<section className="relative mb-12">
			<div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
				<div className="relative overflow-hidden rounded-xl border border-[#1C1E23] bg-black/40 p-8">
					<div className="pointer-events-none absolute inset-0">
						<div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
						<div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-[#32353C] to-transparent" />
					</div>
					<div className="flex flex-col items-center justify-between md:flex-row">
						<div>
							<h2 className="font-outfit mb-2 text-2xl font-bold text-white">
								{title}
							</h2>
							<p className="font-dmmono  mb-8 primary-text md:mb-0">
								{description}
							</p>
						</div>
						<Link
							href={githubUrl}
							className="group flex items-center gap-2 rounded-full bg-[#1C1E23] px-6 py-3 text-sm text-white transition-all duration-300 hover:bg-[#1C1E23]"
						>
							<FaGithub className="h-5 w-5" />
							<span>{buttonText}</span>
							<FaArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
						</Link>
					</div>
				</div>
			</div>
		</section>
	);
}
