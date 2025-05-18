import { client } from "@/lib/sanity/lib/client";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { useCallback, useEffect, useRef, useState } from "react";

interface Props {
	onComplete: () => void;
}

const LightShadows = ({ isExiting }: { isExiting: boolean }) =>
	[...Array(1)].map((_, i) => (
		<motion.div
			key={`light-${i}`}
			initial={{ opacity: 0 }}
			animate={{
				opacity: isExiting ? 0 : [0, 0.3, 0],
				filter: isExiting ? "blur(50px)" : "blur(30px)",
				x: ["0%", "100%"],
				y: [i * 30 + "%", i * 30 + 10 + "%"],
			}}
			transition={{
				duration: 10 + i * 5,
				repeat: Number.POSITIVE_INFINITY,
				ease: "linear",
				delay: i * 1,
			}}
			className={`bg-gradient-radial absolute inset-0 h-[300px] w-[300px] overflow-hidden rounded-full from-blue-400/20 via-blue-400/10 to-transparent blur-3xl`}
		/>
	));

const AuroraBackground = () => (
	<motion.div
		initial={{ opacity: 0 }}
		animate={{
			opacity: 0.3,
			backgroundPosition: ["0% 50%, 0% 50%", "100% 50%, 100% 50%"],
			filter: "blur(30px)",
		}}
		transition={{
			backgroundPosition: {
				duration: 60,
				repeat: Number.POSITIVE_INFINITY,
				ease: "linear",
			},
		}}
		className={`pointer-events-none absolute inset-0 overflow-hidden [background-image:var(--white-gradient),var(--aurora)] [mask-image:radial-gradient(ellipse_at_center,black_30%,transparent_70%)] [background-size:200%,_200%] [background-position:0%_50%,0%_50%] backdrop-blur-[100px] will-change-transform [--aurora:repeating-linear-gradient(100deg,rgba(59,130,246,0.3)_10%,rgba(99,102,241,0.2)_15%,rgba(147,197,253,0.3)_20%,rgba(167,139,250,0.2)_25%,rgba(96,165,250,0.3)_30%)] [--white-gradient:repeating-linear-gradient(100deg,rgba(255,255,255,0.05)_0%,rgba(255,255,255,0.05)_7%,transparent_10%,transparent_12%,rgba(255,255,255,0.05)_16%)] after:absolute after:inset-0 after:animate-[aurora_15s_linear_infinite] after:[background-image:var(--white-gradient),var(--aurora)] after:[background-size:200%,_200%] after:[background-attachment:fixed]`}
	/>
);

const StarField = () => {
	const [mounted, setMounted] = useState(false);
	const [stars, setStars] = useState<
		Array<{
			id: number;
			x: number;
			y: number;
			size: number;
			duration: number;
			delay: number;
		}>
	>([]);

	useEffect(() => {
		const generateStars = () => {
			const newStars = Array.from({ length: 50 }, (_, i) => ({
				id: i,
				x: Math.random() * window.innerWidth,
				y: Math.random() * window.innerHeight,
				size: 1 + Math.random() * 2,
				duration: 15 + Math.random() * 20,
				delay: Math.random() * -15,
			}));
			setStars(newStars);
		};

		generateStars();
		setMounted(true);

		const handleResize = () => {
			generateStars();
		};

		window.addEventListener("resize", handleResize);
		return () => window.removeEventListener("resize", handleResize);
	}, []);

	if (!mounted) return null;

	return (
		<div className="absolute inset-0 overflow-hidden ">
			{stars.map((star) => (
				<motion.div
					key={star.id}
					initial={{
						opacity: 0.1,
						x: star.x,
						y: star.y,
					}}
					animate={{
						opacity: [0.1, 0.5, 0.1],
						y: [star.y, -100],
					}}
					transition={{
						duration: star.duration,
						repeat: Number.POSITIVE_INFINITY,
						delay: star.delay,
					}}
					className="absolute"
				>
					<div
						style={{
							width: `${star.size}px`,
							height: `${star.size}px`,
						}}
						className="rounded-full bg-white/80 shadow-[0_0_10px_rgba(255,255,255,0.8)]"
					/>
				</motion.div>
			))}
		</div>
	);
};
const BASE_ANIMATIONS = {
	transition: {
		duration: 1.2,
		ease: [0.19, 1, 0.22, 1],
	},
	fade: {
		initial: {
			opacity: 0,
			scale: 0.95,
			filter: "blur(10px)",
			y: 20,
		},
		animate: {
			opacity: 1,
			scale: 1,
			filter: "blur(0px)",
			y: 0,
		},
		exit: {
			opacity: 0,
			scale: 0.95,
			filter: "blur(10px)",
			y: -20,
			transition: {
				duration: 0.8,
				ease: [0.19, 1, 0.22, 1],
			},
		},
	},
};

