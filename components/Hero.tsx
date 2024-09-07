import React from 'react';
import Spline from '@splinetool/react-spline';
import { oxanium } from '@/app/fonts';

const Hero = () => (
    <div className={`flex h-screen w-full flex-col items-center justify-center ${oxanium.className}`}>
        <div className="w-full h-screen absolute">
             <Spline scene="https://prod.spline.design/y5ARq5Cux0dwuhC6/scene.splinecode" />
        </div>
        <div className="relative z-10 flex justify-center items-center flex-col">
            <h1 className="heading-text block flex w-auto text-balance text-center text-[4rem] leading-[.9em] uppercase tracking-wide md:text-[7rem]">
                Trading
            </h1>
            <h1 className="heading-text block flex w-auto text-balance text-center text-[3.25rem] leading-[.9em] uppercase tracking-wide md:text-[6rem]">
                Gamified
            </h1>
            <div className="flex w-full flex-col items-center justify-center">
                <h2 className="primary-text w-11/12 text-balance py-6 text-center text-xl text-gray-200 md:w-1/2 md:text-[1.25rem]">
                    The world's first 3D pattern recognition tool designed to identify
                    opportunities no one else sees.
                </h2>
            </div>
        </div>
        <div
            className='relative flex h-16 flex-row items-center gap-2 pt-6 md:flex-row'
        >
            <input
                type='email'
                placeholder='Enter your email'
                className='primary-text w-[280px] transform-gpu rounded-l-lg border border-gray-500/50 bg-black px-4 py-[.7em] text-xl font-medium outline-none transition-all duration-300 ease-in-out focus:border-2 focus:border-gray-500 md:w-auto lg:pr-32'
            />
            <button
                className='bottom-0 right-0 top-8 flex hidden w-[360px] transform-gpu items-center justify-center rounded-r-lg border border-gray-500 bg-gradient-to-r from-[#7886FF] to-[#CBFFFF] px-4 py-3 text-xl font-semibold text-black transition-all duration-300 ease-in-out hover:shadow-lg md:block md:w-auto'
            >
                Request Access
            </button>
            <button
                className='bottom-0 right-0 top-0 block flex w-auto transform-gpu items-center justify-center rounded-r-lg border border-gray-500 bg-gradient-to-r from-[#7886FF] to-[#CBFFFF] px-4 py-3 text-xl font-semibold text-black transition-all duration-300 ease-in-out hover:shadow-lg md:hidden md:w-auto'
            >
                SEND
            </button>
        </div>
    </div>
);

export default Hero;
