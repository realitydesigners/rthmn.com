import { TourButton } from "@/components/Buttons/TourButton";
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

const LogoAnimation = ({ isExiting }: { isExiting: boolean }) => {
	const [hasMovedToCorner, setHasMovedToCorner] = useState(false);

	useEffect(() => {
		const timer = setTimeout(() => {
			setHasMovedToCorner(true);
		}, 3000);
		return () => clearTimeout(timer);
	}, []);

	return (
		<motion.div
			className={`fixed z-50 ${hasMovedToCorner ? "h-14" : ""}`}
			initial={{
				top: "50%",
				left: "50%",
				x: "-50%",
				y: "-50%",
			}}
			animate={{
				top: hasMovedToCorner ? "0" : "50%",
				left: hasMovedToCorner ? "0" : "50%",
				x: hasMovedToCorner ? "0" : "-50%",
				y: hasMovedToCorner ? "0" : "-50%",
			}}
			transition={{
				duration: 1,
				ease: [0.19, 1, 0.22, 1],
			}}
		>
			<motion.div
				className={`relative ${hasMovedToCorner ? "p-2  w-14 h-14" : "w-48 h-48"}`}
				transition={{
					duration: 1,
					ease: [0.19, 1, 0.22, 1],
				}}
			>
				<Image
					src="/rthmn-onboarding-logo.png"
					alt="Rthmn Logo"
					width={96}
					height={96}
					className="relative w-full h-full object-contain"
					priority
				/>
			</motion.div>
		</motion.div>
	);
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
			className="flex flex-col items-center justify-center space-y-8 px-6 text-center"
		>
			{/* Title */}
			<motion.h1
				{...BASE_ANIMATIONS.fade}
				transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.4 }}
				className="font-russo bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-4xl sm:text-5xl md:text-7xl font-bold text-transparent"
			>
				Welcome to Rthmn
			</motion.h1>
			{/* Subtitle */}
			<motion.p
				{...BASE_ANIMATIONS.fade}
				transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.6 }}
				className="font-russo max-w-md mx-auto text-base sm:text-lg text-white/60"
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
		className="flex max-w-3xl flex-col items-center justify-center space-y-12 px-6"
	>
		<motion.div
			{...BASE_ANIMATIONS.fade}
			transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.1 }}
			className="relative space-y-6"
		>
			<div className="space-y-2">
				<motion.div
					{...BASE_ANIMATIONS.fade}
					transition={{ ...BASE_ANIMATIONS.transition, delay: delay + 0.2 }}
					className="font-russo text-center text-2xl sm:text-3xl md:text-4xl leading-tight font-bold tracking-tight text-balance"
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
			transition={{ delay: delay + 0.5 }}
			className="flex flex-wrap justify-center gap-4 sm:gap-6"
		>
			{team.map((member, i) => (
				<motion.div
					key={member.slug}
					initial={{ opacity: 0, scale: 0.8 }}
					animate={{ opacity: 1, scale: 1 }}
					transition={{ delay: delay + 1 + i * 0.1 }}
					className="group relative flex flex-col items-center"
				>
					<div className="relative h-12 w-12 sm:h-14 sm:w-14 overflow-hidden rounded-full border border-[#1C1E23] bg-[#1C1E23] backdrop-blur-sm transition-transform duration-300 group-hover:scale-105">
						{member.image && (
							<Image
								src={member.image.url}
								alt={member.name}
								width={56}
								height={56}
								className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
							/>
						)}
					</div>
					<motion.div
						initial={{ opacity: 0, y: 5 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ delay: delay + 1.2 + i * 0.1 }}
						className="mt-3 text-center"
					>
						<span className="font-mono text-xs sm:text-sm text-white/40 transition-colors duration-300 group-hover:text-white/90">
							{member.name}
						</span>
						{member.role && (
							<motion.span
								initial={{ opacity: 0 }}
								animate={{ opacity: 1 }}
								transition={{ delay: delay + 1.4 + i * 0.1 }}
								className="mt-0.5 block font-mono text-[9px] sm:text-[10px] text-white/30"
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
			className="max-w-xl space-y-6 px-4 sm:px-0"
		>
			<motion.h2
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="font-russo bg-gradient-to-r from-white via-white/90 to-white/70 bg-clip-text text-center text-3xl font-bold text-transparent"
			>
				Terms of Service
			</motion.h2>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				className="relative overflow-hidden rounded-xl border border-[#1C1E23] bg-gradient-to-b from-[#0A0B0D] to-[#070809] p-6 shadow-2xl"
			>
				{/* Highlight effect */}
				<div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_50%_-20%,rgba(255,255,255,0.05),rgba(255,255,255,0))]" />

				<div className="space-y-6">
					<p className="font-mono text-sm leading-relaxed text-white/70">
						By checking this box, I acknowledge that I have read and agree to
						Rthmn's{" "}
						<a
							href="/terms-of-service"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white font-bold transition-colors"
						>
							Terms of Service
						</a>{" "}
						and{" "}
						<a
							href="/privacy"
							target="_blank"
							rel="noopener noreferrer"
							className="text-white font-bold transition-colors"
						>
							Privacy Policy
						</a>
						. I understand that my use of the platform is subject to these
						agreements.
					</p>

					<div className="flex items-center gap-3">
						<button
							onClick={() => setAccepted(!accepted)}
							className={`group relative h-6 w-6 overflow-hidden rounded-lg border transition-all duration-300 ${
								accepted
									? "border-white-400/50 bg-white-400/10"
									: "border-[#32353C] bg-[#0A0B0D] hover:border-white-400/30 hover:bg-white-400/5"
							}`}
						>
							<motion.div
								initial={false}
								animate={{
									opacity: accepted ? 1 : 0,
									scale: accepted ? 1 : 0.8,
								}}
								transition={{ duration: 0.2 }}
								className="absolute inset-0 flex items-center justify-center text-white "
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
				</div>
			</motion.div>

			<motion.div
				initial={{ opacity: 0 }}
				animate={{ opacity: 1 }}
				transition={{ delay: delay + 0.4 }}
				className="flex justify-center pt-2"
			>
				<TourButton
					onClick={() => {
						if (accepted) {
							setAccepted(true);
							onComplete();
						}
					}}
					disabled={!accepted}
					variant="black"
				>
					Continue
				</TourButton>
			</motion.div>
		</motion.div>
	);
};

export default function IntroSequence({ onComplete }: Props) {
	const [currentStep, setCurrentStep] = useState(-1);
	const [isExiting, setIsExiting] = useState(false);
	const [hasMovedToCorner, setHasMovedToCorner] = useState(false);
	const audioRef = useRef<HTMLAudioElement | null>(null);
	const [team, setTeam] = useState<any[]>([]);

	const totalSteps = 3;

	// Handle initial logo animation and step transition
	useEffect(() => {
		const initialDelay = setTimeout(() => {
			setHasMovedToCorner(true);

			// Show welcome step after logo animation completes
			const stepDelay = setTimeout(() => {
				setCurrentStep(0);
			}, 1000);

			return () => clearTimeout(stepDelay);
		}, 3000);

		return () => clearTimeout(initialDelay);
	}, []);

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

	const handleStepComplete = useCallback(() => {
		if (currentStep < totalSteps - 1) {
			setCurrentStep(currentStep + 1);
		} else {
			setIsExiting(true);
			setTimeout(onComplete, 800);
		}
	}, [currentStep, onComplete, totalSteps]);

	return (
		<AnimatePresence mode="wait">
			<motion.div
				initial={{ opacity: 1 }}
				animate={{
					opacity: isExiting ? 0 : 1,
					filter: isExiting ? "blur(20px)" : "blur(0px)",
				}}
				transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
				className="fixed inset-0 z-[99999] overflow-hidden bg-black"
				style={{ position: "fixed", isolation: "isolate" }}
			>
				<AuroraBackground />
				<LightShadows isExiting={isExiting} />
				<StarField />

				<ImagePreloader />
				<LogoAnimation isExiting={isExiting} />

				{/* Only render step content after logo has moved */}
				<AnimatePresence mode="wait">
					{currentStep >= 0 && (
						<motion.div
							className="no-select relative z-10 flex h-full items-center justify-center"
							initial={{ opacity: 0 }}
							animate={{ opacity: 1 }}
							transition={{ duration: 0.5 }}
						>
							{renderCurrentStep()}
						</motion.div>
					)}
				</AnimatePresence>
			</motion.div>
		</AnimatePresence>
	);

	function renderCurrentStep() {
		switch (currentStep) {
			case 0:
				return (
					<WelcomeStep
						key="welcome"
						duration={5000}
						delay={0.2} // Reduced delay since we're already handling timing
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
					<LegalStep
						key="legal"
						delay={0}
						onComplete={() => {
							setIsExiting(true);
							setTimeout(onComplete, 800);
						}}
					/>
				);
			default:
				return null;
		}
	}
}
