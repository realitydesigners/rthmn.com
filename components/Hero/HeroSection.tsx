import { oxanium } from '@/app/fonts';
import { Scene } from './Scene';
import React from 'react';

export const HeroSection = () => (
  <div
    className={`flex h-screen w-full flex-col items-center relative justify-center ${oxanium.className}`}
  >
    <div className="w-full h-screen absolute">
      <Scene scene="https://prod.spline.design/0PMxshYRA0EskOl3/scene.splinecode" />
    </div>
    <div className="w-full h-[400px] bottom-0 lg:w-1/2 -right-8 lg:h-screen absolute z-[100]">
      <Scene scene="https://prod.spline.design/XfnZeAWiAwxJxDxf/scene.splinecode" />
    </div>
    <div className="relative z-10 flex justify-center items-center flex-col z-[99]">
      <h1 className="heading-text font-bold block flex w-auto text-balance text-center text-[5rem] leading-[.9em] uppercase tracking-wide md:text-[9rem]">
        Trading
      </h1>
      <h1 className="heading-text block font-bold flex w-auto text-balance text-center text-[4rem] leading-[.9em] uppercase tracking-wide md:text-[8rem]">
        Gamified
      </h1>
      <div className="flex w-full flex-col items-center justify-center">
        <h2 className="primary-text w-11/12 font-normal text-balance py-6 text-center leading-[2rem] text-[1.25rem] text-gray-200 md:w-2/3 md:text-[1.5rem]">
          The world's first 3D pattern recognition tool designed to identify
          opportunities no one else sees.
        </h2>
      </div>
    </div>
  </div>
);
