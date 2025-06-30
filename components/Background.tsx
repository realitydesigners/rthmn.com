"use client";

import {
	motion,
	useAnimation,
	useMotionValue,
	useScroll,
	useSpring,
	useTransform,
} from "framer-motion";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";

interface BackgroundProps {
	className?: string;
}

// Enhanced theme system with more sophisticated color palettes
const SECTION_THEMES = {
	hero: {
		name: "Digital Ocean",
		primary: "#000000",
		secondary: "#050505",
		tertiary: "#0A0A0A",
		accents: {
			primary: "#4EFF6E",
			secondary: "#00D4FF",
			tertiary: "#10b981",
			glow: "#4EFF6E15",
		},
		gradients: {
			main: "conic-gradient(from 45deg at 30% 70%, #05050510, #00000008, transparent 60%, #05050508, transparent 85%)",
			accent1:
				"radial-gradient(ellipse 800px 400px at 20% 30%, #4EFF6E08, transparent 70%)",
			accent2:
				"linear-gradient(135deg, transparent 40%, #00D4FF06 50%, transparent 60%)",
			curve1:
				"radial-gradient(ellipse 600px 300px at 80% 20%, #4EFF6E05, transparent 80%)",
			curve2:
				"conic-gradient(from 225deg at 70% 80%, transparent 70%, #00D4FF04, transparent 85%)",
		},
	},
	boxes3d: {
		name: "Neon Grid",
		primary: "#000000",
		secondary: "#050505",
		tertiary: "#0A0A0A",
		accents: {
			primary: "#FF6B6B",
			secondary: "#4ECDC4",
			tertiary: "#45B7D1",
			glow: "#FF6B6B15",
		},
		gradients: {
			main: "conic-gradient(from 120deg at 40% 60%, #05050512, transparent 40%, #00000008, transparent 80%)",
			accent1:
				"linear-gradient(45deg, transparent 30%, #FF6B6B08 45%, transparent 55%, #FF6B6B04, transparent 75%)",
			accent2:
				"radial-gradient(ellipse 700px 350px at 85% 15%, #4ECDC406, transparent 85%)",
			curve1:
				"conic-gradient(from 300deg at 15% 85%, transparent 60%, #45B7D105, transparent 90%)",
			curve2:
				"linear-gradient(225deg, transparent 35%, #FF6B6B06 50%, transparent 65%)",
		},
	},
	instruments: {
		name: "Trading Floor",
		primary: "#000000",
		secondary: "#050505",
		tertiary: "#0A0A0A",
		accents: {
			primary: "#00FF87",
			secondary: "#FFD700",
			tertiary: "#FF4757",
			glow: "#00FF8715",
		},
		gradients: {
			main: "conic-gradient(from 180deg at 60% 40%, #05050510, transparent 50%, #00000008, transparent 85%)",
			accent1:
				"linear-gradient(315deg, transparent 25%, #00FF8708 40%, transparent 55%, #FFD70005, transparent 80%)",
			accent2:
				"radial-gradient(ellipse 650px 400px at 90% 10%, #FF475706, transparent 75%)",
			curve1:
				"conic-gradient(from 90deg at 10% 90%, transparent 65%, #00FF8704, transparent 95%)",
			curve2:
				"linear-gradient(135deg, transparent 30%, #FFD70006 45%, transparent 60%)",
		},
	},
	pricing: {
		name: "Purple Haze",
		primary: "#000000",
		secondary: "#050505",
		tertiary: "#0A0A0A",
		accents: {
			primary: "#8B5CF6",
			secondary: "#EC4899",
			tertiary: "#F59E0B",
			glow: "#8B5CF615",
		},
		gradients: {
			main: "conic-gradient(from 270deg at 70% 30%, #05050510, transparent 55%, #00000008, transparent 80%)",
			accent1:
				"linear-gradient(225deg, transparent 35%, #8B5CF608 50%, transparent 65%, #EC489904, transparent 85%)",
			accent2:
				"radial-gradient(ellipse 550px 300px at 30% 80%, #F59E0B06, transparent 80%)",
			curve1:
				"conic-gradient(from 45deg at 70% 30%, transparent 70%, #8B5CF605, transparent 90%)",
			curve2:
				"linear-gradient(315deg, transparent 40%, #EC489905 55%, transparent 70%)",
		},
	},
	faq: {
		name: "Forest Deep",
		primary: "#000000",
		secondary: "#050505",
		tertiary: "#0A0A0A",
		accents: {
			primary: "#10B981",
			secondary: "#06B6D4",
			tertiary: "#3B82F6",
			glow: "#10B98115",
		},
		gradients: {
			main: "conic-gradient(from 90deg at 50% 30%, #05050510, transparent 45%, #00000008, transparent 85%)",
			accent1:
				"linear-gradient(165deg, transparent 40%, #10B98108 55%, transparent 70%, #06B6D404, transparent 90%)",
			accent2:
				"radial-gradient(ellipse 700px 350px at 20% 20%, #3B82F606, transparent 85%)",
			curve1:
				"conic-gradient(from 180deg at 80% 70%, transparent 75%, #10B98104, transparent 95%)",
			curve2:
				"linear-gradient(75deg, transparent 25%, #06B6D405 40%, transparent 55%)",
		},
	},
	cta: {
		name: "Midnight",
		primary: "#000000",
		secondary: "#050505",
		tertiary: "#0A0A0A",
		accents: {
			primary: "#EC4899",
			secondary: "#8B5CF6",
			tertiary: "#3B82F6",
			glow: "#EC489915",
		},
		gradients: {
			main: "conic-gradient(from 315deg at 70% 50%, #05050512, transparent 40%, #00000008, transparent 75%)",
			accent1:
				"linear-gradient(45deg, transparent 30%, #EC489908 45%, transparent 60%, #8B5CF604, transparent 80%)",
			accent2:
				"radial-gradient(ellipse 600px 350px at 80% 80%, #3B82F606, transparent 80%)",
			curve1:
				"conic-gradient(from 135deg at 30% 30%, transparent 60%, #EC489905, transparent 85%)",
			curve2:
				"linear-gradient(195deg, transparent 35%, #8B5CF605 50%, transparent 65%)",
		},
	},
} as const;

