'use client';
import type React from 'react';
import Link from 'next/link';
import { useState, useEffect, memo, useMemo } from 'react';
import {
  FaChevronDown,
  FaQuestionCircle,
  FaCommentAlt,
  FaSearch,
  FaTags,
  FaExternalLinkAlt
} from 'react-icons/fa';
import { MotionDiv } from '@/components/MotionDiv';
import { client } from '@/utils/sanity/lib/client';
import { PortableText } from '@portabletext/react';
import { useInView } from 'react-intersection-observer';
import { AnimatePresence } from 'framer-motion';

interface FAQItem {
  _id: string;
  question: string;
  answer: any[];
  category?: string;
  isPublished: boolean;
}

// Enhanced FAQ Item component
const FAQItem = memo(
  ({
    item,
    isActive,
    onClick,
    index
  }: {
    item: FAQItem;
    isActive: boolean;
    onClick: () => void;
    index: number;
  }) => {
    const { ref, inView } = useInView({
      threshold: 0.2,
      triggerOnce: true
    });

    return (
      <MotionDiv
        ref={ref}
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, delay: index * 0.1 }}
        className="group relative"
      >
        <div
          className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
            isActive
              ? 'border-emerald-400/50 bg-emerald-400/5 shadow-lg shadow-emerald-400/10'
              : 'border-white/5 bg-black/40 hover:border-white/10 hover:bg-black/60'
          }`}
        >
          {/* Glow effects */}
          <div className="pointer-events-none absolute inset-0">
            <div className="absolute inset-0 rounded-xl bg-[radial-gradient(circle_at_50%_0%,rgba(255,255,255,0.03),transparent_50%)]" />
            <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-white/20 to-transparent" />
          </div>

          <button
            onClick={onClick}
            className="flex w-full cursor-pointer items-center justify-between p-6"
          >
            <div className="flex items-center gap-4">
              <div
                className={`flex h-12 w-12 items-center justify-center rounded-full border transition-all duration-300 ${
                  isActive
                    ? 'border-emerald-400 bg-emerald-400/10'
                    : 'border-white/10 bg-white/5 group-hover:border-white/20 group-hover:bg-white/10'
                }`}
              >
                <FaQuestionCircle
                  className={`h-5 w-5 transition-all duration-300 ${
                    isActive
                      ? 'text-emerald-400'
                      : 'text-white/60 group-hover:text-white/80'
                  }`}
                />
              </div>
              <h3 className="text-left text-lg font-medium text-white/90">
                {item.question}
              </h3>
            </div>
            <MotionDiv
              animate={{ rotate: isActive ? 180 : 0 }}
              transition={{ duration: 0.3 }}
              className={`transition-colors duration-300 ${
                isActive
                  ? 'text-emerald-400'
                  : 'text-white/60 group-hover:text-white/80'
              }`}
            >
              <FaChevronDown className="h-5 w-5" />
            </MotionDiv>
          </button>

          <MotionDiv
            initial={false}
            animate={{
              height: isActive ? 'auto' : 0,
              opacity: isActive ? 1 : 0
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <div className="border-t border-white/5 px-6 py-6">
              <div className="flex gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full border border-white/10 bg-white/5">
                  <FaCommentAlt className="h-5 w-5 text-white/60" />
                </div>
                <div className="prose prose-invert max-w-none text-base leading-relaxed text-white/70">
                  <PortableText value={item.answer} />
                </div>
              </div>
              {item.category && (
                <div className="mt-4 flex items-center gap-2">
                  <span className="rounded-full bg-white/5 px-3 py-1 text-xs text-white/40">
                    {item.category}
                  </span>
                </div>
              )}
            </div>
          </MotionDiv>
        </div>
      </MotionDiv>
    );
  }
);

FAQItem.displayName = 'FAQItem';

// Enhanced search input
const SearchInput = memo(
  ({
    value,
    onChange
  }: {
    value: string;
    onChange: (value: string) => void;
  }) => (
    <div className="group relative mb-8">
      <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-4">
        <FaSearch className="h-5 w-5 text-white/40 transition-colors duration-300 group-focus-within:text-emerald-400" />
      </div>
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder="Search questions..."
        className="w-full rounded-xl border border-white/10 bg-white/5 py-4 pr-4 pl-12 text-white/90 placeholder-white/40 shadow-lg shadow-black/20 backdrop-blur-sm transition-all duration-300 focus:border-emerald-400/50 focus:bg-emerald-400/5 focus:ring-2 focus:ring-emerald-400/20 focus:outline-none"
      />
      <div className="absolute inset-0 -z-10 rounded-xl bg-gradient-to-b from-white/5 to-transparent opacity-0 transition-opacity duration-300 group-focus-within:opacity-100" />
    </div>
  )
);

SearchInput.displayName = 'SearchInput';

// Enhanced category filter
const CategoryFilter = memo(
  ({
    categories,
    selected,
    onSelect
  }: {
    categories: string[];
    selected: string;
    onSelect: (category: string) => void;
  }) => (
    <div className="mb-8 flex flex-wrap gap-2">
      <button
        onClick={() => onSelect('all')}
        className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm transition-all duration-300 ${
          selected === 'all'
            ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400'
            : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white/80'
        }`}
      >
        <FaTags
          className={`h-4 w-4 transition-transform duration-300 group-hover:rotate-12`}
        />
        All
      </button>
      {categories.map((category) => (
        <button
          key={category}
          onClick={() => onSelect(category)}
          className={`group flex items-center gap-2 rounded-full border px-4 py-2 text-sm capitalize transition-all duration-300 ${
            selected === category
              ? 'border-emerald-400/50 bg-emerald-400/10 text-emerald-400'
              : 'border-white/10 bg-white/5 text-white/60 hover:border-white/20 hover:bg-white/10 hover:text-white/80'
          }`}
        >
          <FaTags
            className={`h-4 w-4 transition-transform duration-300 group-hover:rotate-12`}
          />
          {category}
        </button>
      ))}
    </div>
  )
);

