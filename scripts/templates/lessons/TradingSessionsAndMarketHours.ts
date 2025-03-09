import { Block, H1, H2, H3, Text, Callout, Quiz, BulletList } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const TradingSessionsAndMarketHours = new PortableTextBuilder('Trading Sessions and Market Hours')
    .setDescription('Understanding the 24-hour forex market cycle and how different trading sessions affect market behavior')
    .setEstimatedTime('35 minutes')
    .setOrder(6)
    .addContent(
        Block({
            key: 'intro_block',
            children: [
                H1({ text: 'Trading Sessions and Market Hours' }),

                Callout({
                    title: 'Key Learning Points',
                    points: [
                        'The structure of the 24-hour forex market',
                        'Characteristics of major trading sessions',
                        'Session overlaps and their significance',
                        'How different pairs behave during various sessions',
                        'Optimal trading times for different strategies',
                        'Managing trades across sessions',
                    ],
                }),

                Text({
                    text: 'Unlike traditional stock markets with fixed opening and closing times, the forex market operates 24 hours a day, five days a week. This continuous operation is possible because forex trading moves through different global sessions as financial centers around the world open and close. Understanding these sessions and their characteristics is crucial for developing effective trading strategies and choosing optimal times to trade.',
                }),

                Text({
                    text: "In this lesson, we'll explore how the forex market transitions through different sessions, what makes each session unique, and how you can use this knowledge to improve your trading results. We'll also examine how different currency pairs behave during various sessions and how to adapt your trading approach accordingly.",
                }),

                H2({ text: 'The Four Major Trading Sessions' }),

                Text({
                    text: 'The forex market can be divided into four major trading sessions: Sydney, Tokyo, London, and New York. Each session has its own characteristics in terms of liquidity, volatility, and the currency pairs that are most actively traded.',
                }),

                H3({ text: 'Sydney Session' }),

                Text({
                    text: 'Opening: 22:00 GMT (Previous Day)',
                }),
                Text({
                    text: 'Closing: 07:00 GMT',
                }),
                Text({
                    text: "The Sydney session marks the start of the trading day. While it's the smallest of the major sessions in terms of volume, it sets the tone for the Asian trading day and can be particularly important for AUD and NZD pairs. Activity tends to be lighter during this session unless significant news from Australia or New Zealand is released.",
                }),

                H3({ text: 'Tokyo Session (Asian Session)' }),

                Text({
                    text: 'Opening: 00:00 GMT',
                }),
                Text({
                    text: 'Closing: 09:00 GMT',
                }),
                Text({
                    text: 'The Tokyo session brings significant activity to the forex market, particularly for pairs involving Asian currencies. This session is characterized by:',
                }),

                ...BulletList({
                    items: [
                        'Strong focus on JPY pairs',
                        'Influence of Asian economic news',
                        'Generally lower volatility compared to European and US sessions',
                        'Important for pairs involving AUD, NZD, and Asian currencies',
                        'Significant participation from Asian central banks and financial institutions',
                    ],
                    key: 'tokyo-characteristics',
                }),

                H3({ text: 'London Session (European Session)' }),

                Text({
                    text: 'Opening: 08:00 GMT',
                }),
                Text({
                    text: 'Closing: 17:00 GMT',
                }),
                Text({
                    text: 'The London session is the largest and most important trading session, accounting for approximately 35% of all forex transactions. Key characteristics include:',
                }),

                ...BulletList({
                    items: [
                        'Highest trading volume and liquidity',
                        'Most volatile session, especially during the morning hours',
                        'Major moves often begin during this session',
                        'Strong focus on EUR and GBP pairs',
                        'Significant institutional trading activity',
                    ],
                    key: 'london-characteristics',
                }),

                H3({ text: 'New York Session' }),

                Text({
                    text: 'Opening: 13:00 GMT',
                }),
                Text({
                    text: 'Closing: 22:00 GMT',
                }),
                Text({
                    text: 'The New York session is the second-largest trading session and is particularly important for USD pairs. Notable characteristics include:',
                }),

                ...BulletList({
                    items: [
                        'High liquidity for USD pairs',
                        'Major economic releases from the US',
                        'Significant activity in USD/CAD due to Canadian market hours',
                        'Afternoon hours often see reduced volatility',
                        'Important for closing daily positions',
                    ],
                    key: 'ny-characteristics',
                }),

                H2({ text: 'Session Overlaps: The Most Active Trading Hours' }),

                Text({
                    text: 'Some of the most active trading periods occur when two sessions overlap, creating increased liquidity and potential trading opportunities. The most significant overlaps are:',
                }),

                H3({ text: 'London-New York Overlap' }),

                Text({
                    text: 'Time: 13:00-17:00 GMT',
                }),
                Text({
                    text: 'This is typically the most active period in the forex market, characterized by:',
                }),

                ...BulletList({
                    items: [
                        'Highest trading volume and liquidity',
                        'Most significant price movements',
                        'Tighter spreads due to high liquidity',
                        'Major economic releases from both Europe and US',
                        'Strong institutional participation',
                    ],
                    key: 'london-ny-overlap',
                }),

                H3({ text: 'Tokyo-London Overlap' }),

                Text({
                    text: 'Time: 08:00-09:00 GMT',
                }),
                Text({
                    text: 'While shorter, this overlap can be significant for certain pairs:',
                }),

                ...BulletList({
                    items: [
                        'Important for EUR/JPY and GBP/JPY',
                        'Asian markets reacting to European opening',
                        'Often sees increased volatility in Asian currencies',
                        'Can set the tone for the European session',
                    ],
                    key: 'tokyo-london-overlap',
                }),

                H2({ text: 'Currency Pair Behavior During Different Sessions' }),

                Text({
                    text: 'Different currency pairs exhibit varying levels of activity and volatility during different sessions. Understanding these patterns can help you choose the best pairs to trade during your preferred trading hours:',
                }),

                Text({
                    text: 'Asian Session Pairs:',
                }),
                ...BulletList({
                    items: [
                        'USD/JPY - Most active',
                        'AUD/USD - Significant activity during Australian news',
                        'NZD/USD - Active during New Zealand news',
                        'EUR/JPY - Popular cross rate',
                        'GBP/JPY - Often volatile',
                    ],
                    key: 'asian-pairs',
                }),

                Text({
                    text: 'London Session Pairs:',
                }),
                ...BulletList({
                    items: [
                        'EUR/USD - Highest volume',
                        'GBP/USD - Major moves during UK news',
                        'EUR/GBP - Active during European news',
                        'USD/CHF - Significant activity',
                        'EUR/CHF - Important European cross',
                    ],
                    key: 'london-pairs',
                }),

                Text({
                    text: 'New York Session Pairs:',
                }),
                ...BulletList({
                    items: [
                        'EUR/USD - Continues high activity',
                        'USD/CAD - Peak activity during US/Canadian overlap',
                        'USD/MXN - Active during US hours',
                        'USD/BRL - Latin American currency focus',
                    ],
                    key: 'ny-pairs',
                }),

                H2({ text: 'Trading Strategy Considerations' }),

                Text({
                    text: 'Your trading strategy should align with the characteristics of different sessions:',
                }),

                H3({ text: 'Range Trading' }),

                Text({
                    text: 'Best during:',
                }),
                ...BulletList({
                    items: ['Asian session when markets are less volatile', 'Late US session as volatility decreases', 'Periods with no major economic releases'],
                    key: 'range-trading',
                }),

                H3({ text: 'Trend Trading' }),

                Text({
                    text: 'Best during:',
                }),
                ...BulletList({
                    items: ['London opening hours', 'London-NY overlap', 'Major economic news releases', 'When key technical levels break during high-liquidity periods'],
                    key: 'trend-trading',
                }),

                H3({ text: 'News Trading' }),

                Text({
                    text: 'Best during:',
                }),
                ...BulletList({
                    items: ['Major economic releases in respective sessions', 'Central bank announcements', 'High-liquidity periods for quick execution'],
                    key: 'news-trading',
                }),

                H2({ text: 'Managing Trades Across Sessions' }),

                Text({
                    text: 'Trading across different sessions requires special consideration:',
                }),

                ...BulletList({
                    items: [
                        'Be aware of widening spreads during session transitions',
                        'Consider adjusting stop losses during less liquid periods',
                        'Monitor positions during major news releases in all sessions',
                        'Be prepared for gap risk between sessions',
                        'Understand how carry trade flows affect overnight positions',
                    ],
                    key: 'cross-session-management',
                }),

                H2({ text: 'Practical Tips for Session Trading' }),

                Text({
                    text: 'To make the most of different trading sessions:',
                }),

                ...BulletList({
                    items: [
                        'Create a trading schedule that aligns with your most productive hours',
                        'Focus on pairs that are most active during your trading hours',
                        'Keep an economic calendar marked with major releases in all sessions',
                        'Monitor session overlap periods for potential opportunities',
                        'Adjust position sizes based on session liquidity',
                        'Be aware of increased costs during less liquid periods',
                    ],
                    key: 'practical-tips',
                }),

                H2({ text: 'Conclusion' }),

                Text({
                    text: "Understanding trading sessions and market hours is crucial for developing effective trading strategies. Each session has its own characteristics, and the most successful traders adapt their approach accordingly. Whether you're day trading during session overlaps or holding positions across multiple sessions, this knowledge helps you anticipate market behavior and manage your trades more effectively.",
                }),

                Quiz({
                    question: 'Which trading session typically has the highest volume?',
                    options: ['Tokyo Session', 'Sydney Session', 'London Session', 'New York Session'],
                    correctAnswer: 2,
                    explanation:
                        'The London session typically has the highest trading volume, accounting for approximately 35% of all forex transactions. This makes it the most liquid and often the most volatile session.',
                }),

                Quiz({
                    question: 'When is the most active trading period in the forex market?',
                    options: ['Tokyo-London overlap', 'London-New York overlap', 'Sydney-Tokyo overlap', 'New York-Sydney overlap'],
                    correctAnswer: 1,
                    explanation:
                        'The London-New York overlap (13:00-17:00 GMT) is typically the most active period in the forex market, featuring the highest trading volume, liquidity, and often the most significant price movements.',
                }),

                Quiz({
                    question: 'Which pairs are typically most active during the Asian session?',
                    options: ['EUR/USD and GBP/USD', 'USD/CAD and USD/MXN', 'USD/JPY and AUD/USD', 'EUR/GBP and EUR/CHF'],
                    correctAnswer: 2,
                    explanation:
                        'During the Asian session, pairs involving Asian-Pacific currencies like USD/JPY and AUD/USD are typically most active, especially during relevant economic news releases from these regions.',
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Create a schedule of trading sessions in your local time',
                        'Identify which sessions align best with your availability',
                        'Monitor how your preferred pairs behave during different sessions',
                        'Practice trading during different sessions to find your optimal trading times',
                        'Keep a trading journal noting session-specific observations',
                        'Study how major economic releases affect different sessions',
                    ],
                }),
            ],
        })
    )
    .build();