// Floating particle system
const FloatingParticles = ({
	theme,
	opacity = 0.6,
}: {
	theme: (typeof SECTION_THEMES)[keyof typeof SECTION_THEMES];
	opacity?: number;
}) => {
	const particles = useMemo(
		() =>
			Array.from({ length: 15 }, (_, i) => ({
				id: i,
				x: Math.random() * 100,
				y: Math.random() * 100,
				size: Math.random() * 3 + 1,
				duration: Math.random() * 20 + 15,
				delay: Math.random() * 5,
			})),
		[],
	);

	return (
		<div className="absolute inset-0 overflow-hidden pointer-events-none">
			{particles.map((particle) => (
				<motion.div
					key={particle.id}
					className="absolute rounded-full blur-sm"
					style={{
						left: `${particle.x}%`,
						top: `${particle.y}%`,
						width: particle.size,
						height: particle.size,
						backgroundColor: theme.accents.primary,
						opacity: opacity * 0.3,
					}}
					animate={{
						y: [0, -100, 0],
						x: [0, Math.random() * 50 - 25, 0],
						opacity: [0, opacity * 0.3, 0],
						scale: [0.5, 1.2, 0.5],
					}}
					transition={{
						duration: particle.duration,
						delay: particle.delay,
						repeat: Number.POSITIVE_INFINITY,
						ease: "easeInOut",
					}}
				/>
			))}
		</div>
	);
};

// Dynamic gradient mesh
const GradientMesh = ({
	theme,
	scrollProgress,
}: {
	theme: (typeof SECTION_THEMES)[keyof typeof SECTION_THEMES];
	scrollProgress: number;
}) => {
	const meshRef = useRef<HTMLDivElement>(null);

	return (
		<motion.div
			ref={meshRef}
			className="absolute inset-0"
			style={{
				background: `
          ${theme.gradients.main},
          ${theme.gradients.accent1},
          ${theme.gradients.accent2}
          ${theme.gradients.curve1 ? `, ${theme.gradients.curve1}` : ""}
          ${theme.gradients.curve2 ? `, ${theme.gradients.curve2}` : ""}
        `,
				backgroundBlendMode:
					"multiply, screen, overlay, soft-light, color-dodge",
			}}
			animate={{
				backgroundPosition: [
					"0% 0%, 100% 100%, 50% 50%, 25% 75%, 75% 25%",
					"75% 25%, 25% 75%, 100% 0%, 50% 50%, 0% 100%",
					"50% 50%, 0% 100%, 25% 75%, 100% 0%, 75% 25%",
					"100% 100%, 50% 50%, 0% 0%, 75% 25%, 25% 75%",
					"0% 0%, 100% 100%, 50% 50%, 25% 75%, 75% 25%",
				],
				transform: [
					"rotate(0deg) scale(1)",
					"rotate(2deg) scale(1.05)",
					"rotate(-1deg) scale(0.98)",
					"rotate(1deg) scale(1.02)",
					"rotate(0deg) scale(1)",
				],
			}}
			transition={{
				duration: 25,
				repeat: Number.POSITIVE_INFINITY,
				ease: "easeInOut",
			}}
		/>
	);
};

