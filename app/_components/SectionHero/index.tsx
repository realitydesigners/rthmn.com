'use client';
import { oxanium, outfit } from '@/fonts';
import Link from 'next/link';
import { Scene } from '@/components/Scene/Scene';
import React from 'react';
import styles from './styles.module.css';
import { FaArrowRight } from 'react-icons/fa';

export const HeroSection = () => (
  <div
    className={`relative flex h-screen w-full flex-col justify-center ${oxanium.className} overflow--hidden bg-black`}
  >
    <div className="absolute h-screen w-full">
      <Scene scene="https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode" />
    </div>
    <div className="absolute bottom-0 left-0 right-0 h-1/6 bg-gradient-to-t from-black via-black to-transparent"></div>
    <div className="absolute -bottom-60 right-0 z-[100] h-[50vh] w-full lg:bottom-0 lg:h-screen lg:w-1/2 lg:pl-24">
      <Scene scene="https://prod.spline.design/XfnZeAWiAwxJxDxf/scene.splinecode" />
    </div>
    <div className="relative z-10 z-[99] ml-32 flex w-1/2 flex-col">
      <div className="text-center md:text-left">
        <h1
          className={`${outfit.className} mb-4 text-[5rem] font-bold leading-[.9em] tracking-tight text-white md:text-[9rem]`}
        >
          Trading
        </h1>
        <h1
          className={`${outfit.className} mb-4 text-[4rem] font-bold leading-[.9em] tracking-tight text-white md:text-[8rem]`}
        >
          Simplified
        </h1>
      </div>
      <div className="flex w-full flex-col">
        <h2
          className={`${outfit.className} heading-text mb-12 w-11/12 text-balance pt-4 text-[1.25rem] font-normal leading-[2rem] text-gray-300 md:w-2/3 md:text-[1.75rem]`}
        >
          The world's first 3D pattern recognition tool designed to identify
          opportunities no one else sees.
        </h2>
        <div className="flex w-full items-center gap-4">
          <Link
            href="/start"
            className="flex items-center space-x-3 rounded-md bg-gradient-to-b from-[#76FFD6] to-[#98FFF5] p-[1px] font-bold text-black transition-all duration-200 hover:from-[#fff] hover:to-[#98FFF5]"
          >
            <span className="flex items-center space-x-2 rounded-md bg-gradient-to-b from-[#3CFFBE] to-[#5EF1E7] px-3 px-6 py-2 py-3 text-2xl">
              <span>Start Now</span>
              <FaArrowRight />
            </span>
          </Link>
          <Link
            href="/start"
            className="flex items-center space-x-3 rounded-md bg-gradient-to-b from-[#333333] to-[#181818] p-[1px] text-gray-50 transition-all duration-200 hover:from-[#444444] hover:to-[#282828]"
          >
            <span className="flex items-center space-x-2 rounded-md bg-gradient-to-b from-[#0A0A0A] to-[#181818] px-3 px-6 py-2 py-3 text-2xl">
              <span>How it works</span>
              <FaArrowRight />
            </span>
          </Link>
        </div>
      </div>
    </div>
  </div>
);
