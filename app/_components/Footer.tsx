import Link from 'next/link';
import { FaTwitter, FaInstagram, FaGithub } from 'react-icons/fa';
import { oxanium, russo, outfit, kodeMono } from '@/fonts';

import type { JSX } from "react";

const getIcon = (name: string): JSX.Element => {
  const icons: { [key: string]: JSX.Element } = {
    logo: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby="logoTitle"
      >
        <title id="logoTitle">Logo</title>
        <g clipPath="url(#clip0_1208_27417)">
          <path
            d="M27.512 73.5372L27.512 28.512C27.512 27.9597 27.9597 27.512 28.512 27.512L70.4597 27.512C71.0229 27.512 71.475 27.9769 71.4593 28.54L70.8613 49.9176C70.8462 50.4588 70.4031 50.8896 69.8617 50.8896L50.7968 50.8896C49.891 50.8896 49.4519 51.9975 50.1117 52.618L92.25 92.25M92.25 92.25L48.2739 92.25L7.75002 92.25C7.19773 92.25 6.75002 91.8023 6.75002 91.25L6.75 7.75C6.75 7.19771 7.19772 6.75 7.75 6.75L91.25 6.75003C91.8023 6.75003 92.25 7.19775 92.25 7.75003L92.25 92.25Z"
            stroke="white"
            strokeWidth="8"
          />
        </g>
        <defs>
          <clipPath id="clip0_1208_27417">
            <rect width="100" height="100" fill="white" />
          </clipPath>
        </defs>
      </svg>
    )
  };
  return icons[name] || <path />;
};

export default function Footer() {
  return (
    <footer className={`w-full bg-black py-12 ${oxanium.className}`}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-4">
          <div className="flex flex-col">
            <div className="flex h-full items-center justify-between">
              <Link href="/" className="z-50 mb-4 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center">
                  {getIcon('logo')}
                </div>
                <div
                  className={`pt-1 text-2xl font-bold tracking-wide ${russo.className}`}
                >
                  RTHMN
                </div>
              </Link>
            </div>
            <p
              className={`w-3/4 text-sm text-gray-400 lg:w-full ${oxanium.className}`}
            >
              Next Generation Forex / Stocks Toolkit with AI-powered predictions
              and comprehensive risk management.
            </p>
            <div className="mt-4 flex space-x-4">
              <a
                href="https://x.com/rthmnapp"
                className="text-gray-400 hover:text-gray-300"
              >
                <span className="sr-only">Twitter</span>
                <FaTwitter className="h-6 w-6" />
              </a>
              <a
                href="https://github.com/rthmnapp"
                className="text-gray-400 hover:text-gray-300"
              >
                <span className="sr-only">GitHub</span>
                <FaGithub className="h-6 w-6" />
              </a>
              <a
                href="https://www.instagram.com/rthmnapp/"
                className="text-gray-400 hover:text-gray-300"
              >
                <span className="sr-only">Instagram</span>
                <FaInstagram className="h-6 w-6" />
              </a>
            </div>
          </div>
          <div>
            <h3
              className={`mb-4 text-sm font-semibold uppercase text-gray-300 ${russo.className}`}
            >
              Services
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/trading-signals"
                  className={`text-sm text-gray-400 hover:text-gray-300 ${oxanium.className}`}
                >
                  Trading Signals
                </Link>
              </li>
              <li>
                <Link
                  href="/pattern-recognition"
                  className={`text-sm text-gray-400 hover:text-gray-300 ${oxanium.className}`}
                >
                  3D Pattern Recognition
                </Link>
              </li>
              <li>
                <Link
                  href="/gamified-learning"
                  className={`text-sm text-gray-400 hover:text-gray-300 ${oxanium.className}`}
                >
                  Gamified Learning
                </Link>
              </li>
              <li>
                <Link
                  href="/risk-management"
                  className={`text-sm text-gray-400 hover:text-gray-300 ${oxanium.className}`}
                >
                  Risk Management
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className={`mb-4 text-sm font-semibold uppercase text-gray-300 ${russo.className}`}
            >
              Resources
            </h3>
            <ul className="space-y-2">
              <li>
                <Link
                  href="/blog"
                  className={`text-sm text-gray-400 hover:text-gray-300 ${oxanium.className}`}
                >
                  Blog
                </Link>
              </li>
              <li>
                <Link
                  href="/tutorials"
                  className={`text-sm text-gray-400 hover:text-gray-300 ${oxanium.className}`}
                >
                  Tutorials
                </Link>
              </li>
              <li>
                <Link
                  href="/market-analysis"
                  className={`text-sm text-gray-400 hover:text-gray-300 ${oxanium.className}`}
                >
                  Market Analysis
                </Link>
              </li>
              <li>
                <Link
                  href="/faq"
                  className={`text-sm text-gray-400 hover:text-gray-300 ${oxanium.className}`}
                >
                  FAQ
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <h3
              className={`mb-4 text-sm font-semibold uppercase text-gray-300 ${russo.className}`}
            >
              Stay Updated
            </h3>
            <form className="mt-4">
              <div className="flex max-w-md">
                <input
                  type="email"
                  placeholder="Your email"
                  className={`w-full rounded-l-md border border-gray-700 bg-gray-900 px-4 py-2 text-sm text-gray-300 focus:border-blue-400 focus:outline-none ${kodeMono.className}`}
                />
                <button
                  type="submit"
                  className={`group rounded-r-md bg-gradient-to-r from-[#5A97FF] to-[#61A3FF] px-4 py-2 text-sm font-semibold text-white shadow-sm shadow-xl transition-all duration-300 hover:shadow-lg focus:outline-none ${russo.className}`}
                >
                  Subscribe
                </button>
              </div>
            </form>
          </div>
        </div>
        <div className="mt-8 border-t border-gray-800 pt-8 text-center">
          <p className={`text-sm text-gray-400 ${oxanium.className}`}>
            &copy; 2024 RTHMN. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
