import { Block, H1, H2, Text, Callout, Quiz, BulletList } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const UnderstandingPriceQuotes = new PortableTextBuilder('Understanding Price Quotes')
    .setDescription('A comprehensive guide to interpreting and utilizing price quotes effectively in forex trading')
    .setEstimatedTime('40 minutes')
    .setOrder(2)
    .addContent(
        Block({
            key: 'intro_block',
            children: [
                H1({ text: 'Understanding Price Quotes' }),

                Callout({
                    title: 'Key Learning Points',
                    points: [
                        'How to read and interpret forex price quotes',
                        'Understanding bid and ask prices',
                        'The significance of spreads in trading',
                        'How price quotes impact your trading decisions',
                        'Common misconceptions and pitfalls',
                    ],
                }),

                Text({
                    text: 'Price quotes are the fundamental language of the forex market. Every trading decision revolves around interpreting these quotes accurately. Understanding how to read and utilize price quotes effectively is crucial for successful trading.',
                }),

                H2({ text: 'The Structure of a Forex Price Quote' }),

                Text({
                    text: 'A forex price quote consists of two prices: the bid and the ask. The bid price represents the highest price a buyer is willing to pay, while the ask price is the lowest price a seller is willing to accept. The difference between these two prices is known as the spread.',
                }),

                BulletList({
                    items: [
                        'Bid Price: The price at which you can sell the base currency.',
                        'Ask Price: The price at which you can buy the base currency.',
                        'Spread: The difference between the bid and ask prices, representing transaction costs.',
                    ],
                }),

                H2({ text: 'Interpreting Bid and Ask Prices' }),

                Text({
                    text: 'Understanding bid and ask prices is essential for executing trades effectively. The bid price is always lower than the ask price, and the spread between them can vary based on market liquidity and volatility.',
                }),

                BulletList({
                    items: [
                        'A narrower spread indicates higher liquidity and lower transaction costs.',
                        'A wider spread can signal lower liquidity or increased market volatility.',
                        'Monitoring spreads helps traders choose optimal trading times and currency pairs.',
                    ],
                }),

                H2({ text: 'The Impact of Spreads on Trading' }),

                Text({
                    text: 'Spreads directly affect your trading costs and profitability. Understanding how spreads fluctuate and their impact on your trades is vital for managing costs and maximizing profits.',
                }),

                BulletList({
                    items: [
                        'Spreads widen during periods of low liquidity or high volatility.',
                        'Choosing currency pairs with consistently narrow spreads can reduce trading costs.',
                        'Being aware of spread fluctuations helps in timing entries and exits effectively.',
                    ],
                }),

                Quiz({
                    question: 'What does a narrower spread typically indicate?',
                    options: [
                        'Higher liquidity and lower transaction costs',
                        'Lower liquidity and higher transaction costs',
                        'Increased market volatility',
                        'Decreased market activity',
                    ],
                    correctAnswer: 0,
                    explanation: 'A narrower spread typically indicates higher liquidity and lower transaction costs, making it favorable for traders.',
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Regularly monitor spreads across different currency pairs.',
                        'Practice interpreting bid and ask prices in real-time market conditions.',
                        'Incorporate spread analysis into your trading strategy to optimize performance.',
                    ],
                }),

                H2({ text: 'Pips and Points: Measuring Price Movement' }),

                Text({
                    text: 'In forex trading, price movements are measured in pips and points. Understanding these units is essential for accurately calculating profits, losses, and transaction costs.',
                }),

                BulletList({
                    items: [
                        'Pip: The smallest price increment in forex trading, typically the fourth decimal place for most currency pairs.',
                        'Point: A fractional pip, representing an even smaller price movement, usually the fifth decimal place.',
                    ],
                }),

                H2({ text: 'Pips and Points Across Different Currency Pairs' }),

                Text({
                    text: 'Different currency pairs have varying pip and point values, affecting how price movements are calculated and interpreted. Understanding these differences is crucial for precise trade execution and risk management.',
                }),

                BulletList({
                    items: [
                        'EUR/USD, GBP/USD, AUD/USD: Typically quoted to five decimal places, where the fifth decimal is a point.',
                        'USD/JPY, AUD/JPY, CHF/JPY: Typically quoted to three decimal places, where the third decimal is a point.',
                        'Exotic pairs like USD/MXN, USD/ZAR: Often quoted to four decimal places, with the fourth decimal as a point.',
                    ],
                }),

                Text({
                    text: 'Understanding the specific quoting conventions for each currency pair helps traders accurately calculate potential profits, losses, and transaction costs, making it a critical aspect of effective trading.',
                }),

                Quiz({
                    question: 'What is the difference between a pip and a point?',
                    options: [
                        'A pip is larger than a point and typically represents the fourth decimal place.',
                        'A point is larger than a pip.',
                        'They are the same thing.',
                        'A pip is used only for exotic currency pairs.',
                    ],
                    correctAnswer: 0,
                    explanation:
                        'A pip is the smallest standard increment, typically the fourth decimal place, while a point is a fractional pip, usually the fifth decimal place.',
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Familiarize yourself with quoting conventions for currency pairs you trade regularly.',
                        'Practice calculating pips and points to enhance your precision in trade planning.',
                        'Incorporate pip and point calculations into your risk management strategy.',
                    ],
                }),
            ],
        })
    )
    .build();