CategoryFilter.displayName = 'CategoryFilter';

// Main FAQ Section
export const SectionFAQ: React.FC = () => {
  const [activeId, setActiveId] = useState<string | null>(null);
  const [faqItems, setFaqItems] = useState<FAQItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const { ref, inView } = useInView({
    threshold: 0.1,
    triggerOnce: true
  });

  useEffect(() => {
    const fetchFAQ = async () => {
      try {
        const query = `*[_type == "faq"] {
          _id,
          question,
          answer,
          category
        }`;

        const result = await client.fetch(query);
        setFaqItems(result);
      } catch (error) {
        console.error('Error fetching FAQ:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchFAQ();
  }, []);

  const categories = useMemo(
    () =>
      Array.from(
        new Set(faqItems.map((item) => item.category).filter(Boolean))
      ),
    [faqItems]
  );

  const filteredItems = useMemo(() => {
    return faqItems.filter((item) => {
      const matchesSearch = item.question
        .toLowerCase()
        .includes(searchQuery.toLowerCase());
      const matchesCategory =
        selectedCategory === 'all' || item.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [faqItems, searchQuery, selectedCategory]);

  return (
    <section className="relative min-h-screen overflow-hidden py-32">
      {/* Enhanced Background Effects */}
      <div className="pointer-events-none absolute inset-0">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.03),transparent_70%)]" />
        <div className="absolute -top-1/2 left-0 h-96 w-96 -translate-x-1/2 rounded-full bg-emerald-400/5 blur-3xl" />
        <div className="absolute right-0 -bottom-1/2 h-96 w-96 translate-x-1/2 rounded-full bg-emerald-400/5 blur-3xl" />
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <MotionDiv
          ref={ref}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.8 }}
          className="mb-16 text-center"
        >
          <h2 className="text-gray-gradient font-outfit mb-6 text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Frequently Asked Questions
          </h2>
          <p className="font-kodemono mx-auto max-w-2xl text-base text-white/60 sm:text-lg">
            Everything you need to know about rthmn. Can't find the answer
            you're looking for?{' '}
            <Link
              href="/contact"
              className="text-emerald-400 hover:text-emerald-300"
            >
              Contact our support team
              <FaExternalLinkAlt className="ml-1 inline-block h-3 w-3" />
            </Link>
          </p>
        </MotionDiv>

        <div className="mx-auto max-w-4xl">
          <SearchInput value={searchQuery} onChange={setSearchQuery} />

          {categories.length > 0 && (
            <CategoryFilter
              categories={categories}
              selected={selectedCategory}
              onSelect={setSelectedCategory}
            />
          )}

          <AnimatePresence mode="wait">
            {isLoading ? (
              <div className="animate-pulse space-y-4">
                {[...Array(5)].map((_, i) => (
                  <div
                    key={i}
                    className="rounded-xl border border-white/5 bg-white/5 p-6"
                  >
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-12 rounded-full bg-white/10" />
                      <div className="h-6 w-2/3 rounded bg-white/10" />
                    </div>
                  </div>
                ))}
              </div>
            ) : filteredItems.length > 0 ? (
              <div className="space-y-4 bg-black">
                {filteredItems.map((item, index) => (
                  <FAQItem
                    key={item._id}
                    item={item}
                    isActive={activeId === item._id}
                    onClick={() =>
                      setActiveId(activeId === item._id ? null : item._id)
                    }
                    index={index}
                  />
                ))}
              </div>
            ) : (
              <MotionDiv
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="text-center text-white/60"
              >
                No questions found matching your criteria
              </MotionDiv>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
};
