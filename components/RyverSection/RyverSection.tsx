"use client";
import Spline from "@splinetool/react-spline";
import { russo, oxanium } from "@/app/fonts";
import { motion, useScroll, useTransform } from "framer-motion";
import { useRef } from "react";

export function RyverSection() {
	const sectionRef = useRef(null);
	const { scrollYProgress } = useScroll({
		target: sectionRef,
		offset: ["start end", "end start"],
	});

	const opacity = useTransform(scrollYProgress, [0.2, 0.6], [0, 1]);
	const scale = useTransform(scrollYProgress, [0.2, 0.6], [0.8, 1]);
	const y = useTransform(scrollYProgress, [0.2, 0.6], [100, 0]);

	return (
		<>
			<div className="flex relative justify-center items-center h-screen">
				<Spline scene="https://prod.spline.design/B-MvWSCCJxiCK91v/scene.splinecode" />
				<div className="absolute">
					{/* Add content for right bottom and left bottom corners here */}
				</div>
			</div>

			<motion.div
				ref={sectionRef}
				className="flex justify-center h-screen bg-black"
				style={{ opacity, scale, y }}
			>
				<div className="pt-32 lg:pt-60 flex flex-col  items-center">
					<motion.div
						className="flex relative justify-center items-center"
						initial={{ opacity: 0, y: 20 }}
						animate={{ opacity: 1, y: 0 }}
						transition={{ duration: 0.8, delay: 0.2 }}
					>
						<div className="flex flex-col relative pl-6">
							<h1 className="text-sm lg:text-xl tracking-[.1em] lg:-mb-2 -ml-6 leading-none font-bold heading-text">
								RTHMN
							</h1>
							<h1
								className={`text-6xl lg:text-8xl leading-none tracking-wide font-bold heading-text ${russo.className}`}
							>
								RYVER
							</h1>
						</div>
						<h1 className="pl-2 text-md lg:text-4xl tracking-[.3em] font-bold heading-text">
							CHARTS
						</h1>
					</motion.div>
					<motion.div
						className="p-12 lg:p-6"
						initial={{ opacity: 0, scale: 0.9 }}
						animate={{ opacity: 1, scale: 1 }}
						transition={{ duration: 0.8, delay: 0.4 }}
					>
						<svg
							width="100%"
							height="100%"
							viewBox="0 0 465 138"
							fill="none"
							xmlns="http://www.w3.org/2000/svg"
						>
							<path
								d="M229.288 104.068V115.657L161 137V124.711L214.471 108.547M229.288 104.068L210.928 98.1385M229.288 104.068L214.471 108.547M192.567 92.209L210.928 98.1385M192.567 92.209L250.548 73.6169M192.567 92.209V101.428L214.471 108.547M268.587 68.0518V78.791L210.928 98.1385M268.587 68.0518L199.01 48.393M268.587 68.0518L250.548 73.6169M177.75 42.1377L250.548 30.2788M177.75 42.1377L199.01 48.393M177.75 42.1377V52.9204L250.548 73.6169M250.548 30.2788V39.3383L199.01 48.393M250.548 30.2788L230.577 25.4473M230.577 25.4473L210.606 20.6159L295 7V14.7612L230.577 25.4473Z"
								stroke="#B9CBD8"
							/>
							<path d="M357 1L464 124" stroke="#545F68" />
							<path
								d="M314 1L399 123"
								stroke="#ABBECD"
								stroke-dasharray="2 2"
							/>
							<path
								d="M272 2L327 125"
								stroke="#ABBECD"
								stroke-dasharray="2 2"
							/>
							<path
								d="M202 1L147 123"
								stroke="#ABBECD"
								stroke-dasharray="2 2"
							/>
							<path d="M161 1L76 123" stroke="#ABBECD" stroke-dasharray="2 2" />
							<path d="M109 1L1 124" stroke="#545F68" />
						</svg>
					</motion.div>
					<div
						className={`text-center pt-12 w-3/4 lg:w-1/2 heading-text text-2xl lg:text-4xl ${oxanium.className}`}
					>
						With RYVER Charts, you don’t just watch the market— you see how it
						flows.
					</div>
				</div>
			</motion.div>
			<div className="w-full h-screen bg-gray-200/5">
				image of our trading platform will go here
			</div>
		</>
	);
}
