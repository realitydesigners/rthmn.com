'use client';
import { oxanium } from '@/app/fonts';
import { Scene } from './Scene';
import React from 'react';
import { motion } from 'framer-motion';
import styles from './styles.module.css';

export const HeroSection = () => (
  <div
    className={`flex h-screen w-full flex-col items-center relative justify-center ${oxanium.className} bg-black`}
  >
    <div className="w-full h-screen absolute">
      <Scene scene="https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-black via-black to-transparent"></div>
    <div className="w-full h-[50vh] -bottom-60 lg:bottom-0 lg:w-1/2 lg:-right-8 lg:h-screen absolute z-[100]">
      <Scene scene="https://prod.spline.design/XfnZeAWiAwxJxDxf/scene.splinecode" />
    </div>
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 1 }}
      className="relative z-10 flex justify-center items-center flex-col z-[99]"
    >
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5, duration: 0.8 }}
        className={`${styles.gradientBanner} text-sm lg:text-md font-semibold mb-8`}
      >
        <span className="font-extrabold pr-1">BETA v1.0 </span> Releasing this
        coming Fall 2024
      </motion.div>
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.8, duration: 1, type: 'spring' }}
        className="text-center"
      >
        <motion.h1
          className="heading-text font-bold text-[5rem] leading-[.9em] uppercase tracking-wide md:text-[9rem] mb-4 text-white"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{ duration: 4, repeat: Infinity, ease: 'easeInOut' }}
        >
          Trading
        </motion.h1>
        <motion.h1
          className="heading-text font-bold text-[4rem] leading-[.9em] uppercase tracking-wide md:text-[8rem] text-[#00ff9d]"
          animate={{ opacity: [0.8, 1, 0.8] }}
          transition={{
            duration: 4,
            repeat: Infinity,
            ease: 'easeInOut',
            delay: 2
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
          className="primary-text w-11/12 font-normal text-balance pt-4 text-center leading-[2rem] text-[1.25rem] text-gray-300 md:w-2/3 md:text-[1.5rem]"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 5, repeat: Infinity, ease: 'easeInOut' }}
        >
          The world's first 3D pattern recognition tool designed to identify
          opportunities no one else sees.
        </motion.h2>
        <div className="flex items-center w-full h-full gap-8 py-6 justify-center">
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className={styles.ctaButton}
          >
            Get Started
          </motion.button>
          <motion.div
            className="flex flex-col items-center justify-center text-[#00ff9d] hover:text-white transition-colors duration-300 cursor-pointer"
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
