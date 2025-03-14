import { WhatIsTradingAtItsCore } from '../lessons/WhatIsTradingAtItsCore';
import { TheHistoryOfCurrencyExchange } from '../lessons/TheHistoryOfCurrencyExchange';
import { TheMarketEcosystem } from '../lessons/TheMarketEcosystem';
import { CurrencyPairsExplained } from '../lessons/CurrencyPairsExplained';
import { TradingSessionsAndMarketHours } from '../lessons/TradingSessionsAndMarketHours';
import { TheAnatomyOfATrade } from '../lessons/TheAnatomyOfATrade';
import { UnderstandingPriceQuotes } from '../lessons/UnderstandingPriceQuotes';
import { OrderTypesAndExecution } from '../lessons/OrderTypesAndExecution';
import { LeverageAndMargin } from '../lessons/LeverageAndMargin';
import { PriceActionTheLanguageOfMarkets } from '../lessons/PriceActionTheLanguageOfMarkets';
import { ChartTypesAndTheirPerspectives } from '../lessons/ChartTypesAndTheirPerspectives';
import { TimeframesVsPriceRanges } from '../lessons/TimeframesVsPriceRanges';

export const forexBeginnersCourse = {
    title: 'Forex Fundamentals: A Fresh Perspective',
    description:
        'Master the essentials of forex trading through a clear, opinionated lens. This foundational course builds your trading knowledge from first principles while challenging conventional wisdom.',
    chapters: [
        {
            title: 'Trading Fundamentals: First Principles',
            order: 1,
            description: 'Understand what trading truly is at its core and how markets have evolved throughout history.',
            lessons: [
                { title: 'What is Trading At Its Core?', order: 1, lesson: WhatIsTradingAtItsCore },
                { title: 'The History of Currency Exchange', order: 2, lesson: TheHistoryOfCurrencyExchange },
                { title: 'The Market Ecosystem: Key Participants', order: 3, lesson: TheMarketEcosystem },
            ],
        },
        // {
        //     title: 'Forex Market Essentials',
        //     order: 2,
        //     description: 'Learn the basic building blocks of the forex market that every trader needs to understand.',
        //     lessons: [
        //         { title: 'Currency Pairs Explained', order: 1, lesson: CurrencyPairsExplained },
        //         { title: 'Trading Sessions and Market Hours', order: 2, lesson: TradingSessionsAndMarketHours },
        //         { title: 'Understanding Price Quotes', order: 3, lesson: UnderstandingPriceQuotes },
        //     ],
        // },
        // {
        //     title: 'Trading Mechanics & Operations',
        //     order: 3,
        //     description: 'Master the practical aspects of executing trades and managing positions.',
        //     lessons: [
        //         { title: 'The Anatomy of a Trade', order: 1, lesson: TheAnatomyOfATrade },
        //         { title: 'Order Types and Execution', order: 2, lesson: OrderTypesAndExecution },
        //         { title: 'Leverage and Margin: Power and Risk', order: 3, lesson: LeverageAndMargin },
        //         { title: 'Setting Up Your Trading Environment', order: 4 },
        //         { title: 'Choosing the Right Broker', order: 5 },
        //     ],
        // },
        // {
        //     title: 'The Rhythm Approach: A New Perspective',
        //     order: 4,
        //     description: 'Discover our unique approach to market analysis that focuses on price ranges rather than time frames.',
        //     lessons: [
        //         { title: 'Price Action: The Language of Markets', order: 1, lesson: PriceActionTheLanguageOfMarkets },
        //         { title: 'Chart Types and Their Perspectives', order: 2, lesson: ChartTypesAndTheirPerspectives },
        //         { title: 'Timeframes vs. Price Ranges', order: 3, lesson: TimeframesVsPriceRanges },
        //         { title: 'Support and Resistance: A Critical View', order: 4 },
        //         { title: 'Trend Recognition Principles', order: 5 },
        //         { title: 'Market Context and Confluence', order: 6 },
        //     ],
        // },
        // {
        //     title: 'Risk Management & Psychology',
        //     order: 5,
        //     description: 'Learn the critical skills of managing risk and emotions that separate successful traders from the rest.',
        //     lessons: [
        //         { title: 'Why Most Traders Fail: The Risk Perspective', order: 1 },
        //         { title: 'Defining Your Risk Parameters', order: 2 },
        //         { title: 'Stop Loss Strategies That Work', order: 3 },
        //         { title: 'Risk-to-Reward Considerations', order: 4 },
        //         { title: "The Trader's Mindset", order: 5 },
        //         { title: 'Emotional Discipline in Trading', order: 6 },
        //         { title: 'Cognitive Biases That Affect Traders', order: 7 },
        //     ],
        // },
        // {
        //     title: 'Building Your Trading System',
        //     order: 6,
        //     description: 'Develop your personalized trading approach based on the Rhythm methodology.',
        //     lessons: [
        //         { title: 'Developing a Trading Plan', order: 1 },
        //         { title: 'The Trading Journal: Your Learning Tool', order: 2 },
        //         { title: 'Portfolio Approach to Trading', order: 3 },
        //         { title: 'Developing Trading Patience', order: 4 },
        //         { title: 'From Demo to Live: Making the Transition', order: 5 },
        //     ],
        // },
    ],
};
