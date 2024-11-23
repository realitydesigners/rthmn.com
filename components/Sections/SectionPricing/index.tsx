'use client';
import { getErrorRedirect } from '@/utils/helpers';
import { getStripe } from '@/utils/stripe/client';
import { checkoutWithStripe } from '@/utils/stripe/server';
import type { User } from '@supabase/supabase-js';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { MotionDiv } from '@/components/MotionDiv';

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
  const router = useRouter();
  const [priceIdLoading, setPriceIdLoading] = useState<string>();
  const [selectedPriceId, setSelectedPriceId] = useState<string>();
  const currentPath = usePathname();

  const product = products[0];
  const prices = product?.prices || [];

  const handleStripeCheckout = async (price: Price) => {
    setPriceIdLoading(price.id);

    if (!user) {
      setPriceIdLoading(undefined);
      return router.push('/signin');
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

  if (!product) return null;

  return (
    <section className="relative py-20">
      {/* Background gradients */}
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-white/[0.03] to-transparent" />
      <div className="absolute inset-0 -z-10">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-[#22c55e]/[0.03] via-transparent to-transparent blur-xl" />
      </div>

      <div className="mx-auto max-w-2xl px-4">
        <div className="mb-16 text-center">
          <h1 className="text-gray-gradient mb-4 font-outfit text-4xl font-bold tracking-tight sm:text-5xl lg:text-6xl">
            Box Seat
          </h1>
          <p className="text-dark-gray mt-4 text-lg">
            Discord Community Access with a fully integrated Rthmn Dashboard
            Experience and access to latest builds + new indicators.
          </p>
        </div>

        <MotionDiv
          className="w-full"
          whileHover={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/40 backdrop-blur-sm">
            <div className="flex flex-col gap-6 p-8">
              <div>
                <h2 className="text-gray-gradient text-xl font-semibold">
                  {product.name}
                </h2>
                <p className="mt-2 text-sm text-white/60">
                  {product.description}
                </p>
              </div>

              <div className="flex flex-col gap-4">
                {prices.map((price) => {
                  const priceString = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: price.currency ?? 'USD',
                    minimumFractionDigits: 0
                  }).format((price.unit_amount ?? 0) / 100);

                  const isSelected = selectedPriceId === price.id;

                  return (
                    <button
                      key={price.id}
                      onClick={() => setSelectedPriceId(price.id)}
                      className={`flex items-center justify-between rounded-md border p-4 transition-all ${
                        isSelected
                          ? 'border-[#22c55e] bg-[#22c55e]/10'
                          : 'border-white/10 bg-black/20 hover:border-white/20'
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`flex h-5 w-5 items-center justify-center rounded-full border ${
                            isSelected
                              ? 'border-[#22c55e] bg-[#22c55e]'
                              : 'border-white/20'
                          }`}
                        >
                          {isSelected && (
                            <div className="h-2 w-2 rounded-full bg-black" />
                          )}
                        </div>
                        <span className="text-white">{priceString}/month</span>
                      </div>
                      {price.unit_amount === 2999 && (
                        <span className="rounded-full bg-[#22c55e]/20 px-3 py-1 text-xs text-[#22c55e]">
                          Popular
                        </span>
                      )}
                    </button>
                  );
                })}
              </div>

              <button
                onClick={() => {
                  const selectedPrice = prices.find(
                    (p) => p.id === selectedPriceId
                  );
                  if (selectedPrice) handleStripeCheckout(selectedPrice);
                }}
                disabled={
                  !selectedPriceId || priceIdLoading === selectedPriceId
                }
                className="mt-4 w-full rounded-md bg-[#22c55e] px-4 py-3 text-sm font-medium text-black transition-all hover:bg-[#22c55e]/90 focus:outline-hidden focus:ring-2 focus:ring-[#22c55e] focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {priceIdLoading === selectedPriceId ? (
                  <span className="flex items-center justify-center gap-2">
                    <svg className="h-4 w-4 animate-spin" viewBox="0 0 24 24">
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Processing...
                  </span>
                ) : subscription ? (
                  'Manage Subscription'
                ) : (
                  'Subscribe'
                )}
              </button>
            </div>

            {/* Gradient overlay */}
            <div className="absolute inset-0 -z-10 bg-linear-to-br from-[#22c55e]/5 via-transparent to-[#22c55e]/5" />
          </div>
        </MotionDiv>
      </div>
    </section>
  );
}
