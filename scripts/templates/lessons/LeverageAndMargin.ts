import { Block, H1, H2, Text, Callout, Quiz, BulletList } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const LeverageAndMargin = new PortableTextBuilder('Leverage and Margin: Power and Risk')
    .setDescription('An in-depth exploration of leverage and margin, their benefits, risks, and strategic management in forex trading')
    .setEstimatedTime('40 minutes')
    .setOrder(4)
    .addContent(
        Block({
            key: 'intro_block',
            children: [
                H1({ text: 'Leverage and Margin: Power and Risk' }),

                Callout({
                    title: 'Key Learning Points',
                    points: [
                        'Understanding leverage and margin in forex trading',
                        'The benefits and risks associated with leverage',
                        'How margin requirements affect your trading decisions',
                        'Managing leverage effectively to control risk',
                        'Common pitfalls and how to avoid them',
                    ],
                }),

                Text({
                    text: 'Leverage and margin are powerful tools in forex trading, allowing traders to control larger positions with relatively small amounts of capital. However, they also amplify risks, making it crucial to understand and manage them effectively.',
                }),

                H2({ text: 'What is Leverage?' }),

                Text({
                    text: 'Leverage allows traders to control larger positions than their account balance would typically permit. It is expressed as a ratio, such as 50:1, meaning you can control $50 worth of currency for every $1 in your account.',
                }),

                BulletList({
                    items: [
                        'Leverage magnifies both potential profits and potential losses.',
                        'Common leverage ratios include 50:1, 100:1, and 200:1.',
                        'Higher leverage increases risk and requires careful risk management.',
                    ],
                }),

                H2({ text: 'Understanding Margin' }),

                Text({
                    text: 'Margin is the amount of money required to open and maintain a leveraged position. It acts as collateral to cover potential losses and ensures you can meet your obligations.',
                }),

                BulletList({
                    items: [
                        'Margin requirement: The minimum amount of capital required to open a leveraged position.',
                        'Margin call: A demand from your broker to deposit additional funds if your account falls below the required margin level.',
                        'Stop-out level: The point at which your broker automatically closes positions to prevent further losses.',
                    ],
                }),

                H2({ text: 'Managing Leverage and Margin Effectively' }),

                Text({
                    text: 'Effective management of leverage and margin is essential for long-term trading success. Proper risk management strategies can help you utilize leverage safely and effectively.',
                }),

                BulletList({
                    items: [
                        'Use conservative leverage levels to minimize risk.',
                        'Regularly monitor your margin levels to avoid margin calls.',
                        'Implement strict stop-loss orders to control potential losses.',
                    ],
                }),

                Quiz({
                    question: 'What happens when your account reaches the stop-out level?',
                    options: [
                        'You receive additional leverage from your broker.',
                        'Your broker automatically closes positions to prevent further losses.',
                        'You receive a bonus from your broker.',
                        'Your leverage ratio increases automatically.',
                    ],
                    correctAnswer: 1,
                    explanation:
                        'The stop-out level is the point at which your broker automatically closes positions to prevent further losses, protecting both you and the broker.',
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Practice using leverage responsibly in a demo account.',
                        'Develop a clear margin management strategy.',
                        'Regularly review and adjust your leverage usage based on market conditions and personal risk tolerance.',
                    ],
                }),
            ],
        })
    )
    .build();
