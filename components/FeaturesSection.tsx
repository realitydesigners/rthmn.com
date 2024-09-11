'use client';
import React from 'react';
import { oxanium } from '@/app/fonts';
import { motion } from 'framer-motion';
import { FaCube, FaChartLine, FaGamepad, FaRobot } from 'react-icons/fa';

const features = [
  {
    title: '3D Pattern Recognition',
    description:
      'Identify complex market patterns in an intuitive 3D environment.',
    icon: FaCube
  },
  {
    title: 'Real-time Analysis',
    description:
      'Get instant insights on market trends and potential opportunities.',
    icon: FaChartLine
  },
  {
    title: 'Gamified Learning',
    description:
      'Improve your trading skills through interactive, game-like experiences.',
    icon: FaGamepad
  },
  {
    title: 'AI-Powered Predictions',
    description:
      'Leverage advanced AI algorithms for more accurate market forecasts.',
    icon: FaRobot
  }
];

const FeatureCard = ({ feature, index }) => (
  <motion.div
    initial={{ opacity: 0, y: 50 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.5, delay: index * 0.1 }}
    className="bg-gradient-to-br from-gray-900 to-gray-800 p-6 rounded-lg shadow-lg hover:shadow-2xl transition-all duration-300 border border-gray-700 hover:border-[#00ff9d]"
  >
    <motion.div
      whileHover={{ scale: 1.05 }}
      whileTap={{ scale: 0.95 }}
      className="flex items-center mb-4"
    >
      <feature.icon className="text-[#00ff9d] text-3xl mr-4" />
      <h3 className="text-2xl font-semibold text-white">{feature.title}</h3>
    </motion.div>
    <p className="text-gray-300">{feature.description}</p>
  </motion.div>
);

export const FeaturesSection: React.FC = () => {
  return (
    <section className={`pt-60 lg:pt-20 pb-20 bg-black ${oxanium.className}`}>
      <div className="flex flex-col items-center justify-center">
        <motion.h2
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-4xl w-full lg:w-1/3 md:text-5xl leading-[1.25em] lg:leading-[1.25em]  heading-text text-center"
        >
          A Next Generation Algorithmic Trading Platform
        </motion.h2>
        {/* <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {features.map((feature, index) => (
            <FeatureCard key={index} feature={feature} index={index} />
          ))}
        </div> */}
      </div>
    </section>
  );
};
