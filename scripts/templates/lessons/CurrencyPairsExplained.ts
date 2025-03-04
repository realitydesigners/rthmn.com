import { Block, H1, H2, H3, Text, Callout, Quiz, BulletList, Image } from '../components/LessonComponents';
import { PortableTextBuilder } from '../components/PortableTextBuilder';

export const CurrencyPairsExplained = new PortableTextBuilder('Currency Pairs Explained')
    .setDescription('Understanding the structure, classification, and dynamics of currency pairs in the forex market')
    .setEstimatedTime('40 minutes')
    .setOrder(4)
    .addContent(
        Block({
            key: 'intro_block',
            children: [
                H1({ text: 'Currency Pairs Explained' }),

                Callout({
                    title: 'Key Learning Points',
                    points: [
                        'The structure and notation of currency pairs',
                        'Major, minor, and exotic pair classifications',
                        'How to read and interpret currency quotes',
                        'Understanding bid/ask prices and spreads',
                        'The concept of pips and price movement calculation',
                        'Currency correlations and their trading implications',
                    ],
                }),

                Text({
                    text: "In our previous lessons, we've explored the fundamental nature of trading, the historical evolution of exchange systems, and the complex ecosystem of market participants. Now, we'll focus on the building blocks of the forex market: currency pairs. These pairs are the instruments through which all forex trading takes place, and understanding their structure and dynamics is essential for navigating the market effectively.",
                }),

                Text({
                    text: "Currency pairs might seem straightforward at first glance—simply two currencies quoted against each other. However, there's a depth to their structure, classification, and behavior that many traders fail to fully appreciate. This lack of understanding can lead to confusion about price movements, miscalculations of risk and reward, and ultimately, poor trading decisions.",
                }),

                Text({
                    text: "In this lesson, we'll demystify currency pairs by examining their composition, how they're categorized, how to interpret their prices, and the relationships between different pairs. This knowledge will provide you with a solid foundation for analyzing market opportunities and constructing trades with clarity and precision.",
                }),

                H2({ text: 'The Structure of Currency Pairs' }),

                Text({
                    text: 'At its most basic level, a currency pair represents the exchange rate between two currencies—how much of one currency is needed to purchase one unit of another. Unlike stocks or commodities, which have absolute prices, currencies are always valued in relation to other currencies. This relative nature is what makes forex trading unique and, in many ways, more complex than other markets.',
                }),

                Text({
                    text: 'Every currency pair consists of two components: the base currency and the quote (or counter) currency. The base currency is the first currency in the pair, while the quote currency is the second. The price of the pair indicates how much of the quote currency is required to purchase one unit of the base currency.',
                }),

                Text({
                    text: "Currency pairs are written using ISO currency codes—three-letter abbreviations that represent specific currencies. For example, 'USD' represents the United States dollar, 'EUR' the euro, 'JPY' the Japanese yen, and so on. These codes are standardized internationally, ensuring clear communication across global markets.",
                }),

                Text({
                    text: 'When written as a pair, these codes are combined with a slash between them (e.g., EUR/USD) or sometimes without any separator (e.g., EURUSD). Both notations are common and represent the same currency pair. The convention is always base/quote, meaning the price shows how much of the second currency (quote) is needed to buy one unit of the first currency (base).',
                }),

                H3({ text: 'Reading Currency Quotes' }),

                Text({
                    text: "Let's examine a practical example to clarify this structure. If EUR/USD is quoted at 1.2000, this means that 1 euro can be exchanged for 1.20 U.S. dollars. In this case, EUR is the base currency and USD is the quote currency. The price tells us that we need 1.20 dollars to buy 1 euro.",
                }),

                Text({
                    text: 'This structure has important implications for how we interpret price movements. If EUR/USD rises from 1.2000 to 1.2100, it means the euro has strengthened against the dollar (or conversely, the dollar has weakened against the euro). Now 1.21 dollars are required to purchase 1 euro, indicating that the euro has become more valuable relative to the dollar.',
                }),

                Text({
                    text: 'Conversely, if EUR/USD falls from 1.2000 to 1.1900, it means the euro has weakened against the dollar (or the dollar has strengthened against the euro). Now only 1.19 dollars are needed to buy 1 euro, indicating that the euro has become less valuable relative to the dollar.',
                }),

                Text({
                    text: 'Understanding this relationship is crucial because it determines the direction in which you should trade based on your market outlook. If you believe the euro will strengthen against the dollar, you would buy EUR/USD (go long). If you believe the euro will weaken against the dollar, you would sell EUR/USD (go short).',
                }),

                Callout({
                    title: 'Currency Pair Example',
                    type: 'info',
                    points: [
                        'EUR/USD = 1.2000',
                        'Base currency: EUR (euro)',
                        'Quote currency: USD (U.S. dollar)',
                        'Interpretation: 1 euro = 1.20 U.S. dollars',
                        'If price rises to 1.2100: Euro strengthens, dollar weakens',
                        'If price falls to 1.1900: Euro weakens, dollar strengthens',
                        'To profit from euro strength: Buy EUR/USD (go long)',
                        'To profit from euro weakness: Sell EUR/USD (go short)',
                    ],
                }),

                H2({ text: 'Categories of Currency Pairs' }),

                Text({
                    text: 'The forex market includes dozens of tradable currency pairs, but not all pairs are created equal. They vary significantly in terms of liquidity, volatility, trading costs, and market behavior. To make sense of these differences, currency pairs are typically categorized into three main groups: major pairs, minor pairs (also called cross pairs), and exotic pairs.',
                }),

                H3({ text: 'Major Currency Pairs' }),

                Text({
                    text: 'Major currency pairs are those that include the U.S. dollar (USD) paired with other major world currencies. These pairs dominate forex trading, accounting for the majority of global volume. They typically offer the highest liquidity, tightest spreads (lowest transaction costs), and most consistent trading conditions.',
                }),

                Text({
                    text: 'The seven major currency pairs are:',
                }),

                ...BulletList({
                    items: [
                        'EUR/USD (Euro/U.S. Dollar) - Often called "The Euro"',
                        'USD/JPY (U.S. Dollar/Japanese Yen) - "The Ninja"',
                        'GBP/USD (British Pound/U.S. Dollar) - "Cable"',
                        'USD/CHF (U.S. Dollar/Swiss Franc) - "The Swissie"',
                        'USD/CAD (U.S. Dollar/Canadian Dollar) - "The Loonie"',
                        'AUD/USD (Australian Dollar/U.S. Dollar) - "The Aussie"',
                        'NZD/USD (New Zealand Dollar/U.S. Dollar) - "The Kiwi"',
                    ],
                    key: 'major-pairs',
                }),

                Text({
                    text: 'These pairs are considered the backbone of the forex market. Their high liquidity means they can absorb large trading volumes without significant price disruption, making them suitable for traders of all sizes, from retail to institutional. They also tend to have more predictable behavior and respond more consistently to technical analysis and fundamental factors.',
                }),

                Text({
                    text: 'Notice that in four of these pairs (EUR/USD, GBP/USD, AUD/USD, NZD/USD), the USD is the quote currency, while in the other three (USD/JPY, USD/CHF, USD/CAD), the USD is the base currency. This distinction affects how we interpret price movements. For pairs where USD is the quote currency, a rising price means the base currency is strengthening against the dollar. For pairs where USD is the base currency, a rising price means the dollar is strengthening against the quote currency.',
                }),

                H3({ text: 'Minor Currency Pairs (Cross Pairs)' }),

                Text({
                    text: "Minor currency pairs, also known as cross pairs or crosses, are pairs that don't include the U.S. dollar but do include major currencies traded against each other. These pairs emerged as trading became more globalized, eliminating the need to convert through USD when exchanging between two non-USD currencies.",
                }),

                Text({
                    text: 'Some common minor pairs include:',
                }),

                ...BulletList({
                    items: [
                        'EUR/GBP (Euro/British Pound)',
                        'EUR/JPY (Euro/Japanese Yen)',
                        'GBP/JPY (British Pound/Japanese Yen)',
                        'EUR/AUD (Euro/Australian Dollar)',
                        'EUR/CHF (Euro/Swiss Franc)',
                        'AUD/NZD (Australian Dollar/New Zealand Dollar)',
                        'GBP/CHF (British Pound/Swiss Franc)',
                    ],
                    key: 'minor-pairs',
                }),

                Text({
                    text: 'Minor pairs typically have good liquidity, though not as high as the majors. They often exhibit more volatility and wider spreads than major pairs, which can create both opportunities and challenges for traders. Some crosses, particularly those involving the Japanese yen (like EUR/JPY and GBP/JPY), are known for their volatility and can make significant moves in short periods.',
                }),

                Text({
                    text: 'Cross pairs can be particularly useful for expressing views on specific economies without the influence of the U.S. dollar. For example, if you have a strong view on the relative strength of the European versus the British economy, trading EUR/GBP allows you to focus directly on that relationship without the complicating factor of USD movements.',
                }),

                H3({ text: 'Exotic Currency Pairs' }),

                Text({
                    text: "Exotic currency pairs consist of a major currency paired with the currency of a developing or smaller economy, such as those in emerging markets. These pairs are called 'exotic' not because they're unusual or strange, but because they're less commonly traded and represent economies that have historically been considered outside the core of the global financial system.",
                }),

                Text({
                    text: 'Examples of exotic pairs include:',
                }),

                ...BulletList({
                    items: [
                        'USD/TRY (U.S. Dollar/Turkish Lira)',
                        'USD/ZAR (U.S. Dollar/South African Rand)',
                        'USD/MXN (U.S. Dollar/Mexican Peso)',
                        'USD/BRL (U.S. Dollar/Brazilian Real)',
                        'EUR/PLN (Euro/Polish Zloty)',
                        'GBP/SGD (British Pound/Singapore Dollar)',
                    ],
                    key: 'exotic-pairs',
                }),

                Text({
                    text: 'Exotic pairs typically have lower liquidity, wider spreads, and more erratic price behavior than majors or minors. They can be influenced by factors that rarely affect major currencies, such as political instability, sudden regulatory changes, or capital controls. These characteristics make exotic pairs both more challenging and potentially more rewarding to trade.',
                }),

                Text({
                    text: 'While exotic pairs offer opportunities for significant profit due to their volatility and sometimes predictable reactions to specific economic or political events, they also carry higher risks. The wider spreads increase the cost of trading, and the lower liquidity can make it difficult to enter or exit positions at desired prices, especially during market turbulence. For these reasons, exotic pairs are generally more suitable for experienced traders who understand these additional risk factors.',
                }),

                H2({ text: 'Bid and Ask Prices: The Two Sides of Every Quote' }),

                Text({
                    text: "When trading currency pairs, you'll always encounter two prices: the bid price and the ask price (sometimes called the offer price). Understanding these two components of a currency quote is essential for calculating your trading costs and potential profits accurately.",
                }),

                Text({
                    text: "The bid price is the price at which the market (or your broker) is willing to buy the base currency from you. In other words, it's the price at which you can sell the currency pair. The ask price is the price at which the market is willing to sell the base currency to you—the price at which you can buy the currency pair.",
                }),

                Text({
                    text: "The ask price is always higher than the bid price, and the difference between them is called the spread. This spread represents the transaction cost for trading—the broker's compensation for facilitating your trade. The tighter (smaller) the spread, the lower your cost of trading.",
                }),

                Text({
                    text: "Let's look at a practical example: If EUR/USD is quoted as 1.2000/1.2003, the bid price is 1.2000 and the ask price is 1.2003. This means you can sell 1 euro for $1.2000 or buy 1 euro for $1.2003. The spread is 0.0003, or 3 pips.",
                }),

                Text({
                    text: 'When you enter a position, you always do so at the less favorable price: you buy at the ask price and sell at the bid price. This means you start each trade with a small loss equal to the spread. Your position needs to move in your favor by at least the amount of the spread just to break even. This reality underscores why spread size matters, especially for short-term traders who enter and exit positions frequently.',
                }),

                Callout({
                    title: 'Bid/Ask Example',
                    type: 'info',
                    points: [
                        'EUR/USD quote: 1.2000/1.2003',
                        'Bid price: 1.2000 (you can sell at this price)',
                        'Ask price: 1.2003 (you can buy at this price)',
                        'Spread: 0.0003 or 3 pips',
                        'If you buy at 1.2003, price must rise to at least 1.2003 to break even',
                        'If you sell at 1.2000, price must fall to at least 1.2000 to break even',
                        'The spread is effectively your initial cost for entering the trade',
                    ],
                }),

                H2({ text: 'Pips and Price Movement' }),

                Text({
                    text: "In forex trading, price movements are measured in pips, which stands for 'percentage in point' or 'price interest point.' A pip is the smallest standardized price movement in a currency pair and is used to calculate profit and loss as well as to express the size of price movements.",
                }),

                Text({
                    text: "For most currency pairs, a pip is the fourth decimal place (0.0001). For example, if EUR/USD moves from 1.2000 to 1.2001, that's a one-pip movement. For currency pairs involving the Japanese yen, a pip is the second decimal place (0.01) because the yen is valued at approximately 1/100th the value of other major currencies. So if USD/JPY moves from 110.00 to 110.01, that's a one-pip movement.",
                }),

                Text({
                    text: "In recent years, many brokers have begun quoting currency pairs to five decimal places (or three for yen pairs), introducing what's known as a 'fractional pip' or 'pipette,' which is 1/10th of a regular pip. This allows for more precise pricing and tighter spreads. In this system, a move from 1.20000 to 1.20010 represents one pip, while a move from 1.20000 to 1.20001 represents one pipette.",
                }),

                Text({
                    text: 'Understanding pips is crucial for calculating the value of your trades and managing risk. The monetary value of a pip depends on three factors: the currency pair being traded, the size of your position (lot size), and the base currency of your trading account.',
                }),

                Text({
                    text: 'For standard lot sizes (100,000 units of the base currency), the general formula for calculating pip value is:',
                }),

                Text({
                    text: 'Pip Value = (Pip Size × Lot Size) / Exchange Rate',
                }),

                Text({
                    text: 'For currency pairs where USD is the quote currency (like EUR/USD), the value of one pip for a standard lot is $10. For pairs where USD is the base currency (like USD/JPY), the calculation is slightly more complex and depends on the current exchange rate.',
                }),

                Text({
                    text: "Most trading platforms calculate pip values automatically, but understanding the concept is important for assessing risk and potential reward. For example, if you're trading 1 standard lot of EUR/USD and have a stop loss 30 pips away from your entry, you're risking approximately $300 (30 pips × $10 per pip).",
                }),

                Callout({
                    title: 'Pip Value Examples',
                    type: 'info',
                    points: [
                        'EUR/USD standard lot (100,000 units): 1 pip = $10',
                        'EUR/USD mini lot (10,000 units): 1 pip = $1',
                        'EUR/USD micro lot (1,000 units): 1 pip = $0.10',
                        'USD/JPY standard lot at 110.00: 1 pip ≈ $9.09',
                        'GBP/USD standard lot: 1 pip = $10',
                        'USD/CAD standard lot at 1.2500: 1 pip ≈ $8',
                    ],
                }),

                H2({ text: 'Currency Correlations: The Interconnected Market' }),

                Text({
                    text: 'One of the most important aspects of currency pairs that many traders overlook is correlation—the tendency of certain pairs to move either in tandem with or opposite to each other. These correlations exist because currencies are traded in pairs, so a movement in one pair often implies movements in related pairs.',
                }),

                Text({
                    text: 'Correlations are measured on a scale from -1 to +1. A correlation of +1 means two currency pairs move in perfect tandem—when one rises or falls, the other does the same by a proportional amount. A correlation of -1 means they move in perfect opposition—when one rises, the other falls by a proportional amount. A correlation of 0 indicates no relationship between the movements of the two pairs.',
                }),

                Text({
                    text: 'Some correlations are intuitive based on the composition of the pairs. For example, EUR/USD and USD/CHF typically have a strong negative correlation (often around -0.90) because USD is the quote currency in EUR/USD but the base currency in USD/CHF. When the dollar strengthens, EUR/USD tends to fall while USD/CHF tends to rise.',
                }),

                Text({
                    text: 'Other correlations are based on economic relationships between countries. AUD/USD and NZD/USD often have a strong positive correlation because Australia and New Zealand have similar economies that are heavily dependent on commodities and trade with Asia, particularly China.',
                }),

                Text({
                    text: 'Understanding these correlations has several practical applications in trading:',
                }),

                ...BulletList({
                    items: [
                        'Risk management: Trading multiple pairs with high positive correlations effectively increases your exposure to the same market movement, potentially magnifying both gains and losses',
                        'Confirmation: Correlations can provide confirmation of a trading signal—if correlated pairs are showing similar patterns, it may increase confidence in a trade',
                        'Hedging: Pairs with negative correlations can be used to hedge positions, reducing overall portfolio risk',
                        'Divergence opportunities: When pairs that typically correlate strongly begin to diverge, it may signal a trading opportunity as they potentially revert to their normal relationship',
                    ],
                    key: 'correlation-applications',
                }),

                Text({
                    text: "It's important to note that correlations aren't static—they change over time based on evolving economic relationships, central bank policies, and market conditions. Traders should regularly update their understanding of current correlations rather than relying on historical patterns that may no longer hold true.",
                }),

                Text({
                    text: "Many trading platforms and financial websites provide correlation tables or matrices that show the current correlations between various currency pairs. These tools can be valuable for understanding the relationships between the pairs you're trading and managing your overall portfolio risk.",
                }),

                H2({ text: 'Direct and Indirect Quotes' }),

                Text({
                    text: "When discussing currency pairs, it's useful to understand the concepts of direct and indirect quotes, which relate to how currencies are quoted relative to a specific base currency—typically your home currency or account currency.",
                }),

                Text({
                    text: 'A direct quote shows how much of your domestic currency is needed to buy one unit of a foreign currency. For someone based in the United States, EUR/USD is a direct quote because it shows how many U.S. dollars (the domestic currency) are needed to buy one euro (the foreign currency).',
                }),

                Text({
                    text: 'An indirect quote shows how much of a foreign currency is needed to buy one unit of your domestic currency. For a U.S.-based trader, USD/JPY is an indirect quote because it shows how many Japanese yen (the foreign currency) are needed to buy one U.S. dollar (the domestic currency).',
                }),

                Text({
                    text: "This distinction is primarily conceptual and doesn't affect how you trade the pairs, but it can be helpful for understanding price movements in relation to your base currency, especially when calculating profits and losses.",
                }),

                H2({ text: 'Base Currency and Account Currency Implications' }),

                Text({
                    text: 'An often overlooked aspect of currency trading is the relationship between the currency pairs you trade and the base currency of your trading account. This relationship affects how profits and losses are calculated and can have significant implications for your overall returns.',
                }),

                Text({
                    text: 'When you trade a currency pair, your profit or loss is initially denominated in the quote currency of the pair. For example, if you trade EUR/USD, your profit or loss is calculated in U.S. dollars. If your account is also denominated in U.S. dollars, no conversion is necessary. However, if your account is denominated in a different currency, your broker will automatically convert your profit or loss to your account currency.',
                }),

                Text({
                    text: 'This conversion introduces an additional layer of currency risk. For example, if your account is denominated in euros and you make a profit trading USD/JPY (denominated in yen), your profit must be converted first from yen to dollars and then from dollars to euros. Fluctuations in these exchange rates can affect the final value of your profit or loss when expressed in your account currency.',
                }),

                Text({
                    text: 'For this reason, many traders prefer to have their trading accounts denominated in a major currency that is widely used in the pairs they trade, often the U.S. dollar. This minimizes the impact of currency conversions on their trading results. However, if you have a specific view on the long-term direction of your home currency, you might choose to denominate your account in that currency to benefit from its appreciation or depreciation.',
                }),

                H2({ text: 'Practical Applications: Selecting Currency Pairs to Trade' }),

                Text({
                    text: 'With dozens of currency pairs available to trade, how do you decide which ones to focus on? The answer depends on several factors, including your trading style, risk tolerance, available trading hours, and market knowledge.',
                }),

                Text({
                    text: "For beginners, it's generally advisable to start with major pairs. These pairs offer several advantages:",
                }),

                ...BulletList({
                    items: [
                        'Lower transaction costs due to tighter spreads',
                        'More consistent liquidity, making it easier to enter and exit positions',
                        'More available information and analysis from various sources',
                        'More predictable behavior in response to technical patterns and fundamental factors',
                        'Lower volatility compared to exotic pairs, reducing the risk of sudden, large adverse movements',
                    ],
                    key: 'major-pair-advantages',
                }),

                Text({
                    text: 'As you gain experience, you might expand to include minor pairs that align with your trading style or that offer specific opportunities based on your analysis. For example, if you develop expertise in analyzing European economic trends, you might add EUR/GBP or EUR/CHF to your trading repertoire.',
                }),

                Text({
                    text: 'Your available trading hours should also influence your pair selection. Different currency pairs are most active during different sessions of the 24-hour forex market:',
                }),

                ...BulletList({
                    items: [
                        'Asian session (approximately 00:00-09:00 GMT): Pairs involving JPY, AUD, and NZD tend to be most active',
                        'European session (approximately 07:00-16:00 GMT): Pairs involving EUR, GBP, and CHF see increased activity',
                        'North American session (approximately 12:00-21:00 GMT): Pairs involving USD and CAD experience their highest liquidity',
                    ],
                    key: 'session-activity',
                }),

                Text({
                    text: 'If you can only trade during specific hours, you might focus on pairs that are most active during those times to benefit from the higher liquidity and potentially more significant price movements.',
                }),

                Text({
                    text: "Your risk tolerance should also guide your pair selection. If you prefer more stable, predictable trading conditions, stick primarily to major pairs. If you're comfortable with higher volatility and the potential for larger price swings (both favorable and unfavorable), you might include some minor pairs or even carefully selected exotic pairs in your trading plan.",
                }),

                Text({
                    text: 'Finally, consider your knowledge base and analytical strengths. If you have particular insight into specific economies or regions—perhaps due to your professional background, education, or personal interest—you might focus on currency pairs that allow you to leverage that knowledge. Trading is ultimately about finding an edge, and specialized knowledge can provide that edge in certain currency pairs.',
                }),

                H2({ text: 'Conclusion: The Foundation of Forex Trading' }),

                Text({
                    text: "Currency pairs are the foundation upon which all forex trading is built. Understanding their structure, classification, and behavior is essential for navigating the market effectively and making informed trading decisions. The concepts we've explored in this lesson—from the basic composition of pairs to the nuances of correlations and pip calculations—provide the framework for analyzing market opportunities and constructing trades with precision.",
                }),

                Text({
                    text: "Remember that each currency pair has its own personality—its own typical range of movement, reaction to news events, correlation with other pairs, and optimal trading strategies. As you progress in your trading journey, you'll likely develop preferences for certain pairs that align with your trading style, analytical approach, and risk tolerance.",
                }),

                Text({
                    text: "While it's valuable to understand the full spectrum of available pairs, most successful traders focus on a limited selection that they come to know intimately rather than trying to trade everything. By developing deep familiarity with a few pairs—understanding their typical daily ranges, how they respond to specific economic indicators, their correlation with other instruments, and their behavior during different market sessions—you can gain an edge that would be difficult to maintain across dozens of different pairs.",
                }),

                Text({
                    text: "In our next lesson, we'll explore market structure and organization—how the forex market is structured, who the key participants are, and how their interactions create the price movements we observe. This understanding will build upon your knowledge of currency pairs to give you a more complete picture of how the forex market functions and how you can position yourself advantageously within it.",
                }),

                Quiz({
                    question: 'In the currency pair GBP/USD, which is the base currency?',
                    options: ['USD', 'GBP', 'Both are base currencies', 'Neither is a base currency'],
                    correctAnswer: 1,
                    explanation:
                        'GBP (British Pound) is the base currency in the GBP/USD pair. The base currency is always the first currency listed in the pair. The price of GBP/USD shows how many US dollars are needed to buy one British pound.',
                }),

                Quiz({
                    question: 'If EUR/USD moves from 1.2000 to 1.2050, what has happened?',
                    options: [
                        'The euro has weakened against the dollar',
                        'The euro has strengthened against the dollar',
                        'The dollar has strengthened against the euro',
                        'There has been no change in relative value',
                    ],
                    correctAnswer: 1,
                    explanation:
                        'When EUR/USD rises from 1.2000 to 1.2050, the euro has strengthened against the dollar. The price indicates that more dollars (1.2050 instead of 1.2000) are now required to purchase one euro, meaning the euro has become more valuable relative to the dollar.',
                }),

                Quiz({
                    question: 'Which of the following is considered an exotic currency pair?',
                    options: ['EUR/GBP', 'USD/JPY', 'USD/ZAR', 'AUD/NZD'],
                    correctAnswer: 2,
                    explanation:
                        'USD/ZAR (US Dollar/South African Rand) is an exotic currency pair because it pairs a major currency (USD) with the currency of a developing economy (ZAR, the South African Rand). Exotic pairs typically have lower liquidity and wider spreads than major or minor pairs.',
                }),

                Quiz({
                    question: 'If the bid price for USD/CAD is 1.2500 and the ask price is 1.2505, what is the spread in pips?',
                    options: ['0.5 pips', '5 pips', '50 pips', '500 pips'],
                    correctAnswer: 1,
                    explanation:
                        'The spread is the difference between the ask price and the bid price: 1.2505 - 1.2500 = 0.0005. For most currency pairs including USD/CAD, a pip is the fourth decimal place (0.0001), so 0.0005 equals 5 pips.',
                }),

                Callout({
                    title: 'Next Steps',
                    type: 'tip',
                    points: [
                        'Familiarize yourself with the major currency pairs and their typical daily ranges',
                        'Practice calculating pip values for different position sizes',
                        'Observe how correlated currency pairs move in relation to each other',
                        'Consider which currency pairs best match your trading schedule and style',
                        'Begin tracking a few selected pairs to develop deeper understanding of their behavior',
                        'Explore how economic news affects different categories of currency pairs',
                    ],
                }),
            ],
        })
    )
    .build();
