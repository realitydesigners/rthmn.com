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
            title: 'Understanding Markets',
            order: 1,
            lessons: [
                { title: 'What is Trading At Its Core?', order: 1, lesson: WhatIsTradingAtItsCore },
                { title: 'The History of Currency Exchange', order: 2, lesson: TheHistoryOfCurrencyExchange },
                { title: 'The Market Ecosystem: Key Participants', order: 3, lesson: TheMarketEcosystem },
                { title: 'Currency Pairs Explained', order: 4, lesson: CurrencyPairsExplained },
                { title: 'Trading Sessions and Market Hours', order: 5, lesson: TradingSessionsAndMarketHours },
            ],
        },
        {
            title: 'Trading Mechanics',
            order: 2,
            lessons: [
                { title: 'The Anatomy of a Trade', order: 1, lesson: TheAnatomyOfATrade },
                { title: 'Understanding Price Quotes', order: 2, lesson: UnderstandingPriceQuotes },
                { title: 'Order Types and Execution', order: 3, lesson: OrderTypesAndExecution },
                { title: 'Leverage and Margin: Power and Risk', order: 4, lesson: LeverageAndMargin },
            ],
        },
        {
            title: 'Market Analysis Foundations',
            order: 3,
            lessons: [
                { title: 'Price Action: The Language of Markets', order: 1, lesson: PriceActionTheLanguageOfMarkets },
                { title: 'Chart Types and Their Perspectives', order: 2, lesson: ChartTypesAndTheirPerspectives },
                { title: 'Timeframes vs. Price Ranges', order: 3, lesson: TimeframesVsPriceRanges },
                { title: 'Support and Resistance: A Critical View', order: 4 },
                { title: 'Trend Recognition Principles', order: 5 },
                { title: 'Market Context and Confluence', order: 6 },
            ],
        },
        {
            title: 'Trading Psychology',
            order: 4,
            lessons: [
                { title: 'The Trader`s Mindset', order: 1 },
                { title: 'Emotional Discipline in Trading', order: 2 },
                { title: 'Cognitive Biases That Affect Traders', order: 3 },
                { title: 'Developing Trading Patience', order: 4 },
                { title: 'The Reality of Trading Performance', order: 5 },
                { title: 'Building Mental Resilience', order: 6 },
            ],
        },
        {
            title: 'Risk Management Essentials',
            order: 5,
            lessons: [
                { title: 'Why Most Traders Fail: The Risk Perspective', order: 1 },
                { title: 'Defining Your Risk Parameters', order: 2 },
                { title: 'Stop Loss Strategies That Work', order: 3 },
                { title: 'Risk-to-Reward Considerations', order: 4 },
                { title: 'Portfolio Approach to Trading', order: 5 },
                { title: 'Preserving Capital: The First Rule', order: 6 },
            ],
        },
        {
            title: 'Building Your Trading Foundation',
            order: 6,
            lessons: [
                { title: 'Choosing the Right Broker', order: 1 },
                { title: 'Setting Up Your Trading Environment', order: 2 },
                { title: 'Developing a Trading Plan', order: 3 },
                { title: 'The Trading Journal: Your Learning Tool', order: 4 },
                { title: 'From Demo to Live: Making the Transition', order: 5 },
                { title: 'The Path Forward: Continuous Improvement', order: 6 },
            ],
        },
    ],
};
