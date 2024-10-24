'use client';
import { oxanium, outfit, kodeMono } from '@/fonts';
import Link from 'next/link';
import { Scene } from '@/components/Scene/Scene';
import React from 'react';
import styles from './styles.module.css';
import { FaArrowRight } from 'react-icons/fa';

export const SectionHero = () => (
  <div
    className={`relative flex h-screen w-full flex-col justify-center ${oxanium.className} overflow-hidden bg-black`}
  >
    {/* <div className="absolute h-screen w-full">
      <Scene scene="https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-black via-black to-transparent"></div>
    <div className="absolute -bottom-60 right-0 z-[100] h-[50vh] w-full lg:bottom-0 lg:h-screen lg:w-1/2 lg:pl-24">
      <Scene scene="https://prod.spline.design/XfnZeAWiAwxJxDxf/scene.splinecode" />
    </div> */}
    <div className="relative z-10 z-[99] flex w-full flex-col px-[4vw] lg:ml-[16vw] lg:w-1/2 lg:px-0">
      <div className="text-left">
        <h1
          className={`${outfit.className} mb-2vw text-[12vw] font-bold leading-[1em] tracking-tight text-white sm:text-[9vw] lg:text-[7vw]`}
        >
          Trading
        </h1>
        <h1
          className={`${outfit.className} mb-2vw text-[10vw] font-bold leading-[1em] tracking-tight text-white sm:text-[8vw] lg:text-[6vw]`}
        >
          Simplified
        </h1>
      </div>
      <div className="flex w-full flex-col pt-[3vw]">
        <h2
          className={`${outfit.className} w-11/12 text-[4vw] leading-[1.4] text-gray-400 sm:text-[3vw] lg:w-2/3 lg:text-[1.75vw]`}
        >
          The world's first 3D pattern recognition tool designed to identify
          trading opportunities no one else sees.
        </h2>
        <div className="flex w-full flex-col items-center justify-center gap-[2vw] pt-[10vw] lg:flex-row lg:justify-start lg:pt-[3vw]">
          <Link
            href="/start"
            className="flex w-[90vw] items-center space-x-[1vw] rounded-md bg-gradient-to-b from-[#76FFD6] to-[#98FFF5] font-bold text-black transition-all duration-200 hover:from-[#3CFFBE] hover:to-[#98FFF5] sm:w-[66vw] lg:w-[16vw]"
          >
            <span className="flex w-full items-center justify-center space-x-[1vw] rounded-md bg-gradient-to-b from-[#3CFFBE] to-[#5EF1E7] py-[3vw] text-center text-[3vw] sm:py-[2vw] sm:text-[2vw] lg:py-[1vw] lg:text-[1.25vw]">
              <span>Start Now</span>
              <FaArrowRight />
            </span>
          </Link>
          <Link
            href="/start"
            className="flex w-[90vw] items-center space-x-[1vw] rounded-md bg-gradient-to-b from-[#0e0e0e] to-[#0a0a0a] p-[0.1vw] text-gray-50 transition-all duration-200 hover:from-[#222] hover:to-[#121212] sm:w-[66vw] lg:w-[16vw]"
          >
            <span
              className={`flex w-full items-center justify-center space-x-[1vw] rounded-md bg-gradient-to-b from-[#0e0e0e] to-[#000] py-[3vw] text-[3vw] sm:py-[2vw] sm:text-[2vw] lg:py-[1vw] lg:text-[1.25vw] ${kodeMono.className}`}
            >
              <span>How it works</span>
            </span>
          </Link>
        </div>
      </div>
    </div>
  </div>
);
