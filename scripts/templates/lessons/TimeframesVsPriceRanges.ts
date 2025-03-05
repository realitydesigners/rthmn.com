import { Block, H1, H2, H3, Text, Callout, BulletList } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const TimeframesVsPriceRanges = new PortableTextBuilder('Timeframes vs. Price Ranges')
    .setDescription('A comprehensive exploration of traditional timeframes versus price range analysis, emphasizing the Rthmn approach using boxes')
    .setEstimatedTime('180 minutes')
    .setOrder(3)
    .addContent(
        Block({
            key: 'timeframes_vs_ranges_comprehensive_intro',
            children: [
                H1({ text: 'Timeframes vs. Price Ranges' }),

                Callout({
                    title: 'Key Learning Points',
                    points: [
                        'Detailed understanding of traditional time-based analysis',
                        'Comprehensive introduction to price range analysis',
                        'In-depth explanation of the box concept in price range analysis',
                        'Practical integration of boxes into trading strategies',
                        'Advantages of price range analysis over traditional timeframes',
                    ],
                }),

                H2({ text: 'Traditional Timeframe Analysis: An Overview' }),

                Text({
                    text: 'Traditional trading analysis typically segments market data into fixed intervals such as hourly, daily, or weekly charts. While widely used, this method can obscure the true nature of market movements by imposing arbitrary time constraints.',
                }),

                BulletList({
                    items: [
                        'Commonly used timeframes: hourly, daily, weekly',
                        'Limitations due to arbitrary segmentation of market data',
                        'Potential misinterpretation of market dynamics due to fixed intervals',
                    ],
                }),

                H2({ text: 'Price Range Analysis: A New Perspective' }),

                Text({
                    text: 'Price range analysis, central to the Rthmn approach, focuses on actual price movements rather than fixed time intervals. This method provides clearer insights into market structure, institutional behavior, and directional signals.',
                }),

                BulletList({
                    items: [
                        'Emphasizes actual price movements over arbitrary time intervals',
                        'Clearly identifies market structure and institutional intentions',
                        'Reduces market noise, enhancing clarity and decision-making',
                    ],
                }),

                H2({ text: 'The Box Concept Explained' }),

                Text({
                    text: 'Boxes represent specific price ranges independent of time, clearly defining market structure and directional bias. They flip between positive and negative based on precise price movements, providing systematic and objective trading signals.',
                }),

                BulletList({
                    items: [
                        'Positive box: Price moves less than the defined range from the recent high',
                        'Negative box: Price moves equal to or greater than the defined range from the high',
                        'Boxes flip precisely when the defined range size is met or exceeded',
                        'Consistent tracking of box flips clarifies market direction and structure',
                    ],
                }),

                H2({ text: 'Advantages of Price Range Analysis' }),

                Text({
                    text: 'Price range analysis offers several distinct advantages over traditional timeframe analysis:',
                }),

                BulletList({
                    items: [
                        'Clearer identification of market structure and trends',
                        'Reduced market noise and clearer signals',
                        'Improved alignment with institutional trading behaviors',
                        'Enhanced systematic risk management and entry precision',
                    ],
                }),

                H2({ text: 'Practical Example of Box Usage' }),

                Text({
                    text: 'Consider tracking a 10-pip box: If the price moves down 9 pips from the recent high, the box remains positive. However, if the price moves down exactly 10 pips or more, the box flips to negative, clearly signaling a directional shift.',
                }),

                Callout({
                    title: 'Visualizing Box Flips',
                    type: 'tip',
                    points: [
                        'Positive box: Price moves less than the defined range from the high.',
                        'Negative box: Price moves equal to or greater than the defined range from the high.',
                        'Systematic tracking of these flips provides clear, mechanical trading signals.',
                    ],
                }),

                H2({ text: 'Integrating Boxes into Your Trading Strategy' }),

                Text({
                    text: "In upcoming lessons, we'll explore practical methods to integrate boxes into your trading strategies, systematically identifying high-probability opportunities and aligning your approach with market dynamics.",
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Begin observing markets through price ranges rather than fixed timeframes',
                        'Practice identifying and using boxes to clarify market structure',
                        'Reflect on past trades to see how price range analysis could have improved outcomes',
                        'Prepare to systematically integrate boxes into your trading methodology',
                    ],
                }),
            ],
        })
    )
    .build();
