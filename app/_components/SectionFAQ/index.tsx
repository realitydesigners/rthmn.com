'use client';
import type React from 'react';
import { useState, type JSX } from 'react';

type FAQItem = {
  question: string;
  answer: string;
};

const FAQ: FAQItem[] = [
  {
    question: 'How does rthmn work?',
    answer:
      'Rthmn sends you trading signals that our algorithm scans for across many patterns, delivering them to you via SMS for you to execute on any trading platform or broker of your choosing. This ensures you get timely and actionable insights without the need to constantly monitor the market yourself.'
  },
  {
    question: 'How do I know how much to buy?',
    answer:
      'Rthmn suggests risk management and gives each trade a score depending on how the algorithm determines its risk and the type of pattern. This helps you make informed decisions on position sizing based on the risk level of each trade.'
  },
  {
    question: 'Can I customize the alerts I receive?',
    answer:
      'Yes, you can customize the alerts based on your trading preferences. You can set criteria for the types of patterns and risk levels you want to be notified about, ensuring that you receive only the most relevant alerts for your trading strategy.'
  },
  {
    question: 'What markets does rthmn cover?',
    answer:
      'Rthmn covers a wide range of markets including equities, forex, commodities, and cryptocurrencies. This broad coverage ensures that you can receive trading signals and insights across different asset classes, helping you diversify your trading activities.'
  },
  {
    question: 'How does rthmn handle data security?',
    answer:
      'Rthmn ensures robust end-to-end encryption and comprehensive data security for all user data and trading signals. This means that your personal information and trading activities are protected from unauthorized access, providing a secure trading environment.'
  },
  {
    question: 'Is there a community for rthmn users?',
    answer:
      'Yes, we have a social trading community where users can interact, share insights, and collaborate. This includes forums, chat rooms, and social feeds where traders can learn from each other and enhance their trading strategies.'
  },
  {
    question: 'What kind of educational resources does rthmn offer?',
    answer:
      'Rthmn provides a wealth of educational content including tutorials, articles, and guides on various trading topics. These resources are designed to help you improve your trading knowledge and skills, enhancing your overall trading performance.'
  },
  {
    question: 'How accurate are the trading signals?',
    answer:
      "Rthmn's trading signals are generated using advanced algorithms that analyze historical and real-time data to identify high-probability trading opportunities. While no system can guarantee success, our signals are designed to provide a significant edge in the market."
  },
  {
    question: 'Can I use rthmn on multiple devices?',
    answer:
      'Yes, rthmn ensures seamless device integration and synchronization, allowing you to access your account and trading signals from multiple devices. This provides a consistent and connected trading experience across desktops, tablets, and smartphones.'
  },
  {
    question: 'What kind of customer support is available?',
    answer:
      'Rthmn provides comprehensive customer support including a dedicated help center, live chat, and email support. Our support team is always ready to assist you with any questions or issues you may have.'
  },
  {
    question: 'How does rthmn help with compliance?',
    answer:
      'Rthmn ensures that your trading activities comply with relevant regulations and standards. This feature monitors and alerts you about compliance issues, helping you avoid penalties and ensure smooth operations.'
  },
  {
    question: 'Can I track my performance with rthmn?',
    answer:
      'Yes, rthmn provides in-depth performance analytics that allow you to track and evaluate your trading activities. This helps you understand your performance metrics, identify areas for improvement, and enhance your trading effectiveness.'
  }
];

export const FAQSection: React.FC = () => {
  const [activeService, setActiveService] = useState<string | null>(null);

  const handleFAQClick = (label: string) => {
    setActiveService(activeService !== label ? label : null);
  };

  return (
    <div
      className={`text-oxanium flex w-full flex-col items-center justify-center py-10 md:px-40`}
    >
      <ul className="w-11/12 lg:w-1/2">
        {FAQ.map(({ question, answer }) => (
          <li key={question} className="mb-4">
            {activeService !== question && (
              <div
                className={`w-full cursor-pointer border border-gray-600/50 p-4 ${
                  activeService === question
                    ? 'bg-gray-600/25'
                    : 'bg-black hover:bg-gray-600/25'
                } flex items-center transition duration-300 ease-in-out`}
                onClick={() => handleFAQClick(question)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    handleFAQClick(question);
                  }
                }}
                role="button"
                tabIndex={0}
              >
                {getIcon({ name: 'question' })}
                <div className="heading-text ml-2 text-lg font-bold uppercase leading-[1.2em]">
                  {question}
                </div>
              </div>
            )}

            {activeService === question && (
              <div
                className="mt-2 overflow-hidden border border-gray-600/25 p-4 transition-all duration-500 ease-in-out"
                style={{
                  maxHeight: activeService === question ? '1000px' : '0',
                  opacity: activeService === question ? 1 : 0
                }}
              >
                <h2 className="fade-in heading-text mb-4 text-4xl font-bold uppercase leading-none lg:text-5xl">
                  {question}
                </h2>
                <p className="primary-text fade-in text-gray-400">{answer}</p>
              </div>
            )}
          </li>
        ))}
      </ul>
    </div>
  );
};

interface IconProps {
  name: keyof typeof icons;
}

const getIcon = ({ name }: IconProps): JSX.Element => {
  if (name in icons) {
    return icons[name];
  }
  return <svg />;
};

const icons = {
  question: (
    <svg
      width="20"
      height="20"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
    >
      <title>Question</title>
      <path
        d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
        stroke="#444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M12 17H12.01"
        stroke="#444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M9.09 9C9.3251 8.33167 9.78915 7.76811 10.4 7.40913C11.0108 7.05016 11.7289 6.91894 12.4272 7.03871C13.1255 7.15849 13.7588 7.52152 14.2151 8.06353C14.6713 8.60553 14.9211 9.29152 14.92 10C14.92 12 11.92 13 11.92 13"
        stroke="#444"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  )
};
