import { Block, H1, H2, H3, Text, Callout, Quiz, BulletList } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const TheAnatomyOfATrade = new PortableTextBuilder('The Anatomy of a Trade')
    .setDescription('Breaking down the components of a trade from entry to exit, understanding each step deeply')
    .setEstimatedTime('40 minutes')
    .setOrder(1)
    .addContent(
        Block({
            key: 'intro_block',
            children: [
                H1({ text: 'The Anatomy of a Trade' }),

                Callout({
                    title: 'Key Learning Points',
                    points: [
                        'Understanding the complete lifecycle of a trade',
                        'Identifying entry and exit points effectively',
                        'The importance of trade management and adjustments',
                        'Recognizing psychological factors at each trade stage',
                        'Common pitfalls and how to avoid them',
                    ],
                }),

                Text({
                    text: "Every trade you execute is more than just a simple buy or sell decision—it's a carefully orchestrated sequence of actions and decisions. Understanding the anatomy of a trade means dissecting each component, from the initial analysis and entry to the final exit and review. This comprehensive understanding is crucial for consistent trading success.",
                }),

                H2({ text: 'Pre-Trade Analysis: Setting the Stage' }),

                Text({
                    text: 'Before entering any trade, thorough analysis is essential. This involves identifying potential opportunities, assessing market conditions, and determining your risk parameters. Effective pre-trade analysis sets the foundation for disciplined and informed trading decisions.',
                }),

                BulletList({
                    items: [
                        'Technical analysis: Identifying key support and resistance levels, trends, and chart patterns.',
                        'Fundamental analysis: Evaluating economic indicators, news events, and central bank policies.',
                        'Sentiment analysis: Gauging market sentiment through positioning data and market commentary.',
                        'Risk assessment: Defining clear risk parameters, including stop-loss placement and position sizing.',
                    ],
                }),

                H2({ text: 'Entry: Precision and Patience' }),

                Text({
                    text: "The entry point is where your analysis translates into action. Precision and patience are key—waiting for the right conditions rather than rushing into trades impulsively. A well-timed entry can significantly enhance your trade's potential profitability.",
                }),

                BulletList({
                    items: [
                        'Identifying precise entry signals based on your analysis.',
                        'Using limit orders to enter trades at optimal price levels.',
                        'Avoiding emotional entries by adhering strictly to your trading plan.',
                        'Considering market volatility and liquidity when timing your entry.',
                    ],
                }),

                H2({ text: 'Trade Management: Navigating the Journey' }),

                Text({
                    text: 'Once in a trade, active management becomes critical. This includes monitoring market developments, adjusting stop-losses, and potentially scaling in or out of positions. Effective trade management helps you adapt to changing market conditions and protect your capital.',
                }),

                BulletList({
                    items: [
                        'Regularly reviewing market conditions and adjusting your strategy accordingly.',
                        'Trailing stop-losses to lock in profits as the trade moves in your favor.',
                        'Scaling into winning positions to maximize potential gains.',
                        'Recognizing when market conditions have changed significantly and adapting your approach.',
                    ],
                }),

                H2({ text: 'Exit: The Art of Closure' }),

                Text({
                    text: 'Exiting a trade is as important as entering it. Whether taking profits or cutting losses, your exit strategy should be clear and disciplined. Knowing when and how to exit prevents emotional decision-making and ensures you adhere to your trading plan.',
                }),

                BulletList({
                    items: [
                        'Setting clear profit targets based on technical and fundamental analysis.',
                        'Recognizing signs of market reversal or exhaustion to exit proactively.',
                        'Avoiding premature exits driven by fear or greed.',
                        'Using partial exits to secure profits while allowing remaining positions to run.',
                    ],
                }),

                H2({ text: 'Post-Trade Review: Learning and Growth' }),

                Text({
                    text: 'After closing a trade, reviewing your decisions and outcomes is essential. This reflection helps identify strengths and weaknesses in your approach, fostering continuous improvement and growth as a trader.',
                }),

                BulletList({
                    items: [
                        'Analyzing trade outcomes against initial expectations.',
                        'Identifying patterns in successful and unsuccessful trades.',
                        'Adjusting your trading plan based on insights gained from reviews.',
                        'Maintaining a detailed trading journal to track progress and improvements.',
                    ],
                }),

                Quiz({
                    question: 'What is the primary purpose of pre-trade analysis?',
                    options: ['To execute trades quickly', 'To set the foundation for informed decisions', 'To guarantee profits', 'To avoid market volatility'],
                    correctAnswer: 1,
                    explanation:
                        'Pre-trade analysis sets the foundation for disciplined and informed trading decisions by identifying opportunities, assessing market conditions, and determining risk parameters.',
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Practice detailed pre-trade analysis regularly',
                        'Develop clear entry and exit criteria',
                        'Implement active trade management techniques',
                        'Conduct thorough post-trade reviews to refine your strategy',
                    ],
                }),

                H2({ text: 'What is a Trade: The Fundamental Mechanics' }),

                Text({
                    text: 'At its core, a trade is an agreement to exchange one asset for another at a specific price. When you "buy" in trading, you are essentially betting that the asset\'s value will increase from your entry price. Conversely, when you "sell," you anticipate a decrease in value. Each trade involves critical components: the entry price, stop loss, and target price, which together define your risk and potential reward.',
                }),

                BulletList({
                    items: [
                        'Entry Price: The specific price at which you initiate your trade, marking your starting point.',
                        'Stop Loss: A predetermined price level at which you will exit the trade to limit losses if the market moves against you.',
                        'Target Price: The price level at which you aim to exit the trade to secure profits.',
                    ],
                }),

                H2({ text: 'Risk-to-Reward Ratio: Balancing Potential and Protection' }),

                Text({
                    text: 'The risk-to-reward ratio measures the potential reward of a trade relative to its risk. It is calculated by dividing the distance from your entry price to your target price by the distance from your entry price to your stop loss. A favorable risk-to-reward ratio ensures that potential profits outweigh potential losses, making it a cornerstone of effective trading.',
                }),

                BulletList({
                    items: [
                        'A higher risk-to-reward ratio means you can be profitable even with fewer winning trades.',
                        'Your entry price significantly impacts this ratio; precise entries can enhance your potential reward while minimizing risk.',
                        'Consistently applying favorable risk-to-reward ratios helps maintain profitability over the long term.',
                    ],
                }),

                Text({
                    text: 'Understanding these fundamental mechanics is akin to grasping the physical laws of trading. They govern every decision and outcome, making them the most critical elements to master for sustained trading success.',
                }),
            ],
        })
    )
    .build();