type StepProps = {
	delay: number;
	onComplete: () => void;
	duration?: number;
	isInteractive?: boolean;
};

const WelcomeStep = ({ duration = 3000, delay, onComplete }: StepProps) => {
	useEffect(() => {
		const timer = setTimeout(onComplete, duration);
		return () => clearTimeout(timer);
	}, [duration, onComplete]);

	return (
		<motion.div
			key="welcome"
			{...BASE_ANIMATIONS.fade}
			transition={{
				...BASE_ANIMATIONS.transition,
				delay,
			}}
			className="flex flex-col items-center justify-center space-y-8 "
		>
			{/* Logo */}
			<motion.div
				{...BASE_ANIMATIONS.fade}
				transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.2 }}
				className="relative mx-auto mb-6 flex h-24 w-24"
			>
				{/* Holographic glow effect */}
				<motion.div
					animate={{
						boxShadow: [
							"0 0 20px rgba(255,255,255,0.1)",
							"0 0 60px rgba(255,255,255,0.2)",
							"0 0 20px rgba(255,255,255,0.1)",
						],
						filter: [
							"brightness(1) blur(8px)",
							"brightness(1.2) blur(12px)",
							"brightness(1) blur(8px)",
						],
					}}
					exit={{
						boxShadow: "0 0 0px rgba(255,255,255,0)",
						filter: "brightness(0.5) blur(20px)",
					}}
					transition={{
						duration: 3,
						repeat: Number.POSITIVE_INFINITY,
						ease: "linear",
					}}
					className="absolute inset-0 rounded-2xl bg-gradient-to-br from-[#1C1E23] to-[#1C1E23]"
				/>
				<svg
					className="relative"
					width="80"
					height="80"
					viewBox="0 0 100 100"
					fill="none"
					xmlns="http://www.w3.org/2000/svg"
					aria-labelledby="logoTitle"
				>
					<title id="logoTitle">Logo</title>
					<g clipPath="url(#clip0_1208_27417)">
						<path
							d="M27.512 73.5372L27.512 28.512C27.512 27.9597 27.9597 27.512 28.512 27.512L70.4597 27.512C71.0229 27.512 71.475 27.9769 71.4593 28.54L70.8613 49.9176C70.8462 50.4588 70.4031 50.8896 69.8617 50.8896L50.7968 50.8896C49.891 50.8896 49.4519 51.9975 50.1117 52.618L92.25 92.25M92.25 92.25L48.2739 92.25L7.75002 92.25C7.19773 92.25 6.75002 91.8023 6.75002 91.25L6.75 7.75C6.75 7.19771 7.19772 6.75 7.75 6.75L91.25 6.75003C91.8023 6.75003 92.25 7.19775 92.25 7.75003L92.25 92.25Z"
							stroke="white"
							strokeWidth="8"
						/>
					</g>
					<defs>
						<clipPath id="clip0_1208_27417">
							<rect width="100" height="100" fill="white" />
						</clipPath>
					</defs>
				</svg>
			</motion.div>
			{/* Title */}
			<motion.h1
				{...BASE_ANIMATIONS.fade}
				transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.4 }}
				className="font-outfit bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-7xl font-bold text-transparent"
			>
				Welcome to Rthmn
			</motion.h1>
			{/* Subtitle */}
			<motion.p
				{...BASE_ANIMATIONS.fade}
				transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.6 }}
				className="font-outfit text-lg text-white/60"
			>
				The future of trading and first gamified trading platform.
			</motion.p>
		</motion.div>
	);
};

