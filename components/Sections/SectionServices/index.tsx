'use client';

import type React from 'react';
import { useEffect, useState, type JSX } from 'react';

const Services = [
    {
        label: 'PULSE',
        icon: 'lock',
        // Icon: A glowing, pulsating arrow.
        // desc: "Represents dynamic and real-time signals, with a futuristic, neon-glow effect to symbolize the cutting-edge algorithmic alerts.",
        desc: 'PULSE provides real-time trading signals, enabling users to receive instant alerts on market opportunities. This feature uses advanced algorithms to analyze market data and notify users of potential trades, ensuring they can capitalize on opportunities as soon as they arise. Users will benefit from increased responsiveness and the ability to make timely, informed trading decisions.',
    },
    {
        label: 'VISION',
        icon: 'lock',
        // Icon: A 3D holographic chart.
        // desc: "A transparent, interactive chart floating in mid-air with glowing data points and lines, emphasizing advanced visualization and insight.",
        desc: 'VISION offers interactive 3D charts that provide enhanced visualization of market trends and data. This feature allows users to explore and analyze data in a more intuitive and detailed way, leading to better insights and more accurate trading strategies. Users will appreciate the clarity and depth of information, which aids in making well-informed decisions.',
    },
    {
        label: 'SECURE',
        icon: 'lock',
        // Icon: A shield with a lock.
        // desc: "A metallic shield with a glowing lock in the center, symbolizing robust end-to-end encryption and data security.",
        desc: 'SECURE ensures robust end-to-end encryption and comprehensive data security for users. This feature protects sensitive information and trading activities from unauthorized access, providing a secure trading environment. Users will value the confidence and peace of mind that comes with knowing their data and transactions are protected.',
    },
    {
        label: 'ALERT',
        icon: 'lock',
        // Icon: A ringing bell with waves.
        // desc: "A sleek, futuristic bell emitting glowing notification waves, representing real-time updates and alerts.",
        desc: 'ALERT provides real-time notifications and updates to users, ensuring they are always informed about important market changes and trading signals. This feature helps users stay up-to-date with the latest developments, allowing them to act swiftly and effectively. Users will benefit from the ability to respond quickly to market conditions, enhancing their trading performance.',
    },
    {
        label: 'GUARD',
        icon: 'lock',
        // Icon: A digital guard tower.
        // desc: "A tall, futuristic tower with radar-like beams scanning the environment, symbolizing comprehensive risk management and protection.",
        desc: 'GUARD offers comprehensive risk management and protection features, helping users to mitigate potential trading risks. This feature continuously monitors the market and user portfolios to identify and alert on potential threats. Users will appreciate the enhanced security and risk management, which helps to safeguard their investments and minimize losses.',
    },
    {
        label: 'LIBRARY',
        icon: 'lock',
        // Icon: A holographic book.
        // desc: "An open book with floating, glowing pages and text, representing a wealth of educational content and resources.",
        desc: 'LIBRARY provides a wealth of educational content and resources to help users improve their trading knowledge and skills. This feature includes tutorials, articles, and guides on various trading topics. Users will benefit from continuous learning opportunities, which can enhance their trading strategies and overall success.',
    },
    {
        label: 'CONNECT',
        icon: 'lock',
        // Icon: Interconnected nodes.
        // desc: "A network of glowing, interconnected nodes forming a web, symbolizing a vibrant social trading community.",
        desc: 'CONNECT fosters a vibrant social trading community, enabling users to interact, share insights, and collaborate with other traders. This feature includes forums, chat rooms, and social feeds. Users will value the sense of community and the opportunity to learn from and support each other, which can lead to better trading outcomes.',
    },
    {
        label: 'INSIGHTS',
        icon: 'lock',
        // Icon: A 3D magnifying glass over data.
        // desc: "A magnifying glass with a glowing lens highlighting detailed data points, representing in-depth performance analytics.",
        desc: 'INSIGHTS provides in-depth performance analytics, offering detailed analysis of trading activities and market trends. This feature helps users to evaluate their trading strategies, track performance metrics, and identify areas for improvement. Users will benefit from the detailed insights that can guide their decision-making and enhance their trading effectiveness.',
    },
    {
        label: 'SYNC',
        icon: 'lock',
        // Icon: Synchronized gears.
        // desc: "A set of interlocking, glowing gears rotating in harmony, symbolizing seamless device integration and synchronization.",
        desc: 'SYNC ensures seamless device integration and synchronization, allowing users to access their trading platform from multiple devices without interruption. This feature provides a consistent and connected trading experience across desktops, tablets, and smartphones. Users will appreciate the flexibility and convenience of being able to trade on-the-go with synchronized data.',
    },
];

