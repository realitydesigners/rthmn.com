import { Block, H1, H2, H3, Text, Callout, BulletList } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const PriceActionTheLanguageOfMarkets = new PortableTextBuilder('Price Action: The Language of Markets')
    .setDescription('A detailed exploration of price action, historical technical analysis, and its limitations from the Rthmn perspective')
    .setEstimatedTime('180 minutes')
    .setOrder(1)
    .addContent(
        Block({
            key: 'price_action_extended_intro',
            children: [
                H1({ text: 'Price Action: The Language of Markets' }),

                Callout({
                    title: 'Key Learning Points',
                    points: [
                        'Deep historical context of technical analysis',
                        'Detailed exploration of traditional and modern TA practices',
                        'Comprehensive critique of conventional TA',
                        'Detailed introduction to the Rthmn perspective on price action',
                    ],
                }),

                H2({ text: 'Historical Origins and Early Development' }),

                Text({
                    text: 'Technical analysis (TA) began centuries ago, notably with Japanese rice traders who developed candlestick charting techniques. These traders meticulously recorded price movements, identifying patterns that indicated future price behavior.',
                }),

                BulletList({
                    items: [
                        'Japanese rice traders and the birth of candlestick charting',
                        'Charles Dow and the foundational Dow Theory',
                        'Richard Wyckoff`s pioneering work on market structure and volume analysis',
                        'Jesse Livermore and early price action trading strategies',
                        'Elliott Wave Theory and its impact on market analysis',
                    ],
                }),

                H2({ text: '20th Century Evolution and Expansion' }),

                Text({
                    text: 'The 20th century saw significant advancements in TA, with the introduction of various analytical tools and methodologies. Traders began to systematically apply these techniques across different markets, enhancing their predictive capabilities.',
                }),

                BulletList({
                    items: [
                        'Development of moving averages and trend-following strategies',
                        'Introduction of oscillators and momentum indicators',
                        'Expansion of chart patterns and their interpretations',
                        'Integration of volume analysis into technical strategies',
                        'Rise of computerized trading and algorithmic strategies',
                    ],
                }),

                H2({ text: 'Modern Technical Analysis Practices' }),

                Text({
                    text: 'Today, TA remains integral to trading strategies, utilized by both retail and institutional traders. Common practices include:',
                }),

                BulletList({
                    items: [
                        'Trend identification through moving averages, trend lines, and channels',
                        'Momentum and divergence analysis using oscillators',
                        'Candlestick pattern recognition for short-term signals',
                        'Volume analysis to confirm price movements',
                        'Algorithmic trading systems based on technical indicators',
                    ],
                }),

                H2({ text: 'Critical Limitations of Traditional Technical Analysis' }),

                Text({
                    text: 'Despite its popularity, traditional TA has notable shortcomings, often leading traders astray due to its inherent limitations:',
                }),

                BulletList({
                    items: [
                        'Dependence on lagging indicators that provide delayed signals',
                        'Assumption of exact repetition of historical patterns without context',
                        'Neglect of institutional behavior and strategic market positioning',
                        'Failure to recognize the multi-dimensional nature of market movements',
                        'Overemphasis on short-term signals without broader market context',
                    ],
                }),

                H2({ text: 'Introducing the Rthmn Perspective' }),

                Text({
                    text: 'The Rthmn approach offers a fundamentally different perspective, viewing price action as structured signals communicating institutional intentions and market dynamics across multiple ranges simultaneously.',
                }),

                Callout({
                    title: 'Core Rthmn Principles',
                    type: 'tip',
                    points: [
                        'Markets operate in ranges rather than fixed time frames',
                        'Multiple ranges interact simultaneously, creating clear directional signals',
                        'Price action reveals institutional intentions and underlying market structure',
                        'Systematic identification of high-probability trading opportunities',
                        'Integration of mechanical rules with price action analysis',
                    ],
                }),

                H2({ text: 'Why Traditional TA Often Falls Short: A Rthmn Critique' }),

                Text({
                    text: 'Traditional TA often misinterprets market signals by isolating indicators and patterns from their broader context. The Rthmn approach critiques this narrow focus, emphasizing the importance of understanding the interaction of multiple price ranges and institutional behaviors.',
                }),

                H3({ text: 'Common Pitfalls of Traditional TA' }),

                BulletList({
                    items: [
                        'Reliance on historical repetition without contextual understanding',
                        'Misinterpretation of isolated signals without considering market structure',
                        'Neglecting strategic positioning and actions of institutional market participants',
                        'Overemphasis on short-term signals without long-term context',
                        'Ignoring the hierarchical nature of market participants and their influence',
                    ],
                }),

                H2({ text: 'Applying the Rthmn Vision Practically' }),

                Text({
                    text: "In upcoming lessons, we'll delve deeply into practical applications of the Rthmn approach, systematically identifying high-probability trading opportunities through structured price action analysis. This comprehensive understanding will transform your trading approach, aligning your strategies with the true nature of market dynamics.",
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Begin observing markets through the lens of ranges',
                        'Identify how larger ranges influence smaller ranges',
                        'Reflect on past trades to identify where traditional TA may have misled you',
                        'Prepare to integrate the Rthmn perspective into your trading methodology',
                    ],
                }),
            ],
        })
    )
    .build();