const PatternRecognitionStep = ({
	duration = 6000,
	delay,
	onComplete,
	team,
}: StepProps & { team: any[] }) => (
	<motion.div
		key="pattern"
		{...BASE_ANIMATIONS.fade}
		transition={{
			...BASE_ANIMATIONS.transition,
			delay,
		}}
		onAnimationComplete={() => {
			setTimeout(onComplete, duration);
		}}
		className="flex max-w-3xl flex-col items-center justify-center space-y-12"
	>
		<motion.div
			{...BASE_ANIMATIONS.fade}
			transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.2 }}
			className="relative space-y-6"
		>
			<div className="space-y-2">
				<motion.div
					{...BASE_ANIMATIONS.fade}
					transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.5 }}
					className="font-outfit text-center text-4xl leading-tight font-bold tracking-tight text-balance"
				>
					<span className="bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-transparent">
						Rthmn is a tool designed to compress time allowing you to see the
						market in a way that is not possible with traditional tools
					</span>
				</motion.div>
			</div>
		</motion.div>

		{/* Team members */}
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ delay: delay + 1 }}
			className="flex justify-center gap-6"
		>
			{team.map((member, i) => (
				<motion.div
					key={member.slug}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: delay + 1 + i * 0.1 }}
					className="group relative flex flex-col items-center"
				>
					<div className="relative h-14 w-14 overflow-hidden rounded-full border border-[#1C1E23] bg-[#1C1E23] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
						{member.image && (
							<Image
								src={member.image.url}
								alt={member.name}
								width={56}
								height={56}
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
							/>
						)}
						{/* Glow effect */}
						<motion.div
							className="absolute inset-0 rounded-full bg-gradient-to-b from-[#1C1E23] to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100"
							animate={{
								opacity: [0, 0.2, 0],
							}}
							transition={{
								duration: 2,
								repeat: Number.POSITIVE_INFINITY,
								ease: "easeInOut",
							}}
						/>
					</div>
					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: delay + 1.2 + i * 0.1 }}
						className="mt-3 text-center"
					>
						<span className="font-mono text-sm text-white/40 transition-colors duration-300 group-hover:text-white/90">
							{member.name}
						</span>
						{member.role && (
							<motion.span
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: delay + 1.4 + i * 0.1 }}
								className="mt-0.5 block font-mono text-[10px] text-white/30"
							>
								{member.role}
							</motion.span>
						)}
					</motion.div>
				</motion.div>
			))}
		</motion.div>
	</motion.div>
);

const LegalStep = ({ delay, onComplete }: Omit<StepProps, "duration">) => {
	const [accepted, setAccepted] = useState(false);

	return (
		<motion.div
			key="legal"
			initial={{ opacity: 0, scale: 0.95, filter: "blur(10px)" }}
			animate={{
				opacity: 1,
				scale: 1,
				filter: "blur(0px)",
			}}
			transition={{
				...BASE_ANIMATIONS.transition,
				delay,
			}}
			className="max-w-xl space-y-6"
		>
			<motion.h1
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="font-outfit mb-8 bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-center text-3xl font-bold text-transparent"
			>
				Terms of Service
			</motion.h1>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="space-y-6 rounded-xl border border-[#1C1E23] bg-[#1C1E23] p-6"
			>
				<p className="font-mono text-sm leading-relaxed text-white/60">
					By checking this box, I acknowledge that I have read and agree to
					Rthmn's{" "}
					<a
						href="/terms-of-service"
						target="_blank"
						rel="noopener noreferrer"
						className="font-bold text-white underline"
					>
						Terms of Service
					</a>{" "}
					and{" "}
					<a
						href="/privacy"
						target="_blank"
						rel="noopener noreferrer"
						className="font-bold text-white underline"
					>
						Privacy Policy
					</a>
					. I understand that my use of the platform is subject to these
					agreements.
				</p>

				<div className="flex items-center gap-3">
					<button
						onClick={() => setAccepted(!accepted)}
						className={`group relative h-6 w-6 overflow-hidden rounded-md border transition-all ${
							accepted
								? "border-white-500 bg-white-500/20"
								: "border-[#32353C] bg-[#1C1E23] hover:border-white/30 hover:bg-[#1C1E23]"
						}`}
					>
						<motion.div
							initial={false}
							animate={{
								opacity: accepted ? 1 : 0,
								scale: accepted ? 1 : 0.8,
							}}
							transition={{ duration: 0.2 }}
							className="text-white-400 absolute inset-0 flex items-center justify-center"
						>
							<svg
								width="14"
								height="14"
								viewBox="0 0 24 24"
								fill="none"
								xmlns="http://www.w3.org/2000/svg"
							>
								<path
									d="M20 6L9 17L4 12"
									stroke="currentColor"
									strokeWidth="3"
									strokeLinecap="round"
									strokeLinejoin="round"
								/>
							</svg>
						</motion.div>
					</button>
					<label className="cursor-pointer font-mono text-sm text-white/70 select-none">
						I agree to the terms and conditions
					</label>
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: delay + 0.4 }}
				className="flex justify-center"
			>
				<button
					onClick={() => {
						if (accepted) {
							setAccepted(true);
							onComplete();
						}
					}}
					disabled={!accepted}
					className={`group relative overflow-hidden rounded-xl px-8 py-3 transition-all ${
						accepted
							? "bg-[#1C1E23] hover:bg-[#32353C]"
							: "cursor-not-allowed bg-[#1C1E23] text-white/30"
					}`}
				>
					<div
						className={`absolute inset-0 bg-gradient-to-r from-[#1C1E23] to-white/0 opacity-0 transition-opacity ${accepted ? "" : ""}`}
					/>
					<span className="relative font-mono text-sm text-white/90">
						Continue
					</span>
				</button>
			</motion.div>
		</motion.div>
	);
};