export const ServiceSection = () => {
    const [activeService, setActiveService] = useState<string | null>(null);
    const [isDetailVisible, setIsDetailVisible] = useState(false);

    useEffect(() => {
        setIsDetailVisible(!!activeService);
    }, [activeService]);

    const handleServiceClick = (label: string) => {
        setActiveService(activeService !== label ? label : null);
    };

    const handleKeyPress = (event: React.KeyboardEvent, label: string) => {
        if (event.key === 'Enter' || event.key === ' ') {
            handleServiceClick(label);
        }
    };

    return (
        <div className='flex w-full flex-row flex-wrap px-4 py-10 text-white md:px-40'>
            <div className={`text-balance transition-all duration-300 ease-in-out ${isDetailVisible ? 'w-full lg:w-1/6 lg:grid-cols-1' : 'w-full lg:grid-cols-4'}`}>
                <ul className={`grid ${isDetailVisible ? 'grid-cols-2 lg:grid-cols-1' : 'grid-cols-2 md:grid-cols-5'} gap-1`}>
                    {Services.map(({ label, icon }) => (
                        <li
                            key={label}
                            className={`heading-text w-full cursor-pointer border border-neutral-600/50 p-4 ${
                                activeService === label ? 'bg-neutral-600/25' : 'bg-black hover:bg-neutral-600/25'
                            } flex items-center transition duration-300 ease-in-out`}
                            onClick={() => handleServiceClick(label)}
                            onKeyDown={(e) => handleKeyPress(e, label)}>
                            {getIcon(icon)}
                            <div className={`text-oxanium ml-2 text-lg leading-[1.2em] font-bold uppercase`}>{label}</div>
                        </li>
                    ))}
                </ul>
            </div>
            {isDetailVisible && (
                <div
                    className='lg:-16 mt-4 ml-0 h-[80vh] grow overflow-hidden border border-neutral-600/25 p-4 transition-all duration-500 ease-in-out lg:mt-0 lg:ml-4 lg:w-3/4'
                    style={{
                        maxHeight: isDetailVisible ? '100%' : '0',
                        opacity: isDetailVisible ? 1 : 0,
                    }}>
                    <h2 className={`heading-text fade-in text-oxanium mb-4 text-4xl leading-none font-bold uppercase lg:text-5xl`}>{activeService}</h2>
                    <p className={`primary-text fade-in text-oxanium text-xl text-neutral-400`}>{Services.find((service) => service.label === activeService)?.desc}</p>
                </div>
            )}
        </div>
    );
};

const getIcon = (name: string): JSX.Element => {
    if (name in icons) {
        return icons[name as keyof typeof icons];
    }
    return <svg />;
};

const icons = {
    lock: (
        <svg width='20' height='20' viewBox='0 0 18 20' fill='none' xmlns='http://www.w3.org/2000/svg' aria-labelledby='lockIconTitle'>
            <title id='lockIconTitle'>Lock Icon</title>
            <path
                d='M1 11C1 9.11438 1 8.17157 1.58579 7.58579C2.17157 7 3.11438 7 5 7H13C14.8856 7 15.8284 7 16.4142 7.58579C17 8.17157 17 9.11438 17 11V13C17 15.8284 17 17.2426 16.1213 18.1213C15.2426 19 13.8284 19 11 19H7C4.17157 19 2.75736 19 1.87868 18.1213C1 17.2426 1 15.8284 1 13V11Z'
                stroke='#444'
                strokeWidth='2'
            />
            <path d='M13 6V5C13 2.79086 11.2091 1 9 1V1C6.79086 1 5 2.79086 5 5V6' stroke='#444' strokeWidth='2' strokeLinecap='round' />
            <circle cx='9' cy='13' r='2' fill='#444' />
        </svg>
    ),
};
