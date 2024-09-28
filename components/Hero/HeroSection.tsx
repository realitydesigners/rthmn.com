"use client";
import { oxanium } from "@/app/fonts";
import { Scene } from "../Scene/Scene";
import React from "react";
import { motion } from "framer-motion";
import styles from "./styles.module.css";

export const HeroSection = () => (
	<div
		className={`relative flex h-screen w-full flex-col items-center justify-center ${oxanium.className} overflow--hidden bg-black`}
	>
		<div className="absolute h-screen w-full">
			<Scene scene="https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode" />
		</div>
		<div className="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-black via-black to-transparent"></div>
		<div className="absolute -bottom-60 right-0 z-[100] h-[50vh] w-full lg:bottom-0 lg:h-screen lg:w-1/2 lg:pl-24">
			<Scene scene="https://prod.spline.design/XfnZeAWiAwxJxDxf/scene.splinecode" />
		</div>
		<motion.div
			initial={{ opacity: 0 }}
			animate={{ opacity: 1 }}
			transition={{ duration: 1 }}
			className="relative z-10 z-[99] flex flex-col items-center justify-center"
		>
			<motion.div
				initial={{ opacity: 0, y: -20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 0.5, duration: 0.8 }}
				className={`${styles.gradientBanner} lg:text-md mb-8 text-sm font-semibold`}
			>
				<span className="pr-1 font-extrabold">BETA v1.0 </span> Releasing this
				Fall 2024
			</motion.div>
			<motion.div
				initial={{ opacity: 0, scale: 0.9 }}
				animate={{ opacity: 1, scale: 1 }}
				transition={{ delay: 0.8, duration: 1, type: "spring" }}
				className="text-center"
			>
				<motion.h1
					className="heading-text mb-4 text-[5rem] font-bold uppercase leading-[.9em] tracking-wide text-white md:text-[9rem]"
					animate={{ opacity: [0.8, 1, 0.8] }}
					transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
				>
					Trading
				</motion.h1>
				<motion.h1
					className="heading-text text-[4rem] font-bold uppercase leading-[.9em] tracking-wide text-[#00ff9d] md:text-[8rem]"
					animate={{ opacity: [0.8, 1, 0.8] }}
					transition={{
						duration: 4,
						repeat: Infinity,
						ease: "easeInOut",
						delay: 2,
					}}
				>
					Gamified
				</motion.h1>
			</motion.div>
			<motion.div
				initial={{ opacity: 0, y: 20 }}
				animate={{ opacity: 1, y: 0 }}
				transition={{ delay: 1.2, duration: 1 }}
				className="flex w-full flex-col items-center justify-center"
			>
				<motion.h2
					className="primary-text w-11/12 text-balance pt-4 text-center text-[1.25rem] font-normal leading-[2rem] text-gray-300 md:w-2/3 md:text-[1.5rem]"
					animate={{ opacity: [0.7, 1, 0.7] }}
					transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
				>
					The world's first 3D pattern recognition tool designed to identify
					opportunities no one else sees.
				</motion.h2>
				<div className="flex h-full w-full items-center justify-center gap-8 py-6">
					<motion.button
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
						className={styles.ctaButton}
					>
						Get Started
					</motion.button>
					<motion.div
						className="flex cursor-pointer flex-col items-center justify-center text-[#00ff9d] transition-colors duration-300 hover:text-white"
						whileHover={{ scale: 1.05 }}
						whileTap={{ scale: 0.95 }}
					>
						Learn more
					</motion.div>
				</div>
			</motion.div>
		</motion.div>
	</div>
);
