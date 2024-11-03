'use client';
import Button from '@/components/Button';
import { getErrorRedirect } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import type { User } from '@supabase/supabase-js';
import cn from 'classnames';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaBolt, FaChartLine, FaWaveSquare, FaRobot } from 'react-icons/fa';

type Subscription = any;
type Product = any;
type Price = any;
interface ProductWithPrices extends Product {
  prices: Price[];
}
interface PriceWithProduct extends Price {
  products: Product | null;
}
interface SubscriptionWithProduct extends Subscription {
  prices: PriceWithProduct | null;
}

interface Props {
  user: User | null | undefined;
  products: ProductWithPrices[];
  subscription: SubscriptionWithProduct | null;
}

type BillingInterval = 'lifetime' | 'year' | 'month';

const PRICING_FEATURES = [
  { icon: FaChartLine, text: 'Real-time market analysis', color: '#22c55e' },
  { icon: FaWaveSquare, text: 'Advanced pattern detection', color: '#3b82f6' },
  { icon: FaRobot, text: 'Early access to new features', color: '#8b5cf6' },
  { icon: FaBolt, text: 'Priority support', color: '#f59e0b' }
];

export function SectionPricing({ user, products, subscription }: Props) {
  const intervals = Array.from(
    new Set(
      products.flatMap((product) =>
        product?.prices?.map((price) => price?.interval)
      )
    )
  );
  const router = useRouter();
  const [billingInterval, setBillingInterval] =
    useState<BillingInterval>('month');
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const currentPath = usePathname();

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin/signup');
    }

    const { errorRedirect, sessionId } = await checkoutWithStripe(
      price,
      price.type === 'recurring', // isSubscription
      '/account', // successPath
      currentPath // cancelPath
    );

    if (errorRedirect) {
      setPriceIdLoading(undefined);
      return router.push(errorRedirect);
    }

    if (!sessionId) {
      setPriceIdLoading(undefined);
      return router.push(
        getErrorRedirect(
          currentPath,
          'An unknown error occurred.',
          'Please try again later or contact a system administrator.'
        )
      );
    }

    const stripe = await getStripe();
    stripe?.redirectToCheckout({ sessionId });

    setPriceIdLoading(undefined);
  };

  if (!products.length) {
    return (
      <section className="bg-black">
        <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6 sm:py-24 lg:px-8">
          <div className="sm:align-center sm:flex sm:flex-col" />
          <p className={`text-kodemono text-lg text-gray-300`}>
            No subscription pricing plans found. Create them in your{' '}
            <a
              className="text-blue-500 underline hover:text-blue-400"
              href="https://dashboard.stripe.com/products"
              rel="noopener noreferrer"
              target="_blank"
            >
              Stripe Dashboard
            </a>
            .
          </p>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-black">
      <div className="px-4 py-8 sm:px-6 sm:py-24 lg:px-32">
        <div className="flex flex-col gap-6">
          {/* Title Section */}
          <div className="flex w-full flex-col items-center justify-center">
            <h1
              className={`text-outfit text-gray-gradient text-5xl font-bold tracking-tight text-white lg:text-7xl`}
            >
              Early Access
            </h1>
            <p
              className={`text-kodemono text-dark-gray my-6 max-w-2xl text-sm leading-relaxed lg:text-lg`}
            >
              Join the first wave of traders using our advanced pattern
              recognition system. Limited spots available during our beta phase.
            </p>
            {/* Interval Toggle */}
            <div
              className={`text-kodemono my-6 flex rounded-lg border border-white/10 bg-black/50 p-0.5 backdrop-blur-sm`}
            >
              {intervals.includes('month') && (
                <button
                  onClick={() => setBillingInterval('month')}
                  type="button"
                  className={`${
                    billingInterval === 'month'
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400'
                  } m-1 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 lg:px-8`}
                >
                  Monthly access
                </button>
              )}
              {intervals.includes('year') && (
                <button
                  onClick={() => setBillingInterval('year')}
                  type="button"
                  className={`${
                    billingInterval === 'year'
                      ? 'bg-white/10 text-white'
                      : 'text-gray-400'
                  } m-1 rounded-md px-4 py-2 text-sm font-medium transition-colors duration-200 lg:px-8`}
                >
                  Yearly access
                </button>
              )}
            </div>
          </div>

          {/* Pricing Cards */}
          <div className="flex w-full items-center justify-center">
            {products.map((product) => {
              const price = product?.prices?.find(
                (price) => price.interval === billingInterval
              );
              if (!price) return null;
              const priceString = new Intl.NumberFormat('en-US', {
                style: 'currency',
                currency: price.currency ?? 'USD',
                minimumFractionDigits: 0
              }).format((price.unit_amount ?? 0) / 100);

              return (
                <div
                  key={product.id}
                  className={cn(
                    'rounded-lg border backdrop-blur-sm transition-all duration-300',
                    {
                      'border-blue-500/50 bg-blue-500/5 hover:shadow-lg hover:shadow-blue-500/20':
                        subscription
                          ? product.name ===
                            subscription?.prices?.products?.name
                          : product.name === 'Beta Access',
                      'border-white/10 bg-white/5 hover:border-white/20 hover:shadow-lg hover:shadow-white/10':
                        !(subscription
                          ? product.name ===
                            subscription?.prices?.products?.name
                          : product.name === 'Beta Access')
                    }
                  )}
                >
                  <div className="p-6">
                    <h2
                      className={`text-kodemono text-2xl font-semibold text-white`}
                    >
                      Beta Access
                    </h2>
                    <div className="mt-4 space-y-4">
                      <p className="text-gray-300">
                        Full access to our pattern recognition system including:
                      </p>
                      <ul className="space-y-3">
                        {PRICING_FEATURES.map((feature, index) => (
                          <li
                            key={index}
                            className="group flex cursor-pointer items-center gap-3"
                          >
                            <div className="relative flex items-center gap-2">
                              <div
                                className={`absolute -inset-0.5 rounded-full bg-gradient-to-r from-[${feature.color}]/20 to-transparent opacity-0 blur transition-opacity duration-500 group-hover:opacity-100`}
                              />
                              <feature.icon className="relative h-4 w-4 text-white" />
                              <span className="text-gray-300 transition-colors duration-300 group-hover:text-white">
                                {feature.text}
                              </span>
                            </div>
                          </li>
                        ))}
                      </ul>
                    </div>
                    <p className="mt-8">
                      <span
                        className={`text-outfit text-5xl font-bold text-white`}
                      >
                        {priceString}
                      </span>
                      <span className="text-gray-300">/{billingInterval}</span>
                    </p>
                    <div className="group relative mt-8">
                      <div className="relative flex">
                        <Button
                          variant="slim"
                          type="button"
                          loading={priceIdLoading === price.id}
                          onClick={() => handleStripeCheckout(price)}
                          className={`text-kodemono w-full rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/20`}
                        >
                          {subscription ? 'Manage Access' : 'Get Early Access'}
                        </Button>
                      </div>
                      <div className="absolute -inset-0.5 rounded-lg bg-gradient-to-r from-blue-500/50 to-purple-500/50 opacity-0 blur transition-all duration-500 group-hover:opacity-100" />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </section>
  );
}
