"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";

export const AuroraBackground = () => (
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

export const StarField = () => {
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
		<div className="absolute inset-0 overflow-hidden">
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

export const Background = () => (
	<>
		<div className="absolute inset-0 bg-gradient-to-b from-black via-black/10 via-black/20 via-black/40 via-black/60 via-black/80 to-transparent" />
		<AuroraBackground />
		<StarField />
	</>
);