// Enhanced lighting system
const DynamicLighting = ({
	theme,
	intensity = 1,
}: {
	theme: (typeof SECTION_THEMES)[keyof typeof SECTION_THEMES];
	intensity?: number;
}) => {
	const controls = useAnimation();

	useEffect(() => {
		const animateLights = async () => {
			await controls.start({
				opacity: [0.4 * intensity, 0.8 * intensity, 0.4 * intensity],
				scale: [1, 1.2, 1],
				transition: {
					duration: 8,
					repeat: Number.POSITIVE_INFINITY,
					repeatType: "reverse",
					ease: "easeInOut",
				},
			});
		};

		animateLights();
	}, [controls, intensity, theme]);

	return (
		<>
			{/* Primary spotlight */}
			<motion.div
				className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2"
				style={{
					width: "80vw",
					height: "80vh",
					maxWidth: "1200px",
					maxHeight: "800px",
					background: `radial-gradient(ellipse, ${theme.accents.glow}, ${theme.secondary}40 30%, transparent 70%)`,
					filter: "blur(60px)",
				}}
				animate={controls}
			/>

			{/* Accent lights */}
			<motion.div
				className="absolute top-1/4 left-1/4"
				style={{
					width: "40vw",
					height: "40vh",
					maxWidth: "600px",
					maxHeight: "400px",
					background: `radial-gradient(circle, ${theme.accents.primary}30, transparent 60%)`,
					filter: "blur(40px)",
				}}
				animate={{
					x: [0, 100, -50, 0],
					y: [0, -50, 100, 0],
					opacity: [0.3 * intensity, 0.6 * intensity, 0.3 * intensity],
				}}
				transition={{
					duration: 15,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
				}}
			/>

			<motion.div
				className="absolute bottom-1/4 right-1/4"
				style={{
					width: "35vw",
					height: "35vh",
					maxWidth: "500px",
					maxHeight: "350px",
					background: `radial-gradient(circle, ${theme.accents.secondary}25, transparent 60%)`,
					filter: "blur(35px)",
				}}
				animate={{
					x: [0, -75, 50, 0],
					y: [0, 75, -25, 0],
					opacity: [0.4 * intensity, 0.7 * intensity, 0.4 * intensity],
				}}
				transition={{
					duration: 18,
					repeat: Number.POSITIVE_INFINITY,
					ease: "easeInOut",
					delay: 2,
				}}
			/>
		</>
	);
};

