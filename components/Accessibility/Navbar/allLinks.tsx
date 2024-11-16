import type { IconType } from 'react-icons';
import {
  FaSignal,
  FaChartLine,
  FaCrown,
  FaBlog,
  FaBook,
  FaCode,
  FaCompass,
  FaUser,
  FaCog,
  FaCreditCard,
  FaUsers,
  FaEnvelope,
  FaHandshake,
  FaBriefcase
} from 'react-icons/fa';

export interface LinkItem {
  title: string;
  desc?: string;
  href: string;
  icon: IconType;
}

export interface LinkGroup {
  title: string;
  links: LinkItem[];
}

export const allLinks: LinkGroup[] = [
  {
    title: 'Pricing',
    links: [
      {
        title: 'Signal Service',
        desc: 'Real-time market signals for informed trading decisions',
        href: '/pricing',
        icon: FaSignal
      },
      {
        title: 'Premium Signals',
        desc: 'Advanced signals with higher accuracy and frequency',
        href: '/',
        icon: FaChartLine
      },
      {
        title: 'Elite Membership',
        desc: 'Exclusive access to all features and personalized support',
        href: '/',
        icon: FaCrown
      }
    ]
  },
  {
    title: 'Company',
    links: [
      {
        title: 'About',
        desc: 'Learn about our mission and values',
        href: '/about',
        icon: FaCompass
      },
      {
        title: 'Team',
        desc: 'Meet the minds behind our signals',
        href: '/',
        icon: FaUsers
      },

      {
        title: 'Contact',
        desc: 'Get in touch with our support team',
        href: '/',
        icon: FaEnvelope
      }
    ]
  },
  {
    title: 'Features',
    links: [
      {
        title: 'Profile',
        desc: 'Manage your personal information',
        href: '/',
        icon: FaUser
      },
      {
        title: 'Settings',
        desc: 'Customize your trading environment',
        href: '/',
        icon: FaCog
      },
      {
        title: 'Billing',
        desc: 'View and manage your subscription',
        href: '/',
        icon: FaCreditCard
      }
    ]
  },
  {
    title: 'Resources',
    links: [
      {
        title: 'Blog',
        desc: 'Latest insights and trading strategies',
        href: '/',
        icon: FaBlog
      },
      {
        title: 'Documentation',
        desc: 'Comprehensive guides for using our platform',
        href: '/',
        icon: FaBook
      },
      {
        title: 'Changelog',
        desc: 'Integrate our services into your applications',
        href: '/changelog',
        icon: FaCode
      }
    ]
  }
];
