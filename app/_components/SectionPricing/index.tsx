'use client';
import Button from '@/components/Button';
import { getErrorRedirect } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import type { User } from '@supabase/supabase-js';
import { outfit, kodeMono } from '@/fonts';
import cn from 'classnames';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { FaServer, FaRocket, FaBolt, FaShieldAlt } from 'react-icons/fa';

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
          <p className={`${kodeMono.className} text-lg text-gray-300`}>
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
    <section className="bg-black px-4 lg:px-32">
      <div className="px-4 py-8 sm:px-6 sm:py-24 lg:px-8">
        <div className="flex flex-col gap-8">
          {/* Title Section */}
          <div className="flex flex-col gap-4">
            <h1
              className={`${outfit.className} text-5xl font-bold tracking-tight text-white lg:text-7xl`}
            >
              Pricing Plans
            </h1>
            <p
              className={`${kodeMono.className} max-w-2xl text-sm leading-relaxed text-gray-300 lg:text-lg`}
            >
              Start building for free, then add a site plan to go live. Account
              plans unlock additional features.
            </p>
          </div>

          {/* Interval Toggle */}
          <div
            className={`${kodeMono.className} relative flex self-start rounded-lg border border-white/10 bg-black/50 p-0.5 backdrop-blur-sm`}
          >
            {intervals.includes('month') && (
              <button
                onClick={() => setBillingInterval('month')}
                type="button"
                className={`${
                  billingInterval === 'month'
                    ? 'bg-white/10 text-white'
                    : 'text-gray-400'
                } m-1 rounded-md px-8 py-2 text-sm font-medium transition-colors duration-200`}
              >
                Monthly billing
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
                } m-1 rounded-md px-8 py-2 text-sm font-medium transition-colors duration-200`}
              >
                Yearly billing
              </button>
            )}
          </div>

          {/* Pricing Cards */}
          <div className="grid gap-6 lg:grid-cols-3">
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
                    'rounded-lg border backdrop-blur-sm transition-colors duration-300',
                    {
                      'border-blue-500/50 bg-blue-500/5': subscription
                        ? product.name === subscription?.prices?.products?.name
                        : product.name === 'Freelancer',
                      'border-white/10 bg-white/5 hover:border-white/20':
                        !(subscription
                          ? product.name ===
                            subscription?.prices?.products?.name
                          : product.name === 'Freelancer')
                    }
                  )}
                >
                  <div className="p-6">
                    <h2
                      className={`${kodeMono.className} text-2xl font-semibold text-white`}
                    >
                      {product.name}
                    </h2>
                    <p className="mt-4 text-gray-300">{product.description}</p>
                    <p className="mt-8">
                      <span
                        className={`${outfit.className} text-5xl font-bold text-white`}
                      >
                        {priceString}
                      </span>
                      <span className="text-gray-300">/{billingInterval}</span>
                    </p>
                    <Button
                      variant="slim"
                      type="button"
                      loading={priceIdLoading === price.id}
                      onClick={() => handleStripeCheckout(price)}
                      className={`${kodeMono.className} mt-8 w-full rounded-md bg-white/10 py-2 text-sm font-medium text-white transition-colors duration-200 hover:bg-white/20`}
                    >
                      {subscription ? 'Manage' : 'Subscribe'}
                    </Button>
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