export const Background = ({ className = "" }: BackgroundProps) => {
	const [currentSection, setCurrentSection] =
		useState<keyof typeof SECTION_THEMES>("hero");
	const [previousSection, setPreviousSection] =
		useState<keyof typeof SECTION_THEMES>("hero");
	const [transitionProgress, setTransitionProgress] = useState(0);
	const { scrollY } = useScroll();

	// Smooth spring animations for better performance
	const scrollProgress = useSpring(0, { damping: 20, stiffness: 100 });
	const themeOpacity = useSpring(1, { damping: 25, stiffness: 120 });

	// Advanced section detection with smoother transitions
	const detectSection = useCallback(() => {
		const scrollPosition = window.scrollY;
		const windowHeight = window.innerHeight;
		const documentHeight = document.documentElement.scrollHeight;

		// Calculate section boundaries more precisely
		const sections: (keyof typeof SECTION_THEMES)[] = [
			"hero",
			"boxes3d",
			"instruments",
			"pricing",
			"faq",
			"cta",
		];
		const sectionHeight = documentHeight / sections.length;
		const currentIndex = Math.floor(scrollPosition / sectionHeight);
		const newSection = sections[Math.min(currentIndex, sections.length - 1)];

		// Calculate transition progress
		const sectionStart = currentIndex * sectionHeight;
		const sectionEnd = (currentIndex + 1) * sectionHeight;
		const progress = Math.max(
			0,
			Math.min(
				1,
				(scrollPosition - sectionStart) / (sectionEnd - sectionStart),
			),
		);

		setTransitionProgress(progress);

		if (newSection !== currentSection) {
			setPreviousSection(currentSection);
			setCurrentSection(newSection);
		}

		// Update scroll progress for animations
		scrollProgress.set(scrollPosition / (documentHeight - windowHeight));
	}, [currentSection, scrollProgress]);

	useEffect(() => {
		const unsubscribe = scrollY.on("change", detectSection);
		detectSection(); // Initial call

		return unsubscribe;
	}, [scrollY, detectSection]);

	// Get current and previous themes
	const currentTheme = SECTION_THEMES[currentSection];
	const previousTheme = SECTION_THEMES[previousSection];

	// Create interpolated theme for smooth transitions
	const interpolatedTheme = useMemo(() => {
		if (transitionProgress === 0 || currentSection === previousSection) {
			return currentTheme;
		}

		// Simple theme interpolation (could be enhanced further)
		return currentTheme;
	}, [
		currentTheme,
		previousTheme,
		transitionProgress,
		currentSection,
		previousSection,
	]);

	return (
		<div className={`fixed inset-0 z-0 overflow-hidden ${className}`}>
			{/* Base layer - Deep black */}
			<div
				className="absolute inset-0 transition-colors duration-1000"
				style={{ backgroundColor: interpolatedTheme.primary }}
			/>

			{/* Animated gradient mesh */}
			<GradientMesh
				theme={interpolatedTheme}
				scrollProgress={scrollProgress.get()}
			/>

			{/* Dynamic lighting system */}
			<DynamicLighting theme={interpolatedTheme} intensity={0.3} />

			{/* Floating particles */}
			<FloatingParticles theme={interpolatedTheme} opacity={0.15} />

			{/* Sweeping light beam */}
			<motion.div
				className="absolute top-0 left-0 w-full h-full pointer-events-none"
				style={{
					background: `linear-gradient(45deg, transparent 40%, ${interpolatedTheme.accents.primary}10 50%, transparent 60%)`,
					filter: "blur(20px)",
				}}
				animate={{
					transform: [
						"translateX(-100%) rotate(45deg)",
						"translateX(100vw) rotate(45deg)",
					],
				}}
				transition={{
					duration: 12,
					repeat: Number.POSITIVE_INFINITY,
					ease: "linear",
					repeatDelay: 8,
				}}
			/>

			{/* Organic noise texture */}
			<div
				className="absolute inset-0 opacity-[0.015] mix-blend-overlay"
				style={{
					backgroundImage: `
            radial-gradient(circle at 20% 50%, ${interpolatedTheme.accents.primary}40 0px, transparent 50px),
            radial-gradient(circle at 80% 20%, ${interpolatedTheme.accents.secondary}30 0px, transparent 70px),
            radial-gradient(circle at 40% 80%, ${interpolatedTheme.accents.tertiary}35 0px, transparent 60px),
            radial-gradient(circle at 60% 30%, ${interpolatedTheme.accents.primary}25 0px, transparent 80px),
            radial-gradient(circle at 10% 10%, ${interpolatedTheme.accents.secondary}20 0px, transparent 90px),
            radial-gradient(circle at 90% 90%, ${interpolatedTheme.accents.tertiary}30 0px, transparent 75px)
          `,
					backgroundSize:
						"300px 300px, 250px 250px, 200px 200px, 350px 350px, 180px 180px, 280px 280px",
				}}
			/>

			{/* Enhanced edge vignette for more black space */}
			<div
				className="absolute inset-0 pointer-events-none"
				style={{
					background: `
            radial-gradient(ellipse at center, transparent 15%, ${interpolatedTheme.primary}60 50%, ${interpolatedTheme.primary} 100%),
            linear-gradient(to right, ${interpolatedTheme.primary}60 0%, transparent 15%, transparent 85%, ${interpolatedTheme.primary}60 100%),
            linear-gradient(to bottom, ${interpolatedTheme.primary}50 0%, transparent 10%, transparent 90%, ${interpolatedTheme.primary}50 100%),
            conic-gradient(from 0deg at 50% 50%, ${interpolatedTheme.primary}30, transparent 20%, ${interpolatedTheme.primary}20, transparent 40%, ${interpolatedTheme.primary}30)
          `,
				}}
			/>

			{/* Performance optimization: Reduce motion on mobile */}
			<style jsx>{`
        @media (prefers-reduced-motion: reduce) {
          * {
            animation-duration: 0.01ms !important;
            animation-iteration-count: 1 !important;
            transition-duration: 0.01ms !important;
          }
        }

        /* Hide scrollbar for better immersion */
        ::-webkit-scrollbar {
          display: none;
        }

        /* Smooth scrolling */
        html {
          scroll-behavior: smooth;
        }
      `}</style>
		</div>
	);
};
