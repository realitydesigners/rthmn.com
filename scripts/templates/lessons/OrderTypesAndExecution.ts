import { Block, H1, H2, Text, Callout, Quiz, BulletList } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const OrderTypesAndExecution = new PortableTextBuilder('Order Types and Execution')
    .setDescription('An in-depth exploration of different order types and their strategic use in forex trading')
    .setEstimatedTime('40 minutes')
    .setOrder(4)
    .addContent(
        Block({
            key: 'intro_block',
            children: [
                H1({ text: 'Order Types and Execution' }),

                Callout({
                    title: 'Key Learning Points',
                    points: [
                        'Understanding different types of trading orders',
                        'Strategic use of market, limit, and stop orders',
                        'How order execution impacts trading outcomes',
                        'Common mistakes in order placement and execution',
                        'Optimizing your trading strategy with effective order management',
                    ],
                }),

                Text({
                    text: 'Order types and execution are fundamental to trading success. Knowing how and when to use different orders can significantly impact your trading efficiency, profitability, and risk management.',
                }),

                H2({ text: 'Market Orders: Immediate Execution' }),

                Text({
                    text: 'Market orders are executed immediately at the current market price. They are ideal for traders who prioritize speed of execution over price precision.',
                }),

                BulletList({
                    items: [
                        'Immediate execution at the best available price.',
                        'Useful in fast-moving markets where speed is critical.',
                        'Potential for slippage during volatile market conditions.',
                    ],
                }),

                H2({ text: 'Limit Orders: Precision and Control' }),

                Text({
                    text: 'Limit orders allow traders to specify the exact price at which they wish to enter or exit a trade. They provide greater control over execution price but do not guarantee execution.',
                }),

                BulletList({
                    items: [
                        'Executed only at the specified price or better.',
                        'Ideal for traders seeking precise entry and exit points.',
                        'May not execute if the market does not reach the specified price.',
                    ],
                }),

                H2({ text: 'Stop Orders: Managing Risk and Capturing Opportunities' }),

                Text({
                    text: 'Stop orders become market orders once a specified price level is reached. They are commonly used to limit losses or enter trades when the market moves in a favorable direction.',
                }),

                BulletList({
                    items: [
                        'Stop-loss orders: Automatically close positions to limit losses.',
                        'Stop-entry orders: Enter trades when the market reaches a predetermined level.',
                        'Trailing stops: Adjust automatically to lock in profits as the market moves favorably.',
                    ],
                }),

                H2({ text: 'Order Execution: The Hidden Factor' }),

                Text({
                    text: 'Order execution quality significantly impacts trading outcomes. Factors such as slippage, execution speed, and broker reliability play crucial roles in determining your trading success.',
                }),

                BulletList({
                    items: [
                        'Slippage: The difference between the expected and actual execution price.',
                        'Execution speed: Faster execution reduces slippage and enhances trade accuracy.',
                        'Broker reliability: Choosing a reputable broker ensures consistent and fair execution.',
                    ],
                }),

                Quiz({
                    question: 'What is the primary advantage of using limit orders?',
                    options: ['Immediate execution', 'Guaranteed execution', 'Precise control over execution price', 'Reduced market volatility'],
                    correctAnswer: 2,
                    explanation: 'Limit orders provide precise control over the execution price, allowing traders to enter or exit trades at specific desired levels.',
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Practice using different order types in various market conditions.',
                        'Evaluate broker execution quality regularly.',
                        'Incorporate strategic order placement into your trading plan.',
                    ],
                }),
            ],
        })
    )
    .build();
