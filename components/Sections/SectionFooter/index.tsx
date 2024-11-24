'use client';
import Link from 'next/link';
import { useState, type JSX } from 'react';
import {
  FaGithub,
  FaTwitter,
  FaDiscord,
  FaInstagram,
  FaYoutube
} from 'react-icons/fa';

const FOOTER_LINKS = {
  product: [
    { name: 'Features', href: '#' },
    { name: 'Pricing', href: '/pricing' },
    { name: 'FAQ', href: '/faq' },
    { name: 'Learn', href: '/learn' }
  ],

  company: [
    { name: 'About', href: '/about' },
    { name: 'Algorithmn', href: '/algorithmn' },
    { name: 'Changelog', href: '/changelog' },
    { name: 'Blog', href: '/blog' }
  ],
  legal: [
    { name: 'Contact', href: '/contact' },
    { name: 'Privacy', href: '#' },
    { name: 'Terms', href: '/terms' }
  ]
};

const SOCIAL_LINKS = [
  { name: 'Twitter', icon: FaTwitter, href: 'https://x.com/rthmnapp' },
  {
    name: 'Instagram',
    icon: FaInstagram,
    href: 'https://www.instagram.com/rthmnapp/'
  },
  { name: 'GitHub', icon: FaGithub, href: 'https://github.com/rthmnapp' },
  {
    name: 'Youtube',
    icon: FaYoutube,
    href: 'https://www.youtube.com/@rthmnco'
  }
];

const getIcon = (name: string): JSX.Element => {
  const icons: { [key: string]: JSX.Element } = {
    logo: (
      <svg
        width="40"
        height="40"
        viewBox="0 0 100 100"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        aria-labelledby="logoTitle"
      >
        <title id="logoTitle">Logo</title>
        <g clipPath="url(#clip0_1208_27417)">
          <path
            d="M27.512 73.5372L27.512 28.512C27.512 27.9597 27.9597 27.512 28.512 27.512L70.4597 27.512C71.0229 27.512 71.475 27.9769 71.4593 28.54L70.8613 49.9176C70.8462 50.4588 70.4031 50.8896 69.8617 50.8896L50.7968 50.8896C49.891 50.8896 49.4519 51.9975 50.1117 52.618L92.25 92.25M92.25 92.25L48.2739 92.25L7.75002 92.25C7.19773 92.25 6.75002 91.8023 6.75002 91.25L6.75 7.75C6.75 7.19771 7.19772 6.75 7.75 6.75L91.25 6.75003C91.8023 6.75003 92.25 7.19775 92.25 7.75003L92.25 92.25Z"
            stroke="white"
            strokeWidth="8"
          />
        </g>
        <defs>
          <clipPath id="clip0_1208_27417">
            <rect width="100" height="100" fill="white" />
          </clipPath>
        </defs>
      </svg>
    )
  };
  return icons[name] || <path />;
};

export function SectionFooter() {
  const [email, setEmail] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle newsletter signup
    console.log('Newsletter signup:', email);
  };

  return (
    <footer className="relative z-90 border-t border-white/5 bg-black">
      <div className="mx-auto max-w-7xl px-4 py-12 lg:px-8">
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-2">
          {/* Left Side */}
          <div className="flex flex-col gap-8">
            <div>
              <Link href="/" className="z-50 flex items-center gap-2">
                <div className="flex h-8 w-8 items-center">
                  {getIcon('logo')}
                </div>
                <div
                  className={`font-russo pt-1 text-2xl font-bold tracking-wide`}
                >
                  RTHMN
                </div>
              </Link>
              <p
                className={`font-kodemono mt-4 max-w-md text-sm text-gray-400`}
              >
                Advanced pattern recognition for algorithmic trading. Built by
                traders, for traders.
              </p>
              {/* Social Links */}
              <div className="mt-6 flex space-x-6">
                {SOCIAL_LINKS.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="group relative text-gray-400 transition-colors duration-200 hover:text-white"
                  >
                    <span className="absolute -inset-2 -z-10 rounded-full bg-white/0 transition-all duration-300 group-hover:bg-white/5" />
                    <item.icon className="h-5 w-5" />
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Right Side */}
          <div className="grid grid-cols-2 gap-8 lg:grid-cols-3">
            {/* Links Sections */}
            {Object.entries(FOOTER_LINKS).map(([category, links]) => (
              <div key={category} className="font-kodemono">
                <h3 className="text-sm font-semibold text-white uppercase">
                  {category}
                </h3>
                <ul className="mt-4 space-y-2">
                  {links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="group flex items-center text-sm text-gray-400 transition-colors duration-200 hover:text-white"
                      >
                        <span className="relative">
                          {link.name}
                          <span className="absolute -bottom-0.5 left-0 h-px w-0 bg-white transition-all duration-200 group-hover:w-full" />
                        </span>
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
        <div className="font-kodemono mt-8 border-t border-white/10 pt-8 text-[11px] leading-relaxed text-white/50">
          <h4 className="mb-2 text-xs font-semibold text-white uppercase">
            Risk Disclosure & Disclaimer
          </h4>
          <p className="text-gray-400">
            RTHMN is pattern recognition platform providing algorithmic trading
            indicators and analysis tools. Built by traders, for traders.
            Trading in financial instruments involves high risks including the
            risk of losing some, or all, of your investment amount, and may not
            be suitable for all investors. Before deciding to trade, you should
            carefully consider your investment objectives, level of experience,
            and risk appetite.
          </p>
          <p className="mt-2 text-gray-400">
            The information and tools provided by RTHMN, including but not
            limited to our indicators, pattern recognition systems, and market
            analysis, do not constitute investment advice, financial advice,
            trading advice, or any other sort of advice. Any decision to place a
            trade or investment using our platform and tools is solely your
            decision. RTHMN will not accept liability for any loss or damage,
            including without limitation any loss of profit, which may arise
            directly or indirectly from use of or reliance on our platform or
            information.
          </p>
          <p className="mt-2 text-gray-400">
            Past performance of any trading system, methodology, or pattern
            recognition tool is not necessarily indicative of future results.
            Market patterns and behaviors are inherently unpredictable. You
            should be aware of all the risks associated with trading and seek
            advice from an independent financial advisor if you have any doubts.
          </p>
          <p className="mt-2 text-gray-400">
            Hypothetical or simulated performance results have certain inherent
            limitations. Unlike actual trading performance, simulated results do
            not represent actual trading and may not be impacted by real market
            factors. No representation is being made that any account will or is
            likely to achieve profits or losses similar to those shown through
            our platform.
          </p>
        </div>
        {/* Bottom Section */}
        <div
          className={`font-kodemono mt-12 flex flex-col items-center justify-between border-t border-white/10 pt-8 lg:flex-row`}
        >
          <p className="text-xs text-gray-400">
            © 2024 Rthmn. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