export default function IntroSequence({ onComplete }: Props) {
	const [currentStep, setCurrentStep] = useState(0);
	const [isExiting, setIsExiting] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [team, setTeam] = useState<any[]>([]);

	useEffect(() => {
		const query = `*[_type == "team"] {
            name,
            "slug": slug.current,
            role,
            "image": {
                "url": image.asset->url
            }
        }`;

		client
			.fetch(query)
			.then((data) => setTeam(data))
			.catch((err) => console.error("Error fetching team:", err));
	}, []);

	// Image preloader component
	const ImagePreloader = () => (
		<div className="hidden">
			{team.map(
				(member) =>
					member.image && (
						<Image
							key={member.slug}
							src={member.image.url}
							alt=""
							width={56}
							height={56}
							priority
						/>
					),
			)}
		</div>
	);

	const renderCurrentStep = () => {
		switch (currentStep) {
			case 0:
				return (
					<WelcomeStep
						key="welcome"
						duration={5000}
						delay={1}
						onComplete={handleStepComplete}
					/>
				);
			case 1:
				return (
					<PatternRecognitionStep
						key="pattern"
						duration={10000}
						delay={0}
						onComplete={handleStepComplete}
						team={team}
					/>
				);
			case 2:
				return (
					<LegalStep key="legal" delay={0} onComplete={handleStepComplete} />
				);
			default:
				return null;
		}
	};

	const totalSteps = Object.keys(
		Object.fromEntries(
			Object.entries(renderCurrentStep.toString().match(/case \d+:/g) || []),
		),
	).length;

	const handleStepComplete = useCallback(() => {
		// Start audio on first step completion

		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			setIsExiting(true);
			setTimeout(onComplete, 1000);
		}
	}, [currentStep, onComplete, totalSteps]);

	useEffect(() => {
		return () => {
			if (audioRef.current) {
				audioRef.current.pause();
				audioRef.current = null;
			}
		};
	}, []);

	return (
		<AnimatePresence mode="wait">
			<motion.div
				initial={{ opacity: 1 }}
				animate={{
					opacity: isExiting ? 0 : 1,
					filter: isExiting ? "blur(20px)" : "blur(0px)",
				}}
				transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
				className="fixed inset-0 z-[1000] overflow-hidden bg-black"
			>
				<AuroraBackground />
				<LightShadows isExiting={isExiting} />
				<StarField />

				<ImagePreloader />
				<motion.div className="no-select relative z-10 flex h-full items-center justify-center">
					{renderCurrentStep()}
				</motion.div>
			</motion.div>
		</AnimatePresence>
	);
}
