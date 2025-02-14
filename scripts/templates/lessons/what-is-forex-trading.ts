export const whatisforextrading = {
    title: 'What is Forex Trading?',
    description: 'Understanding the basics of forex markets',
    estimatedTime: '15 minutes',
    learningObjectives: ['Understand what forex trading is', 'Learn about market participants', 'Grasp basic trading concepts'],
    order: 1,
    content: [
        {
            _type: 'courseBlock',
            _key: 'intro_block',
            layout: 'course',
            content: [
                {
                    _type: 'block',
                    _key: 'title_block',
                    style: 'h1',
                    children: [
                        {
                            _type: 'span',
                            _key: 'title_span',
                            text: 'What is Forex Trading?',
                        },
                    ],
                },
                {
                    _type: 'callout',
                    _key: 'learning_points',
                    title: 'Key Learning Points',
                    type: 'learning',
                    points: ['Understanding the forex market', 'How currency pairs work', 'Basic trading concepts'],
                },
                {
                    _type: 'block',
                    _key: 'intro_text',
                    style: 'normal',
                    children: [
                        {
                            _type: 'span',
                            _key: 'intro_span',
                            text: 'Forex trading is the process of exchanging one currency for another through the financial markets. With a daily volume of over $6.6 trillion, it is the largest financial market in the world.',
                        },
                    ],
                },
                {
                    _type: 'quiz',
                    _key: 'quiz_1',
                    question: 'What is forex trading?',
                    options: ['Trading stocks and bonds', 'Exchange of currencies in financial markets', 'Trading commodities', 'Buying real estate'],
                    correctAnswer: 1,
                    explanation: 'Forex trading involves exchanging one currency for another through financial markets.',
                },
            ],
        },
    ],
    relatedLessons: [],
};
