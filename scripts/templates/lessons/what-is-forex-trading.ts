import { Block, H1, H2, H3, Text, Callout, Quiz } from '../components/LessonComponents';
import { BaseLesson, LessonMetadata } from './base-lesson';

const metadata: LessonMetadata = {
    title: 'What is Forex Trading?',
    description: 'Understanding the basics of forex markets and how currency trading works',
    estimatedTime: '30 minutes',
    order: 1,
};

export class WhatIsForexTradingLesson extends BaseLesson {
    constructor() {
        super(metadata);
    }

    getContent() {
        return [
            Block({
                key: 'intro_block',
                children: [
                    H1({ text: 'What is Forex Trading?' }),

                    Callout({
                        title: 'Key Learning Points',
                        points: [
                            'Understanding the forex market structure',
                            'How currency pairs work and are quoted',
                            'Key market participants and their roles',
                            'Basic trading mechanics and terminology',
                            'Market hours and trading sessions',
                        ],
                    }),

                    Text({
                        text: 'Forex trading is the process of exchanging one currency for another through the financial markets. With a daily volume exceeding $6.6 trillion, it is the largest and most liquid financial market in the world.',
                    }),

                    Text({
                        text: 'This massive market operates 24 hours a day, five days a week, providing traders with opportunities around the clock. Unlike traditional stock markets, forex trading doesn`t take place on a centralized exchange, but rather through a global network of banks, financial institutions, and individual traders.',
                    }),

                    H2({ text: 'The Structure of the Forex Market' }),

                    Text({
                        text: 'Unlike stocks which trade on centralized exchanges, the forex market is decentralized and operates 24 hours a day through a global network of banks, institutions, and traders. This decentralized nature creates a more dynamic and fluid trading environment.',
                    }),

                    Text({
                        text: 'The interbank market forms the core of forex trading, where large banks trade directly with each other or through electronic networks. This core market sets the basis for all retail forex trading, though retail traders access the market through forex brokers.',
                    }),

                    H2({ text: 'Currency Pairs Explained' }),

                    Text({
                        text: 'Currencies are always traded in pairs. When you trade forex, you are simultaneously buying one currency while selling another. This concept is fundamental to understanding how forex trading works.',
                    }),

                    Text({
                        text: 'Each currency pair represents a price quote of how much one currency is worth in terms of the other. For example, if the EUR/USD price is 1.2000, it means that one euro can buy 1.20 U.S. dollars.',
                    }),

                    H2({ text: 'Market Participants' }),

                    Text({
                        text: 'The forex market consists of various participants, each playing a crucial role in maintaining market liquidity and efficiency. Understanding these participants helps traders grasp market dynamics better.',
                    }),

                    H2({ text: 'Trading Sessions' }),

                    Text({
                        text: 'The forex market operates in multiple sessions across different time zones. Understanding these sessions is crucial for traders as market activity and volatility vary throughout the day.',
                    }),

                    Text({
                        text: 'The most active trading periods often occur when sessions overlap, particularly during the London-New York overlap. These periods typically offer the highest liquidity and potentially the best trading opportunities.',
                    }),

                    H3({ text: 'Major Trading Sessions' }),

                    H2({ text: 'Market Characteristics' }),

                    Text({
                        text: 'The forex market has several unique characteristics that set it apart from other financial markets. Its high liquidity means trades can be executed quickly and with minimal price impact. The availability of leverage allows traders to control larger positions with a smaller capital outlay, though this also increases risk.',
                    }),

                    Text({
                        text: 'Market volatility varies throughout the day and can be influenced by economic data releases, political events, and changes in market sentiment. Successful traders learn to adapt their strategies to these changing market conditions.',
                    }),

                    Quiz({
                        question: 'What is the daily trading volume of the forex market?',
                        options: ['$1 trillion', '$6.6 trillion', '$10 trillion', '$100 billion'],
                        correctAnswer: 1,
                        explanation: 'The forex market has a daily trading volume exceeding $6.6 trillion, making it the largest financial market in the world.',
                    }),

                    Callout({
                        title: 'Next Steps',
                        type: 'tip',
                        points: [
                            'Practice reading currency quotes and understanding their implications',
                            'Familiarize yourself with major currency pairs and their characteristics',
                            'Understand your local trading session times and plan your trading accordingly',
                            'Learn about different types of market participants and their impact',
                            'Study how economic events affect currency movements',
                        ],
                    }),
                ],
            }),
        ];
    }
}

// For backward compatibility with existing code
export const whatisforextrading = new WhatIsForexTradingLesson().getContent();
