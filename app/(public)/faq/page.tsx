import { BackgroundGrid } from '@/components/BackgroundGrid';
import { SectionFAQ } from '@/components/Sections/SectionFAQ';
import { SectionFooter } from '@/components/Sections/SectionFooter';
import Link from 'next/link';
import {
  FaDiscord,
  FaEnvelope,
  FaBook,
  FaGithub,
  FaArrowRight
} from 'react-icons/fa';

const SectionQuickHelp = () => (
  <section className="relative py-16">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="grid gap-6 md:grid-cols-3">
        {[
          {
            icon: <FaDiscord className="h-6 w-6" />,
            title: 'Join Discord',
            description: 'Get real-time support from our community',
            link: '/discord',
            color: 'from-indigo-500 to-purple-500'
          },
          {
            icon: <FaBook className="h-6 w-6" />,
            title: 'Documentation',
            description: 'Explore our detailed documentation',
            link: '/docs',
            color: 'from-emerald-500 to-teal-500'
          },
          {
            icon: <FaEnvelope className="h-6 w-6" />,
            title: 'Email Support',
            description: 'Contact our support team directly',
            link: '/contact',
            color: 'from-orange-500 to-red-500'
          }
        ].map((item, index) => (
          <Link
            key={index}
            href={item.link}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-6 transition-all duration-300 hover:border-white/20 hover:bg-black/60"
          >
            <div className="pointer-events-none absolute inset-0">
              <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
              <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
            </div>
            <div
              className={`mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-gradient-to-br ${item.color} p-3 text-white shadow-lg`}
            >
              {item.icon}
            </div>
            <h3 className="font-outfit mb-2 text-xl font-semibold text-white">
              {item.title}
            </h3>
            <p className="font-kodemono mb-4 text-sm text-gray-400">
              {item.description}
            </p>
            <div className="flex items-center text-sm text-gray-400">
              <span>Learn more</span>
              <FaArrowRight className="ml-2 h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
            </div>
          </Link>
        ))}
      </div>
    </div>
  </section>
);

// GitHub Integration Section
const SectionGitHub = () => (
  <section className="relative mb-12">
    <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <div className="relative overflow-hidden rounded-xl border border-white/10 bg-black/40 p-8">
        <div className="pointer-events-none absolute inset-0">
          <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
          <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
        </div>
        <div className="flex flex-col items-center justify-between md:flex-row">
          <div>
            <h2 className="font-outfit mb-2 text-2xl font-bold text-white">
              Found a Bug?
            </h2>
            <p className="font-kodemono mb-8 text-gray-400 md:mb-0">
              Report issues directly on our GitHub repository
            </p>
          </div>
          <Link
            href="https://github.com/rthmnapp/rthmn-feedback/issues"
            className="group flex items-center gap-2 rounded-full bg-white/5 px-6 py-3 text-sm text-white transition-all duration-300 hover:bg-white/10"
          >
            <FaGithub className="h-5 w-5" />
            <span>View on GitHub</span>
            <FaArrowRight className="h-3 w-3 transition-transform duration-300 group-hover:translate-x-1" />
          </Link>
        </div>
      </div>
    </div>
  </section>
);

export default function FAQ() {
  return (
    <BackgroundGrid>
      <SectionFAQ />
      {/* <SectionQuickHelp /> */}
      <SectionGitHub />
      <SectionFooter />
    </BackgroundGrid>
  );
}
