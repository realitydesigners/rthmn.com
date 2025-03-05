import { Block, H1, H2, H3, Text, Callout, BulletList } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const ChartTypesAndTheirPerspectives = new PortableTextBuilder('Chart Types and Their Perspectives')
    .setDescription('An extensive exploration of different chart types, their historical context, practical applications, and limitations from the Rthmn perspective')
    .setEstimatedTime('180 minutes')
    .setOrder(2)
    .addContent(
        Block({
            key: 'chart_types_intro',
            children: [
                H1({ text: 'Chart Types and Their Perspectives' }),

                Callout({
                    title: 'Key Learning Points',
                    points: [
                        'Historical development of various chart types',
                        'Detailed exploration of common chart types used today',
                        'Strengths and weaknesses of each chart type',
                        'How different chart types influence trading decisions',
                        'The Rthmn perspective on selecting and interpreting charts',
                    ],
                }),

                H2({ text: 'Historical Context of Charting Techniques' }),

                Text({
                    text: 'Charting has evolved significantly over centuries, beginning with simple line charts and evolving into sophisticated visual representations like candlestick and Renko charts.',
                }),

                BulletList({
                    items: [
                        'Early line charts and their simplicity',
                        'Bar charts and their introduction in Western markets',
                        'Candlestick charts and their detailed visual insights',
                        'Point and figure charts and their unique approach to price movement',
                    ],
                }),

                H2({ text: 'Common Chart Types and Their Applications' }),

                Text({
                    text: 'Different chart types offer unique perspectives on market data, influencing how traders interpret price movements and make decisions.',
                }),

                H3({ text: 'Line Charts' }),

                Text({
                    text: 'Line charts connect closing prices over a specified period, providing a clear and simplified view of overall trends. Traders find them useful for quickly identifying long-term trends without the distraction of detailed price fluctuations.',
                }),

                BulletList({
                    items: [
                        'Useful for identifying long-term trends and general market direction',
                        'Commonly used in trend-following strategies and long-term investment analysis',
                        'Ideal for beginners due to their simplicity and clarity',
                    ],
                }),

                H3({ text: 'Bar Charts' }),

                Text({
                    text: 'Bar charts display open, high, low, and close prices, offering detailed insights into price volatility and range. Traders appreciate bar charts for their ability to clearly show price ranges and volatility, making them suitable for detailed technical analysis.',
                }),

                BulletList({
                    items: [
                        'Effective for identifying support and resistance levels',
                        'Commonly used in breakout and reversal strategies',
                        'Useful for analyzing volatility and price range expansions',
                    ],
                }),

                H3({ text: 'Candlestick Charts' }),

                Text({
                    text: 'Candlestick charts visually represent price movements, highlighting open, high, low, and close prices. They are widely favored for their ability to clearly depict market sentiment and potential reversals through recognizable patterns.',
                }),

                BulletList({
                    items: [
                        'Identification of reversal patterns like Doji, Hammer, and Engulfing patterns',
                        'Widely used in short-term trading and swing trading strategies',
                        'Effective for spotting market sentiment shifts and momentum changes',
                    ],
                }),

                H3({ text: 'Point and Figure Charts' }),

                Text({
                    text: 'Point and figure charts focus exclusively on price movements, ignoring time entirely. Traders use them to clearly identify support and resistance levels, breakout points, and trend strength without the noise of minor price fluctuations.',
                }),

                BulletList({
                    items: [
                        'Commonly used for breakout trading strategies',
                        'Effective for identifying clear support and resistance levels',
                        'Useful in filtering out insignificant price movements',
                    ],
                }),

                H2({ text: 'Renko Charts' }),

                Text({
                    text: 'Renko charts focus solely on price movement, ignoring time, and are useful for identifying clear trends and reducing market noise.',
                }),

                H2({ text: 'Strengths and Weaknesses of Chart Types' }),

                Text({
                    text: 'Each chart type has distinct advantages and disadvantages, affecting their suitability for different trading strategies.',
                }),

                BulletList({
                    items: [
                        'Line charts: simplicity but lack detailed price information',
                        'Bar charts: detailed but can be visually cluttered',
                        'Candlestick charts: rich information but potential for misinterpretation',
                        'Renko charts: clarity in trends but ignore time and volume',
                    ],
                }),

                H2({ text: 'The Rthmn Perspective on Chart Types' }),

                Text({
                    text: 'The Rthmn approach emphasizes understanding market structure and institutional behavior through price action across multiple ranges, suggesting that certain chart types align better with this perspective.',
                }),

                Callout({
                    title: 'Rthmn Recommendations',
                    type: 'tip',
                    points: [
                        'Use candlestick charts for detailed price action analysis',
                        'Consider Renko charts for clear range-based analysis',
                        'Avoid over-reliance on line charts due to their limited detail',
                        'Integrate multiple chart types to gain comprehensive market insights',
                    ],
                }),

                H2({ text: 'Practical Application and Integration' }),

                Text({
                    text: "In upcoming lessons, we'll explore practical methods to integrate various chart types effectively within the Rthmn framework, enhancing your ability to systematically identify high-probability trading opportunities.",
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Experiment with different chart types to observe their strengths and weaknesses',
                        'Practice identifying market structure using candlestick and Renko charts',
                        'Reflect on how chart types influence your trading decisions',
                        'Prepare to integrate the Rthmn perspective into your chart analysis',
                    ],
                }),
            ],
        })
    )
    .build();
